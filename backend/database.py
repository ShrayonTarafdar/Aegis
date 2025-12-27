from sqlalchemy import create_engine, Column, Integer, String, Float, LargeBinary
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Create the data directory if it doesn't exist
os.makedirs("data", exist_ok=True)

# Database file path
SQLALCHEMY_DATABASE_URL = "sqlite:///./data/aegis.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    true_upi = Column(String)
    fake_upi = Column(String)
    
    # Biometric Fields (NEW)
    credential_id = Column(LargeBinary) 
    public_key = Column(LargeBinary)    
    # default=0 is critical for WebAuthn logic
    sign_count = Column(Integer, default=0) 

class Account(Base):
    __tablename__ = "accounts"
    fake_upi = Column(String, primary_key=True)
    honeypot_balance = Column(Float, default=100.0) 
    true_balance = Column(Float, default=5000.0)    

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    from_fake_id = Column(String)
    to_fake_id = Column(String)
    amount = Column(Float)
    timestamp = Column(String)
    stego_image = Column(LargeBinary) 

# This line tells SQLAlchemy to create the tables if the file is missing
Base.metadata.create_all(bind=engine)