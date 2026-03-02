"""
Social Post Models - Phase 8.3 + Circle Visibility V1
BANIBS Social Portal feed and engagement models
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime
from enum import Enum


# Circle Visibility V1 - Enums
class PostTargetType(str, Enum):
    """Post targeting type"""
    GLOBAL = "GLOBAL"
    CIRCLE = "CIRCLE"


class ViewTier(str, Enum):
    """Minimum tier required to view/interact"""
    OTHERS = "OTHERS"
    ALRIGHT = "ALRIGHT"
    COOL = "COOL"
    PEOPLES = "PEOPLES"


# Tier hierarchy for comparison (lower = more restrictive)
VIEW_TIER_LEVELS = {
    ViewTier.OTHERS: 0,
    ViewTier.ALRIGHT: 1,
    ViewTier.COOL: 2,
    ViewTier.PEOPLES: 3
}


class MediaItem(BaseModel):
    """Media item in a post"""
    url: str
    type: Literal["image", "video"]
    width: Optional[int] = None
    height: Optional[int] = None
    thumbnail_url: Optional[str] = None
    # Phase 17.0 - Image focal point / crop adjustment
    focalY: Optional[float] = Field(default=0.5, description="Vertical focal point (0.0=top, 1.0=bottom)")
    fitMode: Optional[Literal["cover", "contain", "full"]] = Field(default="cover", description="Image fit mode")


class LinkMetadata(BaseModel):
    """Link preview metadata"""
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    site: str
    url: str


class SocialPostCreate(BaseModel):
    """Create social post request"""
    text: str = Field(default="", max_length=1000, description="Post content (optional for media/link posts)")
    media: Optional[list[MediaItem]] = Field(default=[], description="Media attachments (max 4 images or 1 video)")
    link_url: Optional[str] = Field(None, description="Optional link URL")
    link_meta: Optional[LinkMetadata] = Field(None, description="Link preview metadata")
    quoted_post_id: Optional[str] = Field(None, description="ID of post being quoted")


class SocialPostAuthor(BaseModel):
    """Post author info (Phase 9.0: added handle for profiles)"""
    id: str
    display_name: str
    avatar_url: Optional[str] = None
    handle: Optional[str] = None


class QuotedPostSnapshot(BaseModel):
    """Minimal snapshot of a quoted post for display"""
    id: str
    author_name: str
    author_avatar: Optional[str] = None
    text: str
    media_url: Optional[str] = None
    created_at: str


class SocialPost(BaseModel):
    """Social post response"""
    id: str
    author: SocialPostAuthor
    text: str
    media: list[MediaItem] = []
    media_urls: list[str] = []  # S-MEDIA v1.0 compatibility - extracted media URLs
    link_url: Optional[str] = None
    link_meta: Optional[LinkMetadata] = None
    quoted_post_id: Optional[str] = None
    quoted_post: Optional[QuotedPostSnapshot] = None
    created_at: datetime
    updated_at: datetime
    like_count: int = 0
    comment_count: int = 0
    viewer_has_liked: bool = False
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class SocialFeedResponse(BaseModel):
    """Social feed paginated response"""
    page: int
    page_size: int
    total_items: int
    total_pages: int
    items: list[SocialPost]


class SocialCommentCreate(BaseModel):
    """Create comment request"""
    text: str = Field(..., min_length=1, max_length=2000, description="Comment text (includes emoji placeholders)")
    media: Optional[list[MediaItem]] = Field(default=[], description="Media attachments (images only for v1)")
    parent_id: Optional[str] = Field(None, description="Parent comment ID for replies (1-level nesting)")


class SocialComment(BaseModel):
    """Comment response"""
    id: str
    post_id: str
    author: SocialPostAuthor
    text: str
    media: list[MediaItem] = []
    parent_id: Optional[str] = None
    replies: Optional[list["SocialComment"]] = []
    created_at: datetime
    is_deleted: bool = False
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class SocialCommentsResponse(BaseModel):
    """Comments list paginated response"""
    page: int
    page_size: int
    total_items: int
    items: list[SocialComment]


class SocialLikeResponse(BaseModel):
    """Like/unlike response"""
    liked: bool
    like_count: int
