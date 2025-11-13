"""
Business Board Posts Database Operations - Phase 8.3
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
from typing import Optional

from db.connection import get_db


async def create_board_post(
    business_id: str,
    category: str,
    text: str,
    media: Optional[list] = None,
    link_url: Optional[str] = None,
    link_meta: Optional[dict] = None
):
    """Create a new business board post"""
    db = await get_db()
    
    # Verify business exists
    business = await db.business_profiles.find_one(
        {"id": business_id},
        {"_id": 0}
    )
    
    if not business:
        return None
    
    post = {
        "id": str(uuid.uuid4()),
        "business_id": business_id,
        "category": category,
        "text": text,
        "media": media or [],
        "link_url": link_url,
        "link_meta": link_meta,
        "created_at": datetime.now(timezone.utc)
    }
    
    await db.business_board_posts.insert_one(post)
    return post


async def get_board_feed(
    page: int = 1,
    page_size: int = 20,
    category: Optional[str] = None
):
    """Get paginated business board feed"""
    db = await get_db()
    
    skip = (page - 1) * page_size
    
    # Build filter
    filter_query = {}
    if category:
        filter_query["category"] = category
    
    # Get total count
    total_items = await db.business_board_posts.count_documents(filter_query)
    total_pages = (total_items + page_size - 1) // page_size
    
    # Get posts (reverse chronological)
    posts = await db.business_board_posts.find(
        filter_query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(page_size).to_list(length=None)
    
    # Enrich posts with business info
    enriched_posts = []
    for post in posts:
        business = await db.business_profiles.find_one(
            {"id": post["business_id"]},
            {"_id": 0, "id": 1, "name": 1, "logo": 1, "accent_color": 1}
        )
        
        if not business:
            continue
        
        enriched_posts.append({
            **post,
            "business": {
                "id": business["id"],
                "name": business.get("name", "Unknown Business"),
                "logo": business.get("logo"),
                "accent_color": business.get("accent_color", "#d4af37")
            }
        })
    
    return {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "items": enriched_posts
    }


async def get_board_post_by_id(post_id: str):
    """Get a single board post by ID"""
    db = await get_db()
    
    post = await db.business_board_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        return None
    
    # Enrich with business info
    business = await db.business_profiles.find_one(
        {"id": post["business_id"]},
        {"_id": 0, "id": 1, "name": 1, "logo": 1, "accent_color": 1}
    )
    
    if not business:
        return None
    
    return {
        **post,
        "business": {
            "id": business["id"],
            "name": business.get("name", "Unknown Business"),
            "logo": business.get("logo"),
            "accent_color": business.get("accent_color", "#d4af37")
        }
    }


async def delete_board_post(post_id: str, business_id: str):
    """Delete a board post (business owner only)"""
    db = await get_db()
    
    # Verify ownership
    post = await db.business_board_posts.find_one({
        "id": post_id,
        "business_id": business_id
    })
    
    if not post:
        return False
    
    # Delete post
    result = await db.business_board_posts.delete_one({"id": post_id})
    
    return result.deleted_count > 0
