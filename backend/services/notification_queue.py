"""
Notification Queue Service - Phase C Circle Trust Order
Manages notification queue with tier-based batching

Handles queuing, batching, and delivery of notifications based on trust tier
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
import logging

from db.connection import get_db
from services.notification_filter import (
    NotificationFilterService,
    should_notify,
    get_notification_priority
)

logger = logging.getLogger(__name__)


async def queue_notification(
    recipient_id: str,
    actor_id: str,
    actor_tier: str,
    notification_type: str,
    message: str,
    data: Optional[Dict[str, Any]] = None,
    mutual_peoples: bool = False,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Optional[Dict[str, Any]]:
    """
    Queue a notification for delivery based on trust tier.
    
    Args:
        recipient_id: ID of user receiving notification
        actor_id: ID of user performing the action
        actor_tier: Trust tier of actor
        notification_type: Type of notification (post, comment, dm, etc.)
        message: Notification message
        data: Additional notification data
        mutual_peoples: Whether mutual PEOPLES relationship exists
        db: Database connection (optional)
    
    Returns:
        Queued notification document, or None if notification blocked
    """
    if db is None:
        db = await get_db()
    
    # Check if notification should be sent
    notif_decision = should_notify(actor_tier, notification_type, mutual_peoples)
    
    if not notif_decision["should_notify"]:
        logger.debug(
            f"Notification blocked: {actor_tier} tier cannot notify {recipient_id} "
            f"(type: {notification_type})"
        )
        return None
    
    now = datetime.now(timezone.utc)
    
    # Calculate batch delivery time
    priority = notif_decision["priority"]
    batch_delivery_at = NotificationFilterService.calculate_next_batch_time(priority, now)
    
    notification = {
        "id": str(uuid.uuid4()),
        "recipient_id": recipient_id,
        "actor_id": actor_id,
        "actor_tier": actor_tier,
        "type": notification_type,
        "message": message,
        "data": data or {},
        "priority": priority,
        "batch_interval": notif_decision["batch_interval"],
        "batch_delivery_at": batch_delivery_at,
        "send_immediately": notif_decision["send_immediately"],
        "status": "pending",  # pending, sent, failed
        "created_at": now,
        "sent_at": None,
        "read_at": None
    }
    
    await db.notification_queue.insert_one(notification)
    
    logger.info(
        f"Queued notification for {recipient_id} from {actor_id} "
        f"(tier: {actor_tier}, priority: {priority}, "
        f"delivery: {'immediate' if notif_decision['send_immediately'] else batch_delivery_at})"
    )
    
    # If immediate delivery, mark for immediate sending
    if notif_decision["send_immediately"]:
        notification["ready_for_delivery"] = True
    
    return notification


async def get_ready_notifications(
    recipient_id: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> List[Dict[str, Any]]:
    """
    Get notifications ready for delivery (batch time reached).
    
    Args:
        recipient_id: Optional specific recipient ID
        db: Database connection (optional)
    
    Returns:
        List of notifications ready for delivery
    """
    if db is None:
        db = await get_db()
    
    now = datetime.now(timezone.utc)
    
    query = {
        "status": "pending",
        "batch_delivery_at": {"$lte": now}
    }
    
    if recipient_id:
        query["recipient_id"] = recipient_id
    
    notifications = await db.notification_queue.find(
        query,
        {"_id": 0}
    ).sort("batch_delivery_at", 1).to_list(1000)
    
    return notifications


async def mark_notifications_sent(
    notification_ids: List[str],
    db: Optional[AsyncIOMotorDatabase] = None
) -> int:
    """
    Mark notifications as sent.
    
    Args:
        notification_ids: List of notification IDs to mark as sent
        db: Database connection (optional)
    
    Returns:
        Number of notifications updated
    """
    if db is None:
        db = await get_db()
    
    now = datetime.now(timezone.utc)
    
    result = await db.notification_queue.update_many(
        {"id": {"$in": notification_ids}},
        {
            "$set": {
                "status": "sent",
                "sent_at": now
            }
        }
    )
    
    logger.info(f"Marked {result.modified_count} notifications as sent")
    
    return result.modified_count


async def get_user_notifications(
    recipient_id: str,
    limit: int = 50,
    skip: int = 0,
    include_read: bool = False,
    db: Optional[AsyncIOMotorDatabase] = None
) -> List[Dict[str, Any]]:
    """
    Get notifications for a user.
    
    Args:
        recipient_id: User ID
        limit: Maximum notifications to return
        skip: Number to skip (for pagination)
        include_read: Whether to include read notifications
        db: Database connection (optional)
    
    Returns:
        List of notifications
    """
    if db is None:
        db = await get_db()
    
    query = {
        "recipient_id": recipient_id,
        "status": "sent"
    }
    
    if not include_read:
        query["read_at"] = None
    
    notifications = await db.notification_queue.find(
        query,
        {"_id": 0}
    ).sort("sent_at", -1).skip(skip).limit(limit).to_list(limit)
    
    return notifications


async def mark_notification_read(
    notification_id: str,
    recipient_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> bool:
    """
    Mark a notification as read.
    
    Args:
        notification_id: Notification ID
        recipient_id: User ID (for authorization)
        db: Database connection (optional)
    
    Returns:
        True if marked as read, False if not found
    """
    if db is None:
        db = await get_db()
    
    now = datetime.now(timezone.utc)
    
    result = await db.notification_queue.update_one(
        {
            "id": notification_id,
            "recipient_id": recipient_id,
            "read_at": None
        },
        {
            "$set": {
                "read_at": now
            }
        }
    )
    
    return result.modified_count > 0


async def get_notification_stats(
    recipient_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Get notification statistics for a user.
    
    Args:
        recipient_id: User ID
        db: Database connection (optional)
    
    Returns:
        Statistics dictionary
    """
    if db is None:
        db = await get_db()
    
    # Count unread notifications
    unread_count = await db.notification_queue.count_documents({
        "recipient_id": recipient_id,
        "status": "sent",
        "read_at": None
    })
    
    # Count by priority
    priority_pipeline = [
        {
            "$match": {
                "recipient_id": recipient_id,
                "status": "sent",
                "read_at": None
            }
        },
        {
            "$group": {
                "_id": "$priority",
                "count": {"$sum": 1}
            }
        }
    ]
    
    priority_results = await db.notification_queue.aggregate(priority_pipeline).to_list(10)
    by_priority = {result["_id"]: result["count"] for result in priority_results}
    
    return {
        "unread_count": unread_count,
        "by_priority": by_priority
    }


async def process_notification_batch(
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Process a batch of ready notifications.
    
    This should be called by a scheduler (e.g., every 1 minute).
    Groups notifications by priority and delivers them.
    
    Args:
        db: Database connection (optional)
    
    Returns:
        Processing results
    """
    if db is None:
        db = await get_db()
    
    # Get all ready notifications
    ready_notifications = await get_ready_notifications(db=db)
    
    if not ready_notifications:
        return {
            "processed": 0,
            "sent": 0,
            "grouped": 0
        }
    
    logger.info(f"Processing {len(ready_notifications)} ready notifications")
    
    # Group by recipient and priority
    by_recipient = {}
    for notif in ready_notifications:
        recipient_id = notif["recipient_id"]
        if recipient_id not in by_recipient:
            by_recipient[recipient_id] = []
        by_recipient[recipient_id].append(notif)
    
    sent_count = 0
    grouped_count = 0
    
    for recipient_id, notifications in by_recipient.items():
        # Group by priority
        grouped = NotificationFilterService.group_notifications_by_priority(notifications)
        
        for priority, priority_notifications in grouped.items():
            if not priority_notifications:
                continue
            
            # Check if should group
            should_group = NotificationFilterService.should_group_notifications(priority)
            
            if should_group and len(priority_notifications) > 1:
                # Create grouped notification
                _ = NotificationFilterService.format_batched_notification(
                    priority_notifications,
                    priority
                )
                
                logger.info(
                    f"Grouped {len(priority_notifications)} notifications for {recipient_id} "
                    f"(priority: {priority})"
                )
                
                grouped_count += 1
                sent_count += 1
                
                # In real implementation, send the grouped notification via push/email/websocket
                # For now, just mark as sent
                notif_ids = [n["id"] for n in priority_notifications]
                await mark_notifications_sent(notif_ids, db)
            else:
                # Send individual notifications
                for notif in priority_notifications:
                    logger.info(
                        f"Sending individual notification to {recipient_id} "
                        f"(type: {notif['type']}, priority: {priority})"
                    )
                    
                    sent_count += 1
                    
                    # In real implementation, send via push/email/websocket
                    # For now, just mark as sent
                    await mark_notifications_sent([notif["id"]], db)
    
    return {
        "processed": len(ready_notifications),
        "sent": sent_count,
        "grouped": grouped_count
    }
