"""
Admin Upload Routes for BANIBS
Handles image uploads via S3 presigned URLs or local fallback
"""

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional
from pathlib import Path
import shutil

from middleware.auth_guard import require_role
from services.uploads import (
    generate_presigned_url,
    get_local_upload_path,
    is_aws_configured,
    LOCAL_UPLOAD_DIR
)

router = APIRouter(prefix="/api/admin/uploads", tags=["admin-uploads"])

class PresignRequest(BaseModel):
    """Request body for presigned URL generation"""
    fileName: str
    fileType: str = "image/jpeg"

class PresignResponse(BaseModel):
    """Response with presigned URL"""
    uploadUrl: str
    publicUrl: str
    key: Optional[str] = None
    method: str = "PUT"

@router.post("/presign", response_model=PresignResponse)
async def get_presigned_url(
    request: PresignRequest,
    user: dict = Depends(require_role("admin"))
):
    """
    Generate presigned URL for S3 upload (admin only)
    
    If AWS configured: Returns S3 presigned URL
    If AWS not configured: Returns local upload endpoint
    
    Frontend flow:
    1. Call this endpoint with JWT
    2. PUT file to uploadUrl
    3. Save publicUrl in database
    """
    # Try S3 first
    if is_aws_configured():
        result = generate_presigned_url(
            filename=request.fileName,
            content_type=request.fileType
        )
        
        if result:
            return PresignResponse(
                uploadUrl=result["uploadUrl"],
                publicUrl=result["publicUrl"],
                key=result["key"],
                method="PUT"
            )
    
    # Fallback to local upload
    file_path, public_url = get_local_upload_path(request.fileName)
    
    # For local, we use our own upload endpoint
    local_upload_url = f"/api/admin/uploads/local?filename={Path(file_path).name}"
    
    return PresignResponse(
        uploadUrl=local_upload_url,
        publicUrl=public_url,
        method="POST"  # Local uses POST with multipart
    )

@router.post("/local")
async def upload_local(
    file: UploadFile = File(...),
    filename: Optional[str] = None,
    user: dict = Depends(require_role("admin"))
):
    """
    Local file upload fallback (when AWS not configured)
    
    This is only used when AWS credentials are missing.
    In production, all uploads should go through S3.
    """
    if is_aws_configured():
        raise HTTPException(
            status_code=400,
            detail="AWS is configured. Use presigned URL upload instead."
        )
    
    # Use provided filename or original
    upload_filename = filename or file.filename
    file_path, public_url = get_local_upload_path(upload_filename)
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return {
            "success": True,
            "publicUrl": public_url,
            "message": "File uploaded successfully (local storage)"
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to save file: {str(e)}"
        )

@router.get("/test-aws")
async def test_aws_config(user: dict = Depends(require_role("admin"))):
    """
    Test AWS configuration (admin only)
    Useful for debugging upload issues
    """
    return {
        "aws_configured": is_aws_configured(),
        "has_access_key": bool(os.environ.get("AWS_ACCESS_KEY_ID")),
        "has_secret_key": bool(os.environ.get("AWS_SECRET_ACCESS_KEY")),
        "has_bucket": bool(os.environ.get("AWS_S3_BUCKET")),
        "region": os.environ.get("AWS_REGION", "us-east-1"),
        "has_cloudfront": bool(os.environ.get("CLOUDFRONT_URL"))
    }
