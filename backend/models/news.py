from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

# News Aggregation Models
class NewsItemDB(BaseModel):
    """News item stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    summary: str  # Short text for homepage teaser
    imageUrl: Optional[str] = None
    publishedAt: datetime = Field(default_factory=datetime.utcnow)
    category: str  # e.g. "Business", "Education", "Community"
    sourceUrl: Optional[str] = None  # Optional external link
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class NewsItemPublic(BaseModel):
    """Public news item response for homepage"""
    id: str
    title: str
    summary: str
    imageUrl: Optional[str] = None
    publishedAt: str  # ISO timestamp string
    category: str
    sourceUrl: Optional[str] = None
