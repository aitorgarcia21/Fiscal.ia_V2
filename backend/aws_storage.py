"""AWS S3 helper utilities with KMS encryption and versioning assumed enabled.

This module is imported only if the env variable `AWS_S3_BUCKET` is defined.
If the variable is missing, calling its functions will raise RuntimeError.
"""
from __future__ import annotations

import os
import uuid
from typing import Tuple

import boto3
from botocore.exceptions import BotoCoreError, ClientError

AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET")
KMS_KEY_ID = os.getenv("AWS_KMS_KEY_ID")  # optional – default bucket key used if None

if not AWS_S3_BUCKET:
    raise RuntimeError("AWS_S3_BUCKET is not configured in environment variables")

# Reuse the default credential resolution chain (env vars, IAM role, etc.)
S3_CLIENT = boto3.client("s3")

def generate_storage_key(user_id: str, filename: str) -> str:
    file_id = str(uuid.uuid4())
    ext = filename.split('.')[-1]
    return f"documents/{user_id}/{file_id}.{ext}"

def upload_bytes(
    key: str,
    data: bytes,
    content_type: str,
) -> Tuple[str, str]:
    """Upload bytes to S3 with KMS encryption. Returns (key, url)."""
    extra_kwargs = {
        "ServerSideEncryption": "aws:kms",
    }
    if KMS_KEY_ID:
        extra_kwargs["SSEKMSKeyId"] = KMS_KEY_ID
    try:
        S3_CLIENT.put_object(
            Bucket=AWS_S3_BUCKET,
            Key=key,
            Body=data,
            ContentType=content_type,
            **extra_kwargs,
        )
    except (BotoCoreError, ClientError) as e:
        raise RuntimeError(f"Erreur upload S3: {str(e)}")
    # Generate a pre-signed GET url valid 1 hour for download
    url = S3_CLIENT.generate_presigned_url(
        "get_object",
        Params={"Bucket": AWS_S3_BUCKET, "Key": key},
        ExpiresIn=3600,
    )
    return key, url
