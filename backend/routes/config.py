from fastapi import APIRouter
from utils.features import load_features

router = APIRouter(prefix="/api/config", tags=["config"])

@router.get("/features")
async def get_feature_flags():
    """
    Public endpoint to retrieve feature flags for frontend consumption.
    
    Returns the full features.json configuration that controls UI behavior.
    Used by frontend to toggle features like heavyContentBanner, sentimentBadges, etc.
    
    Returns:
        dict: Complete feature flags configuration
    """
    return load_features()
