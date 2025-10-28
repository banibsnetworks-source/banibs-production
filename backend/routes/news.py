from fastapi import APIRouter
from typing import List

from db.news import get_latest_news
from models.news import NewsItemPublic

router = APIRouter(prefix="/api/news", tags=["news"])

@router.get("/latest", response_model=List[NewsItemPublic])
async def get_latest_news_feed():
    """
    Get latest news items for homepage feed
    
    Returns array of news items with:
    - id: UUID string
    - title: News headline
    - summary: Short teaser text
    - imageUrl: Optional image URL
    - publishedAt: ISO timestamp string
    - category: Category string (e.g., "Business", "Education", "Community")
    - sourceUrl: Optional external link
    
    This is a public endpoint - no authentication required.
    Returns empty array [] if no news items exist.
    """
    items = await get_latest_news(limit=10)
    
    # Convert datetime to ISO string for each item
    result = []
    for item in items:
        # Convert publishedAt to ISO string if it's a datetime object
        if 'publishedAt' in item and hasattr(item['publishedAt'], 'isoformat'):
            item['publishedAt'] = item['publishedAt'].isoformat()
        result.append(NewsItemPublic(**item))
    
    return result
