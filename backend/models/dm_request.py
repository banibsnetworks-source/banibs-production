"""
DM Request Model - Phase B Circle Trust Order
Handles DM requests from COOL/CHILL tier users that require approval
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class DMRequest(BaseModel):
    """
    Represents a pending DM request that requires approval.
    
    Used when COOL or CHILL tier users try to initiate first contact.
    """
    id: str
    sender_id: str
    recipient_id: str
    sender_tier: str  # COOL or CHILL
    message_preview: str  # First 200 chars of the message
    status: str = "pending"  # pending, approved, rejected, expired
    created_at: datetime
    expires_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class DMRequestResponse(BaseModel):
    """Response for DM request actions"""
    action: str  # approve, reject
    message: Optional[str] = None  # Optional message back to requester
