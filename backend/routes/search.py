"""
Unified Search Routes - Phase 6.2.4
Cross-module search endpoint
"""

from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel
import re

from db.connection import get_db

router = APIRouter(prefix="/api/search", tags=["search"])


class SearchResultItem(BaseModel):
    id: str
    type: str
    title: str
    summary: str
    thumbnail: Optional[str] = None
    category: Optional[str] = None
    published_at: Optional[str] = None
    link: str
    metadata: Optional[Dict[str, Any]] = {}


class SearchCategoryResults(BaseModel):
    count: int
    items: List[SearchResultItem]
    has_more: bool


class SearchResponse(BaseModel):
    query: str
    total_results: int
    categories: Dict[str, SearchCategoryResults]


def create_search_regex(query: str) -> str:
    """Create case-insensitive regex pattern for search"""
    # Escape special regex characters but allow spaces
    escaped = re.escape(query)
    return f".*{escaped}.*"


async def search_news(query: str, limit: int = 5) -> SearchCategoryResults:
    """Search news articles"""
    db = await get_db()
    collection = db["news_items"]
    
    regex_pattern = create_search_regex(query)
    
    # Search in title, summary, and category
    query_filter = {
        "$or": [
            {"title": {"$regex": regex_pattern, "$options": "i"}},
            {"summary": {"$regex": regex_pattern, "$options": "i"}},
            {"category": {"$regex": regex_pattern, "$options": "i"}}
        ]
    }
    
    # Get total count
    total_count = await collection.count_documents(query_filter)
    
    # Get limited results
    cursor = collection.find(query_filter).sort("published_at", -1).limit(limit)
    items = []
    
    async for item in cursor:
        items.append(SearchResultItem(
            id=item.get("id", str(item["_id"])),
            type="news",
            title=item["title"],
            summary=item.get("summary", "")[:150],
            thumbnail=item.get("imageUrl", "/static/img/fallbacks/news_default.jpg"),
            category=item.get("category", "News"),
            published_at=item.get("published_at").isoformat() if item.get("published_at") else None,
            link=f"/world-news/{item['id']}",
            metadata={"region": item.get("region")}
        ))
    
    return SearchCategoryResults(
        count=total_count,
        items=items,
        has_more=total_count > limit
    )


async def search_opportunities(query: str, limit: int = 5) -> SearchCategoryResults:
    """Search opportunities"""
    db = await get_db()
    collection = db["opportunities"]
    
    regex_pattern = create_search_regex(query)
    
    # Search in title, description, type, and tags
    query_filter = {
        "status": "approved",
        "$or": [
            {"title": {"$regex": regex_pattern, "$options": "i"}},
            {"description": {"$regex": regex_pattern, "$options": "i"}},
            {"type": {"$regex": regex_pattern, "$options": "i"}},
            {"tags": {"$regex": regex_pattern, "$options": "i"}}
        ]
    }
    
    total_count = await collection.count_documents(query_filter)
    cursor = collection.find(query_filter).sort("created_at", -1).limit(limit)
    items = []
    
    async for item in cursor:
        items.append(SearchResultItem(
            id=item.get("id", str(item["_id"])),
            type="opportunity",
            title=item["title"],
            summary=item.get("description", "")[:150],
            thumbnail=item.get("thumbnail") or "/static/img/fallbacks/news_default.jpg",
            category=item.get("type", "Opportunity"),
            published_at=item.get("created_at").isoformat() if item.get("created_at") else None,
            link=f"/opportunities/{item.get('id', str(item['_id']))}",
            metadata={"deadline": item.get("deadline")}
        ))
    
    return SearchCategoryResults(
        count=total_count,
        items=items,
        has_more=total_count > limit
    )


async def search_resources(query: str, limit: int = 5) -> SearchCategoryResults:
    """Search resources"""
    db = await get_db()
    collection = db["banibs_resources"]
    
    regex_pattern = create_search_regex(query)
    
    # Search in title, description, tags, and category
    query_filter = {
        "$or": [
            {"title": {"$regex": regex_pattern, "$options": "i"}},
            {"description": {"$regex": regex_pattern, "$options": "i"}},
            {"tags": {"$regex": regex_pattern, "$options": "i"}},
            {"category": {"$regex": regex_pattern, "$options": "i"}}
        ]
    }
    
    total_count = await collection.count_documents(query_filter)
    cursor = collection.find(query_filter).sort("created_at", -1).limit(limit)
    items = []
    
    async for item in cursor:
        items.append(SearchResultItem(
            id=item.get("id", str(item["_id"])),
            type="resource",
            title=item["title"],
            summary=item.get("description", "")[:150],
            thumbnail=item.get("thumbnail_url") or "/static/img/fallbacks/news_default.jpg",
            category=item.get("category", "Resource"),
            published_at=item.get("created_at").isoformat() if item.get("created_at") else None,
            link=f"/resources/{item['id']}",
            metadata={"resource_type": item.get("type", "Article")}
        ))
    
    return SearchCategoryResults(
        count=total_count,
        items=items,
        has_more=total_count > limit
    )


async def search_events(query: str, limit: int = 5) -> SearchCategoryResults:
    """Search events"""
    db = await get_db()
    collection = db["banibs_events"]
    
    regex_pattern = create_search_regex(query)
    
    # Search in title, description, tags, category, and location
    query_filter = {
        "$or": [
            {"title": {"$regex": regex_pattern, "$options": "i"}},
            {"description": {"$regex": regex_pattern, "$options": "i"}},
            {"tags": {"$regex": regex_pattern, "$options": "i"}},
            {"category": {"$regex": regex_pattern, "$options": "i"}},
            {"location_name": {"$regex": regex_pattern, "$options": "i"}}
        ]
    }
    
    total_count = await collection.count_documents(query_filter)
    cursor = collection.find(query_filter).sort("start_date", 1).limit(limit)
    items = []
    
    async for item in cursor:
        location = item.get("location_name") or ("Virtual" if item.get("event_type") == "Virtual" else "TBA")
        
        items.append(SearchResultItem(
            id=item.get("id", str(item["_id"])),
            type="event",
            title=item["title"],
            summary=item.get("description", "")[:150],
            thumbnail=item.get("image_url") or "/static/img/fallbacks/news_default.jpg",
            category=item.get("category", "Event"),
            published_at=item.get("start_date").isoformat() if item.get("start_date") else None,
            link=f"/events/{item['id']}",
            metadata={
                "event_date": item.get("start_date").isoformat() if item.get("start_date") else None,
                "location": location,
                "event_type": item.get("event_type")
            }
        ))
    
    return SearchCategoryResults(
        count=total_count,
        items=items,
        has_more=total_count > limit
    )


async def search_businesses(query: str, limit: int = 5) -> SearchCategoryResults:
    """Search businesses"""
    db = await get_db()
    collection = db["business_listings"]
    
    regex_pattern = create_search_regex(query)
    
    # Search in name, description, category, tags, city, and state
    query_filter = {
        "status": "approved",
        "$or": [
            {"name": {"$regex": regex_pattern, "$options": "i"}},
            {"description": {"$regex": regex_pattern, "$options": "i"}},
            {"category": {"$regex": regex_pattern, "$options": "i"}},
            {"tags": {"$regex": regex_pattern, "$options": "i"}},
            {"city": {"$regex": regex_pattern, "$options": "i"}},
            {"state": {"$regex": regex_pattern, "$options": "i"}}
        ]
    }
    
    total_count = await collection.count_documents(query_filter)
    cursor = collection.find(query_filter).sort("created_at", -1).limit(limit)
    items = []
    
    async for item in cursor:
        location_parts = []
        if item.get("city"):
            location_parts.append(item["city"])
        if item.get("state"):
            location_parts.append(item["state"])
        location = ", ".join(location_parts) if location_parts else "Location TBA"
        
        items.append(SearchResultItem(
            id=item.get("id", str(item["_id"])),
            type="business",
            title=item["name"],
            summary=item.get("description", "")[:150],
            thumbnail=item.get("logo_url") or "/static/img/fallbacks/news_default.jpg",
            category=item.get("category", "Business"),
            published_at=item.get("created_at").isoformat() if item.get("created_at") else None,
            link=f"/business/directory/{item.get('id', str(item['_id']))}",
            metadata={"location": location}
        ))
    
    return SearchCategoryResults(
        count=total_count,
        items=items,
        has_more=total_count > limit
    )


@router.get("", response_model=SearchResponse)
async def unified_search(
    q: str = Query(..., min_length=2, description="Search query (minimum 2 characters)"),
    type: str = Query("all", description="Limit to specific type: all, news, opportunity, resource, event, business"),
    limit: int = Query(5, ge=1, le=100, description="Items per category")
):
    """
    Unified search across all BANIBS modules
    
    - **q**: Search query (required, min 2 characters)
    - **type**: Limit search to specific content type (optional)
    - **limit**: Maximum results per category (default 5)
    
    Returns grouped results in fixed order: News → Opportunities → Resources → Events → Businesses
    """
    
    # Sanitize query
    query = q.strip()
    
    if len(query) < 2:
        return SearchResponse(
            query=query,
            total_results=0,
            categories={
                "news": SearchCategoryResults(count=0, items=[], has_more=False),
                "opportunities": SearchCategoryResults(count=0, items=[], has_more=False),
                "resources": SearchCategoryResults(count=0, items=[], has_more=False),
                "events": SearchCategoryResults(count=0, items=[], has_more=False),
                "businesses": SearchCategoryResults(count=0, items=[], has_more=False)
            }
        )
    
    # Perform searches in parallel (or sequentially based on type filter)
    results = {}
    
    if type in ["all", "news"]:
        results["news"] = await search_news(query, limit)
    else:
        results["news"] = SearchCategoryResults(count=0, items=[], has_more=False)
    
    if type in ["all", "opportunity"]:
        results["opportunities"] = await search_opportunities(query, limit)
    else:
        results["opportunities"] = SearchCategoryResults(count=0, items=[], has_more=False)
    
    if type in ["all", "resource"]:
        results["resources"] = await search_resources(query, limit)
    else:
        results["resources"] = SearchCategoryResults(count=0, items=[], has_more=False)
    
    if type in ["all", "event"]:
        results["events"] = await search_events(query, limit)
    else:
        results["events"] = SearchCategoryResults(count=0, items=[], has_more=False)
    
    if type in ["all", "business"]:
        results["businesses"] = await search_businesses(query, limit)
    else:
        results["businesses"] = SearchCategoryResults(count=0, items=[], has_more=False)
    
    # Calculate total results
    total_results = sum(cat.count for cat in results.values())
    
    return SearchResponse(
        query=query,
        total_results=total_results,
        categories=results
    )
