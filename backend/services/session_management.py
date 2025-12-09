"""
Session Management Service - BANIBS Peoples Room System
Handles room sessions (owner presence) and visitor management
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from db.connection import get_db
from services.relationship_helper import get_relationship_tier

logger = logging.getLogger(__name__)


async def get_active_session(
    owner_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Optional[Dict[str, Any]]:
    """
    Get active room session for owner.
    
    Args:
        owner_id: Room owner
        db: Database connection (optional)
    
    Returns:
        Active session dict or None
    """
    if db is None:
        db = await get_db()
    
    session = await db.room_sessions.find_one(
        {
            "room_owner_id": owner_id,
            "is_active": True
        },
        {"_id": 0}
    )
    
    return session


async def enter_room(
    owner_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Owner enters their room (starts/reactivates session).
    
    Args:
        owner_id: Room owner
        db: Database connection (optional)
    
    Returns:
        Active session
    """
    if db is None:
        db = await get_db()
    
    # Check if active session already exists
    existing_session = await get_active_session(owner_id, db)
    
    if existing_session:
        logger.info(f"Owner {owner_id} already has active session")
        return existing_session
    
    # Create new session
    now = datetime.now(timezone.utc)
    
    new_session = {
        "room_owner_id": owner_id,
        "is_active": True,
        "started_at": now,
        "ended_at": None,
        "current_visitors": []
    }
    
    await db.room_sessions.insert_one(new_session)
    
    logger.info(f"Owner {owner_id} entered their room (new session)")
    
    # Return the session without the MongoDB _id field
    return {k: v for k, v in new_session.items() if k != "_id"}


async def exit_room(
    owner_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Owner exits their room (ends session, kicks all visitors).
    
    Founder Decision: EXIT = kick everyone and end session.
    
    Args:
        owner_id: Room owner
        db: Database connection (optional)
    
    Returns:
        Result with ended_at timestamp
    """
    if db is None:
        db = await get_db()
    
    now = datetime.now(timezone.utc)
    
    # End active session
    result = await db.room_sessions.update_one(
        {
            "room_owner_id": owner_id,
            "is_active": True
        },
        {
            "$set": {
                "is_active": False,
                "ended_at": now,
                "current_visitors": []  # Kick all visitors
            }
        }
    )
    
    if result.modified_count > 0:
        logger.info(f"Owner {owner_id} exited room (session ended, visitors kicked)")
    else:
        logger.warning(f"Owner {owner_id} tried to exit but had no active session")
    
    return {
        "session_ended": True,
        "ended_at": now,
        "visitors_kicked": True
    }


async def add_visitor(
    owner_id: str,
    visitor_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Add visitor to room session.
    
    Args:
        owner_id: Room owner
        visitor_id: Visitor to add
        db: Database connection (optional)
    
    Returns:
        Updated session
    """
    if db is None:
        db = await get_db()
    
    # Get visitor's tier
    visitor_tier = await get_relationship_tier(owner_id, visitor_id, db)
    
    now = datetime.now(timezone.utc)
    
    visitor_entry = {
        "user_id": visitor_id,
        "joined_at": now,
        "tier": visitor_tier
    }
    
    # Add visitor to session
    await db.room_sessions.update_one(
        {
            "room_owner_id": owner_id,
            "is_active": True
        },
        {
            "$addToSet": {"current_visitors": visitor_entry}
        }
    )
    
    logger.info(f"Visitor {visitor_id} entered room {owner_id}")
    
    # Return updated session
    return await get_active_session(owner_id, db)


async def remove_visitor(
    owner_id: str,
    visitor_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Remove visitor from room session.
    
    Args:
        owner_id: Room owner
        visitor_id: Visitor to remove
        db: Database connection (optional)
    
    Returns:
        Updated session
    """
    if db is None:
        db = await get_db()
    
    # Remove visitor from session
    await db.room_sessions.update_one(
        {
            "room_owner_id": owner_id,
            "is_active": True
        },
        {
            "$pull": {"current_visitors": {"user_id": visitor_id}}
        }
    )
    
    logger.info(f"Visitor {visitor_id} left room {owner_id}")
    
    # Return updated session
    return await get_active_session(owner_id, db)


async def is_visitor_in_room(
    owner_id: str,
    visitor_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> bool:
    """
    Check if visitor is currently in room.
    
    Args:
        owner_id: Room owner
        visitor_id: Visitor to check
        db: Database connection (optional)
    
    Returns:
        True if visitor is in room
    """
    if db is None:
        db = await get_db()
    
    session = await db.room_sessions.find_one(
        {
            "room_owner_id": owner_id,
            "is_active": True,
            "current_visitors.user_id": visitor_id
        },
        {"_id": 0, "current_visitors": 1}
    )
    
    return session is not None


async def get_visitor_count(
    owner_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> int:
    """
    Get number of visitors currently in room.
    
    Args:
        owner_id: Room owner
        db: Database connection (optional)
    
    Returns:
        Visitor count
    """
    session = await get_active_session(owner_id, db)
    
    if not session:
        return 0
    
    return len(session.get("current_visitors", []))
