from fastapi import Header, HTTPException, Depends
from typing import Optional, List
from services.jwt_service import JWTService  # Phase 6.0 - Unified JWT
from db.unified_users import get_user_by_id


async def get_current_user_from_token(token: str) -> Optional[dict]:
    """
    Phase 3.2 - Extract and verify JWT from query parameter (for WebSocket)
    
    Args:
        token: JWT token string
    
    Returns:
        User data dict or None if invalid
    """
    # Verify token using JWT service
    payload = JWTService.verify_token(token, token_type="access")
    if not payload:
        return None
    
    # Get full user from database
    user = await get_user_by_id(payload["sub"])
    return user


async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Phase 6.0 - Extract and verify JWT from Authorization header (Unified Identity)
    
    Args:
        authorization: Authorization header value (Bearer <token>)
    
    Returns:
        User data from banibs_users collection
    
    Raises:
        HTTPException 401 if token missing or invalid
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Expected 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    token = parts[1]
    
    # Verify token using new JWT service
    payload = JWTService.verify_token(token, token_type="access")
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Get full user from database
    user = await get_user_by_id(payload["sub"])
    return user


async def get_current_user_optional(authorization: Optional[str] = Header(None)):
    """
    Phase 11.0 - Optional authentication dependency
    
    Returns user data if authenticated, None if not authenticated.
    Does NOT raise 401 errors - used for endpoints where auth is optional.
    
    Args:
        authorization: Authorization header value (Bearer <token>)
    
    Returns:
        User data from banibs_users collection, or None if not authenticated
    """
    if not authorization:
        return None
    
    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    
    token = parts[1]
    
    # Verify token using new JWT service
    payload = JWTService.verify_token(token, token_type="access")
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    # Get full user from database
    user = await get_user_by_id(payload["sub"])
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    
    return user

def require_auth(user: dict = Depends(get_current_user)):
    """
    Dependency that requires any authenticated user
    
    Usage:
        @router.get("/protected")
        async def protected_route(user: dict = Depends(require_auth)):
            # user is available here
            pass
    """
    return user

def require_role(*allowed_roles: str):
    """
    Phase 6.0 - Dependency factory that requires specific role(s) (Unified Identity)
    
    Now checks against user's roles array instead of single role field.
    
    Usage:
        @router.get("/admin-only")
        async def admin_route(user: dict = Depends(require_role("super_admin"))):
            # Only super admins can access
            pass
        
        @router.get("/admin-or-moderator")
        async def mod_route(user: dict = Depends(require_role("super_admin", "moderator"))):
            # Super admins or moderators can access
            pass
    """
    async def role_checker(user: dict = Depends(get_current_user)):
        user_roles = user.get("roles", [])
        
        # Check if user has any of the allowed roles
        has_permission = any(role in user_roles for role in allowed_roles)
        
        if not has_permission:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        
        return user
    
    return role_checker

# Phase 6.0 - RBAC Permission Helpers (Unified Identity)

async def require_super_admin(user: dict = Depends(get_current_user)):
    """
    Requires super_admin role
    Super admins have full access to all features
    """
    if "super_admin" not in user.get("roles", []):
        raise HTTPException(
            status_code=403,
            detail="Super admin access required"
        )
    
    return user

async def can_moderate(user: dict = Depends(get_current_user)):
    """
    Allows super_admin or moderator
    Can approve/reject/feature opportunities and hide comments
    """
    user_roles = user.get("roles", [])
    
    if "super_admin" not in user_roles and "moderator" not in user_roles:
        raise HTTPException(
            status_code=403,
            detail="Moderation permissions required"
        )
    
    return user


# Phase 6.2 - Membership Tier Helpers (Future)

def require_membership(*allowed_tiers: str):
    """
    Dependency factory that requires minimum membership tier
    
    Tier hierarchy: free < basic < pro < enterprise
    
    Usage:
        @router.post("/social/posts")
        async def create_post(user: dict = Depends(require_membership("basic", "pro", "enterprise"))):
            # Only paid members can post
            pass
    """
    async def tier_checker(user: dict = Depends(get_current_user)):
        tier_hierarchy = {
            "free": 0,
            "basic": 1,
            "pro": 2,
            "enterprise": 3
        }
        
        user_tier = user.get("membership_level", "free")
        user_tier_level = tier_hierarchy.get(user_tier, 0)
        
        # Check if user tier meets any of the allowed tiers
        has_access = any(
            user_tier_level >= tier_hierarchy.get(tier, 999)
            for tier in allowed_tiers
        )
        
        if not has_access:
            raise HTTPException(
                status_code=403,
                detail=f"Membership upgrade required. Allowed tiers: {', '.join(allowed_tiers)}"
            )
        
        return user
    
    return tier_checker
