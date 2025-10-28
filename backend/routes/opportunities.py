from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File
from typing import Optional
from bson import ObjectId
import boto3
import os
from datetime import timedelta

from models.opportunity import OpportunityCreate, OpportunityPublic
from db.opportunities import (
    insert_opportunity,
    get_public_opportunities,
    get_featured_opportunities,
    get_pending_opportunities,
    update_opportunity_status,
)

# You already have something like get_db() in your FastAPI Mongo setup
from db.connection import get_db

router = APIRouter(prefix="/api/opportunities", tags=["opportunities"])

# S3 Configuration (optional - will be configured when AWS credentials are provided)
S3_BUCKET = os.environ.get("S3_BUCKET_NAME", None)
AWS_REGION = os.environ.get("AWS_REGION", "us-east-1")
CLOUDFRONT_URL = os.environ.get("CLOUDFRONT_URL", None)

# --- PUBLIC ENDPOINTS ---

@router.get("/", response_model=list[OpportunityPublic])
async def list_opportunities(
    type: Optional[str] = None,
    db=Depends(get_db),
):
    docs = await get_public_opportunities(db, type)
    # map DB docs to public model
    return [
        OpportunityPublic(
            id=str(doc["_id"]),
            title=doc["title"],
            orgName=doc["orgName"],
            type=doc["type"],
            location=doc.get("location"),
            deadline=doc.get("deadline"),
            description=doc["description"],
            link=doc.get("link"),
            imageUrl=doc.get("imageUrl"),
            featured=doc.get("featured", False),
            createdAt=doc["createdAt"],
        )
        for doc in docs
    ]


@router.get("/featured", response_model=list[OpportunityPublic])
async def list_featured(db=Depends(get_db)):
    docs = await get_featured_opportunities(db)
    return [
        OpportunityPublic(
            id=str(doc["_id"]),
            title=doc["title"],
            orgName=doc["orgName"],
            type=doc["type"],
            location=doc.get("location"),
            deadline=doc.get("deadline"),
            description=doc["description"],
            link=doc.get("link"),
            imageUrl=doc.get("imageUrl"),
            featured=doc.get("featured", False),
            createdAt=doc["createdAt"],
        )
        for doc in docs
    ]


@router.post("/", status_code=201)
async def submit_opportunity(
    payload: OpportunityCreate,
    db=Depends(get_db),
):
    # Store submission; approved defaults to False
    new_id = await insert_opportunity(db, payload.dict())
    return {"id": new_id, "status": "received", "approved": False}
    

# --- ADMIN ENDPOINTS ---

# We'll protect admin endpoints with a simple shared API key header.
# This avoids full auth/JWT work right now but keeps randoms from flipping approvals.

ADMIN_KEY = "BANIBS_INTERNAL_KEY"  # TODO: move to env in production

def check_admin(x_api_key: str = Header(None)):
    if x_api_key != ADMIN_KEY:
        raise HTTPException(status_code=403, detail="Forbidden (admin key invalid)")


@router.get("/pending")
async def list_pending(
    db=Depends(get_db),
    _: None = Depends(check_admin),
):
    docs = await get_pending_opportunities(db)
    # Convert ObjectId to string for JSON serialization
    for doc in docs:
        doc["id"] = str(doc.pop("_id"))
    return docs  # raw for now; admins can see unapproved stuff


@router.patch("/{opp_id}/approve")
async def approve_opportunity(
    opp_id: str,
    db=Depends(get_db),
    _: None = Depends(check_admin),
):
    await update_opportunity_status(db, opp_id, approved=True, featured=False)
    return {"id": opp_id, "approved": True, "featured": False}


@router.patch("/{opp_id}/reject")
async def reject_opportunity(
    opp_id: str,
    db=Depends(get_db),
    _: None = Depends(check_admin),
):
    await update_opportunity_status(db, opp_id, approved=False, featured=False)
    return {"id": opp_id, "approved": False, "featured": False}


@router.patch("/{opp_id}/feature")
async def feature_opportunity(
    opp_id: str,
    db=Depends(get_db),
    _: None = Depends(check_admin),
):
    # feature also implies approved
    await update_opportunity_status(db, opp_id, approved=True, featured=True)
    return {"id": opp_id, "approved": True, "featured": True}


# --- IMAGE UPLOAD ENDPOINT ---

@router.post("/upload-presigned-url")
async def get_upload_presigned_url(filename: str):
    """
    Generate a presigned URL for direct S3 upload from frontend.
    Requires AWS credentials to be configured in environment.
    """
    if not S3_BUCKET:
        raise HTTPException(
            status_code=501,
            detail="S3 upload not configured. Set S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY in environment."
        )
    
    try:
        s3_client = boto3.client(
            's3',
            region_name=AWS_REGION,
            aws_access_key_id=os.environ.get("AWS_ACCESS_KEY_ID"),
            aws_secret_access_key=os.environ.get("AWS_SECRET_ACCESS_KEY")
        )
        
        # Generate unique filename
        import uuid
        from pathlib import Path
        ext = Path(filename).suffix
        unique_filename = f"opportunities/{uuid.uuid4()}{ext}"
        
        # Generate presigned URL (valid for 15 minutes)
        presigned_url = s3_client.generate_presigned_url(
            'put_object',
            Params={
                'Bucket': S3_BUCKET,
                'Key': unique_filename,
                'ContentType': 'image/jpeg' if ext.lower() in ['.jpg', '.jpeg'] else 'image/png'
            },
            ExpiresIn=900  # 15 minutes
        )
        
        # Construct the public URL
        if CLOUDFRONT_URL:
            public_url = f"{CLOUDFRONT_URL}/{unique_filename}"
        else:
            public_url = f"https://{S3_BUCKET}.s3.{AWS_REGION}.amazonaws.com/{unique_filename}"
        
        return {
            "uploadUrl": presigned_url,
            "publicUrl": public_url,
            "filename": unique_filename
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating presigned URL: {str(e)}")
