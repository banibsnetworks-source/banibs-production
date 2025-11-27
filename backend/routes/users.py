"""
BANIBS User Search API Routes - Phase 8.1
Handles user search for connections and relationship management
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional

from db.connection import get_db
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/search")
async def search_users(
    query: str = Query(..., min_length=1, description="Search query for name or handle"),
    limit: int = Query(50, ge=1, le=100, description="Maximum results to return"),
    current_user: dict = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Search for users by display name or handle.
    Used for finding people to add to connections.
    
    Returns:
    - id
    - display_name
    - handle
    - location
    - avatar_url
    - headline
    """
    try:
        # Search in unified_users collection
        users = await db.unified_users.find(
            {
                # Exclude current user
                "id": {"$ne": current_user["id"]},
                # Search display_name or handle
                "$or": [
                    {"display_name": {"$regex": query, "$options": "i"}},
                    {"handle": {"$regex": query, "$options": "i"}}
                ]
            },
            {
                "_id": 0,
                "id": 1,
                "display_name": 1,
                "handle": 1,
                "location": 1,
                "avatar_url": 1,
                "headline": 1,
                "profile_photo": 1
            }
        ).limit(limit).to_list(limit)
        
        # Format response
        results = []
        for user in users:
            results.append({
                "id": user.get("id"),
                "display_name": user.get("display_name", "Unknown User"),
                "handle": user.get("handle"),
                "location": user.get("location"),
                "avatar_url": user.get("avatar_url") or user.get("profile_photo"),
                "headline": user.get("headline")
            })
        
        return results
    
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"User search failed: {str(e)}"
        )


@router.get("/{user_id}/public")
async def get_user_public_profile(
    user_id: str,
    db = Depends(get_db)
):
    """
    Get public profile information for a user.
    Used when viewing another user's profile.
    """
    try:
        user = await db.unified_users.find_one(
            {"id": user_id},
            {
                "_id": 0,
                "password_hash": 0,
                "email": 0  # Don't expose email publicly
            }
        )
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch user: {str(e)}"
        )
