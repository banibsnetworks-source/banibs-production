"""
BGLIS v1.0 - OTP Service

Manages OTP generation, storage, verification, and rate limiting.
"""

import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.otp import OtpToken, OtpVerificationResult
from services.sms_provider import get_sms_provider


class OtpService:
    """
    Service for OTP operations
    """
    
    # OTP configuration
    OTP_LENGTH = 6
    OTP_EXPIRY_MINUTES = 10
    MAX_ATTEMPTS = 5
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.otp_collection = db.otp_tokens
        self.sms_provider = get_sms_provider()
        self.dev_bypass_enabled = os.getenv("DEV_BYPASS_OTP", "false").lower() == "true"
    
    def _generate_code(self) -> str:
        """Generate a random 6-digit OTP code"""
        return ''.join([str(secrets.randbelow(10)) for _ in range(self.OTP_LENGTH)])
    
    def _get_expiry_time(self) -> datetime:
        """Get OTP expiration timestamp"""
        return datetime.now(timezone.utc) + timedelta(minutes=self.OTP_EXPIRY_MINUTES)
    
    async def send_otp(
        self,
        phone_number: str,
        purpose: str
    ) -> dict:
        """
        Generate and send OTP to phone number
        
        Args:
            phone_number: E.164 formatted phone number
            purpose: Purpose of OTP (register, login, etc.)
        
        Returns:
            dict with success status
        """
        # Invalidate any existing OTP for this phone + purpose
        await self.otp_collection.delete_many({
            "phone_number": phone_number,
            "purpose": purpose
        })
        
        # Generate new OTP
        code = self._generate_code()
        now = datetime.now(timezone.utc)
        expires_at = self._get_expiry_time()
        
        otp_doc = {
            "phone_number": phone_number,
            "code": code,
            "purpose": purpose,
            "created_at": now.isoformat(),
            "expires_at": expires_at.isoformat(),
            "attempts": 0,
            "max_attempts": self.MAX_ATTEMPTS,
            "used": False
        }
        
        # Store in database
        result = await self.otp_collection.insert_one(otp_doc)
        otp_doc["id"] = str(result.inserted_id)
        
        # Create TTL index if it doesn't exist (auto-cleanup expired OTPs)
        await self.otp_collection.create_index("expires_at", expireAfterSeconds=0)
        
        # Format SMS message
        message = f"Your BANIBS verification code is: {code}\n\nThis code expires in {self.OTP_EXPIRY_MINUTES} minutes."
        
        # Send via SMS provider
        await self.sms_provider.send_otp(
            to=phone_number,
            message=message,
            purpose=purpose
        )
        
        return {
            "success": True,
            "expires_in_seconds": self.OTP_EXPIRY_MINUTES * 60
        }
    
    async def verify_otp(
        self,
        phone_number: str,
        purpose: str,
        code: str
    ) -> OtpVerificationResult:
        """
        Verify OTP code
        
        Args:
            phone_number: E.164 formatted phone number
            purpose: Purpose of OTP
            code: 6-digit code to verify
        
        Returns:
            OtpVerificationResult with success status and error details
        """
        now = datetime.now(timezone.utc)
        
        # Find active OTP
        otp_doc = await self.otp_collection.find_one({
            "phone_number": phone_number,
            "purpose": purpose,
            "used": False
        })
        
        if not otp_doc:
            return OtpVerificationResult(
                success=False,
                error="OTP_INVALID_OR_EXPIRED"
            )
        
        # Check expiration
        expires_at = datetime.fromisoformat(otp_doc["expires_at"])
        if now > expires_at:
            await self.otp_collection.delete_one({"_id": otp_doc["_id"]})
            return OtpVerificationResult(
                success=False,
                error="OTP_EXPIRED"
            )
        
        # Check max attempts
        if otp_doc["attempts"] >= otp_doc["max_attempts"]:
            await self.otp_collection.delete_one({"_id": otp_doc["_id"]})
            return OtpVerificationResult(
                success=False,
                error="TOO_MANY_ATTEMPTS"
            )
        
        # Dev bypass check
        if self.dev_bypass_enabled and code == "111111":
            # Mark as used and return success
            await self.otp_collection.update_one(
                {"_id": otp_doc["_id"]},
                {"$set": {"used": True}}
            )
            return OtpVerificationResult(success=True)
        
        # Verify code
        if code != otp_doc["code"]:
            # Increment attempts
            new_attempts = otp_doc["attempts"] + 1
            await self.otp_collection.update_one(
                {"_id": otp_doc["_id"]},
                {"$set": {"attempts": new_attempts}}
            )
            
            remaining = otp_doc["max_attempts"] - new_attempts
            return OtpVerificationResult(
                success=False,
                error="OTP_INVALID",
                remaining_attempts=remaining
            )
        
        # Success - mark as used
        await self.otp_collection.update_one(
            {"_id": otp_doc["_id"]},
            {"$set": {"used": True}}
        )
        
        return OtpVerificationResult(success=True)
    
    async def cleanup_expired(self):
        """
        Manual cleanup of expired OTPs (TTL index should handle this automatically)
        """
        now = datetime.now(timezone.utc)
        result = await self.otp_collection.delete_many({
            "expires_at": {"$lt": now.isoformat()}
        })
        return result.deleted_count
