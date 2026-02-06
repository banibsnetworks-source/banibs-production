"""
Alternative School Hub - Data Models
Phase-0 Scaffold: Read-only public display, admin-only management

Status values:
- founding: Active/launched listings
- developing: In progress, coming soon
- future: Planned for later phases
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class ListingStatus(str, Enum):
    """Status for all Alternative School Hub listings"""
    FOUNDING = "founding"
    DEVELOPING = "developing"
    FUTURE = "future"


# ==========================================
# TUTOR LISTING
# ==========================================

class TutorListingBase(BaseModel):
    """Base fields for Tutor Listing"""
    name: str = Field(..., min_length=1, max_length=200)
    focus_subject: str = Field(..., min_length=1, max_length=200)
    age_or_grade_range: str = Field(..., max_length=100)
    location: str = Field(..., max_length=200)  # city / remote
    description: str = Field(..., max_length=1000)
    contact_info: str = Field(..., max_length=300)  # email or placeholder
    status: ListingStatus = ListingStatus.FOUNDING


class TutorListingCreate(TutorListingBase):
    """Create a new tutor listing (admin only)"""
    pass


class TutorListingUpdate(BaseModel):
    """Update tutor listing fields (admin only)"""
    name: Optional[str] = None
    focus_subject: Optional[str] = None
    age_or_grade_range: Optional[str] = None
    location: Optional[str] = None
    description: Optional[str] = None
    contact_info: Optional[str] = None
    status: Optional[ListingStatus] = None


class TutorListing(TutorListingBase):
    """Full tutor listing with metadata"""
    id: str
    image_url: Optional[str] = None  # Phase-0.75: Card thumbnail
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# PROGRAM CATEGORY
# ==========================================

class ProgramCategoryBase(BaseModel):
    """Base fields for Program Category"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., max_length=2000)
    status: ListingStatus = ListingStatus.FOUNDING


class ProgramCategoryCreate(ProgramCategoryBase):
    """Create a new program category (admin only)"""
    pass


class ProgramCategoryUpdate(BaseModel):
    """Update program category fields (admin only)"""
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[ListingStatus] = None


class ProgramCategory(ProgramCategoryBase):
    """Full program category with metadata"""
    id: str
    image_url: Optional[str] = None  # Phase-0.75: Card thumbnail
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# LEARNING RESOURCE
# ==========================================

class LearningResourceBase(BaseModel):
    """Base fields for Learning Resource"""
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., max_length=1000)
    link_url: Optional[str] = None  # External link
    internal_post_id: Optional[str] = None  # Link to BANIBS post
    category: str = Field(..., max_length=100)
    status: ListingStatus = ListingStatus.FOUNDING


class LearningResourceCreate(LearningResourceBase):
    """Create a new learning resource (admin only)"""
    pass


class LearningResourceUpdate(BaseModel):
    """Update learning resource fields (admin only)"""
    title: Optional[str] = None
    description: Optional[str] = None
    link_url: Optional[str] = None
    internal_post_id: Optional[str] = None
    category: Optional[str] = None
    status: Optional[ListingStatus] = None


class LearningResource(LearningResourceBase):
    """Full learning resource with metadata"""
    id: str
    image_url: Optional[str] = None  # Phase-0.75: Card thumbnail
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==========================================
# RESPONSE MODELS
# ==========================================

class TutorListingsResponse(BaseModel):
    """Response for tutor listings"""
    tutors: List[TutorListing]
    count: int


class ProgramCategoriesResponse(BaseModel):
    """Response for program categories"""
    programs: List[ProgramCategory]
    count: int


class LearningResourcesResponse(BaseModel):
    """Response for learning resources"""
    resources: List[LearningResource]
    count: int


class AlternativeSchoolHubResponse(BaseModel):
    """Combined response for Alternative School Hub page"""
    tutors: List[TutorListing]
    programs: List[ProgramCategory]
    resources: List[LearningResource]
    tutor_count: int
    program_count: int
    resource_count: int
