"""
DM Request Service - Phase B Circle Trust Order
Manages DM approval queue for COOL/CHILL tier first contacts
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
import logging

from db.connection import get_db

logger = logging.getLogger(__name__)

# DM requests expire after 30 days
DM_REQUEST_EXPIRY_DAYS = 30


async def create_dm_request(
    sender_id: str,
    recipient_id: str,
    sender_tier: str,
    message_preview: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Create a pending DM request.
    
    Args:
        sender_id: User sending the DM request
        recipient_id: User receiving the DM request
        sender_tier: Trust tier of sender (COOL or CHILL)
        message_preview: Preview of the first message (max 200 chars)
        db: Database connection (optional)
    
    Returns:
        The created DM request document
    """
    if db is None:
        db = await get_db()
    
    # Check if a request already exists
    existing = await db.dm_requests.find_one(
        {
            "sender_id": sender_id,
            "recipient_id": recipient_id,
            "status": "pending"
        },
        {"_id": 0}
    )
    
    if existing:
        logger.info(f"DM request already exists: {sender_id} -> {recipient_id}")
        return existing
    
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=DM_REQUEST_EXPIRY_DAYS)
    
    dm_request = {
        "id": str(uuid.uuid4()),
        "sender_id": sender_id,
        "recipient_id": recipient_id,
        "sender_tier": sender_tier,
        "message_preview": message_preview[:200],  # Limit to 200 chars
        "status": "pending",
        "created_at": now,
        "expires_at": expires_at,
        "responded_at": None
    }
    
    await db.dm_requests.insert_one(dm_request)
    
    logger.info(f"Created DM request: {sender_id} -> {recipient_id} (tier: {sender_tier})")
    
    return dm_request


async def get_pending_dm_requests(
    recipient_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> List[Dict[str, Any]]:
    """
    Get all pending DM requests for a user.
    
    Args:
        recipient_id: User whose requests to fetch
        db: Database connection (optional)
    
    Returns:
        List of pending DM request documents with sender info
    """
    if db is None:
        db = await get_db()
    
    now = datetime.now(timezone.utc)
    
    # Auto-expire old requests
    await db.dm_requests.update_many(
        {
            "recipient_id": recipient_id,
            "status": "pending",
            "expires_at": {"$lt": now}
        },
        {
            "$set": {
                "status": "expired",
                "responded_at": now
            }
        }
    )
    
    # Fetch active pending requests
    requests = await db.dm_requests.find(
        {
            "recipient_id": recipient_id,
            "status": "pending"
        },
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich with sender info
    if requests:
        sender_ids = [req["sender_id"] for req in requests]
        senders = await db.banibs_users.find(
            {"id": {"$in": sender_ids}},
            {"_id": 0, "id": 1, "name": 1, "email": 1, "avatar_url": 1}
        ).to_list(100)
        
        sender_map = {s["id"]: s for s in senders}
        
        for req in requests:
            req["sender_info"] = sender_map.get(req["sender_id"], {})
    
    return requests


async def respond_to_dm_request(
    request_id: str,
    recipient_id: str,
    action: str,  # "approve" or "reject"
    db: Optional[AsyncIOMotorDatabase] = None
) -> Optional[Dict[str, Any]]:
    """
    Respond to a DM request.
    
    Args:
        request_id: ID of the DM request
        recipient_id: User responding (must be the recipient)
        action: "approve" or "reject"
        db: Database connection (optional)
    
    Returns:
        Updated DM request document, or None if not found/unauthorized
    """
    if db is None:
        db = await get_db()
    
    if action not in ["approve", "reject"]:
        raise ValueError("Action must be 'approve' or 'reject'")
    
    # Fetch the request
    request = await db.dm_requests.find_one(
        {
            "id": request_id,
            "recipient_id": recipient_id,
            "status": "pending"
        },
        {"_id": 0}
    )
    
    if not request:
        logger.warning(f"DM request not found or unauthorized: {request_id}")
        return None
    
    now = datetime.now(timezone.utc)
    new_status = "approved" if action == "approve" else "rejected"
    
    await db.dm_requests.update_one(
        {"id": request_id},
        {
            "$set": {
                "status": new_status,
                "responded_at": now
            }
        }
    )
    
    logger.info(f"DM request {new_status}: {request['sender_id']} -> {recipient_id}")
    
    # Return updated request
    request["status"] = new_status
    request["responded_at"] = now
    
    return request


async def has_approved_dm_request(
    sender_id: str,
    recipient_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> bool:
    """
    Check if sender has an approved DM request with recipient.
    
    Used to bypass approval requirement on subsequent messages.
    
    Args:
        sender_id: User who sent the request
        recipient_id: User who approved it
        db: Database connection (optional)
    
    Returns:
        True if an approved request exists
    """
    if db is None:
        db = await get_db()
    
    approved = await db.dm_requests.find_one(
        {
            "sender_id": sender_id,
            "recipient_id": recipient_id,
            "status": "approved"
        },
        {"_id": 0, "id": 1}
    )
    
    return approved is not None


async def cleanup_expired_requests(
    db: Optional[AsyncIOMotorDatabase] = None
) -> int:
    """
    Cleanup expired DM requests (maintenance task).
    
    Args:
        db: Database connection (optional)
    
    Returns:
        Number of expired requests cleaned up
    """
    if db is None:
        db = await get_db()
    
    now = datetime.now(timezone.utc)
    
    result = await db.dm_requests.update_many(
        {
            "status": "pending",
            "expires_at": {"$lt": now}
        },
        {
            "$set": {
                "status": "expired",
                "responded_at": now
            }
        }
    )
    
    logger.info(f"Expired {result.modified_count} old DM requests")
    
    return result.modified_count
