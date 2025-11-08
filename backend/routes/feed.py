"""
Feed Aggregation Routes - Phase 6.2.4
Unified feed endpoint that aggregates content from multiple sources
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta, timezone
from pydantic import BaseModel

from db.connection import get_db
from services.heavy_content_service import is_heavy_content, get_banner_message

router = APIRouter(prefix="/api/feed", tags=["feed"])


class FeedItem(BaseModel):
    id: str
    type: str  # news, opportunity, resource, event, business
    title: str
    summary: str
    link: str
    thumbnail: Optional[str] = None
    created_at: str
    metadata: Optional[Dict[str, Any]] = {}


class FeedResponse(BaseModel):
    items: List[FeedItem]
    total: int
    page: int
    pages: int


def get_date_filter(date_range: str) -> Optional[datetime]:
    """Calculate the datetime cutoff based on date range"""
    now = datetime.now(timezone.utc)
    
    if date_range == "today":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    elif date_range == "week":
        return now - timedelta(days=7)
    elif date_range == "month":
        return now - timedelta(days=30)
    else:  # "all"
        return None


async def fetch_news_items(date_cutoff: Optional[datetime], limit: int) -> List[FeedItem]:
    """Fetch news items for feed"""
    db = await get_db()
    collection = db["news_items"]
    
    query = {}
    if date_cutoff:
        query["published_at"] = {"$gte": date_cutoff}
    
    cursor = collection.find(query).sort("published_at", -1).limit(limit)
    items = []
    
    async for item in cursor:
        items.append(FeedItem(
            id=item["id"],
            type="news",
            title=item["title"],
            summary=item["summary"][:200] if item.get("summary") else "",
            link=f"/world-news/{item['id']}",
            thumbnail=item.get("imageUrl", "/static/img/fallbacks/news_default.jpg"),
            created_at=item.get("published_at", item.get("created_at", datetime.now(timezone.utc))).isoformat(),
            metadata={
                "category": item.get("category", "General"),
                "region": item.get("region"),
                "sentiment_label": item.get("sentiment_label"),
                "sentiment_score": item.get("sentiment_score")
            }
        ))
    
    return items


async def fetch_opportunity_items(date_cutoff: Optional[datetime], limit: int) -> List[FeedItem]:
    """Fetch opportunities for feed"""
    db = await get_db()
    collection = db["opportunities"]
    
    query = {"status": "approved"}
    if date_cutoff:
        query["created_at"] = {"$gte": date_cutoff}
    
    cursor = collection.find(query).sort("created_at", -1).limit(limit)
    items = []
    
    async for item in cursor:
        items.append(FeedItem(
            id=item.get("id", str(item["_id"])),  # Use id if exists, else _id
            type="opportunity",
            title=item["title"],
            summary=item.get("description", "")[:200],
            link=f"/opportunities/{item.get('id', str(item['_id']))}",
            thumbnail=item.get("thumbnail") or "/static/img/fallbacks/news_default.jpg",
            created_at=item.get("created_at", datetime.now(timezone.utc)).isoformat(),
            metadata={
                "type": item.get("type", "Job"),
                "deadline": item.get("deadline")
            }
        ))
    
    return items


async def fetch_resource_items(date_cutoff: Optional[datetime], limit: int) -> List[FeedItem]:
    """Fetch resources for feed"""
    db = await get_db()
    collection = db["banibs_resources"]
    
    query = {}
    if date_cutoff:
        created_field = "created_at"
        query[created_field] = {"$gte": date_cutoff}
    
    cursor = collection.find(query).sort("created_at", -1).limit(limit)
    items = []
    
    async for item in cursor:
        items.append(FeedItem(
            id=item["id"],
            type="resource",
            title=item["title"],
            summary=item.get("description", "")[:200],
            link=f"/resources/{item['id']}",
            thumbnail=item.get("thumbnail_url") or "/static/img/fallbacks/news_default.jpg",
            created_at=item.get("created_at", datetime.now(timezone.utc)).isoformat(),
            metadata={
                "category": item.get("category", "General"),
                "type": item.get("type", "Article"),
                "sentiment_label": item.get("sentiment_label"),
                "sentiment_score": item.get("sentiment_score")
            }
        ))
    
    return items


async def fetch_event_items(date_cutoff: Optional[datetime], limit: int) -> List[FeedItem]:
    """Fetch events for feed (upcoming only by default)"""
    db = await get_db()
    collection = db["banibs_events"]
    
    now = datetime.now(timezone.utc)
    query = {"start_date": {"$gte": now}}  # Only upcoming events
    
    if date_cutoff:
        query["created_at"] = {"$gte": date_cutoff}
    
    cursor = collection.find(query).sort("start_date", 1).limit(limit)  # Sort by event date
    items = []
    
    async for item in cursor:
        items.append(FeedItem(
            id=item["id"],
            type="event",
            title=item["title"],
            summary=item.get("description", "")[:200],
            link=f"/events/{item['id']}",
            thumbnail=item.get("image_url") or "/static/img/fallbacks/news_default.jpg",
            created_at=item.get("created_at", datetime.now(timezone.utc)).isoformat(),
            metadata={
                "category": item.get("category", "Event"),
                "event_date": item.get("start_date").isoformat() if item.get("start_date") else None,
                "location": item.get("location_name") or ("Virtual" if item.get("event_type") == "Virtual" else None)
            }
        ))
    
    return items


async def fetch_business_items(date_cutoff: Optional[datetime], limit: int) -> List[FeedItem]:
    """Fetch businesses for feed"""
    db = await get_db()
    collection = db["business_listings"]
    
    query = {"status": "approved"}
    if date_cutoff:
        query["created_at"] = {"$gte": date_cutoff}
    
    cursor = collection.find(query).sort("created_at", -1).limit(limit)
    items = []
    
    async for item in cursor:
        location = []
        if item.get("city"):
            location.append(item["city"])
        if item.get("state"):
            location.append(item["state"])
        location_str = ", ".join(location) if location else "Location TBA"
        
        items.append(FeedItem(
            id=item.get("id", str(item["_id"])),  # Use id if exists, else _id
            type="business",
            title=item["name"],
            summary=item.get("description", "")[:200],
            link=f"/business/directory/{item.get('id', str(item['_id']))}",
            thumbnail=item.get("logo_url") or "/static/img/fallbacks/news_default.jpg",
            created_at=item.get("created_at", datetime.now(timezone.utc)).isoformat(),
            metadata={
                "category": item.get("category", "Business"),
                "location": location_str
            }
        ))
    
    return items


@router.get("", response_model=FeedResponse)
async def get_unified_feed(
    type: str = Query("all", description="Filter by content type: all, news, opportunity, resource, event, business"),
    date_range: str = Query("all", description="Filter by date: today, week, month, all"),
    limit: int = Query(20, ge=1, le=100, description="Items per page"),
    page: int = Query(1, ge=1, description="Page number")
):
    """
    Get unified feed aggregating content from multiple sources
    
    - **type**: Filter by content type (all, news, opportunity, resource, event, business)
    - **date_range**: Filter by date (today, week, month, all)
    - **limit**: Number of items per page (1-100, default 20)
    - **page**: Page number (default 1)
    """
    
    date_cutoff = get_date_filter(date_range)
    all_items = []
    
    # Determine which sources to query based on type filter
    if type in ["all", "news"]:
        news_items = await fetch_news_items(date_cutoff, limit if type == "news" else limit // 5)
        all_items.extend(news_items)
    
    if type in ["all", "opportunity"]:
        opportunity_items = await fetch_opportunity_items(date_cutoff, limit if type == "opportunity" else limit // 5)
        all_items.extend(opportunity_items)
    
    if type in ["all", "resource"]:
        resource_items = await fetch_resource_items(date_cutoff, limit if type == "resource" else limit // 5)
        all_items.extend(resource_items)
    
    if type in ["all", "event"]:
        event_items = await fetch_event_items(date_cutoff, limit if type == "event" else limit // 5)
        all_items.extend(event_items)
    
    if type in ["all", "business"]:
        business_items = await fetch_business_items(date_cutoff, limit if type == "business" else limit // 5)
        all_items.extend(business_items)
    
    # Sort all items by created_at (newest first)
    all_items.sort(key=lambda x: x.created_at, reverse=True)
    
    # Apply pagination
    total = len(all_items)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_items = all_items[start_idx:end_idx]
    
    pages = (total + limit - 1) // limit if total > 0 else 1
    
    return FeedResponse(
        items=paginated_items,
        total=total,
        page=page,
        pages=pages
    )
