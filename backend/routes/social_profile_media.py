"""
Social Profile Media Routes - Phase 9.0.1
Profile photo and cover image upload/delete endpoints
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, status
from datetime import datetime, timezone
import os
import secrets

from db.connection import get_db_client
from middleware.auth_guard import get_current_user
from utils.image_io import process_square_avatar, process_cover, ALLOWED_MIME, MAX_BYTES


# Storage directories
AVATAR_DIR = os.getenv("AVATAR_DIR", "/app/backend/static/avatars")
COVER_DIR = os.getenv("COVER_DIR", "/app/backend/static/covers")

# Ensure directories exist
os.makedirs(AVATAR_DIR, exist_ok=True)
os.makedirs(COVER_DIR, exist_ok=True)

router = APIRouter(prefix="/api/social/profile/media", tags=["social-profile-media"])


def _rand_name(prefix: str) -> str:
    """Generate random filename with prefix"""
    return f"{prefix}_{secrets.token_hex(8)}.webp"


@router.post("/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload profile avatar
    - Max 5MB
    - jpeg/png/webp only
    - Crops to 256x256 square
    - Converts to WebP
    """
    # Validate content type
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported image type. Use JPEG, PNG, or WebP"
        )
    
    # Read and validate size
    raw = await file.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large (max 20MB)"
        )
    
    # Process image
    try:
        webp = process_square_avatar(raw, size=256)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not process image: {str(e)}"
        )
    
    # Generate filename and save
    fname = _rand_name("ava")
    fpath = os.path.join(AVATAR_DIR, fname)
    with open(fpath, "wb") as f:
        f.write(webp)
    
    # Update database
    db = get_db_client()
    avatar_url = f"/api/static/avatars/{fname}"
    
    await db.banibs_users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "profile.avatar_url": avatar_url,
                "profile.updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {"avatar_url": avatar_url}


@router.delete("/avatar")
async def delete_avatar(current_user: dict = Depends(get_current_user)):
    """
    Remove profile avatar
    Deletes file from disk and clears database field
    """
    db = get_db_client()
    
    # Get current avatar URL
    user = await db.banibs_users.find_one(
        {"id": current_user["id"]},
        {"_id": 0, "profile.avatar_url": 1}
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete old file if it exists
    profile = user.get("profile", {}) or {}
    url = profile.get("avatar_url")
    
    if url and url.startswith("/static/avatars/"):
        try:
            os.remove(os.path.join(AVATAR_DIR, os.path.basename(url)))
        except FileNotFoundError:
            pass  # File already deleted
    
    # Update database
    await db.banibs_users.update_one(
        {"id": current_user["id"]},
        {
            "$unset": {"profile.avatar_url": ""},
            "$set": {"profile.updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {"ok": True}


@router.post("/cover")
async def upload_cover(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload profile cover image
    - Max 5MB
    - jpeg/png/webp only
    - Crops to 1500x500
    - Converts to WebP
    """
    # Validate content type
    if file.content_type not in ALLOWED_MIME:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported image type. Use JPEG, PNG, or WebP"
        )
    
    # Read and validate size
    raw = await file.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large (max 20MB)"
        )
    
    # Process image
    try:
        webp = process_cover(raw, width=1500, height=500)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not process image: {str(e)}"
        )
    
    # Generate filename and save
    fname = _rand_name("cov")
    fpath = os.path.join(COVER_DIR, fname)
    with open(fpath, "wb") as f:
        f.write(webp)
    
    # Update database
    db = get_db_client()
    cover_url = f"/static/covers/{fname}"
    
    await db.banibs_users.update_one(
        {"id": current_user["id"]},
        {
            "$set": {
                "profile.cover_url": cover_url,
                "profile.updated_at": datetime.now(timezone.utc).isoformat()
            }
        }
    )
    
    return {"cover_url": cover_url}


@router.delete("/cover")
async def delete_cover(current_user: dict = Depends(get_current_user)):
    """
    Remove profile cover image
    Deletes file from disk and clears database field
    """
    db = get_db_client()
    
    # Get current cover URL
    user = await db.banibs_users.find_one(
        {"id": current_user["id"]},
        {"_id": 0, "profile.cover_url": 1}
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Delete old file if it exists
    profile = user.get("profile", {}) or {}
    url = profile.get("cover_url")
    
    if url and url.startswith("/static/covers/"):
        try:
            os.remove(os.path.join(COVER_DIR, os.path.basename(url)))
        except FileNotFoundError:
            pass  # File already deleted
    
    # Update database
    await db.banibs_users.update_one(
        {"id": current_user["id"]},
        {
            "$unset": {"profile.cover_url": ""},
            "$set": {"profile.updated_at": datetime.now(timezone.utc).isoformat()}
        }
    )
    
    return {"ok": True}
