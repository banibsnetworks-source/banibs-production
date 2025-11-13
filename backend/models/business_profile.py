"""
Business Profile Models - Phase 8.2
Business accounts and branding system
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional, Literal
from datetime import datetime


class BusinessService(BaseModel):
    """Individual service offered by business"""
    title: str = Field(..., min_length=1, max_length=100)
    description: str = Field(..., min_length=1, max_length=500)


class BusinessProfileCreate(BaseModel):
    """Create business profile request"""
    name: str = Field(..., min_length=1, max_length=100, description="Business name")
    handle: Optional[str] = Field(None, min_length=3, max_length=50, description="URL handle (auto-generated if not provided)")
    tagline: Optional[str] = Field(None, max_length=200, description="Short business tagline")
    bio: Optional[str] = Field(None, max_length=1000, description="Business description")
    website: Optional[str] = Field(None, description="Business website URL")
    email: Optional[str] = Field(None, description="Business contact email")
    phone: Optional[str] = Field(None, max_length=20, description="Business phone number")
    location: Optional[str] = Field(None, max_length=200, description="Business location")
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


class BusinessProfilePublic(BaseModel):
    """Public business profile response"""
    id: str
    owner_user_id: str
    name: str
    tagline: Optional[str] = None
    bio: Optional[str] = None
    logo: Optional[str] = None
    cover: Optional[str] = None
    accent_color: str = "#d4af37"  # Default gold
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    services: list[BusinessService] = []
    verified_status: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class BusinessProfileOwner(BusinessProfilePublic):
    """Business profile response for owner (includes private fields)"""
    # Currently same as public, but we can add owner-only fields later
    pass
