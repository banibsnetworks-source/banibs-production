"""
Contributor Authentication Routes - BDII Identity Threading

MIGRATION STATUS (December 2025):
- Contributors are now integrated into BGLIS identity system
- Legacy routes preserved for backward compatibility
- New contributors should use BGLIS registration (bglis_auth.py)

AUTHENTICATION METHODS:
1. BGLIS (Recommended): Phone-first registration via /api/auth/register-bglis
   - Register with phone + username
   - Add "contributor" role during/after registration
   
2. Legacy (Deprecated): Email + password via /api/auth/contributor/register
   - Creates BGLIS user with needs_bglis_upgrade=True
   - Prompts for phone number on next login

BDII THREADING:
- Contributor data stored in banibs_users.contributor_profile
- Identity resolution: BGLIS UUID → Contributor profile
- Roles array includes "contributor" for contributors
"""

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
import bcrypt
from datetime import datetime, timezone
from bson import ObjectId
import uuid

from models.contributor import (
    ContributorCreate,
    ContributorLogin,
    ContributorPublic,
    ContributorTokenResponse
)
from models.unified_user import UserPublic
from services.jwt import create_access_token, create_refresh_token
from db.connection import get_db
from db import unified_users

router = APIRouter(prefix="/api/auth/contributor", tags=["Contributor Auth (Legacy)"])

@router.post("/register", response_model=ContributorTokenResponse)
async def register_contributor(
    data: ContributorCreate,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    [LEGACY] Register a new contributor account
    
    ⚠️ DEPRECATED: Use BGLIS registration (/api/auth/register-bglis) instead.
    
    This creates a BGLIS user with contributor role and legacy email+password auth.
    User will be prompted to upgrade to phone-first auth on next login.
    
    RECOMMENDED FLOW:
    1. Register via /api/auth/register-bglis (phone + username)
    2. Add "contributor" role via profile update or admin action
    """
    # Check if email already exists in BGLIS identity store
    existing = await unified_users.get_user_by_email(data.email)
    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )
    
    # Hash password
    password_bytes = data.password.encode('utf-8')
    salt = bcrypt.gensalt()
    password_hash = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
    
    # Create BGLIS user with contributor profile
    user_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    contributor_profile = {
        "organization": data.organization,
        "display_name": None,
        "bio": None,
        "website_or_social": None,
        "verified": False,
        "total_submissions": 0,
        "approved_submissions": 0,
        "featured_submissions": 0
    }
    
    bglis_user = {
        "id": user_id,
        "email": data.email.lower(),
        "password_hash": password_hash,
        "name": data.name,
        
        # BGLIS fields (not yet set)
        "phone_number": None,
        "phone_country_code": None,
        "is_phone_verified": False,
        "username": None,
        "has_recovery_phrase": False,
        "recovery_phrase_hash": None,
        "recovery_phrase_salt": None,
        "needs_bglis_upgrade": True,  # Mark for BGLIS upgrade
        
        # Roles (user + contributor)
        "roles": ["user", "contributor"],
        
        # Contributor profile (BDII threading)
        "contributor_profile": contributor_profile,
        
        # Default fields
        "avatar_url": None,
        "bio": None,
        "membership_level": "free",
        "membership_status": "active",
        "subscription_id": None,
        "subscription_expires_at": None,
        "email_verified": False,
        "email_verification_token": None,
        "email_verification_expires": None,
        "password_reset_token": None,
        "password_reset_expires": None,
        "created_at": now,
        "last_login": None,
        "updated_at": now,
        "metadata": {},
        "preferred_portal": "news",
        "preferred_language": "en",
        "region_primary": None,
        "region_secondary": None,
        "detected_country": None,
        "region_override": False,
        "region_detection_method": None,
        "emoji_identity": None,
        "profile_picture_url": None,
        "banner_image_url": None,
        "accent_color": "#3B82F6"
    }
    
    # Insert into BGLIS identity store
    await db.banibs_users.insert_one(bglis_user)
    
    # Create JWT tokens
    token_data = {
        "sub": user_id,
        "email": data.email,
        "roles": ["user", "contributor"],
        "membership_level": "free"
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": user_id, "email": data.email})
    
    return ContributorTokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        contributor=ContributorPublic(
            id=user_id,
            email=data.email,
            name=data.name,
            organization=data.organization,
            created_at=now
        )
    )

@router.post("/login", response_model=ContributorTokenResponse)
async def login_contributor(
    credentials: ContributorLogin,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    [LEGACY] Login as contributor
    
    ⚠️ DEPRECATED: Use BGLIS phone/username login instead.
    
    This route checks BGLIS identity store (banibs_users) for contributors.
    Legacy contributors from old 'contributors' collection should have been migrated.
    
    RECOMMENDED FLOW:
    - Use /api/auth/login-phone or /api/auth/login-username (BGLIS)
    - System will check for "contributor" role automatically
    """
    # Find user in BGLIS identity store (banibs_users)
    user = await unified_users.get_user_by_email(credentials.email)
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Check if user has contributor role
    if "contributor" not in user.get("roles", []):
        raise HTTPException(
            status_code=403,
            detail="Account is not registered as a contributor. Please contact support."
        )
    
    # Verify password
    password_bytes = credentials.password.encode('utf-8')
    stored_hash = user.get('password_hash', '').encode('utf-8')
    
    if not stored_hash or not bcrypt.checkpw(password_bytes, stored_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Update last login
    await unified_users.update_last_login(user['id'])
    
    # Create JWT tokens
    token_data = {
        "sub": user['id'],
        "email": user['email'],
        "roles": user.get('roles', ['user', 'contributor']),
        "membership_level": user.get('membership_level', 'free')
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": user['id'], "email": user['email']})
    
    # Extract contributor profile
    contributor_profile = user.get('contributor_profile', {})
    
    return ContributorTokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        contributor=ContributorPublic(
            id=user['id'],
            email=user['email'],
            name=user.get('name', ''),
            organization=contributor_profile.get('organization'),
            display_name=contributor_profile.get('display_name'),
            bio=contributor_profile.get('bio'),
            website_or_social=contributor_profile.get('website_or_social'),
            verified=contributor_profile.get('verified', False),
            total_submissions=contributor_profile.get('total_submissions', 0),
            approved_submissions=contributor_profile.get('approved_submissions', 0),
            featured_submissions=contributor_profile.get('featured_submissions', 0),
            created_at=user.get('created_at', datetime.now(timezone.utc).isoformat())
        )
    )
