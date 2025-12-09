"""
Comment Moderation Service - Phase C Circle Trust Order
Manages comment moderation queue for CHILL/ALRIGHT/OTHERS tiers

Founder Decisions (Locked):
- Comments from CHILL/ALRIGHT/OTHERS are hidden until approved
- No auto-approval, ever (manual review only)
- PEOPLES/COOL comments bypass moderation
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
import logging

from db.connection import get_db

logger = logging.getLogger(__name__)


async def create_moderation_entry(
    comment_id: str,
    post_id: str,
    commenter_id: str,
    commenter_tier: str,
    comment_text: str,
    moderation_level: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Create a moderation queue entry for a comment.
    
    Args:
        comment_id: ID of the comment
        post_id: ID of the post being commented on
        commenter_id: ID of the user commenting
        commenter_tier: Trust tier of the commenter
        comment_text: Preview of comment text (first 500 chars)
        moderation_level: Moderation level (moderate, heavy)
        db: Database connection (optional)
    
    Returns:
        The created moderation entry
    """
    if db is None:
        db = await get_db()
    
    now = datetime.now(timezone.utc)
    
    moderation_entry = {
        "id": str(uuid.uuid4()),
        "comment_id": comment_id,
        "post_id": post_id,
        "commenter_id": commenter_id,
        "commenter_tier": commenter_tier,
        "comment_text_preview": comment_text[:500],  # Preview only
        "moderation_level": moderation_level,
        "status": "pending",  # pending, approved, rejected
        "created_at": now,
        "reviewed_at": None,
        "reviewed_by": None,
        "reviewer_note": None
    }
    
    await db.comment_moderation_queue.insert_one(moderation_entry)
    
    logger.info(
        f"Created moderation entry for comment {comment_id} from {commenter_id} "
        f"(tier: {commenter_tier}, level: {moderation_level})"
    )
    
    return moderation_entry


async def get_pending_moderation_entries(
    post_author_id: str,
    post_id: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> List[Dict[str, Any]]:
    """
    Get pending moderation entries for a post author.
    
    Args:
        post_author_id: ID of post author whose moderation queue to fetch
        post_id: Optional specific post ID to filter by
        db: Database connection (optional)
    
    Returns:
        List of pending moderation entries with commenter info
    """
    if db is None:
        db = await get_db()
    
    query = {
        "status": "pending"
    }
    
    if post_id:
        query["post_id"] = post_id
    
    # First, get post IDs for this author
    posts = await db.social_posts.find(
        {"author_id": post_author_id},
        {"_id": 0, "id": 1}
    ).to_list(1000)
    
    if not posts and not post_id:
        return []
    
    post_ids = [p["id"] for p in posts]
    if post_id:
        post_ids.append(post_id)
    
    query["post_id"] = {"$in": post_ids}
    
    # Fetch moderation entries
    entries = await db.comment_moderation_queue.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich with commenter info
    if entries:
        commenter_ids = [e["commenter_id"] for e in entries]
        commenters = await db.banibs_users.find(
            {"id": {"$in": commenter_ids}},
            {"_id": 0, "id": 1, "name": 1, "email": 1, "avatar_url": 1}
        ).to_list(100)
        
        commenter_map = {c["id"]: c for c in commenters}
        
        for entry in entries:
            entry["commenter_info"] = commenter_map.get(entry["commenter_id"], {})
    
    return entries


async def approve_comment(
    moderation_entry_id: str,
    reviewer_id: str,
    reviewer_note: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Optional[Dict[str, Any]]:
    """
    Approve a comment in the moderation queue.
    
    This makes the comment visible on the post.
    
    Args:
        moderation_entry_id: ID of the moderation entry
        reviewer_id: ID of the user approving (post author or moderator)
        reviewer_note: Optional note from reviewer
        db: Database connection (optional)
    
    Returns:
        Updated moderation entry, or None if not found
    """
    if db is None:
        db = await get_db()
    
    entry = await db.comment_moderation_queue.find_one(
        {"id": moderation_entry_id, "status": "pending"},
        {"_id": 0}
    )
    
    if not entry:
        logger.warning(f"Moderation entry not found: {moderation_entry_id}")
        return None
    
    now = datetime.now(timezone.utc)
    
    # Update moderation entry
    await db.comment_moderation_queue.update_one(
        {"id": moderation_entry_id},
        {
            "$set": {
                "status": "approved",
                "reviewed_at": now,
                "reviewed_by": reviewer_id,
                "reviewer_note": reviewer_note
            }
        }
    )
    
    # Update the actual comment to make it visible
    await db.social_comments.update_one(
        {"id": entry["comment_id"]},
        {
            "$set": {
                "moderation_status": "approved",
                "is_visible": True,
                "approved_at": now,
                "approved_by": reviewer_id
            }
        }
    )
    
    logger.info(
        f"Approved comment {entry['comment_id']} by {reviewer_id} "
        f"(commenter: {entry['commenter_id']}, tier: {entry['commenter_tier']})"
    )
    
    # Return updated entry
    entry["status"] = "approved"
    entry["reviewed_at"] = now
    entry["reviewed_by"] = reviewer_id
    entry["reviewer_note"] = reviewer_note
    
    return entry


async def reject_comment(
    moderation_entry_id: str,
    reviewer_id: str,
    reviewer_note: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Optional[Dict[str, Any]]:
    """
    Reject a comment in the moderation queue.
    
    The comment remains hidden and is marked as rejected.
    
    Args:
        moderation_entry_id: ID of the moderation entry
        reviewer_id: ID of the user rejecting
        reviewer_note: Optional note from reviewer
        db: Database connection (optional)
    
    Returns:
        Updated moderation entry, or None if not found
    """
    if db is None:
        db = await get_db()
    
    entry = await db.comment_moderation_queue.find_one(
        {"id": moderation_entry_id, "status": "pending"},
        {"_id": 0}
    )
    
    if not entry:
        logger.warning(f"Moderation entry not found: {moderation_entry_id}")
        return None
    
    now = datetime.now(timezone.utc)
    
    # Update moderation entry
    await db.comment_moderation_queue.update_one(
        {"id": moderation_entry_id},
        {
            "$set": {
                "status": "rejected",
                "reviewed_at": now,
                "reviewed_by": reviewer_id,
                "reviewer_note": reviewer_note
            }
        }
    )
    
    # Update the actual comment to mark as rejected
    await db.social_comments.update_one(
        {"id": entry["comment_id"]},
        {
            "$set": {
                "moderation_status": "rejected",
                "is_visible": False,
                "rejected_at": now,
                "rejected_by": reviewer_id
            }
        }
    )
    
    logger.info(
        f"Rejected comment {entry['comment_id']} by {reviewer_id} "
        f"(commenter: {entry['commenter_id']}, tier: {entry['commenter_tier']})"
    )
    
    # Return updated entry
    entry["status"] = "rejected"
    entry["reviewed_at"] = now
    entry["reviewed_by"] = reviewer_id
    entry["reviewer_note"] = reviewer_note
    
    return entry


async def get_moderation_stats(
    post_author_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Get moderation queue statistics for a post author.
    
    Args:
        post_author_id: ID of post author
        db: Database connection (optional)
    
    Returns:
        Statistics dictionary
    """
    if db is None:
        db = await get_db()
    
    # Get post IDs for this author
    posts = await db.social_posts.find(
        {"author_id": post_author_id},
        {"_id": 0, "id": 1}
    ).to_list(1000)
    
    if not posts:
        return {
            "pending_count": 0,
            "approved_count": 0,
            "rejected_count": 0,
            "by_tier": {}
        }
    
    post_ids = [p["id"] for p in posts]
    
    # Count by status
    pending_count = await db.comment_moderation_queue.count_documents({
        "post_id": {"$in": post_ids},
        "status": "pending"
    })
    
    approved_count = await db.comment_moderation_queue.count_documents({
        "post_id": {"$in": post_ids},
        "status": "approved"
    })
    
    rejected_count = await db.comment_moderation_queue.count_documents({
        "post_id": {"$in": post_ids},
        "status": "rejected"
    })
    
    # Count by tier (pending only)
    tier_pipeline = [
        {
            "$match": {
                "post_id": {"$in": post_ids},
                "status": "pending"
            }
        },
        {
            "$group": {
                "_id": "$commenter_tier",
                "count": {"$sum": 1}
            }
        }
    ]
    
    tier_results = await db.comment_moderation_queue.aggregate(tier_pipeline).to_list(10)
    by_tier = {result["_id"]: result["count"] for result in tier_results}
    
    return {
        "pending_count": pending_count,
        "approved_count": approved_count,
        "rejected_count": rejected_count,
        "by_tier": by_tier
    }
