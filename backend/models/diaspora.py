"""
BANIBS Diaspora Connect Portal - Data Models
Phase 12.0 - One People. Many Homes. One Connection.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DiasporaRegion(BaseModel):
    """Diaspora region model"""
    id: str
    name: str
    slug: str
    description: str
    countries: List[str] = []
    highlight_cities: List[str] = []
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "West Africa",
                "slug": "west-africa",
                "description": "The ancestral homeland for many across the diaspora",
                "countries": ["Ghana", "Nigeria", "Senegal", "Benin"],
                "highlight_cities": ["Accra", "Lagos", "Dakar"],
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class DiasporaStoryCreate(BaseModel):
    """Request model for creating a diaspora story"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=2000)
    origin_region_id: Optional[str] = None
    current_region_id: Optional[str] = None
    anonymous: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "Finding Home in Accra",
                "content": "After years of dreaming, I finally made it to Ghana...",
                "origin_region_id": "550e8400-e29b-41d4-a716-446655440001",
                "current_region_id": "550e8400-e29b-41d4-a716-446655440002",
                "anonymous": False
            }
        }


class DiasporaStory(BaseModel):
    """Diaspora story document model"""
    id: str
    user_id: str
    title: str
    content: str
    origin_region_id: Optional[str] = None
    current_region_id: Optional[str] = None
    anonymous: bool
    created_at: datetime
    
    # Optional user and region info
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    origin_region_name: Optional[str] = None
    current_region_name: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "770e8400-e29b-41d4-a716-446655440002",
                "title": "Finding Home in Accra",
                "content": "After years of dreaming...",
                "origin_region_id": "550e8400",
                "current_region_id": "660e8400",
                "anonymous": False,
                "created_at": "2024-01-15T10:30:00Z",
                "author_name": "Kwame Johnson",
                "origin_region_name": "North America",
                "current_region_name": "West Africa"
            }
        }


class DiasporaBusinessType(str, Enum):
    """Types of diaspora businesses"""
    TOUR = "tour"
    LODGING = "lodging"
    FOOD = "food"
    SERVICE = "service"
    CULTURE = "culture"
    COMMUNITY_CENTER = "community_center"


class DiasporaBusinessCreate(BaseModel):
    """Request model for creating a diaspora business"""
    name: str = Field(..., min_length=1, max_length=200)
    type: DiasporaBusinessType
    region_id: str
    country: str
    city: str
    description: str
    website: Optional[str] = None
    social_links: Optional[dict] = {}
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Roots & Culture Tours",
                "type": "tour",
                "region_id": "550e8400-e29b-41d4-a716-446655440000",
                "country": "Ghana",
                "city": "Accra",
                "description": "Heritage tours connecting diaspora to ancestral roots",
                "website": "https://rootsculture.example.com",
                "social_links": {"instagram": "@rootsculture"}
            }
        }


class DiasporaBusiness(BaseModel):
    """Diaspora business document model"""
    id: str
    name: str
    type: DiasporaBusinessType
    region_id: str
    country: str
    city: str
    description: str
    website: Optional[str] = None
    social_links: dict = {}
    is_black_owned: bool = True
    created_at: datetime
    
    # Optional region info
    region_name: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "880e8400-e29b-41d4-a716-446655440003",
                "name": "Roots & Culture Tours",
                "type": "tour",
                "region_id": "550e8400",
                "country": "Ghana",
                "city": "Accra",
                "description": "Heritage tours",
                "website": "https://rootsculture.example.com",
                "social_links": {"instagram": "@rootsculture"},
                "is_black_owned": True,
                "created_at": "2024-01-01T00:00:00Z",
                "region_name": "West Africa"
            }
        }


class DiasporaEducationArticle(BaseModel):
    """Diaspora education article model"""
    id: str
    title: str
    content: str
    summary: str
    tags: List[str] = []
    author: str = "BANIBS Diaspora Team"
    created_at: datetime


class DiasporaSnapshotCreate(BaseModel):
    """Request model for diaspora snapshot"""
    current_region_id: str
    origin_region_id: Optional[str] = None
    aspiration_region_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "current_region_id": "550e8400",
                "origin_region_id": "660e8400",
                "aspiration_region_id": "770e8400"
            }
        }


class DiasporaSnapshot(BaseModel):
    """Diaspora snapshot document model"""
    id: str
    user_id: str
    current_region_id: str
    origin_region_id: Optional[str] = None
    aspiration_region_id: Optional[str] = None
    created_at: datetime
    
    # Optional region names
    current_region_name: Optional[str] = None
    origin_region_name: Optional[str] = None
    aspiration_region_name: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "990e8400-e29b-41d4-a716-446655440004",
                "user_id": "770e8400",
                "current_region_id": "550e8400",
                "origin_region_id": "660e8400",
                "aspiration_region_id": "770e8400",
                "created_at": "2024-01-15T00:00:00Z",
                "current_region_name": "North America",
                "origin_region_name": "West Africa",
                "aspiration_region_name": "Caribbean"
            }
        }


class DiasporaStoriesResponse(BaseModel):
    """Response model for listing diaspora stories"""
    stories: List[DiasporaStory]
    total: int


class DiasporaBusinessesResponse(BaseModel):
    """Response model for listing diaspora businesses"""
    businesses: List[DiasporaBusiness]
    total: int
