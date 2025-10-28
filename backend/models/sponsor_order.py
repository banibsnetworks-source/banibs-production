from typing import Literal, Optional
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId

# Phase 5.1 - Sponsor Orders Model
class SponsorOrderDB(BaseModel):
    """Sponsor order stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    opportunity_id: str
    contributor_id: str
    amount: float  # e.g., 99.00
    currency: str = "USD"
    status: Literal["pending", "paid", "failed", "refunded"] = "pending"
    sponsor_label: Optional[str] = None
    stripe_session_id: Optional[str] = None  # Stripe Checkout Session ID
    stripe_payment_intent_id: Optional[str] = None  # Payment Intent ID
    created_at: datetime = Field(default_factory=datetime.utcnow)
    paid_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class SponsorCheckoutRequest(BaseModel):
    """Request to create sponsor checkout"""
    opportunity_id: str
    sponsor_label: Optional[str] = None

class SponsorCheckoutResponse(BaseModel):
    """Response with Stripe checkout URL"""
    checkout_url: str
    order_id: str
