"""
Business Directory v2 - API Routes

Public endpoints for BANIBS Business Directory.
Includes computed directions_link in all responses.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional

from models.business_listing import (
    BusinessListingCreate, BusinessListingUpdate, BusinessListingPublic
)
from db.business_listings import (
    create_business_listing,
    get_business_listing_by_id,
    get_all_business_listings,
    update_business_listing,
    delete_business_listing,
    get_listings_by_owner,
    sanitize_listing_response
)
from middleware.auth_guard import get_current_user, require_super_admin

router = APIRouter(prefix="/api/business", tags=["Business Directory"])


@router.get("/directory", response_model=List[BusinessListingPublic])
async def get_business_directory(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    category: Optional[str] = None,
    city: Optional[str] = None,
    state: Optional[str] = None,
    verified_only: bool = False
):
    """
    Get business directory listings
    
    Supports filtering by:
    - category
    - city
    - state
    - verified status
    
    Returns listings with computed directions_link field
    """
    listings = await get_all_business_listings(
        skip=skip,
        limit=limit,
        category=category,
        city=city,
        state=state,
        verified_only=verified_only
    )
    
    # Add computed directions_link to each listing
    return [sanitize_listing_response(listing) for listing in listings]


@router.get("/directory/{listing_id}", response_model=BusinessListingPublic)
async def get_business_listing(listing_id: str):
    """
    Get single business listing by ID
    
    Includes computed directions_link field
    """
    listing = await get_business_listing_by_id(listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Business listing not found"
        )
    
    return sanitize_listing_response(listing)


@router.post("/directory", response_model=BusinessListingPublic)
async def create_listing(
    listing_data: BusinessListingCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create new business listing
    
    Requires authentication
    User becomes the owner of the listing
    """
    listing_id = await create_business_listing(
        owner_id=current_user["id"],
        **listing_data.dict()
    )
    
    listing = await get_business_listing_by_id(listing_id)
    
    return sanitize_listing_response(listing)


@router.patch("/directory/{listing_id}", response_model=BusinessListingPublic)
async def update_listing(
    listing_id: str,
    listing_data: BusinessListingUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update business listing
    
    Only owner or admin can update
    """
    listing = await get_business_listing_by_id(listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Business listing not found"
        )
    
    # Check ownership or admin privileges
    is_owner = listing["owner_id"] == current_user["id"]
    is_admin = "super_admin" in current_user.get("roles", [])
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=403,
            detail="Only the owner or admin can update this listing"
        )
    
    # Update listing
    update_data = listing_data.dict(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields to update"
        )
    
    await update_business_listing(listing_id, update_data)
    
    # Get updated listing
    updated_listing = await get_business_listing_by_id(listing_id)
    
    return sanitize_listing_response(updated_listing)


@router.delete("/directory/{listing_id}")
async def delete_listing(
    listing_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete business listing (soft delete)
    
    Only owner or admin can delete
    """
    listing = await get_business_listing_by_id(listing_id)
    
    if not listing:
        raise HTTPException(
            status_code=404,
            detail="Business listing not found"
        )
    
    # Check ownership or admin privileges
    is_owner = listing["owner_id"] == current_user["id"]
    is_admin = "super_admin" in current_user.get("roles", [])
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=403,
            detail="Only the owner or admin can delete this listing"
        )
    
    await delete_business_listing(listing_id)
    
    return {"message": "Business listing deleted successfully"}


@router.get("/my-listings", response_model=List[BusinessListingPublic])
async def get_my_listings(current_user: dict = Depends(get_current_user)):
    """
    Get all listings owned by current user
    """
    listings = await get_listings_by_owner(current_user["id"])
    
    return [sanitize_listing_response(listing) for listing in listings]


@router.get("/categories")
async def get_business_categories():
    """
    Get list of available business categories
    """
    return {
        "categories": [
            "Food & Beverage",
            "Retail",
            "Professional Services",
            "Technology",
            "Healthcare",
            "Education",
            "Construction",
            "Transportation",
            "Arts & Entertainment",
            "Real Estate",
            "Other"
        ]
    }
