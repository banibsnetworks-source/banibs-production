"""
Room Highlights API Routes
Timeline of room events for memory & narrative

Phase 6.1: Room Highlights Timeline
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
import logging

from db.connection import get_db
from middleware.auth_guard import get_current_user
from services.highlight_service import (
    get_highlights,
    get_highlight_count,
    create_special_moment
)
from services.room_permissions import RoomPermissionService
from models.room_highlights import HighlightFilter

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/rooms", tags=["Room Highlights"])


@router.get("/me/highlights")
async def get_my_room_highlights(
    filter: str = Query("all", description="Filter: all, visitors, knocks, my_activity"),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get highlights for owner's room.
    
    Query Params:
        - filter: all, visitors, knocks, my_activity
        - limit: Max highlights to return (default 50)
        - skip: Pagination offset (default 0)
    
    Returns:
        - highlights: List of highlight events
        - total: Total count
        - filter: Applied filter
    """
    user_id = current_user["id"]
    
    # Validate filter
    try:
        filter_type = HighlightFilter(filter)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid filter: {filter}. Must be: all, visitors, knocks, my_activity"
        )
    
    # Get highlights
    highlights = await get_highlights(
        owner_id=user_id,
        filter_type=filter_type,
        viewer_id=user_id,
        limit=limit,
        skip=skip,
        db=db
    )
    
    # Get total count for pagination
    total = await get_highlight_count(
        owner_id=user_id,
        filter_type=filter_type,
        viewer_id=user_id,
        db=db
    )
    
    return {
        "highlights": highlights,
        "total": total,
        "filter": filter,
        "limit": limit,
        "skip": skip
    }


@router.get("/{owner_id}/highlights")
async def get_room_highlights(
    owner_id: str,
    filter: str = Query("all", description="Filter: all, visitors, knocks, my_activity"),
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user = Depends(get_current_user_from_token),
    db = Depends(get_db)
):
    """
    Get highlights for another user's room (visitor view).
    
    Permission Check: Only if visitor can see the room.
    
    Query Params:
        - filter: all, visitors, knocks, my_activity
        - limit: Max highlights to return (default 50)
        - skip: Pagination offset (default 0)
    
    Returns:
        - highlights: List of highlight events
        - total: Total count
        - filter: Applied filter
    """
    viewer_id = current_user["id"]
    
    # Permission check: Can viewer see this room?
    can_see = await RoomPermissionService.can_see_room(owner_id, viewer_id, db)
    
    if not can_see:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this room's highlights"
        )
    
    # Validate filter
    try:
        filter_type = HighlightFilter(filter)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid filter: {filter}. Must be: all, visitors, knocks, my_activity"
        )
    
    # Get highlights
    highlights = await get_highlights(
        owner_id=owner_id,
        filter_type=filter_type,
        viewer_id=viewer_id,
        limit=limit,
        skip=skip,
        db=db
    )
    
    # Get total count
    total = await get_highlight_count(
        owner_id=owner_id,
        filter_type=filter_type,
        viewer_id=viewer_id,
        db=db
    )
    
    return {
        "highlights": highlights,
        "total": total,
        "filter": filter,
        "limit": limit,
        "skip": skip
    }


@router.post("/me/highlights/special")
async def create_special_room_moment(
    title: str = Query(..., max_length=200),
    description: Optional[str] = Query(None, max_length=500),
    current_user = Depends(get_current_user_from_token),
    db = Depends(get_db)
):
    """
    Create a special owner-defined moment in the room timeline.
    
    Query Params:
        - title: Title of the moment (max 200 chars)
        - description: Optional description (max 500 chars)
    
    Returns:
        - highlight: Created highlight
        - message: Success message
    """
    user_id = current_user["id"]
    
    if not title or not title.strip():
        raise HTTPException(status_code=400, detail="Title is required")
    
    highlight = await create_special_moment(
        owner_id=user_id,
        title=title.strip(),
        description=description.strip() if description else None,
        db=db
    )
    
    # TODO: Broadcast WebSocket event: HIGHLIGHT_NEW
    logger.info(f"⭐ Special moment created by {user_id}: {title}")
    
    return {
        "highlight": highlight,
        "message": "Special moment created"
    }
