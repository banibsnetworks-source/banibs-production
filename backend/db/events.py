"""
Events Database Operations
Phase 6.2.3 - Resources & Events
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import os
import uuid

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
events_collection = db.banibs_events


async def create_event(
    title: str,
    description: str,
    category: str,
    start_date: datetime,
    end_date: datetime,
    timezone_str: str,
    event_type: str,
    organizer_id: str,
    organizer_name: str,
    organizer_email: str,
    location_name: Optional[str] = None,
    location_address: Optional[str] = None,
    location_url: Optional[str] = None,
    virtual_url: Optional[str] = None,
    image_url: Optional[str] = None,
    rsvp_limit: Optional[int] = None,
    tags: List[str] = None,
    featured: bool = False
) -> Dict[str, Any]:
    """Create a new event"""
    # Determine status based on dates
    now = datetime.now(timezone.utc)
    
    # Ensure timezone awareness for comparison
    if start_date.tzinfo is None:
        start_date = start_date.replace(tzinfo=timezone.utc)
    if end_date.tzinfo is None:
        end_date = end_date.replace(tzinfo=timezone.utc)
    
    if start_date > now:
        status = "upcoming"
    elif start_date <= now < end_date:
        status = "ongoing"
    else:
        status = "completed"
    
    event = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "category": category,
        "start_date": start_date,
        "end_date": end_date,
        "timezone": timezone_str,
        "event_type": event_type,
        "location_name": location_name,
        "location_address": location_address,
        "location_url": location_url,
        "virtual_url": virtual_url,
        "organizer_id": organizer_id,
        "organizer_name": organizer_name,
        "organizer_email": organizer_email,
        "image_url": image_url,
        "rsvp_limit": rsvp_limit,
        "rsvp_count": 0,
        "rsvp_users": [],
        "tags": tags or [],
        "featured": featured,
        "status": status,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "published_at": datetime.now(timezone.utc)
    }
    
    await events_collection.insert_one(event)
    return event


async def get_events(
    status: Optional[str] = None,
    category: Optional[str] = None,
    event_type: Optional[str] = None,
    featured: Optional[bool] = None,
    start_date_after: Optional[datetime] = None,
    start_date_before: Optional[datetime] = None,
    limit: int = 20,
    skip: int = 0
) -> tuple[List[Dict[str, Any]], int]:
    """Get events with filtering and pagination"""
    query = {"published_at": {"$ne": None}}
    
    if status:
        query["status"] = status
    if category:
        query["category"] = category
    if event_type:
        query["event_type"] = event_type
    if featured is not None:
        query["featured"] = featured
    if start_date_after:
        query["start_date"] = {"$gte": start_date_after}
    if start_date_before:
        query.setdefault("start_date", {})
        query["start_date"]["$lte"] = start_date_before
    
    # Get total count
    total = await events_collection.count_documents(query)
    
    # Get paginated results (sort by start_date ascending for upcoming)
    events = await events_collection.find(
        query,
        {"_id": 0}
    ).sort("start_date", 1).skip(skip).limit(limit).to_list(length=None)
    
    return events, total


async def get_event_by_id(event_id: str) -> Optional[Dict[str, Any]]:
    """Get a single event by ID"""
    event = await events_collection.find_one(
        {"id": event_id},
        {"_id": 0}
    )
    return event


async def update_event(
    event_id: str,
    update_data: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """Update an event"""
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await events_collection.update_one(
        {"id": event_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        return None
    
    return await events_collection.find_one({"id": event_id}, {"_id": 0})


async def delete_event(event_id: str) -> bool:
    """Delete an event"""
    result = await events_collection.delete_one({"id": event_id})
    return result.deleted_count > 0


async def rsvp_to_event(event_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """RSVP to an event (idempotent)"""
    event = await get_event_by_id(event_id)
    
    if not event:
        return None
    
    # Check if already RSVP'd
    if user_id in event.get("rsvp_users", []):
        return {"already_rsvpd": True, **event}
    
    # Check if event is full
    if event.get("rsvp_limit") and event.get("rsvp_count", 0) >= event["rsvp_limit"]:
        return {"event_full": True, **event}
    
    # Check if event has ended
    if event.get("end_date"):
        end_date = event["end_date"]
        # Ensure timezone awareness for comparison
        if end_date.tzinfo is None:
            end_date = end_date.replace(tzinfo=timezone.utc)
        if end_date < datetime.now(timezone.utc):
            return {"event_ended": True, **event}
    
    # Add RSVP
    result = await events_collection.update_one(
        {"id": event_id},
        {
            "$addToSet": {"rsvp_users": user_id},
            "$inc": {"rsvp_count": 1},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    if result.modified_count == 0:
        return None
    
    return await get_event_by_id(event_id)


async def cancel_rsvp(event_id: str, user_id: str) -> Optional[Dict[str, Any]]:
    """Cancel RSVP to an event"""
    event = await get_event_by_id(event_id)
    
    if not event:
        return None
    
    # Check if user has RSVP'd
    if user_id not in event.get("rsvp_users", []):
        return {"not_rsvpd": True, **event}
    
    # Remove RSVP
    result = await events_collection.update_one(
        {"id": event_id},
        {
            "$pull": {"rsvp_users": user_id},
            "$inc": {"rsvp_count": -1},
            "$set": {"updated_at": datetime.now(timezone.utc)}
        }
    )
    
    if result.modified_count == 0:
        return None
    
    return await get_event_by_id(event_id)


async def get_user_rsvps(user_id: str) -> List[Dict[str, Any]]:
    """Get all events a user has RSVP'd to"""
    events = await events_collection.find(
        {"rsvp_users": user_id},
        {"_id": 0}
    ).sort("start_date", 1).to_list(length=None)
    
    return events


async def get_upcoming_event_count() -> int:
    """Get count of upcoming events"""
    return await events_collection.count_documents({
        "status": "upcoming",
        "published_at": {"$ne": None}
    })
