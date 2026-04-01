import boto3
import os

BUCKET_NAME = "federated-fraud-models"

# Read from environment variables
AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_DEFAULT_REGION")

# Create S3 client with explicit credentials
s3 = boto3.client(
    "s3",
    aws_access_key_id=AWS_ACCESS_KEY_ID,
    aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    region_name=AWS_REGION
)


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