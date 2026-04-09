# ==============================
# IMPORTS
# ==============================
import os
import uuid
import io
import pickle
import boto3
import torch
import torch.nn as nn
import pandas as pd
import argparse

from dotenv import load_dotenv
from sqlalchemy import create_engine, desc
from sqlalchemy.orm import sessionmaker
from bank_model1 import Bank
from audit_log_model import AuditLog
from user_model import User
from training_round_model1 import TrainingRound
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score


# ==============================
# LOAD ENV
# ==============================
load_dotenv()

AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_DEFAULT_REGION")
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

DATABASE_URL = os.getenv("DATABASE_URL")


# ==============================
# DB SETUP
# ==============================
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)


# ==============================
# S3 CLIENT
# ==============================
s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    region_name=AWS_REGION
)


# ==============================
# MODEL
# ==============================
class SimpleNN(nn.Module):
    def __init__(self, input_dim):
        super(SimpleNN, self).__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.ReLU(),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, 1),
            nn.Sigmoid()
        )

    def forward(self, x):
        return self.net(x)


# ==============================
# S3 HELPERS
# ==============================
def load_pickle_from_s3(s3_key):
    try:
        obj = s3.get_object(Bucket=BUCKET_NAME, Key=s3_key)
        return pickle.loads(obj['Body'].read())
    except Exception:
        return None


def upload_pickle_to_s3(obj, s3_key):
    buffer = io.BytesIO()
    pickle.dump(obj, buffer)
    buffer.seek(0)

    s3.put_object(Bucket=BUCKET_NAME, Key=s3_key, Body=buffer)
    return s3_key


# ==============================
# FETCH GLOBAL MODEL
# ==============================
def fetch_global_model(db):
    latest_round = (
        db.query(TrainingRound)
        .order_by(desc(TrainingRound.round_number))
        .first()
    )

    if not latest_round or not latest_round.aggregated_model_path:
        return None

    return load_pickle_from_s3(latest_round.aggregated_model_path)


# ==============================
# TRAIN LOCAL MODEL
# ==============================
def train_local_model(csv_path, initial_weights=None):
    df = pd.read_csv(csv_path)

    X = df.drop(columns=["isFraud"]).values
    y = df["isFraud"].values

    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    X = torch.tensor(X, dtype=torch.float32)
    y = torch.tensor(y, dtype=torch.float32).view(-1, 1)

    model = SimpleNN(input_dim=X.shape[1])

    if initial_weights:
        model.load_state_dict(initial_weights)

    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    criterion = nn.BCELoss()

    model.train()
    optimizer.zero_grad()

    outputs = model(X)
    loss = criterion(outputs, y)
    loss.backward()
    optimizer.step()

    model.eval()
    preds = (model(X).detach().numpy() > 0.5).astype(int)
    accuracy = accuracy_score(y.numpy(), preds)

    return model.state_dict(), accuracy, len(df)


# ==============================
# AUTH + BANK HANDLING
# ==============================
def handle_bank_and_user(db, bank_name, email, password):
    bank = db.query(Bank).filter(Bank.bank_name == bank_name).first()

    if bank:
        user = db.query(User).filter(User.bank_id == bank.bank_id).first()

        if not user:
            raise Exception("User not found for this bank")

        if user.password_hash != password:
            raise Exception("Password mismatch")

        return bank, user.user_id

    else:
        new_bank = Bank(bank_name=bank_name)
        db.add(new_bank)
        db.commit()
        db.refresh(new_bank)

        new_user = User(
            bank_id=new_bank.bank_id,
            email=email,
            password_hash=password,
            role="BANK"
        )

        db.add(new_user)
        db.commit()

        return new_bank, new_user.user_id


# ==============================
# UPLOAD + AUDIT
# ==============================
def upload_and_log(db, bank, weights, accuracy, total_rows, actor_id):
    s3_key = f"models/{bank.bank_name}_{uuid.uuid4()}.pkl"
    upload_pickle_to_s3(weights, s3_key)

    # bank.accuracy = accuracy
    if bank.accuracy:
        bank.accuracy = bank.accuracy + [accuracy]
    else:
        bank.accuracy = [accuracy]
    bank.total_rows = total_rows
    bank.update_s3_path = s3_key
    bank.status = "PARTICIPATING"
    db.commit()

    log = AuditLog(
        actor_id=actor_id,
        action="MODEL_UPDATE",
        entity_type="BANK",
        entity_id=bank.bank_id,
        details=f"Updated model. Accuracy={accuracy}, Rows={total_rows}"
    )

    db.add(log)
    db.commit()

    return s3_key


# ==============================
# MAIN PIPELINE
# ==============================
def run_federated_round(csv_path, bank_name, email, password):
    db = SessionLocal()

    try:
        bank, user_id = handle_bank_and_user(db, bank_name, email, password)

        global_weights = fetch_global_model(db)

        weights, acc, rows = train_local_model(csv_path, global_weights)

        s3_path = upload_and_log(
            db,
            bank,
            weights,
            acc,
            rows,
            user_id
        )

        return {
            "accuracy": acc,
            "rows": rows,
            "s3_path": s3_path
        }

    finally:
        db.close()


# ==============================
# CLI ENTRY POINT
# ==============================
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Run Federated Learning Round")

    parser.add_argument("--csv", required=True, help="Path to CSV file")
    parser.add_argument("--bank", required=True, help="Bank name")
    parser.add_argument("--email", required=True, help="User email")
    parser.add_argument("--password", required=True, help="User password")

    args = parser.parse_args()

    result = run_federated_round(
        csv_path=args.csv,
        bank_name=args.bank,
        email=args.email,
        password=args.password
    )

    print("\n=== Federated Round Result ===")
    print(f"Accuracy: {result['accuracy']}")
    print(f"Rows: {result['rows']}")
    print(f"S3 Path: {result['s3_path']}")