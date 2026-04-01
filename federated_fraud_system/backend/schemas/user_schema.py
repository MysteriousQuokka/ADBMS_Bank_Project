from pydantic import BaseModel

class RegisterRequest(BaseModel):
    email: str
    password: str
    bank_name: str


class LoginRequest(BaseModel):
    email: str
    password: str