from typing import Optional, Literal
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from bson import ObjectId

# User model for authentication and authorization
class UserDB(BaseModel):
    """User document stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    email: EmailStr
    password_hash: str
    role: Literal["admin", "moderator", "editor"] = "editor"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class UserCreate(BaseModel):
    """Request body for user creation"""
    email: EmailStr
    password: str
    role: Literal["admin", "moderator", "editor"] = "editor"

class UserLogin(BaseModel):
    """Request body for login"""
    email: EmailStr
    password: str

class UserPublic(BaseModel):
    """Public user information (no password)"""
    email: EmailStr
    role: str
    created_at: datetime

class TokenResponse(BaseModel):
    """Response containing JWT tokens"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserPublic

class RefreshTokenRequest(BaseModel):
    """Request body for token refresh"""
    refresh_token: str

class TokenRefreshResponse(BaseModel):
    """Response for token refresh"""
    access_token: str
    token_type: str = "bearer"
