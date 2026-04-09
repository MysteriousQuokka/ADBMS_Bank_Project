from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.services.audit_service import log_action
from backend.database import SessionLocal
# from backend.models.model_update_model import ModelUpdate
from backend.models.bank_model1 import Bank
from backend.models.training_round_model1 import TrainingRound
import boto3
import os
import pickle
import numpy as np
from datetime import datetime
from zoneinfo import ZoneInfo

BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

def federated_average(models, bank_rows):
    agg_model = {}
    for key in models[0].keys():
        agg_model[key] = np.average([m[key] for m in models], weights = bank_rows, axis=0)
    return agg_model

models = []

def upload_model_to_s3(model, bucket, key):
    buffer = io.BytesIO()
    pickle.dump(model, buffer)
    buffer.seek(0)

    s3.upload_fileobj(buffer, bucket, key)

    return f"s3://{bucket}/{key}"

router = APIRouter(prefix="/updates", tags=["Updates"])
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/latest-model")
def get_latest_model(db: Session = Depends(get_db)):
    try:
        # lm_query = db.query(
        #     Bank.bank_name,
        #     Bank.total_rows,
        #     Bank.accuracy,
        #     Bank.update_s3_path
        # ).all()
        # print("DEBUG DATA:", lm_query)

        log_action(
        actor_id=None,
        action="LATEST_MODEL_DETAILS_FETCHED",
        entity_type="MODEL_UPDATE",
        entity_id=None,
        details=f"Latest model details fetched at {datetime.now(ZoneInfo('Asia/Kolkata'))}"
        )
        # return lm_query
        return [
        {
            "bank_name": b.bank_name,
            "total_rows": b.total_rows,
            "accuracy": b.accuracy,
            "update_s3_path": b.update_s3_path
        }
        for b in db.query(Bank).all()
        ]

    except Exception as e:
        return {
            "error": str(e),
            "message": "Backend failed but handled safely"
        }

@router.get("/fetch-model")
def fetch_latest_model(db: Session = Depends(get_db)):

    # round = db.query(TrainingRound)\
    #     .filter(TrainingRound.status == "IN_PROGRESS")\
    #     .first()

    # if not round:
    #     return {"error": "No active training round"}

    # return {
    #     "round_id": str(round.round_id),
    #     "model_path": "s3://federated-fraud-models/global_models/model_v1.pkl"
    # }
    try:
        models = []
        s3 = boto3.client("s3",
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
        region_name=os.getenv("AWS_DEFAULT_REGION")
       )
        lm1_query = db.query(Bank.update_s3_path).all()
        if(len(lm1_query) == 0):
            return {"error": "No latest models found"}
        BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
        for row in lm1_query:
            s3_path = row.update_s3_path
            # bucket, key = s3_path.replace("s3://", "").split("/", 1)
            try:
                obj = s3.get_object(Bucket=BUCKET_NAME, Key=s3_path)
                weights = pickle.loads(obj["Body"].read())

                # Optional but smart: convert tensors → numpy
                weights = {k: v.cpu().numpy() for k, v in weights.items()}

                models.append(weights)
            except Exception as e:
                print(f"Failed to load {s3_path}: {e}")
        log_action(
        actor_id=None,
        action="LATEST_MODELS_FETCHED",
        entity_type="MODEL_UPDATE",
        entity_id=None,
        details=f"Latest models fetched at {datetime.now(ZoneInfo('Asia/Kolkata'))}"
        )
        return "Models fetched successfully",models
    except Exception as e:
        log_action(
        actor_id=None,
        action="LATEST_MODELS_FETCH_FAILED",
        entity_type="MODEL_UPDATE",
        entity_id=None,
        details=f"Failed to fetch latest models: {str(e)} at {datetime.now(ZoneInfo('Asia/Kolkata'))}"
        )
        return {"error": "Failed to fetch latest models"}

@router.post("/submit-update")
def submit_update(
    # total_banks: int,
    db: Session = Depends(get_db)
):

    # 1. store update
    # update = ModelUpdate(
    #     round_id=round_id,
    #     bank_id=bank_id,
    #     update_s3_path=s3_path,
    #     samples_used=samples
    # )

    # db.add(update)

    # # 2. update training round counter
    # round = db.query(TrainingRound)\
    #     .filter(TrainingRound.round_id == round_id)\
    #     .first()

    # round.received_updates += 1

    # db.commit()
    # log_action(
    # actor_id=bank_id,
    # action="MODEL_UPDATE_SUBMITTED",
    # entity_type="MODEL_UPDATE",
    # entity_id=update.update_id,
    # details=f"Samples: {samples}"
    # )
    # # 3. check aggregation condition
    # if round.received_updates >= round.total_banks:

    #     round.status = "AGGREGATING"
    #     db.commit()

    #     from aggregator.aggregator import aggregate_models

    #     s3_path = aggregate_models(round_id)
    #     log_action(
    #     actor_id=bank_id,
    #     action="MODEL_UPDATE_SUBMITTED",
    #     entity_type="MODEL_UPDATE",
    #     entity_id=update.update_id,
    #     details=f"Samples: {samples}"
    #     )
    #     round.status = "COMPLETED"
    #     round.aggregated_model_path = s3_path
    #     db.commit()

    # return {"message": "Update received"}
    if models == []:
        return {"error": "No models available for aggregation"}
    round_number = db.query(TrainingRound.round_number).order_by(TrainingRound.round_number.desc()).first()
    total_banks = db.query(Bank).filter(Bank.status == "PARTICIPATING").count()
    # bank_rows = db.query(Bank.total_rows).all()
    bank_rows = [row[0] for row in bank_rows]
    # aggregate
    aggregated_model = federated_average(models, bank_rows)
    # get next round
    latest_round = db.query(TrainingRound).order_by(
        TrainingRound.round_number.desc()
    ).first()
    next_round = latest_round.round_number + 1 if latest_round else 1
        # 5. Upload aggregated model
    file_name = f"global_model_v{next_round}.pkl"
    s3_key = f"global_models/{file_name}"
    aggregated_model_path = upload_model_to_s3(
        aggregated_model,
        BUCKET_NAME,
        s3_key
    )
    new_round = TrainingRound(
        round_number=round_number[0] + 1 if round_number else 1,
        total_banks=total_banks,
        aggregated_model_path=aggregated_model_path
    )
    db.add(new_round)
    db.commit()
    log_action(
        actor_id=None,
        action="MODEL_AGGREGATED",
        entity_type="TRAINING_ROUND",
        entity_id=new_round.round_number,
        details=f"Aggregated model for round {new_round.round_number} uploaded at {aggregated_model_path}"
    )
    return {
        "round": next_round,
        "aggregated_model_path": aggregated_model_path,
        "updated_weights": aggregated_model
    }