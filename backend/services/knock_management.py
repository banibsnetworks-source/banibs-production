"""
Knock Management Service - BANIBS Peoples Room System
Handles knock creation, response, expiry, and cleanup
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from db.connection import get_db
from services.relationship_helper import get_relationship_tier
from models.peoples_room import KnockStatus

logger = logging.getLogger(__name__)

# Knock TTL: 30 minutes (Founder-approved)
KNOCK_TTL_MINUTES = 30

# Rate limit: Max 3 knocks per user per room per hour
KNOCK_RATE_LIMIT = 3
KNOCK_RATE_LIMIT_WINDOW_HOURS = 1


async def create_knock(
    room_owner_id: str,
    visitor_id: str,
    knock_message: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Create a new knock request.
    
    Args:
        room_owner_id: Owner of the room
        visitor_id: User knocking
        knock_message: Optional message from visitor
        db: Database connection (optional)
    
    Returns:
        Created knock record
    """
    if db is None:
        db = await get_db()
    
    # Check rate limit
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=KNOCK_RATE_LIMIT_WINDOW_HOURS)
    
    recent_knocks = await db.room_knocks.count_documents({
        "room_owner_id": room_owner_id,
        "visitor_id": visitor_id,
        "created_at": {"$gte": one_hour_ago}
    })
    
    if recent_knocks >= KNOCK_RATE_LIMIT:
        raise ValueError(
            f"Rate limit exceeded: Max {KNOCK_RATE_LIMIT} knocks per hour per room"
        )
    
    # Check if visitor already has a pending knock
    existing_knock = await db.room_knocks.find_one(
        {
            "room_owner_id": room_owner_id,
            "visitor_id": visitor_id,
            "status": KnockStatus.PENDING
        },
        {"_id": 0}
    )
    
    if existing_knock:
        logger.info(f"Visitor {visitor_id} already has pending knock on {room_owner_id}")
        return existing_knock
    
    # Get visitor's current tier
    visitor_tier = await get_relationship_tier(room_owner_id, visitor_id, db)
    
    # Create knock
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=KNOCK_TTL_MINUTES)
    
    import uuid
    knock_id = str(uuid.uuid4())
    
    knock = {
        "id": knock_id,
        "room_owner_id": room_owner_id,
        "visitor_id": visitor_id,
        "visitor_tier": visitor_tier,
        "status": KnockStatus.PENDING,
        "knock_message": knock_message,
        "created_at": now,
        "updated_at": now,
        "expires_at": expires_at,
        "responded_at": None,
        "response_note": None
    }
    
    await db.room_knocks.insert_one(knock)
    
    logger.info(
        f"Knock created: {visitor_id} -> {room_owner_id} "
        f"(tier: {visitor_tier}, expires: {expires_at})"
    )
    
    # Return knock without MongoDB _id
    knock.pop("_id", None)
    return knock


async def get_knock_by_id(
    knock_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Optional[Dict[str, Any]]:
    """
    Get knock by ID.
    
    Args:
        knock_id: Knock ID
        db: Database connection (optional)
    
    Returns:
        Knock record or None
    """
    if db is None:
        db = await get_db()
    
    # Note: We need to add a knock_id field or use MongoDB _id
    # For now, using room_owner_id + visitor_id as composite key
    # This will be addressed when implementing the routes
    
    knock = await db.room_knocks.find_one(
        {"_id": knock_id},
        {"_id": 0}
    )
    
    return knock


async def get_knocks_for_owner(
    owner_id: str,
    status: Optional[str] = None,
    limit: int = 50,
    db: Optional[AsyncIOMotorDatabase] = None
) -> List[Dict[str, Any]]:
    """
    Get knocks on owner's room.
    
    Args:
        owner_id: Room owner
        status: Filter by status (PENDING, APPROVED, DENIED, EXPIRED)
        limit: Max number of knocks to return
        db: Database connection (optional)
    
    Returns:
        List of knock records
    """
    if db is None:
        db = await get_db()
    
    # Build query
    query = {"room_owner_id": owner_id}
    if status:
        query["status"] = status
    
    # Auto-expire old knocks before fetching
    await expire_old_knocks(db)
    
    knocks = await db.room_knocks.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return knocks


async def respond_to_knock(
    room_owner_id: str,
    visitor_id: str,
    action: str,
    response_note: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Owner responds to a knock (approve or deny).
    
    Args:
        room_owner_id: Room owner
        visitor_id: Visitor who knocked
        action: "APPROVE" or "DENY"
        response_note: Optional note from owner
        db: Database connection (optional)
    
    Returns:
        Updated knock record
    """
    if db is None:
        db = await get_db()
    
    if action not in ["APPROVE", "DENY"]:
        raise ValueError(f"Invalid action: {action}. Must be APPROVE or DENY")
    
    now = datetime.now(timezone.utc)
    
    new_status = KnockStatus.APPROVED if action == "APPROVE" else KnockStatus.DENIED
    
    # Update knock
    result = await db.room_knocks.update_one(
        {
            "room_owner_id": room_owner_id,
            "visitor_id": visitor_id,
            "status": KnockStatus.PENDING
        },
        {
            "$set": {
                "status": new_status,
                "responded_at": now,
                "response_note": response_note,
                "updated_at": now
            }
        }
    )
    
    if result.modified_count == 0:
        raise ValueError("No pending knock found to respond to")
    
    logger.info(
        f"Knock {action}: {visitor_id} -> {room_owner_id} "
        f"(note: {response_note})"
    )
    
    # Return updated knock
    knock = await db.room_knocks.find_one(
        {
            "room_owner_id": room_owner_id,
            "visitor_id": visitor_id,
            "status": new_status
        },
        {"_id": 0}
    )
    
    # Log if this is a repeated denial (for ADCS)
    if action == "DENY":
        denial_count = await db.room_knocks.count_documents({
            "room_owner_id": room_owner_id,
            "visitor_id": visitor_id,
            "status": KnockStatus.DENIED
        })
        
        if denial_count >= 3:
            logger.warning(
                f"Repeated knock denials detected: {visitor_id} -> {room_owner_id} "
                f"(count: {denial_count})"
            )
            # TODO: Log to trust logger for ADCS
    
    return knock


async def expire_old_knocks(
    db: Optional[AsyncIOMotorDatabase] = None
) -> int:
    """
    Auto-expire PENDING knocks past their TTL.
    
    Args:
        db: Database connection (optional)
    
    Returns:
        Number of knocks expired
    """
    if db is None:
        db = await get_db()
    
    now = datetime.now(timezone.utc)
    
    result = await db.room_knocks.update_many(
        {
            "status": KnockStatus.PENDING,
            "expires_at": {"$lt": now}
        },
        {
            "$set": {
                "status": KnockStatus.EXPIRED,
                "updated_at": now
            }
        }
    )
    
    if result.modified_count > 0:
        logger.info(f"Expired {result.modified_count} old knocks")
    
    return result.modified_count


async def delete_knock(
    room_owner_id: str,
    visitor_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> bool:
    """
    Delete a knock record.
    
    Args:
        room_owner_id: Room owner
        visitor_id: Visitor
        db: Database connection (optional)
    
    Returns:
        True if deleted, False if not found
    """
    if db is None:
        db = await get_db()
    
    result = await db.room_knocks.delete_one({
        "room_owner_id": room_owner_id,
        "visitor_id": visitor_id
    })
    
    return result.deleted_count > 0
