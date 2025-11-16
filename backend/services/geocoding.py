"""
Geocoding Service - Phase 8.2
Converts addresses to latitude/longitude coordinates
"""

import os
import logging
from typing import Optional, Dict, Tuple
import httpx

logger = logging.getLogger(__name__)

# Google Maps Geocoding API
GOOGLE_MAPS_API_KEY = os.environ.get("GOOGLE_MAPS_API_KEY")
GOOGLE_GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"

# Mapbox Geocoding API (fallback)
MAPBOX_ACCESS_TOKEN = os.environ.get("MAPBOX_ACCESS_TOKEN")
MAPBOX_GEOCODE_URL = "https://api.mapbox.com/geocoding/v5/mapbox.places"


async def geocode_address(
    address_line1: str,
    city: str,
    state: str,
    postal_code: str,
    country: str = "US",
    address_line2: Optional[str] = None
) -> Optional[Tuple[float, float]]:
    """
    Geocode an address to latitude/longitude
    
    Args:
        address_line1: Street address
        city: City name
        state: State/province
        postal_code: Zip/postal code
        country: 2-letter country code (default: US)
        address_line2: Optional second address line
    
    Returns:
        Tuple of (latitude, longitude) or None if geocoding fails
    """
    # Build full address string
    address_parts = [address_line1]
    if address_line2:
        address_parts.append(address_line2)
    address_parts.extend([city, state, postal_code, country])
    full_address = ", ".join(filter(None, address_parts))
    
    logger.info(f"Geocoding address: {full_address}")
    
    # Try Google Maps first
    if GOOGLE_MAPS_API_KEY:
        result = await _geocode_with_google(full_address)
        if result:
            logger.info(f"Google Maps geocoded successfully: {result}")
            return result
    
    # Fallback to Mapbox
    if MAPBOX_ACCESS_TOKEN:
        result = await _geocode_with_mapbox(full_address)
        if result:
            logger.info(f"Mapbox geocoded successfully: {result}")
            return result
    
    logger.warning(f"Geocoding failed for address: {full_address}")
    return None


async def _geocode_with_google(address: str) -> Optional[Tuple[float, float]]:
    """Geocode using Google Maps API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                GOOGLE_GEOCODE_URL,
                params={
                    "address": address,
                    "key": GOOGLE_MAPS_API_KEY
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "OK" and data.get("results"):
                    location = data["results"][0]["geometry"]["location"]
                    lat = location["lat"]
                    lng = location["lng"]
                    return (lat, lng)
                else:
                    logger.warning(f"Google geocoding status: {data.get('status')}")
            else:
                logger.error(f"Google API error: {response.status_code}")
    except Exception as e:
        logger.error(f"Google geocoding exception: {e}")
    
    return None


async def _geocode_with_mapbox(address: str) -> Optional[Tuple[float, float]]:
    """Geocode using Mapbox API"""
    try:
        async with httpx.AsyncClient() as client:
            # Mapbox uses forward geocoding
            response = await client.get(
                f"{MAPBOX_GEOCODE_URL}/{address}.json",
                params={
                    "access_token": MAPBOX_ACCESS_TOKEN,
                    "limit": 1
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("features"):
                    # Mapbox returns [lng, lat] - note the order!
                    coords = data["features"][0]["geometry"]["coordinates"]
                    lng, lat = coords[0], coords[1]
                    return (lat, lng)
            else:
                logger.error(f"Mapbox API error: {response.status_code}")
    except Exception as e:
        logger.error(f"Mapbox geocoding exception: {e}")
    
    return None


def calculate_distance_km(
    lat1: float, 
    lon1: float, 
    lat2: float, 
    lon2: float
) -> float:
    """
    Calculate distance between two coordinates using Haversine formula
    
    Returns distance in kilometers
    """
    from math import radians, sin, cos, sqrt, atan2
    
    # Earth's radius in kilometers
    R = 6371.0
    
    # Convert to radians
    lat1_rad = radians(lat1)
    lon1_rad = radians(lon1)
    lat2_rad = radians(lat2)
    lon2_rad = radians(lon2)
    
    # Haversine formula
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = sin(dlat / 2)**2 + cos(lat1_rad) * cos(lat2_rad) * sin(dlon / 2)**2
    c = 2 * atan2(sqrt(a), sqrt(1 - a))
    
    distance = R * c
    return distance


def km_to_miles(km: float) -> float:
    """Convert kilometers to miles"""
    return km * 0.621371
