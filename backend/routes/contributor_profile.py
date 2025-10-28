from fastapi import APIRouter, HTTPException, Depends
from typing import Optional
from models.contributor import ContributorProfile, ContributorProfileUpdate
from db.connection import get_db
from middleware.auth_guard import require_auth, require_role
from datetime import datetime

router = APIRouter(prefix="/contributors", tags=["contributor-profile"])

@router.get("/{contributor_id}/profile", response_model=ContributorProfile)
async def get_contributor_profile(contributor_id: str, db=Depends(get_db)):
    """
    Public endpoint - Get contributor profile by ID
    Handles both UUID-based 'id' field and ObjectId-based '_id' field
    """
    from bson import ObjectId
    from bson.errors import InvalidId
    
    contributor = None
    
    # Try UUID format first
    contributor = await db.contributors.find_one({"id": contributor_id})
    
    # If not found and looks like ObjectId (24 hex chars), try ObjectId
    if not contributor and len(contributor_id) == 24:
        try:
            contributor = await db.contributors.find_one({"_id": ObjectId(contributor_id)})
        except InvalidId:
            pass
    
    if not contributor:
        raise HTTPException(status_code=404, detail="Contributor not found")
    
    # Use 'id' field if available, otherwise use '_id'
    contributor_id_value = contributor.get("id") or str(contributor.get("_id"))
    
    # Build profile response (handle both camelCase and snake_case field names)
    profile = ContributorProfile(
        id=contributor_id_value,
        display_name=contributor.get("displayName") or contributor.get("display_name") or contributor.get("name", "Anonymous"),
        bio=contributor.get("bio"),
        website_or_social=contributor.get("websiteOrSocial") or contributor.get("website_or_social"),
        verified=contributor.get("verified", False),
        total_submissions=contributor.get("totalSubmissions") or contributor.get("total_submissions", 0),
        approved_submissions=contributor.get("approvedSubmissions") or contributor.get("approved_submissions", 0),
        featured_submissions=contributor.get("featuredSubmissions") or contributor.get("featured_submissions", 0)
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
        update_dict["displayName"] = profile_data.display_name
        update_dict["display_name"] = profile_data.display_name  # Support both snake_case and camelCase
    if profile_data.bio is not None:
        update_dict["bio"] = profile_data.bio
    if profile_data.website_or_social is not None:
        update_dict["websiteOrSocial"] = profile_data.website_or_social
        update_dict["website_or_social"] = profile_data.website_or_social  # Support both
    
    # Update contributor - try by 'id' first, then '_id'
    result = await db.contributors.update_one(
        {"id": current_user["id"]},
        {"$set": update_dict}
    )
    
    if result.matched_count == 0:
        # Try by _id if id didn't match
        try:
            from bson import ObjectId
            result = await db.contributors.update_one(
                {"_id": ObjectId(current_user["id"])},
                {"$set": update_dict}
            )
        except:
            pass
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Contributor not found")
    
    # Fetch updated contributor
    updated_contributor = await db.contributors.find_one({"id": current_user["id"]})
    if not updated_contributor:
        try:
            from bson import ObjectId
            updated_contributor = await db.contributors.find_one({"_id": ObjectId(current_user["id"])})
        except:
            pass
    
    contributor_id_value = updated_contributor.get("id") or str(updated_contributor.get("_id"))
    
    profile = ContributorProfile(
        id=contributor_id_value,
        display_name=updated_contributor.get("displayName") or updated_contributor.get("display_name") or updated_contributor.get("name", "Anonymous"),
        bio=updated_contributor.get("bio"),
        website_or_social=updated_contributor.get("websiteOrSocial") or updated_contributor.get("website_or_social"),
        verified=updated_contributor.get("verified", False),
        total_submissions=updated_contributor.get("totalSubmissions") or updated_contributor.get("total_submissions", 0),
        approved_submissions=updated_contributor.get("approvedSubmissions") or updated_contributor.get("approved_submissions", 0),
        featured_submissions=updated_contributor.get("featuredSubmissions") or updated_contributor.get("featured_submissions", 0)
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
