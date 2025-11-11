"""
Social Posts Database Operations - Phase 8.3
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
from typing import Optional

from db.connection import get_db


async def create_post(author_id: str, text: str, media_url: Optional[str] = None):
    """Create a new social post with default moderation fields (Phase 8.3.1)"""
    db = await get_db()
    
    post = {
        "id": str(uuid.uuid4()),
        "author_id": author_id,
        "text": text,
        "media_url": media_url,
        "visibility": "members",
        "like_count": 0,
        "comment_count": 0,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        # Phase 8.3.1 - Moderation fields
        "is_deleted": False,
        "is_hidden": False,
        "moderation_status": "ok",  # "ok" | "flagged" | "under_review" | "hidden"
        "moderation_reason": None,
        "moderation_updated_at": None
    }
    
    await db.social_posts.insert_one(post)
    return post


async def get_feed(page: int = 1, page_size: int = 20, viewer_id: Optional[str] = None):
    """Get paginated social feed"""
    db = await get_db()
    
    skip = (page - 1) * page_size
    
    # Get total count
    total_items = await db.social_posts.count_documents({})
    total_pages = (total_items + page_size - 1) // page_size
    
    # Get posts (reverse chronological)
    posts = await db.social_posts.find(
        {},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(page_size).to_list(length=None)
    
    # Enrich posts with author info and viewer like status
    enriched_posts = []
    for post in posts:
        author = await db.banibs_users.find_one(
            {"id": post["author_id"]},
            {"_id": 0, "id": 1, "name": 1, "avatar_url": 1}
        )
        
        if not author:
            continue
        
        # Check if viewer has liked
        viewer_has_liked = False
        if viewer_id:
            like = await db.social_reactions.find_one({
                "post_id": post["id"],
                "user_id": viewer_id
            })
            viewer_has_liked = like is not None
        
        enriched_posts.append({
            **post,
            "author": {
                "id": author["id"],
                "display_name": author.get("name", "Unknown User"),
                "avatar_url": author.get("avatar_url")
            },
            "viewer_has_liked": viewer_has_liked
        })
    
    return {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "items": enriched_posts
    }


async def get_post_by_id(post_id: str, viewer_id: Optional[str] = None):
    """Get a single post by ID"""
    db = await get_db()
    
    post = await db.social_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        return None
    
    # Enrich with author
    author = await db.banibs_users.find_one(
        {"id": post["author_id"]},
        {"_id": 0, "id": 1, "name": 1, "avatar_url": 1}
    )
    
    if not author:
        return None
    
    # Check viewer like status
    viewer_has_liked = False
    if viewer_id:
        like = await db.social_reactions.find_one({
            "post_id": post_id,
            "user_id": viewer_id
        })
        viewer_has_liked = like is not None
    
    return {
        **post,
        "author": {
            "id": author["id"],
            "display_name": author.get("name", "Unknown User"),
            "avatar_url": author.get("avatar_url")
        },
        "viewer_has_liked": viewer_has_liked
    }


async def toggle_like(post_id: str, user_id: str):
    """Toggle like on a post"""
    db = await get_db()
    
    # Check if already liked
    existing_like = await db.social_reactions.find_one({
        "post_id": post_id,
        "user_id": user_id
    })
    
    if existing_like:
        # Unlike
        await db.social_reactions.delete_one({
            "post_id": post_id,
            "user_id": user_id
        })
        await db.social_posts.update_one(
            {"id": post_id},
            {"$inc": {"like_count": -1}}
        )
        liked = False
    else:
        # Like
        await db.social_reactions.insert_one({
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "user_id": user_id,
            "created_at": datetime.now(timezone.utc)
        })
        await db.social_posts.update_one(
            {"id": post_id},
            {"$inc": {"like_count": 1}}
        )
        liked = True
    
    # Get updated like count
    post = await db.social_posts.find_one({"id": post_id}, {"_id": 0, "like_count": 1})
    like_count = post["like_count"] if post else 0
    
    return {"liked": liked, "like_count": like_count}


async def create_comment(post_id: str, author_id: str, text: str):
    """Create a comment on a post"""
    db = await get_db()
    
    comment = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "author_id": author_id,
        "text": text,
        "is_deleted": False,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.social_comments.insert_one(comment)
    
    # Increment comment count on post
    await db.social_posts.update_one(
        {"id": post_id},
        {"$inc": {"comment_count": 1}}
    )
    
    return comment


async def get_comments(post_id: str, page: int = 1, page_size: int = 20):
    """Get comments for a post"""
    db = await get_db()
    
    skip = (page - 1) * page_size
    
    # Get total count (excluding deleted)
    total_items = await db.social_comments.count_documents({
        "post_id": post_id,
        "is_deleted": False
    })
    
    # Get comments
    comments = await db.social_comments.find(
        {"post_id": post_id, "is_deleted": False},
        {"_id": 0}
    ).sort("created_at", 1).skip(skip).limit(page_size).to_list(length=None)
    
    # Enrich with author info
    enriched_comments = []
    for comment in comments:
        author = await db.banibs_users.find_one(
            {"id": comment["author_id"]},
            {"_id": 0, "id": 1, "name": 1, "avatar_url": 1}
        )
        
        if not author:
            continue
        
        enriched_comments.append({
            **comment,
            "author": {
                "id": author["id"],
                "display_name": author.get("name", "Unknown User"),
                "avatar_url": author.get("avatar_url")
            }
        })
    
    return {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "items": enriched_comments
    }


async def delete_comment(comment_id: str, user_id: str):
    """Soft delete a comment (only author can delete)"""
    db = await get_db()
    
    comment = await db.social_comments.find_one({"id": comment_id})
    if not comment:
        return False
    
    # Check if user is author
    if comment["author_id"] != user_id:
        return False
    
    # Soft delete
    await db.social_comments.update_one(
        {"id": comment_id},
        {
            "$set": {
                "is_deleted": True,
                "text": "This comment was removed.",
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    # Decrement comment count on post
    await db.social_posts.update_one(
        {"id": comment["post_id"]},
        {"$inc": {"comment_count": -1}}
    )
    
    return True
