"""
BGLIS v1.0 - Phone Verification Routes (Voluntary)

Endpoints for opt-in phone verification to strengthen user identity.
- POST /api/bglis/link-phone - Link verified phone to existing account
- PATCH /api/bglis/remove-phone - Remove phone verification
- GET /api/bglis/status - Get verification status

This is VOLUNTARY - not required for using BANIBS.
"""

from fastapi import APIRouter, HTTPException, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from typing import Optional

from db.connection import get_db
from services.jwt_service import JWTService
from services.phone_service import PhoneService

router = APIRouter(prefix="/api/bglis", tags=["BGLIS Phone Verification"])


# ===== Models =====

class LinkPhoneRequest(BaseModel):
    phone_number: str = Field(..., description="E.164 formatted phone number")


class PhoneStatusResponse(BaseModel):
    is_phone_verified: bool
    phone_masked: Optional[str] = None
    verified_at: Optional[str] = None


# ===== Auth Dependency =====

async def get_current_user(
    authorization: str = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Extract and validate user from JWT token"""
    if not authorization:
        from fastapi import Header
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        # Handle both "Bearer token" and raw token
        token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else authorization
        payload = JWTService.decode_token(token)
        user_id = payload.get("sub")
        
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
        
        user = await db.banibs_users.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


# ===== Endpoints =====

@router.post("/link-phone")
async def link_phone(
    request: LinkPhoneRequest,
    authorization: str = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Link a verified phone number to the current user's account.
    
    Prerequisites:
    - User must have already verified the phone via /api/auth/send-otp + /api/auth/verify-otp
    - Phone number must not be linked to another account
    
    This is VOLUNTARY - enhances trust but is not required.
    """
    from fastapi import Header
    
    # Get auth header from request
    if not authorization:
        from fastapi import Request
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    user = await get_current_user(authorization, db)
    
    try:
        # Normalize phone
        normalized_phone, country = PhoneService.normalize_to_e164(request.phone_number)
        
        # Check if phone is already used by another account
        existing = await db.banibs_users.find_one({
            "phone_number": normalized_phone,
            "id": {"$ne": user["id"]}
        })
        
        if existing:
            raise HTTPException(
                status_code=409,
                detail="This phone number is already linked to another account"
            )
        
        # Update user's phone verification
        now = datetime.now(timezone.utc).isoformat()
        
        await db.banibs_users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "phone_number": normalized_phone,
                    "phone_country_code": country,
                    "is_phone_verified": True,
                    "phone_verified_at": now,
                    "updated_at": now
                }
            }
        )
        
        return {
            "success": True,
            "message": "Phone number verified and linked",
            "phone_masked": PhoneService.mask_phone(normalized_phone)
        }
        
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        print(f"Error linking phone: {e}")
        raise HTTPException(status_code=500, detail="Failed to link phone")


@router.patch("/remove-phone")
async def remove_phone(
    authorization: str = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Remove phone verification from the current user's account.
    
    User can re-verify anytime. This is fully reversible.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    user = await get_current_user(authorization, db)
    
    try:
        now = datetime.now(timezone.utc).isoformat()
        
        await db.banibs_users.update_one(
            {"id": user["id"]},
            {
                "$set": {
                    "phone_number": None,
                    "phone_country_code": None,
                    "is_phone_verified": False,
                    "phone_verified_at": None,
                    "updated_at": now
                }
            }
        )
        
        return {
            "success": True,
            "message": "Phone verification removed"
        }
        
    except Exception as e:
        print(f"Error removing phone: {e}")
        raise HTTPException(status_code=500, detail="Failed to remove phone")


@router.get("/status", response_model=PhoneStatusResponse)
async def get_phone_status(
    authorization: str = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get the current user's phone verification status.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    user = await get_current_user(authorization, db)
    
    return PhoneStatusResponse(
        is_phone_verified=user.get("is_phone_verified", False),
        phone_masked=PhoneService.mask_phone(user["phone_number"]) if user.get("phone_number") else None,
        verified_at=user.get("phone_verified_at")
    )


@router.get("/check/{user_id}")
async def check_user_verified(
    user_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Check if a specific user has verified their phone.
    Public endpoint for displaying badges.
    
    Returns only the verification status, not the phone number.
    """
    user = await db.banibs_users.find_one({"id": user_id})
    
    if not user:
        return {"is_phone_verified": False}
    
    return {
        "is_phone_verified": user.get("is_phone_verified", False)
    }
