from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.services.audit_service import log_action
from backend.database import SessionLocal
# from backend.models.model_update_model import ModelUpdate
from backend.models.bank_model1 import Bank1
from backend.models.training_round_model1 import TrainingRound
import boto3
import os
import pickle
import numpy as np
from datetime import datetime
from zoneinfo import ZoneInfo
import io

BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_DEFAULT_REGION")

s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)

def federated_average(models, bank_rows):
    agg_model = {}
    # Normalize weights (important, otherwise scaling issues)
    weights = np.array(bank_rows, dtype=np.float64)
    weights = weights / weights.sum()
    for key in models[0].keys():
        # Convert each model's layer to numpy
        layer_stack = np.array([
            np.array(m[key], dtype=np.float32) for m in models
        ])
        # Weighted average
        agg_layer = np.tensordot(weights, layer_stack, axes=(0, 0))
        # Convert back to list (for JSON / storage)
        agg_model[key] = torch.tensor(agg_layer, dtype=torch.float32)
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
        log_action(
        actor_id=None,
        action="LATEST_MODEL_DETAILS_FETCHED",
        entity_type="MODEL_UPDATE",
        entity_id=None,
        details=f"Latest model details fetched at {datetime.now(ZoneInfo('Asia/Kolkata'))}"
        )
        return [
        {
            "bank_name": b.bank_name,
            "total_rows": b.total_rows,
            "accuracy": b.accuracy,
            "update_s3_path": b.update_s3_path
        }
        for b in db.query(Bank1).all()
        ]

    except Exception as e:
        return {
            "error": str(e),
            "message": "Backend failed but handled safely"
        }

@router.get("/fetch-model")
def fetch_latest_model(db: Session = Depends(get_db)):
    try:
        models = []
        banks = db.query(Bank1).all()
        paths = [bank.update_s3_path for bank in banks if bank.update_s3_path]
        if not paths:
            return {"error": "No latest models found"}
        BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
        for row in paths:
            s3_path = row
            try:
                obj = s3.get_object(Bucket=BUCKET_NAME, Key=s3_path)
                weights = pickle.loads(obj["Body"].read())
                processed_weights = {
                    k: v.cpu().numpy().tolist() if hasattr(v, "cpu") else v
                    for k, v in weights.items()
                }
                models.append(processed_weights)
            except Exception as e:
                print(f"Failed to load {s3_path} at line number: {e}")
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
def submit_update(db: Session = Depends(get_db)):
    message,models = fetch_latest_model(db)
    if models == []:
        return {"error": "No models available for aggregation"}
    round_number = db.query(TrainingRound.round_number).order_by(TrainingRound.round_number.desc()).first()
    total_banks = db.query(Bank1).filter(Bank1.status == "PARTICIPATING").count()
    bank_rows = db.query(Bank1.total_rows).filter(Bank1.status == "PARTICIPATING").all()
    bank_rows = [row[0] for row in bank_rows]
    # aggregate
    aggregated_model = federated_average(models, bank_rows)
    # get next round
    latest_round = db.query(TrainingRound).order_by(TrainingRound.round_number.desc()).first()
    next_round = latest_round.round_number + 1 if latest_round else 1
        # 5. Upload aggregated model
    file_name = f"global_model_v{next_round}.pkl"
    s3_key = f"global_models/{file_name}"
    aggregated_model_path = upload_model_to_s3(aggregated_model,BUCKET_NAME,s3_key)
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
        entity_id=None,
        details=f"Aggregated model for round {new_round.round_number} uploaded at {aggregated_model_path}"
    )
    return {
        "round": next_round,
        "aggregated_model_path": aggregated_model_path,
        "updated_weights": aggregated_model
    }