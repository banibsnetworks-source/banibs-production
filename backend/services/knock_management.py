"""
Knock Management Service - BANIBS Peoples Room System
Handles knock requests, approvals, denials, and expiry
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import uuid
import logging

from db.connection import get_db
from services.relationship_helper import get_relationship_tier
from models.peoples_room import KnockStatus

logger = logging.getLogger(__name__)

# Knock TTL (Founder Decision: 30 minutes)
KNOCK_TTL_MINUTES = 30


async def create_knock(
    owner_id: str,
    visitor_id: str,
    knock_message: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Create a knock request.
    
    Args:
        owner_id: Room owner
        visitor_id: User knocking
        knock_message: Optional message from visitor
        db: Database connection (optional)
    
    Returns:
        Created knock record
    """
    if db is None:
        db = await get_db()
    
    # Check if visitor already has pending knock
    existing_knock = await db.room_knocks.find_one(
        {
            "room_owner_id": owner_id,
            "visitor_id": visitor_id,
            "status": KnockStatus.PENDING
        },
        {"_id": 0}
    )
    
    if existing_knock:
        logger.info(f"Visitor {visitor_id} already has pending knock on {owner_id}")
        return existing_knock
    
    # Get visitor's tier
    visitor_tier = await get_relationship_tier(owner_id, visitor_id, db)
    
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(minutes=KNOCK_TTL_MINUTES)
    
    knock = {
        "id": str(uuid.uuid4()),
        "room_owner_id": owner_id,
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
    
    logger.info(f"Knock created: {visitor_id} -> {owner_id} (expires in {KNOCK_TTL_MINUTES} min)")
    
    return knock


async def get_pending_knocks(
    owner_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> List[Dict[str, Any]]:
    """
    Get pending knocks for owner's room.
    
    Auto-expires old knocks before returning.
    
    Args:
        owner_id: Room owner
        db: Database connection (optional)
    
    Returns:
        List of pending knocks with visitor info
    """
    if db is None:
        db = await get_db()
    
    # Expire old knocks
    await expire_old_knocks(db)
    
    # Get pending knocks
    knocks = await db.room_knocks.find(
        {
            "room_owner_id": owner_id,
            "status": KnockStatus.PENDING
        },
        {"_id": 0}
    ).sort("created_at", -1).to_list(100)
    
    # Enrich with visitor info
    if knocks:
        visitor_ids = [knock["visitor_id"] for knock in knocks]
        visitors = await db.banibs_users.find(
            {"id": {"$in": visitor_ids}},
            {"_id": 0, "id": 1, "name": 1, "email": 1, "avatar_url": 1}
        ).to_list(100)
        
        visitor_map = {v["id"]: v for v in visitors}
        
        for knock in knocks:
            knock["visitor_info"] = visitor_map.get(knock["visitor_id"], {})
    
    return knocks


async def get_all_knocks(
    owner_id: str,
    status: Optional[str] = None,
    limit: int = 50,
    db: Optional[AsyncIOMotorDatabase] = None
) -> List[Dict[str, Any]]:
    """
    Get knocks for owner's room (with optional status filter).
    
    Args:
        owner_id: Room owner
        status: Optional status filter
        limit: Max knocks to return
        db: Database connection (optional)
    
    Returns:
        List of knocks
    """
    if db is None:
        db = await get_db()
    
    query = {"room_owner_id": owner_id}
    
    if status:
        query["status"] = status
    
    knocks = await db.room_knocks.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    # Enrich with visitor info
    if knocks:
        visitor_ids = [knock["visitor_id"] for knock in knocks]
        visitors = await db.banibs_users.find(
            {"id": {"$in": visitor_ids}},
            {"_id": 0, "id": 1, "name": 1, "email": 1, "avatar_url": 1}
        ).to_list(100)
        
        visitor_map = {v["id"]: v for v in visitors}
        
        for knock in knocks:
            knock["visitor_info"] = visitor_map.get(knock["visitor_id"], {})
    
    return knocks


async def approve_knock(
    knock_id: str,
    owner_id: str,
    remember_access: bool = False,
    response_note: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Optional[Dict[str, Any]]:
    """
    Approve a knock request.
    
    Args:
        knock_id: Knock ID
        owner_id: Room owner (for authorization)
        remember_access: If True, add visitor to Access List
        response_note: Optional note from owner
        db: Database connection (optional)
    
    Returns:
        Updated knock record or None if not found
    """
    if db is None:
        db = await get_db()
    
    # Find knock
    knock = await db.room_knocks.find_one(
        {
            "id": knock_id,
            "room_owner_id": owner_id,
            "status": KnockStatus.PENDING
        },
        {"_id": 0}
    )
    
    if not knock:
        logger.warning(f"Knock {knock_id} not found or not pending")
        return None
    
    now = datetime.now(timezone.utc)
    
    # Update knock to APPROVED
    await db.room_knocks.update_one(
        {"id": knock_id},
        {
            "$set": {
                "status": KnockStatus.APPROVED,
                "responded_at": now,
                "response_note": response_note,
                "updated_at": now
            }
        }
    )
    
    logger.info(f"Knock {knock_id} approved by {owner_id}")
    
    # If remember_access, add to Access List
    if remember_access:
        from services.room_management import add_to_access_list
        await add_to_access_list(
            owner_id,
            knock["visitor_id"],
            "DIRECT_ENTRY",
            notes="Approved via knock",
            db=db
        )
        logger.info(f"Added {knock['visitor_id']} to {owner_id}'s Access List (DIRECT_ENTRY)")
    
    # Return updated knock
    knock["status"] = KnockStatus.APPROVED
    knock["responded_at"] = now
    knock["response_note"] = response_note
    
    return knock


async def deny_knock(
    knock_id: str,
    owner_id: str,
    response_note: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Optional[Dict[str, Any]]:
    """
    Deny a knock request.
    
    Args:
        knock_id: Knock ID
        owner_id: Room owner (for authorization)
        response_note: Optional note from owner
        db: Database connection (optional)
    
    Returns:
        Updated knock record or None if not found
    """
    if db is None:
        db = await get_db()
    
    # Find knock
    knock = await db.room_knocks.find_one(
        {
            "id": knock_id,
            "room_owner_id": owner_id,
            "status": KnockStatus.PENDING
        },
        {"_id": 0}
    )
    
    if not knock:
        logger.warning(f"Knock {knock_id} not found or not pending")
        return None
    
    now = datetime.now(timezone.utc)
    
    # Update knock to DENIED
    await db.room_knocks.update_one(
        {"id": knock_id},
        {
            "$set": {
                "status": KnockStatus.DENIED,
                "responded_at": now,
                "response_note": response_note,
                "updated_at": now
            }
        }
    )
    
    logger.info(f"Knock {knock_id} denied by {owner_id}")
    
    # Log anomaly if repeated denials (for future ADCS)
    denial_count = await db.room_knocks.count_documents({
        "room_owner_id": owner_id,
        "visitor_id": knock["visitor_id"],
        "status": KnockStatus.DENIED
    })
    
    if denial_count >= 3:
        from services.trust_logger import get_trust_logger
        logger_service = get_trust_logger()
        logger_service.log_permission_check(
            check_type="room_knock",
            viewer_tier=knock["visitor_tier"],
            action="knock_denied",
            decision="deny",
            details={
                "room_owner_id": owner_id,
                "visitor_id": knock["visitor_id"],
                "denial_count": denial_count,
                "reason": "repeated_denials"
            }
        )
        logger.warning(
            f"Repeated knock denials detected: {knock['visitor_id']} -> {owner_id} "
            f"({denial_count} denials)"
        )
    
    # Return updated knock
    knock["status"] = KnockStatus.DENIED
    knock["responded_at"] = now
    knock["response_note"] = response_note
    
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


async def has_pending_knock(
    owner_id: str,
    visitor_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> bool:
    """
    Check if visitor has pending knock on owner's room.
    
    Args:
        owner_id: Room owner
        visitor_id: Visitor
        db: Database connection (optional)
    
    Returns:
        True if pending knock exists
    """
    if db is None:
        db = await get_db()
    
    knock = await db.room_knocks.find_one(
        {
            "room_owner_id": owner_id,
            "visitor_id": visitor_id,
            "status": KnockStatus.PENDING
        },
        {"_id": 0, "id": 1}
    )
    
    return knock is not None


async def has_approved_knock(
    owner_id: str,
    visitor_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> bool:
    """
    Check if visitor has approved knock (for entry permission).
    
    Args:
        owner_id: Room owner
        visitor_id: Visitor
        db: Database connection (optional)
    
    Returns:
        True if approved knock exists
    """
    if db is None:
        db = await get_db()
    
    knock = await db.room_knocks.find_one(
        {
            "room_owner_id": owner_id,
            "visitor_id": visitor_id,
            "status": KnockStatus.APPROVED
        },
        {"_id": 0, "id": 1}
    )
    
    return knock is not None


async def get_knock_count_last_hour(
    owner_id: str,
    visitor_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> int:
    """
    Get number of knocks from visitor in last hour (for rate limiting).
    
    Args:
        owner_id: Room owner
        visitor_id: Visitor
        db: Database connection (optional)
    
    Returns:
        Knock count in last hour
    """
    if db is None:
        db = await get_db()
    
    one_hour_ago = datetime.now(timezone.utc) - timedelta(hours=1)
    
    count = await db.room_knocks.count_documents({
        "room_owner_id": owner_id,
        "visitor_id": visitor_id,
        "created_at": {"$gte": one_hour_ago}
    })
    
    return count
