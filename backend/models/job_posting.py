"""
Job Posting Models - Phase 7.1: BANIBS Jobs & Opportunities
Unified job system for Black business hiring and community talent discovery
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class JobPostingCreate(BaseModel):
    """Create job posting request"""
    business_profile_id: str = Field(..., description="Business posting the job")
    title: str = Field(..., min_length=3, max_length=200, description="Job title")
    employment_type: str = Field(..., description="full_time | part_time | contract | internship | apprenticeship | gig")
    category: str = Field(..., description="Industry/category (e.g., Restaurant, Tech, Legal)")
    tags: List[str] = Field(default=[], description="Job tags for filtering")
    
    description: str = Field(..., min_length=50, description="Job description")
    responsibilities: List[str] = Field(default=[], description="Key responsibilities")
    requirements: List[str] = Field(default=[], description="Job requirements")
    skills: List[str] = Field(default=[], description="Required skills")
    
    location_type: str = Field(..., description="onsite | remote | hybrid")
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_zip: Optional[str] = None
    country: str = Field(default="USA")
    
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = Field(default="USD")
    salary_visible: bool = Field(default=True, description="Show salary to job seekers")
    
    application_method: str = Field(default="banibs", description="banibs | external")
    external_apply_url: Optional[str] = None
    
    status: str = Field(default="draft", description="open | closed | draft")
    visibility: str = Field(default="public", description="public | private")


class JobPostingUpdate(BaseModel):
    """Update job posting request"""
    title: Optional[str] = Field(None, min_length=3, max_length=200)
    employment_type: Optional[str] = None
    category: Optional[str] = None
    tags: Optional[List[str]] = None
    description: Optional[str] = None
    responsibilities: Optional[List[str]] = None
    requirements: Optional[List[str]] = None
    skills: Optional[List[str]] = None
    location_type: Optional[str] = None
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_zip: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_visible: Optional[bool] = None
    application_method: Optional[str] = None
    external_apply_url: Optional[str] = None
    status: Optional[str] = None
    visibility: Optional[str] = None


class JobPosting(BaseModel):
    """Job posting response"""
    id: str
    business_profile_id: str
    owner_user_id: str
    
    # Business info (enriched from business_profiles)
    company_name: Optional[str] = None
    company_logo: Optional[str] = None
    company_handle: Optional[str] = None
    
    title: str
    employment_type: str
    category: str
    tags: List[str] = []
    
    description: str
    responsibilities: List[str] = []
    requirements: List[str] = []
    skills: List[str] = []
    
    location_type: str
    location_city: Optional[str] = None
    location_state: Optional[str] = None
    location_zip: Optional[str] = None
    country: str = "USA"
    
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    salary_currency: str = "USD"
    salary_visible: bool = True
    
    application_method: str = "banibs"
    external_apply_url: Optional[str] = None
    
    status: str = "draft"
    visibility: str = "public"
    
    # Metrics (for employer view)
    view_count: int = 0
    applicant_count: int = 0
    
    created_at: datetime
    updated_at: datetime
    posted_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class JobApplication(BaseModel):
    """Job application response"""
    id: str
    job_id: str
    job_title: Optional[str] = None
    applicant_user_id: str
    applicant_name: Optional[str] = None
    applicant_email: Optional[str] = None
    business_profile_id: str
    
    cover_message: Optional[str] = None
    resume_url: Optional[str] = None
    
    status: str = "submitted"  # submitted | viewed | shortlisted | rejected | hired
    
    created_at: datetime
    updated_at: datetime
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class JobApplicationCreate(BaseModel):
    """Create job application request"""
    job_id: str
    cover_message: Optional[str] = Field(None, max_length=1000)
    resume_url: Optional[str] = None
