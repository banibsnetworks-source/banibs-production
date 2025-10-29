"""
Database operations for BANIBS TV / Featured Media
"""

from motor.motor_asyncio import AsyncIOMotorClient
import os
from typing import List, Optional, Dict, Any

# Database connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
featured_media_collection = db.featured_media

async def get_featured_media() -> Optional[Dict[str, Any]]:
    """Get the current featured media item (isFeatured=True)"""
    return await featured_media_collection.find_one(
        {"isFeatured": True},
        {"_id": 0}
    )

async def get_latest_media_with_thumbnail() -> Optional[Dict[str, Any]]:
    """Get latest media item that has a thumbnail"""
    return await featured_media_collection.find_one(
        {"thumbnailUrl": {"$ne": None}},
        {"_id": 0},
        sort=[("publishedAt", -1)]
    )

async def get_all_featured_media(limit: int = 20) -> List[Dict[str, Any]]:
    """Get all featured media items for admin management"""
    items = await featured_media_collection.find(
        {},
        {"_id": 0}
    ).sort("publishedAt", -1).limit(limit).to_list(length=None)
    
    return items

async def create_featured_media(media_data: Dict[str, Any]) -> str:
    """Create a new featured media item"""
    result = await featured_media_collection.insert_one(media_data)
    return str(result.inserted_id)

async def update_featured_media(media_id: str, updates: Dict[str, Any]) -> bool:
    """Update a featured media item"""
    result = await featured_media_collection.update_one(
        {"id": media_id},
        {"$set": updates}
    )
    return result.modified_count > 0

async def set_featured_media(media_id: str) -> bool:
    """Set one media item as featured (and unfeature all others)"""
    # Unfeature all items
    await featured_media_collection.update_many(
        {},
        {"$set": {"isFeatured": False}}
    )
    
    # Feature the specified item
    result = await featured_media_collection.update_one(
        {"id": media_id},
        {"$set": {"isFeatured": True}}
    )
    
    return result.modified_count > 0

async def delete_featured_media(media_id: str) -> bool:
    """Delete a featured media item"""
    result = await featured_media_collection.delete_one({"id": media_id})
    return result.deleted_count > 0