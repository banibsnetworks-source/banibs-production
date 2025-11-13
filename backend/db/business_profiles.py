"""
Business Profiles Database Operations - Phase 8.2
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
from typing import Optional

from db.connection import get_db


async def create_business_profile(owner_user_id: str, name: str, handle: str, **kwargs):
    """Create a new business profile with unique handle"""
    db = await get_db()
    
    # Check if user already has a business profile
    existing = await db.business_profiles.find_one(
        {"owner_user_id": owner_user_id},
        {"_id": 0}
    )
    
    if existing:
        return None  # User already has a business profile
    
    # Check if handle is already taken
    handle_taken = await db.business_profiles.find_one(
        {"handle": handle},
        {"_id": 0}
    )
    
    if handle_taken:
        return None  # Handle already in use
    
    profile = {
        "id": str(uuid.uuid4()),
        "owner_user_id": owner_user_id,
        "name": name,
        "handle": handle,
        "tagline": kwargs.get("tagline"),
        "bio": kwargs.get("bio"),
        "logo": kwargs.get("logo"),
        "cover": kwargs.get("cover"),
        "accent_color": kwargs.get("accent_color", "#d4af37"),
        "website": kwargs.get("website"),
        "email": kwargs.get("email"),
        "phone": kwargs.get("phone"),
        "location": kwargs.get("location"),
        "services": kwargs.get("services", []),
        "verified_status": False,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.business_profiles.insert_one(profile)
    return profile


async def get_business_profile_by_id(business_id: str):
    """Get business profile by ID"""
    db = await get_db()
    
    profile = await db.business_profiles.find_one(
        {"id": business_id},
        {"_id": 0}
    )
    
    return profile


async def get_business_profile_by_owner(owner_user_id: str):
    """Get business profile by owner user ID"""
    db = await get_db()
    
    profile = await db.business_profiles.find_one(
        {"owner_user_id": owner_user_id},
        {"_id": 0}
    )
    
    return profile


async def update_business_profile(business_id: str, owner_user_id: str, **updates):
    """Update business profile (owner only)"""
    db = await get_db()
    
    # Verify ownership
    profile = await db.business_profiles.find_one(
        {"id": business_id, "owner_user_id": owner_user_id},
        {"_id": 0}
    )
    
    if not profile:
        return None  # Profile not found or not owned by user
    
    # Build update dict (only include non-None values)
    update_dict = {
        "updated_at": datetime.now(timezone.utc)
    }
    
    for key, value in updates.items():
        if value is not None:
            update_dict[key] = value
    
    # Update profile
    await db.business_profiles.update_one(
        {"id": business_id},
        {"$set": update_dict}
    )
    
    # Return updated profile
    updated_profile = await db.business_profiles.find_one(
        {"id": business_id},
        {"_id": 0}
    )
    
    return updated_profile


async def get_business_profile_by_handle(handle: str):
    """Get business profile by handle"""
    db = await get_db()
    
    profile = await db.business_profiles.find_one(
        {"handle": handle},
        {"_id": 0}
    )
    
    return profile


async def is_handle_available(handle: str, exclude_business_id: Optional[str] = None):
    """Check if a handle is available"""
    db = await get_db()
    
    query = {"handle": handle}
    if exclude_business_id:
        query["id"] = {"$ne": exclude_business_id}
    
    existing = await db.business_profiles.find_one(query, {"_id": 0})
    return existing is None


async def get_all_handles():
    """Get list of all existing handles (for uniqueness checking)"""
    db = await get_db()
    
    cursor = db.business_profiles.find({}, {"handle": 1, "_id": 0})
    profiles = await cursor.to_list(length=10000)
    return [p["handle"] for p in profiles if "handle" in p]


async def delete_business_profile(business_id: str, owner_user_id: str):
    """Delete business profile (owner only)"""
    db = await get_db()
    
    # Verify ownership
    profile = await db.business_profiles.find_one(
        {"id": business_id, "owner_user_id": owner_user_id}
    )
    
    if not profile:
        return False  # Profile not found or not owned by user
    
    # Delete profile
    result = await db.business_profiles.delete_one({"id": business_id})
    
    return result.deleted_count > 0


async def list_business_profiles(page: int = 1, page_size: int = 20, search: Optional[str] = None):
    """List business profiles with pagination and optional search"""
    db = await get_db()
    
    skip = (page - 1) * page_size
    
    # Build filter
    filter_query = {}
    if search:
        filter_query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"tagline": {"$regex": search, "$options": "i"}},
            {"bio": {"$regex": search, "$options": "i"}},
            {"location": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total_items = await db.business_profiles.count_documents(filter_query)
    total_pages = (total_items + page_size - 1) // page_size
    
    # Get profiles
    profiles = await db.business_profiles.find(
        filter_query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(page_size).to_list(length=None)
    
    return {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "items": profiles
    }
