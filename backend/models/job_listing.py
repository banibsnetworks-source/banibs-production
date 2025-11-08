from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
import uuid

class JobListingBase(BaseModel):
    """Base model for job listings - common fields"""
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=50, max_length=5000)
    employer_id: str  # Links to EmployerProfile
    
    # Compensation
    pay_range_min: Optional[int] = None  # Annual salary in USD
    pay_range_max: Optional[int] = None
    pay_type: str = Field(default="salary")  # salary, hourly, contract, unpaid_internship
    
    # Location & Remote
    location: Optional[str] = None  # City, State or "Remote"
    remote_type: str = Field(default="on_site")  # on_site, hybrid, remote
    
    # Job Details
    job_type: str = Field(default="full_time")  # full_time, part_time, contract, internship
    experience_level: str = Field(default="mid")  # entry, mid, senior, executive
    industry: str  # Technology, Healthcare, Finance, etc.
    tags: List[str] = Field(default_factory=list)  # Skills, keywords
    
    # Application
    application_url: Optional[str] = None  # External URL or null for internal
    application_email: Optional[str] = None
    
    # Moderation & Visibility
    status: str = Field(default="pending")  # pending, approved, rejected, expired
    moderation_flag: Optional[str] = None  # From Phase 6.4 moderation
    
    # Phase 6.3 - Sentiment
    sentiment_score: Optional[float] = None
    sentiment_label: Optional[str] = None
    sentiment_at: Optional[datetime] = None

class JobListingDB(JobListingBase):
    """Database model for job listings"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    posted_at: Optional[datetime] = None  # When approved and made public
    expires_at: Optional[datetime] = None  # Optional expiration date
    
    # Recruiter who posted (may differ from employer)
    posted_by_recruiter_id: Optional[str] = None
    
    # Engagement metrics
    view_count: int = Field(default=0)
    application_count: int = Field(default=0)

class JobListingPublic(JobListingBase):
    """Public-facing job listing model"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    created_at: datetime
    posted_at: Optional[datetime]
    expires_at: Optional[datetime]
    
    # Include employer info (will be populated from join)
    employer_name: Optional[str] = None
    employer_logo_url: Optional[str] = None
    
    # Engagement
    view_count: int = 0
    application_count: int = 0

class JobListingCreate(JobListingBase):
    """Model for creating a new job listing"""
    pass

class JobListingUpdate(BaseModel):
    """Model for updating a job listing"""
    title: Optional[str] = Field(None, min_length=5, max_length=200)
    description: Optional[str] = Field(None, min_length=50, max_length=5000)
    pay_range_min: Optional[int] = None
    pay_range_max: Optional[int] = None
    location: Optional[str] = None
    remote_type: Optional[str] = None
    job_type: Optional[str] = None
    tags: Optional[List[str]] = None
    status: Optional[str] = None
