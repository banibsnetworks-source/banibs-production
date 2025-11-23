"""
BANIBS Community Life Hub - Database Layer
Phase 11.6-11.9
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Optional
from datetime import datetime
from uuid import uuid4


class CommunityDB:
    """Database operations for Community Life Hub"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        # Collections
        self.tags = db.community_tags
        self.pros = db.community_pros
        # Health
        self.health_resources = db.health_resources
        self.health_providers = db.health_providers
        # Fitness
        self.fitness_programs = db.fitness_programs
        # Food
        self.recipes = db.recipes
        # School
        self.school_resources = db.school_resources
    
    # ==================== SHARED OPERATIONS ====================
    
    async def get_all_tags(self, pillar: Optional[str] = None) -> List[Dict]:
        """Get all community tags, optionally filtered by pillar"""
        query = {"pillar": pillar} if pillar else {}
        tags = await self.tags.find(query, {"_id": 0}).to_list(1000)
        return tags
    
    async def get_all_pros(
        self,
        pillar: Optional[str] = None,
        role: Optional[str] = None,
        region: Optional[str] = None,
        verified_only: bool = False
    ) -> List[Dict]:
        """Get community professionals with filters"""
        query = {}
        
        if pillar:
            query["pillar_focus"] = pillar
        if role:
            query["role"] = role
        if region:
            query["region"] = region
        if verified_only:
            query["is_verified"] = True
        
        pros = await self.pros.find(query, {"_id": 0}).sort("name", 1).to_list(1000)
        return pros
    
    # ==================== HEALTH OPERATIONS ====================
    
    async def get_health_resources(
        self,
        category: Optional[str] = None,
        tags: Optional[List[str]] = None,
        limit: int = 50
    ) -> List[Dict]:
        """Get health resources with optional filters"""
        query = {}
        
        if category:
            query["category"] = category
        if tags:
            query["tags"] = {"$in": tags}
        
        resources = await self.health_resources.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return resources
    
    async def get_health_resource_by_slug(self, slug: str) -> Optional[Dict]:
        """Get health resource by slug"""
        resource = await self.health_resources.find_one({"slug": slug}, {"_id": 0})
        return resource
    
    async def create_health_resource(self, data: dict) -> Dict:
        """Create a new health resource"""
        resource_data = {
            "id": f"health-{str(uuid4())[:8]}",
            **data,
            "view_count": 0,
            "is_featured": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await self.health_resources.insert_one(resource_data)
        resource_data.pop("_id", None)
        return resource_data
    
    async def get_health_providers(
        self,
        type: Optional[str] = None,
        region: Optional[str] = None,
        city: Optional[str] = None,
        telehealth: Optional[bool] = None,
        black_owned: Optional[bool] = None,
        limit: int = 50
    ) -> List[Dict]:
        """Get health providers with filters"""
        query = {}
        
        if type:
            query["type"] = type
        if region:
            query["region"] = region
        if city:
            query["city"] = city
        if telehealth is not None:
            query["telehealth"] = telehealth
        if black_owned is not None:
            query["is_black_owned"] = black_owned
        
        providers = await self.health_providers.find(
            query,
            {"_id": 0}
        ).sort("name", 1).limit(limit).to_list(limit)
        
        return providers
    
    # ==================== FITNESS OPERATIONS ====================
    
    async def get_fitness_programs(
        self,
        level: Optional[str] = None,
        focus: Optional[List[str]] = None,
        delivery: Optional[str] = None,
        chronic_friendly: Optional[List[str]] = None,
        limit: int = 50
    ) -> List[Dict]:
        """Get fitness programs with filters"""
        query = {}
        
        if level:
            query["level"] = level
        if focus:
            query["focus"] = {"$in": focus}
        if delivery:
            query["delivery"] = delivery
        if chronic_friendly:
            query["chronic_friendly"] = {"$in": chronic_friendly}
        
        programs = await self.fitness_programs.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return programs
    
    async def get_fitness_program_by_id(self, program_id: str) -> Optional[Dict]:
        """Get fitness program by ID"""
        program = await self.fitness_programs.find_one({"id": program_id}, {"_id": 0})
        return program
    
    async def create_fitness_program(self, data: dict) -> Dict:
        """Create a new fitness program"""
        program_data = {
            "id": f"fitness-{str(uuid4())[:8]}",
            **data,
            "participants_count": 0,
            "is_featured": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await self.fitness_programs.insert_one(program_data)
        program_data.pop("_id", None)
        return program_data
    
    # ==================== FOOD OPERATIONS ====================
    
    async def get_recipes(
        self,
        category: Optional[str] = None,
        origin_region: Optional[str] = None,
        difficulty: Optional[str] = None,
        tags: Optional[List[str]] = None,
        approved_only: bool = True,
        limit: int = 50
    ) -> List[Dict]:
        """Get recipes with filters"""
        query = {}
        
        if approved_only:
            query["is_approved"] = True
        if category:
            query["category"] = category
        if origin_region:
            query["origin_region"] = origin_region
        if difficulty:
            query["difficulty"] = difficulty
        if tags:
            query["tags"] = {"$in": tags}
        
        recipes = await self.recipes.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return recipes
    
    async def get_recipe_by_slug(self, slug: str) -> Optional[Dict]:
        """Get recipe by slug"""
        recipe = await self.recipes.find_one({"slug": slug}, {"_id": 0})
        return recipe
    
    async def create_recipe(self, data: dict, is_user_submitted: bool = False) -> Dict:
        """Create a new recipe"""
        recipe_data = {
            "id": f"recipe-{str(uuid4())[:8]}",
            **data,
            "is_family_submitted": is_user_submitted,
            "is_approved": not is_user_submitted,  # Auto-approve staff recipes
            "view_count": 0,
            "saved_count": 0,
            "is_featured": False,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await self.recipes.insert_one(recipe_data)
        recipe_data.pop("_id", None)
        return recipe_data
    
    async def approve_recipe(self, recipe_id: str) -> Optional[Dict]:
        """Approve a user-submitted recipe"""
        result = await self.recipes.find_one_and_update(
            {"id": recipe_id},
            {
                "$set": {
                    "is_approved": True,
                    "updated_at": datetime.utcnow().isoformat()
                }
            },
            return_document=True
        )
        
        if result:
            result.pop("_id", None)
        return result
    
    # ==================== SCHOOL OPERATIONS ====================
    
    async def get_school_resources(
        self,
        type: Optional[str] = None,
        subject: Optional[List[str]] = None,
        age_range: Optional[str] = None,
        format: Optional[str] = None,
        cost_range: Optional[str] = None,
        verified_only: bool = False,
        limit: int = 50
    ) -> List[Dict]:
        """Get school resources with filters"""
        query = {}
        
        if verified_only:
            query["is_verified"] = True
        if type:
            query["type"] = type
        if subject:
            query["subject"] = {"$in": subject}
        if age_range:
            query["age_range"] = age_range
        if format:
            query["format"] = format
        if cost_range:
            query["cost_range"] = cost_range
        
        resources = await self.school_resources.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return resources
    
    async def get_school_resource_by_slug(self, slug: str) -> Optional[Dict]:
        """Get school resource by slug"""
        resource = await self.school_resources.find_one({"slug": slug}, {"_id": 0})
        return resource
    
    async def create_school_resource(self, data: dict) -> Dict:
        """Create a new school resource"""
        resource_data = {
            "id": f"school-{str(uuid4())[:8]}",
            **data,
            "is_verified": False,
            "is_featured": False,
            "total_reviews": 0,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        await self.school_resources.insert_one(resource_data)
        resource_data.pop("_id", None)
        return resource_data
