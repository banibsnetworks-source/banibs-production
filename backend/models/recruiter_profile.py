from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

class RecruiterProfileBase(BaseModel):
    """Base model for recruiter/headhunter profiles"""
    user_id: str  # Links to unified_users collection
    
    # Professional Identity
    full_name: str = Field(..., min_length=2, max_length=100)
    professional_title: str = Field(..., min_length=2, max_length=100)  # e.g., "Senior Technical Recruiter"
    contact_email: EmailStr
    phone_number: Optional[str] = None
    
    # Agency/Organization
    agency_name: Optional[str] = None  # If working for recruiting agency
    agency_website: Optional[str] = None
    
    # Linked Employers
    employer_ids: List[str] = Field(default_factory=list)  # Can recruit for multiple employers
    
    # Verification
    verified: bool = Field(default=False)
    verification_method: Optional[str] = None  # "admin_approval", "business_email", "linkedin"
    verification_notes: Optional[str] = None
    
    # LinkedIn (optional)
    linkedin_url: Optional[str] = None
    
    # Specializations
    industries: List[str] = Field(default_factory=list)
    specializations: List[str] = Field(default_factory=list)  # "tech_recruiting", "executive_search", etc.

class RecruiterProfileDB(RecruiterProfileBase):
    """Database model for recruiter profiles"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Verification tracking
    verification_requested_at: Optional[datetime] = None
    verified_by_admin_id: Optional[str] = None
    verified_at: Optional[datetime] = None
    
    # Activity metrics
    total_jobs_posted: int = Field(default=0)
    total_applications_received: int = Field(default=0)

class RecruiterProfilePublic(BaseModel):
    """Public-facing recruiter profile"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    full_name: str
    professional_title: str
    agency_name: Optional[str]
    verified: bool
    industries: List[str]
    specializations: List[str]

class RecruiterVerificationRequest(BaseModel):
    """Model for requesting recruiter verification"""
    professional_title: str = Field(..., min_length=2, max_length=100)
    agency_name: Optional[str] = None
    linkedin_url: Optional[str] = None
    industries: List[str] = Field(default_factory=list)
    additional_notes: Optional[str] = Field(None, max_length=500)
