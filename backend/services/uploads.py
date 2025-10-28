"""
S3 Upload Service for BANIBS
Handles presigned URL generation for direct-to-S3 uploads
Falls back to local storage when AWS credentials not available
"""

import os
import boto3
from botocore.exceptions import ClientError
from typing import Optional, Dict
import uuid
from pathlib import Path

# AWS Configuration from environment
AWS_ACCESS_KEY_ID = os.environ.get("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.environ.get("AWS_SECRET_ACCESS_KEY")
AWS_S3_BUCKET = os.environ.get("AWS_S3_BUCKET")
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
CLOUDFRONT_URL = os.environ.get("CLOUDFRONT_URL")

# Local fallback configuration
LOCAL_UPLOAD_DIR = Path("/app/backend/uploads")
LOCAL_UPLOAD_DIR.mkdir(exist_ok=True)

def is_aws_configured() -> bool:
    """Check if AWS credentials are configured"""
    return all([
        AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY,
        AWS_S3_BUCKET
    ])

def generate_s3_key(filename: str, folder: str = "opportunities") -> str:
    """
    Generate unique S3 key for file
    
    Args:
        filename: Original filename
        folder: S3 folder/prefix
    
    Returns:
        Unique S3 key (e.g., "opportunities/abc123-file.jpg")
    """
    # Generate unique ID
    unique_id = str(uuid.uuid4())[:8]
    
    # Extract extension
    ext = Path(filename).suffix.lower()
    
    # Create key
    return f"{folder}/{unique_id}-{Path(filename).stem}{ext}"

def generate_presigned_url(
    filename: str,
    content_type: str = "image/jpeg",
    expires_in: int = 600
) -> Optional[Dict[str, str]]:
    """
    Generate presigned URL for S3 upload
    
    Args:
        filename: Original filename
        content_type: MIME type
        expires_in: URL expiration in seconds (default 10 minutes)
    
    Returns:
        Dict with uploadUrl and publicUrl, or None if AWS not configured
    """
    if not is_aws_configured():
        return None
    
    try:
        # Create S3 client
        s3_client = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=AWS_ACCESS_KEY_ID,
            aws_secret_access_key=AWS_SECRET_ACCESS_KEY
        )
        
        # Generate unique key
        s3_key = generate_s3_key(filename)
        
        # Generate presigned URL for PUT
        upload_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': AWS_S3_BUCKET,
                'Key': s3_key,
                'ContentType': content_type
            },
            ExpiresIn=expires_in,
            HttpMethod='PUT'
        )
        
        # Generate public URL
        if CLOUDFRONT_URL:
            public_url = f"{CLOUDFRONT_URL}/{s3_key}"
        else:
            public_url = f"https://{AWS_S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"
        
        return {
            "uploadUrl": upload_url,
            "publicUrl": public_url,
            "key": s3_key
        }
    
    except ClientError as e:
        print(f"Error generating presigned URL: {e}")
        return None

def get_local_upload_path(filename: str) -> tuple[str, str]:
    """
    Generate local file path for fallback storage
    
    Args:
        filename: Original filename
    
    Returns:
        Tuple of (file_path, public_url)
    """
    # Generate unique filename
    unique_id = str(uuid.uuid4())[:8]
    ext = Path(filename).suffix.lower()
    unique_filename = f"{unique_id}-{Path(filename).stem}{ext}"
    
    # Create full path
    file_path = LOCAL_UPLOAD_DIR / unique_filename
    
    # Create public URL (served by FastAPI)
    public_url = f"/uploads/{unique_filename}"
    
    return str(file_path), public_url
