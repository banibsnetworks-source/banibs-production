"""
BANIBS Ability Network - Database Layer
Phase 11.5
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional, List, Dict


class AbilityDB:
    """Database operations for Ability Network"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        # Collections
        self.resources = db.ability_resources
        self.providers = db.ability_providers  # Phase 11.5.2
    
    # ==================== RESOURCES (Phase 11.5.1) ====================
    
    async def get_resources(
        self,
        category: Optional[str] = None,
        disability_type: Optional[str] = None,
        age_group: Optional[str] = None,
        format: Optional[str] = None,
        region: Optional[str] = None,
        cost_range: Optional[str] = None,
        verified_only: bool = False,
        approved_only: bool = True,
        limit: int = 50
    ) -> List[Dict]:
        """Get ability resources with filters"""
        query = {}
        
        # Only show approved resources by default
        if approved_only:
            query["is_approved"] = True
        
        if verified_only:
            query["is_verified"] = True
        
        if category:
            query["category"] = category
        
        if disability_type:
            query["disability_types"] = disability_type
        
        if age_group:
            query["age_groups"] = age_group
        
        if format:
            query["format"] = format
        
        if region:
            query["region"] = region
        
        if cost_range:
            query["cost_range"] = cost_range
        
        resources = await self.resources.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return resources
    
    async def get_resource_by_slug(self, slug: str) -> Optional[Dict]:
        """Get a specific resource by slug"""
        resource = await self.resources.find_one(
            {"slug": slug},
            {"_id": 0}
        )
        return resource
    
    async def get_featured_resources(self, limit: int = 6) -> List[Dict]:
        """Get featured resources"""
        resources = await self.resources.find(
            {"is_featured": True, "is_approved": True},
            {"_id": 0}
        ).limit(limit).to_list(limit)
        
        return resources
    
    async def increment_resource_views(self, resource_id: str):
        """Increment view count for a resource"""
        await self.resources.update_one(
            {"id": resource_id},
            {"$inc": {"view_count": 1}}
        )
    
    async def increment_helpful_count(self, resource_id: str):
        """Increment helpful count"""
        await self.resources.update_one(
            {"id": resource_id},
            {"$inc": {"helpful_count": 1}}
        )
    
    # ==================== PROVIDERS (Phase 11.5.2) ====================
    
    async def get_providers(
        self,
        provider_type: Optional[str] = None,
        disability_type: Optional[str] = None,
        region: Optional[str] = None,
        telehealth: Optional[bool] = None,
        verified_only: bool = False,
        approved_only: bool = True,  # Phase 11.5.4 - Filter unapproved
        limit: int = 50
    ) -> List[Dict]:
        """Get ability providers with filters"""
        query = {}
        
        # Phase 11.5.4 - Only show approved providers by default
        if approved_only:
            query["is_approved"] = True
        
        if verified_only:
            query["is_verified"] = True
        
        if provider_type:
            query["provider_type"] = provider_type
        
        if disability_type:
            query["disability_types_served"] = disability_type
        
        if region:
            query["region"] = region
        
        if telehealth is not None:
            query["telehealth_available"] = telehealth
        
        providers = await self.providers.find(
            query,
            {"_id": 0}
        ).sort("name", 1).limit(limit).to_list(limit)
        
        return providers
    
    async def get_provider_by_id(self, provider_id: str) -> Optional[Dict]:
        """Get a specific provider by ID"""
        provider = await self.providers.find_one(
            {"id": provider_id},
            {"_id": 0}
        )
        return provider
