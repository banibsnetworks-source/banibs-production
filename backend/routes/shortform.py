"""
BANIBS ShortForm - API Routes
Short-form vertical video platform
"""
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Header
from fastapi.responses import FileResponse
from typing import Optional
from uuid import uuid4
import os
import logging
from pathlib import Path

from models.shortform_video import (
    ShortFormVideo,
    VideoUploadRequest,
    VideoFeedResponse,
    VideoMetricsUpdate,
    VideoCategory,
    VideoSafetyRating
)
from db.shortform import ShortFormDB
from services.jwt_service import JWTService
from datetime import datetime

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/shortform", tags=["shortform"])

# Video storage directory
VIDEO_UPLOAD_DIR = Path("/app/backend/uploads/shortform")
VIDEO_UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# File size limit: 100MB
MAX_FILE_SIZE = 100 * 1024 * 1024

ALLOWED_VIDEO_TYPES = [
    "video/mp4",
    "video/quicktime",  # .mov
    "video/x-msvideo",  # .avi
    "video/webm"
]

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get current authenticated user from Bearer token"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.split(" ")[1]
    try:
        payload = JWTService.verify_token(token)
        return payload
    except Exception as e:
        logger.error(f"Token verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication")

@router.post("/upload")
async def upload_video(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category: str = Form("general"),
    safety_rating: str = Form("general"),
    is_community_boost: bool = Form(False),
    is_micro_learning: bool = Form(False),
    current_user: dict = Depends(get_current_user),
    db = Depends(lambda: None)  # Will be injected in server.py
):
    """
    Upload a short-form video
    
    - Max file size: 100MB
    - Supported formats: MP4, MOV, AVI, WEBM
    - Videos stored locally for MVP
    """
    logger.info(f"🎬 Video upload started by user: {current_user.get('id')}")
    
    # Validate file type
    if file.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(ALLOWED_VIDEO_TYPES)}"
        )
    
    try:
        # Generate unique filename
        video_id = str(uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        new_filename = f"{video_id}{file_extension}"
        file_path = VIDEO_UPLOAD_DIR / new_filename
        
        # Read and save file
        file_size = 0
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(8192):  # Read in 8KB chunks
                file_size += len(chunk)
                
                # Check file size limit
                if file_size > MAX_FILE_SIZE:
                    os.remove(file_path)  # Clean up
                    raise HTTPException(
                        status_code=413,
                        detail=f"File too large. Max size: {MAX_FILE_SIZE / 1024 / 1024}MB"
                    )
                
                buffer.write(chunk)
        
        logger.info(f"📁 Video saved: {new_filename} ({file_size / 1024 / 1024:.2f}MB)")
        
        # Get user region (RCS-X integration)
        user_region = current_user.get('region_primary')
        
        # Create video record
        video_data = {
            "id": video_id,
            "user_id": current_user.get('id'),
            "username": current_user.get('username', current_user.get('email', 'Unknown')),
            "user_avatar": current_user.get('avatar'),
            "title": title,
            "description": description,
            "category": category,
            "filename": new_filename,
            "file_path": str(file_path),
            "file_size": file_size,
            "safety_rating": safety_rating,
            "region": user_region,
            "is_community_boost": is_community_boost,
            "is_micro_learning": is_micro_learning,
            "views": 0,
            "likes": 0,
            "shares": 0,
            "completion_rate": 0.0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "is_active": True
        }
        
        # Save to database
        from db import get_db
        db_instance = await get_db()
        shortform_db = ShortFormDB(db_instance)
        await shortform_db.create_video(video_data)
        
        logger.info(f"✅ Video uploaded successfully: {video_id}")
        
        return {
            "success": True,
            "video_id": video_id,
            "message": "Video uploaded successfully",
            "video": video_data
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Video upload failed: {str(e)}", exc_info=True)
        # Clean up file if it exists
        if 'file_path' in locals() and os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=500, detail="Failed to upload video")

@router.get("/feed/discovery")
async def get_discovery_feed(
    page: int = 1,
    limit: int = 20,
    current_user: Optional[dict] = Depends(get_current_user)
):
    """
    Get Discovery feed
    - All videos with safety filtering
    - Youth mode if user under 18
    - Region-aware (RCS-X)
    """
    try:
        from db import get_db
        db = await get_db()
        shortform_db = ShortFormDB(db)
        
        # Get user age for youth safety
        user_age = current_user.get('age') if current_user else None
        user_region = current_user.get('region_primary') if current_user else None
        
        logger.info(f"📺 Discovery feed requested (page={page}, age={user_age}, region={user_region})")
        
        videos = await shortform_db.get_discovery_feed(
            page=page,
            limit=limit,
            user_age=user_age,
            region=user_region
        )
        
        total = await shortform_db.get_total_count()
        has_more = (page * limit) < total
        
        return VideoFeedResponse(
            videos=videos,
            total=total,
            page=page,
            has_more=has_more
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to get discovery feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to load feed")

@router.get("/feed/personal")
async def get_personal_feed(
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """
    Get Personal Circle feed
    - Videos from user's circles
    - TODO: Integrate with Circle OS
    """
    try:
        from db import get_db
        db = await get_db()
        shortform_db = ShortFormDB(db)
        
        user_id = current_user.get('id')
        videos = await shortform_db.get_personal_feed(user_id, page, limit)
        
        return VideoFeedResponse(
            videos=videos,
            total=len(videos),
            page=page,
            has_more=False
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to get personal feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to load feed")

@router.get("/feed/community")
async def get_community_feed(
    page: int = 1,
    limit: int = 20,
    current_user: dict = Depends(get_current_user)
):
    """
    Get Community Circles feed
    - Videos from user's communities
    - TODO: Integrate with Communities system
    """
    try:
        from db import get_db
        db = await get_db()
        shortform_db = ShortFormDB(db)
        
        # TODO: Get user's community IDs
        community_ids = []
        videos = await shortform_db.get_community_feed(community_ids, page, limit)
        
        return VideoFeedResponse(
            videos=videos,
            total=len(videos),
            page=page,
            has_more=False
        )
        
    except Exception as e:
        logger.error(f"❌ Failed to get community feed: {e}")
        raise HTTPException(status_code=500, detail="Failed to load feed")

@router.get("/video/{video_id}")
async def get_video(video_id: str):
    """
    Get single video by ID
    """
    try:
        from db import get_db
        db = await get_db()
        shortform_db = ShortFormDB(db)
        
        video = await shortform_db.get_video(video_id)
        
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        # Increment view count
        await shortform_db.increment_views(video_id)
        
        return video
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to get video: {e}")
        raise HTTPException(status_code=500, detail="Failed to load video")

@router.get("/video/{video_id}/stream")
async def stream_video(video_id: str):
    """
    Stream video file
    """
    try:
        from db import get_db
        db = await get_db()
        shortform_db = ShortFormDB(db)
        
        video = await shortform_db.get_video(video_id)
        
        if not video:
            raise HTTPException(status_code=404, detail="Video not found")
        
        file_path = Path(video['file_path'])
        
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="Video file not found")
        
        return FileResponse(
            path=file_path,
            media_type="video/mp4",
            filename=video['filename']
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to stream video: {e}")
        raise HTTPException(status_code=500, detail="Failed to stream video")

@router.post("/video/{video_id}/like")
async def like_video(
    video_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Like a video
    """
    try:
        from db import get_db
        db = await get_db()
        shortform_db = ShortFormDB(db)
        
        success = await shortform_db.increment_likes(video_id)
        
        if not success:
            raise HTTPException(status_code=404, detail="Video not found")
        
        return {"success": True, "message": "Video liked"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Failed to like video: {e}")
        raise HTTPException(status_code=500, detail="Failed to like video")

@router.post("/metrics")
async def update_metrics(
    metrics: VideoMetricsUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update video metrics (completion rate, watch time)
    """
    try:
        from db import get_db
        db = await get_db()
        shortform_db = ShortFormDB(db)
        
        if metrics.view_completed:
            await shortform_db.update_completion_rate(
                metrics.video_id,
                1.0  # Completed
            )
        
        return {"success": True}
        
    except Exception as e:
        logger.error(f"❌ Failed to update metrics: {e}")
        return {"success": False}
