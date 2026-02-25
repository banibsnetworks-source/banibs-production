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
    link_meta: Optional[dict] = None,
    quoted_post_id: Optional[str] = None
):
    """Create a new social post with media, link, and quote support"""
    db = await get_db()
    
    post = {
        "id": str(uuid.uuid4()),
        "author_id": author_id,
        "text": text,
        "media": media or [],
        "link_url": link_url,
        "link_meta": link_meta,
        "quoted_post_id": quoted_post_id,
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
        
        # Fetch quoted post if present
        quoted_post = None
        if post.get("quoted_post_id"):
            qp = await db.social_posts.find_one(
                {"id": post["quoted_post_id"], "is_deleted": False},
                {"_id": 0}
            )
            if qp:
                qp_author = await db.banibs_users.find_one(
                    {"id": qp["author_id"]},
                    {"_id": 0, "name": 1, "avatar_url": 1, "profile": 1}
                )
                qp_profile = qp_author.get("profile", {}) if qp_author else {}
                quoted_post = {
                    "id": qp["id"],
                    "author_name": qp_author.get("name", "Unknown") if qp_author else "Unknown",
                    "author_avatar": qp_profile.get("avatar_url") or (qp_author.get("avatar_url") if qp_author else None),
                    "text": qp.get("text", "")[:200],
                    "media_url": qp.get("media", [{}])[0].get("url") if qp.get("media") else None,
                    "created_at": qp.get("created_at").isoformat() if qp.get("created_at") else None
                }
        
        enriched_posts.append({
            **post,
            "media_urls": media_urls,  # S-MEDIA v1.0 compatibility
            "quoted_post": quoted_post,
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
    if post.get("media"):
        for item in post["media"]:
            if isinstance(item, dict) and item.get("url"):
                # If URL is relative, make it absolute
                url = item["url"]
                if not url.startswith('http'):
                    backend_url = os.environ.get('REACT_APP_BACKEND_URL', '')
                    url = f"{backend_url}{url}"
                media_urls.append(url)
    
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


async def toggle_like(post_id: str, user_id: str, reaction_type: str = "love"):
    """Toggle reaction on a post (multi-reaction system v2.0)
    
    Reaction types:
    - love: ❤️ (default)
    - high_five: ✋
    - peace: ✌️
    - like: 👍
    - cool: 😎
    """
    db = await get_db()
    
    # Validate reaction type
    valid_types = {"love", "high_five", "peace", "like", "cool"}
    if reaction_type not in valid_types:
        reaction_type = "love"
    
    # Check if already reacted (any type)
    existing_reaction = await db.social_reactions.find_one({
        "post_id": post_id,
        "user_id": user_id
    })
    
    if existing_reaction:
        if existing_reaction.get("type", "like") == reaction_type:
            # Same type - remove reaction
            await db.social_reactions.delete_one({
                "post_id": post_id,
                "user_id": user_id
            })
            await db.social_posts.update_one(
                {"id": post_id},
                {"$inc": {"like_count": -1}}
            )
            liked = False
            final_type = None
        else:
            # Different type - update reaction type (no count change)
            await db.social_reactions.update_one(
                {"post_id": post_id, "user_id": user_id},
                {"$set": {"type": reaction_type, "updated_at": datetime.now(timezone.utc)}}
            )
            liked = True
            final_type = reaction_type
    else:
        # New reaction
        await db.social_reactions.insert_one({
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "user_id": user_id,
            "type": reaction_type,
            "created_at": datetime.now(timezone.utc)
        })
        await db.social_posts.update_one(
            {"id": post_id},
            {"$inc": {"like_count": 1}}
        )
        liked = True
        final_type = reaction_type
    
    # Get updated like count
    post = await db.social_posts.find_one({"id": post_id}, {"_id": 0, "like_count": 1})
    like_count = post["like_count"] if post else 0
    
    # Get reaction breakdown
    reactions_by_type = {}
    async for r in db.social_reactions.aggregate([
        {"$match": {"post_id": post_id}},
        {"$group": {"_id": {"$ifNull": ["$type", "like"]}, "count": {"$sum": 1}}}
    ]):
        reactions_by_type[r["_id"]] = r["count"]
    
    return {
        "liked": liked, 
        "like_count": like_count,
        "viewer_reaction_type": final_type,
        "reactions_by_type": reactions_by_type
    }


async def get_post_reactors(post_id: str, reaction_type: Optional[str] = None, limit: int = 50):
    """Get list of users who reacted to a post"""
    db = await get_db()
    
    query = {"post_id": post_id}
    if reaction_type:
        query["type"] = reaction_type
    
    reactors = []
    async for reaction in db.social_reactions.find(query).sort("created_at", -1).limit(limit):
        user = await db.banibs_users.find_one(
            {"id": reaction["user_id"]},
            {"_id": 0, "id": 1, "name": 1, "avatar_url": 1}
        )
        if user:
            reactors.append({
                "user_id": user["id"],
                "name": user.get("name", "User"),
                "avatar_url": user.get("avatar_url"),
                "reaction_type": reaction.get("type", "like"),
                "created_at": reaction.get("created_at").isoformat() if reaction.get("created_at") else None
            })
    
    return reactors


async def create_comment(post_id: str, author_id: str, text: str, media: Optional[list] = None, parent_id: Optional[str] = None):
    """Create a comment on a post with optional media and threading"""
    db = await get_db()
    
    comment = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "author_id": author_id,
        "text": text,
        "media": media or [],
        "parent_id": parent_id,
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
    """Get comments for a post with 1-level threaded replies"""
    db = await get_db()
    
    skip = (page - 1) * page_size
    
    # Get total count of root comments only (excluding deleted and replies)
    total_items = await db.social_comments.count_documents({
        "post_id": post_id,
        "is_deleted": False,
        "parent_id": None
    })
    
    # Get root comments (no parent_id)
    root_comments = await db.social_comments.find(
        {"post_id": post_id, "is_deleted": False, "parent_id": None},
        {"_id": 0}
    ).sort("created_at", 1).skip(skip).limit(page_size).to_list(length=None)
    
    # Get all replies for these root comments
    root_ids = [c["id"] for c in root_comments]
    replies = []
    if root_ids:
        replies = await db.social_comments.find(
            {"post_id": post_id, "is_deleted": False, "parent_id": {"$in": root_ids}},
            {"_id": 0}
        ).sort("created_at", 1).to_list(length=None)
    
    # Build reply map
    reply_map = {}
    for reply in replies:
        parent = reply.get("parent_id")
        if parent not in reply_map:
            reply_map[parent] = []
        reply_map[parent].append(reply)
    
    # Enrich with author info
    async def enrich_comment(comment):
        author = await db.banibs_users.find_one(
            {"id": comment["author_id"]},
            {"_id": 0, "id": 1, "name": 1, "avatar_url": 1}
        )
        
        if not author:
            return None
        
        return {
            **comment,
            "media": comment.get("media", []),
            "parent_id": comment.get("parent_id"),
            "author": {
                "id": author["id"],
                "display_name": author.get("name", "Unknown User"),
                "avatar_url": author.get("avatar_url")
            }
        }
    
    enriched_comments = []
    for comment in root_comments:
        enriched = await enrich_comment(comment)
        if not enriched:
            continue
        
        # Add enriched replies
        comment_replies = reply_map.get(comment["id"], [])
        enriched_replies = []
        for reply in comment_replies:
            enriched_reply = await enrich_comment(reply)
            if enriched_reply:
                enriched_replies.append(enriched_reply)
        
        enriched["replies"] = enriched_replies
        enriched_comments.append(enriched)
    
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
