"""
Business Knowledge Flags Models - Phase 8.3
Private knowledge network for business owners (Business → Business Community)
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


class BusinessKnowledgeFlag(BaseModel):
    """
    Knowledge flag posted by business owners
    Only visible to other business owners
    
    Phase 8.3: Supports anonymous posting
    - Anonymous to other businesses (name hidden)
    - NOT anonymous to BANIBS admins (author_business_id always stored)
    """
    id: Optional[str] = None
    business_id: str = Field(..., description="Business creating the flag (always stored)")
    author_business_id: str = Field(..., description="Same as business_id (always stored)")
    author_user_id: str = Field(..., description="User ID of author (for admin tracking)")
    author_business_name: Optional[str] = None  # Denormalized for display (hidden if anonymous)
    
    type: Literal["pitfall", "plus"] = Field(..., description="⚠️ Pitfall or 🏆 Plus Flag")
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=80, max_length=2000, description="Minimum 80 chars for quality")
    
    tags: List[str] = Field(default_factory=list, description="Optional tags for filtering")
    media_url: Optional[str] = Field(None, description="Optional image/document")
    
    # Phase 8.3: Anonymity & Voting
    anonymous: bool = Field(default=False, description="Hide business name from other businesses")
    helpful_votes: int = Field(default=0, description="Upvotes from other businesses")
    not_accurate_votes: int = Field(default=0, description="Downvotes from other businesses")
    
    visibility: str = Field(default="business-only", description="Only business owners can view")
    status: str = Field(default="active", description="active | archived | deleted")
    confidence_score: float = Field(default=0.0, description="Admin moderation score (0-1)")
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None


class BusinessKnowledgeFlagCreate(BaseModel):
    """Create new knowledge flag"""
    type: Literal["pitfall", "plus"]
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)
    tags: List[str] = Field(default_factory=list)
    media_url: Optional[str] = None


class BusinessKnowledgeFlagResponse(BaseModel):
    """Public response for knowledge flags"""
    id: str
    business_id: str
    business_name: str
    type: Literal["pitfall", "plus"]
    title: str
    description: str
    tags: List[str]
    media_url: Optional[str]
    created_at: datetime
    
    # Stats
    reactions_count: int = 0
    comments_count: int = 0
