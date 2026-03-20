from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from schemas.user_schema import RegisterRequest
from schemas.user_schema import LoginRequest
from database import SessionLocal
from models.user_model import User
from models.bank_model import Bank
from sqlalchemy import Column, String, TIMESTAMP, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from services.audit_service import log_action
from database import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    log_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    actor_id = Column(UUID(as_uuid=True), ForeignKey("users.user_id"))

    action = Column(String)
    entity_type = Column(String)
    entity_id = Column(UUID(as_uuid=True))

    details = Column(Text)

    created_at = Column(TIMESTAMP, server_default=func.now())
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
    log_action(
    actor_id=user.user_id,
    action="USER_REGISTERED",
    entity_type="USER",
    entity_id=user.user_id,
    details=f"Bank created: {bank.bank_name}"
    )
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