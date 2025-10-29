from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional
from datetime import datetime
import os
import hashlib

from db.news import get_latest_news
from models.news import NewsItemPublic, NewsItemDB
from middleware.auth_guard import get_current_user, require_role
from motor.motor_asyncio import AsyncIOMotorClient

# -------------------------------------------------
# BANIBS NEWS CONTRACT (DO NOT REMOVE)
#
# This file defines:
# - Public news APIs consumed by the homepage
# - Editorial controls for featured story
#
# Rules:
# 1. /api/news/latest MUST return de-duplicated stories.
#    We absolutely do not show the same TechCrunch or Essence
#    headline twice in Latest Stories. That looks amateur.
#
# 2. Each unique story is defined by its fingerprint.
#    If fingerprint is missing, we fall back to sourceName + title.
#
# 3. /api/news/featured MUST return exactly one "hero" story
#    where isFeatured == True, OR {} if none is set.
#
# 4. RSS sync logic lives in tasks/rss_sync.py (not here).
#
# If you change these endpoints, you are changing public homepage
# behavior. Treat that as a product decision, not "cleanup."
# -------------------------------------------------
router = APIRouter(prefix="/api/news", tags=["news"])

# Database connection for routes
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
news_collection = db.news_items

def make_dedupe_key(item):
    """Create deduplication key - fingerprint preferred, fallback to sourceName::title"""
    if item.get('fingerprint'):
        return item['fingerprint']
    # Fallback for older items without fingerprint
    source = item.get('sourceName', 'unknown')
    title = item.get('title', 'untitled')
    return f"{source}::{title}"

@router.get("/latest", response_model=List[NewsItemPublic])
async def get_latest_news_feed():
    """
    Get latest news items for homepage feed with deduplication
    
    We intentionally over-fetch (LIMIT 50) and then collapse duplicates
    in Python, because during ingestion we may occasionally store the
    same story twice if the sync ran at the same time from two places.

    Deduplication key priority:
    1. fingerprint (stable SHA256(sourceName + "::" + title))
    2. fallback: sourceName + "::" + title
    
    This endpoint feeds the 'Latest Stories' section on the homepage.
    Returns empty array [] if no news items exist.
    """
    # Pull buffer of recent stories (newest first) to dedupe
    items = await news_collection.find(
        {},
        {"_id": 0}
    ).sort("publishedAt", -1).limit(50).to_list(length=None)
    
    if not items:
        return []
    
    # Deduplicate by fingerprint/sourceName+title
    seen_keys = set()
    unique_items = []
    
    for item in items:
        dedupe_key = make_dedupe_key(item)
        
        # Skip if we've already added this story
        if dedupe_key in seen_keys:
            continue
        seen_keys.add(dedupe_key)
        
        # Convert datetime to ISO string if needed
        if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
            item['publishedAt'] = item['publishedAt'].isoformat()
            
        unique_items.append(NewsItemPublic(**item))
        
        # Stop once we have enough to render the homepage
        if len(unique_items) >= 10:
            break
    
    return unique_items

@router.get("/featured")
async def get_featured_news():
    """
    Get the most recent featured news item for homepage hero
    
    Returns exactly one featured story or empty object if none exists.
    This is a public endpoint - no authentication required.
    
    Used by: Homepage "Featured Story" hero section
    """
    # Find most recent featured item
    item = await news_collection.find_one(
        {"isFeatured": True},
        {"_id": 0}
    )
    
    if not item:
        # Return empty object if no featured story exists
        return {}
    
    # Convert datetime to ISO string
    if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
        item['publishedAt'] = item['publishedAt'].isoformat()
    
    return NewsItemPublic(**item)

@router.post("/seed-dev")
async def seed_dev_news():
    """
    DEV ONLY: Insert sample news items for testing
    
    This endpoint creates sample news stories with real external source links.
    Protected by environment check - only works in development.
    
    Usage: POST http://localhost:8001/api/news/seed-dev
    """
    # ENV protection - only allow in development
    app_env = os.getenv("APP_ENV", "development")
    if app_env not in ["development", "dev", "local"]:
        raise HTTPException(
            status_code=403,
            detail="Seed endpoint not allowed in this environment"
        )
    
    sample_items = [
        {
            "title": "New Grant Program Supports Black-Owned Startups",
            "summary": "A $5M initiative aims to fund Black entrepreneurs across North America, focusing on early-stage product development and community hiring.",
            "category": "Business",
            "imageUrl": "https://images.unsplash.com/photo-1556155092-490a1ba16284?w=800&q=80",
            "sourceUrl": "https://www.blackenterprise.com/black-owned-startups-grant-program/",
            "publishedAt": datetime(2025, 10, 27, 15, 0, 0),
            "isFeatured": True
        },
        {
            "title": "Scholarship Fund Opens Applications for Fall 2025",
            "summary": "Full-ride STEM scholarships for Black and Indigenous students. Covers tuition, housing, and mentorship programs.",
            "category": "Education",
            "imageUrl": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
            "sourceUrl": "https://www.scholarships.com/financial-aid/college-scholarships/scholarships-by-type/minority-scholarships/",
            "publishedAt": datetime(2025, 10, 28, 13, 30, 0),
            "isFeatured": False
        },
        {
            "title": "Annual Black Business Summit Announces 2025 Dates",
            "summary": "Connect with investors, suppliers, and fellow founders this October. Vendor tables and pitch slots are limited.",
            "category": "Community",
            "imageUrl": "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
            "sourceUrl": "https://www.blackwallstreet.org/events",
            "publishedAt": datetime(2025, 10, 26, 20, 45, 0),
            "isFeatured": False
        },
        {
            "title": "Tech Apprenticeship Program Launches in Major Cities",
            "summary": "Free coding bootcamp with guaranteed job placement for Black youth. 12-week intensive program covers web development, data science, and cybersecurity.",
            "category": "Education",
            "imageUrl": "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&q=80",
            "sourceUrl": "https://www.techcrunch.com/diversity-in-tech/",
            "publishedAt": datetime(2025, 10, 25, 10, 0, 0),
            "isFeatured": False
        },
        {
            "title": "Black-Owned Coffee Shop Chain Expands to 50 Cities",
            "summary": "Community-driven coffee brand opens 15 new locations this quarter, creating 300 jobs and supporting local artists.",
            "category": "Business",
            "imageUrl": "https://images.unsplash.com/photo-1511920170033-f8396924c348?w=800&q=80",
            "sourceUrl": "https://www.forbes.com/sites/forbescontentmarketing/black-owned-businesses/",
            "publishedAt": datetime(2025, 10, 24, 14, 20, 0),
            "isFeatured": False
        },
        {
            "title": "Community Land Trust Secures $10M for Affordable Housing",
            "summary": "New initiative will create 200 affordable homes in historically Black neighborhoods, preventing displacement and building generational wealth.",
            "category": "Community",
            "imageUrl": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80",
            "sourceUrl": "https://www.urban.org/policy-centers/housing-finance-policy-center",
            "publishedAt": datetime(2025, 10, 23, 9, 15, 0),
            "isFeatured": False
        }
    ]
    
    # Convert to NewsItemDB models
    news_items = [NewsItemDB(**item) for item in sample_items]
    
    # Insert into MongoDB
    items_dict = [item.dict() for item in news_items]
    result = await news_collection.insert_many(items_dict)
    
    return {
        "inserted": len(result.inserted_ids),
        "ids": [str(id) for id in result.inserted_ids],
        "message": "Sample news items created successfully"
    }

# ==========================================
# ADMIN ENDPOINTS (Protected by JWT + Role)
# ==========================================

@router.get("/admin/all", response_model=List[NewsItemPublic])
async def get_all_news_admin(current_user: dict = Depends(require_role(["super_admin", "moderator"]))):
    """
    ADMIN ONLY: Get all news items sorted by published date
    
    Requires JWT token with super_admin or moderator role.
    Used for admin dashboard news management.
    """
    items = await news_collection.find(
        {},
        {"_id": 0}
    ).sort("publishedAt", -1).to_list(length=None)
    
    # Convert datetime to ISO string for each item
    result = []
    for item in items:
        if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
            item['publishedAt'] = item['publishedAt'].isoformat()
        result.append(NewsItemPublic(**item))
    
    return result

@router.patch("/admin/{news_id}/feature")
async def feature_news_item(
    news_id: str,
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    ADMIN ONLY: Set a news item as featured
    
    Sets isFeatured=true for specified item and false for all others.
    This ensures only one story is featured at a time.
    
    Requires JWT token with super_admin or moderator role.
    """
    # Check if item exists
    item = await news_collection.find_one({"id": news_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="News item not found")
    
    # Unfeature all items
    await news_collection.update_many(
        {},
        {"$set": {"isFeatured": False}}
    )
    
    # Feature the specified item
    await news_collection.update_one(
        {"id": news_id},
        {"$set": {"isFeatured": True}}
    )
    
    return {
        "success": True,
        "message": f"News item {news_id} is now featured",
        "featuredId": news_id
    }

@router.delete("/admin/clear-dev")
async def clear_dev_news():
    """
    DEV ONLY: Clear all news items
    
    Removes all news from the database for reseeding.
    Protected by environment check - only works in development.
    
    Usage: DELETE http://localhost:8001/api/news/admin/clear-dev
    """
    # ENV protection - only allow in development
    app_env = os.getenv("APP_ENV", "development")
    if app_env not in ["development", "dev", "local"]:
        raise HTTPException(
            status_code=403,
            detail="Clear endpoint not allowed in this environment"
        )
    
    result = await news_collection.delete_many({})
    
    return {
        "success": True,
        "deleted": result.deleted_count,
        "message": f"Cleared {result.deleted_count} news items"
    }

# ==========================================
# CATEGORY-BASED NEWS ENDPOINTS
# ==========================================

@router.get("/category/{category_slug}", response_model=List[NewsItemPublic])
async def get_news_by_category(category_slug: str):
    """
    Get news items by category for specialized pages (e.g., World News)
    
    Args:
        category_slug: URL-friendly category name (e.g., "world-news", "business", "technology")
    
    Returns:
        Array of news items from the specified category, newest first.
        Uses deduplication like /latest endpoint.
    
    Examples:
        GET /api/news/category/world-news -> All world news articles
        GET /api/news/category/business -> All business articles
        GET /api/news/category/technology -> All technology articles
    """
    # Convert slug to category name (world-news -> World News)
    category = category_slug.replace("-", " ").title()
    
    # Fetch items from this category (more items for dedicated pages)
    items = await news_collection.find(
        {"category": {"$regex": f"^{category}$", "$options": "i"}},
        {"_id": 0}
    ).sort("publishedAt", -1).limit(60).to_list(length=None)
    
    if not items:
        return []
    
    # Apply same deduplication logic as /latest
    seen_keys = set()
    unique_items = []
    
    for item in items:
        dedupe_key = make_dedupe_key(item)
        
        # Skip if we've already added this story
        if dedupe_key in seen_keys:
            continue
        seen_keys.add(dedupe_key)
        
        # Convert datetime to ISO string if needed
        if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
            item['publishedAt'] = item['publishedAt'].isoformat()
            
        unique_items.append(NewsItemPublic(**item))
        
        # Limit to 50 unique items for category pages
        if len(unique_items) >= 50:
            break
    
    return unique_items

@router.delete("/admin/{news_id}")
async def delete_news_item(
    news_id: str,
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    ADMIN ONLY: Delete a news item
    
    Permanently removes the news item from the database.
    Use this for legally risky content, mistakes, or expired stories.
    
    Requires JWT token with super_admin or moderator role.
    """
    result = await news_collection.delete_one({"id": news_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="News item not found")
    
    return {
        "success": True,
        "message": f"News item {news_id} deleted successfully",
        "deletedId": news_id
    }
