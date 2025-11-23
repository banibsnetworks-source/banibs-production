"""
BANIBS Prayer Rooms - Data Models
Phase 11.0 - Spiritual Portal
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


class PrayerRoomBase(BaseModel):
    """Base prayer room model"""
    name: str
    slug: str
    description: str
    is_active: bool = True


class PrayerRoom(PrayerRoomBase):
    """Prayer room document model"""
    id: str
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Christian Prayer Room",
                "slug": "christian",
                "description": "A space for Christian prayer and reflection",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class PrayerPostCreate(BaseModel):
    """Request model for creating a prayer post"""
    room_id: str
    content: str = Field(..., min_length=1, max_length=1000)
    anonymous: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "room_id": "550e8400-e29b-41d4-a716-446655440000",
                "content": "Praying for peace and healing in our community",
                "anonymous": False
            }
        }


class PrayerPost(BaseModel):
    """Prayer post document model"""
    id: str
    room_id: str
    user_id: str
    content: str
    anonymous: bool
    amen_count: int = 0
    user_has_amened: Optional[bool] = False  # Set dynamically based on current user
    created_at: datetime
    
    # Optional user info (only if not anonymous)
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440001",
                "room_id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "770e8400-e29b-41d4-a716-446655440002",
                "content": "Praying for strength and guidance",
                "anonymous": False,
                "amen_count": 12,
                "user_has_amened": False,
                "created_at": "2024-01-15T10:30:00Z",
                "author_name": "John Smith",
                "author_avatar": "https://..."
            }
        }


class AmenCreate(BaseModel):
    """Request model for adding an amen"""
    post_id: str


class Amen(BaseModel):
    """Amen document model"""
    id: str
    post_id: str
    user_id: str
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "880e8400-e29b-41d4-a716-446655440003",
                "post_id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "770e8400-e29b-41d4-a716-446655440002",
                "created_at": "2024-01-15T11:00:00Z"
            }
        }


class PrayerPostsResponse(BaseModel):
    """Response model for listing prayer posts"""
    posts: list[PrayerPost]
    total: int
    room: PrayerRoom
