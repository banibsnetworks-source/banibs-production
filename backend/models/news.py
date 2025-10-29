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
    category: str  # e.g. "Business", "Education", "Community", "World News"
    region: Optional[str] = None  # Geographic region: "Global", "Africa", "Americas", "Europe", "Asia", "Middle East"
    sourceUrl: Optional[str] = None  # Optional external link
    sourceName: Optional[str] = None  # Name of RSS source (e.g., "Black Enterprise")
    isFeatured: bool = False  # True for hero/featured story
    external: bool = False  # True for RSS/external content, False for BANIBS editorial
    fingerprint: Optional[str] = None  # SHA256 hash for deduplication (sourceName::title)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    
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
    region: Optional[str] = None  # Geographic region for filtering
    sourceUrl: Optional[str] = None
    sourceName: Optional[str] = None
    isFeatured: bool = False
    external: bool = False
