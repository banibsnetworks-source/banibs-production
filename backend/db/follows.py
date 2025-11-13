"""
Follow Database Operations - Phase B1
CRUD operations for follow relationships
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, Literal
from datetime import datetime


class FollowsDB:
    """Database operations for follow relationships"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.follows
    
    async def create_follow(
        self,
        follower_type: Literal["user", "business"],
        follower_id: str,
        target_type: Literal["user", "business"],
        target_id: str
    ) -> dict:
        """Create a follow relationship"""
        # Check if already following
        existing = await self.collection.find_one({
            "follower_type": follower_type,
            "follower_id": follower_id,
            "target_type": target_type,
            "target_id": target_id
        })
        
        if existing:
            # Already following, return existing
            existing["id"] = str(existing.pop("_id", ""))
            return existing
        
        follow = {
            "follower_type": follower_type,
            "follower_id": follower_id,
            "target_type": target_type,
            "target_id": target_id,
            "created_at": datetime.utcnow()
        }
        
        result = await self.collection.insert_one(follow)
        follow["id"] = str(result.inserted_id)
        return follow
    
    async def delete_follow(
        self,
        follower_type: str,
        follower_id: str,
        target_type: str,
        target_id: str
    ) -> bool:
        """Delete a follow relationship"""
        result = await self.collection.delete_one({
            "follower_type": follower_type,
            "follower_id": follower_id,
            "target_type": target_type,
            "target_id": target_id
        })
        return result.deleted_count > 0
    
    async def is_following(
        self,
        follower_type: str,
        follower_id: str,
        target_type: str,
        target_id: str
    ) -> bool:
        """Check if follower is following target"""
        follow = await self.collection.find_one({
            "follower_type": follower_type,
            "follower_id": follower_id,
            "target_type": target_type,
            "target_id": target_id
        })
        return follow is not None
    
    async def get_followers(
        self,
        target_type: str,
        target_id: str,
        follower_type: Optional[str] = None
    ) -> list[dict]:
        """Get all followers of a target"""
        query = {
            "target_type": target_type,
            "target_id": target_id
        }
        
        if follower_type:
            query["follower_type"] = follower_type
        
        cursor = self.collection.find(query, {"_id": 0})
        return await cursor.to_list(length=10000)
    
    async def get_following(
        self,
        follower_type: str,
        follower_id: str,
        target_type: Optional[str] = None
    ) -> list[dict]:
        """Get all entities that follower is following"""
        query = {
            "follower_type": follower_type,
            "follower_id": follower_id
        }
        
        if target_type:
            query["target_type"] = target_type
        
        cursor = self.collection.find(query, {"_id": 0})
        return await cursor.to_list(length=10000)
    
    async def get_follower_count(
        self,
        target_type: str,
        target_id: str
    ) -> int:
        """Get count of followers for a target"""
        count = await self.collection.count_documents({
            "target_type": target_type,
            "target_id": target_id
        })
        return count
    
    async def get_following_count(
        self,
        follower_type: str,
        follower_id: str
    ) -> int:
        """Get count of entities that follower is following"""
        count = await self.collection.count_documents({
            "follower_type": follower_type,
            "follower_id": follower_id
        })
        return count
