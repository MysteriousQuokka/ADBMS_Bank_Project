import boto3
import uuid

BUCKET = "federated-fraud-models-464899061975-ap-south-1-an"

s3 = boto3.client("s3")


def upload_model(file_path):

    key = f"bank_updates/{uuid.uuid4()}.pkl"

    s3.upload_file(
        file_path,
        BUCKET,
        key
    )

    return f"s3://{BUCKET}/{key}"

def download_global_model(key):

    local_path = "global_model.pkl"

    s3.download_file(
        BUCKET,
        key,
        local_path
    )

    return local_path