"""
Business Members Database Operations - Phase B1
CRUD operations for business team members
"""

from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from datetime import datetime


class BusinessMembersDB:
    """Database operations for business members"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        self.collection = db.business_members
    
    async def create_member(
        self,
        business_id: str,
        user_id: str,
        role: str,
        status: str = "active"
    ) -> dict:
        """Create a new business member"""
        member = {
            "business_id": business_id,
            "user_id": user_id,
            "role": role,
            "status": status,
            "created_at": datetime.utcnow()
        }
        
        result = await self.collection.insert_one(member)
        member["id"] = str(result.inserted_id)
        return member
    
    async def get_member(
        self,
        business_id: str,
        user_id: str
    ) -> Optional[dict]:
        """Get a specific business member"""
        member = await self.collection.find_one(
            {
                "business_id": business_id,
                "user_id": user_id
            },
            {"_id": 0}
        )
        return member
    
    async def get_user_businesses(
        self,
        user_id: str,
        status: str = "active"
    ) -> list[dict]:
        """Get all businesses where user is a member"""
        cursor = self.collection.find(
            {
                "user_id": user_id,
                "status": status
            },
            {"_id": 0}
        )
        return await cursor.to_list(length=100)
    
    async def get_business_members(
        self,
        business_id: str,
        status: Optional[str] = None
    ) -> list[dict]:
        """Get all members of a business"""
        query = {"business_id": business_id}
        if status:
            query["status"] = status
        
        cursor = self.collection.find(query, {"_id": 0})
        return await cursor.to_list(length=100)
    
    async def update_member_role(
        self,
        business_id: str,
        user_id: str,
        role: str
    ) -> bool:
        """Update a member's role"""
        result = await self.collection.update_one(
            {
                "business_id": business_id,
                "user_id": user_id
            },
            {
                "$set": {"role": role}
            }
        )
        return result.modified_count > 0
    
    async def update_member_status(
        self,
        business_id: str,
        user_id: str,
        status: str
    ) -> bool:
        """Update a member's status"""
        result = await self.collection.update_one(
            {
                "business_id": business_id,
                "user_id": user_id
            },
            {
                "$set": {"status": status}
            }
        )
        return result.modified_count > 0
    
    async def remove_member(
        self,
        business_id: str,
        user_id: str
    ) -> bool:
        """Remove a member (set status to removed)"""
        return await self.update_member_status(business_id, user_id, "removed")
    
    async def is_member(
        self,
        business_id: str,
        user_id: str,
        required_roles: Optional[list[str]] = None
    ) -> bool:
        """Check if user is an active member with optional role check"""
        query = {
            "business_id": business_id,
            "user_id": user_id,
            "status": "active"
        }
        
        if required_roles:
            query["role"] = {"$in": required_roles}
        
        member = await self.collection.find_one(query)
        return member is not None
    
    async def get_owner(
        self,
        business_id: str
    ) -> Optional[dict]:
        """Get the owner of a business"""
        owner = await self.collection.find_one(
            {
                "business_id": business_id,
                "role": "owner",
                "status": "active"
            },
            {"_id": 0}
        )
        return owner
