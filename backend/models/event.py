"""
Event Model - Pydantic schemas for Events & Networking module
Phase 6.2.3 - Resources & Events
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Literal
from datetime import datetime


class EventBase(BaseModel):
    """Base event schema"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    category: Literal["Networking", "Workshop", "Webinar", "Conference", "Meetup", "Social Gathering"]
    
    # Date & Time
    start_date: datetime
    end_date: datetime
    timezone: str = Field(default="America/New_York", description="IANA timezone string")
    
    # Location
    event_type: Literal["In-Person", "Virtual", "Hybrid"]
    location_name: Optional[str] = Field(None, max_length=200)
    location_address: Optional[str] = Field(None, max_length=500)
    location_url: Optional[HttpUrl] = Field(None, description="Google Maps link")
    virtual_url: Optional[HttpUrl] = Field(None, description="Zoom/Teams meeting link")
    
    # Organizer
    organizer_email: str = Field(..., description="Contact email for organizer")
    
    # Media
    image_url: Optional[HttpUrl] = Field(None, description="Event banner/poster URL")
    
    # RSVP
    rsvp_limit: Optional[int] = Field(None, ge=1, le=10000, description="Max attendees (null = unlimited)")
    
    # Metadata
    tags: List[str] = Field(default_factory=list, max_items=10)
    featured: bool = False


class EventCreate(EventBase):
    """Schema for creating an event"""
    pass


class EventUpdate(BaseModel):
    """Schema for updating an event (partial update)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=2000)
    category: Optional[Literal["Networking", "Workshop", "Webinar", "Conference", "Meetup", "Social Gathering"]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    timezone: Optional[str] = None
    event_type: Optional[Literal["In-Person", "Virtual", "Hybrid"]] = None
    location_name: Optional[str] = None
    location_address: Optional[str] = None
    location_url: Optional[HttpUrl] = None
    virtual_url: Optional[HttpUrl] = None
    organizer_email: Optional[str] = None
    image_url: Optional[HttpUrl] = None
    rsvp_limit: Optional[int] = Field(None, ge=1, le=10000)
    tags: Optional[List[str]] = Field(None, max_items=10)
    featured: Optional[bool] = None


class EventPublic(EventBase):
    """Public event schema (returned to users)"""
    id: str
    organizer_id: str
    organizer_name: str
    rsvp_count: int = 0
    rsvp_users: List[str] = Field(default_factory=list)  # Array of user IDs who RSVP'd
    status: Literal["upcoming", "ongoing", "completed", "cancelled"] = "upcoming"
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class EventListResponse(BaseModel):
    """Paginated event list response"""
    events: List[EventPublic]
    total: int
    page: int
    pages: int


class RSVPResponse(BaseModel):
    """RSVP confirmation response"""
    rsvp_status: Literal["confirmed", "cancelled"]
    event_id: str
    user_id: str
    rsvp_count: int
