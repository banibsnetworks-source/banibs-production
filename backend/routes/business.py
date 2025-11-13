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


router = APIRouter(prefix="/api/business", tags=["business"])


@router.post("", response_model=BusinessProfileOwner, status_code=status.HTTP_201_CREATED)
async def create_business(
    profile_data: BusinessProfileCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Create a business profile (one per user)
    Requires authentication
    """
    # Convert services to dicts
    services_list = [s.dict() for s in profile_data.services] if profile_data.services else []
    
    profile = await db_business.create_business_profile(
        owner_user_id=current_user["id"],
        name=profile_data.name,
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
            detail="User already has a business profile"
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


@router.get("/{business_id}", response_model=BusinessProfilePublic)
async def get_business(business_id: str):
    """
    Get public business profile by ID
    """
    profile = await db_business.get_business_profile_by_id(business_id)
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business profile not found"
        )
    
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
