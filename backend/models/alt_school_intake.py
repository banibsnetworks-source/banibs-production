"""
Alternative School Hub - Tutor Intake Models
Phase-0.5: Capture educator applications for review

Status values:
- new: Just submitted, awaiting review
- reviewed: Founder/admin has seen it
- approved: Accepted for listing
- rejected: Not accepted
"""

from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from datetime import datetime
from enum import Enum


class IntakeStatus(str, Enum):
    """Status for intake submissions"""
    NEW = "new"
    REVIEWED = "reviewed"
    APPROVED = "approved"
    REJECTED = "rejected"


class TutorIntakeCreate(BaseModel):
    """Public submission payload"""
    name: str = Field(..., min_length=2, max_length=200)
    email: EmailStr
    phone: Optional[str] = Field(None, max_length=30)
    location: str = Field(..., min_length=2, max_length=200)
    subject_focus: str = Field(..., min_length=2, max_length=200)
    age_grade_range: str = Field(..., min_length=2, max_length=100)
    bio: str = Field(..., min_length=50, max_length=600)
    website: Optional[str] = Field(None, max_length=300)
    availability: Optional[str] = Field(None, max_length=200)
    consent_acknowledged: bool = Field(..., description="Must be true to submit")


class TutorIntakeUpdate(BaseModel):
    """Admin update payload"""
    status: Optional[IntakeStatus] = None
    notes: Optional[str] = Field(None, max_length=1000)


class TutorIntakeSubmission(BaseModel):
    """Full submission record"""
    id: str
    name: str
    email: str
    phone: Optional[str] = None
    location: str
    subject_focus: str
    age_grade_range: str
    bio: str
    website: Optional[str] = None
    availability: Optional[str] = None
    status: IntakeStatus = IntakeStatus.NEW
    notes: Optional[str] = None  # Admin-only notes
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TutorIntakeListResponse(BaseModel):
    """Response for listing submissions"""
    submissions: list[TutorIntakeSubmission]
    count: int
