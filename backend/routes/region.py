"""
BANIBS Region Content System (RCS-X)
Region API Endpoints - Phase 1

Handles region detection and user region preferences
"""

from fastapi import APIRouter, Request, Depends, HTTPException, Header
from pydantic import BaseModel
from typing import Optional
import sys
sys.path.append('/app/backend')

from services.region_detection_service import region_detection
from db.connection import get_db
from routes.unified_auth import get_current_user

# Helper to make get_current_user optional
async def get_current_user_optional(authorization: Optional[str] = Header(None)):
    """Optional version of get_current_user"""
    try:
        if not authorization:
            return None
        return await get_current_user(authorization)
    except:
        return None

router = APIRouter(prefix="/api/region", tags=["region"])


class RegionDetectResponse(BaseModel):
    """Response for region detection"""
    region_primary: str
    detected_country: Optional[str]
    detection_method: str
    priority_order: list
    ip_address: Optional[str] = None


class RegionUpdateRequest(BaseModel):
    """Request to update user region preferences"""
    region_primary: str
    region_secondary: Optional[str] = None


@router.get("/detect", response_model=RegionDetectResponse)
async def detect_region(
    request: Request,
    locale: Optional[str] = None,
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Detect user region using IP geolocation and device locale
    
    Query Parameters:
    - locale: Device locale (e.g., "en-US", "en-NG") for fallback
    
    Returns:
    - region_primary: Detected primary region
    - detected_country: Country code (if detected)
    - detection_method: Method used (ip_geolocation, device_locale, default)
    - priority_order: Tab priority order for the detected region
    """
    # Perform detection
    detection_result = region_detection.detect_region_full(request, locale)
    
    # Get priority order
    priority_order = region_detection.get_region_priority_order(
        detection_result["region_primary"]
    )
    
    # If user is logged in, save detection to their profile
    if current_user:
        db = await get_db()
        await db.banibs_users.update_one(
            {"id": current_user["id"]},
            {
                "$set": {
                    "region_primary": detection_result["region_primary"],
                    "detected_country": detection_result["detected_country"],
                    "region_detection_method": detection_result["detection_method"],
                    "region_override": False,  # Auto-detected
                }
            }
        )
    
    return RegionDetectResponse(
        region_primary=detection_result["region_primary"],
        detected_country=detection_result["detected_country"],
        detection_method=detection_result["detection_method"],
        priority_order=priority_order,
        ip_address=detection_result.get("ip_address"),
    )


@router.post("/update")
async def update_region(
    region_data: RegionUpdateRequest,
    current_user: dict = Depends(get_current_user_optional)
):
    """
    Update user region preferences (manual override)
    
    Requires authentication.
    
    Body:
    - region_primary: Primary region
    - region_secondary: Secondary region (optional)
    
    Returns:
    - success: Boolean
    - priority_order: Updated tab priority order
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    # Validate region
    valid_regions = ["U.S.", "Africa", "Caribbean", "Global Diaspora"]
    if region_data.region_primary not in valid_regions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid region. Must be one of: {', '.join(valid_regions)}"
        )
    
    if region_data.region_secondary and region_data.region_secondary not in valid_regions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid secondary region. Must be one of: {', '.join(valid_regions)}"
        )
    
    # Update user region
    db = await get_db()
    await db.banibs_users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "region_primary": region_data.region_primary,
                "region_secondary": region_data.region_secondary,
                "region_override": True,  # User manually set
            }
        }
    )
    
    # Get priority order
    priority_order = region_detection.get_region_priority_order(
        region_data.region_primary
    )
    
    return {
        "success": True,
        "region_primary": region_data.region_primary,
        "region_secondary": region_data.region_secondary,
        "priority_order": priority_order,
    }


@router.get("/priority/{region}")
async def get_priority_order(region: str):
    """
    Get tab priority order for a specific region
    
    Path Parameters:
    - region: Region name
    
    Returns:
    - region: Region name
    - priority_order: List of regions in priority order
    """
    priority_order = region_detection.get_region_priority_order(region)
    
    return {
        "region": region,
        "priority_order": priority_order,
    }


@router.get("/flag/{country_code}")
async def get_country_flag(country_code: str):
    """
    Get flag emoji for country code
    
    Path Parameters:
    - country_code: 2-letter ISO country code
    
    Returns:
    - country_code: Country code
    - flag_emoji: Flag emoji
    """
    flag_emoji = region_detection.get_country_flag_emoji(country_code)
    
    return {
        "country_code": country_code.upper(),
        "flag_emoji": flag_emoji,
    }


@router.get("/me")
async def get_my_region(
    current_user: Optional[dict] = Depends(get_current_user_optional)
):
    """
    Get current user's region settings
    
    Requires authentication.
    
    Returns:
    - region_primary: Primary region
    - region_secondary: Secondary region
    - detected_country: Detected country
    - region_override: Whether user manually set region
    - priority_order: Tab priority order
    """
    if not current_user:
        raise HTTPException(status_code=401, detail="Authentication required")
    
    db = await get_db()
    user = await db.banibs_users.find_one(
        {"id": current_user["id"]},
        {"_id": 0, "region_primary": 1, "region_secondary": 1, "detected_country": 1, "region_override": 1}
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    region_primary = user.get("region_primary", "Global Diaspora")
    priority_order = region_detection.get_region_priority_order(region_primary)
    
    return {
        "region_primary": region_primary,
        "region_secondary": user.get("region_secondary"),
        "detected_country": user.get("detected_country"),
        "region_override": user.get("region_override", False),
        "priority_order": priority_order,
    }
