# backend/schemas.py
from pydantic import BaseModel
from typing import Optional

class UserCreate(BaseModel):
    username: str
    trueUpi: str
    fakeUpi: str
    publicKey: str

class UserResponse(BaseModel):
    username: str
    fake_upi: str

    class Config:
        from_attributes = True