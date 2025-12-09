"""
MongoDB Indices for Peoples Room Collections
Creates all required indices for optimal query performance
"""

import asyncio
import logging
from motor.motor_asyncio import AsyncIOMotorDatabase
from db.connection import get_db

logger = logging.getLogger(__name__)


async def ensure_peoples_room_indices(db: AsyncIOMotorDatabase):
    """
    Create all indices for Peoples Room collections.
    
    Collections:
        - peoples_rooms
        - room_sessions
        - room_knocks
    """
    
    # ========== peoples_rooms indices ==========
    try:
        # Unique index on owner_id
        await db.peoples_rooms.create_index(
            [("owner_id", 1)],
            unique=True,
            name="owner_id_unique"
        )
        logger.info("✓ Created unique index on peoples_rooms.owner_id")
        
        # Index on access_list.user_id for permission checks
        await db.peoples_rooms.create_index(
            [("access_list.user_id", 1)],
            name="access_list_user_id"
        )
        logger.info("✓ Created index on peoples_rooms.access_list.user_id")
        
    except Exception as e:
        logger.error(f"Error creating peoples_rooms indices: {e}")
    
    # ========== room_sessions indices ==========
    try:
        # Compound index on room_owner_id + is_active
        await db.room_sessions.create_index(
            [("room_owner_id", 1), ("is_active", 1)],
            name="room_owner_active"
        )
        logger.info("✓ Created index on room_sessions (room_owner_id, is_active)")
        
        # Index on current_visitors.user_id for visitor lookups
        await db.room_sessions.create_index(
            [("current_visitors.user_id", 1)],
            name="current_visitors_user_id"
        )
        logger.info("✓ Created index on room_sessions.current_visitors.user_id")
        
    except Exception as e:
        logger.error(f"Error creating room_sessions indices: {e}")
    
    # ========== room_knocks indices ==========
    try:
        # Compound index on room_owner_id + status (for fetching knocks)
        await db.room_knocks.create_index(
            [("room_owner_id", 1), ("status", 1)],
            name="room_owner_status"
        )
        logger.info("✓ Created index on room_knocks (room_owner_id, status)")
        
        # Index on visitor_id for visitor's knock history
        await db.room_knocks.create_index(
            [("visitor_id", 1)],
            name="visitor_id"
        )
        logger.info("✓ Created index on room_knocks.visitor_id")
        
        # Index on expires_at for auto-expiry queries
        await db.room_knocks.create_index(
            [("expires_at", 1)],
            name="expires_at"
        )
        logger.info("✓ Created index on room_knocks.expires_at")
        
        # Compound index for finding pending knocks by visitor
        await db.room_knocks.create_index(
            [("room_owner_id", 1), ("visitor_id", 1), ("status", 1)],
            name="room_visitor_status"
        )
        logger.info("✓ Created compound index on room_knocks (room_owner_id, visitor_id, status)")
        
    except Exception as e:
        logger.error(f"Error creating room_knocks indices: {e}")
    
    logger.info("✅ All Peoples Room indices ensured")
    
    # ========== room_events indices (for future social integrations) ==========
    try:
        # Compound index on room_owner_id + created_at
        await db.room_events.create_index(
            [("room_owner_id", 1), ("created_at", -1)],
            name="room_owner_created_at"
        )
        logger.info("✓ Created index on room_events (room_owner_id, created_at)")
        
        # Index on event_type for filtering
        await db.room_events.create_index(
            [("event_type", 1)],
            name="event_type"
        )
        logger.info("✓ Created index on room_events.event_type")
        
        # TTL index on expires_at (auto-delete old events after 90 days)
        await db.room_events.create_index(
            [("expires_at", 1)],
            expireAfterSeconds=0,
            name="expires_at_ttl"
        )
        logger.info("✓ Created TTL index on room_events.expires_at")
        
    except Exception as e:
        logger.error(f"Error creating room_events indices: {e}")
    
    logger.info("✅ All Peoples Room + Events indices ensured")


async def main():
    """Test function to run index creation"""
    db = await get_db()
    await ensure_peoples_room_indices(db)


if __name__ == "__main__":
    asyncio.run(main())
