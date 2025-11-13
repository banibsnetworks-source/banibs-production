"""
Media Upload Routes - Phase 8.1
Handles image and video uploads for posts
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from pydantic import BaseModel
from typing import Literal, Optional

from middleware.auth_guard import require_role
from utils.media_processing import process_post_image, process_post_video
from utils.media_storage import save_media_file
from utils.link_preview import fetch_link_preview

router = APIRouter(prefix="/api/media", tags=["media"])


# Models
class MediaUploadResponse(BaseModel):
    url: str
    type: Literal["image", "video"]
    width: Optional[int] = None
    height: Optional[int] = None
    thumbnail_url: Optional[str] = None


class LinkPreviewRequest(BaseModel):
    url: str


class LinkPreviewResponse(BaseModel):
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    site: str
    url: str


# Allowed file types
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/heic", "image/webp"}
ALLOWED_VIDEO_TYPES = {"video/mp4", "video/quicktime"}  # mp4, mov
MAX_IMAGE_SIZE = 20 * 1024 * 1024  # 20MB
MAX_VIDEO_SIZE = 100 * 1024 * 1024  # 100MB


@router.post("/upload", response_model=MediaUploadResponse)
async def upload_media(
    file: UploadFile = File(...),
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Upload image or video for post
    
    Accepts:
    - Images: jpg, png, heic
    - Videos: mp4, mov
    
    Returns media URL and metadata
    """
    # Read file
    file_bytes = await file.read()
    
    # Determine media type
    content_type = file.content_type
    
    if content_type in ALLOWED_IMAGE_TYPES:
        # Process image
        if len(file_bytes) > MAX_IMAGE_SIZE:
            raise HTTPException(status_code=400, detail="Image too large (max 20MB)")
        
        try:
            processed_bytes, width, height = process_post_image(file_bytes)
            
            # Save to storage
            result = save_media_file(processed_bytes, "image", "webp")
            
            return MediaUploadResponse(
                url=result["url"],
                type="image",
                width=width,
                height=height
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process image: {str(e)}")
    
    elif content_type in ALLOWED_VIDEO_TYPES:
        # Process video
        if len(file_bytes) > MAX_VIDEO_SIZE:
            raise HTTPException(status_code=400, detail="Video too large (max 100MB)")
        
        try:
            processed_bytes, metadata = process_post_video(file_bytes)
            
            # Save to storage (keep as mp4)
            result = save_media_file(processed_bytes, "video", "mp4")
            
            return MediaUploadResponse(
                url=result["url"],
                type="video",
                thumbnail_url=metadata.get("thumbnail_url")
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Failed to process video: {str(e)}")
    
    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: images (jpg, png, heic) or videos (mp4, mov)"
        )


@router.post("/link/preview", response_model=LinkPreviewResponse)
async def get_link_preview(
    request: LinkPreviewRequest,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Fetch OpenGraph metadata for a URL
    """
    try:
        preview_data = fetch_link_preview(request.url)
        return LinkPreviewResponse(**preview_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch link preview: {str(e)}")
