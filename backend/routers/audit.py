from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models.audit_log_model import AuditLog

router = APIRouter(prefix="/audit", tags=["Audit"])
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/logs")
def get_logs(db: Session = Depends(get_db)):
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).all()
    return logs