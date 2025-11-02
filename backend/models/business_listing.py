"""
Business Directory v2 - Business Listing Model

MongoDB Schema for BANIBS Business Directory
Supports enhanced directory display with job titles and geo-location.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


class BusinessListing(BaseModel):
    """
    Business listing in BANIBS directory
    """
    id: str = Field(..., description="UUID primary key")
    business_name: str = Field(..., description="Business name")
    contact_email: Optional[EmailStr] = Field(None, description="Contact email")
    contact_phone: Optional[str] = Field(None, description="Contact phone")
    
    # Address fields
    address_line1: Optional[str] = Field(None, description="Street address")
    address_line2: Optional[str] = Field(None, description="Unit/Suite number")
    city: Optional[str] = Field(None, description="City")
    state: Optional[str] = Field(None, description="State/Province")
    postal_code: Optional[str] = Field(None, description="ZIP/Postal code")
    country: str = Field(default="United States", description="Country")
    
    # Business Directory v2 - New Fields
    job_title: Optional[str] = Field(None, description="Contact person's job title")
    geo_latitude: Optional[float] = Field(None, description="Latitude for mapping")
    geo_longitude: Optional[float] = Field(None, description="Longitude for mapping")
    directions_url: Optional[str] = Field(None, description="Custom directions link")
    
    # Business details
    description: Optional[str] = Field(None, description="Business description")
    category: Optional[str] = Field(None, description="Business category")
    website: Optional[str] = Field(None, description="Business website")
    logo_url: Optional[str] = Field(None, description="Logo URL")
    
    # Verification and status
    verified: bool = Field(default=False, description="Verified business badge")
    featured: bool = Field(default=False, description="Featured listing")
    status: str = Field(default="active", description="active, pending, suspended")
    
    # Owner
    owner_id: str = Field(..., description="User ID of business owner")
    
    # Timestamps
    created_at: str = Field(..., description="Created timestamp (ISO)")
    updated_at: Optional[str] = Field(None, description="Updated timestamp (ISO)")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "business_name": "Aisha's Catering Services",
                "contact_email": "info@aishascatering.com",
                "contact_phone": "+1-404-555-0123",
                "address_line1": "123 Main Street",
                "city": "Atlanta",
                "state": "GA",
                "postal_code": "30303",
                "country": "United States",
                "job_title": "Owner & Head Chef",
                "geo_latitude": 33.7490,
                "geo_longitude": -84.3880,
                "directions_url": None,
                "description": "Authentic West African catering",
                "category": "Food & Beverage",
                "website": "https://aishascatering.com",
                "verified": True,
                "owner_id": "user-uuid",
                "created_at": "2025-11-01T12:00:00Z"
            }
        }


class BusinessListingPublic(BaseModel):
    """
    Public API response for business listing
    Includes computed directions_link field
    """
    id: str
    business_name: str
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str
    job_title: Optional[str] = None
    geo_latitude: Optional[float] = None
    geo_longitude: Optional[float] = None
    directions_url: Optional[str] = None
    directions_link: Optional[str] = None  # Computed field
    description: Optional[str] = None
    category: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
    verified: bool
    featured: bool
    created_at: str


class BusinessListingCreate(BaseModel):
    """
    Create business listing request
    """
    business_name: str
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: str = "United States"
    job_title: Optional[str] = None
    geo_latitude: Optional[float] = None
    geo_longitude: Optional[float] = None
    directions_url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None


class BusinessListingUpdate(BaseModel):
    """
    Update business listing request
    """
    business_name: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None
    job_title: Optional[str] = None
    geo_latitude: Optional[float] = None
    geo_longitude: Optional[float] = None
    directions_url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    website: Optional[str] = None
    logo_url: Optional[str] = None
