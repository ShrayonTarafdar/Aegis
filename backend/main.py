from fastapi import FastAPI, Depends, HTTPException, Response,UploadFile, File, Form
import time
import base64
from backend.stego_engine import encode_message,decode_message
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from backend.ai_service import verify_liveness
import uuid
from backend import database, schemas

app = FastAPI()

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For production, replace with your actual Frontend Render URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/register")
def register(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    # Create User
    new_user = database.User(
        username=user_data.username,
        true_upi=user_data.trueUpi,
        fake_upi=user_data.fakeUpi,
        public_key=user_data.publicKey
    )
    # Create Bank Account (Honeypot vs Real)
    new_account = database.Account(
        fake_upi=user_data.fakeUpi,
        honeypot_balance=100.0,
        true_balance=5000.0
    )
    db.add(new_user)
    db.add(new_account)
    db.commit()
    return {"status": "success"}

@app.get("/challenge/{username}")
def get_challenge(username: str, db: Session = Depends(get_db)):
    user = db.query(database.User).filter(database.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # In real WebAuthn, this is a random bytes string
    return {"challenge": "SIGN_THIS_RANDOM_STRING_12345", "publicKey": user.public_key}


@app.post("/login")
def login(username: str, signature: str, db: Session = Depends(get_db)):
    user = db.query(database.User).filter(database.User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # In a real WebAuthn flow, we'd verify the signature with the public key.
    # For this portal, we'll simulate the match:
    if signature.startswith("SIGNED_"):
        # Create a session (simple cookie for demo)
        response = {"status": "success", "username": user.username, "fake_upi": user.fake_upi}
        return response
    
    raise HTTPException(status_code=401, detail="Biometric verification failed")

@app.get("/balance/{fake_upi}")
def get_balance(fake_upi: str, db: Session = Depends(get_db)):
    account = db.query(database.Account).filter(database.Account.fake_upi == fake_upi).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    # Return both for the UI to demonstrate the "Blind" concept
    return {
        "fake_balance": account.honeypot_balance,
        "true_balance": account.true_balance
    }

@app.post("/transaction")
async def create_transaction(
    amount: float = Form(...),
    to_fake_id: str = Form(...),
    from_fake_id: str = Form(...),
    true_upi: str = Form(...),
    required_object: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # 1. Read the uploaded image
    image_bytes = await file.read()

    # 1. AI VERIFICATION (Gemini)
    is_valid = verify_liveness(image_bytes, required_object)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Liveness failed: {required_object} not detected.")
    
    # 2. Hide the True UPI inside the image using our stego engine
    # The bank knows the key/method, but a hacker just sees a random photo
    stego_image_data = encode_message(image_bytes, true_upi)

    # 3. Create the transaction record
    new_tx = database.Transaction(
        from_fake_id=from_fake_id,
        to_fake_id=to_fake_id,
        amount=amount,
        timestamp=time.ctime(),
        stego_image=stego_image_data
    )
    
    # 4. Update Balances (Logic: Deduct from sender's true and fake accounts)
    sender_acc = db.query(database.Account).filter(database.Account.fake_upi == from_fake_id).first()
    if sender_acc:
        sender_acc.true_balance -= amount
        sender_acc.honeypot_balance -= (amount * 0.1) # Honeypot only shows 10% movement to confuse hackers
    
    db.add(new_tx)
    db.commit()
    
    return {"status": "Payment Securely Blinded", "tx_id": new_tx.id}

@app.get("/admin/transactions")
def get_all_transactions(db: Session = Depends(get_db)):
    txs = db.query(database.Transaction).all()
    # Convert binary image to base64 so React can display it
    results = []
    for tx in txs:
        results.append({
            "id": tx.id,
            "from_fake_id": tx.from_fake_id,
            "to_fake_id": tx.to_fake_id,
            "amount": tx.amount,
            "timestamp": tx.timestamp,
            "image_b64": base64.b64encode(tx.stego_image).decode('utf-8')
        })
    return results

@app.get("/admin/decode/{tx_id}")
def decode_tx_identity(tx_id: int, db: Session = Depends(get_db)):
    tx = db.query(database.Transaction).filter(database.Transaction.id == tx_id).first()
    if not tx:
        raise HTTPException(status_code=404)
    
    # Use stego engine to reveal hidden True UPI
    true_id = decode_message(tx.stego_image)
    return {"true_identity": true_id}

@app.get("/hacker/accounts")
def get_hacker_view(db: Session = Depends(get_db)):
    # The hacker only sees the honeypot data
    accounts = db.query(database.Account).all()
    return accounts