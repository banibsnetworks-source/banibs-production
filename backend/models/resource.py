"""
Resource Model - Pydantic schemas for Information & Resources module
Phase 6.2.3 - Resources & Events
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Literal
from datetime import datetime


class ResourceBase(BaseModel):
    """Base resource schema"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=1000)
    category: Literal[
        "Business Support",
        "Grants & Funding",
        "Education",
        "Health & Wellness",
        "Technology",
        "Community & Culture"
    ]
    type: Literal["Article", "Guide", "Video", "Tool", "Download"]
    
    # Content
    content: Optional[str] = Field(None, max_length=50000, description="Markdown content for internal articles")
    external_url: Optional[HttpUrl] = Field(None, description="External resource URL")
    
    # Media
    thumbnail_url: Optional[HttpUrl] = None
    video_url: Optional[HttpUrl] = Field(None, description="YouTube/Vimeo embed URL")
    
    # Metadata
    tags: List[str] = Field(default_factory=list, max_items=10)
    featured: bool = False


class ResourceCreate(ResourceBase):
    """Schema for creating a resource"""
    pass


class ResourceUpdate(BaseModel):
    """Schema for updating a resource (partial update)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    category: Optional[Literal[
        "Business Support",
        "Grants & Funding",
        "Education",
        "Health & Wellness",
        "Technology",
        "Community & Culture"
    ]] = None
    type: Optional[Literal["Article", "Guide", "Video", "Tool", "Download"]] = None
    content: Optional[str] = Field(None, max_length=50000)
    external_url: Optional[HttpUrl] = None
    thumbnail_url: Optional[HttpUrl] = None
    video_url: Optional[HttpUrl] = None
    tags: Optional[List[str]] = Field(None, max_items=10)
    featured: Optional[bool] = None


class ResourcePublic(ResourceBase):
    """Public resource schema (returned to users)"""
    id: str
    author_id: str
    author_name: str
    view_count: int = 0
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    # Phase 6.3 - Sentiment Analysis
    sentiment_score: Optional[float] = None  # -1.0 to 1.0
    sentiment_label: Optional[str] = None  # positive, neutral, negative
    sentiment_at: Optional[datetime] = None  # When analyzed
    # Phase 6.6 - Heavy Content Banner (computed fields)
    heavy_content: bool = False  # Computed: is content flagged as heavy?
    banner_message_computed: Optional[str] = None  # Computed: banner message to display
    
    class Config:
        from_attributes = True


class ResourceListResponse(BaseModel):
    """Paginated resource list response"""
    resources: List[ResourcePublic]
    total: int
    page: int
    pages: int
