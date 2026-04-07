from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.services.audit_service import log_action
from backend.database import SessionLocal
# from backend.models.model_update_model import ModelUpdate
from backend.models.bank_model1 import Bank
from backend.models.training_round_model1 import TrainingRound

router = APIRouter(prefix="/updates", tags=["Updates"])


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/latest-model")
def get_latest_model(db: Session = Depends(get_db)):

    # round = db.query(TrainingRound)\
    #     .filter(TrainingRound.status == "IN_PROGRESS")\
    #     .first()

    # if not round:
    #     return {"error": "No active training round"}

    # return {
    #     "round_id": str(round.round_id),
    #     "model_path": "s3://federated-fraud-models/global_models/model_v1.pkl"
    # }
    lm_query = db.query(
    Bank.bank_name,
    Bank.total_rows,
    Bank.accuracy,
    Bank.update_s3_path
    ).all()
    log_action(
    actor_id=None,
    action="LATEST_MODELS_FETCHED",
    entity_type="MODEL_UPDATE",
    entity_id=None,
    details=f"Latest model fetched"
    )
    return lm_query

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