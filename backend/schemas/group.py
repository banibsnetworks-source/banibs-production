"""
BANIBS Groups Schemas - Phase 8.5
Pydantic models for groups and membership API requests/responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime


# Group privacy types
GroupPrivacy = Literal["PUBLIC", "PRIVATE", "SECRET"]

# Membership role types
MemberRole = Literal["OWNER", "ADMIN", "MODERATOR", "MEMBER"]

# Membership status types
MemberStatus = Literal["ACTIVE", "PENDING", "BANNED"]


# ==================== GROUP SCHEMAS ====================

class GroupBase(BaseModel):
    """Base group schema"""
    name: str = Field(..., min_length=1, max_length=100, description="Group name")
    description: str = Field(..., min_length=1, max_length=1000, description="Group description")
    privacy: GroupPrivacy = Field(default="PUBLIC", description="Privacy level")


class GroupCreate(GroupBase):
    """Schema for creating a group"""
    cover_image: Optional[str] = Field(None, description="Cover image URL")
    rules: Optional[str] = Field(None, max_length=5000, description="Group rules")
    tags: Optional[List[str]] = Field(default=[], description="Group tags")


class GroupUpdate(BaseModel):
    """Schema for updating a group"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, min_length=1, max_length=1000)
    privacy: Optional[GroupPrivacy] = None
    cover_image: Optional[str] = None
    rules: Optional[str] = Field(None, max_length=5000)
    tags: Optional[List[str]] = None


class GroupRead(BaseModel):
    """Schema for group response"""
    id: str
    name: str
    description: str
    creator_id: str
    privacy: GroupPrivacy
    cover_image: Optional[str] = None
    rules: Optional[str] = None
    tags: List[str] = []
    member_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "123e4567-e89b-12d3-a456-426614174000",
                "name": "BANIBS Entrepreneurs",
                "description": "A community for Black and Indigenous entrepreneurs",
                "creator_id": "user-123",
                "privacy": "PUBLIC",
                "cover_image": "/api/static/groups/cover-1.jpg",
                "rules": "Be respectful and supportive",
                "tags": ["entrepreneurship", "networking"],
                "member_count": 42,
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }


class GroupWithMembership(GroupRead):
    """Group with user's membership info attached"""
    membership: Optional[dict] = None


# ==================== MEMBERSHIP SCHEMAS ====================

class MembershipCreate(BaseModel):
    """Schema for adding a member to a group"""
    user_id: str = Field(..., description="User ID to add")
    role: MemberRole = Field(default="MEMBER", description="Member role")


class MembershipUpdate(BaseModel):
    """Schema for updating membership"""
    role: Optional[MemberRole] = None
    status: Optional[MemberStatus] = None


class MembershipRead(BaseModel):
    """Schema for membership response"""
    id: str
    group_id: str
    user_id: str
    role: MemberRole
    status: MemberStatus
    joined_at: datetime
    updated_at: datetime

    class Config:
        json_schema_extra = {
            "example": {
                "id": "456e7890-e89b-12d3-a456-426614174000",
                "group_id": "group-123",
                "user_id": "user-456",
                "role": "MEMBER",
                "status": "ACTIVE",
                "joined_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z"
            }
        }


class MembershipWithUser(MembershipRead):
    """Membership with user details attached"""
    user: Optional[dict] = None


class JoinGroupRequest(BaseModel):
    """Request to join a group"""
    pass  # No additional fields needed; user_id comes from auth


class UpdateRoleRequest(BaseModel):
    """Request to update a member's role"""
    user_id: str = Field(..., description="User ID to update")
    role: MemberRole = Field(..., description="New role")


class RemoveMemberRequest(BaseModel):
    """Request to remove a member"""
    user_id: str = Field(..., description="User ID to remove")
