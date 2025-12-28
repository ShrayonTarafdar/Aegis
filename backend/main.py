# from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Response
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi.staticfiles import StaticFiles
# from fastapi.responses import FileResponse
# from sqlalchemy.orm import Session
# from PIL import Image
# import time
# import base64
# import uuid
# import os
# import io
# import json
# import random
# import os # Ensure os is imported at the top

# # Your custom modules
# import database, schemas
# from fastapi.staticfiles import StaticFiles
# from fastapi.responses import FileResponse

# # ... your API routes ...


# # WebAuthn Imports
# from webauthn import (
#     generate_registration_options,
#     verify_registration_response,
#     generate_authentication_options,
#     verify_authentication_response,
#     options_to_json,
# )
# from webauthn.helpers.structs import (
#     AuthenticatorSelectionCriteria, 
#     AuthenticatorAttachment, 
#     UserVerificationRequirement,
#     PublicKeyCredentialDescriptor 
# )

# app = FastAPI()
# app.mount("/static", StaticFiles(directory="build/static"), name="static")

# @app.get("/{full_path:path}")
# async def serve_frontend(full_path: str):
#     return FileResponse("build/index.html")
# # --- CONFIGURATION ---
# RP_ID = "localhost" 
# RP_NAME = "Aegis Secure Bank"
# ORIGIN = "http://localhost:3000"

# # Temporary storage for challenges (Challenge expires when server restarts)
# # In production, use Redis or a Database table with a timestamp
# CHALLENGE_STORAGE = {}

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=[ORIGIN],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# def get_db():
#     db = database.SessionLocal()
#     try:
#         yield db
#     finally:
#         db.close()

# # --- 1. STEGANOGRAPHY ENGINE ---

# def encode_message(image_bytes, message):
#     img = Image.open(io.BytesIO(image_bytes))
#     if img.mode != 'RGB':
#         img = img.convert('RGB')
    
#     encoded = img.copy()
#     width, height = img.size
#     message += "####" # Delimiter
#     binary_msg = ''.join(format(ord(i), '08b') for i in message)
    
#     data_index = 0
#     pixels = encoded.load()
    
#     for y in range(height):
#         for x in range(width):
#             r, g, b = pixels[x, y]
#             if data_index < len(binary_msg):
#                 r = (r & ~1) | int(binary_msg[data_index])
#                 data_index += 1
#                 pixels[x, y] = (r, g, b)
#             if data_index >= len(binary_msg): break
#         if data_index >= len(binary_msg): break
            
#     img_byte_arr = io.BytesIO()
#     encoded.save(img_byte_arr, format='PNG')
#     return img_byte_arr.getvalue()

# def decode_message(image_bytes):
#     img = Image.open(io.BytesIO(image_bytes))
#     pixels = img.load()
#     binary_msg = ""
#     for y in range(img.height):
#         for x in range(img.width):
#             r, g, b = pixels[x, y]
#             binary_msg += str(r & 1)
    
#     chars = [binary_msg[i:i+8] for i in range(0, len(binary_msg), 8)]
#     message = ""
#     for char in chars:
#         try:
#             val = chr(int(char, 2))
#             message += val
#             if "####" in message: return message.replace("####", "")
#         except: break
#     return message

# # --- 2. BIOMETRIC REGISTRATION ---

# @app.post("/webauthn/register/options")
# def get_reg_options(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
#     # Check if user already exists
#     existing = db.query(database.User).filter(database.User.username == user_data.username).first()
#     if existing:
#         raise HTTPException(status_code=400, detail="Username already exists")

   
#     # options = generate_registration_options(
#     #     rp_id=RP_ID,
#     #     rp_name=RP_NAME,
#     #     # FIX: Changed str() to .bytes
#     #     user_id=uuid.uuid4().bytes, 
#     #     user_name=user_data.username,
#     #     authenticator_selection=AuthenticatorSelectionCriteria(
#     #         authenticator_attachment=AuthenticatorAttachment.PLATFORM,
#     #         user_verification=UserVerificationRequirement.REQUIRED
#     #     ),
#     # )
#     # Inside @app.post("/webauthn/register/options")
#     options = generate_registration_options(
#     rp_id=RP_ID,
#     rp_name=RP_NAME,
#     user_id=uuid.uuid4().bytes,
#     user_name=user_data.username,
#     authenticator_selection=AuthenticatorSelectionCriteria(
#         # This is the "magic" line that enables both Face and Fingerprint
#         authenticator_attachment=AuthenticatorAttachment.PLATFORM, 
#         user_verification=UserVerificationRequirement.REQUIRED
#     ),
# )
#     # We store the user data AND the challenge. 
#     # The user isn't saved to the DB until they pass the biometric check in the next step.
#     CHALLENGE_STORAGE[user_data.username] = {
#         "challenge": options.challenge,
#         "user_data": user_data 
#     }
    
#     # Use Response to return the raw JSON string from webauthn library correctly
#     return Response(content=options_to_json(options), media_type="application/json")
# import uuid # Ensure this is imported at the top

# @app.post("/webauthn/register/verify")
# async def verify_reg(username: str, credential: dict, db: Session = Depends(get_db)):
#     stored = CHALLENGE_STORAGE.pop(username, None)
    
#     if not stored:
#         raise HTTPException(status_code=400, detail="Registration session expired. Try again.")
    
#     try:
#         verification = verify_registration_response(
#             credential=credential,
#             expected_challenge=stored["challenge"],
#             expected_origin=ORIGIN,
#             expected_rp_id=RP_ID,
#         )
        
#         reg_info = stored["user_data"] 

#         # --- NEW LOGIC: Generate a randomized, blinded Fake UPI ---
#         # This makes the public ID look like: AEGIS-7A2B-91C4
#         randomized_node_id = f"AEGIS-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}"

#         # Create the User with the NEW randomized ID
#         new_user = database.User(
#             username=reg_info.username,
#             true_upi=reg_info.trueUpi,     # Hidden: niyati@realbank
#             fake_upi=randomized_node_id,  # Public: AEGIS-7A2B-91C4
#             credential_id=verification.credential_id,
#             public_key=verification.credential_public_key,
#             sign_count=verification.sign_count
#         )
        
#         # Create the Bank Account using the SAME randomized ID
#         new_account = database.Account(
#             fake_upi=randomized_node_id,
#             honeypot_balance=100.0,
#             true_balance=5000.0
#         )
        
#         db.add(new_user)
#         db.add(new_account)
#         db.commit()
        
#         return {
#             "status": "success", 
#             "message": "Biometric registration complete",
#             "blinded_id": randomized_node_id # Optional: return to frontend
#         }
        
#     except Exception as e:
#         print(f"DEBUG - WebAuthn Error: {e}") 
#         raise HTTPException(status_code=400, detail=str(e))
# # @app.post("/webauthn/register/verify")
# # async def verify_reg(username: str, credential: dict, db: Session = Depends(get_db)):
# #     stored = CHALLENGE_STORAGE.pop(username, None)

# #     if not stored:
# #         raise HTTPException(status_code=400, detail="Registration session expired. Try again.")
    
# #     try:
# #         verification = verify_registration_response(
# #             credential=credential,
# #             expected_challenge=stored["challenge"],
# #             expected_origin=ORIGIN,
# #             expected_rp_id=RP_ID,
# #         )
        
# #         reg_info = stored["user_data"] 
# #         # Biometric verified! Now create the User and Bank Account
# #         new_user = database.User(
# #             username=reg_info.username,
# #             true_upi=reg_info.trueUpi,
# #             fake_upi=reg_info.fakeUpi,
# #     # Use the full names from the v2.x library:
# #             credential_id=verification.credential_id,
# #             public_key=verification.credential_public_key, # Changed here
# #             sign_count=verification.sign_count
# #         )
        
# #         new_account = database.Account(
# #             fake_upi=reg_info.fakeUpi,
# #             honeypot_balance=100.0,
# #             true_balance=5000.0
# #         )
        
# #         db.add(new_user)
# #         db.add(new_account)
# #         db.commit()
# #         return {"status": "success", "message": "Biometric registration complete"}
        
# #     except Exception as e:
# #         print(f"DEBUG - WebAuthn Error: {e}") 
# #         raise HTTPException(status_code=400, detail=str(e))
# #         # raise HTTPException(status_code=400, detail=f"Biometric failed: {str(e)}")

# # --- 3. BIOMETRIC LOGIN ---
# @app.get("/webauthn/login/options")
# def get_log_options(username: str, db: Session = Depends(get_db)):
#     username = username.lower().strip() # Normalize to lowercase
#     user = db.query(database.User).filter(database.User.username == username).first()
    
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")

#     options = generate_authentication_options(
#         rp_id=RP_ID,
#         allow_credentials=[PublicKeyCredentialDescriptor(id=user.credential_id)],
#         # This triggers FaceID/TouchID/Windows Hello
#         user_verification=UserVerificationRequirement.REQUIRED, 
#     )
    
#     # Save with lowercase key
#     CHALLENGE_STORAGE[username] = options.challenge
#     return Response(content=options_to_json(options), media_type="application/json")

# # @app.get("/webauthn/login/options")
# # def get_log_options(username: str, db: Session = Depends(get_db)):
# #     user = db.query(database.User).filter(database.User.username == username).first()
# #     if not user:
# #         raise HTTPException(status_code=404, detail="User not found")

# #     # FIX: Wrap the credential in PublicKeyCredentialDescriptor
# #     options = generate_authentication_options(
# #         rp_id=RP_ID,
# #         allow_credentials=[
# #             PublicKeyCredentialDescriptor(id=user.credential_id)
# #         ],
# #         user_verification=UserVerificationRequirement.REQUIRED,
# #     )
    
# #     return Response(content=options_to_json(options), media_type="application/json")
# # @app.get("/webauthn/login/options")
# # def get_log_options(username: str, db: Session = Depends(get_db)):
# #     user = db.query(database.User).filter(database.User.username == username).first()
# #     if not user:
# #         raise HTTPException(status_code=404, detail="User not found")

# #     options = generate_authentication_options(
# #         rp_id=RP_ID,
# #         allow_credentials=[{"id": user.credential_id, "type": "public-key"}],
# #         user_verification=UserVerificationRequirement.REQUIRED,
# #     )
    
# #     CHALLENGE_STORAGE[username] = options.challenge
# #     return Response(content=options_to_json(options), media_type="application/json")

# @app.post("/webauthn/login/verify")
# async def verify_log(username: str, credential: dict, db: Session = Depends(get_db)):
#     username = username.lower() # Normalize to lowercase
    
#     user = db.query(database.User).filter(database.User.username == username).first()
#     # Pull the challenge using the lowercase key
#     challenge = CHALLENGE_STORAGE.pop(username, None)
    
#     if not challenge or not user:
#         print(f"DEBUG: Challenge missing for {username}. Current keys: {list(CHALLENGE_STORAGE.keys())}")
#         raise HTTPException(status_code=400, detail="Invalid session or user. Try clicking login again.")

#     try:
#         verification = verify_authentication_response(
#             credential=credential,
#             expected_challenge=challenge,
#             expected_origin=ORIGIN,
#             expected_rp_id=RP_ID,
#             credential_public_key=user.public_key,
#             credential_current_sign_count=user.sign_count,
#         )
        
#         user.sign_count = verification.new_sign_count
#         db.commit()
#         return {"status": "success", "username": user.username, "fake_upi": user.fake_upi}
#     except Exception as e:
#         raise HTTPException(status_code=401, detail=str(e))
# # --- 4. SECURE TRANSACTIONS (Steganography) ---

# @app.post("/transaction")
# async def create_transaction(
#     amount: float = Form(...),
#     to_fake_id: str = Form(...),
#     from_fake_id: str = Form(...),
#     true_upi: str = Form(...),
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db)
# ):
#     image_bytes = await file.read()
    
#     # Hide the True UPI inside the photo bytes
#     stego_image_data = encode_message(image_bytes, true_upi)

#     new_tx = database.Transaction(
#         from_fake_id=from_fake_id,
#         to_fake_id=to_fake_id,
#         amount=amount,
#         timestamp=time.ctime(),
#         stego_image=stego_image_data
#     )
    
#     sender_acc = db.query(database.Account).filter(database.Account.fake_upi == from_fake_id).first()
#     if sender_acc:
#         sender_acc.true_balance -= amount
#         sender_acc.honeypot_balance -= amount # Confusion factor
    
#     db.add(new_tx)
#     db.commit()
#     return {"status": "Payment Blinded Successfully", "tx_id": new_tx.id}

# @app.get("/hacker/accounts")
# def get_hacker_accounts(db: Session = Depends(get_db)):
#     # This returns the Account objects which only contain 
#     # fake_upi and honeypot_balance (Hacker View)
#     accounts = db.query(database.Account).all()
#     return accounts
# # @app.get("/hacker/transactions")
# # def get_hacker_transactions(db: Session = Depends(get_db)):
# #     txs = db.query(database.Transaction).all()
# #     # We return keys that look like a leaked bank database
# #     return [
# #         {
# #             "tx_id": f"TXN-{tx.id:04d}",
# #             "sender_account": tx.from_fake_id, # AEGIS-XXXX-XXXX
# #             "receiver_account": tx.to_fake_id, # AEGIS-XXXX-XXXX
# #             "amount": round(tx.amount * 0.1, 2), # Deceptive Honeypot Amount
# #             "timestamp": tx.timestamp,
# #             "receipt_payload": base64.b64encode(tx.stego_image).decode('utf-8')
# #         } for tx in txs
# #     ]
# from fastapi import UploadFile, File, Form, Depends, HTTPException
# import database # your database file

# @app.post("/hacker/transaction")
# async def create_hacker_transaction(
#     amount: float = Form(...),
#     to_id: str = Form(...),
#     from_id: str = Form(...),
#     file: UploadFile = File(...),
#     db: Session = Depends(get_db)
# ):
#     # 1. Read the image bytes
#     image_bytes = await file.read()

#     # 2. Check if sender exists
#     sender = db.query(database.Account).filter(database.Account.fake_upi == from_id).first()
#     if not sender:
#         raise HTTPException(status_code=404, detail="Sender account not found")

#     # 3. Create the transaction record 
#     # (Matching the keys found in your GET request snippet)
#     new_tx = database.Transaction(
#         from_fake_id=from_id,
#         to_fake_id=to_id,
#         amount=amount * 10, # If your GET returns amount * 0.1, we store it x10 here
#         stego_image=image_bytes,
#         timestamp="2023-10-27 10:00:00" # Or use datetime.now()
#     )

#     # 4. Update balance
#     sender.honeypot_balance -= amount

#     db.add(new_tx)
#     db.commit()
#     return {"status": "success"}
# # @app.get("/hacker/transactions")
# # def get_hacker_transactions(db: Session = Depends(get_db)):
# #     txs = db.query(database.Transaction).all()
# #     # We return keys like 'amount' and 'receiver' so it looks like a real ledger
# #     return [
# #         {
# #             "id": tx.id,
# #             "sender": tx.from_fake_id,
# #             "receiver": tx.to_fake_id,
# #             "amount": tx.amount, # Deceptive 10% value
# #             "date": tx.timestamp,
# #             "receipt_image": base64.b64encode(tx.stego_image).decode('utf-8')
# #         } for tx in txs
# #     ]

# # @app.post("/hacker/transaction")
# # async def create_hacker_transaction(
# #     amount: float = Form(...),
# #     to_id: str = Form(...),
# #     from_id: str = Form(...),
# #     file: UploadFile = File(...),
# #     db: Session = Depends(get_db)
# # ):
# #     # 1. Illusion: Perform steganography even on the hacker's fake payment
# #     image_bytes = await file.read()
# #     stego_data = encode_message(image_bytes, f"DECEPTIVE_TX_{uuid.uuid4().hex[:6]}")

# #     # 2. Update ONLY the Honeypot Balance
# #     sender_acc = db.query(database.Account).filter(database.Account.fake_upi == from_id).first()
    
# #     if not sender_acc:
# #         raise HTTPException(status_code=404, detail="Account route not found")
    
# #     if sender_acc.honeypot_balance < amount:
# #         raise HTTPException(status_code=400, detail="Transaction limit exceeded for this node")

# #     # Deduct from the fake balance
# #     sender_acc.honeypot_balance -= amount

# #     # 3. Log it in the ledger so it appears in the deceptive history
# #     new_tx = database.Transaction(
# #         from_fake_id=from_id,
# #         to_fake_id=to_id,
# #         amount=amount, # In the hacker's world, they see the full amount
# #         timestamp=time.ctime(),
# #         stego_image=stego_data
# #     )
    
# #     db.add(new_tx)
# #     db.commit()
    
# #     return {"status": "Success", "message": "Funds transferred to remote node"}
# # --- 5. ADMIN & UI UTILITIES ---

# @app.get("/balance/{fake_upi}")
# def get_balance(fake_upi: str, db: Session = Depends(get_db)):
#     account = db.query(database.Account).filter(database.Account.fake_upi == fake_upi).first()
#     if not account: raise HTTPException(status_code=404)
#     return {"fake_balance": account.honeypot_balance, "true_balance": account.true_balance}

# @app.get("/admin/transactions")
# def get_all_transactions(db: Session = Depends(get_db)):
#     txs = db.query(database.Transaction).all()
#     return [{
#         "id": tx.id, "amount": tx.amount, "timestamp": tx.timestamp,
#         "image_b64": base64.b64encode(tx.stego_image).decode('utf-8')
#     } for tx in txs]

# @app.get("/admin/decode/{tx_id}")
# def decode_tx(tx_id: int, db: Session = Depends(get_db)):
#     tx = db.query(database.Transaction).filter(database.Transaction.id == tx_id).first()
#     if not tx: raise HTTPException(status_code=404)
#     return {"true_identity": decode_message(tx.stego_image)}

# # Static File Serving
# frontend_static_dir = os.path.join(os.getcwd(), "frontend", "build") 
# if os.path.exists(frontend_static_dir):
#     app.mount("/static", StaticFiles(directory=os.path.join(frontend_static_dir, "static")), name="static")
#     @app.get("/{rest_of_path:path}")
#     async def serve_frontend(rest_of_path: str):
#         return FileResponse(os.path.join(frontend_static_dir, "index.html"))

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from PIL import Image
import time
import base64
import uuid
import os
import io

# Your custom modules
import database, schemas

# --- WEBAUTHN IMPORTS (Fixed for py-webauthn v2.0+) ---
from webauthn import (
    generate_registration_options,
    verify_registration_response,
    generate_authentication_options,
    verify_authentication_response,
    options_to_json,
)
from webauthn.helpers.structs import (
    AuthenticatorSelectionCriteria, 
    AuthenticatorAttachment, 
    UserVerificationRequirement,
    PublicKeyCredentialDescriptor 
)

app = FastAPI()

# --- DYNAMIC CONFIGURATION FOR DEPLOYMENT ---
# Render provides the URL in RENDER_EXTERNAL_HOSTNAME (e.g., myapp.onrender.com)
RENDER_HOST = os.getenv("RENDER_EXTERNAL_HOSTNAME")

if RENDER_HOST:
    RP_ID = RENDER_HOST
    ORIGIN = f"https://{RENDER_HOST}"
else:
    RP_ID = "localhost"
    ORIGIN = "http://localhost:3000"

RP_NAME = "Aegis Secure Bank"

# Temporary challenge storage
CHALLENGE_STORAGE = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[ORIGIN, "http://localhost:3000"],
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

# --- 1. STEGANOGRAPHY ENGINE ---
def encode_message(image_bytes, message):
    img = Image.open(io.BytesIO(image_bytes))
    if img.mode != 'RGB':
        img = img.convert('RGB')
    encoded = img.copy()
    width, height = img.size
    message += "####" 
    binary_msg = ''.join(format(ord(i), '08b') for i in message)
    data_index = 0
    pixels = encoded.load()
    for y in range(height):
        for x in range(width):
            if data_index < len(binary_msg):
                r, g, b = pixels[x, y]
                r = (r & ~1) | int(binary_msg[data_index])
                data_index += 1
                pixels[x, y] = (r, g, b)
            else: break
    img_byte_arr = io.BytesIO()
    encoded.save(img_byte_arr, format='PNG')
    return img_byte_arr.getvalue()

def decode_message(image_bytes):
    img = Image.open(io.BytesIO(image_bytes))
    pixels = img.load()
    binary_msg = ""
    for y in range(img.height):
        for x in range(img.width):
            r, g, b = pixels[x, y]
            binary_msg += str(r & 1)
    chars = [binary_msg[i:i+8] for i in range(0, len(binary_msg), 8)]
    message = ""
    for char in chars:
        try:
            val = chr(int(char, 2))
            message += val
            if "####" in message: return message.replace("####", "")
        except: break
    return message

# --- 2. BIOMETRIC ROUTES ---

@app.post("/webauthn/register/options")
def get_reg_options(user_data: schemas.UserCreate, db: Session = Depends(get_db)):
    username = user_data.username.lower()
    existing = db.query(database.User).filter(database.User.username == username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    options = generate_registration_options(
        rp_id=RP_ID,
        rp_name=RP_NAME,
        user_id=uuid.uuid4().bytes,
        user_name=username,
        authenticator_selection=AuthenticatorSelectionCriteria(
            authenticator_attachment=AuthenticatorAttachment.PLATFORM, 
            user_verification=UserVerificationRequirement.REQUIRED
        ),
    )
    CHALLENGE_STORAGE[username] = {
        "challenge": options.challenge,
        "user_data": user_data 
    }
    return Response(content=options_to_json(options), media_type="application/json")

@app.post("/webauthn/register/verify")
async def verify_reg(username: str, credential: dict, db: Session = Depends(get_db)):
    username = username.lower()
    stored = CHALLENGE_STORAGE.pop(username, None)
    if not stored:
        raise HTTPException(status_code=400, detail="Registration session expired.")
    
    try:
        verification = verify_registration_response(
            credential=credential,
            expected_challenge=stored["challenge"],
            expected_origin=ORIGIN,
            expected_rp_id=RP_ID,
        )
        
        randomized_node_id = f"AEGIS-{uuid.uuid4().hex[:4].upper()}-{uuid.uuid4().hex[:4].upper()}"
        new_user = database.User(
            username=username,
            true_upi=stored["user_data"].trueUpi,
            fake_upi=randomized_node_id,
            credential_id=verification.credential_id,
            public_key=verification.credential_public_key,
            sign_count=verification.sign_count
        )
        new_account = database.Account(fake_upi=randomized_node_id, honeypot_balance=100.0, true_balance=5000.0)
        db.add(new_user)
        db.add(new_account)
        db.commit()
        return {"status": "success", "blinded_id": randomized_node_id}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/webauthn/login/options")
def get_log_options(username: str, db: Session = Depends(get_db)):
    username = username.lower()
    user = db.query(database.User).filter(database.User.username == username).first()
    if not user: 
        raise HTTPException(status_code=404, detail="User not found")

    options = generate_authentication_options(
        rp_id=RP_ID,
        allow_credentials=[PublicKeyCredentialDescriptor(id=user.credential_id)],
        user_verification=UserVerificationRequirement.REQUIRED, 
    )
    CHALLENGE_STORAGE[username] = options.challenge
    return Response(content=options_to_json(options), media_type="application/json")

@app.post("/webauthn/login/verify")
async def verify_log(username: str, credential: dict, db: Session = Depends(get_db)):
    username = username.lower()
    user = db.query(database.User).filter(database.User.username == username).first()
    challenge = CHALLENGE_STORAGE.pop(username, None)
    
    if not challenge or not user: 
        raise HTTPException(status_code=400, detail="Invalid session or user")

    try:
        verification = verify_authentication_response(
            credential=credential,
            expected_challenge=challenge,
            expected_origin=ORIGIN,
            expected_rp_id=RP_ID,
            credential_public_key=user.public_key,
            credential_current_sign_count=user.sign_count,
        )
        user.sign_count = verification.new_sign_count
        db.commit()
        return {"status": "success", "username": user.username, "fake_upi": user.fake_upi}
    except Exception as e:
        raise HTTPException(status_code=401, detail=str(e))

# --- 3. TRANSACTION ROUTES ---

@app.post("/hacker/transaction")
async def create_hacker_transaction(
    amount: float = Form(...), to_id: str = Form(...), from_id: str = Form(...),
    file: UploadFile = File(...), db: Session = Depends(get_db)
):
    image_bytes = await file.read()
    sender = db.query(database.Account).filter(database.Account.fake_upi == from_id).first()
    if not sender: 
        raise HTTPException(status_code=404, detail="Account not found")

    new_tx = database.Transaction(
        from_fake_id=from_id, 
        to_fake_id=to_id, 
        amount=amount * 10,
        stego_image=image_bytes, 
        timestamp=time.ctime()
    )
    sender.honeypot_balance -= amount
    db.add(new_tx)
    db.commit()
    return {"status": "success"}
@app.post("/transaction")
async def create_transaction(
    amount: float = Form(...),
    to_fake_id: str = Form(...),
    from_fake_id: str = Form(...),
    true_upi: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    image_bytes = await file.read()
    
    # Hide the True UPI inside the photo bytes
    stego_image_data = encode_message(image_bytes, true_upi)

    new_tx = database.Transaction(
        from_fake_id=from_fake_id,
        to_fake_id=to_fake_id,
        amount=amount,
        timestamp=time.ctime(),
        stego_image=stego_image_data
    )
    
    sender_acc = db.query(database.Account).filter(database.Account.fake_upi == from_fake_id).first()
    if sender_acc:
        sender_acc.true_balance -= amount
        sender_acc.honeypot_balance -= amount # Confusion factor
    
    db.add(new_tx)
    db.commit()
    return {"status": "Payment Blinded Successfully", "tx_id": new_tx.id}

@app.get("/hacker/accounts")
def get_hacker_accounts(db: Session = Depends(get_db)):
    return db.query(database.Account).all()

@app.get("/hacker/transactions")
def get_hacker_transactions(db: Session = Depends(get_db)):
    txs = db.query(database.Transaction).all()
    return [
        {
            "id": tx.id,
            "receiver_account": tx.to_fake_id,
            "amount": tx.amount,
            "timestamp": tx.timestamp,
            "receipt_payload": base64.b64encode(tx.stego_image).decode('utf-8')
        } for tx in txs
    ]

# --- 4. FRONTEND SERVING (Must be at the end) ---

# Check if build folder exists (Common in Docker combined builds)
if os.path.exists("build"):
    app.mount("/static", StaticFiles(directory="build/static"), name="static")
    
    @app.get("/{rest_of_path:path}")
    async def serve_frontend(rest_of_path: str):
        # Allow access to FastAPI documentation
        if rest_of_path in ["docs", "redoc", "openapi.json"]:
            return None 
        # Prevent API routes from returning index.html
        if rest_of_path.startswith(("webauthn", "hacker", "transaction")):
            raise HTTPException(status_code=404)
        return FileResponse("build/index.html")