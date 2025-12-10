"""
Business Verification Models
BANIBS AI Business Verification System - Phase 1
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DocumentType(str, Enum):
    """Supported verification document types"""
    LLC = "LLC"
    EIN = "EIN"
    STATE_LICENSE = "STATE_LICENSE"
    BUSINESS_LICENSE = "BUSINESS_LICENSE"
    OTHER = "OTHER"


class VerificationStatus(str, Enum):
    """Verification status values"""
    PENDING = "pending"
    PROCESSING = "processing"
    VERIFIED = "verified"
    REJECTED = "rejected"
    NEEDS_REVIEW = "needs_review"


class AIExtractedData(BaseModel):
    """Data extracted from document by AI"""
    business_name: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    ein: Optional[str] = None
    issue_date: Optional[str] = None
    expiration_date: Optional[str] = None
    doc_valid: bool = False
    confidence_factors: dict = Field(default_factory=dict)


class VerificationDocument(BaseModel):
    """Individual verification document"""
    type: DocumentType
    file_path: str
    encrypted_path: Optional[str] = None
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    
    # AI Analysis Results
    ai_extracted: Optional[AIExtractedData] = None
    ai_confidence: float = 0.0
    ai_processed_at: Optional[datetime] = None
    needs_human_review: bool = False
    
    # Review notes
    review_notes: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None


class VerificationBadge(BaseModel):
    """Verification badge data"""
    status: str = "unverified"  # unverified | verified
    verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    renewal_reminded_at: Optional[datetime] = None


class BusinessVerification(BaseModel):
    """
    Main business verification record
    One active record per business
    """
    business_id: str
    owner_user_id: str
    
    # Documents
    documents: List[VerificationDocument] = Field(default_factory=list)
    
    # Verification Status
    verification_status: VerificationStatus = VerificationStatus.PENDING
    overall_confidence: float = 0.0
    
    # Approval/Rejection
    verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    rejected_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    
    # Review tracking
    needs_human_review: bool = False
    human_review_reason: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Badge
    badge: VerificationBadge = Field(default_factory=VerificationBadge)
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class VerificationUploadResponse(BaseModel):
    """Response from document upload"""
    verification_id: str
    document_id: int
    status: str
    message: str


class AIProcessingResult(BaseModel):
    """Result from AI processing"""
    confidence: float
    needs_review: bool
    extracted_data: AIExtractedData
    processing_time_ms: float
    authenticity_checks: dict = Field(default_factory=dict)


class VerificationStatusResponse(BaseModel):
    """Public verification status for business profiles"""
    is_verified: bool
    verified_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    days_until_expiry: Optional[int] = None
    badge_status: str = "unverified"
