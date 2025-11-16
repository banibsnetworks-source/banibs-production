"""
Business Review Models - Phase 7.1: Professional Reputation Layer
BANIBS Business Rating & Scoring System
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class BusinessReviewCreate(BaseModel):
    """Create business review request"""
    business_profile_id: str = Field(..., description="Business being reviewed")
    rating: int = Field(..., ge=1, le=5, description="1-5 star rating")
    review_text: Optional[str] = Field(None, max_length=1000, description="Optional written review")
    category: str = Field(default="general", description="service | employer | product | general")


class BusinessReview(BaseModel):
    """Business review response"""
    id: str
    business_profile_id: str
    business_name: Optional[str] = None  # Enriched from business_profiles
    business_handle: Optional[str] = None
    business_logo: Optional[str] = None
    
    reviewer_user_id: str
    reviewer_name: Optional[str] = None  # Enriched from users
    reviewer_avatar: Optional[str] = None
    
    rating: int  # 1-5 stars
    review_text: Optional[str] = None
    category: str = "general"
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class BusinessRatingStats(BaseModel):
    """Aggregated rating statistics for a business"""
    business_profile_id: str
    average_rating: float = 0.0
    total_reviews: int = 0
    rating_distribution: dict = Field(
        default={"5": 0, "4": 0, "3": 0, "2": 0, "1": 0},
        description="Count of reviews for each star level"
    )
