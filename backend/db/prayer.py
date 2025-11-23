"""
BANIBS Prayer Rooms - Database Operations
Phase 11.0
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
from typing import Optional, List
from db.connection import get_db_client


# ============= Prayer Rooms =============

async def get_active_rooms() -> List[dict]:
    """Get all active prayer rooms"""
    db = get_db_client()
    rooms = await db.prayer_rooms.find(
        {"is_active": True},
        {"_id": 0}
    ).sort("created_at", 1).to_list(length=100)
    return rooms


async def get_room_by_id(room_id: str) -> Optional[dict]:
    """Get a prayer room by ID"""
    db = get_db_client()
    room = await db.prayer_rooms.find_one(
        {"id": room_id},
        {"_id": 0}
    )
    return room


async def get_room_by_slug(slug: str) -> Optional[dict]:
    """Get a prayer room by slug"""
    db = get_db_client()
    room = await db.prayer_rooms.find_one(
        {"slug": slug, "is_active": True},
        {"_id": 0}
    )
    return room


# ============= Prayer Posts =============

async def create_prayer_post(
    room_id: str,
    user_id: str,
    content: str,
    anonymous: bool,
    post_id: str
) -> dict:
    """Create a new prayer post"""
    db = get_db_client()
    
    now = datetime.now(timezone.utc)
    post = {
        "id": post_id,
        "room_id": room_id,
        "user_id": user_id,
        "content": content,
        "anonymous": anonymous,
        "amen_count": 0,
        "created_at": now
    }
    
    await db.prayer_posts.insert_one(post)
    return post


async def get_room_posts(
    room_id: str,
    days_limit: int = 14,
    page: int = 1,
    limit: int = 50
) -> tuple[List[dict], int]:
    """
    Get recent posts for a room (last 14 days by default)
    Returns (posts, total_count)
    """
    db = get_db_client()
    
    # Calculate cutoff date
    cutoff_date = datetime.now(timezone.utc) - timedelta(days=days_limit)
    
    query = {
        "room_id": room_id,
        "created_at": {"$gte": cutoff_date}
    }
    
    # Count total
    total = await db.prayer_posts.count_documents(query)
    
    # Fetch posts (sorted by most recent first)
    skip = (page - 1) * limit
    posts = await db.prayer_posts.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return posts, total


async def get_post_by_id(post_id: str) -> Optional[dict]:
    """Get a prayer post by ID"""
    db = get_db_client()
    post = await db.prayer_posts.find_one(
        {"id": post_id},
        {"_id": 0}
    )
    return post


async def delete_prayer_post(post_id: str) -> bool:
    """Delete a prayer post"""
    db = get_db_client()
    result = await db.prayer_posts.delete_one({"id": post_id})
    return result.deleted_count > 0


async def increment_amen_count(post_id: str) -> None:
    """Increment the amen count for a post"""
    db = get_db_client()
    await db.prayer_posts.update_one(
        {"id": post_id},
        {"$inc": {"amen_count": 1}}
    )


async def decrement_amen_count(post_id: str) -> None:
    """Decrement the amen count for a post"""
    db = get_db_client()
    await db.prayer_posts.update_one(
        {"id": post_id},
        {"$inc": {"amen_count": -1}}
    )


# ============= Amens =============

async def create_amen(post_id: str, user_id: str, amen_id: str) -> dict:
    """Add an amen to a post"""
    db = get_db_client()
    
    now = datetime.now(timezone.utc)
    amen = {
        "id": amen_id,
        "post_id": post_id,
        "user_id": user_id,
        "created_at": now
    }
    
    await db.prayer_amens.insert_one(amen)
    await increment_amen_count(post_id)
    
    return amen


async def remove_amen(post_id: str, user_id: str) -> bool:
    """Remove user's amen from a post"""
    db = get_db_client()
    
    result = await db.prayer_amens.delete_one({
        "post_id": post_id,
        "user_id": user_id
    })
    
    if result.deleted_count > 0:
        await decrement_amen_count(post_id)
        return True
    return False


async def user_has_amened(post_id: str, user_id: str) -> bool:
    """Check if user has already amened a post"""
    db = get_db_client()
    amen = await db.prayer_amens.find_one({
        "post_id": post_id,
        "user_id": user_id
    })
    return amen is not None


async def get_user_amened_posts(post_ids: List[str], user_id: str) -> set:
    """
    Get set of post IDs that user has amened
    Used to mark posts in bulk fetches
    """
    db = get_db_client()
    amens = await db.prayer_amens.find(
        {
            "post_id": {"$in": post_ids},
            "user_id": user_id
        },
        {"_id": 0, "post_id": 1}
    ).to_list(length=len(post_ids))
    
    return {amen["post_id"] for amen in amens}


# ============= User Info Helpers =============

async def enrich_posts_with_user_info(posts: List[dict], current_user_id: Optional[str] = None) -> List[dict]:
    """
    Enrich posts with author info (if not anonymous)
    and user_has_amened flag (if current_user provided)
    """
    db = get_db_client()
    
    # Get unique user IDs (only for non-anonymous posts)
    user_ids = [p["user_id"] for p in posts if not p.get("anonymous", False)]
    
    # Fetch user info
    users = {}
    if user_ids:
        user_docs = await db.banibs_users.find(
            {"id": {"$in": user_ids}},
            {"_id": 0, "id": 1, "first_name": 1, "last_name": 1, "profile_picture_url": 1}
        ).to_list(length=len(user_ids))
        
        users = {u["id"]: u for u in user_docs}
    
    # Get amened posts for current user
    amened_post_ids = set()
    if current_user_id:
        post_ids = [p["id"] for p in posts]
        amened_post_ids = await get_user_amened_posts(post_ids, current_user_id)
    
    # Enrich posts
    enriched = []
    for post in posts:
        enriched_post = post.copy()
        
        # Add user info if not anonymous
        if not post.get("anonymous", False):
            user = users.get(post["user_id"])
            if user:
                enriched_post["author_name"] = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                enriched_post["author_avatar"] = user.get("profile_picture_url")
        
        # Add user_has_amened flag
        if current_user_id:
            enriched_post["user_has_amened"] = post["id"] in amened_post_ids
        
        enriched.append(enriched_post)
    
    return enriched
