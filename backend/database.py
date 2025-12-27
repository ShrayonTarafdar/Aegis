from sqlalchemy import create_engine, Column, Integer, String, Float, LargeBinary
# Use sqlite for simplicity as requested
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///./data/aegis.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    public_key = Column(String) # WebAuthn Public Key
    true_upi = Column(String)   # Stored for demo, but "blinded" in logic
    fake_upi = Column(String, unique=True)

class Account(Base):
    __tablename__ = "accounts"
    fake_upi = Column(String, primary_key=True)
    honeypot_balance = Column(Float, default=100.0) # What the hacker sees
    true_balance = Column(Float, default=5000.0)    # Real value

class Transaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    from_fake_id = Column(String)
    to_fake_id = Column(String)
    amount = Column(Float)
    timestamp = Column(String)
    stego_image = Column(LargeBinary) # The image containing the hidden True ID

Base.metadata.create_all(bind=engine)