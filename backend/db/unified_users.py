"""
Phase 6.0 - Unified User Database Operations

All operations on banibs_users collection.
Uses UUIDs (not MongoDB ObjectId).
"""

import uuid
import bcrypt
from datetime import datetime, timezone
from typing import Optional, List
from db.connection import get_db_client
from models.unified_user import UnifiedUser, UserPublic, UserCreate, UserUpdate


async def create_user(user_data: UserCreate) -> str:
    """
    Create new unified user account
    
    Returns:
        user_id (UUID)
    """
    db = get_db_client()
    now = datetime.now(timezone.utc).isoformat()
    
    # Hash password
    password_hash = bcrypt.hashpw(
        user_data.password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')
    
    user_id = str(uuid.uuid4())
    
    user_doc = {
        "id": user_id,
        "email": user_data.email.lower(),  # Normalize email
        "password_hash": password_hash,
        "name": user_data.name,
        "avatar_url": None,
        "bio": None,
        "roles": ["user"],
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
        "metadata": {}
    }
    
    await db.banibs_users.insert_one(user_doc)
    return user_id


async def get_user_by_id(user_id: str) -> Optional[dict]:
    """
    Get user by ID
    """
    db = get_db_client()
    return await db.banibs_users.find_one({"id": user_id})


async def get_user_by_email(email: str) -> Optional[dict]:
    """
    Get user by email (case-insensitive)
    """
    db = get_db_client()
    return await db.banibs_users.find_one({"email": email.lower()})


async def update_user(user_id: str, update_data: dict) -> bool:
    """
    Update user fields
    
    Returns:
        True if updated, False if user not found
    """
    db = get_db_client()
    
    # Add updated_at timestamp
    update_data["updated_at"] = datetime.now(timezone.utc).isoformat()
    
    result = await db.banibs_users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    return result.modified_count > 0


async def update_last_login(user_id: str):
    """
    Update user's last login timestamp
    """
    db = get_db_client()
    now = datetime.now(timezone.utc).isoformat()
    
    await db.banibs_users.update_one(
        {"id": user_id},
        {"$set": {"last_login": now}}
    )


async def verify_password(email: str, password: str) -> Optional[dict]:
    """
    Verify user password for login
    
    Returns:
        User document if valid, None if invalid
    """
    user = await get_user_by_email(email)
    
    if not user:
        return None
    
    # Verify password
    password_valid = bcrypt.checkpw(
        password.encode('utf-8'),
        user["password_hash"].encode('utf-8')
    )
    
    if not password_valid:
        return None
    
    return user


async def set_email_verification_token(user_id: str, token: str, expires: str):
    """
    Set email verification token
    """
    await update_user(user_id, {
        "email_verification_token": token,
        "email_verification_expires": expires
    })


async def verify_email_token(token: str) -> Optional[dict]:
    """
    Verify email verification token
    
    Returns:
        User document if token valid, None if invalid/expired
    """
    db = get_db_client()
    now = datetime.now(timezone.utc).isoformat()
    
    user = await db.banibs_users.find_one({
        "email_verification_token": token,
        "email_verification_expires": {"$gt": now}
    })
    
    if user:
        # Mark email as verified and clear token
        await update_user(user["id"], {
            "email_verified": True,
            "email_verification_token": None,
            "email_verification_expires": None
        })
    
    return user


async def set_password_reset_token(user_id: str, token: str, expires: str):
    """
    Set password reset token
    """
    await update_user(user_id, {
        "password_reset_token": token,
        "password_reset_expires": expires
    })


async def reset_password_with_token(token: str, new_password: str) -> bool:
    """
    Reset password using reset token
    
    Returns:
        True if successful, False if token invalid/expired
    """
    db = get_db_client()
    now = datetime.now(timezone.utc).isoformat()
    
    user = await db.banibs_users.find_one({
        "password_reset_token": token,
        "password_reset_expires": {"$gt": now}
    })
    
    if not user:
        return False
    
    # Hash new password
    password_hash = bcrypt.hashpw(
        new_password.encode('utf-8'),
        bcrypt.gensalt()
    ).decode('utf-8')
    
    # Update password and clear reset token
    await update_user(user["id"], {
        "password_hash": password_hash,
        "password_reset_token": None,
        "password_reset_expires": None
    })
    
    return True


async def add_role(user_id: str, role: str):
    """
    Add role to user
    """
    db = get_db_client()
    
    await db.banibs_users.update_one(
        {"id": user_id},
        {"$addToSet": {"roles": role}}
    )


async def remove_role(user_id: str, role: str):
    """
    Remove role from user
    """
    db = get_db_client()
    
    await db.banibs_users.update_one(
        {"id": user_id},
        {"$pull": {"roles": role}}
    )


async def update_membership(user_id: str, level: str, status: str, subscription_id: Optional[str] = None):
    """
    Update user membership tier
    """
    update_data = {
        "membership_level": level,
        "membership_status": status
    }
    
    if subscription_id:
        update_data["subscription_id"] = subscription_id
    
    await update_user(user_id, update_data)


async def get_users_by_role(role: str, limit: int = 100) -> List[dict]:
    """
    Get users by role
    """
    db = get_db_client()
    
    cursor = db.banibs_users.find({"roles": role})
    cursor.limit(limit)
    
    return await cursor.to_list(length=limit)


async def get_all_users(skip: int = 0, limit: int = 50) -> List[dict]:
    """
    Get all users (paginated, admin only)
    """
    db = get_db_client()
    
    cursor = db.banibs_users.find({})
    cursor.skip(skip).limit(limit).sort("created_at", -1)
    
    return await cursor.to_list(length=limit)


async def delete_user(user_id: str) -> bool:
    """
    Delete user account (GDPR compliance)
    
    Returns:
        True if deleted, False if not found
    """
    db = get_db_client()
    
    result = await db.banibs_users.delete_one({"id": user_id})
    return result.deleted_count > 0


def sanitize_user_response(user: dict) -> UserPublic:
    """
    Convert database user to public API response (remove sensitive fields)
    """
    return UserPublic(
        id=user["id"],
        email=user["email"],
        name=user["name"],
        avatar_url=user.get("avatar_url"),
        bio=user.get("bio"),
        roles=user["roles"],
        membership_level=user["membership_level"],
        email_verified=user["email_verified"],
        created_at=user["created_at"]
    )
