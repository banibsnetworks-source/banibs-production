"""
BANIBS Social Profile Models - Phase 9.0
User profile data for social features
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class ProfileTheme(BaseModel):
    """
    User profile theme customization
    Controls accent colors, layout, and cover treatment
    """
    accent: str = Field(default="gold", description="Accent color: gold|royal_blue|purple|emerald|brick_red|teal")
    layout: str = Field(default="classic", description="Layout style: classic|creator|business")
    cover_style: str = Field(default="normal", description="Cover treatment: normal|dark_overlay|light_overlay|accent_gradient")
    show_tagline_bar: bool = Field(default=False, description="Show highlighted tagline bar under name")


class SocialProfile(BaseModel):
    """
    Public social profile data
    """
    display_name: str = Field(..., description="User's display name")
    handle: Optional[str] = Field(None, description="Unique @handle for profile URLs")
    avatar_url: Optional[str] = Field(None, description="Profile picture URL")
    cover_url: Optional[str] = Field(None, description="Profile cover image URL")
    headline: Optional[str] = Field(None, max_length=100, description="Short headline (e.g., 'Founder • BANIBS')")
    bio: Optional[str] = Field(None, max_length=300, description="Profile bio (160-300 chars)")
    location: Optional[str] = Field(None, max_length=100, description="City, state, or region")
    interests: List[str] = Field(default_factory=list, description="Tags for discovery & recommendations")
    is_public: bool = Field(default=True, description="Profile visibility setting")
    theme: Optional[ProfileTheme] = Field(default=None, description="Profile theme customization")
    
    class Config:
        json_schema_extra = {
            "example": {
                "display_name": "Raymond Neely",
                "handle": "raymond",
                "avatar_url": "https://example.com/avatar.jpg",
                "headline": "Founder • BANIBS",
                "bio": "Builder of BANIBS. Tech. Legacy.",
                "location": "Snellville, GA",
                "interests": ["business", "tech", "community"],
                "is_public": True
            }
        }


class SocialProfileUpdate(BaseModel):
    """
    Profile update payload (all fields optional)
    """
    display_name: Optional[str] = Field(None, min_length=2, max_length=50)
    handle: Optional[str] = Field(None, min_length=3, max_length=30, pattern=r'^[a-zA-Z0-9_]+$')
    avatar_url: Optional[str] = None
    headline: Optional[str] = Field(None, max_length=100)
    bio: Optional[str] = Field(None, max_length=300)
    location: Optional[str] = Field(None, max_length=100)
    interests: Optional[List[str]] = None
    is_public: Optional[bool] = None
    theme: Optional[ProfileTheme] = None


class SocialProfileResponse(SocialProfile):
    """
    Extended profile response with metadata
    """
    user_id: str = Field(..., description="User ID")
    joined_at: Optional[str] = Field(None, description="Account creation date")
    post_count: Optional[int] = Field(0, description="Total posts by this user")
