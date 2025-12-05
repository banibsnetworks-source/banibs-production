"""
BGLIS v1.0 - Phone Number Service

Utilities for phone number validation and normalization to E.164 format.
"""

import re
from typing import Optional, Tuple


class PhoneService:
    """
    Service for phone number operations
    """
    
    # Country code mappings (subset for common countries)
    COUNTRY_CODES = {
        "US": "+1",
        "CA": "+1",
        "GB": "+44",
        "NG": "+234",
        "GH": "+233",
        "KE": "+254",
        "ZA": "+27",
        "JM": "+1",
        "TT": "+1",
        "BB": "+1",
        "MX": "+52",
        "BR": "+55",
        "CO": "+57"
    }
    
    @staticmethod
    def normalize_to_e164(phone: str, country_code: Optional[str] = None) -> Tuple[str, Optional[str]]:
        """
        Normalize phone number to E.164 format
        
        Args:
            phone: Raw phone number input
            country_code: Optional country code (e.g. "US", "NG")
        
        Returns:
            Tuple of (normalized_phone, detected_country_code)
            
        Raises:
            ValueError: If phone number is invalid
        """
        # Remove all non-digit characters except leading +
        cleaned = re.sub(r'[^\d+]', '', phone.strip())
        
        # If already starts with +, assume E.164
        if cleaned.startswith('+'):
            # Validate format
            if not re.match(r'^\+\d{10,15}$', cleaned):
                raise ValueError(f"Invalid E.164 format: {cleaned}")
            
            # Try to detect country from prefix
            detected_country = PhoneService._detect_country_from_number(cleaned)
            return cleaned, detected_country
        
        # If country_code provided, prepend it
        if country_code and country_code in PhoneService.COUNTRY_CODES:
            prefix = PhoneService.COUNTRY_CODES[country_code]
            
            # Remove leading 0 or 1 if present (common in local formats)
            if cleaned.startswith('0'):
                cleaned = cleaned[1:]
            elif country_code in ["US", "CA"] and cleaned.startswith('1'):
                cleaned = cleaned[1:]
            
            e164 = f"{prefix}{cleaned}"
            
            # Validate
            if not re.match(r'^\+\d{10,15}$', e164):
                raise ValueError(f"Invalid phone number: {phone}")
            
            return e164, country_code
        
        # Default: assume US/Canada (+1) if 10 digits
        if len(cleaned) == 10:
            e164 = f"+1{cleaned}"
            return e164, "US"
        
        # Default: assume US/Canada if 11 digits starting with 1
        if len(cleaned) == 11 and cleaned.startswith('1'):
            e164 = f"+{cleaned}"
            return e164, "US"
        
        raise ValueError(f"Cannot normalize phone number: {phone}. Provide country_code.")
    
    @staticmethod
    def _detect_country_from_number(e164_phone: str) -> Optional[str]:
        """
        Try to detect country code from E.164 phone number
        
        Args:
            e164_phone: Phone in E.164 format (e.g. "+15551234567")
        
        Returns:
            Country code (e.g. "US") or None if not detected
        """
        # Check each country's prefix
        for country, prefix in PhoneService.COUNTRY_CODES.items():
            if e164_phone.startswith(prefix):
                return country
        
        return None
    
    @staticmethod
    def validate_e164(phone: str) -> bool:
        """
        Validate that phone number is in E.164 format
        
        Args:
            phone: Phone number to validate
        
        Returns:
            True if valid E.164, False otherwise
        """
        return bool(re.match(r'^\+\d{10,15}$', phone))
    
    @staticmethod
    def mask_phone(phone: str) -> str:
        """
        Mask phone number for display (show last 4 digits only)
        
        Args:
            phone: E.164 phone number
        
        Returns:
            Masked phone (e.g. "+1******1234")
        """
        if not phone or len(phone) < 8:
            return "****"
        
        # Show country code + last 4 digits
        if phone.startswith('+'):
            country_part = phone[:3] if len(phone) > 10 else phone[:2]
            last_four = phone[-4:]
            masked_middle = "*" * (len(phone) - len(country_part) - 4)
            return f"{country_part}{masked_middle}{last_four}"
        
        return phone[-4:]
