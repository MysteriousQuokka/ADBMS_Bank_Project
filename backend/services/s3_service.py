import boto3

BUCKET_NAME = "federated-fraud-models"

s3 = boto3.client("s3")


def upload_file(file_path, key):

    s3.upload_file(
        file_path,
        BUCKET_NAME,
        key
    )

    return f"s3://{BUCKET_NAME}/{key}"


def download_file(key, local_path):

    s3.download_file(
        BUCKET_NAME,
        key,
        local_path
    )