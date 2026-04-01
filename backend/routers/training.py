from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from backend.services.audit_service import log_action
from backend.database import SessionLocal
from backend.models.training_round_model import TrainingRound

router = APIRouter(prefix="/training", tags=["Training"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/start")
def start_training(total_banks: int, db: Session = Depends(get_db)):

    round = TrainingRound(
        status="IN_PROGRESS",
        total_banks=total_banks,
        received_updates=0,
        start_time=datetime.utcnow()
    )

    db.add(round)
    db.commit()
    db.refresh(round)
    log_action(
    actor_id=None,
    action="TRAINING_STARTED",
    entity_type="TRAINING_ROUND",
    entity_id=round.round_id,
    details=f"Total banks: {total_banks}"
    )
    return {
        "message": "Training round started",
        "round_id": str(round.round_id)
    }

@router.get("/latest-model")
def get_latest_model(db: Session = Depends(get_db)):

    round = db.query(TrainingRound)\
        .filter(TrainingRound.status == "IN_PROGRESS")\
        .first()

    if not round:
        return {"error": "No active training round"}

    return {
        "round_id": str(round.round_id),
        "model_path": "s3://federated-fraud-models/global_models/model_v1.pkl"
    }