"""
BANIBS Diaspora Connect Portal - Database Operations
Phase 12.0
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List, Dict
from datetime import datetime
from uuid import uuid4


class DiasporaDB:
    """Database operations for Diaspora Connect Portal"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.regions = db.diaspora_regions
        self.stories = db.diaspora_stories
        self.businesses = db.diaspora_businesses
        self.education = db.diaspora_education
        self.snapshots = db.diaspora_snapshots
    
    # ==================== REGIONS ====================
    
    async def get_regions(self) -> List[Dict]:
        """Get all diaspora regions"""
        regions = await self.regions.find({}, {"_id": 0}).to_list(100)
        return regions
    
    async def get_region_by_id(self, region_id: str) -> Optional[Dict]:
        """Get a specific region by ID"""
        region = await self.regions.find_one({"id": region_id}, {"_id": 0})
        return region
    
    async def get_region_by_slug(self, slug: str) -> Optional[Dict]:
        """Get a region by slug"""
        region = await self.regions.find_one({"slug": slug}, {"_id": 0})
        return region
    
    async def create_region(self, region_data: Dict) -> Dict:
        """Create a new region (used in seeding)"""
        region = {
            "id": str(uuid4()),
            **region_data,
            "created_at": datetime.utcnow()
        }
        await self.regions.insert_one(region)
        return {k: v for k, v in region.items() if k != "_id"}
    
    # ==================== STORIES ====================
    
    async def get_stories(
        self,
        origin_region_id: Optional[str] = None,
        current_region_id: Optional[str] = None,
        limit: int = 50
    ) -> List[Dict]:
        """Get diaspora stories with optional filters"""
        query = {}
        if origin_region_id:
            query["origin_region_id"] = origin_region_id
        if current_region_id:
            query["current_region_id"] = current_region_id
        
        stories = await self.stories.find(query, {"_id": 0})\
            .sort("created_at", -1)\
            .limit(limit)\
            .to_list(limit)
        
        # Enrich stories with region names
        for story in stories:
            if story.get("origin_region_id"):
                origin = await self.get_region_by_id(story["origin_region_id"])
                if origin:
                    story["origin_region_name"] = origin["name"]
            
            if story.get("current_region_id"):
                current = await self.get_region_by_id(story["current_region_id"])
                if current:
                    story["current_region_name"] = current["name"]
        
        return stories
    
    async def get_story_by_id(self, story_id: str) -> Optional[Dict]:
        """Get a specific story by ID"""
        story = await self.stories.find_one({"id": story_id}, {"_id": 0})
        return story
    
    async def create_story(
        self,
        user_id: str,
        title: str,
        content: str,
        origin_region_id: Optional[str] = None,
        current_region_id: Optional[str] = None,
        anonymous: bool = False,
        author_name: Optional[str] = None,
        author_avatar: Optional[str] = None
    ) -> Dict:
        """Create a new diaspora story"""
        story = {
            "id": str(uuid4()),
            "user_id": user_id,
            "title": title,
            "content": content,
            "origin_region_id": origin_region_id,
            "current_region_id": current_region_id,
            "anonymous": anonymous,
            "created_at": datetime.utcnow()
        }
        
        # Only add author info if not anonymous
        if not anonymous:
            story["author_name"] = author_name
            story["author_avatar"] = author_avatar
        
        await self.stories.insert_one(story)
        return {k: v for k, v in story.items() if k != "_id"}
    
    async def delete_story(self, story_id: str, user_id: str) -> bool:
        """Delete a story (only by owner or admin)"""
        result = await self.stories.delete_one({
            "id": story_id,
            "user_id": user_id
        })
        return result.deleted_count > 0
    
    # ==================== BUSINESSES ====================
    
    async def get_businesses(
        self,
        region_id: Optional[str] = None,
        business_type: Optional[str] = None,
        country: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict]:
        """Get diaspora businesses with optional filters"""
        query = {}
        if region_id:
            query["region_id"] = region_id
        if business_type:
            query["type"] = business_type
        if country:
            query["country"] = country
        
        businesses = await self.businesses.find(query, {"_id": 0})\
            .sort("created_at", -1)\
            .limit(limit)\
            .to_list(limit)
        
        # Enrich businesses with region names
        for business in businesses:
            if business.get("region_id"):
                region = await self.get_region_by_id(business["region_id"])
                if region:
                    business["region_name"] = region["name"]
        
        return businesses
    
    async def get_business_by_id(self, business_id: str) -> Optional[Dict]:
        """Get a specific business by ID"""
        business = await self.businesses.find_one({"id": business_id}, {"_id": 0})
        return business
    
    async def create_business(self, business_data: Dict) -> Dict:
        """Create a new diaspora business"""
        business = {
            "id": str(uuid4()),
            **business_data,
            "created_at": datetime.utcnow()
        }
        await self.businesses.insert_one(business)
        return {k: v for k, v in business.items() if k != "_id"}
    
    # ==================== EDUCATION ====================
    
    async def get_education_articles(self, limit: int = 50) -> List[Dict]:
        """Get all education articles"""
        articles = await self.education.find({}, {"_id": 0})\
            .sort("created_at", -1)\
            .limit(limit)\
            .to_list(limit)
        return articles
    
    async def get_education_article_by_id(self, article_id: str) -> Optional[Dict]:
        """Get a specific education article by ID"""
        article = await self.education.find_one({"id": article_id}, {"_id": 0})
        return article
    
    async def create_education_article(self, article_data: Dict) -> Dict:
        """Create a new education article"""
        article = {
            "id": str(uuid4()),
            **article_data,
            "created_at": datetime.utcnow()
        }
        await self.education.insert_one(article)
        return {k: v for k, v in article.items() if k != "_id"}
    
    # ==================== SNAPSHOTS ====================
    
    async def get_snapshot_by_user_id(self, user_id: str) -> Optional[Dict]:
        """Get the latest snapshot for a user"""
        snapshot = await self.snapshots.find_one(
            {"user_id": user_id},
            {"_id": 0}
        )
        
        # Enrich with region names
        if snapshot:
            if snapshot.get("current_region_id"):
                current = await self.get_region_by_id(snapshot["current_region_id"])
                if current:
                    snapshot["current_region_name"] = current["name"]
            
            if snapshot.get("origin_region_id"):
                origin = await self.get_region_by_id(snapshot["origin_region_id"])
                if origin:
                    snapshot["origin_region_name"] = origin["name"]
            
            if snapshot.get("aspiration_region_id"):
                aspiration = await self.get_region_by_id(snapshot["aspiration_region_id"])
                if aspiration:
                    snapshot["aspiration_region_name"] = aspiration["name"]
        
        return snapshot
    
    async def create_or_update_snapshot(
        self,
        user_id: str,
        current_region_id: str,
        origin_region_id: Optional[str] = None,
        aspiration_region_id: Optional[str] = None
    ) -> Dict:
        """Create or update a user's diaspora snapshot"""
        # Check if snapshot already exists
        existing = await self.snapshots.find_one({"user_id": user_id})
        
        snapshot_data = {
            "user_id": user_id,
            "current_region_id": current_region_id,
            "origin_region_id": origin_region_id,
            "aspiration_region_id": aspiration_region_id,
            "created_at": datetime.utcnow()
        }
        
        if existing:
            # Update existing snapshot
            await self.snapshots.update_one(
                {"user_id": user_id},
                {"$set": snapshot_data}
            )
            snapshot = {"id": existing["id"], **snapshot_data}
        else:
            # Create new snapshot
            snapshot = {
                "id": str(uuid4()),
                **snapshot_data
            }
            await self.snapshots.insert_one(snapshot)
        
        return {k: v for k, v in snapshot.items() if k != "_id"}
