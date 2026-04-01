from pydantic import BaseModel, EmailStr
from typing import Optional


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: str
    bank_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str