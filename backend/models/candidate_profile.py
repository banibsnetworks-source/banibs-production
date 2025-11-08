from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

class CandidateProfileBase(BaseModel):
    """Base model for job seeker/candidate profiles"""
    user_id: str  # Links to unified_users collection
    
    # Professional Identity
    full_name: str = Field(..., min_length=2, max_length=100)
    professional_title: Optional[str] = None  # Current or desired title
    contact_email: EmailStr
    phone_number: Optional[str] = None
    
    # Resume & Portfolio
    resume_url: Optional[str] = None  # Uploaded file URL
    portfolio_url: Optional[str] = None  # External portfolio/website
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    
    # Professional Summary
    bio: Optional[str] = Field(None, max_length=1000)
    
    # Preferences
    preferred_industries: List[str] = Field(default_factory=list)
    preferred_job_types: List[str] = Field(default_factory=list)  # full_time, part_time, contract
    preferred_remote_types: List[str] = Field(default_factory=list)  # on_site, hybrid, remote
    desired_salary_min: Optional[int] = None
    desired_salary_max: Optional[int] = None
    
    # Skills
    skills: List[str] = Field(default_factory=list)
    
    # Saved Jobs
    saved_job_ids: List[str] = Field(default_factory=list)
    
    # Privacy
    profile_public: bool = Field(default=False)  # Make profile searchable by recruiters

class CandidateProfileDB(CandidateProfileBase):
    """Database model for candidate profiles"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Activity metrics
    total_applications: int = Field(default=0)
    profile_views: int = Field(default=0)

class CandidateProfilePublic(BaseModel):
    """Public-facing candidate profile (if profile_public = true)"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    full_name: str
    professional_title: Optional[str]
    bio: Optional[str]
    portfolio_url: Optional[str]
    linkedin_url: Optional[str]
    github_url: Optional[str]
    preferred_industries: List[str]
    skills: List[str]

class CandidateProfileCreate(CandidateProfileBase):
    """Model for creating candidate profile"""
    pass
