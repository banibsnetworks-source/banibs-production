"""
BANIBS Circles - Database Layer
Phase 11.5.3
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List, Dict


class CirclesDB:
    """Database operations for Circles"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.circles = db.circles
        self.circle_members = db.circle_members
        self.circle_posts = db.circle_posts
    
    # ==================== CIRCLES ====================
    
    async def get_circles(
        self,
        pillar: Optional[str] = None,
        disability_type: Optional[str] = None,
        audience: Optional[str] = None,
        featured_only: bool = False,
        privacy_level: Optional[str] = None,
        tags: Optional[List[str]] = None,
        limit: int = 50
    ) -> List[Dict]:
        """Get circles with filters"""
        query = {"is_active": True}
        
        if pillar:
            query["pillar"] = pillar
        
        if disability_type:
            query["primary_disability_type"] = disability_type
        
        if audience:
            query["audience"] = {"$in": [audience, "both"]}
        
        if featured_only:
            query["is_featured_in_ability"] = True
        
        if privacy_level:
            query["privacy_level"] = privacy_level
        
        if tags and len(tags) > 0:
            query["tags"] = {"$in": tags}
        
        circles = await self.circles.find(
            query,
            {"_id": 0}
        ).sort("member_count", -1).limit(limit).to_list(limit)
        
        return circles
    
    async def get_circle_by_id(self, circle_id: str) -> Optional[Dict]:
        """Get a specific circle by ID"""
        circle = await self.circles.find_one(
            {"id": circle_id, "is_active": True},
            {"_id": 0}
        )
        return circle
    
    async def get_circle_by_slug(self, slug: str) -> Optional[Dict]:
        """Get a specific circle by slug"""
        circle = await self.circles.find_one(
            {"slug": slug, "is_active": True},
            {"_id": 0}
        )
        return circle
    
    async def get_suggested_circles(
        self,
        disability_type: Optional[str] = None,
        audience: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict]:
        """Get suggested circles based on user preferences"""
        query = {"is_active": True, "pillar": "ability"}
        
        if disability_type and disability_type != "all":
            query["$or"] = [
                {"primary_disability_type": disability_type},
                {"primary_disability_type": "all"}
            ]
        
        if audience:
            query["audience"] = {"$in": [audience, "both"]}
        
        circles = await self.circles.find(
            query,
            {"_id": 0}
        ).sort([("is_featured_in_ability", -1), ("member_count", -1)]).limit(limit).to_list(limit)
        
        return circles
    
    async def increment_member_count(self, circle_id: str):
        """Increment member count"""
        await self.circles.update_one(
            {"id": circle_id},
            {"$inc": {"member_count": 1}}
        )
    
    async def increment_post_count(self, circle_id: str):
        """Increment post count"""
        await self.circles.update_one(
            {"id": circle_id},
            {"$inc": {"post_count": 1}}
        )
    
    # ==================== MEMBERS ====================
    
    async def get_circle_members(
        self,
        circle_id: str,
        limit: int = 50
    ) -> List[Dict]:
        """Get members of a circle"""
        members = await self.circle_members.find(
            {"circle_id": circle_id, "status": "active"},
            {"_id": 0}
        ).sort("joined_at", -1).limit(limit).to_list(limit)
        
        return members
    
    async def get_member(self, circle_id: str, user_id: str) -> Optional[Dict]:
        """Get a specific member"""
        member = await self.circle_members.find_one(
            {"circle_id": circle_id, "user_id": user_id},
            {"_id": 0}
        )
        return member
    
    # ==================== POSTS ====================
    
    async def get_circle_posts(
        self,
        circle_id: str,
        limit: int = 20
    ) -> List[Dict]:
        """Get posts in a circle"""
        posts = await self.circle_posts.find(
            {"circle_id": circle_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return posts
