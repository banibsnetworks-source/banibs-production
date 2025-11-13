"""
Social Post Models - Phase 8.3
BANIBS Social Portal feed and engagement models
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


class MediaItem(BaseModel):
    """Media item in a post"""
    url: str
    type: Literal["image", "video"]
    width: Optional[int] = None
    height: Optional[int] = None
    thumbnail_url: Optional[str] = None


class LinkMetadata(BaseModel):
    """Link preview metadata"""
    title: str
    description: Optional[str] = None
    image: Optional[str] = None
    site: str
    url: str


class SocialPostCreate(BaseModel):
    """Create social post request"""
    text: str = Field(..., min_length=1, max_length=1000, description="Post content")
    media: Optional[list[MediaItem]] = Field(default=[], description="Media attachments (max 4 images or 1 video)")
    link_url: Optional[str] = Field(None, description="Optional link URL")
    link_meta: Optional[LinkMetadata] = Field(None, description="Link preview metadata")


class SocialPostAuthor(BaseModel):
    """Post author info (Phase 9.0: added handle for profiles)"""
    id: str
    display_name: str
    avatar_url: Optional[str] = None
    handle: Optional[str] = None


class SocialPost(BaseModel):
    """Social post response"""
    id: str
    author: SocialPostAuthor
    text: str
    media: list[MediaItem] = []
    link_url: Optional[str] = None
    link_meta: Optional[LinkMetadata] = None
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
    text: str = Field(..., min_length=1, max_length=500, description="Comment text")


class SocialComment(BaseModel):
    """Comment response"""
    id: str
    post_id: str
    author: SocialPostAuthor
    text: str
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
