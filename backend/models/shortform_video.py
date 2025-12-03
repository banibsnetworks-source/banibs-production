"""
BANIBS ShortForm - Video Model
Short-form vertical video content platform
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class VideoCategory(str, Enum):
    ENTERTAINMENT = "entertainment"
    EDUCATION = "education"
    COMMUNITY = "community"
    BUSINESS = "business"
    NEWS = "news"
    LIFESTYLE = "lifestyle"
    YOUTH = "youth"
    GENERAL = "general"

class VideoSafetyRating(str, Enum):
    YOUTH_SAFE = "youth_safe"  # Safe for under 18
    GENERAL = "general"        # Safe for all ages but not youth-focused
    MATURE = "mature"          # 18+ only

class ShortFormVideo(BaseModel):
    id: str
    user_id: str
    username: str
    user_avatar: Optional[str] = None
    
    # Video details
    title: str
    description: Optional[str] = None
    category: VideoCategory = VideoCategory.GENERAL
    
    # File info
    filename: str
    file_path: str
    file_size: int  # bytes
    duration: Optional[int] = None  # seconds
    width: Optional[int] = None
    height: Optional[int] = None
    
    # Safety & filtering
    safety_rating: VideoSafetyRating = VideoSafetyRating.GENERAL
    region: Optional[str] = None  # RCS-X integration
    is_community_boost: bool = False
    is_micro_learning: bool = False
    
    # Engagement metrics
    views: int = 0
    likes: int = 0
    shares: int = 0
    completion_rate: float = 0.0  # 0.0 to 1.0
    
    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = True
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

class VideoUploadRequest(BaseModel):
    title: str
    description: Optional[str] = None
    category: VideoCategory = VideoCategory.GENERAL
    safety_rating: VideoSafetyRating = VideoSafetyRating.GENERAL
    is_community_boost: bool = False
    is_micro_learning: bool = False

class VideoFeedResponse(BaseModel):
    videos: List[ShortFormVideo]
    total: int
    page: int
    has_more: bool

class VideoMetricsUpdate(BaseModel):
    video_id: str
    view_completed: bool = False  # Did user watch to end?
    watch_duration: Optional[int] = None  # seconds watched
