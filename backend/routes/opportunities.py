from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Body
from typing import Optional
from bson import ObjectId
import boto3
import os
from datetime import timedelta, datetime
from pydantic import BaseModel

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

# --- HELPER FUNCTIONS ---

async def enrich_opportunity_with_contributor(db, doc: dict) -> dict:
    """
    Phase 3.1 - Fetch contributor info and add to opportunity document
    """
    contributor_id = doc.get("contributor_id")
    if not contributor_id:
        return doc
    
    contributor = await db.contributors.find_one({"_id": contributor_id})
    if contributor:
        doc["contributor_display_name"] = contributor.get("display_name") or contributor.get("name", "Anonymous")
        doc["contributor_verified"] = contributor.get("verified", False)
    
    return doc

# --- PUBLIC ENDPOINTS ---

@router.get("/", response_model=list[OpportunityPublic])
async def list_opportunities(
    type: Optional[str] = None,
    db=Depends(get_db),
):
    docs = await get_public_opportunities(db, type)
    
    # Enrich with contributor data (Phase 3.1)
    enriched_docs = []
    for doc in docs:
        enriched_doc = await enrich_opportunity_with_contributor(db, doc)
        enriched_docs.append(enriched_doc)
    
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
            contributor_display_name=doc.get("contributor_display_name"),
            contributor_verified=doc.get("contributor_verified", False),
        )
        for doc in enriched_docs
    ]


@router.get("/featured", response_model=list[OpportunityPublic])
async def list_featured(db=Depends(get_db)):
    docs = await get_featured_opportunities(db)
    
    # Enrich with contributor data (Phase 3.1)
    enriched_docs = []
    for doc in docs:
        enriched_doc = await enrich_opportunity_with_contributor(db, doc)
        enriched_docs.append(enriched_doc)
    
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
            contributor_display_name=doc.get("contributor_display_name"),
            contributor_verified=doc.get("contributor_verified", False),
        )
        for doc in enriched_docs
    ]


@router.post("/", status_code=201)
async def submit_opportunity(
    payload: OpportunityCreate,
    db=Depends(get_db),
):
    """
    Submit new opportunity (public - no auth required)
    DEPRECATED in Phase 2.9 - use /submit instead
    """
    # Store submission; approved defaults to False
    new_id = await insert_opportunity(db, payload.dict())
    return {"id": new_id, "status": "received", "approved": False}


# --- CONTRIBUTOR ENDPOINTS (Phase 2.9) ---

from middleware.auth_guard import get_current_user

@router.post("/submit", status_code=201)
async def submit_opportunity_authenticated(
    payload: OpportunityCreate,
    db=Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Submit opportunity as authenticated contributor
    Stores contributor info with submission
    """
    # Add contributor info to submission
    data = payload.dict()
    
    # Convert HttpUrl to string for MongoDB
    if "link" in data and data["link"] is not None:
        data["link"] = str(data["link"])
    
    data["approved"] = False
    data["featured"] = False
    data["status"] = "pending"
    data["contributor_id"] = user.get("user_id")
    data["contributor_email"] = user.get("email")
    data["createdAt"] = datetime.utcnow()
    data["updatedAt"] = datetime.utcnow()
    
    result = await db.opportunities.insert_one(data)
    new_id = str(result.inserted_id)
    
    return {
        "id": new_id,
        "status": "pending",
        "message": "Submission received and pending review"
    }

@router.get("/mine")
async def get_my_opportunities(
    db=Depends(get_db),
    user: dict = Depends(get_current_user)
):
    """
    Get opportunities submitted by current contributor
    Requires contributor JWT
    """
    contributor_id = user.get("user_id")
    
    cursor = db.opportunities.find({"contributor_id": contributor_id}).sort("createdAt", -1)
    docs = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        docs.append(doc)
    
    return docs
    

# --- ADMIN ENDPOINTS ---

# Phase 2.8: JWT-based authentication
# Admin endpoints now require JWT with 'admin' role

from middleware.auth_guard import require_role

@router.get("/pending")
async def list_pending(
    db=Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    """
    Get pending opportunities (admin only)
    Requires JWT with role='admin'
    """
    docs = await get_pending_opportunities(db)
    
    # Enrich with contributor data (Phase 3.1)
    enriched_docs = []
    for doc in docs:
        enriched_doc = await enrich_opportunity_with_contributor(db, doc)
        enriched_docs.append(enriched_doc)
    
    # Convert ObjectId to string for JSON serialization
    for doc in enriched_docs:
        doc["id"] = str(doc.pop("_id"))
    
    return enriched_docs


# Models for moderation actions with notes
class ModerationAction(BaseModel):
    notes: Optional[str] = None

@router.patch("/{opp_id}/approve")
async def approve_opportunity(
    opp_id: str,
    action: ModerationAction = Body(default=ModerationAction()),
    db=Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    """
    Approve opportunity (admin only)
    Requires JWT with role='admin'
    Accepts optional moderation notes
    """
    # Update status with notes
    await db.opportunities.update_one(
        {"_id": ObjectId(opp_id)},
        {"$set": {
            "approved": True,
            "featured": False,
            "status": "approved",
            "moderation_notes": action.notes,
            "updatedAt": datetime.utcnow()
        }}
    )
    
    # Log moderation action with notes
    await log_moderation_action(db, "APPROVE_OPPORTUNITY", opp_id, user, action.notes)
    
    return {"id": opp_id, "approved": True, "featured": False}


@router.patch("/{opp_id}/reject")
async def reject_opportunity(
    opp_id: str,
    action: ModerationAction = Body(default=ModerationAction()),
    db=Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    """
    Reject opportunity (admin only)
    Requires JWT with role='admin'
    Accepts optional moderation notes
    """
    # Update status with notes
    await db.opportunities.update_one(
        {"_id": ObjectId(opp_id)},
        {"$set": {
            "approved": False,
            "featured": False,
            "status": "rejected",
            "moderation_notes": action.notes,
            "updatedAt": datetime.utcnow()
        }}
    )
    
    # Log moderation action with notes
    await log_moderation_action(db, "REJECT_OPPORTUNITY", opp_id, user, action.notes)
    
    return {"id": opp_id, "approved": False, "featured": False}


@router.patch("/{opp_id}/feature")
async def feature_opportunity(
    opp_id: str,
    action: ModerationAction = Body(default=ModerationAction()),
    db=Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    """
    Feature opportunity (admin only)
    Requires JWT with role='admin'
    Auto-approves the opportunity
    """
    # Update status with notes
    await db.opportunities.update_one(
        {"_id": ObjectId(opp_id)},
        {"$set": {
            "approved": True,
            "featured": True,
            "status": "approved",
            "moderation_notes": action.notes,
            "updatedAt": datetime.utcnow()
        }}
    )
    
    # Log moderation action with notes
    await log_moderation_action(db, "FEATURE_OPPORTUNITY", opp_id, user, action.notes)
    
    return {"id": opp_id, "approved": True, "featured": True}


# --- ANALYTICS ENDPOINT (Phase 2.9) ---

@router.get("/analytics")
async def get_analytics(
    db=Depends(get_db),
    user: dict = Depends(require_role("admin")),
):
    """
    Get analytics dashboard stats (admin only)
    Returns counts of opportunities by status
    """
    # Count by status
    pending_count = await db.opportunities.count_documents({"status": "pending"})
    approved_count = await db.opportunities.count_documents({"status": "approved", "featured": False})
    rejected_count = await db.opportunities.count_documents({"status": "rejected"})
    featured_count = await db.opportunities.count_documents({"featured": True})
    
    # Count by type
    jobs_count = await db.opportunities.count_documents({"type": "job", "approved": True})
    grants_count = await db.opportunities.count_documents({"type": "grant", "approved": True})
    scholarships_count = await db.opportunities.count_documents({"type": "scholarship", "approved": True})
    training_count = await db.opportunities.count_documents({"type": "training", "approved": True})
    events_count = await db.opportunities.count_documents({"type": "event", "approved": True})
    
    # Recent activity
    recent = await db.moderation_logs.find().sort("timestamp", -1).limit(10).to_list(length=10)
    for log in recent:
        log["_id"] = str(log["_id"])
    
    return {
        "status_counts": {
            "pending": pending_count,
            "approved": approved_count,
            "rejected": rejected_count,
            "featured": featured_count,
            "total": pending_count + approved_count + rejected_count
        },
        "type_counts": {
            "jobs": jobs_count,
            "grants": grants_count,
            "scholarships": scholarships_count,
            "training": training_count,
            "events": events_count
        },
        "recent_activity": recent
    }


# Helper function to log moderation actions
async def log_moderation_action(db, action: str, target_id: str, user: dict, notes: Optional[str] = None):
    """Log moderation action to moderation_logs collection"""
    
    log_entry = {
        "action": action,
        "target_id": target_id,
        "performed_by": user.get("email"),
        "admin_id": user.get("user_id"),
        "timestamp": datetime.utcnow(),
        "notes": notes
    }
    
    await db.moderation_logs.insert_one(log_entry)


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
