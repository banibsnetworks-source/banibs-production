"""
Profile Media Upload Routes - Phase 8.1
Profile picture and banner upload/management
"""

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from middleware.auth_guard import require_role
from pathlib import Path
import shutil
from uuid import uuid4
from db.connection import get_db
import os

router = APIRouter(prefix="/api/profile/media", tags=["Profile Media"])

# Upload directories
UPLOAD_DIR = Path(__file__).parent.parent / "uploads"
PROFILE_PICTURES_DIR = UPLOAD_DIR / "profile_pictures"
BANNERS_DIR = UPLOAD_DIR / "banners"

# Ensure directories exist
PROFILE_PICTURES_DIR.mkdir(parents=True, exist_ok=True)
BANNERS_DIR.mkdir(parents=True, exist_ok=True)

# Allowed image types
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


def validate_image(file: UploadFile):
    """Validate uploaded image"""
    # Check file extension
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size (FastAPI doesn't provide content-length easily, so we'll check during save)
    return True


@router.post("/upload-profile-picture")
async def upload_profile_picture(
    file: UploadFile = File(...),
    current_user=Depends(require_role("user", "member"))
):
    """
    Upload a profile picture
    Returns the URL to access the uploaded image
    """
    validate_image(file)
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{current_user['id']}_{uuid4()}{file_ext}"
    file_path = PROFILE_PICTURES_DIR / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large (max 10MB)")
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Update user profile in database
    db = await get_db()
    profile_picture_url = f"/api/profile/media/profile-pictures/{unique_filename}"
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"profile_picture_url": profile_picture_url}}
    )
    
    return {
        "success": True,
        "url": profile_picture_url,
        "filename": unique_filename
    }


@router.post("/upload-banner")
async def upload_banner(
    file: UploadFile = File(...),
    current_user=Depends(require_role("user", "member"))
):
    """
    Upload a profile banner
    Returns the URL to access the uploaded image
    """
    validate_image(file)
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"{current_user['id']}_{uuid4()}{file_ext}"
    file_path = BANNERS_DIR / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large (max 10MB)")
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Update user profile in database
    db = await get_db()
    banner_url = f"/api/profile/media/banners/{unique_filename}"
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"banner_image_url": banner_url}}
    )
    
    return {
        "success": True,
        "url": banner_url,
        "filename": unique_filename
    }


@router.post("/upload-business-banner")
async def upload_business_banner(
    file: UploadFile = File(...),
    business_profile_id: str = Form(...),
    current_user=Depends(require_role("user", "member"))
):
    """
    Upload a business profile banner
    """
    validate_image(file)
    
    # Verify user owns this business profile
    db = await get_db()
    business = await db.business_profiles.find_one({
        "id": business_profile_id,
        "owner_user_id": current_user["id"]
    })
    
    if not business:
        raise HTTPException(status_code=403, detail="Not authorized to update this business profile")
    
    # Generate unique filename
    file_ext = Path(file.filename).suffix.lower()
    unique_filename = f"business_{business_profile_id}_{uuid4()}{file_ext}"
    file_path = BANNERS_DIR / unique_filename
    
    # Save file
    try:
        with file_path.open("wb") as buffer:
            content = await file.read()
            if len(content) > MAX_FILE_SIZE:
                raise HTTPException(status_code=400, detail="File too large (max 10MB)")
            buffer.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    # Update business profile in database
    banner_url = f"/api/profile/media/banners/{unique_filename}"
    
    await db.business_profiles.update_one(
        {"id": business_profile_id},
        {"$set": {"banner_image_url": banner_url}}
    )
    
    return {
        "success": True,
        "url": banner_url,
        "filename": unique_filename
    }


@router.get("/profile-pictures/{filename}")
async def get_profile_picture(filename: str):
    """Serve profile picture"""
    file_path = PROFILE_PICTURES_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)


@router.get("/banners/{filename}")
async def get_banner(filename: str):
    """Serve banner image"""
    file_path = BANNERS_DIR / filename
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Image not found")
    return FileResponse(file_path)


@router.delete("/remove-banner")
async def remove_banner(
    current_user=Depends(require_role("user", "member"))
):
    """Remove user banner"""
    db = await get_db()
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$unset": {"banner_image_url": ""}}
    )
    return {"success": True, "message": "Banner removed"}


@router.delete("/remove-business-banner/{business_profile_id}")
async def remove_business_banner(
    business_profile_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """Remove business banner"""
    db = await get_db()
    
    # Verify ownership
    business = await db.business_profiles.find_one({
        "id": business_profile_id,
        "owner_user_id": current_user["id"]
    })
    
    if not business:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    await db.business_profiles.update_one(
        {"id": business_profile_id},
        {"$unset": {"banner_image_url": ""}}
    )
    
    return {"success": True, "message": "Business banner removed"}


@router.patch("/update-accent-color")
async def update_accent_color(
    accent_color: str = Form(...),
    current_user=Depends(require_role("user", "member"))
):
    """Update user's accent color"""
    db = await get_db()
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"accent_color": accent_color}}
    )
    
    return {"success": True, "accent_color": accent_color}


@router.patch("/update-profile-frame")
async def update_profile_frame(
    frame_style: str = Form(...),
    current_user=Depends(require_role("user", "member"))
):
    """Update profile picture frame style"""
    db = await get_db()
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": {"profile_picture_frame": frame_style}}
    )
    
    return {"success": True, "frame_style": frame_style}
