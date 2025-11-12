"""
BANIBS Social Profile Routes - Phase 9.0
API endpoints for user profile management
"""

from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from typing import Optional

from db.connection import get_db_client
from models.social_profile import SocialProfile, SocialProfileUpdate, SocialProfileResponse
from middleware.auth_guard import get_current_user


router = APIRouter(prefix="/api/social/profile", tags=["social-profile"])


def get_profile_from_user_doc(user_doc: dict) -> dict:
    """Extract profile data from user document"""
    profile = user_doc.get("profile", {}) or {}
    return {
        "user_id": user_doc.get("id"),
        "display_name": user_doc.get("name") or profile.get("display_name") or "BANIBS Member",
        "handle": profile.get("handle"),
        "avatar_url": profile.get("avatar_url"),
        "headline": profile.get("headline"),
        "bio": profile.get("bio"),
        "location": profile.get("location"),
        "interests": profile.get("interests", []),
        "is_public": profile.get("is_public", True),
        "joined_at": user_doc.get("created_at"),
    }


@router.get("/me", response_model=SocialProfileResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Get the authenticated user's profile
    """
    db = get_db_client()
    user_doc = await db.banibs_users.find_one({"id": current_user["id"]}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    profile_data = get_profile_from_user_doc(user_doc)
    
    # Get post count
    post_count = await db.social_posts.count_documents({
        "author_id": current_user["id"],
        "is_deleted": False
    })
    profile_data["post_count"] = post_count
    
    return SocialProfileResponse(**profile_data)


@router.patch("/me", response_model=SocialProfileResponse)
async def update_my_profile(
    data: SocialProfileUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update the authenticated user's profile
    """
    db = get_db_client()
    user_doc = await db.banibs_users.find_one({"id": current_user["id"]}, {"_id": 0})
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if handle is already taken (if updating handle)
    if data.handle:
        existing_handle = await db.banibs_users.find_one({
            "profile.handle": data.handle,
            "id": {"$ne": current_user["id"]}
        })
        if existing_handle:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Handle @{data.handle} is already taken"
            )
    
    # Get existing profile
    profile = user_doc.get("profile", {}) or {}
    
    # Update fields
    update_dict = data.dict(exclude_unset=True)
    profile.update(update_dict)
    profile["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    # If created_at doesn't exist, add it
    if "created_at" not in profile:
        profile["created_at"] = datetime.now(timezone.utc).isoformat()
    
    # Keep display_name in root for backward compatibility
    root_name = user_doc.get("name")
    if "display_name" in update_dict:
        root_name = update_dict["display_name"]
    
    # Update database
    await db.banibs_users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "name": root_name,
                "profile": profile,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    # Return updated profile
    updated_user = await db.banibs_users.find_one({"id": current_user["id"]}, {"_id": 0})
    profile_data = get_profile_from_user_doc(updated_user)
    
    # Get post count
    post_count = await db.social_posts.count_documents({
        "author_id": current_user["id"],
        "is_deleted": False
    })
    profile_data["post_count"] = post_count
    
    return SocialProfileResponse(**profile_data)


@router.get("/u/{handle}", response_model=SocialProfileResponse)
async def get_profile_by_handle(handle: str):
    """
    Get a user's public profile by their handle
    """
    db = get_db_client()
    user_doc = await db.banibs_users.find_one(
        {
            "profile.handle": handle,
            "profile.is_public": True
        },
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found or not public"
        )
    
    profile_data = get_profile_from_user_doc(user_doc)
    
    # Get post count
    post_count = await db.social_posts.count_documents({
        "author_id": user_doc.get("id"),
        "is_deleted": False
    })
    profile_data["post_count"] = post_count
    
    return SocialProfileResponse(**profile_data)


@router.get("/id/{user_id}", response_model=SocialProfileResponse)
async def get_profile_by_user_id(user_id: str):
    """
    Get a user's public profile by their user ID
    Fallback for when handle is not available
    """
    db = get_db_client()
    user_doc = await db.banibs_users.find_one(
        {
            "id": user_id,
            "profile.is_public": True
        },
        {"_id": 0}
    )
    
    if not user_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found or not public"
        )
    
    profile_data = get_profile_from_user_doc(user_doc)
    
    # Get post count
    post_count = await db.social_posts.count_documents({
        "author_id": user_id,
        "is_deleted": False
    })
    profile_data["post_count"] = post_count
    
    return SocialProfileResponse(**profile_data)
