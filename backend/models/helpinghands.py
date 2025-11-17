"""
BANIBS Helping Hands - Data Models
Phase 10.0 - Donation-Based Crowdfunding Platform

Collections:
- helpinghands_campaigns: Campaign listings
- helpinghands_supports: Individual donations/supports
- helpinghands_reports: Moderation reports
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class CampaignCategory(str, Enum):
    """Campaign categories"""
    MEDICAL = "medical"
    EDUCATION = "education"
    BUSINESS = "business"
    COMMUNITY = "community"
    EMERGENCY = "emergency"
    CREATIVE = "creative"
    FAMILY = "family"
    OTHER = "other"


class CampaignStatus(str, Enum):
    """Campaign lifecycle status"""
    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"
    CLOSED = "closed"


class SupportVisibility(str, Enum):
    """Supporter visibility options"""
    PUBLIC = "public"  # Show name + amount
    NAME_ONLY = "name_only"  # Show name, hide amount
    ANONYMOUS = "anonymous"  # Hide both


# ============= Campaign Models =============

class HelpingHandsCampaign(BaseModel):
    """
    Main campaign document
    """
    id: str = Field(alias="_id")
    owner_id: str  # User who created it
    is_personal: bool = True  # Personal or business campaign
    business_id: Optional[str] = None  # If business campaign
    
    # Campaign Details
    title: str
    summary: str  # Short description (150 chars)
    story: str  # Full story (rich text OK)
    category: CampaignCategory
    
    # Location
    city: Optional[str] = None
    state: Optional[str] = None
    
    # Financials
    goal_amount: Optional[float] = None  # Can be None for "any amount helps"
    raised_amount: float = 0.0
    supporters_count: int = 0
    
    # Media
    cover_image: Optional[str] = None  # Main hero image
    gallery: List[str] = []  # Additional images
    
    # Status & Visibility
    status: CampaignStatus = CampaignStatus.DRAFT
    featured: bool = False  # Admin can feature campaigns
    
    # Timestamps
    created_at: datetime
    updated_at: datetime
    published_at: Optional[datetime] = None
    ends_at: Optional[datetime] = None  # Optional end date
    
    class Config:
        populate_by_name = True


class CampaignCreateRequest(BaseModel):
    """Request body for creating campaign"""
    title: str
    summary: str
    story: str
    category: CampaignCategory
    city: Optional[str] = None
    state: Optional[str] = None
    goal_amount: Optional[float] = None
    cover_image: Optional[str] = None
    gallery: List[str] = []
    is_personal: bool = True
    business_id: Optional[str] = None
    status: CampaignStatus = CampaignStatus.DRAFT  # Can publish immediately or save as draft


class CampaignUpdateRequest(BaseModel):
    """Request body for updating campaign"""
    title: Optional[str] = None
    summary: Optional[str] = None
    story: Optional[str] = None
    category: Optional[CampaignCategory] = None
    city: Optional[str] = None
    state: Optional[str] = None
    goal_amount: Optional[float] = None
    cover_image: Optional[str] = None
    gallery: Optional[List[str]] = None
    status: Optional[CampaignStatus] = None


# ============= Support/Donation Models =============

class HelpingHandsSupport(BaseModel):
    """
    Individual donation/support record
    """
    id: str = Field(alias="_id")
    campaign_id: str
    supporter_id: Optional[str] = None  # User ID (can be anonymous guest)
    
    # Support Details
    amount: float
    stripe_payment_intent_id: str  # Stripe reference
    stripe_charge_id: Optional[str] = None
    
    # Supporter Info
    supporter_name: Optional[str] = None  # Name shown publicly (if not anonymous)
    supporter_email: str  # For receipt
    visibility: SupportVisibility = SupportVisibility.PUBLIC
    
    # Optional Message
    message: Optional[str] = None  # "Good luck!" or supportive message
    
    # Timestamps
    supported_at: datetime
    
    class Config:
        populate_by_name = True


class SupportRequest(BaseModel):
    """Request to initiate support/donation"""
    campaign_id: str
    amount: float
    supporter_name: Optional[str] = None
    supporter_email: str
    visibility: SupportVisibility = SupportVisibility.PUBLIC
    message: Optional[str] = None


# ============= Report Models =============

class ReportReason(str, Enum):
    """Report reasons"""
    FRAUD = "fraud"
    SPAM = "spam"
    INAPPROPRIATE = "inappropriate"
    MISLEADING = "misleading"
    OTHER = "other"


class HelpingHandsReport(BaseModel):
    """
    Moderation report for campaigns
    """
    id: str = Field(alias="_id")
    campaign_id: str
    reporter_id: str  # User who reported
    reason: ReportReason
    details: Optional[str] = None
    
    # Status
    reviewed: bool = False
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    action_taken: Optional[str] = None
    
    # Timestamps
    reported_at: datetime
    
    class Config:
        populate_by_name = True


class ReportCampaignRequest(BaseModel):
    """Request to report a campaign"""
    reason: ReportReason
    details: Optional[str] = None


# ============= Response Models =============

class CampaignListResponse(BaseModel):
    """Paginated list of campaigns"""
    campaigns: List[HelpingHandsCampaign]
    total: int
    page: int
    limit: int
    has_more: bool


class StripeCheckoutResponse(BaseModel):
    """Response from creating Stripe Checkout session"""
    checkout_url: str  # Redirect user here
    session_id: str
