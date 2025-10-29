from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

# BANIBS TV / Featured Media Models
class FeaturedMediaDB(BaseModel):
    """Featured video/media content stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    
    # Display information
    title: str
    description: Optional[str] = None
    
    # Where to send the user when they click "Watch Now"
    videoUrl: str  # YouTube, Vimeo, internal player, etc.
    
    # Thumbnail for card/hero (will be mirrored to CDN like news images)  
    thumbnailUrl: Optional[str] = None
    
    # Category or tag. Ex: "Youth Voices", "Grant Funding Talk", "Founder Spotlight"
    tag: Optional[str] = None
    
    # Editorial flags
    isFeatured: bool = False  # manually spotlight this one on homepage
    external: bool = False    # true if hosted off BANIBS infra (e.g. YouTube)
    
    # Timestamps
    publishedAt: datetime = Field(default_factory=datetime.utcnow)
    createdAt: datetime = Field(default_factory=datetime.utcnow)
    updatedAt: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class FeaturedMediaPublic(BaseModel):
    """Public featured media response for homepage"""
    id: str
    title: str
    description: Optional[str] = None
    videoUrl: str
    thumbnailUrl: Optional[str] = None
    tag: Optional[str] = None
    isFeatured: bool = False
    external: bool = False
    publishedAt: str  # ISO timestamp string
    sourceName: str = "BANIBS TV"