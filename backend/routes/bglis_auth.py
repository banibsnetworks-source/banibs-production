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


# ===== Login Endpoints =====

@router.post("/login-phone", response_model=TokenResponse)
async def login_phone(
    request: LoginPhoneRequest,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Login with phone number + OTP
    """
    try:
        # 1. Normalize phone
        normalized_phone, _ = PhoneService.normalize_to_e164(request.phone_number)
        
        # 2. Verify OTP
        otp_service = OtpService(db)
        otp_result = await otp_service.verify_otp(
            phone_number=normalized_phone,
            purpose="login",
            code=request.otp_code
        )
        
        if not otp_result.success:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # 3. Find user by phone
        user = await db.banibs_users.find_one({"phone_number": normalized_phone})
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="No account found with this phone number"
            )
        
        # 4. Update last login
        await update_last_login(user["id"])
        user["last_login"] = datetime.now(timezone.utc).isoformat()
        
        # 5. Mark phone as verified if not already
        if not user.get("is_phone_verified"):
            await db.banibs_users.update_one(
                {"id": user["id"]},
                {"$set": {"is_phone_verified": True}}
            )
            user["is_phone_verified"] = True
        
        # 6. Generate tokens and response
        return await _create_tokens_and_response(user, response)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in phone login: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


@router.post("/login-username", response_model=TokenResponse)
async def login_username(
    request: LoginUsernameRequest,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Login with username + OTP (sent to linked phone)
    """
    try:
        # 1. Normalize username
        username_lower = request.username.lower().strip()
        
        # 2. Find user by username
        user = await db.banibs_users.find_one({"username": username_lower})
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="No account found with this username"
            )
        
        # 3. Get user's phone
        if not user.get("phone_number"):
            raise HTTPException(
                status_code=400,
                detail="This account has no linked phone number. Please contact support."
            )
        
        # 4. Verify OTP against user's phone
        otp_service = OtpService(db)
        otp_result = await otp_service.verify_otp(
            phone_number=user["phone_number"],
            purpose="login",
            code=request.otp_code
        )
        
        if not otp_result.success:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # 5. Update last login
        await update_last_login(user["id"])
        user["last_login"] = datetime.now(timezone.utc).isoformat()
        
        # 6. Mark phone as verified if not already
        if not user.get("is_phone_verified"):
            await db.banibs_users.update_one(
                {"id": user["id"]},
                {"$set": {"is_phone_verified": True}}
            )
            user["is_phone_verified"] = True
        
        # 7. Generate tokens and response
        return await _create_tokens_and_response(user, response)
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in username login: {e}")
        raise HTTPException(status_code=500, detail="Login failed")


# ===== Recovery Endpoints =====

@router.post("/recovery/phrase-login", response_model=TokenResponse)
async def recovery_phrase_login(
    request: PhraseLoginRequest,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Login using recovery phrase (lost phone scenario)
    
    Requires:
    - identifier: username or email
    - recovery_phrase: 12-word phrase
    """
    try:
        # 1. Find user by identifier (username or email)
        identifier_lower = request.identifier.lower().strip()
        
        user = await db.banibs_users.find_one({
            "$or": [
                {"username": identifier_lower},
                {"email": identifier_lower}
            ]
        })
        
        if not user:
            raise HTTPException(
                status_code=404,
                detail="No account found with this identifier"
            )
        
        # 2. Check if user has recovery phrase
        if not user.get("has_recovery_phrase"):
            raise HTTPException(
                status_code=400,
                detail="This account does not have a recovery phrase set up"
            )
        
        # 3. Check rate limiting on recovery attempts
        failed_attempts = user.get("failed_recovery_attempts", 0)
        last_attempt = user.get("last_recovery_attempt_at")
        
        if failed_attempts >= 5:
            # Check if cooldown period has passed (1 hour)
            if last_attempt:
                last_attempt_dt = datetime.fromisoformat(last_attempt)
                now = datetime.now(timezone.utc)
                cooldown_hours = 1
                
                if (now - last_attempt_dt).total_seconds() < (cooldown_hours * 3600):
                    raise HTTPException(
                        status_code=429,
                        detail=f"Too many failed attempts. Try again in {cooldown_hours} hour(s)"
                    )
                else:
                    # Reset counter after cooldown
                    await db.banibs_users.update_one(
                        {"id": user["id"]},
                        {"$set": {"failed_recovery_attempts": 0}}
                    )
                    failed_attempts = 0
        
        # 4. Verify recovery phrase
        is_valid = RecoveryPhraseService.verify_phrase(
            phrase=request.recovery_phrase,
            stored_hash=user["recovery_phrase_hash"],
            stored_salt=user["recovery_phrase_salt"]
        )
        
        now_iso = datetime.now(timezone.utc).isoformat()
        
        if not is_valid:
            # Increment failed attempts
            await db.banibs_users.update_one(
                {"id": user["id"]},
                {
                    "$set": {
                        "failed_recovery_attempts": failed_attempts + 1,
                        "last_recovery_attempt_at": now_iso
                    }
                }
            )
            
            raise HTTPException(
                status_code=401,
                detail="Invalid recovery phrase"
            )
        
        # 5. Success - reset failed attempts
        await db.banibs_users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "failed_recovery_attempts": 0,
                    "last_recovery_attempt_at": now_iso,
                    "last_login": now_iso
                }
            }
        )
        
        user["last_login"] = now_iso
        
        # 6. Generate tokens and response
        result = await _create_tokens_and_response(user, response)
        result["can_reset_phone"] = True  # Allow phone reset after phrase login
        
        return result
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error in phrase login: {e}")
        raise HTTPException(status_code=500, detail="Recovery login failed")


@router.post("/recovery/reset-phone")
async def recovery_reset_phone(
    request: ResetPhoneRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
    # TODO: Add JWT dependency to require authenticated user
    # current_user: dict = Depends(get_current_user_bglis)
):
    """
    Set new phone number after recovery phrase login
    
    Requires:
    - JWT from phrase-login or similar recovery flow
    - New phone number with OTP verification
    """
    try:
        # TODO: Get user_id from JWT token
        # For now, we'll need to add proper JWT middleware
        
        # 1. Normalize new phone
        normalized_phone, country = PhoneService.normalize_to_e164(request.new_phone_number)
        
        # 2. Verify OTP for new phone
        otp_service = OtpService(db)
        otp_result = await otp_service.verify_otp(
            phone_number=normalized_phone,
            purpose="recovery",
            code=request.otp_code
        )
        
        if not otp_result.success:
            raise HTTPException(status_code=400, detail="Invalid or expired OTP")
        
        # 3. Check phone uniqueness
        existing = await db.banibs_users.find_one({"phone_number": normalized_phone})
        if existing:
            raise HTTPException(
                status_code=409,
                detail="This phone number is already in use by another account"
            )
        
        # TODO: Update user's phone
        # For now, return success - will complete with JWT middleware
        
        return {
            "success": True,
            "phone_number": normalized_phone,
            "message": "Phone number reset endpoint - requires JWT implementation"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error resetting phone: {e}")
        raise HTTPException(status_code=500, detail="Phone reset failed")


# Note: Additional endpoints (change-phone, regenerate-phrase) will be added after JWT middleware is properly integrated
