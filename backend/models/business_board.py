"""
Business Board Models - Phase 8.3
Business-to-business and business-to-community posts
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# Business Board Categories
BOARD_CATEGORIES = Literal[
    "hiring",
    "partnership", 
    "funding",
    "event",
    "service",
    "announcement",
    "collaboration",
    "opportunity"
]


class BusinessBoardPostCreate(BaseModel):
    """Create business board post request"""
    category: BOARD_CATEGORIES = Field(..., description="Post category")
    text: str = Field(..., min_length=1, max_length=2000, description="Post content")
    media: Optional[list] = Field(default=[], description="Media attachments")
    link_url: Optional[str] = Field(None, description="Optional link URL")
    link_meta: Optional[dict] = Field(None, description="Link preview metadata")


class BusinessInfo(BaseModel):
    """Business info for post display"""
    id: str
    name: str
    logo: Optional[str] = None
    accent_color: str = "#d4af37"


class BusinessBoardPost(BaseModel):
    """Business board post response"""
    id: str
    business: BusinessInfo
    category: str
    text: str
    media: list = []
    link_url: Optional[str] = None
    link_meta: Optional[dict] = None
    created_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class BusinessBoardFeedResponse(BaseModel):
    """Business board feed paginated response"""
    page: int
    page_size: int
    total_items: int
    total_pages: int
    items: list[BusinessBoardPost]
