"""
Sentiment Analytics Models - Phase 6.5
Pydantic models for sentiment aggregation and analytics
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, date


class SentimentAggregate(BaseModel):
    """
    Base model for sentiment aggregates
    Used for daily, weekly, and monthly aggregations
    """
    id: str = Field(..., description="Unique aggregate ID (UUID)")
    date: str = Field(..., description="Date for this aggregate (YYYY-MM-DD)")
    dimension: Literal["overall", "source", "category", "region"] = Field(
        ..., description="Aggregation dimension"
    )
    dimension_value: Optional[str] = Field(
        None, description="Value for dimension (null for overall)"
    )
    content_type: Literal["news", "resource", "all"] = Field(
        default="all", description="Content type filter"
    )
    
    # Counts
    total_items: int = Field(..., description="Total items in this aggregate")
    positive_count: int = Field(..., description="Count of positive items")
    neutral_count: int = Field(..., description="Count of neutral items")
    negative_count: int = Field(..., description="Count of negative items")
    
    # Sentiment scores
    avg_sentiment: float = Field(..., description="Average sentiment score")
    min_sentiment: float = Field(..., description="Minimum sentiment score")
    max_sentiment: float = Field(..., description="Maximum sentiment score")
    
    # Metadata
    created_at: datetime = Field(..., description="When aggregate was created")
    updated_at: datetime = Field(..., description="When aggregate was last updated")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "uuid-123",
                "date": "2025-11-03",
                "dimension": "source",
                "dimension_value": "CBC News",
                "content_type": "news",
                "total_items": 45,
                "positive_count": 5,
                "neutral_count": 30,
                "negative_count": 10,
                "avg_sentiment": -0.08,
                "min_sentiment": -0.75,
                "max_sentiment": 0.45,
                "created_at": "2025-11-03T23:59:59Z",
                "updated_at": "2025-11-03T23:59:59Z"
            }
        }


class SentimentTrendData(BaseModel):
    """Response model for trends endpoint"""
    date: str
    total_items: int
    positive_count: int
    neutral_count: int
    negative_count: int
    avg_sentiment: float


class SentimentTrendsResponse(BaseModel):
    """Response for GET /trends"""
    start_date: str
    end_date: str
    granularity: Literal["daily", "weekly", "monthly"]
    content_type: str
    data: list[SentimentTrendData]


class SentimentByDimensionItem(BaseModel):
    """Item in by-source/category/region response"""
    dimension_value: str
    total_items: int
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_pct: float
    neutral_pct: float
    negative_pct: float
    avg_sentiment: float


class SentimentByDimensionResponse(BaseModel):
    """Response for by-source/category/region endpoints"""
    start_date: str
    end_date: str
    dimension: str
    items: list[SentimentByDimensionItem]


class SentimentSummaryStats(BaseModel):
    """Response for GET /summary"""
    period: str
    start_date: str
    end_date: str
    total_items: int
    positive_count: int
    neutral_count: int
    negative_count: int
    positive_percentage: float
    neutral_percentage: float
    negative_percentage: float
    avg_sentiment: float
    most_negative_source: Optional[str] = None
    most_positive_source: Optional[str] = None
    trend: Literal["improving", "stable", "declining"]
    
    class Config:
        json_schema_extra = {
            "example": {
                "period": "30d",
                "start_date": "2025-10-04",
                "end_date": "2025-11-03",
                "total_items": 4500,
                "positive_count": 600,
                "neutral_count": 3000,
                "negative_count": 900,
                "positive_percentage": 13.3,
                "neutral_percentage": 66.7,
                "negative_percentage": 20.0,
                "avg_sentiment": -0.12,
                "most_negative_source": "Source XYZ",
                "most_positive_source": "Source ABC",
                "trend": "declining"
            }
        }
