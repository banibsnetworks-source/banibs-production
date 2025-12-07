"""
Waitlist Data Models
"""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class WaitlistSubscribeRequest(BaseModel):
    """Request to subscribe to waitlist"""
    email: EmailStr


class WaitlistEntry(BaseModel):
    """Waitlist entry stored in MongoDB"""
    email: str
    submitted_at: datetime = Field(default_factory=datetime.utcnow)
    source: str = "coming_soon_v2"
    ip_address: Optional[str] = None


class WaitlistSubscribeResponse(BaseModel):
    """Response after subscribing to waitlist"""
    success: bool
    message: str
    email: str
