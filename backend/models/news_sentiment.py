"""
Phase 6.3 - News Sentiment Model

Schema for storing AI-generated sentiment analysis per story + region.
Retention: 90 days (cleanup task in scheduler).
Privacy: Aggregate-only, no user-level tracking.
"""

from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NewsSentimentDB(BaseModel):
    """Database model for news sentiment records"""
    id: str  # UUID
    storyId: str  # Reference to news_items.id
    region: str  # One of: Global, Africa, Americas, Europe, Asia, Middle East
    sentimentScore: float  # -1.0 (negative) to 1.0 (positive)
    sentimentLabel: str  # "positive", "neutral", "negative"
    headline: str  # Stored for context/display
    summary: Optional[str] = None  # Stored for context
    analyzedAt: datetime  # When AI analyzed this
    createdAt: datetime  # When record was created


class NewsSentimentPublic(BaseModel):
    """Public API response model for sentiment records"""
    id: str
    storyId: str
    region: str
    sentimentScore: float
    sentimentLabel: str
    headline: str
    analyzedAt: str  # ISO format
