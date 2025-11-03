"""
Moderation Queue Models - Phase 6.4
Models for content moderation routing and review
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class ModerationQueueItem(BaseModel):
    """
    Moderation queue item for content review
    Used when content is flagged for admin review based on sentiment or other criteria
    """
    id: str = Field(..., description="Unique moderation queue ID")
    content_id: str = Field(..., description="ID of the content being moderated (news_id or resource_id)")
    content_type: Literal["news", "resource"] = Field(..., description="Type of content")
    title: str = Field(..., description="Cached title for quick display")
    sentiment_label: Optional[str] = Field(None, description="Sentiment label (positive/neutral/negative)")
    sentiment_score: Optional[float] = Field(None, description="Sentiment score (-1.0 to 1.0)")
    reason: str = Field(..., description="Reason for moderation (e.g., LOW_SENTIMENT, FLAGGED_SOURCE)")
    status: Literal["PENDING", "APPROVED", "REJECTED"] = Field(default="PENDING", description="Review status")
    created_at: datetime = Field(..., description="When item was added to queue")
    reviewed_at: Optional[datetime] = Field(None, description="When item was reviewed")
    reviewed_by: Optional[str] = Field(None, description="Admin ID/email who reviewed")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "mod_1001",
                "content_id": "news_12345",
                "content_type": "news",
                "title": "Shooting reported in downtown district",
                "sentiment_label": "negative",
                "sentiment_score": -0.73,
                "reason": "LOW_SENTIMENT",
                "status": "PENDING",
                "created_at": "2025-11-03T00:00:00Z",
                "reviewed_at": None,
                "reviewed_by": None
            }
        }


class ModerationQueueCreate(BaseModel):
    """Request model for creating a moderation queue item"""
    content_id: str
    content_type: Literal["news", "resource"]
    title: str
    sentiment_label: Optional[str] = None
    sentiment_score: Optional[float] = None
    reason: str = "LOW_SENTIMENT"


class ModerationQueueUpdate(BaseModel):
    """Request model for updating a moderation queue item (approve/reject)"""
    status: Literal["APPROVED", "REJECTED"]
    reviewed_by: str


class ModerationStats(BaseModel):
    """Statistics for moderation queue"""
    pending: int = Field(..., description="Number of pending items")
    approved: int = Field(default=0, description="Number of approved items")
    rejected: int = Field(default=0, description="Number of rejected items")
    total: int = Field(..., description="Total items in queue")

    class Config:
        json_schema_extra = {
            "example": {
                "pending": 5,
                "approved": 12,
                "rejected": 3,
                "total": 20
            }
        }
