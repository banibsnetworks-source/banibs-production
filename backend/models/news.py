from typing import Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

# News Aggregation Models
class NewsArticleDB(BaseModel):
    """News article stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    snippet: str  # Short description/excerpt
    content: Optional[str] = None  # Full article content
    image_url: Optional[str] = None
    category: Literal["top_story", "trending", "business", "video", "youth"] = "top_story"
    source: Optional[str] = None  # Source publication or author
    external_link: Optional[str] = None
    view_count: int = 0
    share_count: int = 0
    featured: bool = False
    published_at: datetime = Field(default_factory=datetime.utcnow)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class NewsArticlePublic(BaseModel):
    """Public news article response"""
    id: str
    title: str
    snippet: str
    image_url: Optional[str]
    category: str
    source: Optional[str]
    external_link: Optional[str]
    view_count: int
    share_count: int
    published_at: datetime

class NewsLatestResponse(BaseModel):
    """Response for /api/news/latest endpoint"""
    top_stories: list[NewsArticlePublic]
    trending: list[NewsArticlePublic]
    featured_businesses: list[NewsArticlePublic]
    watch_now: list[NewsArticlePublic]
    youth_opportunities: list[NewsArticlePublic]
