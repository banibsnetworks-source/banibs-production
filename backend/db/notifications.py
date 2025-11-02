"""
Notification Database Operations
Phase 6.2.1 - Notifications System
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import os
import uuid

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
notifications_collection = db.banibs_notifications


async def create_notification(
    user_id: str,
    notification_type: str,
    title: str,
    message: str,
    link: Optional[str] = None,
    expires_at: Optional[datetime] = None
) -> Dict[str, Any]:
    """
    Create a new notification for a user
    
    Args:
        user_id: UUID of the user to notify
        notification_type: Type of notification (system, business, opportunity, event)
        title: Notification title
        message: Notification message
        link: Optional URL to navigate when clicked
        expires_at: Optional expiry date
    
    Returns:
        Created notification document
    """
    notification = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "type": notification_type,
        "title": title,
        "message": message,
        "link": link,
        "read": False,
        "created_at": datetime.now(timezone.utc),
        "expires_at": expires_at
    }
    
    await notifications_collection.insert_one(notification)
    return notification


async def get_user_notifications(
    user_id: str,
    limit: int = 20,
    skip: int = 0,
    unread_only: bool = False
) -> List[Dict[str, Any]]:
    """
    Get notifications for a user
    
    Args:
        user_id: UUID of the user
        limit: Maximum number of notifications to return
        skip: Number of notifications to skip (pagination)
        unread_only: If True, return only unread notifications
    
    Returns:
        List of notification documents
    """
    query = {"user_id": user_id}
    
    if unread_only:
        query["read"] = False
    
    # Filter out expired notifications
    query["$or"] = [
        {"expires_at": None},
        {"expires_at": {"$gt": datetime.now(timezone.utc)}}
    ]
    
    notifications = await notifications_collection.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    return notifications


async def get_unread_count(user_id: str) -> int:
    """
    Get count of unread notifications for a user
    
    Args:
        user_id: UUID of the user
    
    Returns:
        Count of unread notifications
    """
    count = await notifications_collection.count_documents({
        "user_id": user_id,
        "read": False,
        "$or": [
            {"expires_at": None},
            {"expires_at": {"$gt": datetime.now(timezone.utc)}}
        ]
    })
    
    return count


async def mark_notification_as_read(notification_id: str, user_id: str) -> bool:
    """
    Mark a notification as read
    
    Args:
        notification_id: UUID of the notification
        user_id: UUID of the user (for authorization)
    
    Returns:
        True if updated, False if not found or unauthorized
    """
    result = await notifications_collection.update_one(
        {"id": notification_id, "user_id": user_id},
        {"$set": {"read": True}}
    )
    
    return result.modified_count > 0


async def mark_all_as_read(user_id: str) -> int:
    """
    Mark all notifications as read for a user
    
    Args:
        user_id: UUID of the user
    
    Returns:
        Number of notifications marked as read
    """
    result = await notifications_collection.update_many(
        {"user_id": user_id, "read": False},
        {"$set": {"read": True}}
    )
    
    return result.modified_count


async def delete_notification(notification_id: str, user_id: str) -> bool:
    """
    Delete a notification (soft delete by setting expired)
    
    Args:
        notification_id: UUID of the notification
        user_id: UUID of the user (for authorization)
    
    Returns:
        True if deleted, False if not found or unauthorized
    """
    result = await notifications_collection.delete_one({
        "id": notification_id,
        "user_id": user_id
    })
    
    return result.deleted_count > 0


async def get_notification_by_id(notification_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """
    Get a single notification by ID
    
    Args:
        notification_id: UUID of the notification
        user_id: UUID of the user (for authorization)
    
    Returns:
        Notification document or None if not found
    """
    notification = await notifications_collection.find_one(
        {"id": notification_id, "user_id": user_id},
        {"_id": 0}
    )
    
    return notification
