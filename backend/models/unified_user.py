"""
Phase 6.0 - Unified User Model

Single user model for all BANIBS properties:
- banibs.com (News)
- banibsnews.com (News)
- banibsbiz.com (Business)
- banibs.tv (Video)

Replaces separate users and contributors tables.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class UnifiedUser(BaseModel):
    """
    Unified user account model (banibs_users collection)
    """
    id: str = Field(..., description="UUID primary key")
    email: EmailStr = Field(..., description="Unique email address")
    password_hash: str = Field(..., description="Bcrypt hashed password")
    name: str = Field(..., description="Full name")
    avatar_url: Optional[str] = Field(None, description="Profile avatar URL")
    bio: Optional[str] = Field(None, description="User bio/description")
    
    # Roles and permissions
    roles: List[str] = Field(
        default_factory=lambda: ["user"],
        description="User roles: user, contributor, creator, admin, super_admin"
    )
    
    # Membership
    membership_level: str = Field(
        default="free",
        description="free, basic, pro, enterprise"
    )
    membership_status: str = Field(
        default="active",
        description="active, cancelled, past_due"
    )
    subscription_id: Optional[str] = Field(None, description="Stripe subscription ID")
    subscription_expires_at: Optional[str] = Field(None, description="Subscription end date (ISO)")
    
    # Email verification
    email_verified: bool = Field(default=False, description="Email verification status")
    email_verification_token: Optional[str] = Field(None, description="Email verification token")
    email_verification_expires: Optional[str] = Field(None, description="Token expiration")
    
    # Password reset
    password_reset_token: Optional[str] = Field(None, description="Password reset token")
    password_reset_expires: Optional[str] = Field(None, description="Token expiration")
    
    # Timestamps
    created_at: str = Field(..., description="Account creation timestamp (ISO)")
    last_login: Optional[str] = Field(None, description="Last login timestamp (ISO)")
    updated_at: Optional[str] = Field(None, description="Last update timestamp (ISO)")
    
    # Metadata
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional user preferences and settings"
    )
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "password_hash": "$2b$12$...",
                "name": "John Doe",
                "avatar_url": "https://cdn.banibs.com/avatars/user.jpg",
                "bio": "Community member and entrepreneur",
                "roles": ["user", "contributor"],
                "membership_level": "free",
                "membership_status": "active",
                "email_verified": True,
                "created_at": "2025-11-01T12:00:00Z",
                "last_login": "2025-11-01T15:30:00Z",
                "metadata": {}
            }
        }


class UserPublic(BaseModel):
    """
    Public user profile (safe to expose in APIs)
    """
    id: str
    email: str
    name: str
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    roles: List[str]
    membership_level: str
    email_verified: bool
    created_at: str


class UserCreate(BaseModel):
    """
    User registration request
    """
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    name: str = Field(..., min_length=2)
    accepted_terms: bool = Field(..., description="Must accept terms of service")


class UserLogin(BaseModel):
    """
    User login request
    """
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    """
    User profile update request
    """
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None


class PasswordResetRequest(BaseModel):
    """
    Password reset request
    """
    email: EmailStr


class PasswordReset(BaseModel):
    """
    Complete password reset
    """
    token: str
    new_password: str = Field(..., min_length=8)


class EmailVerification(BaseModel):
    """
    Email verification request
    """
    token: str


class RefreshTokenRequest(BaseModel):
    """
    Refresh token request
    """
    refresh_token: str


class TokenResponse(BaseModel):
    """
    Authentication token response
    """
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int = 900  # 15 minutes in seconds
    user: UserPublic
