from fastapi import APIRouter, Depends, HTTPException, Header
from motor.motor_asyncio import AsyncIOMotorDatabase
import bcrypt
from datetime import datetime

from models.user import (
    UserLogin,
    UserPublic,
    TokenResponse,
    RefreshTokenRequest,
    TokenRefreshResponse
)
from services.jwt import (
    create_access_token,
    create_refresh_token,
    verify_refresh_token
)
from db.connection import get_db
from middleware.auth_guard import get_current_user

router = APIRouter(prefix="/api/auth", tags=["authentication"])

@router.post("/login", response_model=TokenResponse)
async def login(credentials: UserLogin, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Authenticate user and return JWT tokens
    
    - Validates email and password
    - Returns access token (15min) and refresh token (7d)
    - Returns user info (without password)
    """
    # Find user by email
    user = await db.users.find_one({"email": credentials.email})
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Verify password
    password_bytes = credentials.password.encode('utf-8')
    stored_hash = user['password_hash'].encode('utf-8')
    
    if not bcrypt.checkpw(password_bytes, stored_hash):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )
    
    # Create JWT payload
    token_data = {
        "user_id": str(user['_id']),
        "email": user['email'],
        "role": user['role']
    }
    
    # Generate tokens
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"user_id": str(user['_id']), "email": user['email']})
    
    # Update last login
    await db.users.update_one(
        {"_id": user['_id']},
        {"$set": {"updated_at": datetime.utcnow()}}
    )
    
    # Return response
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserPublic(
            email=user['email'],
            role=user['role'],
            created_at=user['created_at']
        )
    )

@router.post("/refresh", response_model=TokenRefreshResponse)
async def refresh_token(request: RefreshTokenRequest, db: AsyncIOMotorDatabase = Depends(get_db)):
    """
    Refresh access token using refresh token
    
    - Validates refresh token
    - Issues new access token
    - Refresh token remains valid
    """
    # Verify refresh token
    payload = verify_refresh_token(request.refresh_token)
    
    if not payload:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired refresh token"
        )
    
    # Get user from database to ensure they still exist
    user_id = payload.get("user_id")
    user = await db.users.find_one({"_id": user_id})
    
    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    
    # Create new access token
    token_data = {
        "user_id": str(user['_id']),
        "email": user['email'],
        "role": user['role']
    }
    
    new_access_token = create_access_token(token_data)
    
    return TokenRefreshResponse(access_token=new_access_token)

@router.post("/logout")
async def logout(request: RefreshTokenRequest):
    """
    Logout user (stateless - just returns success)
    
    In a stateless JWT system, logout is handled client-side
    by deleting tokens. This endpoint exists for:
    1. Future token blacklisting
    2. Audit logging
    3. Client-side confirmation
    """
    # In Phase 2.8, we're stateless, so just return success
    # Future: Add refresh token to blacklist in Redis/MongoDB
    
    return {
        "message": "Logged out successfully",
        "note": "Please delete tokens on client side"
    }

@router.get("/me", response_model=UserPublic)
async def get_current_user_info(
    authorization: str = Depends(lambda auth=Header(None): auth),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    Get current user information from JWT
    
    Requires: Authorization: Bearer <access_token>
    Returns: User profile
    """
    from middleware.auth_guard import get_current_user
    
    user_payload = await get_current_user(authorization)
    user_id = user_payload.get("user_id")
    
    user = await db.users.find_one({"_id": user_id})
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserPublic(
        email=user['email'],
        role=user['role'],
        created_at=user['created_at']
    )
