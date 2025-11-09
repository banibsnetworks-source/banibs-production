from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
import os

from db.featured_media import (
    get_featured_media,
    get_latest_media_with_thumbnail,
    get_all_featured_media,
    create_featured_media,
    set_featured_media,
    delete_featured_media
)
from models.featured_media import FeaturedMediaPublic, FeaturedMediaDB
from middleware.auth_guard import require_role
from motor.motor_asyncio import AsyncIOMotorClient

# -------------------------------------------------
# BANIBS TV FEATURED VIDEO CONTRACT (DO NOT REMOVE)
#
# Rules:
# 1. /api/media/featured MUST always return a usable object
#    with title, description, thumbnailUrl, videoUrl
# 2. Falls back through: manually featured → latest with thumbnail → branded fallback
# 3. Thumbnails MUST be mirrored to CDN via same pipeline as news images
# 4. This block is part of BANIBS identity as a network, not just a feed
# -------------------------------------------------

router = APIRouter(prefix="/api/media", tags=["featured-media"])

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
featured_media_collection = db.featured_media

@router.get("/featured", response_model=FeaturedMediaPublic)
async def get_featured_media_endpoint():
    """
    Returns the current featured video/media for BANIBS TV hero section.
    
    Fallback logic:
    1. Manually featured (isFeatured=True) 
    2. Latest published with thumbnail
    3. Branded BANIBS TV fallback block
    
    Always returns a complete object - never empty.
    This is a public endpoint - no authentication required.
    """
    
    # 1. Try manually featured (editorial choice)
    media = await get_featured_media()
    
    # 2. Otherwise: latest with a thumbnail
    if not media:
        media = await get_latest_media_with_thumbnail()
    
    # 3. If still nothing (fresh install / empty table), return branded fallback
    if not media:
        return FeaturedMediaPublic(
            id="banibs-tv-default",
            title="BANIBS TV: Stories From The Network",
            description="Community wealth building, youth innovation, and real talk from founders, organizers, and educators shaping the future.",
            videoUrl="/video/intro",  # Internal landing route
            thumbnailUrl="https://cdn.banibs.com/fallback/video_default.jpg",
            tag="BANIBS TV • Community Voices",
            isFeatured=True,
            external=False,
            publishedAt=datetime.utcnow().isoformat() + "Z",
            sourceName="BANIBS TV"
        )
    
    # 4. Ensure thumbnail coverage on real media
    if not media.get('thumbnailUrl'):
        # Pick fallback image based on tag
        fallback_img = _get_fallback_thumbnail(media.get('tag', ''))
        
        # Update the database with fallback thumbnail
        await featured_media_collection.update_one(
            {"id": media["id"]},
            {"$set": {"thumbnailUrl": fallback_img, "updatedAt": datetime.utcnow()}}
        )
        media['thumbnailUrl'] = fallback_img
    
    # Convert datetime to ISO string for response
    if 'publishedAt' in media and hasattr(media['publishedAt'], 'isoformat'):
        media['publishedAt'] = media['publishedAt'].isoformat()
    
    return FeaturedMediaPublic(**media, sourceName="BANIBS TV")


def _get_fallback_thumbnail(tag: str) -> str:
    """Get appropriate fallback thumbnail based on media tag"""
    tag_lower = tag.lower() if tag else ""
    
    if "youth" in tag_lower:
        return "https://cdn.banibs.com/fallback/youth_video.jpg"
    elif "grant" in tag_lower or "fund" in tag_lower or "opportunit" in tag_lower:
        return "https://cdn.banibs.com/fallback/opportunities_video.jpg"
    elif "business" in tag_lower or "entrepreneur" in tag_lower:
        return "https://cdn.banibs.com/fallback/business_video.jpg"
    elif "education" in tag_lower:
        return "https://cdn.banibs.com/fallback/education_video.jpg"
    elif "community" in tag_lower:
        return "https://cdn.banibs.com/fallback/community_video.jpg"
    else:
        # Generic BANIBS TV fallback
        return "https://cdn.banibs.com/fallback/video_default.jpg"


# ==========================================
# ADMIN ENDPOINTS (Protected by JWT + Role)
# ==========================================

@router.get("/admin/all", response_model=List[FeaturedMediaPublic])
async def get_all_media_admin(current_user: dict = Depends(require_role("super_admin", "moderator"))):
    """
    ADMIN ONLY: Get all featured media items
    Used for admin dashboard media management.
    """
    items = await get_all_featured_media(limit=50)
    
    # Convert datetime to ISO string for each item
    result = []
    for item in items:
        if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
            item['publishedAt'] = item['publishedAt'].isoformat()
        result.append(FeaturedMediaPublic(**item, sourceName="BANIBS TV"))
    
    return result

@router.post("/admin/create")
async def create_media_admin(
    media: FeaturedMediaDB,
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    ADMIN ONLY: Create a new featured media item
    """
    media_dict = media.dict()
    media_id = await create_featured_media(media_dict)
    
    return {
        "success": True,
        "message": "Featured media created successfully",
        "id": media_dict["id"]
    }

@router.patch("/admin/{media_id}/feature")
async def feature_media_admin(
    media_id: str,
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    ADMIN ONLY: Set a media item as featured
    Sets isFeatured=true for specified item and false for all others.
    """
    success = await set_featured_media(media_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Media item not found")
    
    return {
        "success": True,
        "message": f"Media item {media_id} is now featured",
        "featuredId": media_id
    }

@router.delete("/admin/{media_id}")
async def delete_media_admin(
    media_id: str,
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    ADMIN ONLY: Delete a media item
    """
    success = await delete_featured_media(media_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Media item not found")
    
    return {
        "success": True,
        "message": f"Media item {media_id} deleted successfully",
        "deletedId": media_id
    }