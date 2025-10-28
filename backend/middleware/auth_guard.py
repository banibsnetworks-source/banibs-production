from fastapi import Header, HTTPException, Depends
from typing import Optional, List
from services.jwt import verify_access_token

async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Extract and verify JWT from Authorization header
    
    Args:
        authorization: Authorization header value (Bearer <token>)
    
    Returns:
        Decoded user payload from JWT
    
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
    
    # Verify token
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    return payload

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
    Dependency factory that requires specific role(s)
    
    Usage:
        @router.get("/admin-only")
        async def admin_route(user: dict = Depends(require_role("admin"))):
            # Only admins can access
            pass
        
        @router.get("/admin-or-moderator")
        async def mod_route(user: dict = Depends(require_role("admin", "moderator"))):
            # Admins or moderators can access
            pass
    """
    def role_checker(user: dict = Depends(get_current_user)):
        user_role = user.get("role")
        
        # Phase 4.5 - Map "admin" to "super_admin" for backward compatibility
        if user_role == "admin":
            user_role = "super_admin"
        
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        
        return user
    
    return role_checker

# Phase 4.5 - RBAC Permission Helpers

def require_super_admin(user: dict = Depends(get_current_user)):
    """
    Requires super_admin role
    Super admins have full access to all features
    """
    user_role = user.get("role")
    
    # Backward compatibility
    if user_role == "admin":
        user_role = "super_admin"
    
    if user_role != "super_admin":
        raise HTTPException(
            status_code=403,
            detail="Super admin access required"
        )
    
    return user

def can_moderate(user: dict = Depends(get_current_user)):
    """
    Allows super_admin or moderator
    Can approve/reject/feature opportunities and hide comments
    """
    user_role = user.get("role")
    
    # Backward compatibility
    if user_role == "admin":
        user_role = "super_admin"
    
    if user_role not in ["super_admin", "moderator"]:
        raise HTTPException(
            status_code=403,
            detail="Moderation permissions required"
        )
    
    return user
