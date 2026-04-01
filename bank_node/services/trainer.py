import pandas as pd
import joblib

from model.fraud_model import create_model
from config import GLOBAL_MODEL_PATH, LOCAL_MODEL_PATH


def train_model():

    df = pd.read_csv("data/transactions.csv")

    X = df.drop("is_fraud", axis=1)
    y = df["is_fraud"]

    try:
        model = joblib.load(GLOBAL_MODEL_PATH)
    except:
        model = create_model()

    model.fit(X, y)

    joblib.dump(model, LOCAL_MODEL_PATH)

    return LOCAL_MODEL_PATH, len(X)