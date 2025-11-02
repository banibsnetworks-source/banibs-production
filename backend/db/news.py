from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any
import os

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
news_collection = db.news_items

# Fallback image URL for news items without images
FALLBACK_IMAGE_URL = "/static/img/fallbacks/news_default.jpg"

async def get_latest_news(limit: int = 10) -> List[Dict[str, Any]]:
    """
    Get latest news items sorted by publishedAt descending
    Ensures every item has an imageUrl (uses fallback if not present)
    
    Args:
        limit: Maximum number of items to return (default 10)
    
    Returns:
        List of news items with guaranteed imageUrl
    """
    items = await news_collection.find(
        {},
        {"_id": 0}
    ).sort("publishedAt", -1).limit(limit).to_list(length=limit)
    
    # Ensure every item has an imageUrl
    for item in items:
        if not item.get("imageUrl"):
            item["imageUrl"] = FALLBACK_IMAGE_URL
    
    return items
