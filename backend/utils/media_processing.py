"""
Media Processing Utilities - Phase 8.1
Image resizing, compression, and video handling
"""

from PIL import Image, ImageOps
from io import BytesIO
from typing import Tuple

# Configuration
MAX_IMAGE_DIMENSION = 1600  # Max width or height
IMAGE_QUALITY = 85  # WebP quality


def process_post_image(raw_bytes: bytes) -> Tuple[bytes, int, int]:
    """
    Process uploaded image for post:
    - Resize to max 1600px (preserving aspect ratio)
    - Convert to WebP
    - Strip EXIF metadata
    - Compress
    
    Returns:
        (webp_bytes, width, height)
    """
    with Image.open(BytesIO(raw_bytes)) as im:
        # Handle EXIF orientation
        im = ImageOps.exif_transpose(im)
        im = im.convert("RGB")
        
        # Get original dimensions
        orig_width, orig_height = im.size
        
        # Resize if needed (preserving aspect ratio)
        if orig_width > MAX_IMAGE_DIMENSION or orig_height > MAX_IMAGE_DIMENSION:
            # Calculate new dimensions
            if orig_width > orig_height:
                new_width = MAX_IMAGE_DIMENSION
                new_height = int(orig_height * (MAX_IMAGE_DIMENSION / orig_width))
            else:
                new_height = MAX_IMAGE_DIMENSION
                new_width = int(orig_width * (MAX_IMAGE_DIMENSION / orig_height))
            
            im = im.resize((new_width, new_height), Image.LANCZOS)
        else:
            new_width, new_height = orig_width, orig_height
        
        # Save as WebP
        out = BytesIO()
        im.save(out, format="WEBP", quality=IMAGE_QUALITY, method=6)
        
        return out.getvalue(), new_width, new_height


def process_post_video(raw_bytes: bytes) -> Tuple[bytes, dict]:
    """
    Process uploaded video for post:
    - Store MP4 as-is for Phase 8.1
    - Future: Add thumbnail generation with FFmpeg
    
    Returns:
        (video_bytes, metadata)
    """
    # For Phase 8.1: Store video as-is
    # Video dimensions can be extracted client-side or via FFmpeg in future
    
    metadata = {
        "size": len(raw_bytes),
        "thumbnail_url": None  # Future: FFmpeg thumbnail
    }
    
    return raw_bytes, metadata


def get_image_dimensions(raw_bytes: bytes) -> Tuple[int, int]:
    """
    Get image dimensions without full processing
    """
    with Image.open(BytesIO(raw_bytes)) as im:
        return im.size
