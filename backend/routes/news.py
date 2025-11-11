from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from datetime import datetime
import os
import hashlib

from db.news import get_latest_news
from models.news import NewsItemPublic, NewsItemDB
from middleware.auth_guard import get_current_user, require_role
from motor.motor_asyncio import AsyncIOMotorClient
from services.heavy_content_service import enrich_item_with_banner_data

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
    # Fallback image URL for items without images
    FALLBACK_IMAGE = "/static/img/fallbacks/news_default.jpg"
    
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
        
        # Ensure every item has an imageUrl (use fallback if missing)
        if not item.get('imageUrl'):
            item['imageUrl'] = FALLBACK_IMAGE
        
        # Convert datetime to ISO string if needed
        if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
            item['publishedAt'] = item['publishedAt'].isoformat()
        
        # Convert sentiment_at to ISO string if needed (Phase 6.3)
        if 'sentiment_at' in item and hasattr(item['sentiment_at'], 'isoformat'):
            item['sentiment_at'] = item['sentiment_at'].isoformat()
        
        # Phase 6.6 - Enrich with heavy content banner data
        enrich_item_with_banner_data(item)
            
        unique_items.append(NewsItemPublic(**item))
        
        # Stop once we have enough to render the homepage
        if len(unique_items) >= 10:
            break
    
    return unique_items

@router.get("/featured")
async def get_featured_news():
    """
    Get the most recent featured news item for homepage hero
    
    Prioritizes items with valid images from featured sources.
    Query logic:
    1. Look for manually featured items (isFeatured: True) with valid images
    2. If none, look for recent items from featured sources with valid images
    3. If still none, return empty object (frontend will show SVG fallback)
    
    Returns exactly one featured story or empty object if none exists.
    This is a public endpoint - no authentication required.
    
    Used by: Homepage "Featured Story" hero section
    """
    from config.rss_sources import RSS_SOURCES
    
    # Get list of featured source names
    featured_source_names = [
        source['source_name'] 
        for source in RSS_SOURCES 
        if source.get('featured_source', False) and source.get('active', False)
    ]
    
    # Try 1: Look for manually featured item with valid image (not CDN)
    item = await news_collection.find_one(
        {
            "isFeatured": True,
            "imageUrl": {"$exists": True, "$ne": None, "$ne": ""},
            "imageUrl": {"$not": {"$regex": "cdn.banibs.com"}},  # Exclude broken CDN URLs
            "sourceUrl": {"$exists": True, "$ne": None, "$ne": ""}
        },
        {"_id": 0}
    )
    
    # Try 2: If no manually featured item, look for recent item from featured sources
    if not item and featured_source_names:
        item = await news_collection.find_one(
            {
                "sourceName": {"$in": featured_source_names},
                "imageUrl": {"$exists": True, "$ne": None, "$ne": ""},
                "imageUrl": {"$not": {"$regex": "cdn.banibs.com"}},  # Exclude broken CDN URLs
                "sourceUrl": {"$exists": True, "$ne": None, "$ne": ""}
            },
            {"_id": 0},
            sort=[("publishedAt", -1)]  # Most recent first
        )
    
    # Try 3: If still nothing, look for ANY recent item with valid image
    if not item:
        item = await news_collection.find_one(
            {
                "imageUrl": {"$exists": True, "$ne": None, "$ne": ""},
                "imageUrl": {"$not": {"$regex": "cdn.banibs.com"}},  # Exclude broken CDN URLs
                "sourceUrl": {"$exists": True, "$ne": None, "$ne": ""}
            },
            {"_id": 0},
            sort=[("publishedAt", -1)]  # Most recent first
        )
    
    if not item:
        # Return empty object if no featured story exists
        # Frontend will show SVG fallback
        return {}
    
    # Convert datetime to ISO string
    if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
        item['publishedAt'] = item['publishedAt'].isoformat()
    
    # Convert sentiment_at to ISO string if needed (Phase 6.3)
    if 'sentiment_at' in item and hasattr(item['sentiment_at'], 'isoformat'):
        item['sentiment_at'] = item['sentiment_at'].isoformat()
    
    # Phase 6.6 - Enrich with heavy content banner data
    enrich_item_with_banner_data(item)
    
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
async def get_all_news_admin(current_user: dict = Depends(require_role("super_admin", "moderator"))):
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
        
        # Phase 6.6 - Enrich with heavy content banner data
        enrich_item_with_banner_data(item)
        
        result.append(NewsItemPublic(**item))
    
    return result

@router.patch("/admin/{news_id}/feature")
async def feature_news_item(
    news_id: str,
    current_user: dict = Depends(require_role("super_admin", "moderator"))
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
async def get_news_by_category(category_slug: str, region: Optional[str] = Query(None)):
    """
    Get news items by category with optional region filtering
    
    Args:
        category_slug: URL-friendly category name (e.g., "world-news", "business", "technology")
        region: Optional geographic region filter (e.g., "Africa", "Europe", "Global")
    
    Returns:
        Array of news items from the specified category, newest first.
        Uses deduplication like /latest endpoint.
    
    Examples:
        GET /api/news/category/world-news -> All world news articles
        GET /api/news/category/world-news?region=Africa -> Africa-focused stories only
        GET /api/news/category/world-news?region=Europe -> European coverage
        GET /api/news/category/business -> All business articles
    """
    # Fallback image URL for items without images
    FALLBACK_IMAGE = "/static/img/fallbacks/news_default.jpg"
    
    # Convert slug to category name (world-news -> World News)
    category = category_slug.replace("-", " ").title()
    
    # Build MongoDB query with optional region filter
    query = {"category": {"$regex": f"^{category}$", "$options": "i"}}
    
    if region:
        query["region"] = {"$regex": f"^{region}$", "$options": "i"}
    
    # Fetch items from this category (more items for dedicated pages)
    items = await news_collection.find(
        query,
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
        
        # Ensure every item has an imageUrl (use fallback if missing)
        if not item.get('imageUrl'):
            item['imageUrl'] = FALLBACK_IMAGE
        
        # Convert datetime to ISO string if needed
        if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
            item['publishedAt'] = item['publishedAt'].isoformat()
        
        # Convert sentiment_at to ISO string if needed (Phase 6.3)
        if 'sentiment_at' in item and hasattr(item['sentiment_at'], 'isoformat'):
            item['sentiment_at'] = item['sentiment_at'].isoformat()
        
        # Phase 6.6 - Enrich with heavy content banner data
        enrich_item_with_banner_data(item)
            
        unique_items.append(NewsItemPublic(**item))
        
        # Limit to 50 unique items for category pages
        if len(unique_items) >= 50:
            break
    
    return unique_items

@router.delete("/admin/{news_id}")
async def delete_news_item(
    news_id: str,
    current_user: dict = Depends(require_role("super_admin", "moderator"))
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

# ==========================================
# PHASE 6.2 - ENGAGEMENT ANALYTICS ENDPOINTS
# ==========================================

# ==========================================
# PHASE 7.6.1 - CNN-STYLE HOMEPAGE ENDPOINT
# ==========================================

@router.get("/homepage")
async def get_homepage_news():
    """
    Get structured news data for CNN-style homepage (Phase 7.6.1)
    
    Returns a structured payload with:
    - hero: Featured story with full details (1 item)
    - top_stories: Top stories across all sections (6 items)
    - sections: News items organized by section (us, world, business, tech, sports)
    - banibs_tv: Featured video for BANIBS TV (1 item)
    
    This endpoint aggregates and categorizes news from the database,
    intelligently sorting stories into sections based on category, region,
    and source metadata.
    
    Used by: CNN-style news homepage at /
    """
    from services.news_categorization_service import sort_items_by_section
    from db.featured_media import get_featured_media, get_latest_media_with_thumbnail
    
    # Fallback image URL for items without images
    FALLBACK_IMAGE = "/static/img/fallbacks/news_default.jpg"
    
    # Fetch recent news items (over-fetch for categorization)
    items = await news_collection.find(
        {},
        {"_id": 0}
    ).sort("publishedAt", -1).limit(100).to_list(length=None)
    
    if not items:
        # Return empty structure if no news exists
        return {
            "hero": None,
            "top_stories": [],
            "sections": {
                "us": [],
                "world": [],
                "business": [],
                "tech": [],
                "sports": []
            },
            "banibs_tv": None
        }
    
    # Deduplicate items
    seen_keys = set()
    unique_items = []
    
    for item in items:
        dedupe_key = make_dedupe_key(item)
        
        if dedupe_key in seen_keys:
            continue
        seen_keys.add(dedupe_key)
        
        # Ensure every item has an imageUrl
        if not item.get('imageUrl'):
            item['imageUrl'] = FALLBACK_IMAGE
        
        # Convert datetime to ISO string
        if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
            item['publishedAt'] = item['publishedAt'].isoformat()
        
        if 'sentiment_at' in item and hasattr(item['sentiment_at'], 'isoformat'):
            item['sentiment_at'] = item['sentiment_at'].isoformat()
        
        # Enrich with heavy content banner data
        enrich_item_with_banner_data(item)
        
        unique_items.append(item)
    
    # Sort items into sections
    categorized = sort_items_by_section(unique_items)
    
    # Extract hero story
    hero = categorized['hero'][0] if categorized['hero'] else None
    
    # Get top stories
    top_stories = categorized['top_stories']
    
    # Build sections object
    sections = {
        'us': categorized['us'][:12],  # Limit per section
        'world': categorized['world'][:12],
        'business': categorized['business'][:12],
        'tech': categorized['tech'][:12],
        'sports': categorized['sports'][:12]
    }
    
    # Get BANIBS TV featured video
    banibs_tv = None
    media = await get_featured_media()
    if not media:
        media = await get_latest_media_with_thumbnail()
    
    if media:
        # Convert datetime to ISO string
        if 'publishedAt' in media and hasattr(media['publishedAt'], 'isoformat'):
            media['publishedAt'] = media['publishedAt'].isoformat()
        banibs_tv = media
    
    # Phase 7.6.4 - Add trending and sentiment summary
    from services.trending_service import get_trending_items, compute_sentiment_summary
    
    # Get global trending items
    trending_items = get_trending_items(unique_items, section='all', limit=10)
    
    # Compute sentiment summary
    sentiment_summary = compute_sentiment_summary(unique_items)
    
    return {
        "hero": hero,
        "top_stories": top_stories,
        "sections": sections,
        "banibs_tv": banibs_tv,
        "trending": {
            "section": "all",
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "items": trending_items
        },
        "sentiment_summary": sentiment_summary
    }


# ==========================================
# PHASE 7.6.3 - SECTION-SPECIFIC ENDPOINT
# ==========================================

VALID_SECTIONS = {
    "top-stories", "us", "world", "politics", "healthwatch", "moneywatch",
    "entertainment", "crime", "sports", "culture", "science-tech",
    "civil-rights", "business", "education"
}

@router.get("/section")
async def get_news_section(
    section: str = Query(..., description="Section key, e.g. 'us', 'world'"),
    page: int = Query(1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(20, ge=1, le=50, description="Items per page"),
    sentiment: Optional[str] = Query(None, description="Filter by sentiment: positive, neutral, negative"),
    region: Optional[str] = Query(None, description="Filter by region")
):
    """
    Get news items for a specific section with pagination (Phase 7.6.3)
    
    Returns section-scoped news data with:
    - section: Section identifier
    - label: Display name for section
    - page, page_size, total_items, total_pages: Pagination metadata
    - lead_story: Top story for hero display (or null)
    - featured: Array of 3-4 key stories for featured grid
    - items: Paginated list of section stories
    
    Sections: us, world, politics, healthwatch, moneywatch, entertainment,
              crime, sports, culture, science-tech, civil-rights, business, education
    """
    from services.news_categorization_service import (
        filter_items_by_section,
        paginate_items,
        get_section_display_name
    )
    
    # Validate section
    if section not in VALID_SECTIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid section. Valid sections: {', '.join(VALID_SECTIONS)}"
        )
    
    # Fallback image URL
    FALLBACK_IMAGE = "/static/img/fallbacks/news_default.jpg"
    
    # Fetch news items from database
    items = await news_collection.find(
        {},
        {"_id": 0}
    ).sort("publishedAt", -1).limit(200).to_list(length=None)
    
    if not items:
        return {
            "section": section,
            "label": get_section_display_name(section),
            "page": page,
            "page_size": page_size,
            "total_items": 0,
            "total_pages": 0,
            "lead_story": None,
            "featured": [],
            "items": []
        }
    
    # Deduplicate items
    seen_keys = set()
    unique_items = []
    
    for item in items:
        dedupe_key = make_dedupe_key(item)
        if dedupe_key in seen_keys:
            continue
        seen_keys.add(dedupe_key)
        
        # Ensure imageUrl
        if not item.get('imageUrl'):
            item['imageUrl'] = FALLBACK_IMAGE
        
        # Convert datetime to ISO string
        if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
            item['publishedAt'] = item['publishedAt'].isoformat()
        if 'sentiment_at' in item and hasattr(item['sentiment_at'], 'isoformat'):
            item['sentiment_at'] = item['sentiment_at'].isoformat()
        
        # Enrich with heavy content banner
        enrich_item_with_banner_data(item)
        
        unique_items.append(item)
    
    # Filter by section
    filtered_items = filter_items_by_section(unique_items, section)
    
    # Apply sentiment filter if provided
    if sentiment:
        filtered_items = [
            item for item in filtered_items
            if item.get('sentiment_label', '').lower() == sentiment.lower()
        ]
    
    # Apply region filter if provided
    if region:
        filtered_items = [
            item for item in filtered_items
            if item.get('region', '').lower() == region.lower()
        ]
    
    # Paginate
    paginated_items, total_items, total_pages = paginate_items(
        filtered_items, page, page_size
    )
    
    # Extract lead story and featured
    lead_story = filtered_items[0] if len(filtered_items) > 0 else None
    featured = filtered_items[1:4] if len(filtered_items) > 1 else []
    
    # Phase 7.6.4 - Add trending and sentiment summary for this section
    from services.trending_service import get_trending_items, compute_sentiment_summary
    
    # Get trending items for this section
    trending_items = get_trending_items(filtered_items, section=section, limit=10)
    
    # Compute sentiment summary for this section
    sentiment_summary = compute_sentiment_summary(filtered_items)
    
    return {
        "section": section,
        "label": get_section_display_name(section),
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "lead_story": lead_story,
        "featured": featured,
        "items": paginated_items,
        "trending": {
            "section": section,
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "items": trending_items
        },
        "sentiment_summary": sentiment_summary
    }


# ==========================================
# PHASE 7.6.4 - TRENDING ANALYTICS ENDPOINT
# ==========================================

@router.get("/trending")
async def get_trending_news_analytics(
    section: Optional[str] = Query(None, description="Optional section filter (us, world, business, etc.)"),
    limit: int = Query(10, ge=1, le=50, description="Number of trending items to return")
):
    """
    Get trending news items (Phase 7.6.4)
    
    Returns top trending stories based on recency and sentiment intensity.
    Can be filtered by section or return global trending.
    
    Query params:
    - section: Optional section filter (e.g., 'us', 'world', 'business')
    - limit: Number of items to return (default 10, max 50)
    
    Returns:
    - section: Section identifier or 'all'
    - updated_at: Timestamp of calculation
    - items: Array of trending items with trending_score
    """
    from services.trending_service import get_trending_items, compute_sentiment_summary
    
    # Fallback image URL
    FALLBACK_IMAGE = "/static/img/fallbacks/news_default.jpg"
    
    # Fetch recent news items
    items = await news_collection.find(
        {},
        {"_id": 0}
    ).sort("publishedAt", -1).limit(200).to_list(length=None)
    
    if not items:
        return {
            "section": section or "all",
            "updated_at": datetime.utcnow().isoformat() + "Z",
            "items": []
        }
    
    # Deduplicate and prepare items
    seen_keys = set()
    unique_items = []
    
    for item in items:
        dedupe_key = make_dedupe_key(item)
        if dedupe_key in seen_keys:
            continue
        seen_keys.add(dedupe_key)
        
        # Ensure imageUrl
        if not item.get('imageUrl'):
            item['imageUrl'] = FALLBACK_IMAGE
        
        # Convert datetime to ISO string
        if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
            item['publishedAt'] = item['publishedAt'].isoformat()
        if 'sentiment_at' in item and hasattr(item['sentiment_at'], 'isoformat'):
            item['sentiment_at'] = item['sentiment_at'].isoformat()
        
        # Enrich with heavy content banner
        enrich_item_with_banner_data(item)
        
        unique_items.append(item)
    
    # Get trending items (with optional section filter)
    trending_items = get_trending_items(
        unique_items,
        section=section,
        limit=limit
    )
    
    return {
        "section": section or "all",
        "updated_at": datetime.utcnow().isoformat() + "Z",
        "items": trending_items
    }


@router.get("/trending-legacy")
async def get_trending_news_legacy(region: str = "Global", limit: int = 5):
    """
    Get trending (most-clicked) news stories by region (Legacy endpoint).
    
    Args:
        region: Geographic region ("Global", "Americas", "Middle East", etc.)
        limit: Number of stories to return (default 5, max 10)
    
    Returns:
        Object with region and array of trending stories with click counts
    
    Examples:
        GET /api/news/trending?region=Americas&limit=3
        GET /api/news/trending (defaults to Global, limit 5)
    """
    from db.news_analytics import get_trending_stories
    
    # Validate limit
    if limit > 10:
        limit = 10
    elif limit < 1:
        limit = 5
    
    try:
        trending_data = await get_trending_stories(region, limit)
        
        # Format response
        stories = []
        for item in trending_data:
            # Convert datetime to ISO string if needed
            last_clicked = item.get('lastClickedAt')
            if hasattr(last_clicked, 'isoformat'):
                last_clicked = last_clicked.isoformat() + 'Z'
            elif isinstance(last_clicked, str):
                last_clicked = last_clicked
            else:
                last_clicked = datetime.utcnow().isoformat() + 'Z'
            
            stories.append({
                "storyId": item.get('storyId'),
                "title": item.get('title', 'Unknown Title'),
                "sourceName": item.get('sourceName', 'Unknown Source'),
                "region": item.get('region', region),
                "imageUrl": item.get('imageUrl'),
                "sourceUrl": item.get('sourceUrl', '#'),
                "clicks": item.get('clicks', 0),
                "lastClickedAt": last_clicked
            })
        
        return {
            "region": region,
            "stories": stories
        }
        
    except Exception:
        # Return empty but valid response on error
        return {
            "region": region,
            "stories": []
        }

@router.get("/admin/engagement-summary")
async def get_admin_engagement_summary(
    current_user: dict = Depends(require_role("super_admin", "moderator"))
):
    """
    ADMIN ONLY: Get engagement summary across all regions.
    
    Returns click statistics and top stories per region for internal analysis.
    Used for understanding which regions and stories drive most engagement.
    """
    from db.news_analytics import get_engagement_summary
    
    try:
        summary = await get_engagement_summary()
        
        # Format timestamps for JSON serialization
        for region in summary.get("regions", []):
            for story in region.get("topStories", []):
                if hasattr(story.get("lastClickedAt"), 'isoformat'):
                    story["lastClickedAt"] = story["lastClickedAt"].isoformat() + 'Z'
        
        return summary
        
    except Exception:
        return {
            "regions": [],
            "error": "Unable to fetch engagement data"
        }
