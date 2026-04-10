from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import SessionLocal
from models.audit_log_model import AuditLog

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