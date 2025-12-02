"""
BANIBS Region Content System (RCS-X)
Region Detection Engine (RDE) - Phase 1

Automatic region detection using IP geolocation and device locale fallback.
"""

import logging
from typing import Optional, Dict, Tuple
import requests
from fastapi import Request

logger = logging.getLogger("region_detection")

# Region mappings
REGIONS = {
    "U.S.": "U.S.",
    "Africa": "Africa",
    "Caribbean": "Caribbean",
    "Global Diaspora": "Global Diaspora",
}

# Country to region mapping
COUNTRY_TO_REGION = {
    # U.S.
    "US": "U.S.",
    "USA": "U.S.",
    
    # Africa (54 countries)
    "DZ": "Africa", "AO": "Africa", "BJ": "Africa", "BW": "Africa", "BF": "Africa",
    "BI": "Africa", "CM": "Africa", "CV": "Africa", "CF": "Africa", "TD": "Africa",
    "KM": "Africa", "CG": "Africa", "CD": "Africa", "CI": "Africa", "DJ": "Africa",
    "EG": "Africa", "GQ": "Africa", "ER": "Africa", "ET": "Africa", "GA": "Africa",
    "GM": "Africa", "GH": "Africa", "GN": "Africa", "GW": "Africa", "KE": "Africa",
    "LS": "Africa", "LR": "Africa", "LY": "Africa", "MG": "Africa", "MW": "Africa",
    "ML": "Africa", "MR": "Africa", "MU": "Africa", "YT": "Africa", "MA": "Africa",
    "MZ": "Africa", "NA": "Africa", "NE": "Africa", "NG": "Africa", "RE": "Africa",
    "RW": "Africa", "ST": "Africa", "SN": "Africa", "SC": "Africa", "SL": "Africa",
    "SO": "Africa", "ZA": "Africa", "SS": "Africa", "SD": "Africa", "SZ": "Africa",
    "TZ": "Africa", "TG": "Africa", "TN": "Africa", "UG": "Africa", "ZM": "Africa",
    "ZW": "Africa",
    
    # Caribbean
    "AG": "Caribbean", "BS": "Caribbean", "BB": "Caribbean", "CU": "Caribbean",
    "DM": "Caribbean", "DO": "Caribbean", "GD": "Caribbean", "HT": "Caribbean",
    "JM": "Caribbean", "KN": "Caribbean", "LC": "Caribbean", "VC": "Caribbean",
    "TT": "Caribbean", "AI": "Caribbean", "AW": "Caribbean", "BQ": "Caribbean",
    "CW": "Caribbean", "GP": "Caribbean", "MQ": "Caribbean", "MS": "Caribbean",
    "PR": "Caribbean", "BL": "Caribbean", "MF": "Caribbean", "SX": "Caribbean",
    "TC": "Caribbean", "VG": "Caribbean", "VI": "Caribbean", "KY": "Caribbean",
    
    # Global Diaspora (UK, Canada, Europe, South America, etc.)
    "GB": "Global Diaspora", "CA": "Global Diaspora", "FR": "Global Diaspora",
    "DE": "Global Diaspora", "IT": "Global Diaspora", "ES": "Global Diaspora",
    "PT": "Global Diaspora", "NL": "Global Diaspora", "BE": "Global Diaspora",
    "SE": "Global Diaspora", "NO": "Global Diaspora", "DK": "Global Diaspora",
    "FI": "Global Diaspora", "IE": "Global Diaspora", "AT": "Global Diaspora",
    "CH": "Global Diaspora", "PL": "Global Diaspora", "CZ": "Global Diaspora",
    "BR": "Global Diaspora", "AR": "Global Diaspora", "CO": "Global Diaspora",
    "VE": "Global Diaspora", "PE": "Global Diaspora", "CL": "Global Diaspora",
    "EC": "Global Diaspora", "GY": "Global Diaspora", "SR": "Global Diaspora",
    "UY": "Global Diaspora", "PY": "Global Diaspora", "BO": "Global Diaspora",
    "AU": "Global Diaspora", "NZ": "Global Diaspora", "JP": "Global Diaspora",
    "KR": "Global Diaspora", "CN": "Global Diaspora", "IN": "Global Diaspora",
}

# Locale to region mapping (fallback)
LOCALE_TO_REGION = {
    "en-US": "U.S.",
    "en-NG": "Africa", "en-GH": "Africa", "en-KE": "Africa", "en-ZA": "Africa",
    "en-TZ": "Africa", "en-UG": "Africa", "en-ZW": "Africa", "en-ZM": "Africa",
    "en-JM": "Caribbean", "en-TT": "Caribbean", "en-BB": "Caribbean",
    "en-BS": "Caribbean", "en-HT": "Caribbean", "en-DO": "Caribbean",
    "en-GB": "Global Diaspora", "en-CA": "Global Diaspora", "fr-FR": "Global Diaspora",
    "fr-CA": "Global Diaspora", "es-ES": "Global Diaspora", "pt-BR": "Global Diaspora",
}


class RegionDetectionService:
    """
    Region Detection Engine (RDE)
    Detects user region using multiple methods
    """
    
    @staticmethod
    def detect_country_from_ip(ip_address: str) -> Optional[str]:
        """
        Detect country from IP address using free IP geolocation API
        
        Args:
            ip_address: User's IP address
            
        Returns:
            Country code (2-letter ISO) or None
        """
        if not ip_address or ip_address in ["127.0.0.1", "localhost"]:
            logger.debug("Local IP detected, skipping geolocation")
            return None
        
        try:
            # Using ip-api.com (free, no key required, 45 req/min limit)
            response = requests.get(
                f"http://ip-api.com/json/{ip_address}",
                timeout=3
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "success":
                    country_code = data.get("countryCode")
                    logger.info(f"IP {ip_address} detected as {country_code} ({data.get('country')})")
                    return country_code
        except Exception as e:
            logger.error(f"IP geolocation failed: {str(e)}")
        
        return None
    
    @staticmethod
    def detect_region_from_country(country_code: str) -> str:
        """
        Map country code to BANIBS region
        
        Args:
            country_code: 2-letter ISO country code
            
        Returns:
            Region name
        """
        region = COUNTRY_TO_REGION.get(country_code.upper(), "Global Diaspora")
        logger.info(f"Country {country_code} mapped to region: {region}")
        return region
    
    @staticmethod
    def detect_region_from_locale(locale: str) -> str:
        """
        Detect region from device locale (fallback)
        
        Args:
            locale: Device locale (e.g., "en-US", "en-NG")
            
        Returns:
            Region name
        """
        region = LOCALE_TO_REGION.get(locale, "Global Diaspora")
        logger.info(f"Locale {locale} mapped to region: {region}")
        return region
    
    @staticmethod
    def get_client_ip(request: Request) -> str:
        """
        Extract client IP from request headers
        
        Args:
            request: FastAPI request object
            
        Returns:
            Client IP address
        """
        # Check X-Forwarded-For header (for proxies/load balancers)
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            # Get first IP in chain
            return forwarded.split(",")[0].strip()
        
        # Check X-Real-IP header
        real_ip = request.headers.get("X-Real-IP")
        if real_ip:
            return real_ip
        
        # Fallback to client host
        return request.client.host if request.client else "127.0.0.1"
    
    @staticmethod
    def detect_region_full(
        request: Request,
        locale: Optional[str] = None
    ) -> Dict[str, Optional[str]]:
        """
        Full region detection using IP and locale fallback
        
        Args:
            request: FastAPI request object
            locale: Optional device locale
            
        Returns:
            Dictionary with detection results
        """
        result = {
            "region_primary": "Global Diaspora",  # Default
            "detected_country": None,
            "detection_method": "default",
            "ip_address": None,
        }
        
        # Step 1: Try IP geolocation
        ip_address = RegionDetectionService.get_client_ip(request)
        result["ip_address"] = ip_address
        
        country_code = RegionDetectionService.detect_country_from_ip(ip_address)
        
        if country_code:
            result["detected_country"] = country_code
            result["region_primary"] = RegionDetectionService.detect_region_from_country(country_code)
            result["detection_method"] = "ip_geolocation"
            return result
        
        # Step 2: Fallback to device locale
        if locale:
            result["region_primary"] = RegionDetectionService.detect_region_from_locale(locale)
            result["detection_method"] = "device_locale"
            return result
        
        # Step 3: Default to Global Diaspora
        logger.info("No detection method succeeded, using default: Global Diaspora")
        return result
    
    @staticmethod
    def get_region_priority_order(region: str) -> list:
        """
        Get tab priority order for a region
        
        Args:
            region: Primary region
            
        Returns:
            List of regions in priority order
        """
        priority_map = {
            "U.S.": ["U.S.", "Africa", "Caribbean", "Global Diaspora"],
            "Caribbean": ["Caribbean", "U.S.", "Africa", "Global Diaspora"],
            "Africa": ["Africa", "U.S.", "Caribbean", "Global Diaspora"],
            "Global Diaspora": ["Global Diaspora", "Africa", "U.S.", "Caribbean"],
        }
        
        return priority_map.get(region, priority_map["Global Diaspora"])
    
    @staticmethod
    def get_country_flag_emoji(country_code: str) -> str:
        """
        Get flag emoji for country code
        
        Args:
            country_code: 2-letter ISO country code
            
        Returns:
            Flag emoji string
        """
        # Map common countries to flag emojis
        flag_map = {
            "US": "🇺🇸", "NG": "🇳🇬", "GH": "🇬🇭", "KE": "🇰🇪", "ZA": "🇿🇦",
            "JM": "🇯🇲", "TT": "🇹🇹", "BB": "🇧🇧", "HT": "🇭🇹", "BS": "🇧🇸",
            "GB": "🇬🇧", "CA": "🇨🇦", "FR": "🇫🇷", "BR": "🇧🇷", "DO": "🇩🇴",
        }
        
        return flag_map.get(country_code.upper(), "🌍")


# Export instance
region_detection = RegionDetectionService()
