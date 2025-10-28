from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional, List, Dict, Any
import os
from datetime import datetime, timezone

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
news_collection = db.news_articles

async def get_latest_news(limit: int = 20) -> List[Dict[str, Any]]:
    """
    Get latest news articles sorted by published_at
    
    Args:
        limit: Maximum number of articles to return
    
    Returns:
        List of news articles
    """
    articles = await news_collection.find(
        {},
        {"_id": 0}
    ).sort("published_at", -1).limit(limit).to_list(length=limit)
    
    return articles

async def get_news_by_category(category: str, limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get news articles by category
    
    Args:
        category: Category to filter by
        limit: Maximum number to return
    
    Returns:
        List of news articles in that category
    """
    articles = await news_collection.find(
        {"category": category},
        {"_id": 0}
    ).sort("published_at", -1).limit(limit).to_list(length=limit)
    
    return articles

async def get_trending_news(limit: int = 4) -> List[Dict[str, Any]]:
    """
    Get trending news (sorted by view_count + share_count)
    
    Args:
        limit: Maximum number to return
    
    Returns:
        List of trending articles
    """
    # Sort by combined engagement score
    articles = await news_collection.aggregate([
        {
            "$addFields": {
                "engagement_score": {"$add": ["$view_count", {"$multiply": ["$share_count", 2]}]}
            }
        },
        {"$sort": {"engagement_score": -1}},
        {"$limit": limit},
        {"$project": {"_id": 0}}
    ]).to_list(length=limit)
    
    return articles

async def increment_view_count(article_id: str) -> bool:
    """
    Increment view count for an article
    
    Args:
        article_id: Article UUID
    
    Returns:
        True if updated
    """
    result = await news_collection.update_one(
        {"id": article_id},
        {"$inc": {"view_count": 1}}
    )
    return result.modified_count > 0
