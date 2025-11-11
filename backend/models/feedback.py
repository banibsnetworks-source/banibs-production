"""
Phase 7.5.3 - User Feedback Model
Pydantic models for user feedback submissions
"""
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum


class FeedbackCategory(str, Enum):
    """Feedback category options"""
    GENERAL = "General"
    BUGS = "Bugs"
    SUGGESTIONS = "Suggestions"
    CONTENT = "Content"
    OTHER = "Other"


class FeedbackCreate(BaseModel):
    """Request model for creating feedback"""
    rating: int = Field(..., ge=1, le=5, description="Rating from 1-5 stars")
    feedback_text: str = Field(..., min_length=1, max_length=500, description="Feedback message")
    email: Optional[str] = Field(None, max_length=255, description="Optional contact email")
    category: FeedbackCategory = Field(FeedbackCategory.GENERAL, description="Feedback category")
    page_url: Optional[str] = Field(None, max_length=500, description="Page where feedback was submitted")
    user_agent: Optional[str] = Field(None, max_length=500, description="Browser user agent")
    
    @validator('feedback_text')
    def validate_feedback_text(cls, v):
        """Ensure feedback text is not just whitespace"""
        if not v or not v.strip():
            raise ValueError('Feedback text cannot be empty or just whitespace')
        return v.strip()
    
    @validator('email')
    def validate_email(cls, v):
        """Basic email validation"""
        if v:
            v = v.strip()
            if '@' not in v or '.' not in v:
                raise ValueError('Invalid email format')
        return v


class FeedbackDB(BaseModel):
    """Database model for stored feedback"""
    id: str = Field(..., description="Unique feedback ID (UUID)")
    rating: int
    feedback_text: str
    email: Optional[str] = None
    category: str
    page_url: Optional[str] = None
    user_agent: Optional[str] = None
    user_id: Optional[str] = Field(None, description="User ID if authenticated")
    created_at: datetime
    status: str = Field("new", description="Feedback status: new, reviewed, resolved")
    admin_notes: Optional[str] = Field(None, description="Internal admin notes")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "rating": 5,
                "feedback_text": "Great platform! Love the opportunities section.",
                "email": "user@example.com",
                "category": "General",
                "page_url": "/opportunities",
                "status": "new",
                "created_at": "2025-01-15T12:00:00Z"
            }
        }


class FeedbackPublic(BaseModel):
    """Public response model for feedback"""
    id: str
    rating: int
    category: str
    created_at: datetime
    status: str


class FeedbackAdmin(FeedbackDB):
    """Admin view of feedback (includes all fields)"""
    pass
