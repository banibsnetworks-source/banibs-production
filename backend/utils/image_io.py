"""
Image processing utilities for profile photos
Phase 9.0.1 - Profile Photos

Handles:
- Square avatar cropping (256x256)
- Cover image cropping (1500x500)
- EXIF stripping for privacy
- WebP conversion for optimization
"""

from PIL import Image, ImageOps
from io import BytesIO

ALLOWED_MIME = {"image/jpeg", "image/png", "image/webp"}
MAX_BYTES = 5 * 1024 * 1024  # 5MB


def process_square_avatar(raw_bytes: bytes, size: int = 256) -> bytes:
    """
    Process uploaded avatar image:
    - Rotate based on EXIF orientation
    - Center-crop to square
    - Resize to target size
    - Convert to WebP
    - Strip EXIF metadata
    """
    with Image.open(BytesIO(raw_bytes)) as im:
        # Handle EXIF orientation
        im = ImageOps.exif_transpose(im)
        
        # Center crop to square and resize
        im = ImageOps.fit(im.convert("RGB"), (size, size), method=Image.LANCZOS)
        
        # Save as WebP
        out = BytesIO()
        im.save(out, format="WEBP", quality=88, method=6)
        return out.getvalue()


def process_cover(raw_bytes: bytes, width: int = 1500, height: int = 500) -> bytes:
    """
    Process uploaded cover image:
    - Rotate based on EXIF orientation
    - Center-crop to target aspect ratio
    - Resize to target dimensions
    - Convert to WebP
    - Strip EXIF metadata
    """
    with Image.open(BytesIO(raw_bytes)) as im:
        # Handle EXIF orientation
        im = ImageOps.exif_transpose(im)
        
        # Center crop and resize
        im = ImageOps.fit(im.convert("RGB"), (width, height), method=Image.LANCZOS)
        
        # Save as WebP
        out = BytesIO()
        im.save(out, format="WEBP", quality=88, method=6)
        return out.getvalue()
