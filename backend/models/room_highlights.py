"""
Room Highlights Model
Stores timeline of significant room events for memory & narrative

Phase 6.1: Room Highlights Timeline
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum


class HighlightEventType(str, Enum):
    """Types of events that become highlights"""
    SESSION_STARTED = "SESSION_STARTED"  # 🟢 Owner enters
    SESSION_ENDED = "SESSION_ENDED"      # 🔴 Owner leaves
    DOOR_LOCKED = "DOOR_LOCKED"          # 🚪 Doors locked
    DOOR_UNLOCKED = "DOOR_UNLOCKED"      # 🚪 Doors unlocked
    VISITOR_ENTERED = "VISITOR_ENTERED"  # 👤 Visitor entered
    VISITOR_LEFT = "VISITOR_LEFT"        # 👤 Visitor left
    KNOCK_CREATED = "KNOCK_CREATED"      # ✊ Knock created
    KNOCK_APPROVED = "KNOCK_APPROVED"    # ✔ Knock approved
    KNOCK_DENIED = "KNOCK_DENIED"        # ✖ Knock denied
    SPECIAL_MOMENT = "SPECIAL_MOMENT"    # ⭐ Owner-created moment


class RoomHighlight(BaseModel):
    """
    Room Highlight Document
    
    Represents a significant event in a room's timeline.
    """
    owner_id: str = Field(..., description="Owner of the room")
    event_type: HighlightEventType = Field(..., description="Type of event")
    visitor_id: Optional[str] = Field(None, description="Involved visitor (if applicable)")
    session_id: Optional[str] = Field(None, description="Related session ID")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Event-specific data")
    title: Optional[str] = Field(None, description="Human-readable title")
    description: Optional[str] = Field(None, description="Event description")
    created_at: datetime = Field(..., description="When event occurred")
    
    class Config:
        json_schema_extra = {
            "example": {
                "owner_id": "user_123",
                "event_type": "VISITOR_ENTERED",
                "visitor_id": "user_456",
                "session_id": "session_789",
                "metadata": {
                    "visitor_name": "John Doe",
                    "visitor_tier": "PEOPLES"
                },
                "title": "John Doe entered the room",
                "description": "A PEOPLES tier member joined",
                "created_at": "2025-01-01T12:00:00Z"
            }
        }


class HighlightFilter(str, Enum):
    """Filter options for highlights timeline"""
    ALL = "all"
    VISITORS = "visitors"
    KNOCKS = "knocks"
    MY_ACTIVITY = "my_activity"


def get_highlight_icon(event_type: HighlightEventType) -> str:
    """Get emoji icon for event type"""
    icons = {
        HighlightEventType.SESSION_STARTED: "🟢",
        HighlightEventType.SESSION_ENDED: "🔴",
        HighlightEventType.DOOR_LOCKED: "🔒",
        HighlightEventType.DOOR_UNLOCKED: "🔓",
        HighlightEventType.VISITOR_ENTERED: "👤",
        HighlightEventType.VISITOR_LEFT: "👋",
        HighlightEventType.KNOCK_CREATED: "✊",
        HighlightEventType.KNOCK_APPROVED: "✔️",
        HighlightEventType.KNOCK_DENIED: "✖️",
        HighlightEventType.SPECIAL_MOMENT: "⭐"
    }
    return icons.get(event_type, "📌")


def get_highlight_color(event_type: HighlightEventType) -> str:
    """Get color class for event type"""
    colors = {
        HighlightEventType.SESSION_STARTED: "green",
        HighlightEventType.SESSION_ENDED: "red",
        HighlightEventType.DOOR_LOCKED: "yellow",
        HighlightEventType.DOOR_UNLOCKED: "blue",
        HighlightEventType.VISITOR_ENTERED: "blue",
        HighlightEventType.VISITOR_LEFT: "gray",
        HighlightEventType.KNOCK_CREATED: "yellow",
        HighlightEventType.KNOCK_APPROVED: "green",
        HighlightEventType.KNOCK_DENIED: "red",
        HighlightEventType.SPECIAL_MOMENT: "purple"
    }
    return colors.get(event_type, "gray")
