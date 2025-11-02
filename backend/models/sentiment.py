"""
Sentiment Model - Phase 6.3
Pydantic schemas for sentiment analysis results
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class SentimentResult(BaseModel):
    """Sentiment analysis result"""
    score: float = Field(..., ge=-1.0, le=1.0, description="Sentiment score from -1.0 (negative) to 1.0 (positive)")
    label: Literal["positive", "neutral", "negative"] = Field(..., description="Sentiment classification")
    analyzed_at: datetime = Field(..., description="Timestamp when sentiment was analyzed")
    
    class Config:
        json_schema_extra = {
            "example": {
                "score": 0.3,
                "label": "positive",
                "analyzed_at": "2025-11-02T22:00:00Z"
            }
        }


class SentimentRecalculateRequest(BaseModel):
    """Request to recalculate sentiment for items"""
    collection: Optional[Literal["news", "resources", "all"]] = Field("all", description="Which collection to process")
    force: Optional[bool] = Field(False, description="Force recalculation even if sentiment exists")


class SentimentRecalculateResponse(BaseModel):
    """Response from sentiment recalculation"""
    processed: int = Field(..., description="Number of items processed")
    skipped: int = Field(..., description="Number of items skipped (already had sentiment)")
    errors: int = Field(..., description="Number of errors encountered")
    collections: dict = Field(..., description="Breakdown by collection")
    
    class Config:
        json_schema_extra = {
            "example": {
                "processed": 42,
                "skipped": 120,
                "errors": 0,
                "collections": {
                    "news": {"processed": 30, "skipped": 100, "errors": 0},
                    "resources": {"processed": 12, "skipped": 20, "errors": 0}
                }
            }
        }


class ItemWithSentiment(BaseModel):
    """Base class for items that include sentiment data"""
    sentiment_score: Optional[float] = Field(None, ge=-1.0, le=1.0, description="Sentiment score")
    sentiment_label: Optional[Literal["positive", "neutral", "negative"]] = Field(None, description="Sentiment label")
    sentiment_at: Optional[datetime] = Field(None, description="When sentiment was analyzed")
