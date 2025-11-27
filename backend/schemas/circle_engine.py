"""
BANIBS Infinite Circle Engine Schemas - Phase 9.1
Pydantic models for circle engine API requests/responses
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime


class CircleEdge(BaseModel):
    """Single edge in the circle graph"""
    ownerUserId: str
    targetUserId: str
    tier: str
    weight: int
    createdAt: datetime
    updatedAt: datetime


class CircleGraphMeta(BaseModel):
    """Aggregate metadata for a user's circle"""
    userId: str
    peoplesCount: int
    coolCount: int
    alrightCount: int
    othersCount: int
    updatedAt: datetime


class PeoplesOfPeoplesItem(BaseModel):
    """A single Peoples-of-Peoples connection"""
    user_id: str
    mutual_count: int
    mutual_peoples: List[str]


class PeoplesOfPeoplesResponse(BaseModel):
    """Response for Peoples-of-Peoples query"""
    direct_peoples: List[CircleEdge]
    peoples_of_peoples: List[PeoplesOfPeoplesItem]


class CircleDepthResponse(BaseModel):
    """Multi-depth circle traversal response"""
    depth_1: List[CircleEdge]
    depth_2: Optional[List[CircleEdge]] = None
    depth_3: Optional[List[CircleEdge]] = None


class SharedCircleResponse(BaseModel):
    """Shared circle between two users"""
    shared_peoples: List[str]
    shared_cool: List[str]
    shared_alright: List[str]
    overlap_score: float


class CircleReachScore(BaseModel):
    """User's reach score in the circle graph"""
    total_score: int
    direct_score: int
    depth_2_score: int
    breakdown: Dict


class RefreshResponse(BaseModel):
    """Response for refresh operations"""
    success: bool
    message: str
    edges_created: Optional[int] = None
    stats: Optional[Dict] = None
