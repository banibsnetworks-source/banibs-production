from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

# Phase 5.2 - Newsletter Send Tracking
class NewsletterSendDB(BaseModel):
    """Newsletter send log stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    total_subscribers: int  # Number of subscribers who received the digest
    total_opportunities: int  # Number of opportunities in the digest
    sent_by: str  # Admin user ID who triggered the send
    status: str = "completed"  # completed, failed, partial
    error_message: Optional[str] = None
    
    class Config:
        populate_by_name = True

class NewsletterSendPublic(BaseModel):
    """Public newsletter send record"""
    id: str
    sent_at: datetime
    total_subscribers: int
    total_opportunities: int
    sent_by: str
    status: str
