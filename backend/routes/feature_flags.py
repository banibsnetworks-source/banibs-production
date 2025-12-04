"""
Feature Flags API Endpoint
Public endpoint for frontend to check feature flags
"""
from fastapi import APIRouter
from config.feature_flags import get_feature_flags, COMING_SOON_MODE, COMING_SOON_VARIANT, COMING_SOON_MESSAGE

router = APIRouter(prefix="/api/config", tags=["config"])


@router.get("/feature-flags")
async def get_flags():
    """
    Get current feature flags
    
    Returns:
        Dictionary of active feature flags
    """
    return {
        "coming_soon_mode": COMING_SOON_MODE,
        "coming_soon_variant": COMING_SOON_VARIANT,
        "coming_soon_message": COMING_SOON_MESSAGE,
    }
