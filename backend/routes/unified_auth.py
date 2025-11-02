"""
Phase 6.0 - Unified Authentication Routes

All authentication endpoints for BANIBS unified identity system.

Endpoints:
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- POST /api/auth/verify-email
- GET /api/auth/me
- PATCH /api/auth/profile

SSO Compatible: Tokens work across *.banibs.com domains
"""

from fastapi import APIRouter, HTTPException, Response, Depends, Header
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime, timezone

from models.unified_user import (
    UserCreate, UserLogin, UserUpdate, 
    PasswordResetRequest, PasswordReset, EmailVerification,
    RefreshTokenRequest, TokenResponse, UserPublic
)
from db.unified_users import (
    create_user, get_user_by_email, get_user_by_id,
    verify_password, update_user, update_last_login,
    set_email_verification_token, verify_email_token,
    set_password_reset_token, reset_password_with_token,
    sanitize_user_response
)
from services.jwt_service import JWTService
from services.email_service import send_email
from middleware.rate_limiter import enforce_rate_limit

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
async def register(user_data: UserCreate, response: Response):
    """
    Register new user account
    
    - Creates unified BANIBS account
    - Sends email verification (optional)
    - Returns access + refresh tokens
    - Sets HttpOnly refresh token cookie
    """
    # Check if email already exists
    existing_user = await get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )
    
    # Validate terms acceptance
    if not user_data.accepted_terms:
        raise HTTPException(
            status_code=400,
            detail="You must accept the terms of service"
        )
    
    # Create user
    user_id = await create_user(user_data)
    user = await get_user_by_id(user_id)
    
    # Generate email verification token
    verification_token = JWTService.generate_verification_token()
    expires = JWTService.get_token_expiry(days=1)
    await set_email_verification_token(user_id, verification_token, expires.isoformat())
    
    # Send verification email (non-blocking)
    try:
        await send_email(
            to=user["email"],
            subject="Verify your BANIBS account",
            template="email_verification",
            context={
                "name": user["name"],
                "verification_link": f"https://banibs.com/verify-email?token={verification_token}"
            }
        )
    except Exception as e:
        print(f"⚠️ Failed to send verification email: {e}")
    
    # Generate JWT tokens
    access_token = JWTService.create_access_token(
        user_id=user["id"],
        email=user["email"],
        roles=user["roles"],
        membership_level=user["membership_level"]
    )
    
    refresh_token = JWTService.create_refresh_token(user["id"])
    
    # Set HttpOnly cookie for refresh token (domain: .banibs.com)
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,  # HTTPS only
        samesite="lax",
        max_age=7 * 24 * 60 * 60,  # 7 days
        domain=".banibs.com"  # SSO across all BANIBS properties
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=sanitize_user_response(user)
    )


@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, response: Response):
    """
    User login with email and password
    
    - Verifies credentials
    - Updates last login timestamp
    - Returns access + refresh tokens
    - Sets HttpOnly refresh token cookie
    """
    # Verify credentials
    user = await verify_password(credentials.email, credentials.password)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Update last login
    await update_last_login(user["id"])
    
    # Generate JWT tokens
    access_token = JWTService.create_access_token(
        user_id=user["id"],
        email=user["email"],
        roles=user["roles"],
        membership_level=user["membership_level"]
    )
    
    refresh_token = JWTService.create_refresh_token(user["id"])
    
    # Set HttpOnly cookie for refresh token
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        domain=".banibs.com"
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=sanitize_user_response(user)
    )


@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest, response: Response):
    """
    Refresh access token using refresh token
    
    - Reads refresh token from cookie or body
    - Validates refresh token
    - Issues new access token
    - Optionally rotates refresh token
    """
    refresh_token = request.refresh_token
    
    if not refresh_token:
        raise HTTPException(
            status_code=401,
            detail="Refresh token required"
        )
    
    # Verify refresh token
    payload = JWTService.verify_token(refresh_token, token_type="refresh")
    
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token"
        )
    
    # Get user
    user = await get_user_by_id(payload["sub"])
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    
    # Generate new access token
    access_token = JWTService.create_access_token(
        user_id=user["id"],
        email=user["email"],
        roles=user["roles"],
        membership_level=user["membership_level"]
    )
    
    # Optionally rotate refresh token (security best practice)
    new_refresh_token = JWTService.create_refresh_token(user["id"])
    
    response.set_cookie(
        key="refresh_token",
        value=new_refresh_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 60 * 60,
        domain=".banibs.com"
    )
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "Bearer",
        "expires_in": 900
    }


@router.post("/logout")
async def logout(response: Response):
    """
    User logout
    
    - Clears refresh token cookie
    - Client should discard access token
    """
    response.delete_cookie(
        key="refresh_token",
        domain=".banibs.com"
    )
    
    return {"message": "Logged out successfully"}


@router.post("/forgot-password")
async def forgot_password(request: PasswordResetRequest):
    """
    Request password reset email
    
    - Generates reset token
    - Sends reset email
    - Returns success (even if email not found, for security)
    """
    # Get user by email
    user = await get_user_by_email(request.email)
    
    if user:
        # Generate reset token
        reset_token = JWTService.generate_verification_token()
        expires = JWTService.get_token_expiry(days=0)  # 1 hour from now
        expires = expires.replace(hour=expires.hour + 1)
        
        await set_password_reset_token(user["id"], reset_token, expires.isoformat())
        
        # Send reset email
        try:
            await send_email(
                to=user["email"],
                subject="Reset your BANIBS password",
                template="password_reset",
                context={
                    "name": user["name"],
                    "reset_link": f"https://banibs.com/reset-password?token={reset_token}"
                }
            )
        except Exception as e:
            print(f"⚠️ Failed to send password reset email: {e}")
    
    # Always return success (security: don't reveal if email exists)
    return {"message": "If your email is registered, you will receive a password reset link"}


@router.post("/reset-password")
async def reset_password(request: PasswordReset):
    """
    Complete password reset with token
    
    - Validates reset token
    - Updates password
    - Clears reset token
    """
    success = await reset_password_with_token(request.token, request.new_password)
    
    if not success:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired reset token"
        )
    
    return {"message": "Password reset successfully"}


@router.post("/verify-email")
async def verify_email(request: EmailVerification):
    """
    Verify email address with token
    
    - Validates verification token
    - Marks email as verified
    - Clears verification token
    """
    user = await verify_email_token(request.token)
    
    if not user:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired verification token"
        )
    
    return {
        "message": "Email verified successfully",
        "user": sanitize_user_response(user)
    }


@router.get("/me", response_model=UserPublic)
async def get_current_user(authorization: Optional[str] = Header(None)):
    """
    Get current user profile
    
    - Requires valid access token
    - Returns user profile data
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.replace("Bearer ", "")
    
    # Verify access token
    payload = JWTService.verify_token(token, token_type="access")
    
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access token"
        )
    
    # Get user
    user = await get_user_by_id(payload["sub"])
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    return sanitize_user_response(user)


@router.patch("/profile", response_model=UserPublic)
async def update_profile(
    profile_data: UserUpdate,
    authorization: Optional[str] = Header(None)
):
    """
    Update user profile
    
    - Requires valid access token
    - Updates name, bio, avatar
    - Returns updated profile
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing or invalid authorization header"
        )
    
    token = authorization.replace("Bearer ", "")
    
    # Verify access token
    payload = JWTService.verify_token(token, token_type="access")
    
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired access token"
        )
    
    user_id = payload["sub"]
    
    # Update profile (only provided fields)
    update_data = profile_data.dict(exclude_unset=True)
    
    if not update_data:
        raise HTTPException(
            status_code=400,
            detail="No fields to update"
        )
    
    await update_user(user_id, update_data)
    
    # Get updated user
    user = await get_user_by_id(user_id)
    
    return sanitize_user_response(user)
