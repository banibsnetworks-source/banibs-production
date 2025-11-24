"""
BANIBS Circles - Community Support Groups
Phase 11.5.3 - Ability Network Integration
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ==================== ENUMS ====================

class CirclePillar(str, Enum):
    """Portal/pillar association"""
    ABILITY = "ability"
    HEALTH = "health"
    COMMUNITY = "community"
    GENERAL = "general"


class DisabilityType(str, Enum):
    """Disability types for Ability circles"""
    PHYSICAL = "physical"
    VISUAL = "visual"
    HEARING = "hearing"
    COGNITIVE = "cognitive"
    NEURODIVERGENT = "neurodivergent"
    CHRONIC = "chronic"
    SENSORY = "sensory"
    MENTAL_HEALTH = "mental_health"
    MULTIPLE = "multiple"
    ALL = "all"


class CircleAudience(str, Enum):
    """Target audience"""
    SELF = "self"  # People with the condition themselves
    CAREGIVER = "caregiver"  # Parents, family caregivers
    BOTH = "both"  # Mixed group


class PrivacyLevel(str, Enum):
    """Group privacy settings"""
    PUBLIC = "public"  # Anyone can see and join
    REQUEST_TO_JOIN = "request_to_join"  # Visible, requires approval
    INVITE_ONLY = "invite_only"  # Not listed publicly


class MemberRole(str, Enum):
    """Member roles in a circle"""
    ADMIN = "admin"
    MODERATOR = "moderator"
    MEMBER = "member"


# ==================== MODELS ====================

class Circle(BaseModel):
    """Support group/circle - Phase 11.5.3"""
    id: str
    name: str
    slug: str
    description: str
    pillar: CirclePillar
    tags: List[str] = []
    primary_disability_type: Optional[DisabilityType] = None
    audience: CircleAudience = CircleAudience.BOTH
    privacy_level: PrivacyLevel = PrivacyLevel.REQUEST_TO_JOIN
    is_featured_in_ability: bool = False
    safety_notes: Optional[str] = None  # e.g., "Trauma-aware, no graphic descriptions"
    rules: List[str] = []
    created_by_user_id: str
    created_by_name: str
    member_count: int = 0
    post_count: int = 0
    last_activity_at: Optional[datetime] = None
    is_active: bool = True
    is_verified: bool = False
    created_at: datetime
    updated_at: datetime


class CircleMember(BaseModel):
    """Circle membership"""
    id: str
    circle_id: str
    user_id: str
    user_name: str
    role: MemberRole = MemberRole.MEMBER
    status: str = "active"  # active, pending, banned
    joined_at: datetime


class CirclePost(BaseModel):
    """Post in a circle"""
    id: str
    circle_id: str
    user_id: str
    user_name: str
    content: str
    is_anonymous: bool = False
    reply_count: int = 0
    helpful_count: int = 0
    is_pinned: bool = False
    created_at: datetime
    updated_at: datetime


class CirclesResponse(BaseModel):
    """Response for circles list"""
    circles: List[Circle]
    total: int


class CircleMembersResponse(BaseModel):
    """Response for circle members list"""
    members: List[CircleMember]
    total: int


class CirclePostsResponse(BaseModel):
    """Response for circle posts list"""
    posts: List[CirclePost]
    total: int
