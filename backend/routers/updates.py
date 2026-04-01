from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from services.audit_service import log_action
from backend.database import SessionLocal
from backend.models.model_update_model import ModelUpdate
from backend.models.training_round_model import TrainingRound

router = APIRouter(prefix="/updates", tags=["Updates"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/")
def submit_update(
    round_id: str,
    bank_id: str,
    s3_path: str,
    samples: int,
    db: Session = Depends(get_db)
):

    # 1. store update
    update = ModelUpdate(
        round_id=round_id,
        bank_id=bank_id,
        update_s3_path=s3_path,
        samples_used=samples
    )

    db.add(update)

    # 2. update training round counter
    round = db.query(TrainingRound)\
        .filter(TrainingRound.round_id == round_id)\
        .first()

    round.received_updates += 1

    db.commit()
    log_action(
    actor_id=bank_id,
    action="MODEL_UPDATE_SUBMITTED",
    entity_type="MODEL_UPDATE",
    entity_id=update.update_id,
    details=f"Samples: {samples}"
    )
    # 3. check aggregation condition
    if round.received_updates >= round.total_banks:

        round.status = "AGGREGATING"
        db.commit()

        from aggregator.aggregator import aggregate_models

        s3_path = aggregate_models(round_id)
        log_action(
        actor_id=bank_id,
        action="MODEL_UPDATE_SUBMITTED",
        entity_type="MODEL_UPDATE",
        entity_id=update.update_id,
        details=f"Samples: {samples}"
        )
        round.status = "COMPLETED"
        round.aggregated_model_path = s3_path
        db.commit()

    return {"message": "Update received"}