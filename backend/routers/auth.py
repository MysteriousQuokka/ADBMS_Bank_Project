from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.schemas.user_schema import RegisterRequest, LoginRequest
from backend.database import SessionLocal
from backend.models.user_model import User
from backend.models.bank_model1 import Bank1
from backend.services.audit_service import log_action
import bcrypt
router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------- REGISTER ----------------
@router.post("/register")
def register_user(data: RegisterRequest, db: Session = Depends(get_db)):

    role = data.role.upper()

    # ✅ Role validation
    if role not in ["CENTRAL_ADMIN", "BANK_ADMIN", "AUDITOR"]:
        # return {"error": "Invalid role"}
        raise HTTPException(status_code=400, detail="Invalid role")

    # ✅ Duplicate user check
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        # return {"error": "User already exists"}
        raise HTTPException(status_code=400, detail="User already exists")

    bank = None

    # ✅ BANK_ADMIN must create bank
    if role == "BANK_ADMIN":
        if not data.bank_name:
            # return {"error": "Bank name required for BANK_ADMIN"}
            raise HTTPException(status_code=400, detail="Bank name required for BANK_ADMIN")

        # Optional: prevent duplicate banks
        existing_bank = db.query(Bank1).filter(Bank1.bank_name == data.bank_name).first()
        if existing_bank:
            # return {"error": "Bank already exists"}
            raise HTTPException(status_code=400, detail="Bank already exists")

        bank = Bank1(bank_name=data.bank_name)
        db.add(bank)
        db.commit()
        db.refresh(bank)
    password_bytes = data.password.encode('utf-8')
    hashed = bcrypt.hashpw(password_bytes, bcrypt.gensalt(rounds=10))
    # ✅ Create user
    user = User(
        email=data.email,
        password_hash=hashed,  # (later: hash this)
        role=role,
        bank_id=bank.bank_id if bank else None
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # ✅ Audit log
    log_action(
        actor_id=user.user_id,
        action="USER_REGISTERED",
        entity_type="USER",
        entity_id=user.user_id,
        details=f"Role: {role}, Bank: {bank.bank_name if bank else 'N/A'}"
    )

    return {
        "message": "User registered successfully",
        "user_id": str(user.user_id),
        "role": role
    }


# ---------------- LOGIN ----------------
@router.post("/login")
def login_user(data: LoginRequest, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        return {"error": "User not found"}
    entered_bytes = data.password.encode('utf-8')
    if not bcrypt.checkpw(entered_bytes, user.password_hash):
        return {"error": "Invalid password"}
    bank = db.query(Bank1).filter(Bank1.bank_id == user.bank_id).first()


    return {
        "message": "Login successful",
        "user_id": str(user.user_id),
        "role": user.role,
        "bank_id": str(user.bank_id) if user.bank_id else None,
        "bank_name": bank.bank_name if bank else None
    }