"""
BGLIS v1.0 - Authentication Routes

Phone-first global identity system with username and recovery phrase.

Endpoints:
- POST /api/auth/send-otp
- POST /api/auth/verify-otp
- POST /api/auth/register-bglis
- POST /api/auth/login-phone
- POST /api/auth/login-username
- POST /api/auth/recovery/phrase-login
- POST /api/auth/recovery/reset-phone
- POST /api/auth/change-phone
- POST /api/auth/recovery/regenerate-phrase
"""

from fastapi import APIRouter, HTTPException, Depends, Response
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from typing import Optional
import uuid

from models.unified_user import (
    SendOtpRequest, VerifyOtpRequest, RegisterBglisRequest,
    LoginPhoneRequest, LoginUsernameRequest,
    PhraseLoginRequest, ResetPhoneRequest, ChangePhoneRequest,
    RegeneratePhraseRequest, BglisRegisterResponse,
    TokenResponse, UserPublic, RecoveryPhraseResponse
)
from db.connection import get_db
from services.otp_service import OtpService
from services.phone_service import PhoneService
from services.recovery_phrase_service import RecoveryPhraseService
from services.jwt_service import JWTService
from db.unified_users import sanitize_user_response, update_last_login


router = APIRouter(prefix="/api/auth", tags=["BGLIS Authentication"])


# ===== Helper Functions =====

def _check_bglis_compliance(user: dict) -> bool:
    """Check if user is BGLIS-compliant (has phone, username, recovery phrase)"""
    return (
        user.get("phone_number") is not None and
        user.get("is_phone_verified") == True and
        user.get("username") is not None and
        user.get("has_recovery_phrase") == True
    )


async def _create_tokens_and_response(
    user: dict,
    response: Response,
    include_recovery_phrase: Optional[list] = None
) -> dict:
    """
    Create JWT tokens and format response
    
    Args:
        user: User document
        response: FastAPI Response object for setting cookies
        include_recovery_phrase: Optional recovery phrase to include (only on registration/regeneration)
    
    Returns:
        Token response dict
    """
    # Generate JWT tokens
    access_token = JWTService.create_access_token(
        user_id=user["id"],
        email=user.get("email"),
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
    
    # Check if user needs BGLIS upgrade
    needs_upgrade = not _check_bglis_compliance(user) or user.get("needs_bglis_upgrade", False)
    
    # Build response
    result = {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "Bearer",
        "user": sanitize_user_response(user),
        "needs_bglis_upgrade": needs_upgrade
    }
    
    if include_recovery_phrase:
        result["recovery_phrase"] = include_recovery_phrase
    
    return result


# ===== OTP Endpoints =====

@router.post("/send-otp")
async def send_otp(
    request: SendOtpRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Send OTP to phone number
    
    Purpose values:
    - register: New user signup
    - login: Existing user login
    - change_phone_old: Verify old phone before change
    - change_phone_new: Verify new phone for change
    - recovery: Account recovery flow
    - upgrade: Legacy user BGLIS upgrade
    """
    try:
        # Normalize phone to E.164
        normalized_phone, country = PhoneService.normalize_to_e164(request.phone_number)
        
        # Create OTP service
        otp_service = OtpService(db)
        
        # Send OTP
        result = await otp_service.send_otp(normalized_phone, request.purpose)
        
        return {
            "success": True,
            "phone_number": normalized_phone,
            "expires_in_seconds": result["expires_in_seconds"]
        }
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Error sending OTP: {e}")
        raise HTTPException(status_code=500, detail="Failed to send OTP")


@router.post("/verify-otp")
async def verify_otp(
    request: VerifyOtpRequest,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Verify OTP code
    
    Returns:
    - success: true if valid
    - error: error code if invalid
    - remaining_attempts: attempts left before lockout
    """
    try:
        # Normalize phone
        normalized_phone, _ = PhoneService.normalize_to_e164(request.phone_number)
        
        # Create OTP service
        otp_service = OtpService(db)
        
        # Verify OTP
        result = await otp_service.verify_otp(
            phone_number=normalized_phone,
            purpose=request.purpose,
            code=request.code
        )
        
        if not result.success:
            status_code = 429 if result.error == "TOO_MANY_ATTEMPTS" else 400
            raise HTTPException(
                status_code=status_code,
                detail={
                    "error": result.error,
                    "remaining_attempts": result.remaining_attempts
                }
            )
        
        return {"success": True}
    
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"❌ Error verifying OTP: {e}")
        raise HTTPException(status_code=500, detail="Failed to verify OTP")


# ===== Registration Endpoint =====

@router.post("/register-bglis", response_model=BglisRegisterResponse)
async def register_bglis(
    request: RegisterBglisRequest,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    BGLIS v1.0 phone-first registration
    
    Creates new user with:
    - Verified phone number (primary identifier)
    - Username (public identity)
    - Optional email
    - 12-word recovery phrase (auto-generated)
    
    Returns recovery phrase ONCE - user must save it!
    """
    try:
        # 1. Normalize phone
        normalized_phone, country = PhoneService.normalize_to_e164(request.phone_number)
        
        # 2. Verify OTP
        otp_service = OtpService(db)
        otp_result = await otp_service.verify_otp(
            phone_number=normalized_phone,
            purpose="register",
            code=request.otp_code
        )
        
        if not otp_result.success:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # 3. Validate username format
        username_lower = request.username.lower().strip()
        
        # Check username rules
        if not username_lower or len(username_lower) < 3 or len(username_lower) > 30:
            raise HTTPException(status_code=400, detail="Username must be 3-30 characters")
        
        if not username_lower.replace('_', '').replace('-', '').isalnum():
            raise HTTPException(status_code=400, detail="Username can only contain letters, numbers, underscore, and hyphen")
        
        # Check reserved usernames
        reserved = ["admin", "banibs", "support", "moderator", "system", "root"]
        if username_lower in reserved:
            raise HTTPException(status_code=400, detail="Username is reserved")
        
        # 4. Check uniqueness
        existing_phone = await db.banibs_users.find_one({"phone_number": normalized_phone})
        if existing_phone:
            raise HTTPException(status_code=409, detail="Phone number already registered")
        
        existing_username = await db.banibs_users.find_one({"username": username_lower})
        if existing_username:
            raise HTTPException(status_code=409, detail="Username already taken")
        
        if request.email:
            existing_email = await db.banibs_users.find_one({"email": request.email})
            if existing_email:
                raise HTTPException(status_code=409, detail="Email already registered")
        
        # 5. Generate recovery phrase
        recovery_phrase_words = RecoveryPhraseService.generate_phrase()
        phrase_hash, phrase_salt = RecoveryPhraseService.hash_phrase(recovery_phrase_words)
        
        # 6. Create user document
        now = datetime.now(timezone.utc).isoformat()
        user_id = str(uuid.uuid4())
        
        user_doc = {
            "id": user_id,
            "phone_number": normalized_phone,
            "phone_country_code": country,
            "is_phone_verified": True,
            "username": username_lower,
            "email": request.email,
            "is_email_verified": False,
            "name": request.display_name or request.username,
            "avatar_url": None,
            "bio": None,
            "roles": ["user"],
            "membership_level": "free",
            "membership_status": "active",
            "has_recovery_phrase": True,
            "recovery_phrase_hash": phrase_hash,
            "recovery_phrase_salt": phrase_salt,
            "needs_bglis_upgrade": False,
            "created_at": now,
            "last_login": now,
            "updated_at": now,
            "failed_recovery_attempts": 0,
            "preferred_portal": "news",
            "preferred_language": "en",
            "metadata": {}
        }
        
        # 7. Insert user
        await db.banibs_users.insert_one(user_doc)
        
        # 8. Create unique indexes
        await db.banibs_users.create_index("phone_number", unique=True)
        await db.banibs_users.create_index("username", unique=True)
        await db.banibs_users.create_index("email", unique=True, sparse=True)
        
        # 9. Generate tokens and response
        result = await _create_tokens_and_response(
            user_doc,
            response,
            include_recovery_phrase=recovery_phrase_words
        )
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in BGLIS registration: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="Registration failed")


# Continuing with login endpoints in next file due to length...
