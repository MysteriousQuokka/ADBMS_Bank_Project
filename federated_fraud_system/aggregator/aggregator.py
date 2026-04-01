import joblib
import numpy as np
import os

from backend.database import SessionLocal
from backend.models.model_update_model import ModelUpdate
from backend.services.s3_service import download_file, upload_file


def aggregate_models(round_id):

    db = SessionLocal()

    updates = db.query(ModelUpdate).filter(
        ModelUpdate.round_id == round_id
    ).all()

    if not updates:
        print("No updates found")
        return None

    models = []
    weights = []

    print("Downloading and loading models...")

    # STEP 1: download all models
    for i, update in enumerate(updates):

        s3_path = update.update_s3_path

        # extract key
        key = s3_path.replace("s3://federated-fraud-models/", "")

        local_path = f"temp_model_{i}.pkl"

        download_file(key, local_path)

        model = joblib.load(local_path)

        models.append(model)
        weights.append(update.samples_used)

    total_samples = sum(weights)

    print("Performing federated averaging...")

    # STEP 2: initialize global weights
    coef = None
    intercept = None

    for model, sample_count in zip(models, weights):

        weight = sample_count / total_samples

        if coef is None:
            coef = model.coef_ * weight
            intercept = model.intercept_ * weight
        else:
            coef += model.coef_ * weight
            intercept += model.intercept_ * weight

    # STEP 3: create new global model
    global_model = models[0]  # copy structure
    global_model.coef_ = coef
    global_model.intercept_ = intercept

    # STEP 4: save model
    output_path = "global_model.pkl"
    joblib.dump(global_model, output_path)

    # STEP 5: upload to S3
    s3_key = f"global_models/model_{round_id}.pkl"

    s3_path = upload_file(output_path, s3_key)

    print("Global model uploaded:", s3_path)

    # cleanup temp files
    for i in range(len(updates)):
        os.remove(f"temp_model_{i}.pkl")

    return s3_path