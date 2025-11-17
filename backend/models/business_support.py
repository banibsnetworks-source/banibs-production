"""
Business Support Models - Phase 8.3
Support system for Black-owned businesses (User → Business)
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BusinessSupport(BaseModel):
    """
    User supporting a business
    'Support This Business' - show support for Black-owned businesses
    """
    user_id: str = Field(..., description="User showing support")
    business_id: str = Field(..., description="Business being supported")
    created_at: datetime = Field(default_factory=datetime.utcnow)


class SupporterResponse(BaseModel):
    """Response for supporters list"""
    user_id: str
    name: str
    avatar_url: Optional[str] = None
    supported_at: datetime


class BusinessSupportStats(BaseModel):
    """Support stats for a business"""
    business_id: str
    supporters_count: int
    is_supported: bool = False


class SupportedBusinessResponse(BaseModel):
    """Response for businesses a user supports"""
    business_id: str
    name: str
    logo: Optional[str] = None
    industry: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    supported_at: datetime
