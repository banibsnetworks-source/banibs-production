"""
Business Profile Models - Phase 8.2
Business accounts and branding system
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Literal
from datetime import datetime


class BusinessService(BaseModel):
    """Individual service offered by business"""
    id: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class BusinessProfileCreate(BaseModel):
    """Create business profile request"""
    name: str = Field(..., min_length=1, max_length=100, description="Business/brand name")
    handle: Optional[str] = Field(None, min_length=3, max_length=50, description="URL handle like @banibsnews")
    tagline: Optional[str] = Field(None, max_length=200, description="One-liner tagline")
    bio: Optional[str] = Field(None, max_length=1000, description="Longer About section")
    industry: Optional[str] = Field(None, max_length=100, description="Category (Media, Real Estate, Finance, etc.)")
    website: Optional[str] = Field(None, description="External website URL")
    email: Optional[str] = Field(None, description="Public contact email")
    phone: Optional[str] = Field(None, max_length=20, description="Contact phone")
    location: Optional[str] = Field(None, max_length=200, description="City/State/Country")
    services: list[BusinessService] = Field(default=[], description="Services offered")


class BusinessProfileUpdate(BaseModel):
    """Update business profile request"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    handle: Optional[str] = Field(None, min_length=3, max_length=50)
    tagline: Optional[str] = Field(None, max_length=200)
    bio: Optional[str] = Field(None, max_length=1000)
    logo: Optional[str] = None
    cover: Optional[str] = None
    accent_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Hex color code")
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    services: Optional[list[BusinessService]] = None
    # Phase 8.1 Stage 2 - Profile Command Center
    profile_picture_url: Optional[str] = None
    banner_image_url: Optional[str] = None
    address: Optional[str] = Field(None, max_length=300)
    website_url: Optional[str] = None
    hours: Optional[str] = Field(None, max_length=200)
    secondary_color: Optional[str] = Field(None, pattern=r'^#[0-9A-Fa-f]{6}$', description="Secondary theme color")
    header_style: Optional[str] = Field(None, pattern=r'^(clean|carded|minimal)$')
    font_style: Optional[str] = Field(None, pattern=r'^(default|modern|serif)$')


class BusinessProfilePublic(BaseModel):
    """Public business profile response"""
    id: str
    owner_user_id: str
    name: str  # Business/brand name
    handle: str  # @banibsnews style handle
    tagline: Optional[str] = None  # One-liner (e.g. "Black America News, Business & Opportunity")
    bio: Optional[str] = None  # Longer About section
    logo: Optional[str] = None  # logo_url
    cover: Optional[str] = None  # cover_image_url (optional header banner)
    accent_color: str = "#d4af37"  # Default gold for business
    industry: Optional[str] = None  # Category (Media, Real Estate, Finance, etc.)
    website: Optional[str] = None  # External site
    email: Optional[str] = None  # Public contact email
    phone: Optional[str] = None  # Optional phone
    location: Optional[str] = None  # City/State/Country
    services: list[BusinessService] = []
    verified_status: bool = False
    status: str = "active"  # active | suspended | draft
    follower_count: int = 0
    is_following: bool = False  # Whether current user follows this business
    average_rating: float = 0.0  # Phase 7.1 - Rating System
    total_reviews: int = 0  # Phase 7.1 - Rating System
    created_at: datetime
    updated_at: datetime
    # Phase 8.1 Stage 2 - Profile Command Center
    profile_picture_url: Optional[str] = None
    banner_image_url: Optional[str] = None
    address: Optional[str] = None
    website_url: Optional[str] = None
    hours: Optional[str] = None
    secondary_color: Optional[str] = "#d4af37"
    header_style: str = "clean"
    font_style: str = "default"
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class BusinessProfileOwner(BusinessProfilePublic):
    """Business profile response for owner (includes private fields)"""
    # Currently same as public, but we can add owner-only fields later
    pass
