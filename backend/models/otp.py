"""
BGLIS v1.0 - OTP (One-Time Password) Models

OTP system for phone verification across:
- Registration
- Login
- Phone change
- Recovery flows
"""

from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime


class OtpToken(BaseModel):
    """
    OTP token document stored in otp_tokens collection
    """
    id: str = Field(..., description="Unique OTP ID")
    phone_number: str = Field(..., description="E.164 format phone number")
    code: str = Field(..., description="6-digit numeric code")
    purpose: Literal["register", "login", "change_phone_old", "change_phone_new", "recovery", "upgrade"] = Field(
        ..., 
        description="Purpose of this OTP"
    )
    created_at: str = Field(..., description="Creation timestamp (ISO)")
    expires_at: str = Field(..., description="Expiration timestamp (ISO)")
    attempts: int = Field(default=0, description="Number of verification attempts")
    max_attempts: int = Field(default=5, description="Maximum allowed attempts")
    used: bool = Field(default=False, description="Whether this OTP has been used")
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "otp_abc123",
                "phone_number": "+15551234567",
                "code": "123456",
                "purpose": "login",
                "created_at": "2025-12-05T10:00:00Z",
                "expires_at": "2025-12-05T10:10:00Z",
                "attempts": 0,
                "max_attempts": 5,
                "used": False
            }
        }


class OtpVerificationResult(BaseModel):
    """
    Result of OTP verification attempt
    """
    success: bool
    error: str | None = None
    remaining_attempts: int | None = None
