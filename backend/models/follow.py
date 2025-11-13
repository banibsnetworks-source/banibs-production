"""
Follow Model - Phase B1
Generalized follow graph for users and businesses
"""

from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime
from bson import ObjectId


class Follow(BaseModel):
    """Represents a follow relationship between users and/or businesses"""
    id: str = Field(default_factory=lambda: str(ObjectId()))
    follower_type: Literal["user", "business"]
    follower_id: str  # user_id or business_id
    target_type: Literal["user", "business"]
    target_id: str  # user_id or business_id
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "follower_type": "user",
                "follower_id": "938ba123-4567-89ab-cdef-0123456789ab",
                "target_type": "business",
                "target_id": "d7406622-9423-4094-9203-36827c631310",
                "created_at": "2025-01-15T10:30:00"
            }
        }


class FollowCreate(BaseModel):
    """Request model for creating a follow relationship"""
    target_type: Literal["user", "business"]
    target_id: str


class FollowDelete(BaseModel):
    """Request model for removing a follow relationship"""
    target_type: Literal["user", "business"]
    target_id: str


class FollowStatus(BaseModel):
    """Response model for follow/unfollow actions"""
    status: Literal["following", "unfollowed"]
    follower_count: int = 0
