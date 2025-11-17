"""
Peoples System Models - Phase 8.3
BANIBS' culturally-aligned connection system (User → User)
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserConnection(BaseModel):
    """
    Peoples connection between users
    'Add to My Peoples' - culturally meaningful following without romantic implications
    """
    follower_user_id: str = Field(..., description="User who is adding someone to their peoples")
    target_user_id: str = Field(..., description="User being added to peoples")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class PeoplesResponse(BaseModel):
    """Response for peoples list"""
    user_id: str
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    added_at: datetime
    is_in_my_peoples: bool = False


class PeoplesStats(BaseModel):
    """Peoples count for a user"""
    user_id: str
    peoples_count: int
    is_in_my_peoples: bool = False
