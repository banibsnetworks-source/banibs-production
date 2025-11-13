"""
Media Storage Service - Phase 8.1
Abstraction layer for file storage (local filesystem for MVP)
"""

import os
import secrets
from typing import Literal

# Base directories
MEDIA_BASE = "/app/backend/static/media"
IMAGES_DIR = os.path.join(MEDIA_BASE, "images")
VIDEOS_DIR = os.path.join(MEDIA_BASE, "videos")

# Ensure directories exist
os.makedirs(IMAGES_DIR, exist_ok=True)
os.makedirs(VIDEOS_DIR, exist_ok=True)


def generate_filename(prefix: str, extension: str) -> str:
    """Generate unique filename"""
    return f"{prefix}_{secrets.token_hex(12)}.{extension}"


def save_media_file(
    file_bytes: bytes,
    media_type: Literal["image", "video"],
    extension: str
) -> dict:
    """
    Save media file to storage
    
    Args:
        file_bytes: Raw file bytes
        media_type: "image" or "video"
        extension: File extension (e.g., "webp", "mp4")
    
    Returns:
        dict with url, type, and metadata
    """
    # Determine directory and prefix
    if media_type == "image":
        directory = IMAGES_DIR
        prefix = "img"
    else:
        directory = VIDEOS_DIR
        prefix = "vid"
    
    # Generate filename and save
    filename = generate_filename(prefix, extension)
    filepath = os.path.join(directory, filename)
    
    with open(filepath, "wb") as f:
        f.write(file_bytes)
    
    # Return URL and metadata
    url = f"/api/static/media/{media_type}s/{filename}"
    
    return {
        "url": url,
        "type": media_type,
        "filename": filename
    }


def delete_media_file(url: str) -> bool:
    """
    Delete media file from storage
    
    Args:
        url: Media URL (e.g., "/api/static/media/images/img_abc123.webp")
    
    Returns:
        True if deleted, False if not found
    """
    try:
        # Extract path from URL
        if "/api/static/media/" not in url:
            return False
        
        relative_path = url.split("/api/static/media/")[1]
        filepath = os.path.join(MEDIA_BASE, relative_path)
        
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False
    except Exception:
        return False
