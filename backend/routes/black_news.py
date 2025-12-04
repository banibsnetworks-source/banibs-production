"""
BANIBS Black News API
Endpoint for stories centering Black people, Black nations, and the global Black diaspora
"""

from fastapi import APIRouter, Query
from typing import Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
import os

router = APIRouter(prefix="/api/news", tags=["black-news"])

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
news_collection = db.news_items


@router.get("/black")
async def get_black_news(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    focus_type: Optional[str] = Query(None, description="Filter by black_focus_type (africa, caribbean, hbcu, etc.)"),
):
    """
    Get Black News feed - stories centering Black people, Black nations, and the global Black diaspora
    
    This endpoint returns stories from across ALL topics (US, World, Business, Tech, Sports, etc.)
    that are either:
    - From Black-owned/Black-focused sources, OR
    - About Black people, communities, or issues
    
    Query params:
        page: Page number (default 1)
        page_size: Items per page (default 20, max 100)
        focus_type: Optional filter by specific Black focus type
            - africa: African nations/continent
            - caribbean: Caribbean/West Indies
            - black_us: U.S. / African American
            - diaspora: Global Black diaspora
            - hbcu: HBCUs / Black education
            - civil_rights: Civil rights / social justice
            - culture: Black culture / arts / entertainment
            - business: Black business / entrepreneurship
    
    Returns:
        {
            "items": [...],  # Black-focused news items
            "page": 1,
            "page_size": 20,
            "total_items": 150,
            "total_pages": 8,
            "focus_type": "africa"  # If filtered
        }
    """
    # Build query
    query = {"is_black_focus": True}
    
    # Optional filter by focus_type
    if focus_type:
        query["black_focus_type"] = focus_type
    
    # Get total count
    total_items = await news_collection.count_documents(query)
    
    # Calculate pagination
    skip = (page - 1) * page_size
    total_pages = (total_items + page_size - 1) // page_size
    
    # Fetch items (sorted by newest first)
    items = await news_collection.find(
        query,
        {"_id": 0}  # Exclude MongoDB _id field
    ).sort(
        "publishedAt", -1  # Newest first
    ).skip(skip).limit(page_size).to_list(page_size)
    
    # Build response
    response = {
        "items": items,
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
    }
    
    # Include focus_type in response if filtered
    if focus_type:
        response["focus_type"] = focus_type
    
    return response


@router.get("/black/stats")
async def get_black_news_stats():
    """
    Get statistics about Black News content
    
    Returns breakdown by focus_type and source counts
    """
    # Get total Black News items
    total_black_news = await news_collection.count_documents({"is_black_focus": True})
    
    # Get breakdown by focus_type
    pipeline = [
        {"$match": {"is_black_focus": True}},
        {"$group": {
            "_id": "$black_focus_type",
            "count": {"$sum": 1}
        }},
        {"$sort": {"count": -1}}
    ]
    
    focus_type_breakdown = {}
    async for doc in news_collection.aggregate(pipeline):
        focus_type = doc["_id"] or "unclassified"
        focus_type_breakdown[focus_type] = doc["count"]
    
    # Get most recent update time
    latest_item = await news_collection.find_one(
        {"is_black_focus": True},
        {"_id": 0, "publishedAt": 1},
        sort=[("publishedAt", -1)]
    )
    
    latest_update = latest_item.get("publishedAt") if latest_item else None
    
    return {
        "total_black_news_items": total_black_news,
        "focus_type_breakdown": focus_type_breakdown,
        "latest_update": latest_update,
        "timestamp": datetime.now().isoformat()
    }
