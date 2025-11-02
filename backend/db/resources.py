"""
Resources Database Operations
Phase 6.2.3 - Resources & Events
"""

from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone
import os
import uuid

client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
resources_collection = db.banibs_resources


async def create_resource(
    title: str,
    description: str,
    category: str,
    resource_type: str,
    author_id: str,
    author_name: str,
    content: Optional[str] = None,
    external_url: Optional[str] = None,
    thumbnail_url: Optional[str] = None,
    video_url: Optional[str] = None,
    tags: List[str] = None,
    featured: bool = False
) -> Dict[str, Any]:
    """Create a new resource"""
    resource = {
        "id": str(uuid.uuid4()),
        "title": title,
        "description": description,
        "category": category,
        "type": resource_type,
        "content": content,
        "external_url": external_url,
        "thumbnail_url": thumbnail_url,
        "video_url": video_url,
        "tags": tags or [],
        "author_id": author_id,
        "author_name": author_name,
        "view_count": 0,
        "featured": featured,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc),
        "published_at": datetime.now(timezone.utc)
    }
    
    await resources_collection.insert_one(resource)
    return resource


async def get_resources(
    category: Optional[str] = None,
    resource_type: Optional[str] = None,
    tags: Optional[List[str]] = None,
    featured: Optional[bool] = None,
    search: Optional[str] = None,
    limit: int = 20,
    skip: int = 0
) -> tuple[List[Dict[str, Any]], int]:
    """Get resources with filtering and pagination"""
    query = {"published_at": {"$ne": None}}  # Only published resources
    
    if category:
        query["category"] = category
    if resource_type:
        query["type"] = resource_type
    if tags:
        query["tags"] = {"$in": tags}
    if featured is not None:
        query["featured"] = featured
    if search:
        query["$or"] = [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await resources_collection.count_documents(query)
    
    # Get paginated results
    resources = await resources_collection.find(
        query,
        {"_id": 0}
    ).sort("published_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    return resources, total


async def get_resource_by_id(resource_id: str) -> Optional[Dict[str, Any]]:
    """Get a single resource by ID and increment view count"""
    # Increment view count
    await resources_collection.update_one(
        {"id": resource_id},
        {"$inc": {"view_count": 1}}
    )
    
    resource = await resources_collection.find_one(
        {"id": resource_id},
        {"_id": 0}
    )
    
    return resource


async def update_resource(
    resource_id: str,
    update_data: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """Update a resource"""
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await resources_collection.update_one(
        {"id": resource_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        return None
    
    return await resources_collection.find_one({"id": resource_id}, {"_id": 0})


async def delete_resource(resource_id: str) -> bool:
    """Delete a resource"""
    result = await resources_collection.delete_one({"id": resource_id})
    return result.deleted_count > 0


async def get_resource_count() -> int:
    """Get total count of published resources"""
    return await resources_collection.count_documents({"published_at": {"$ne": None}})
