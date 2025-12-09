"""
Comment Moderation Models - Phase C Circle Trust Order
Pydantic models for comment moderation queue
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class CommentModerationEntry(BaseModel):
    """
    Represents a comment in the moderation queue.
    
    Comments from CHILL/ALRIGHT/OTHERS tiers are hidden until approved.
    """
    id: str
    comment_id: str
    post_id: str
    commenter_id: str
    commenter_tier: str
    comment_text_preview: str
    moderation_level: str  # moderate, heavy
    status: str = "pending"  # pending, approved, rejected
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[str] = None
    reviewer_note: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class CommentModerationAction(BaseModel):
    """Request body for approving/rejecting comments"""
    reviewer_note: Optional[str] = Field(None, max_length=500)


class CommentModerationStats(BaseModel):
    """Statistics for moderation queue"""
    pending_count: int
    approved_count: int
    rejected_count: int
    by_tier: dict  # {"CHILL": 5, "ALRIGHT": 3}
