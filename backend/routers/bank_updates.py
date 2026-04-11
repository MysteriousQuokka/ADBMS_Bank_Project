from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.services.audit_service import log_action
from database import SessionLocal
from backend.models.bank_model1 import Bank1

router = APIRouter(prefix="/bank_details", tags=["Bank Details"])
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/model-details")
def get_model_details(db: Session = Depends(get_db), bank_name: str = None):
    try:
        log_action(
        actor_id=None,
        action="LATEST_BANK_DETAILS_FETCHED",
        entity_type="BANK_UPDATE",
        entity_id=None,
        details=f"Latest bank details fetched for {bank_name}"
        )
        return [
        {
            "bank_name": b.bank_name,
            "total_rows": b.total_rows,
            "accuracy": b.accuracy,
            "update_s3_path": b.update_s3_path
        }
        for b in db.query(Bank).filter(Bank.bank_name == bank_name).all()
        ]
    except Exception as e:
        return {
            "error": str(e),
            "message": "Bank fetching failed but handled safely"
        }