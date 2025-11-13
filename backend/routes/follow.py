"""
Follow API Routes - Phase B1
APIs for follow/unfollow functionality
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Literal, Optional

from models.follow import FollowCreate, FollowDelete, FollowStatus
from db.follows import FollowsDB
from db.connection import get_db
from utils.auth import get_current_user


api_router = APIRouter(prefix="/api/follow", tags=["follow"])


@api_router.post("", response_model=FollowStatus)
async def follow_target(
    follow_data: FollowCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Follow a user or business
    
    Request body:
    ```json
    {
        "target_type": "business",
        "target_id": "d7406622-9423-4094-9203-36827c631310"
    }
    ```
    """
    db = await get_db()
    follows_db = FollowsDB(db)
    
    # Create follow relationship
    await follows_db.create_follow(
        follower_type="user",
        follower_id=current_user["id"],
        target_type=follow_data.target_type,
        target_id=follow_data.target_id
    )
    
    # Get follower count
    follower_count = await follows_db.get_follower_count(
        target_type=follow_data.target_type,
        target_id=follow_data.target_id
    )
    
    return FollowStatus(status="following", follower_count=follower_count)


@api_router.delete("", response_model=FollowStatus)
async def unfollow_target(
    follow_data: FollowDelete,
    current_user: dict = Depends(get_current_user)
):
    """
    Unfollow a user or business
    
    Request body:
    ```json
    {
        "target_type": "business",
        "target_id": "d7406622-9423-4094-9203-36827c631310"
    }
    ```
    """
    db = await get_db()
    follows_db = FollowsDB(db)
    
    # Delete follow relationship
    deleted = await follows_db.delete_follow(
        follower_type="user",
        follower_id=current_user["id"],
        target_type=follow_data.target_type,
        target_id=follow_data.target_id
    )
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Follow relationship not found")
    
    # Get updated follower count
    follower_count = await follows_db.get_follower_count(
        target_type=follow_data.target_type,
        target_id=follow_data.target_id
    )
    
    return FollowStatus(status="unfollowed", follower_count=follower_count)


@api_router.get("/following")
async def get_following(
    target_type: Optional[Literal["user", "business"]] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get list of users/businesses that current user follows
    
    Query params:
    - target_type: Optional filter for "user" or "business"
    """
    db = await get_db()
    follows_db = FollowsDB(db)
    
    following = await follows_db.get_following(
        follower_type="user",
        follower_id=current_user["id"],
        target_type=target_type
    )
    
    return {
        "following": following,
        "count": len(following)
    }


@api_router.get("/followers")
async def get_followers(
    target_type: Literal["user", "business"],
    target_id: str,
    follower_type: Optional[Literal["user", "business"]] = None
):
    """
    Get list of followers for a user or business
    
    Query params:
    - target_type: "user" or "business"
    - target_id: ID of the user or business
    - follower_type: Optional filter for follower type
    """
    db = await get_db()
    follows_db = FollowsDB(db)
    
    followers = await follows_db.get_followers(
        target_type=target_type,
        target_id=target_id,
        follower_type=follower_type
    )
    
    return {
        "followers": followers,
        "count": len(followers)
    }


@api_router.get("/status")
async def check_follow_status(
    target_type: Literal["user", "business"],
    target_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Check if current user is following a target
    
    Query params:
    - target_type: "user" or "business"
    - target_id: ID of the user or business
    """
    db = await get_db()
    follows_db = FollowsDB(db)
    
    is_following = await follows_db.is_following(
        follower_type="user",
        follower_id=current_user["id"],
        target_type=target_type,
        target_id=target_id
    )
    
    follower_count = await follows_db.get_follower_count(
        target_type=target_type,
        target_id=target_id
    )
    
    return {
        "is_following": is_following,
        "follower_count": follower_count
    }
