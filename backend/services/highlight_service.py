"""
Room Highlights Service
Handles logging and retrieval of room timeline events

Phase 6.1: Room Highlights Timeline
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from db.connection import get_db
from models.room_highlights import HighlightEventType, HighlightFilter

logger = logging.getLogger(__name__)

# Highlight TTL: 90 days
HIGHLIGHT_TTL_DAYS = 90


async def create_highlight(
    owner_id: str,
    event_type: HighlightEventType,
    visitor_id: Optional[str] = None,
    session_id: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    title: Optional[str] = None,
    description: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Create a new room highlight.
    
    Args:
        owner_id: Room owner
        event_type: Type of event
        visitor_id: Involved visitor (optional)
        session_id: Related session (optional)
        metadata: Event-specific data (optional)
        title: Human-readable title (optional, auto-generated if None)
        description: Event description (optional)
        db: Database connection (optional)
    
    Returns:
        Created highlight document
    """
    if db is None:
        db = await get_db()
    
    now = datetime.now(timezone.utc)
    expires_at = now + timedelta(days=HIGHLIGHT_TTL_DAYS)
    
    # Auto-generate title if not provided
    if title is None:
        title = _generate_title(event_type, metadata)
    
    highlight = {
        "owner_id": owner_id,
        "event_type": event_type.value,
        "visitor_id": visitor_id,
        "session_id": session_id,
        "metadata": metadata or {},
        "title": title,
        "description": description,
        "created_at": now,
        "expires_at": expires_at
    }
    
    result = await db.room_highlights.insert_one(highlight)
    highlight["_id"] = result.inserted_id
    
    logger.info(
        f"📌 Highlight created: {event_type.value} for room {owner_id} "
        f"(visitor: {visitor_id})"
    )
    
    return highlight


async def get_highlights(
    owner_id: str,
    filter_type: HighlightFilter = HighlightFilter.ALL,
    viewer_id: Optional[str] = None,
    limit: int = 50,
    skip: int = 0,
    db: Optional[AsyncIOMotorDatabase] = None
) -> List[Dict[str, Any]]:
    """
    Get highlights for a room with filtering.
    
    Args:
        owner_id: Room owner
        filter_type: Filter to apply
        viewer_id: User viewing the highlights (for permission checks)
        limit: Max number of highlights
        skip: Number to skip (pagination)
        db: Database connection (optional)
    
    Returns:
        List of highlight documents
    """
    if db is None:
        db = await get_db()
    
    # Build query
    query = {"owner_id": owner_id}
    
    # Apply filters
    if filter_type == HighlightFilter.VISITORS:
        query["event_type"] = {
            "$in": [
                HighlightEventType.VISITOR_ENTERED.value,
                HighlightEventType.VISITOR_LEFT.value
            ]
        }
    elif filter_type == HighlightFilter.KNOCKS:
        query["event_type"] = {
            "$in": [
                HighlightEventType.KNOCK_CREATED.value,
                HighlightEventType.KNOCK_APPROVED.value,
                HighlightEventType.KNOCK_DENIED.value
            ]
        }
    elif filter_type == HighlightFilter.MY_ACTIVITY:
        # Only show events involving the viewer
        if viewer_id:
            query["$or"] = [
                {"visitor_id": viewer_id},
                {"owner_id": viewer_id}  # If viewer is the owner
            ]
    
    # Fetch highlights
    highlights = await db.room_highlights.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(limit)
    
    # Enrich with user info
    for highlight in highlights:
        # Get visitor info if present
        if highlight.get("visitor_id"):
            visitor = await db.banibs_users.find_one(
                {"id": highlight["visitor_id"]},
                {"_id": 0, "id": 1, "name": 1, "avatar_url": 1, "handle": 1}
            )
            if visitor:
                highlight["visitor_info"] = visitor
        
        # Get owner info
        owner = await db.banibs_users.find_one(
            {"id": highlight["owner_id"]},
            {"_id": 0, "id": 1, "name": 1, "avatar_url": 1, "handle": 1}
        )
        if owner:
            highlight["owner_info"] = owner
    
    return highlights


async def get_highlight_count(
    owner_id: str,
    filter_type: HighlightFilter = HighlightFilter.ALL,
    viewer_id: Optional[str] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> int:
    """
    Get count of highlights for pagination.
    """
    if db is None:
        db = await get_db()
    
    query = {"owner_id": owner_id}
    
    if filter_type == HighlightFilter.VISITORS:
        query["event_type"] = {
            "$in": [
                HighlightEventType.VISITOR_ENTERED.value,
                HighlightEventType.VISITOR_LEFT.value
            ]
        }
    elif filter_type == HighlightFilter.KNOCKS:
        query["event_type"] = {
            "$in": [
                HighlightEventType.KNOCK_CREATED.value,
                HighlightEventType.KNOCK_APPROVED.value,
                HighlightEventType.KNOCK_DENIED.value
            ]
        }
    elif filter_type == HighlightFilter.MY_ACTIVITY and viewer_id:
        query["$or"] = [
            {"visitor_id": viewer_id},
            {"owner_id": viewer_id}
        ]
    
    return await db.room_highlights.count_documents(query)


async def create_special_moment(
    owner_id: str,
    title: str,
    description: Optional[str] = None,
    metadata: Optional[Dict[str, Any]] = None,
    db: Optional[AsyncIOMotorDatabase] = None
) -> Dict[str, Any]:
    """
    Create a special owner-defined moment.
    
    This allows owners to manually add highlights to their room timeline.
    """
    return await create_highlight(
        owner_id=owner_id,
        event_type=HighlightEventType.SPECIAL_MOMENT,
        title=title,
        description=description,
        metadata=metadata,
        db=db
    )


def _generate_title(event_type: HighlightEventType, metadata: Optional[Dict] = None) -> str:
    """Generate human-readable title from event type and metadata"""
    metadata = metadata or {}
    
    templates = {
        HighlightEventType.SESSION_STARTED: "Room session started",
        HighlightEventType.SESSION_ENDED: "Room session ended",
        HighlightEventType.DOOR_LOCKED: "Doors locked",
        HighlightEventType.DOOR_UNLOCKED: "Doors unlocked",
        HighlightEventType.VISITOR_ENTERED: f"{metadata.get('visitor_name', 'A visitor')} entered",
        HighlightEventType.VISITOR_LEFT: f"{metadata.get('visitor_name', 'A visitor')} left",
        HighlightEventType.KNOCK_CREATED: f"{metadata.get('visitor_name', 'Someone')} knocked",
        HighlightEventType.KNOCK_APPROVED: f"Knock from {metadata.get('visitor_name', 'visitor')} approved",
        HighlightEventType.KNOCK_DENIED: f"Knock from {metadata.get('visitor_name', 'visitor')} denied",
        HighlightEventType.SPECIAL_MOMENT: "Special moment"
    }
    
    return templates.get(event_type, "Room event")


# Convenience functions for common highlights

async def log_session_started_highlight(owner_id: str, session_id: str, db=None):
    """Log when owner enters room"""
    return await create_highlight(
        owner_id=owner_id,
        event_type=HighlightEventType.SESSION_STARTED,
        session_id=session_id,
        db=db
    )


async def log_session_ended_highlight(owner_id: str, session_id: str, visitor_count: int, db=None):
    """Log when owner exits room"""
    return await create_highlight(
        owner_id=owner_id,
        event_type=HighlightEventType.SESSION_ENDED,
        session_id=session_id,
        metadata={"visitors_kicked": visitor_count},
        db=db
    )


async def log_visitor_entered_highlight(owner_id: str, visitor_id: str, visitor_name: str, visitor_tier: str, session_id: str, db=None):
    """Log when visitor enters"""
    return await create_highlight(
        owner_id=owner_id,
        event_type=HighlightEventType.VISITOR_ENTERED,
        visitor_id=visitor_id,
        session_id=session_id,
        metadata={
            "visitor_name": visitor_name,
            "visitor_tier": visitor_tier
        },
        db=db
    )


async def log_visitor_left_highlight(owner_id: str, visitor_id: str, visitor_name: str, session_id: str, db=None):
    """Log when visitor leaves"""
    return await create_highlight(
        owner_id=owner_id,
        event_type=HighlightEventType.VISITOR_LEFT,
        visitor_id=visitor_id,
        session_id=session_id,
        metadata={"visitor_name": visitor_name},
        db=db
    )


async def log_knock_created_highlight(owner_id: str, visitor_id: str, visitor_name: str, db=None):
    """Log when someone knocks"""
    return await create_highlight(
        owner_id=owner_id,
        event_type=HighlightEventType.KNOCK_CREATED,
        visitor_id=visitor_id,
        metadata={"visitor_name": visitor_name},
        db=db
    )


async def log_knock_approved_highlight(owner_id: str, visitor_id: str, visitor_name: str, db=None):
    """Log when knock is approved"""
    return await create_highlight(
        owner_id=owner_id,
        event_type=HighlightEventType.KNOCK_APPROVED,
        visitor_id=visitor_id,
        metadata={"visitor_name": visitor_name},
        db=db
    )


async def log_knock_denied_highlight(owner_id: str, visitor_id: str, visitor_name: str, db=None):
    """Log when knock is denied"""
    return await create_highlight(
        owner_id=owner_id,
        event_type=HighlightEventType.KNOCK_DENIED,
        visitor_id=visitor_id,
        metadata={"visitor_name": visitor_name},
        db=db
    )


async def log_door_locked_highlight(owner_id: str, db=None):
    """Log when doors are locked"""
    return await create_highlight(
        owner_id=owner_id,
        event_type=HighlightEventType.DOOR_LOCKED,
        db=db
    )


async def log_door_unlocked_highlight(owner_id: str, db=None):
    """Log when doors are unlocked"""
    return await create_highlight(
        owner_id=owner_id,
        event_type=HighlightEventType.DOOR_UNLOCKED,
        db=db
    )
