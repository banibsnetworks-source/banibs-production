"""
Peoples System Routes - Phase 8.3
User → User connections
"""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from datetime import datetime

from models.peoples import UserConnection, PeoplesResponse, PeoplesStats
from middleware.auth_guard import require_role
from db.connection import get_db

router = APIRouter(prefix="/api/social/peoples", tags=["peoples"])


@router.post("/{target_user_id}", status_code=status.HTTP_201_CREATED)
async def add_to_peoples(
    target_user_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Add a user to 'My Peoples'
    """
    db = await get_db()
    follower_id = current_user["id"]
    
    # Can't add yourself
    if follower_id == target_user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot add yourself to your peoples"
        )
    
    # Check if target user exists
    target_user = await db.banibs_users.find_one({"id": target_user_id}, {"_id": 0})
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if already in peoples
    existing = await db.user_connections.find_one({
        "follower_user_id": follower_id,
        "target_user_id": target_user_id
    })
    
    if existing:
        return {"message": "Already in your peoples", "status": "exists"}
    
    # Create connection
    connection = UserConnection(
        follower_user_id=follower_id,
        target_user_id=target_user_id
    )
    
    await db.user_connections.insert_one(connection.dict())
    
    return {"message": "Added to your peoples", "status": "added"}


@router.delete("/{target_user_id}", status_code=status.HTTP_200_OK)
async def remove_from_peoples(
    target_user_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Remove a user from 'My Peoples'
    """
    db = await get_db()
    follower_id = current_user["id"]
    
    result = await db.user_connections.delete_one({
        "follower_user_id": follower_id,
        "target_user_id": target_user_id
    })
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not in your peoples"
        )
    
    return {"message": "Removed from your peoples", "status": "removed"}


@router.get("/{user_id}", response_model=List[PeoplesResponse])
async def get_user_peoples(
    user_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Get list of people in a user's peoples
    """
    db = await get_db()
    
    # Get all connections for this user
    connections = await db.user_connections.find(
        {"follower_user_id": user_id}
    ).to_list(500)
    
    if not connections:
        return []
    
    # Get target user IDs
    target_ids = [conn["target_user_id"] for conn in connections]
    
    # Fetch user details
    users = await db.users.find(
        {"id": {"$in": target_ids}},
        {"_id": 0, "id": 1, "name": 1, "avatar_url": 1, "bio": 1}
    ).to_list(500)
    
    # Build response
    result = []
    for user in users:
        # Find when they were added
        conn = next((c for c in connections if c["target_user_id"] == user["id"]), None)
        
        # Check if current user has them in their peoples
        is_in_my_peoples = False
        if current_user["id"] != user_id:
            my_conn = await db.user_connections.find_one({
                "follower_user_id": current_user["id"],
                "target_user_id": user["id"]
            })
            is_in_my_peoples = bool(my_conn)
        
        result.append(PeoplesResponse(
            user_id=user["id"],
            name=user.get("name", "User"),
            avatar_url=user.get("avatar_url"),
            bio=user.get("bio"),
            added_at=conn["created_at"] if conn else datetime.utcnow(),
            is_in_my_peoples=is_in_my_peoples
        ))
    
    return result


@router.get("/{user_id}/stats", response_model=PeoplesStats)
async def get_peoples_stats(
    user_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Get peoples count and check if current user has them in their peoples
    """
    db = await get_db()
    
    # Count peoples
    count = await db.user_connections.count_documents({"follower_user_id": user_id})
    
    # Check if in my peoples
    is_in_my_peoples = False
    if current_user["id"] != user_id:
        conn = await db.user_connections.find_one({
            "follower_user_id": current_user["id"],
            "target_user_id": user_id
        })
        is_in_my_peoples = bool(conn)
    
    return PeoplesStats(
        user_id=user_id,
        peoples_count=count,
        is_in_my_peoples=is_in_my_peoples
    )
