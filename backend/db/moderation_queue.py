"""
Moderation Queue Database Operations - Phase 6.4
Database helpers for content moderation routing
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import uuid

from db.connection import get_db


async def create_moderation_item(
    content_id: str,
    content_type: str,
    title: str,
    sentiment_label: Optional[str] = None,
    sentiment_score: Optional[float] = None,
    reason: str = "LOW_SENTIMENT"
) -> str:
    """
    Add an item to the moderation queue
    
    Args:
        content_id: ID of the content (news or resource)
        content_type: "news" or "resource"
        title: Title of the content
        sentiment_label: Sentiment label (positive/neutral/negative)
        sentiment_score: Sentiment score (-1.0 to 1.0)
        reason: Reason for moderation
        
    Returns:
        ID of the created moderation item
    """
    db = await get_db()
    collection = db["moderation_queue"]
    
    mod_id = str(uuid.uuid4())
    
    doc = {
        "id": mod_id,
        "content_id": content_id,
        "content_type": content_type,
        "title": title,
        "sentiment_label": sentiment_label,
        "sentiment_score": sentiment_score,
        "reason": reason,
        "status": "PENDING",
        "created_at": datetime.now(timezone.utc),
        "reviewed_at": None,
        "reviewed_by": None
    }
    
    await collection.insert_one(doc)
    return mod_id


async def get_moderation_items(
    status: Optional[str] = "PENDING",
    content_type: Optional[str] = None,
    limit: int = 100
) -> List[Dict[str, Any]]:
    """
    Get moderation queue items
    
    Args:
        status: Filter by status (PENDING/APPROVED/REJECTED), None for all
        content_type: Filter by content type (news/resource), None for all
        limit: Maximum number of items to return
        
    Returns:
        List of moderation items
    """
    db = await get_db()
    collection = db["moderation_queue"]
    
    query = {}
    if status:
        query["status"] = status
    if content_type:
        query["content_type"] = content_type
    
    cursor = collection.find(query).sort("created_at", -1).limit(limit)
    items = []
    
    async for item in cursor:
        item.pop("_id", None)  # Remove MongoDB _id
        items.append(item)
    
    return items


async def get_moderation_item_by_id(mod_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single moderation item by ID
    
    Args:
        mod_id: Moderation item ID
        
    Returns:
        Moderation item or None if not found
    """
    db = await get_db()
    collection = db["moderation_queue"]
    
    item = await collection.find_one({"id": mod_id})
    if item:
        item.pop("_id", None)
    return item


async def update_moderation_status(
    mod_id: str,
    status: str,
    reviewed_by: str
) -> bool:
    """
    Update the status of a moderation item (approve/reject)
    
    Args:
        mod_id: Moderation item ID
        status: New status (APPROVED/REJECTED)
        reviewed_by: Admin ID/email who reviewed
        
    Returns:
        True if updated, False if not found
    """
    db = await get_db()
    collection = db["moderation_queue"]
    
    result = await collection.update_one(
        {"id": mod_id},
        {
            "$set": {
                "status": status,
                "reviewed_at": datetime.now(timezone.utc),
                "reviewed_by": reviewed_by
            }
        }
    )
    
    return result.modified_count > 0


async def get_moderation_stats() -> Dict[str, int]:
    """
    Get statistics for moderation queue
    
    Returns:
        Dict with counts: pending, approved, rejected, total
    """
    db = await get_db()
    collection = db["moderation_queue"]
    
    # Count by status
    pending = await collection.count_documents({"status": "PENDING"})
    approved = await collection.count_documents({"status": "APPROVED"})
    rejected = await collection.count_documents({"status": "REJECTED"})
    total = await collection.count_documents({})
    
    return {
        "pending": pending,
        "approved": approved,
        "rejected": rejected,
        "total": total
    }


async def check_if_already_moderated(content_id: str, content_type: str) -> bool:
    """
    Check if content is already in moderation queue
    
    Args:
        content_id: ID of the content
        content_type: Type of content (news/resource)
        
    Returns:
        True if already in queue, False otherwise
    """
    db = await get_db()
    collection = db["moderation_queue"]
    
    existing = await collection.find_one({
        "content_id": content_id,
        "content_type": content_type
    })
    
    return existing is not None
