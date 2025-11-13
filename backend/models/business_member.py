"""
Business Member Model - Phase B1
Represents team membership and roles within a business
"""

from pydantic import BaseModel, Field
from typing import Literal
from datetime import datetime
from bson import ObjectId


class BusinessMember(BaseModel):
    """Represents a user's role within a business"""
    id: str = Field(default_factory=lambda: str(ObjectId()))
    business_id: str
    user_id: str
    role: Literal["owner", "admin", "editor", "contributor"]
    status: Literal["active", "invited", "removed"] = "active"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "business_id": "d7406622-9423-4094-9203-36827c631310",
                "user_id": "938ba123-4567-89ab-cdef-0123456789ab",
                "role": "owner",
                "status": "active",
                "created_at": "2025-01-15T10:30:00"
            }
        }


class BusinessMemberCreate(BaseModel):
    """Request model for adding a member to a business"""
    user_id: str
    role: Literal["admin", "editor", "contributor"] = "contributor"


class BusinessMemberUpdate(BaseModel):
    """Request model for updating a member's role"""
    role: Literal["admin", "editor", "contributor"]
