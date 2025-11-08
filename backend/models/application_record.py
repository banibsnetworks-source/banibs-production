from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional
from datetime import datetime
import uuid

class ApplicationRecordBase(BaseModel):
    """Base model for job applications"""
    job_id: str  # Links to JobListing
    candidate_id: str  # Links to CandidateProfile
    
    # Application Details
    cover_letter: Optional[str] = Field(None, max_length=2000)
    resume_url: Optional[str] = None  # Can override candidate's default resume
    
    # Contact (captured at application time)
    contact_email: EmailStr
    contact_phone: Optional[str] = None
    
    # Status Tracking
    status: str = Field(default="submitted")  # submitted, reviewed, interviewing, offered, rejected, withdrawn
    
    # Recruiter Notes
    recruiter_notes: Optional[str] = Field(None, max_length=1000)

class ApplicationRecordDB(ApplicationRecordBase):
    """Database model for applications"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)  # Application submission time
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Status history tracking
    status_updated_at: Optional[datetime] = None
    status_updated_by: Optional[str] = None  # Recruiter or admin user_id

class ApplicationRecordPublic(BaseModel):
    """Public-facing application record (candidate view)"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    job_id: str
    created_at: datetime
    status: str
    status_updated_at: Optional[datetime]
    
    # Include job details (populated from join)
    job_title: Optional[str] = None
    employer_name: Optional[str] = None

class ApplicationCreate(BaseModel):
    """Model for submitting an application"""
    job_id: str
    cover_letter: Optional[str] = Field(None, max_length=2000)
    resume_url: Optional[str] = None
    contact_email: EmailStr
    contact_phone: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    """Model for updating application status (recruiter action)"""
    status: str  # reviewed, interviewing, offered, rejected
    recruiter_notes: Optional[str] = Field(None, max_length=1000)
