"""
BANIBS Relationship Schemas - Phase 8.1
Pydantic models for relationship API requests/responses
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# Circle Trust Order - 7 Tiers (MEGADROP V1)
# Ordered from closest (PEOPLES) to most distant (BLOCKED)
RelationshipTier = Literal[
    "PEOPLES",           # Tier 1: Closest circle
    "COOL",              # Tier 2: Trusted friends
    "CHILL",             # Tier 3: Acquaintances
    "ALRIGHT",           # Tier 4: Casual connections
    "OTHERS",            # Tier 5: Default/strangers
    "OTHERS_SAFE_MODE",  # Tier 6: Limited interaction
    "BLOCKED"            # Tier 7: No interaction
]

# Relationship status (separate from tier)
RelationshipStatus = Literal["ACTIVE", "PENDING"]


class RelationshipBase(BaseModel):
    """Base relationship schema"""
    target_user_id: str = Field(..., description="User ID being classified")
    tier: RelationshipTier = Field(..., description="Relationship tier")


class RelationshipCreate(RelationshipBase):
    """Schema for creating/updating a relationship"""
    pass


class RelationshipUpdate(BaseModel):
    """Schema for updating relationship fields"""
    tier: Optional[RelationshipTier] = None
    status: Optional[RelationshipStatus] = None


class RelationshipRead(BaseModel):
    """Schema for relationship response"""
    id: str
    owner_user_id: str
    target_user_id: str
    tier: RelationshipTier
    status: RelationshipStatus
    created_at: datetime
    updated_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "owner_user_id": "user-123",
                "target_user_id": "user-456",
                "tier": "PEOPLES",
                "status": "ACTIVE",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }


class RelationshipWithUser(RelationshipRead):
    """Relationship with user details attached"""
    user: Optional[dict] = None


class BlockRequest(BaseModel):
    """Request to block a user"""
    target_user_id: str = Field(..., description="User ID to block")


class UnblockRequest(BaseModel):
    """Request to unblock a user"""
    target_user_id: str = Field(..., description="User ID to unblock")


class RelationshipCounts(BaseModel):
    """Relationship counts by tier"""
    peoples: int = 0
    cool: int = 0
    alright: int = 0
    others: int = 0
    blocked: int = 0
