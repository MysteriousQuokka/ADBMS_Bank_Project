import requests
from config import CENTRAL_SERVER, BANK_EMAIL, BANK_PASSWORD


def login():

    payload = {
        "email": BANK_EMAIL,
        "password": BANK_PASSWORD
    }

    r = requests.post(
        f"{CENTRAL_SERVER}/auth/login",
        json=payload
    )

    data = r.json()

    return data["bank_id"]


def get_latest_model():

    r = requests.get(
        f"{CENTRAL_SERVER}/training/latest-model"
    )

    return r.json()


def send_update(round_id, bank_id, s3_path, samples):

    payload = {
        "round_id": round_id,
        "bank_id": bank_id,
        "s3_path": s3_path,
        "samples": samples
    }

    r = requests.post(
        f"{CENTRAL_SERVER}/updates",
        params=payload
    )

    return r.json()