from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any
import os

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
news_collection = db.news_items

async def get_latest_news(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get latest news items sorted by publishedAt descending
    
    Args:
        limit: Maximum number of items to return (default 10)
    
    Returns:
        List of news items
    """
    items = await news_collection.find(
        {},
        {"_id": 0}
    ).sort("publishedAt", -1).limit(limit).to_list(length=limit)
    
    return items
