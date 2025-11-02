"""
Events API Routes
Phase 6.2.3 - Resources & Events
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from datetime import datetime
from models.event import (
    EventCreate,
    EventUpdate,
    EventPublic,
    EventListResponse,
    RSVPResponse
)
from db.events import (
    create_event,
    get_events,
    get_event_by_id,
    update_event,
    delete_event,
    rsvp_to_event,
    cancel_rsvp,
    get_user_rsvps
)
from db.notifications import create_notification
from middleware.auth_guard import get_current_user, require_role
import math

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=EventListResponse)
async def list_events(
    status: Optional[str] = Query(None, description="upcoming, ongoing, completed, cancelled"),
    category: Optional[str] = Query(None),
    event_type: Optional[str] = Query(None),
    featured: Optional[bool] = Query(None),
    start_date: Optional[str] = Query(None, description="ISO date, filter events after this date"),
    end_date: Optional[str] = Query(None, description="ISO date, filter events before this date"),
    limit: int = Query(20, ge=1, le=50),
    skip: int = Query(0, ge=0)
):
    """
    List events (public endpoint)
    
    Query params:
    - status: Filter by status (upcoming, ongoing, completed, cancelled)
    - category: Filter by category
    - event_type: Filter by type (In-Person, Virtual, Hybrid)
    - featured: Featured events only
    - start_date: Events after this date (ISO format)
    - end_date: Events before this date (ISO format)
    - limit: Items per page (1-50, default 20)
    - skip: Pagination offset
    """
    # Parse dates
    start_date_dt = datetime.fromisoformat(start_date) if start_date else None
    end_date_dt = datetime.fromisoformat(end_date) if end_date else None
    
    # Get events
    events, total = await get_events(
        status=status,
        category=category,
        event_type=event_type,
        featured=featured,
        start_date_after=start_date_dt,
        start_date_before=end_date_dt,
        limit=limit,
        skip=skip
    )
    
    # Calculate pagination
    page = (skip // limit) + 1
    pages = math.ceil(total / limit) if total > 0 else 1
    
    return EventListResponse(
        events=[EventPublic(**e) for e in events],
        total=total,
        page=page,
        pages=pages
    )


@router.get("/{event_id}", response_model=EventPublic)
async def get_event(event_id: str):
    """
    Get event details (public endpoint)
    """
    event = await get_event_by_id(event_id)
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return EventPublic(**event)


@router.post("", response_model=EventPublic, status_code=201)
async def create_event_endpoint(
    event_data: EventCreate,
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """
    Create new event (admin/moderator only)
    
    Requires JWT with role: super_admin or moderator
    """
    # Validate dates
    if event_data.end_date <= event_data.start_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    created = await create_event(
        title=event_data.title,
        description=event_data.description,
        category=event_data.category,
        start_date=event_data.start_date,
        end_date=event_data.end_date,
        timezone_str=event_data.timezone,
        event_type=event_data.event_type,
        organizer_id=current_user["id"],
        organizer_name=current_user["name"],
        organizer_email=event_data.organizer_email,
        location_name=event_data.location_name,
        location_address=event_data.location_address,
        location_url=str(event_data.location_url) if event_data.location_url else None,
        virtual_url=str(event_data.virtual_url) if event_data.virtual_url else None,
        image_url=str(event_data.image_url) if event_data.image_url else None,
        rsvp_limit=event_data.rsvp_limit,
        tags=event_data.tags,
        featured=event_data.featured
    )
    
    return EventPublic(**created)


@router.patch("/{event_id}", response_model=EventPublic)
async def update_event_endpoint(
    event_id: str,
    event_data: EventUpdate,
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """
    Update event (admin/moderator only)
    
    Requires JWT with role: super_admin or moderator
    """
    # Build update dict
    update_dict = event_data.dict(exclude_unset=True)
    
    # Convert URLs
    for url_field in ["location_url", "virtual_url", "image_url"]:
        if url_field in update_dict and update_dict[url_field]:
            update_dict[url_field] = str(update_dict[url_field])
    
    updated = await update_event(event_id, update_dict)
    
    if not updated:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return EventPublic(**updated)


@router.delete("/{event_id}")
async def delete_event_endpoint(
    event_id: str,
    current_user: dict = Depends(require_role("super_admin"))
):
    """
    Delete event (admin only)
    
    Requires JWT with role: super_admin
    """
    deleted = await delete_event(event_id)
    
    if not deleted:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return {"deleted": True}


@router.post("/{event_id}/rsvp", response_model=RSVPResponse)
async def rsvp_event(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    RSVP to an event (authenticated users)
    
    Side effects:
    - Adds user to event's rsvp_users array
    - Increments rsvp_count
    - Creates notification for RSVP confirmation
    
    Returns 400 if event is full or has ended
    """
    user_id = current_user["id"]
    
    result = await rsvp_to_event(event_id, user_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if result.get("event_full"):
        raise HTTPException(status_code=400, detail="Event is full")
    
    if result.get("event_ended"):
        raise HTTPException(status_code=400, detail="Event has already ended")
    
    # Create RSVP confirmation notification
    if not result.get("already_rsvpd"):
        await create_notification(
            user_id=user_id,
            notification_type="event",
            title=f"RSVP Confirmed: {result['title']}",
            message=f"You're registered! Event starts {result['start_date'].strftime('%b %d at %I:%M %p')}.",
            link=f"/events/{event_id}"
        )
    
    return RSVPResponse(
        rsvp_status="confirmed",
        event_id=event_id,
        user_id=user_id,
        rsvp_count=result["rsvp_count"]
    )


@router.delete("/{event_id}/rsvp", response_model=RSVPResponse)
async def cancel_rsvp_event(
    event_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Cancel RSVP to an event (authenticated users)
    
    Side effects:
    - Removes user from rsvp_users array
    - Decrements rsvp_count
    """
    user_id = current_user["id"]
    
    result = await cancel_rsvp(event_id, user_id)
    
    if not result:
        raise HTTPException(status_code=404, detail="Event not found")
    
    if result.get("not_rsvpd"):
        raise HTTPException(status_code=400, detail="You have not RSVP'd to this event")
    
    return RSVPResponse(
        rsvp_status="cancelled",
        event_id=event_id,
        user_id=user_id,
        rsvp_count=result["rsvp_count"]
    )


@router.get("/user/my-rsvps", response_model=list[EventPublic])
async def get_my_rsvps(
    current_user: dict = Depends(get_current_user)
):
    """
    Get all events current user has RSVP'd to
    
    Requires authentication
    """
    user_id = current_user["id"]
    events = await get_user_rsvps(user_id)
    
    return [EventPublic(**e) for e in events]
