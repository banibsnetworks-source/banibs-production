"""
BGLIS v1.0 - SMS Provider Interface

Abstraction layer for sending OTP codes via SMS.
Supports multiple providers (dev, Twilio, AWS SNS, etc.)
"""

from abc import ABC, abstractmethod
from typing import Literal
import os


class SmsProvider(ABC):
    """
    Abstract base class for SMS providers
    """
    
    @abstractmethod
    async def send_otp(
        self,
        to: str,
        message: str,
        purpose: Literal["login", "verify", "change_phone", "recovery"]
    ) -> None:
        """
        Send OTP message to phone number
        
        Args:
            to: E.164 formatted phone number
            message: SMS message content (includes OTP code)
            purpose: Purpose of the OTP (for logging/analytics)
        """
        pass


class DevSmsProvider(SmsProvider):
    """
    Development SMS provider - logs to console instead of sending real SMS
    
    Environment Variables:
        DEV_BYPASS_OTP: If "true", allows fixed code "111111" for any OTP verification
    """
    
    def __init__(self):
        self.bypass_enabled = os.getenv("DEV_BYPASS_OTP", "false").lower() == "true"
    
    async def send_otp(
        self,
        to: str,
        message: str,
        purpose: Literal["login", "verify", "change_phone", "recovery"]
    ) -> None:
        """
        Log OTP to console (dev mode)
        """
        print("\n" + "="*60)
        print("📱 DEV SMS PROVIDER - OTP MESSAGE")
        print("="*60)
        print(f"To: {to}")
        print(f"Purpose: {purpose}")
        print(f"Message: {message}")
        
        if self.bypass_enabled:
            print("\n⚠️  DEV_BYPASS_OTP is ENABLED")
            print("   You can use code: 111111 for any verification")
        
        print("="*60 + "\n")


# Factory function to get the appropriate SMS provider
def get_sms_provider() -> SmsProvider:
    """
    Get SMS provider based on environment configuration
    
    Environment Variables:
        SMS_PROVIDER: Provider to use (default: "dev")
            - "dev": DevSmsProvider (console logging)
            - "twilio": TwilioSmsProvider (future)
            - "sns": AwsSnsProvider (future)
    """
    provider_type = os.getenv("SMS_PROVIDER", "dev").lower()
    
    if provider_type == "dev":
        return DevSmsProvider()
    else:
        # Future: Add real providers
        raise NotImplementedError(f"SMS provider '{provider_type}' not yet implemented. Use 'dev' for now.")
