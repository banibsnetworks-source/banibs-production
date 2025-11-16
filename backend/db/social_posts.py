"""
Social Posts Database Operations - Phase 8.3
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
import os
from typing import Optional

from db.connection import get_db


async def create_post(
    author_id: str,
    text: str,
    media: Optional[list] = None,
    link_url: Optional[str] = None,
    link_meta: Optional[dict] = None
):
    """Create a new social post with media and link support (Phase 8.1)"""
    db = await get_db()
    
    # DEBUG LOG: Check incoming media parameter
    print(f"🔍 [DB Layer] Incoming media parameter: {media}")
    print(f"🔍 [DB Layer] Media type: {type(media)}")
    
    post = {
        "id": str(uuid.uuid4()),
        "author_id": author_id,
        "text": text,
        "media": media or [],
        "link_url": link_url,
        "link_meta": link_meta,
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
    
    print(f"🔍 [DB Layer] Post document before insert: {post}")
    
    await db.social_posts.insert_one(post)
    return post


async def get_feed(page: int = 1, page_size: int = 20, viewer_id: Optional[str] = None):
    """Get paginated social feed (Phase 8.3.1: excludes hidden/deleted posts)"""
    db = await get_db()
    
    skip = (page - 1) * page_size
    
    # Phase 8.3.1: Filter out moderated content
    feed_filter = {
        "is_deleted": False,
        "is_hidden": False
    }
    
    # Get total count
    total_items = await db.social_posts.count_documents(feed_filter)
    total_pages = (total_items + page_size - 1) // page_size
    
    # Get posts (reverse chronological)
    posts = await db.social_posts.find(
        feed_filter,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(page_size).to_list(length=None)
    
    # Enrich posts with author info and viewer like status
    enriched_posts = []
    for post in posts:
        author = await db.banibs_users.find_one(
            {"id": post["author_id"]},
            {"_id": 0, "id": 1, "name": 1, "avatar_url": 1, "profile": 1}
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
        
        # Extract profile data
        profile = author.get("profile", {}) or {}
        
        # Extract media URLs from media array for S-MEDIA compatibility
        media_urls = []
        if post.get("media"):
            for item in post["media"]:
                if isinstance(item, dict) and item.get("url"):
                    # If URL is relative, make it absolute
                    url = item["url"]
                    if not url.startswith('http'):
                        backend_url = os.environ.get('REACT_APP_BACKEND_URL', '')
                        url = f"{backend_url}{url}"
                    media_urls.append(url)
        
        enriched_posts.append({
            **post,
            "media_urls": media_urls,  # S-MEDIA v1.0 compatibility
            "author": {
                "id": author["id"],
                "display_name": author.get("name", "Unknown User"),
                "avatar_url": profile.get("avatar_url") or author.get("avatar_url"),
                "handle": profile.get("handle")
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
        {"_id": 0, "id": 1, "name": 1, "avatar_url": 1, "profile": 1}
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
    
    # Extract profile data
    profile = author.get("profile", {}) or {}
    
    # Extract media URLs from media array for S-MEDIA compatibility
    media_urls = []
    print(f"🔍 [DB get_post_by_id] post.get('media'): {post.get('media')}")
    if post.get("media"):
        for item in post["media"]:
            print(f"🔍 [DB get_post_by_id] Processing media item: {item}")
            print(f"🔍 [DB get_post_by_id] isinstance check: {isinstance(item, dict)}, has url: {item.get('url') if isinstance(item, dict) else 'N/A'}")
            if isinstance(item, dict) and item.get("url"):
                # If URL is relative, make it absolute
                url = item["url"]
                if not url.startswith('http'):
                    backend_url = os.environ.get('REACT_APP_BACKEND_URL', '')
                    print(f"🔍 [DB get_post_by_id] backend_url from env: '{backend_url}'")
                    url = f"{backend_url}{url}"
                print(f"🔍 [DB get_post_by_id] Final URL to append: '{url}'")
                media_urls.append(url)
    
    print(f"🔍 [DB get_post_by_id] Final media_urls array: {media_urls}")
    
    return {
        **post,
        "media_urls": media_urls,  # S-MEDIA v1.0 compatibility
        "author": {
            "id": author["id"],
            "display_name": author.get("name", "Unknown User"),
            "avatar_url": profile.get("avatar_url") or author.get("avatar_url"),
            "handle": profile.get("handle")
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


async def delete_post(post_id: str, user_id: str, user_role: str = "user"):
    """
    Soft delete a post - Phase 3 Add-On
    Author or moderator/admin can delete.
    """
    db = await get_db()
    
    post = await db.social_posts.find_one({"id": post_id}, {"_id": 0})
    if not post:
        return False
    
    # Check permissions
    is_author = post["author_id"] == user_id
    is_moderator = user_role in ["moderator", "admin"]
    
    if not (is_author or is_moderator):
        return False
    
    # Soft delete
    await db.social_posts.update_one(
        {"id": post_id},
        {
            "$set": {
                "is_deleted": True,
                "text": "[This post was deleted]",
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return True


async def delete_comment(comment_id: str, user_id: str, user_role: str = "user"):
    """
    Soft delete a comment - Phase 3 Add-On Enhanced
    Author or moderator/admin can delete.
    """
    db = await get_db()
    
    comment = await db.social_comments.find_one({"id": comment_id})
    if not comment:
        return False
    
    # Check permissions
    is_author = comment["author_id"] == user_id
    is_moderator = user_role in ["moderator", "admin"]
    
    if not (is_author or is_moderator):
        return False
    
    # Soft delete
    await db.social_comments.update_one(
        {"id": comment_id},
        {
            "$set": {
                "is_deleted": True,
                "text": "[This comment was deleted]",
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



async def get_user_posts(user_id: str, page: int = 1, page_size: int = 20, viewer_id: Optional[str] = None):
    """
    Get paginated posts by a specific user (Phase 9.1)
    Used for "My Posts" tab on profile pages
    """
    db = await get_db()
    
    skip = (page - 1) * page_size
    
    # Filter posts by author and exclude moderated content
    post_filter = {
        "author_id": user_id,
        "is_deleted": False,
        "is_hidden": False
    }
    
    # Get total count
    total_items = await db.social_posts.count_documents(post_filter)
    total_pages = (total_items + page_size - 1) // page_size
    
    # Get posts (reverse chronological)
    posts = await db.social_posts.find(
        post_filter,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(page_size).to_list(length=None)
    
    # Enrich posts with author info and viewer like status
    enriched_posts = []
    for post in posts:
        author = await db.banibs_users.find_one(
            {"id": post["author_id"]},
            {"_id": 0, "id": 1, "name": 1, "avatar_url": 1, "profile": 1}
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
        
        # Extract profile data
        profile = author.get("profile", {}) or {}
        
        # Extract media URLs from media array for S-MEDIA compatibility
        media_urls = []
        if post.get("media"):
            for item in post["media"]:
                if isinstance(item, dict) and item.get("url"):
                    # If URL is relative, make it absolute
                    url = item["url"]
                    if not url.startswith('http'):
                        backend_url = os.environ.get('REACT_APP_BACKEND_URL', '')
                        url = f"{backend_url}{url}"
                    media_urls.append(url)
        
        enriched_posts.append({
            **post,
            "media_urls": media_urls,  # S-MEDIA v1.0 compatibility
            "author": {
                "id": author["id"],
                "display_name": author.get("name", "Unknown User"),
                "avatar_url": profile.get("avatar_url") or author.get("avatar_url"),
                "handle": profile.get("handle")
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
