"""
Business Support Routes - Phase 8.3
User → Business support system
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime

from models.business_support import (
    BusinessSupport,
    SupporterResponse,
    BusinessSupportStats,
    SupportedBusinessResponse
)
from middleware.auth_guard import require_role
from db.connection import get_db

router = APIRouter(prefix="/api/business", tags=["business-support"])


@router.post("/{business_id}/support", status_code=status.HTTP_201_CREATED)
async def support_business(
    business_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Support a Black-owned business
    """
    db = await get_db()
    user_id = current_user["id"]
    
    # Check if business exists
    business = await db.business_profiles.find_one({"id": business_id}, {"_id": 0})
    if not business:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Business not found"
        )
    
    # Check if already supporting
    existing = await db.business_supports.find_one({
        "user_id": user_id,
        "business_id": business_id
    })
    
    if existing:
        return {"message": "Already supporting this business", "status": "exists"}
    
    # Create support
    support = BusinessSupport(
        user_id=user_id,
        business_id=business_id
    )
    
    await db.business_supports.insert_one(support.dict())
    
    return {"message": "Now supporting this business", "status": "added"}


@router.delete("/{business_id}/support", status_code=status.HTTP_200_OK)
async def unsupport_business(
    business_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Remove support from a business
    """
    db = await get_db()
    user_id = current_user["id"]
    
    result = await db.business_supports.delete_one({
        "user_id": user_id,
        "business_id": business_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not supporting this business"
        )
    
    return {"message": "Support removed", "status": "removed"}


@router.get("/{business_id}/supporters", response_model=List[SupporterResponse])
async def get_business_supporters(
    business_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Get list of users supporting a business
    """
    db = await get_db()
    
    # Get all supports for this business
    supports = await db.business_supports.find(
        {"business_id": business_id}
    ).to_list(1000)
    
    if not supports:
        return []
    
    # Get user IDs
    user_ids = [sup["user_id"] for sup in supports]
    
    # Fetch user details
    users = await db.users.find(
        {"id": {"$in": user_ids}},
        {"_id": 0, "id": 1, "name": 1, "avatar_url": 1}
    ).to_list(1000)
    
    # Build response
    result = []
    for user in users:
        # Find when they started supporting
        support = next((s for s in supports if s["user_id"] == user["id"]), None)
        
        result.append(SupporterResponse(
            user_id=user["id"],
            name=user.get("name", "User"),
            avatar_url=user.get("avatar_url"),
            supported_at=support["created_at"] if support else datetime.utcnow()
        ))
    
    return result


@router.get("/{business_id}/support/stats", response_model=BusinessSupportStats)
async def get_business_support_stats(
    business_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Get support count and check if current user supports this business
    """
    db = await get_db()
    
    # Count supporters
    count = await db.business_supports.count_documents({"business_id": business_id})
    
    # Check if I support this business
    is_supported = False
    support = await db.business_supports.find_one({
        "user_id": current_user["id"],
        "business_id": business_id
    })
    is_supported = bool(support)
    
    return BusinessSupportStats(
        business_id=business_id,
        supporters_count=count,
        is_supported=is_supported
    )


@router.get("/user/{user_id}/supported-businesses", response_model=List[SupportedBusinessResponse])
async def get_user_supported_businesses(
    user_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Get list of businesses a user supports
    """
    db = await get_db()
    
    # Get all businesses this user supports
    supports = await db.business_supports.find(
        {"user_id": user_id}
    ).to_list(1000)
    
    if not supports:
        return []
    
    # Get business IDs
    business_ids = [sup["business_id"] for sup in supports]
    
    # Fetch business details
    businesses = await db.business_profiles.find(
        {"id": {"$in": business_ids}},
        {"_id": 0, "id": 1, "name": 1, "logo": 1, "industry": 1, "city": 1, "state": 1}
    ).to_list(1000)
    
    # Build response
    result = []
    for business in businesses:
        # Find when they started supporting
        support = next((s for s in supports if s["business_id"] == business["id"]), None)
        
        result.append(SupportedBusinessResponse(
            business_id=business["id"],
            name=business.get("name", "Business"),
            logo=business.get("logo"),
            industry=business.get("industry"),
            city=business.get("city"),
            state=business.get("state"),
            supported_at=support["created_at"] if support else datetime.utcnow()
        ))
    
    return result
