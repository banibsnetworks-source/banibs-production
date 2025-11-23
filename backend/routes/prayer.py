"""
BANIBS Prayer Rooms - API Routes
Phase 11.0
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from uuid import uuid4

from models.prayer import (
    PrayerRoom,
    PrayerPost,
    PrayerPostCreate,
    PrayerPostsResponse,
    AmenCreate
)
from middleware.auth_guard import require_role, get_current_user
from db.prayer import (
    get_active_rooms,
    get_room_by_id,
    get_room_by_slug,
    create_prayer_post,
    get_room_posts,
    get_post_by_id,
    delete_prayer_post,
    create_amen,
    remove_amen,
    user_has_amened,
    enrich_posts_with_user_info
)


router = APIRouter(prefix="/api/prayer", tags=["Prayer Rooms"])


# ============= Room Routes =============

@router.get("/rooms", response_model=List[PrayerRoom])
async def list_prayer_rooms():
    """
    Get all active prayer rooms
    Public endpoint - anyone can see available rooms
    """
    rooms = await get_active_rooms()
    return rooms


@router.get("/rooms/{room_slug}", response_model=PrayerRoom)
async def get_prayer_room(room_slug: str):
    """
    Get a specific prayer room by slug
    """
    room = await get_room_by_slug(room_slug)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prayer room not found"
        )
    return room


# ============= Post Routes =============

@router.get("/rooms/{room_slug}/posts", response_model=PrayerPostsResponse)
async def list_room_posts(
    room_slug: str,
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get recent posts for a prayer room (last 14 days)
    Shows anonymous posts without user info
    """
    # Get room
    room = await get_room_by_slug(room_slug)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prayer room not found"
        )
    
    # Get posts (14-day window)
    posts, total = await get_room_posts(
        room_id=room["id"],
        days_limit=14,
        page=page,
        limit=limit
    )
    
    # Enrich with user info and amen status
    current_user_id = current_user["id"] if current_user else None
    enriched_posts = await enrich_posts_with_user_info(posts, current_user_id)
    
    return {
        "posts": enriched_posts,
        "total": total,
        "room": room
    }


@router.post("/post", response_model=PrayerPost, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: PrayerPostCreate,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Create a new prayer post
    Requires authentication
    Can be posted anonymously (name hidden from others, but user_id stored)
    """
    # Verify room exists
    room = await get_room_by_id(post_data.room_id)
    if not room:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prayer room not found"
        )
    
    # Create post
    post_id = str(uuid4())
    post = await create_prayer_post(
        room_id=post_data.room_id,
        user_id=current_user["id"],
        content=post_data.content,
        anonymous=post_data.anonymous,
        post_id=post_id
    )
    
    # Enrich with user info
    enriched_posts = await enrich_posts_with_user_info([post], current_user["id"])
    
    return enriched_posts[0]


@router.delete("/post/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Delete a prayer post
    Users can only delete their own posts
    Admins can delete any post
    """
    # Get post
    post = await get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prayer post not found"
        )
    
    # Check ownership or admin
    is_admin = "admin" in current_user.get("roles", []) or "moderator" in current_user.get("roles", [])
    is_owner = post["user_id"] == current_user["id"]
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own posts"
        )
    
    # Delete post
    deleted = await delete_prayer_post(post_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete post"
        )


# ============= Amen Routes =============

@router.post("/amen")
async def add_amen(
    amen_data: AmenCreate,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Add an amen to a prayer post
    If user already amened, this will remove the amen (toggle behavior)
    """
    # Verify post exists
    post = await get_post_by_id(amen_data.post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Prayer post not found"
        )
    
    # Check if user already amened
    already_amened = await user_has_amened(amen_data.post_id, current_user["id"])
    
    if already_amened:
        # Remove amen (toggle off)
        await remove_amen(amen_data.post_id, current_user["id"])
        return {
            "message": "Amen removed",
            "amened": False,
            "post_id": amen_data.post_id
        }
    else:
        # Add amen
        amen_id = str(uuid4())
        await create_amen(amen_data.post_id, current_user["id"], amen_id)
        return {
            "message": "Amen added",
            "amened": True,
            "post_id": amen_data.post_id
        }
