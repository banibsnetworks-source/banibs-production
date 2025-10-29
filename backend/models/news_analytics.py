from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class NewsClickStatDB(BaseModel):
    """Click statistics for news stories by region stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    storyId: str  # Reference to NewsItemDB id
    region: str   # "Americas", "Middle East", "Global", etc.
    totalClicks: int = 0  # Running total of clicks
    lastClickedAt: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class NewsClickRequest(BaseModel):
    """Request body for click tracking"""
    storyId: str
    region: str

class TrendingStoryResponse(BaseModel):
    """Response for trending story data"""
    storyId: str
    title: str
    sourceName: str
    region: str
    imageUrl: Optional[str] = None
    sourceUrl: str
    clicks: int
    lastClickedAt: str  # ISO timestamp

class TrendingResponse(BaseModel):
    """Response for trending stories by region"""
    region: str
    stories: list[TrendingStoryResponse]