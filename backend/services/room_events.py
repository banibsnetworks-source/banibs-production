"""
Room Event Logger - BANIBS Peoples Room System
Logs room events for future social integrations (stories, highlights, analytics)

Future integrations:
- Stories: "Just had a great session in my room!"
- Highlights: Room timeline & memorable moments
- Analytics: Room usage patterns, engagement
- Notifications: Real-time updates to visitors/owner
"""

from datetime import datetime, timezone
from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from db.connection import get_db

logger = logging.getLogger(__name__)

# Event types (for future social media integrations)
EVENT_TYPES = {
    "ROOM_SESSION_STARTED": "room_session_started",
    "ROOM_SESSION_ENDED": "room_session_ended",
    "ROOM_KNOCK_CREATED": "room_knock_created",
    "ROOM_KNOCK_APPROVED": "room_knock_approved",
    "ROOM_KNOCK_DENIED": "room_knock_denied",
    "ROOM_KNOCK_EXPIRED": "room_knock_expired",
    "ROOM_VISITOR_ENTERED": "room_visitor_entered",
    "ROOM_VISITOR_LEFT": "room_visitor_left",
    "ROOM_SETTINGS_UPDATED": "room_settings_updated",
    "ROOM_DOOR_LOCKED": "room_door_locked",
    "ROOM_DOOR_UNLOCKED": "room_door_unlocked"
}


async def log_room_event(
    event_type: str,
    room_owner_id: str,
    actor_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Log a room event for future social integrations.
    
    Args:
        event_type: Event type constant (e.g., "ROOM_KNOCK_CREATED")
        room_owner_id: Owner of the room where event occurred
        actor_id: User who triggered the event (optional)
        metadata: Additional event data (optional)
        db: Database connection (optional)
    
    Returns:
        Logged event document
    
    Future Uses:
        - Story generation: "3 friends visited my room today!"
        - Room highlights: Timeline of memorable moments
        - Analytics: Room usage patterns
        - Notifications: Real-time updates
    """
    if db is None:
        db = await get_db()
    
    if event_type not in EVENT_TYPES.values():
        logger.warning(f"Unknown event type: {event_type}")
        return {}
    
    now = datetime.now(timezone.utc)
    
    event = {
        "event_type": event_type,
        "room_owner_id": room_owner_id,
        "actor_id": actor_id,
        "metadata": metadata or {},
        "created_at": now,
        # TTL: Keep events for 90 days (configurable)
        "expires_at": datetime.fromtimestamp(
            now.timestamp() + (90 * 24 * 60 * 60),
            tz=timezone.utc
        )
    }
    
    await db.room_events.insert_one(event)
    
    logger.info(
        f"📊 Room Event Logged: {event_type} | "
        f"Owner: {room_owner_id} | Actor: {actor_id}"
    )
    
    # TODO: Future integrations
    # - WebSocket broadcast to relevant users
    # - Story/Reel auto-generation suggestions
    # - Room highlight timeline updates
    # - Push notifications
    
    return event


async def get_room_events(
    room_owner_id: str,
    event_type: Optional[str] = None,
    limit: int = 50,
    db: Optional[AsyncIOMotorDatabase] = None
) -> list:
    """
    Get room events for analytics or timeline display.
    
    Future use: Power the "Room Highlights" timeline.
    """
    if db is None:
        db = await get_db()
    
    query = {"room_owner_id": room_owner_id}
    
    if event_type:
        query["event_type"] = event_type
    
    events = await db.room_events.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(limit)
    
    return events


async def get_room_activity_summary(
    room_owner_id: str,
    days: int = 7,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Get room activity summary for the past N days.
    
    Future use: Power creator analytics & room insights.
    """
    if db is None:
        db = await get_db()
    
    from datetime import timedelta
    since = datetime.now(timezone.utc) - timedelta(days=days)
    
    # Count events by type
    pipeline = [
        {
            "$match": {
                "room_owner_id": room_owner_id,
                "created_at": {"$gte": since}
            }
        },
        {
            "$group": {
                "_id": "$event_type",
                "count": {"$sum": 1}
            }
        }
    ]
    
    result = await db.room_events.aggregate(pipeline).to_list(None)
    
    summary = {
        "room_owner_id": room_owner_id,
        "period_days": days,
        "events_by_type": {item["_id"]: item["count"] for item in result},
        "total_events": sum(item["count"] for item in result)
    }
    
    return summary


# Convenience functions for each event type

async def log_session_started(room_owner_id: str, db=None):
    """Owner enters their room"""
    return await log_room_event(
        EVENT_TYPES["ROOM_SESSION_STARTED"],
        room_owner_id,
        actor_id=room_owner_id,
        db=db
    )


async def log_session_ended(room_owner_id: str, visitor_count: int = 0, db=None):
    """Owner exits their room"""
    return await log_room_event(
        EVENT_TYPES["ROOM_SESSION_ENDED"],
        room_owner_id,
        actor_id=room_owner_id,
        metadata={"visitors_kicked": visitor_count},
        db=db
    )


async def log_knock_created(room_owner_id: str, visitor_id: str, db=None):
    """Visitor knocks on door"""
    return await log_room_event(
        EVENT_TYPES["ROOM_KNOCK_CREATED"],
        room_owner_id,
        actor_id=visitor_id,
        db=db
    )


async def log_knock_approved(room_owner_id: str, visitor_id: str, db=None):
    """Owner approves knock"""
    return await log_room_event(
        EVENT_TYPES["ROOM_KNOCK_APPROVED"],
        room_owner_id,
        actor_id=room_owner_id,
        metadata={"visitor_id": visitor_id},
        db=db
    )


async def log_knock_denied(room_owner_id: str, visitor_id: str, db=None):
    """Owner denies knock"""
    return await log_room_event(
        EVENT_TYPES["ROOM_KNOCK_DENIED"],
        room_owner_id,
        actor_id=room_owner_id,
        metadata={"visitor_id": visitor_id},
        db=db
    )


async def log_visitor_entered(room_owner_id: str, visitor_id: str, db=None):
    """Visitor enters room"""
    return await log_room_event(
        EVENT_TYPES["ROOM_VISITOR_ENTERED"],
        room_owner_id,
        actor_id=visitor_id,
        db=db
    )


async def log_visitor_left(room_owner_id: str, visitor_id: str, db=None):
    """Visitor leaves room"""
    return await log_room_event(
        EVENT_TYPES["ROOM_VISITOR_LEFT"],
        room_owner_id,
        actor_id=visitor_id,
        db=db
    )


async def log_door_locked(room_owner_id: str, db=None):
    """Owner locks room doors"""
    return await log_room_event(
        EVENT_TYPES["ROOM_DOOR_LOCKED"],
        room_owner_id,
        actor_id=room_owner_id,
        db=db
    )


async def log_door_unlocked(room_owner_id: str, db=None):
    """Owner unlocks room doors"""
    return await log_room_event(
        EVENT_TYPES["ROOM_DOOR_UNLOCKED"],
        room_owner_id,
        actor_id=room_owner_id,
        db=db
    )
