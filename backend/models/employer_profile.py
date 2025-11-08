from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import Optional, List
from datetime import datetime
import uuid

class EmployerProfileBase(BaseModel):
    """Base model for employer/organization profiles"""
    organization_name: str = Field(..., min_length=2, max_length=200)
    
    # Contact & Identity
    contact_email: EmailStr
    website_url: Optional[str] = None
    logo_url: Optional[str] = None
    
    # Organization Details
    sector: str  # Technology, Healthcare, Finance, Nonprofit, etc.
    organization_size: Optional[str] = None  # 1-10, 11-50, 51-200, 201-500, 500+
    headquarters_location: Optional[str] = None
    founded_year: Optional[int] = None
    
    # Mission & DEI
    description: Optional[str] = Field(None, max_length=2000)
    dei_statement: Optional[str] = Field(None, max_length=1000)  # Diversity, Equity, Inclusion commitment
    
    # Verification
    verified: bool = Field(default=False)
    verification_notes: Optional[str] = None

class EmployerProfileDB(EmployerProfileBase):
    """Database model for employer profiles"""
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Link to Business Directory if migrated
    business_directory_id: Optional[str] = None
    
    # Admin tracking
    created_by_user_id: Optional[str] = None
    verified_by_admin_id: Optional[str] = None
    verified_at: Optional[datetime] = None

class EmployerProfilePublic(EmployerProfileBase):
    """Public-facing employer profile"""
    model_config = ConfigDict(extra="ignore")
    
    id: str
    created_at: datetime
    
    # Hide sensitive fields from public
    # contact_email excluded by not including it

class EmployerProfileCreate(EmployerProfileBase):
    """Model for creating employer profile"""
    pass
