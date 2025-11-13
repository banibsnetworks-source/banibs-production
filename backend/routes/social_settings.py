"""
BANIBS Social Settings Routes - Phase 10.0
API endpoints for user settings and preferences
"""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone

from db.connection import get_db_client
from middleware.auth_guard import get_current_user


router = APIRouter(prefix="/api/social/settings", tags=["social-settings"])


class SocialSettingsUpdate(BaseModel):
    """Settings update payload"""
    left_rail_collapsed: Optional[bool] = None
    theme: Optional[str] = None  # "dark" | "light" | "system"
    autoplay: Optional[str] = None  # "always" | "wifi_only" | "off"
    media_quality: Optional[str] = None  # "auto" | "data_saver" | "high"
    captions_default: Optional[bool] = None


@router.get("")
async def get_my_settings(current_user: dict = Depends(get_current_user)):
    """
    Get the authenticated user's settings
    """
    db = get_db_client()
    user_doc = await db.banibs_users.find_one(
        {"id": current_user["id"]},
        {"_id": 0, "settings": 1}
    )
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Return settings with defaults
    settings = user_doc.get("settings", {}) or {}
    return {
        "left_rail_collapsed": settings.get("left_rail_collapsed", False),
        "theme": settings.get("theme", "dark"),
        "autoplay": settings.get("autoplay", True),
        "media_quality": settings.get("media_quality", "auto"),
        "captions_default": settings.get("captions_default", False)
    }


@router.patch("")
async def update_my_settings(
    data: SocialSettingsUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the authenticated user's settings
    Only updates fields that are provided
    """
    db = get_db_client()
    
    # Build update document
    update_doc = {}
    
    if data.left_rail_collapsed is not None:
        update_doc["settings.left_rail_collapsed"] = data.left_rail_collapsed
    if data.theme is not None:
        update_doc["settings.theme"] = data.theme
    if data.autoplay is not None:
        update_doc["settings.autoplay"] = data.autoplay
    if data.media_quality is not None:
        update_doc["settings.media_quality"] = data.media_quality
    if data.captions_default is not None:
        update_doc["settings.captions_default"] = data.captions_default
    
    if not update_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No settings to update"
        )
    
    # Add updated timestamp
    update_doc["settings.updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # Update user document
    result = await db.banibs_users.update_one(
        {"id": current_user["id"]},
        {"$set": update_doc}
    )
    
    if result.matched_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Fetch and return updated settings
    user_doc = await db.banibs_users.find_one(
        {"id": current_user["id"]},
        {"_id": 0, "settings": 1}
    )
    
    settings = user_doc.get("settings", {}) or {}
    return {
        "left_rail_collapsed": settings.get("left_rail_collapsed", False),
        "theme": settings.get("theme", "dark"),
        "autoplay": settings.get("autoplay", True),
        "media_quality": settings.get("media_quality", "auto"),
        "captions_default": settings.get("captions_default", False)
    }
