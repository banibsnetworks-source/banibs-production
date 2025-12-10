"""
Phase 6.0 - Unified Authentication Routes [LEGACY]

⚠️ DEPRECATION NOTICE (December 2025):
These routes are being phased out in favor of BGLIS v1.0 phone-first authentication.

RECOMMENDED: Use BGLIS auth routes (bglis_auth.py) for new integrations:
- Phone-first registration with OTP verification
- Username-based authentication
- Recovery phrase system for account recovery

LEGACY endpoints (for backward compatibility):
- POST /api/auth/register — Email + password registration
- POST /api/auth/login — Email + password login
- POST /api/auth/refresh — Token refresh
- POST /api/auth/logout — Logout
- POST /api/auth/forgot-password — Password reset request
- POST /api/auth/reset-password — Complete password reset
- POST /api/auth/verify-email — Email verification
- GET /api/auth/me — Get current user
- PATCH /api/auth/profile — Update profile

MIGRATION PATH:
Existing users with email+password accounts will be prompted to upgrade to BGLIS
by adding phone number, username, and recovery phrase for enhanced security.

SSO Compatible: Tokens work across *.banibs.com domains
"""

from fastapi import APIRouter, HTTPException, Response, Depends, Header
from fastapi.responses import JSONResponse
from typing import Optional
from datetime import datetime, timezone
import logging

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

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["Authentication (Legacy)"])


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
    
    # BGLIS v1.0 - Check if user needs upgrade
    needs_bglis_upgrade = (
        user.get("phone_number") is None or
        user.get("username") is None or
        user.get("has_recovery_phrase", False) is False or
        user.get("needs_bglis_upgrade", False) is True
    )
    
    # Debug: Check user object before sanitization
    print(f"🔍 Login endpoint - user from DB: email={user.get('email')}, preferred_portal={user.get('preferred_portal')}, needs_bglis_upgrade={needs_bglis_upgrade}")
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=sanitize_user_response(user),
        needs_bglis_upgrade=needs_bglis_upgrade
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
    logger.info(f"🔐 Password reset requested for: {request.email}")
    
    # Get user by email
    user = await get_user_by_email(request.email)
    
    if user:
        logger.info(f"✅ User found for reset: {request.email}")
        
        # Generate reset token
        reset_token = JWTService.generate_verification_token()
        expires = JWTService.get_token_expiry(days=0)  # 1 hour from now
        expires = expires.replace(hour=expires.hour + 1)
        
        await set_password_reset_token(user["id"], reset_token, expires.isoformat())
        logger.info(f"🎫 Reset token generated for user: {user['id']}")
        
        # Build reset link
        reset_link = f"https://unified-nav.preview.emergentagent.com/auth/reset-password?token={reset_token}"
        
        # Build HTML email
        html_body = f"""
        <html>
            <body style="font-family: Arial, sans-serif; background-color: #0a0a0c; color: #ffffff; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 40px; border-radius: 12px; border: 1px solid rgba(251, 191, 36, 0.2);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); border-radius: 12px; line-height: 60px; font-size: 32px; font-weight: bold; color: white; margin-bottom: 20px;">B</div>
                        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Reset Your Password</h1>
                    </div>
                    
                    <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                        Hi {user.get('name', user.get('first_name', 'there'))},
                    </p>
                    
                    <p style="color: #e5e7eb; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                        We received a request to reset your BANIBS password. Click the button below to create a new password:
                    </p>
                    
                    <div style="text-align: center; margin: 40px 0;">
                        <a href="{reset_link}" style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);">
                            Reset Password
                        </a>
                    </div>
                    
                    <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                        Or copy and paste this link into your browser:<br>
                        <a href="{reset_link}" style="color: #f59e0b; word-break: break-all;">{reset_link}</a>
                    </p>
                    
                    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255, 255, 255, 0.1);">
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                            This link will expire in 1 hour for security reasons.<br>
                            If you didn't request this reset, you can safely ignore this email.
                        </p>
                    </div>
                    
                    <div style="margin-top: 30px; text-align: center;">
                        <p style="color: #6b7280; font-size: 12px; margin: 0;">
                            BANIBS - For Us. By Us. Built to Last.
                        </p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Send reset email
        try:
            logger.info(f"📤 Sending password reset email to: {request.email}")
            send_email(
                to_email=request.email,
                subject="🔐 Reset your BANIBS password",
                html_body=html_body
            )
            logger.info(f"✅ Password reset email sent successfully to: {request.email}")
        except Exception as e:
            logger.error(f"❌ Failed to send password reset email to {request.email}: {str(e)}", exc_info=True)
            # Don't fail the request, but log the error
    else:
        logger.info(f"⚠️ Password reset requested for non-existent email: {request.email}")
    
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
