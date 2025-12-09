"""
Room Management Service - BANIBS Peoples Room System
Handles room creation, configuration, and updates
"""

from typing import Optional, Dict, Any
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from db.connection import get_db
from models.peoples_room import (
    PeoplesRoom,
    DoorState,
    PresenceMode,
    VisitorListMode,
    TierRules,
    AccessListEntry,
    AccessMode
)

logger = logging.getLogger(__name__)

# Default tier rules (Founder-approved)
DEFAULT_TIER_RULES = {
    "PEOPLES": {
        "can_see_room": True,
        "can_knock": True,
        "can_enter_direct": True
    },
    "COOL": {
        "can_see_room": True,
        "can_knock": True,
        "can_enter_direct": False
    },
    "CHILL": {
        "can_see_room": True,
        "can_knock": True,
        "can_enter_direct": False
    },
    "ALRIGHT": {
        "can_see_room": False,
        "can_knock": False,
        "can_enter_direct": False
    },
    "OTHERS": {
        "can_see_room": False,
        "can_knock": False,
        "can_enter_direct": False
    },
    "OTHERS_SAFE_MODE": {
        "can_see_room": False,
        "can_knock": False,
        "can_enter_direct": False
    },
    "BLOCKED": {
        "can_see_room": False,
        "can_knock": False,
        "can_enter_direct": False
    }
}


async def get_or_create_room(
    owner_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Get room for owner, creating if it doesn't exist.
    
    Args:
        owner_id: Room owner's user ID
        db: Database connection (optional)
    
    Returns:
        Room configuration dict
    """
    if db is None:
        db = await get_db()
    
    # Try to get existing room
    room = await db.peoples_rooms.find_one(
        {"owner_id": owner_id},
        {"_id": 0}
    )
    
    if room:
        return room
    
    # Create new room with defaults
    now = datetime.now(timezone.utc)
    
    new_room = {
        "owner_id": owner_id,
        "door_state": DoorState.OPEN,
        "presence_mode": PresenceMode.PUBLIC_ROOM_PRESENCE,
        "room_visible_to_tiers": ["PEOPLES", "COOL", "CHILL"],
        "room_visible_to_circles": [],
        "room_visible_to_users": [],
        "show_visitor_list_mode": VisitorListMode.FULL,
        "tier_rules": DEFAULT_TIER_RULES,
        "access_list": [],
        "allowed_circles_can_enter": [],
        "allowed_circles_can_knock": [],
        "created_at": now,
        "updated_at": now
    }
    
    await db.peoples_rooms.insert_one(new_room)
    
    logger.info(f"Created new room for owner {owner_id}")
    
    return new_room


async def update_room_settings(
    owner_id: str,
    updates: Dict[str, Any],
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Update room configuration.
    
    Args:
        owner_id: Room owner
        updates: Dictionary of fields to update
        db: Database connection (optional)
    
    Returns:
        Updated room configuration
    """
    if db is None:
        db = await get_db()
    
    # Ensure room exists
    await get_or_create_room(owner_id, db)
    
    # Add updated_at timestamp
    updates["updated_at"] = datetime.now(timezone.utc)
    
    # Update room
    await db.peoples_rooms.update_one(
        {"owner_id": owner_id},
        {"$set": updates}
    )
    
    # Fetch and return updated room
    updated_room = await db.peoples_rooms.find_one(
        {"owner_id": owner_id},
        {"_id": 0}
    )
    
    logger.info(f"Updated room settings for owner {owner_id}: {list(updates.keys())}")
    
    return updated_room


async def add_to_access_list(
    owner_id: str,
    user_id: str,
    access_mode: str,
    temporary: bool = False,
    expires_at: Optional[datetime] = None,
    notes: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Add user to room's access list.
    
    Args:
        owner_id: Room owner
        user_id: User to add
        access_mode: DIRECT_ENTRY, MUST_KNOCK, or NEVER_ALLOW
        temporary: If True, entry expires
        expires_at: Expiration datetime (if temporary)
        notes: Optional notes
        db: Database connection (optional)
    
    Returns:
        Updated room configuration
    """
    if db is None:
        db = await get_db()
    
    # Ensure room exists
    room = await get_or_create_room(owner_id, db)
    
    # Check if user already in access list
    access_list = room.get("access_list", [])
    
    # Remove existing entry if present
    access_list = [entry for entry in access_list if entry["user_id"] != user_id]
    
    # Add new entry
    new_entry = {
        "user_id": user_id,
        "access_mode": access_mode,
        "temporary": temporary,
        "expires_at": expires_at,
        "notes": notes,
        "added_at": datetime.now(timezone.utc)
    }
    
    access_list.append(new_entry)
    
    # Update room
    await db.peoples_rooms.update_one(
        {"owner_id": owner_id},
        {
            "$set": {
                "access_list": access_list,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    logger.info(f"Added {user_id} to access list for {owner_id} ({access_mode})")
    
    # Return updated room
    return await db.peoples_rooms.find_one(
        {"owner_id": owner_id},
        {"_id": 0}
    )


async def remove_from_access_list(
    owner_id: str,
    user_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Remove user from room's access list.
    
    Args:
        owner_id: Room owner
        user_id: User to remove
        db: Database connection (optional)
    
    Returns:
        Updated room configuration
    """
    if db is None:
        db = await get_db()
    
    # Remove user from access list
    await db.peoples_rooms.update_one(
        {"owner_id": owner_id},
        {
            "$pull": {"access_list": {"user_id": user_id}},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    logger.info(f"Removed {user_id} from access list for {owner_id}")
    
    # Return updated room
    return await db.peoples_rooms.find_one(
        {"owner_id": owner_id},
        {"_id": 0}
    )


async def lock_room_doors(
    owner_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Lock room doors (blocks new knocks and entries).
    
    Founder Decision: Existing visitors may remain.
    
    Args:
        owner_id: Room owner
        db: Database connection (optional)
    
    Returns:
        Updated room configuration
    """
    return await update_room_settings(
        owner_id,
        {"door_state": DoorState.LOCKED},
        db
    )


async def unlock_room_doors(
    owner_id: str,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Unlock room doors (resumes normal knock/entry behavior).
    
    Args:
        owner_id: Room owner
        db: Database connection (optional)
    
    Returns:
        Updated room configuration
    """
    return await update_room_settings(
        owner_id,
        {"door_state": DoorState.OPEN},
        db
    )
