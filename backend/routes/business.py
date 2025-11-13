"""
Business Profile Routes - Phase 8.2
Business accounts and identity management
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import Optional

from models.business_profile import (
    BusinessProfileCreate,
    BusinessProfileUpdate,
    BusinessProfilePublic,
    BusinessProfileOwner
)
from middleware.auth_guard import require_role
from db import business_profiles as db_business
from db.business_members import BusinessMembersDB
from db.follows import FollowsDB
from db.connection import get_db
from utils.handle_generator import generate_handle, validate_handle, make_handle_unique


router = APIRouter(prefix="/api/business", tags=["business"])


@router.post("", response_model=BusinessProfileOwner, status_code=status.HTTP_201_CREATED)
async def create_business(
    profile_data: BusinessProfileCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Create a business profile (one per user)
    Requires authentication
    
    Handle generation:
    - If handle provided, validate and check uniqueness
    - If not provided, auto-generate from business name
    """
    db = await get_db()
    
    # Generate or validate handle
    if profile_data.handle:
        # User provided a handle - validate it
        is_valid, error_msg = validate_handle(profile_data.handle)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )
        
        # Check if handle is available
        handle_available = await db_business.is_handle_available(profile_data.handle)
        if not handle_available:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Handle '{profile_data.handle}' is already taken"
            )
        
        handle = profile_data.handle
    else:
        # Auto-generate handle from business name
        base_handle = generate_handle(profile_data.name)
        existing_handles = await db_business.get_all_handles()
        handle = make_handle_unique(base_handle, existing_handles)
    
    # Convert services to dicts
    services_list = [s.dict() for s in profile_data.services] if profile_data.services else []
    
    # Create business profile
    profile = await db_business.create_business_profile(
        owner_user_id=current_user["id"],
        name=profile_data.name,
        handle=handle,
        tagline=profile_data.tagline,
        bio=profile_data.bio,
        website=profile_data.website,
        email=profile_data.email,
        phone=profile_data.phone,
        location=profile_data.location,
        services=services_list
    )
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="User already has a business profile or handle is taken"
        )
    
    # Create BusinessMember record with owner role
    members_db = BusinessMembersDB(db)
    await members_db.create_member(
        business_id=profile["id"],
        user_id=current_user["id"],
        role="owner",
        status="active"
    )
    
    return profile


@router.get("/me", response_model=BusinessProfileOwner)
async def get_my_business(
    current_user=Depends(require_role("user", "member"))
):
    """
    Get current user's business profile
    """
    profile = await db_business.get_business_profile_by_owner(current_user["id"])
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found"
        )
    
    return profile


async def get_current_user_optional():
    """Optional authentication - returns None if not authenticated"""
    try:
        from middleware.auth_guard import get_current_user
        user = await get_current_user()
        return user
    except:
        return None


@router.get("/{handle_or_id}", response_model=BusinessProfilePublic)
async def get_business(
    handle_or_id: str,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get public business profile by handle or ID
    
    Includes:
    - Follower count
    - Whether current user follows this business (if authenticated)
    """
    # Try to get by handle first, then by ID
    profile = await db_business.get_business_profile_by_handle(handle_or_id)
    if not profile:
        profile = await db_business.get_business_profile_by_id(handle_or_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found"
        )
    
    # Get follow data
    db = await get_db()
    follows_db = FollowsDB(db)
    
    # Get follower count
    follower_count = await follows_db.get_follower_count(
        target_type="business",
        target_id=profile["id"]
    )
    profile["follower_count"] = follower_count
    
    # Check if current user follows this business
    if current_user:
        is_following = await follows_db.is_following(
            follower_type="user",
            follower_id=current_user["id"],
            target_type="business",
            target_id=profile["id"]
        )
        profile["is_following"] = is_following
    else:
        profile["is_following"] = False
    
    return profile


@router.patch("/{business_id}", response_model=BusinessProfileOwner)
async def update_business(
    business_id: str,
    profile_data: BusinessProfileUpdate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Update business profile (owner only)
    """
    # Convert services to dicts if provided
    updates = profile_data.dict(exclude_unset=True)
    if "services" in updates and updates["services"] is not None:
        updates["services"] = [s if isinstance(s, dict) else s.dict() for s in updates["services"]]
    
    profile = await db_business.update_business_profile(
        business_id=business_id,
        owner_user_id=current_user["id"],
        **updates
    )
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found or you are not the owner"
        )
    
    return profile


@router.delete("/{business_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_business(
    business_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Delete business profile (owner only)
    """
    deleted = await db_business.delete_business_profile(
        business_id=business_id,
        owner_user_id=current_user["id"]
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found or you are not the owner"
        )
    
    return None


@router.get("", response_model=dict)
async def list_businesses(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=50, description="Items per page"),
    search: Optional[str] = Query(None, description="Search query")
):
    """
    List business profiles with pagination and search
    """
    return await db_business.list_business_profiles(
        page=page,
        page_size=page_size,
        search=search
    )
