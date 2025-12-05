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
    BGLIS v1.0: Phone-first global identity with username and recovery phrase
    """
    id: str = Field(..., description="UUID primary key")
    
    # BGLIS v1.0 - Phone (primary identifier)
    phone_number: Optional[str] = Field(None, description="E.164 format phone number (required for BGLIS)")
    phone_country_code: Optional[str] = Field(None, description="Country code (e.g. US, NG, GB)")
    is_phone_verified: bool = Field(default=False, description="Phone verification status")
    
    # BGLIS v1.0 - Username (public identity)
    username: Optional[str] = Field(None, description="Unique public username (required for BGLIS)")
    
    # BGLIS v1.0 - Email (optional in BGLIS)
    email: Optional[EmailStr] = Field(None, description="Email address (optional in BGLIS, unique when present)")
    password_hash: Optional[str] = Field(None, description="Bcrypt hashed password (legacy auth)")
    is_email_verified: bool = Field(default=False, description="Email verification status")
    
    # Display fields
    name: str = Field(..., description="Full name or display name")
    avatar_url: Optional[str] = Field(None, description="Profile avatar URL")
    bio: Optional[str] = Field(None, description="User bio/description")
    
    # BGLIS v1.0 - Recovery phrase system
    has_recovery_phrase: bool = Field(default=False, description="Whether user has set recovery phrase")
    recovery_phrase_hash: Optional[str] = Field(None, description="Hashed recovery phrase (12-word)")
    recovery_phrase_salt: Optional[str] = Field(None, description="Salt for recovery phrase hash")
    
    # BGLIS v1.0 - Migration flag
    needs_bglis_upgrade: bool = Field(default=False, description="Legacy user needs phone+username+phrase setup")
    
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
    
    # BGLIS v1.0 - Audit fields
    last_phone_change_at: Optional[str] = Field(None, description="Last phone number change timestamp")
    failed_recovery_attempts: int = Field(default=0, description="Count of failed recovery phrase attempts")
    last_recovery_attempt_at: Optional[str] = Field(None, description="Last recovery attempt timestamp")
    
    # Phase 8.1 - Preferred Portal
    preferred_portal: str = Field(
        default="news",
        description="User's preferred landing portal: news, social, business, tv, search"
    )
    
    # Phase L.0 - Language Preference
    preferred_language: str = Field(
        default="en",
        description="User's preferred language: en (English), es (Spanish), etc."
    )
    
    # RCS-X Phase 1 - Region Content System
    region_primary: Optional[str] = Field(
        default=None,
        description="User's primary region: U.S., Africa, Caribbean, Global Diaspora"
    )
    region_secondary: Optional[str] = Field(
        default=None,
        description="User's secondary region (optional)"
    )
    detected_country: Optional[str] = Field(
        default=None,
        description="Detected country code (2-letter ISO)"
    )
    region_override: bool = Field(
        default=False,
        description="True if user manually set region (not auto-detected)"
    )
    region_detection_method: Optional[str] = Field(
        default=None,
        description="Detection method: ip_geolocation, device_locale, default"
    )
    
    # Metadata
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional user preferences and settings"
    )
    
    # Phase 10.0 - BANIBS Emoji Identity System
    emoji_identity: Optional[Dict[str, Any]] = Field(
        default=None,
        description="User's personalized emoji identity (skin tone, hair, accessories)"
    )
    
    # Phase 8.1 - Profile Command Center
    profile_picture_url: Optional[str] = Field(
        default=None,
        description="Custom profile picture URL"
    )
    banner_image_url: Optional[str] = Field(
        default=None,
        description="Profile banner/cover image URL"
    )
    accent_color: Optional[str] = Field(
        default="#3B82F6",
        description="User's chosen accent color for profile theming"
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
    BGLIS v1.0: Includes username, never exposes phone/recovery phrase
    """
    id: str
    
    # BGLIS v1.0 - Public identity
    username: Optional[str] = None
    
    # Legacy/optional fields
    email: Optional[str] = None
    name: str
    first_name: Optional[str] = None  # Phase 10.0 - Structured name
    last_name: Optional[str] = None   # Phase 10.0 - Structured name
    avatar_url: Optional[str] = None
    bio: Optional[str] = None
    roles: List[str]
    membership_level: str
    
    # BGLIS v1.0 - Verification status (safe to show)
    email_verified: bool = False
    is_phone_verified: bool = False
    has_recovery_phrase: bool = False
    needs_bglis_upgrade: bool = False
    
    created_at: str
    preferred_portal: str = "news"  # Phase 8.1
    preferred_language: str = "en"  # Phase L.0
    region_primary: Optional[str] = None  # RCS-X Phase 1
    region_secondary: Optional[str] = None  # RCS-X Phase 1
    detected_country: Optional[str] = None  # RCS-X Phase 1
    emoji_identity: Optional[Dict[str, Any]] = None  # Phase 10.0
    profile: Optional[Dict[str, Any]] = None  # Full profile object for compatibility
    profile_picture_url: Optional[str] = None  # Phase 8.1
    banner_image_url: Optional[str] = None  # Phase 8.1
    accent_color: Optional[str] = "#3B82F6"  # Phase 8.1


class UserCreate(BaseModel):
    """
    User registration request
    """
    email: EmailStr
    password: str = Field(..., min_length=8, description="Minimum 8 characters")
    first_name: str = Field(..., min_length=1, description="First name")
    last_name: str = Field(..., min_length=1, description="Last name")
    accepted_terms: bool = Field(..., description="Must accept terms of service")
    date_of_birth: Optional[str] = Field(None, description="Date of birth (YYYY-MM-DD)")
    gender: Optional[str] = Field(None, description="Gender (male, female, prefer_not_to_say)")
    
    # Legacy support - can be removed later
    name: Optional[str] = Field(None, description="Full name (legacy, auto-constructed)")


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
    preferred_portal: Optional[str] = None  # Phase 8.1
    preferred_language: Optional[str] = None  # Phase L.0
    emoji_identity: Optional[Dict[str, Any]] = None  # Phase 10.0
    profile_picture_url: Optional[str] = None  # Phase 8.1
    banner_image_url: Optional[str] = None  # Phase 8.1
    accent_color: Optional[str] = None  # Phase 8.1


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
    needs_bglis_upgrade: bool = False  # BGLIS v1.0 - migration flag


# ===== BGLIS v1.0 Request Models =====

class SendOtpRequest(BaseModel):
    """
    Request OTP for phone verification
    """
    phone_number: str = Field(..., description="Phone number (will be normalized to E.164)")
    purpose: str = Field(..., description="register|login|change_phone_old|change_phone_new|recovery")


class VerifyOtpRequest(BaseModel):
    """
    Verify OTP code
    """
    phone_number: str
    purpose: str
    code: str = Field(..., min_length=6, max_length=6, description="6-digit OTP code")


class RegisterBglisRequest(BaseModel):
    """
    BGLIS v1.0 phone-first registration
    """
    phone_number: str
    username: str = Field(..., min_length=3, max_length=30)
    email: Optional[EmailStr] = None
    otp_code: str = Field(..., min_length=6, max_length=6)
    display_name: Optional[str] = None


class LoginPhoneRequest(BaseModel):
    """
    Login with phone + OTP
    """
    phone_number: str
    otp_code: str = Field(..., min_length=6, max_length=6)


class LoginUsernameRequest(BaseModel):
    """
    Login with username + OTP (phone behind the scenes)
    """
    username: str
    otp_code: str = Field(..., min_length=6, max_length=6)


class PhraseLoginRequest(BaseModel):
    """
    Recovery: login with username/email + recovery phrase
    """
    identifier: str = Field(..., description="Username or email")
    recovery_phrase: str = Field(..., description="12-word recovery phrase (space-separated)")


class ResetPhoneRequest(BaseModel):
    """
    Set new phone after recovery
    """
    new_phone_number: str
    otp_code: str = Field(..., min_length=6, max_length=6)


class ChangePhoneRequest(BaseModel):
    """
    Change phone number (two modes)
    """
    mode: str = Field(..., description="old_phone_available | old_phone_missing")
    old_phone_otp: Optional[str] = Field(None, min_length=6, max_length=6)
    new_phone_number: str
    new_phone_otp: str = Field(..., min_length=6, max_length=6)
    recovery_phrase: Optional[str] = None


class RegeneratePhraseRequest(BaseModel):
    """
    Generate new recovery phrase
    """
    mode: str = Field(..., description="phrase | otp")
    old_recovery_phrase: Optional[str] = None
    otp_code: Optional[str] = Field(None, min_length=6, max_length=6)


class BglisRegisterResponse(BaseModel):
    """
    Response for BGLIS registration (includes recovery phrase once)
    """
    user: UserPublic
    access_token: str
    refresh_token: str
    recovery_phrase: List[str] = Field(..., description="12-word recovery phrase (SAVE THIS!)")


class RecoveryPhraseResponse(BaseModel):
    """
    Response when regenerating recovery phrase
    """
    recovery_phrase: List[str] = Field(..., description="New 12-word recovery phrase (SAVE THIS!)")
