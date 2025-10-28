from fastapi import APIRouter, Depends
from typing import List

from db.news import (
    get_latest_news,
    get_news_by_category,
    get_trending_news,
    increment_view_count
)
from models.news import NewsArticlePublic, NewsLatestResponse

router = APIRouter(prefix="/api/news", tags=["news"])

@router.get("/latest", response_model=NewsLatestResponse)
async def get_latest_news_feed():
    """
    Get latest news aggregation for homepage
    
    Returns:
    - top_stories: 5 most recent articles
    - trending: 4 most engaged articles
    - featured_businesses: Business-related news
    - watch_now: Video content
    - youth_opportunities: Youth-focused content
    """
    # Get top stories (most recent, any category)
    top_stories_raw = await get_latest_news(limit=5)
    top_stories = [NewsArticlePublic(**article) for article in top_stories_raw[:5]]
    
    # Get trending (by engagement)
    trending_raw = await get_trending_news(limit=4)
    trending = [NewsArticlePublic(**article) for article in trending_raw[:4]]
    
    # Get featured businesses
    businesses_raw = await get_news_by_category("business", limit=3)
    featured_businesses = [NewsArticlePublic(**article) for article in businesses_raw[:3]]
    
    # Get video content
    videos_raw = await get_news_by_category("video", limit=3)
    watch_now = [NewsArticlePublic(**article) for article in videos_raw[:3]]
    
    # Get youth opportunities
    youth_raw = await get_news_by_category("youth", limit=3)
    youth_opportunities = [NewsArticlePublic(**article) for article in youth_raw[:3]]
    
    return NewsLatestResponse(
        top_stories=top_stories,
        trending=trending,
        featured_businesses=featured_businesses,
        watch_now=watch_now,
        youth_opportunities=youth_opportunities
    )

@router.post("/{article_id}/view")
async def track_article_view(article_id: str):
    """
    Track when an article is viewed
    Increments view count for trending calculations
    """
    success = await increment_view_count(article_id)
    return {"success": success}
