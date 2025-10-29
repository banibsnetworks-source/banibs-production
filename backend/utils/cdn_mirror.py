"""
BANIBS CDN Image Mirror & Optimization
--------------------------------------
Mirrors external RSS images to cdn.banibs.com/news and optimizes them.

This ensures:
- Fast loading (served from our domain)
- Reliable availability (no broken external links)
- Consistent sizing (max 1280px width)
- Optimized file sizes (~85% JPEG quality)
"""

import os
import requests
from urllib.parse import urlparse
import hashlib
from PIL import Image
import io
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

LOCAL_MIRROR_DIR = "/var/www/cdn.banibs.com/news"
CDN_BASE_URL = "https://cdn.banibs.com/news"

# Fallback images that should NOT be mirrored
FALLBACK_IMAGES = {
    "Business":     "https://cdn.banibs.com/fallback/business.jpg",
    "Technology":   "https://cdn.banibs.com/fallback/tech.jpg",
    "Education":    "https://cdn.banibs.com/fallback/education.jpg",
    "Community":    "https://cdn.banibs.com/fallback/community.jpg",
    "Opportunities":"https://cdn.banibs.com/fallback/opportunities.jpg",
}


def _generate_cdn_filename(original_url: str) -> str:
    """Generate a unique filename for CDN storage"""
    url_hash = hashlib.sha256(original_url.encode()).hexdigest()[:12]
    timestamp = datetime.utcnow().strftime("%Y%m%d")
    return f"{timestamp}_{url_hash}.jpg"


def _optimize_image(image_data: bytes, max_width: int = 1280) -> bytes:
    """Optimize image: resize and compress"""
    try:
        img = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if needed
        if img.mode in ("RGBA", "P"):
            img = img.convert("RGB")
        
        # Resize if too wide
        if img.width > max_width:
            ratio = max_width / img.width
            new_height = int(img.height * ratio)
            img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
        
        # Save optimized
        output = io.BytesIO()
        img.save(output, format="JPEG", quality=85, optimize=True)
        return output.getvalue()
    
    except Exception as e:
        print(f"Image optimization failed: {e}")
        return image_data


def _download_and_mirror_image(image_url: str) -> str | None:
    """Download external image, optimize it, save locally, return CDN URL"""
    if not image_url or image_url in FALLBACK_IMAGES.values():
        return image_url  # Skip fallbacks
    
    if image_url.startswith(CDN_BASE_URL):
        return image_url  # Already mirrored
    
    try:
        # Ensure mirror directory exists
        os.makedirs(LOCAL_MIRROR_DIR, exist_ok=True)
        
        # Generate filename
        cdn_filename = _generate_cdn_filename(image_url)
        local_path = os.path.join(LOCAL_MIRROR_DIR, cdn_filename)
        cdn_url = f"{CDN_BASE_URL}/{cdn_filename}"
        
        # Skip if already exists
        if os.path.exists(local_path):
            return cdn_url
        
        # Download original image
        headers = {"User-Agent": "BANIBS-CDN-Mirror/1.0"}
        response = requests.get(image_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Optimize and save
        optimized_data = _optimize_image(response.content)
        
        with open(local_path, "wb") as f:
            f.write(optimized_data)
        
        print(f"Mirrored: {image_url} -> {cdn_url}")
        return cdn_url
    
    except Exception as e:
        print(f"Failed to mirror {image_url}: {e}")
        return image_url  # Return original on failure


async def mirror_all_images():
    """
    Find all NewsItems with external imageUrls, mirror them to CDN,
    and update the database with new CDN URLs.
    """
    mongo_url = os.environ.get('MONGO_URL')
    db_name = os.environ.get('DB_NAME')
    
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    news_collection = db.news_items
    
    try:
        # Find items with external images (not already CDN-hosted)
        query = {
            "imageUrl": {"$exists": True, "$ne": None},
            "$nor": [
                {"imageUrl": {"$regex": f"^{CDN_BASE_URL}"}},
                {"imageUrl": {"$in": list(FALLBACK_IMAGES.values())}}
            ]
        }
        
        items = await news_collection.find(query, {"_id": 0}).to_list(length=None)
        
        mirrored_count = 0
        failed_count = 0
        
        for item in items:
            original_url = item.get("imageUrl")
            if not original_url:
                continue
            
            # Mirror the image
            cdn_url = _download_and_mirror_image(original_url)
            
            if cdn_url and cdn_url != original_url:
                # Update database with new CDN URL
                await news_collection.update_one(
                    {"id": item["id"]},
                    {"$set": {"imageUrl": cdn_url}}
                )
                mirrored_count += 1
            else:
                failed_count += 1
        
        return {
            "total_processed": len(items),
            "mirrored_successfully": mirrored_count,
            "failed_or_skipped": failed_count,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
    
    finally:
        client.close()


def main():
    """CLI entry point for manual mirror operations"""
    import asyncio
    result = asyncio.run(mirror_all_images())
    print(f"Mirror complete: {result}")


if __name__ == "__main__":
    main()