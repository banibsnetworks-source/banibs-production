"""
Frames API Routes
BANIBS Social World - Visual Storytelling

Purpose: Visual storytelling, reflections, and quiet presence.
Posture: Non-extractive, non-algorithmic, low-pressure.

WHAT FRAMES IS NOT:
- No likes, no comments, no follower counts
- No engagement metrics, no ranking algorithms
- No urgency mechanics, no monetization
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, timezone
from bson import ObjectId
import os

router = APIRouter(prefix="/api/frames", tags=["Frames"])

# MongoDB connection
from motor.motor_asyncio import AsyncIOMotorClient

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME", "banibs_db")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]
frames_collection = db["frames"]

# Auth dependencies
from routes.auth import get_current_user
from middleware.auth_guard import get_current_user_optional

# Visibility options
VISIBILITY_OPTIONS = ["public", "circle", "private"]


# Pydantic Models
class FrameCreate(BaseModel):
    image_url: str = Field(..., min_length=1)
    caption: Optional[str] = Field(None, max_length=300)
    visibility: str = Field(default="public")


class FrameUpdate(BaseModel):
    caption: Optional[str] = Field(None, max_length=300)
    visibility: Optional[str] = None


class FrameResponse(BaseModel):
    id: str
    image_url: str
    caption: Optional[str]
    visibility: str
    creator_id: str
    creator_name: str
    creator_avatar: Optional[str]
    created_at: str


# Helper to serialize frame
def serialize_frame(frame: dict) -> dict:
    return {
        "id": str(frame["_id"]),
        "image_url": frame["image_url"],
        "caption": frame.get("caption"),
        "visibility": frame.get("visibility", "public"),
        "creator_id": frame["creator_id"],
        "creator_name": frame.get("creator_name", "BANIBS User"),
        "creator_avatar": frame.get("creator_avatar"),
        "created_at": frame["created_at"].isoformat() if isinstance(frame["created_at"], datetime) else frame["created_at"],
    }


# Routes

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_frame(frame: FrameCreate, current_user: dict = Depends(get_current_user)):
    """Create a new Frame"""
    
    # Validate visibility
    if frame.visibility not in VISIBILITY_OPTIONS:
        raise HTTPException(status_code=400, detail=f"Invalid visibility. Must be one of: {VISIBILITY_OPTIONS}")
    
    now = datetime.now(timezone.utc)
    
    frame_doc = {
        "image_url": frame.image_url,
        "caption": frame.caption.strip() if frame.caption else None,
        "visibility": frame.visibility,
        "creator_id": current_user["id"],
        "creator_name": current_user.get("name", "BANIBS User"),
        "creator_avatar": current_user.get("profile", {}).get("avatar_url") or current_user.get("avatar_url"),
        "created_at": now,
        "reports": [],
        "hidden_by": [],
        "status": "active",
    }
    
    result = await frames_collection.insert_one(frame_doc)
    frame_doc["_id"] = result.inserted_id
    
    return serialize_frame(frame_doc)


@router.get("")
async def get_frames(
    visibility: Optional[str] = None,
    creator_id: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=48),  # Grid-friendly pagination
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get Frames with simple filtering
    - Default sort: newest → oldest (no algorithmic ranking)
    - No infinite scroll addiction - deliberate pagination
    """
    
    query = {"status": "active"}
    
    # Visibility filtering
    if current_user:
        # Logged in: can see public + their own frames
        if creator_id and creator_id == current_user["id"]:
            # Viewing own frames - show all
            query["creator_id"] = creator_id
        elif creator_id:
            # Viewing someone else's frames - only public
            query["creator_id"] = creator_id
            query["visibility"] = "public"
        else:
            # Browsing all frames - only public
            query["visibility"] = "public"
        
        # Exclude hidden frames
        query["hidden_by"] = {"$ne": current_user["id"]}
    else:
        # Guest: only public frames
        query["visibility"] = "public"
    
    # Additional visibility filter
    if visibility and visibility in VISIBILITY_OPTIONS:
        query["visibility"] = visibility
    
    # Simple sort: newest first (no algorithmic ranking)
    cursor = frames_collection.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    frames = await cursor.to_list(length=limit)
    
    total = await frames_collection.count_documents(query)
    
    return {
        "frames": [serialize_frame(f) for f in frames],
        "total": total,
        "skip": skip,
        "limit": limit,
        "has_more": skip + limit < total
    }


@router.get("/mine")
async def get_my_frames(
    visibility: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(24, ge=1, le=48),
    current_user: dict = Depends(get_current_user)
):
    """Get current user's Frames (including private/drafts)"""
    
    query = {"creator_id": current_user["id"], "status": "active"}
    
    if visibility and visibility in VISIBILITY_OPTIONS:
        query["visibility"] = visibility
    
    cursor = frames_collection.find(query).sort([("created_at", -1)]).skip(skip).limit(limit)
    frames = await cursor.to_list(length=limit)
    total = await frames_collection.count_documents(query)
    
    return {
        "frames": [serialize_frame(f) for f in frames],
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/{frame_id}")
async def get_frame(frame_id: str, current_user: Optional[dict] = Depends(get_current_user_optional)):
    """Get a single Frame"""
    
    try:
        oid = ObjectId(frame_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Frame ID")
    
    frame = await frames_collection.find_one({"_id": oid, "status": "active"})
    
    if not frame:
        raise HTTPException(status_code=404, detail="Frame not found")
    
    # Check visibility
    if frame["visibility"] != "public":
        if not current_user:
            raise HTTPException(status_code=404, detail="Frame not found")
        if frame["creator_id"] != current_user["id"]:
            # TODO: Add circle visibility check when circles are integrated
            raise HTTPException(status_code=404, detail="Frame not found")
    
    # Check if hidden
    if current_user and current_user["id"] in frame.get("hidden_by", []):
        raise HTTPException(status_code=404, detail="Frame not found")
    
    return serialize_frame(frame)


@router.patch("/{frame_id}")
async def update_frame(
    frame_id: str,
    update: FrameUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a Frame (creator only) - caption and visibility only"""
    
    try:
        oid = ObjectId(frame_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Frame ID")
    
    frame = await frames_collection.find_one({"_id": oid})
    
    if not frame:
        raise HTTPException(status_code=404, detail="Frame not found")
    
    if frame["creator_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="You can only edit your own Frames")
    
    update_doc = {}
    
    if update.caption is not None:
        update_doc["caption"] = update.caption.strip() if update.caption else None
    
    if update.visibility:
        if update.visibility not in VISIBILITY_OPTIONS:
            raise HTTPException(status_code=400, detail="Invalid visibility")
        update_doc["visibility"] = update.visibility
    
    if update_doc:
        await frames_collection.update_one({"_id": oid}, {"$set": update_doc})
    
    updated_frame = await frames_collection.find_one({"_id": oid})
    return serialize_frame(updated_frame)


@router.delete("/{frame_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_frame(frame_id: str, current_user: dict = Depends(get_current_user)):
    """Delete a Frame (creator or admin only)"""
    
    try:
        oid = ObjectId(frame_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Frame ID")
    
    frame = await frames_collection.find_one({"_id": oid})
    
    if not frame:
        raise HTTPException(status_code=404, detail="Frame not found")
    
    if frame["creator_id"] != current_user["id"]:
        if current_user.get("role") not in ["admin", "super_admin"]:
            raise HTTPException(status_code=403, detail="You can only delete your own Frames")
    
    # Soft delete
    await frames_collection.update_one({"_id": oid}, {"$set": {"status": "deleted"}})
    return None


# Safety Features

@router.post("/{frame_id}/report")
async def report_frame(
    frame_id: str,
    reason: str = Query(..., min_length=5, max_length=500),
    current_user: dict = Depends(get_current_user)
):
    """Report a Frame"""
    
    try:
        oid = ObjectId(frame_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Frame ID")
    
    frame = await frames_collection.find_one({"_id": oid})
    
    if not frame:
        raise HTTPException(status_code=404, detail="Frame not found")
    
    if frame["creator_id"] == current_user["id"]:
        raise HTTPException(status_code=400, detail="You cannot report your own Frame")
    
    report_doc = {
        "user_id": current_user["id"],
        "reason": reason,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await frames_collection.update_one(
        {"_id": oid},
        {"$push": {"reports": report_doc}}
    )
    
    return {"message": "Report submitted. Thank you for helping keep BANIBS safe."}


@router.post("/{frame_id}/hide")
async def hide_frame(frame_id: str, current_user: dict = Depends(get_current_user)):
    """Hide a Frame from your feed"""
    
    try:
        oid = ObjectId(frame_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Frame ID")
    
    await frames_collection.update_one(
        {"_id": oid},
        {"$addToSet": {"hidden_by": current_user["id"]}}
    )
    
    return {"message": "Frame hidden from your feed"}


@router.post("/{frame_id}/unhide")
async def unhide_frame(frame_id: str, current_user: dict = Depends(get_current_user)):
    """Unhide a Frame"""
    
    try:
        oid = ObjectId(frame_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid Frame ID")
    
    await frames_collection.update_one(
        {"_id": oid},
        {"$pull": {"hidden_by": current_user["id"]}}
    )
    
    return {"message": "Frame unhidden"}
