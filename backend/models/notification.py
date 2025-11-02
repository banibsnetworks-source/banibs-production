"""
Notification Model - Pydantic schemas for notification data
Phase 6.2.1 - Notifications System
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class NotificationBase(BaseModel):
    """Base notification schema"""
    type: Literal["system", "business", "opportunity", "event"] = Field(
        ...,
        description="Type of notification"
    )
    title: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1, max_length=1000)
    link: Optional[str] = Field(None, description="URL to navigate when clicked")
    expires_at: Optional[datetime] = Field(None, description="Expiry date for notification")


class NotificationCreate(NotificationBase):
    """Schema for creating a notification"""
    user_id: str = Field(..., description="UUID of recipient user")


class NotificationPublic(NotificationBase):
    """Public notification schema (returned to users)"""
    id: str
    user_id: str
    read: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


class NotificationUpdate(BaseModel):
    """Schema for updating notification"""
    read: Optional[bool] = None


class NotificationUnreadCount(BaseModel):
    """Schema for unread count response"""
    unread_count: int
