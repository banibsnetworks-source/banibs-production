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
MAX_BYTES = 20 * 1024 * 1024  # 20MB (client downscales first)


def process_square_avatar(raw_bytes: bytes, size: int = 256) -> bytes:
    """
    Process uploaded avatar image:
    - Rotate based on EXIF orientation
    - Resize to fit within square (maintains aspect ratio)
    - Add padding if needed to make square
    - Convert to WebP
    - Strip EXIF metadata
    
    This approach keeps the full image visible without aggressive cropping
    """
    with Image.open(BytesIO(raw_bytes)) as im:
        # Handle EXIF orientation
        im = ImageOps.exif_transpose(im)
        im = im.convert("RGB")
        
        # Calculate dimensions to fit within square
        width, height = im.size
        if width > height:
            new_width = size
            new_height = int((height / width) * size)
        else:
            new_height = size
            new_width = int((width / height) * size)
        
        # Resize maintaining aspect ratio
        im = im.resize((new_width, new_height), Image.LANCZOS)
        
        # Create square canvas with neutral background
        canvas = Image.new('RGB', (size, size), (240, 240, 240))
        
        # Paste resized image centered on canvas
        x_offset = (size - new_width) // 2
        y_offset = (size - new_height) // 2
        canvas.paste(im, (x_offset, y_offset))
        
        # Save as WebP
        out = BytesIO()
        canvas.save(out, format="WEBP", quality=88, method=6)
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
