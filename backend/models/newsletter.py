from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from bson import ObjectId

# Phase 4.2 - Newsletter Subscriber Model
class NewsletterSubscriberDB(BaseModel):
    """Newsletter subscriber stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: EmailStr
    created_at: datetime = Field(default_factory=datetime.utcnow)
    confirmed: bool = True  # Default true for now, can add confirmation flow later
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class NewsletterSubscribeRequest(BaseModel):
    """Request body for newsletter subscription"""
    email: EmailStr

class NewsletterSubscriberPublic(BaseModel):
    """Public view of newsletter subscriber (admin only)"""
    id: str
    email: EmailStr
    created_at: datetime
    confirmed: bool
