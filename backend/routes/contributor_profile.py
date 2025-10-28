from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from models.contributor import ContributorProfile, ContributorProfileUpdate
from db.connection import get_db
from middleware.auth_guard import require_auth, require_role
from datetime import datetime

router = APIRouter(prefix="/contributors", tags=["contributor-profile"])

@router.get("/{contributor_id}/profile", response_model=ContributorProfile)
async def get_contributor_profile(contributor_id: str):
    """
    Public endpoint - Get contributor profile by ID
    """
    db = await get_db()
    
    contributor = await db.contributors.find_one({"_id": contributor_id})
    if not contributor:
        raise HTTPException(status_code=404, detail="Contributor not found")
    
    # Build profile response
    profile = ContributorProfile(
        id=contributor["_id"],
        display_name=contributor.get("display_name") or contributor.get("name", "Anonymous"),
        bio=contributor.get("bio"),
        website_or_social=contributor.get("website_or_social"),
        verified=contributor.get("verified", False),
        total_submissions=contributor.get("total_submissions", 0),
        approved_submissions=contributor.get("approved_submissions", 0),
        featured_submissions=contributor.get("featured_submissions", 0)
    )
    
    return profile

@router.patch("/profile", response_model=ContributorProfile)
async def update_contributor_profile(
    profile_data: ContributorProfileUpdate,
    current_user: dict = Depends(require_auth)
):
    """
    Contributor-only endpoint - Update own profile
    """
    db = await get_db()
    
    # Build update dict (only include fields that were provided)
    update_dict = {"updated_at": datetime.utcnow()}
    if profile_data.display_name is not None:
        update_dict["display_name"] = profile_data.display_name
    if profile_data.bio is not None:
        update_dict["bio"] = profile_data.bio
    if profile_data.website_or_social is not None:
        update_dict["website_or_social"] = profile_data.website_or_social
    
    # Update contributor
    result = await db.contributors.update_one(
        {"_id": current_user["id"]},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contributor not found")
    
    # Fetch updated contributor
    updated_contributor = await db.contributors.find_one({"_id": current_user["id"]})
    
    profile = ContributorProfile(
        id=updated_contributor["_id"],
        display_name=updated_contributor.get("display_name") or updated_contributor.get("name", "Anonymous"),
        bio=updated_contributor.get("bio"),
        website_or_social=updated_contributor.get("website_or_social"),
        verified=updated_contributor.get("verified", False),
        total_submissions=updated_contributor.get("total_submissions", 0),
        approved_submissions=updated_contributor.get("approved_submissions", 0),
        featured_submissions=updated_contributor.get("featured_submissions", 0)
    )
    
    return profile

@router.patch("/{contributor_id}/verify")
async def toggle_contributor_verification(
    contributor_id: str,
    verified: bool,
    current_user: dict = Depends(require_role("admin"))
):
    """
    Admin-only endpoint - Toggle verified status for a contributor
    """
    db = await get_db()
    
    result = await db.contributors.update_one(
        {"_id": contributor_id},
        {
            "$set": {
                "verified": verified,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contributor not found")
    
    return {
        "success": True,
        "contributor_id": contributor_id,
        "verified": verified,
        "message": f"Contributor verification set to {verified}"
    }

# Phase 4.4 - Contributor Leaderboard

@router.get("/leaderboard", response_model=list[ContributorProfile])
async def get_contributor_leaderboard(limit: int = 10):
    """
    Public endpoint - Get top contributors leaderboard
    Sorted by approved_submissions + featured_submissions
    """
    db = await get_db()
    
    # Find contributors with at least 1 approved submission
    # Sort by approved_submissions (descending), then featured_submissions (descending)
    cursor = db.contributors.find({
        "approved_submissions": {"$gt": 0}
    }).sort([
        ("approved_submissions", -1),
        ("featured_submissions", -1)
    ]).limit(limit)
    
    contributors = await cursor.to_list(length=limit)
    
    # Build leaderboard response
    leaderboard = []
    for contributor in contributors:
        leaderboard.append(ContributorProfile(
            id=contributor["_id"],
            display_name=contributor.get("display_name") or contributor.get("name", "Anonymous"),
            bio=contributor.get("bio"),
            website_or_social=contributor.get("website_or_social"),
            verified=contributor.get("verified", False),
            total_submissions=contributor.get("total_submissions", 0),
            approved_submissions=contributor.get("approved_submissions", 0),
            featured_submissions=contributor.get("featured_submissions", 0)
        ))
    
    return leaderboard
