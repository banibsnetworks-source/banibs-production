from typing import Optional
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from bson import ObjectId

# Contributor model for public users who submit opportunities
class ContributorDB(BaseModel):
    """Contributor document stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: EmailStr
    password_hash: str
    name: str
    organization: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ContributorCreate(BaseModel):
    """Request body for contributor registration"""
    email: EmailStr
    password: str
    name: str
    organization: Optional[str] = None

class ContributorLogin(BaseModel):
    """Request body for contributor login"""
    email: EmailStr
    password: str

class ContributorPublic(BaseModel):
    """Public contributor information (no password)"""
    email: EmailStr
    name: str
    organization: Optional[str]
    created_at: datetime

class ContributorTokenResponse(BaseModel):
    """Response containing JWT tokens for contributor"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    contributor: ContributorPublic
