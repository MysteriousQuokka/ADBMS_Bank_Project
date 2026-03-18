from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.user_schema import RegisterRequest
from schemas.user_schema import LoginRequest
from database import SessionLocal
from models.user_model import User
from models.bank_model import Bank

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):

    bank = Bank(bank_name=data.bank_name)

    db.add(bank)
    db.commit()
    db.refresh(bank)

    user = User(
        email=data.email,
        password_hash=data.password,
        role="BANK_ADMIN",
        bank_id=bank.bank_id
    )

    db.add(user)
    db.commit()

    return {"message": "User registered"}

@router.post("/login")
def login_user(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        return {"error": "User not found"}

    if user.password_hash != data.password:
        return {"error": "Invalid password"}

    return {
        "message": "Login successful",
        "bank_id": str(user.bank_id)
    }