"""
BCEE v1.0 - User Region Service

Detects user's region and currency preferences with fallback chain:
1. User profile (detected_country, manual preferences)
2. IP geolocation (dev stub returns None)
3. Default configuration (USD/US)
"""

import os
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase

from models.currency import UserRegionProfile
from services.currency_config import CurrencyConfigService


class UserRegionService:
    """
    Service for detecting and managing user region/currency preferences
    
    Detection priority:
    1. User profile preferences (if explicitly set)
    2. User profile detected_country (from registration/IP)
    3. IP geolocation (fallback)
    4. Default configuration (USD/US)
    """
    
    # Default fallback values
    DEFAULT_COUNTRY = "US"
    DEFAULT_CURRENCY = "USD"
    DEFAULT_LOCALE = "en-US"
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.users_collection = db.banibs_users
        self.use_dev_mode = os.getenv("BCEE_USE_DEV_RATES", "true").lower() == "true"
    
    async def get_user_region(self, user_id: Optional[str] = None) -> UserRegionProfile:
        """
        Get region profile for a user
        
        Args:
            user_id: User ID (optional, for logged-in users)
        
        Returns:
            UserRegionProfile with country, currency, locale
        """
        # Priority 1: Check user profile if user_id provided
        if user_id:
            profile_region = await self._get_region_from_profile(user_id)
            if profile_region:
                return profile_region
        
        # Priority 2: IP geolocation (not implemented in dev mode)
        ip_region = await self._get_region_from_ip()
        if ip_region:
            return ip_region
        
        # Priority 3: Default fallback
        return self._get_default_region()
    
    async def _get_region_from_profile(self, user_id: str) -> Optional[UserRegionProfile]:
        """
        Extract region info from user profile
        
        Args:
            user_id: User ID
        
        Returns:
            UserRegionProfile or None if not available
        """
        user = await self.users_collection.find_one({"id": user_id}, {"_id": 0})
        
        if not user:
            return None
        
        # Check if user has detected_country
        country_code = user.get("detected_country")
        if not country_code:
            return None
        
        # Get currency for country
        currency = CurrencyConfigService.get_default_currency_for_country(country_code)
        
        # Build locale (simple: en-{country_code})
        locale = f"en-{country_code.upper()}"
        
        return UserRegionProfile(
            country_code=country_code,
            preferred_currency=currency,
            locale=locale
        )
    
    async def _get_region_from_ip(self) -> Optional[UserRegionProfile]:
        """
        Detect region from IP address (geolocation)
        
        In dev mode: Returns None (not implemented)
        In production: Would integrate with IP geolocation service
        
        Returns:
            UserRegionProfile or None
        """
        # Dev mode: stub returns None
        if self.use_dev_mode:
            return None
        
        # Production: integrate with IP geolocation API
        # Example: ip-api.com, ipinfo.io, MaxMind GeoIP2
        # For now, return None
        return None
    
    def _get_default_region(self) -> UserRegionProfile:
        """
        Get default region configuration
        
        Returns:
            UserRegionProfile with default values (US/USD)
        """
        return UserRegionProfile(
            country_code=self.DEFAULT_COUNTRY,
            preferred_currency=self.DEFAULT_CURRENCY,
            locale=self.DEFAULT_LOCALE
        )
    
    async def update_user_region(self, user_id: str, country_code: str, preferred_currency: Optional[str] = None) -> bool:
        """
        Update user's region preferences
        
        Args:
            user_id: User ID
            country_code: ISO country code
            preferred_currency: Optional currency override
        
        Returns:
            bool: True if updated successfully
        """
        # Validate currency if provided
        if preferred_currency and not CurrencyConfigService.is_currency_supported(preferred_currency):
            return False
        
        # If no currency provided, use country default
        if not preferred_currency:
            preferred_currency = CurrencyConfigService.get_default_currency_for_country(country_code)
        
        # Update user profile
        result = await self.users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "detected_country": country_code.upper(),
                    "region_override": True,
                    "region_detection_method": "manual"
                }
            }
        )
        
        return result.modified_count > 0
    
    async def detect_and_save_region_for_user(self, user_id: str, ip_address: Optional[str] = None) -> UserRegionProfile:
        """
        Detect region for user and save to profile
        
        Called during registration or first-time setup
        
        Args:
            user_id: User ID
            ip_address: Optional IP address for geolocation
        
        Returns:
            UserRegionProfile
        """
        # Try IP geolocation if provided
        # In dev mode, this will return None
        region = await self._get_region_from_ip()
        
        if region and region.country_code:
            # Save detected region to user profile
            await self.users_collection.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "detected_country": region.country_code,
                        "region_detection_method": "ip_geolocation",
                        "region_override": False
                    }
                },
                upsert=True
            )
            return region
        
        # Fallback to default
        default_region = self._get_default_region()
        await self.users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "detected_country": default_region.country_code,
                    "region_detection_method": "default",
                    "region_override": False
                }
            },
            upsert=True
        )
        
        return default_region
