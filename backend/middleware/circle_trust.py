"""
Circle Trust Gating Middleware
Provides decorators for feature access control based on Circle tiers
"""
import os
from functools import wraps
from fastapi import HTTPException, Depends, status
from db.connection import get_db
from middleware.auth_guard import get_current_user

# Circle tier hierarchy (lower index = higher trust)
CIRCLE_TIERS = {
    "INNER": 0,      # Inner Circle - highest trust
    "TRUSTED": 1,    # Trusted members
    "COOL": 2,       # Cool members
    "PEOPLES": 3,    # Peoples tier
    "OPEN": 4        # Open/Public - lowest tier, all authenticated users
}

# Default minimum tier for gated features (configurable via env)
DEFAULT_MIN_TIER = os.environ.get("SOCIAL_MIN_TIER", "OPEN")


def get_user_tier(user: dict) -> str:
    """
    Get user's circle tier from their profile.
    Returns 'OPEN' if no tier is set.
    """
    circle_info = user.get("circle_info", {})
    tier = circle_info.get("tier", "OPEN")
    return tier.upper() if tier else "OPEN"


def tier_meets_minimum(user_tier: str, required_tier: str) -> bool:
    """
    Check if user's tier meets the required minimum.
    Lower index in CIRCLE_TIERS = higher privilege.
    """
    user_level = CIRCLE_TIERS.get(user_tier.upper(), 4)  # Default to OPEN (4)
    required_level = CIRCLE_TIERS.get(required_tier.upper(), 4)
    return user_level <= required_level


async def get_user_with_circle(user: dict = Depends(get_current_user)):
    """
    Dependency that enriches user with circle tier info.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    
    db = await get_db()
    
    # Fetch circle info if not already present
    if "circle_info" not in user:
        circle_member = await db.circle_members.find_one(
            {"user_id": user["id"]},
            {"_id": 0, "tier": 1, "joined_at": 1}
        )
        user["circle_info"] = circle_member or {"tier": "OPEN"}
    
    return user


def require_circle_tier(min_tier: str = None):
    """
    Dependency factory for requiring a minimum circle tier.
    
    Usage:
        @router.post("/posts")
        async def create_post(
            current_user=Depends(require_circle_tier("PEOPLES"))
        ):
            ...
    
    Args:
        min_tier: Minimum required tier. Defaults to env var SOCIAL_MIN_TIER or "OPEN"
    
    Returns:
        FastAPI dependency function
    """
    effective_tier = min_tier or DEFAULT_MIN_TIER
    
    async def dependency(user: dict = Depends(get_user_with_circle)):
        user_tier = get_user_tier(user)
        
        if not tier_meets_minimum(user_tier, effective_tier):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "message": f"This feature requires {effective_tier} tier or higher",
                    "required_tier": effective_tier,
                    "user_tier": user_tier,
                    "code": "INSUFFICIENT_CIRCLE_TIER"
                }
            )
        
        return user
    
    return dependency


# Pre-configured dependencies for common use cases
require_peoples_tier = require_circle_tier("PEOPLES")
require_cool_tier = require_circle_tier("COOL")
require_trusted_tier = require_circle_tier("TRUSTED")
require_inner_tier = require_circle_tier("INNER")
require_open_tier = require_circle_tier("OPEN")
