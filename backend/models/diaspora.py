"""
BANIBS Diaspora Connect Portal - Data Models
Phase 12.0 - Diaspora Connection & Empowerment
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class DiasporaBusinessType(str, Enum):
    """Types of diaspora businesses"""
    TOUR = "tour"
    LODGING = "lodging"
    FOOD = "food"
    SERVICE = "service"
    CULTURE = "culture"
    SHOP = "shop"


class DiasporaRegion(BaseModel):
    """Diaspora region reference model"""
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
                "description": "The ancestral homeland of millions across the diaspora",
                "countries": ["Ghana", "Nigeria", "Senegal", "Ivory Coast"],
                "highlight_cities": ["Accra", "Lagos", "Dakar"],
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class DiasporaStoryCreate(BaseModel):
    """Request model for creating a diaspora story"""
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1, max_length=5000)
    origin_region_id: Optional[str] = None
    current_region_id: Optional[str] = None
    anonymous: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "title": "My Journey Back to Ghana",
                "content": "After years of planning, I finally made the trip to Accra...",
                "origin_region_id": "west-africa-id",
                "current_region_id": "north-america-id",
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
    
    # Optional user info (only if not anonymous)
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    
    # Optional region names for display
    origin_region_name: Optional[str] = None
    current_region_name: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "770e8400-e29b-41d4-a716-446655440002",
                "title": "My Journey Back to Ghana",
                "content": "After years of planning...",
                "origin_region_id": "west-africa-id",
                "current_region_id": "north-america-id",
                "anonymous": False,
                "created_at": "2024-01-15T10:30:00Z",
                "author_name": "Marcus Johnson",
                "author_avatar": "https://...",
                "origin_region_name": "West Africa",
                "current_region_name": "North America"
            }
        }


class DiasporaBusinessCreate(BaseModel):
    """Request model for creating a diaspora business"""
    name: str = Field(..., min_length=1, max_length=200)
    type: DiasporaBusinessType
    region_id: str
    country: str
    city: str
    website: Optional[str] = None
    description: Optional[str] = None
    social_links: Optional[dict] = {}
    is_black_owned: bool = True
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Accra Heritage Tours",
                "type": "tour",
                "region_id": "west-africa-id",
                "country": "Ghana",
                "city": "Accra",
                "website": "https://accraheritagetours.com",
                "description": "Guided cultural and historical tours throughout Ghana",
                "social_links": {"instagram": "@accraheritage"},
                "is_black_owned": True
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
    website: Optional[str] = None
    description: Optional[str] = None
    social_links: dict = {}
    is_black_owned: bool = True
    created_at: datetime
    
    # Optional region name for display
    region_name: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "880e8400-e29b-41d4-a716-446655440003",
                "name": "Accra Heritage Tours",
                "type": "tour",
                "region_id": "west-africa-id",
                "country": "Ghana",
                "city": "Accra",
                "website": "https://accraheritagetours.com",
                "description": "Guided cultural tours",
                "social_links": {"instagram": "@accraheritage"},
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
    tags: List[str] = []
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "990e8400-e29b-41d4-a716-446655440004",
                "title": "Understanding the Global Black Diaspora",
                "content": "The African diaspora represents...",
                "tags": ["history", "identity", "culture"],
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class DiasporaSnapshotCreate(BaseModel):
    """Request model for creating a diaspora snapshot"""
    current_region_id: str
    origin_region_id: Optional[str] = None
    aspiration_region_id: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "current_region_id": "north-america-id",
                "origin_region_id": "west-africa-id",
                "aspiration_region_id": "caribbean-id"
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
    
    # Optional region names for display
    current_region_name: Optional[str] = None
    origin_region_name: Optional[str] = None
    aspiration_region_name: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "aa0e8400-e29b-41d4-a716-446655440005",
                "user_id": "770e8400-e29b-41d4-a716-446655440002",
                "current_region_id": "north-america-id",
                "origin_region_id": "west-africa-id",
                "aspiration_region_id": "caribbean-id",
                "created_at": "2024-01-15T10:30:00Z",
                "current_region_name": "North America",
                "origin_region_name": "West Africa",
                "aspiration_region_name": "Caribbean"
            }
        }


class DiasporaRegionsResponse(BaseModel):
    """Response model for listing diaspora regions"""
    regions: List[DiasporaRegion]
    total: int


class DiasporaStoriesResponse(BaseModel):
    """Response model for listing diaspora stories"""
    stories: List[DiasporaStory]
    total: int


class DiasporaBusinessesResponse(BaseModel):
    """Response model for listing diaspora businesses"""
    businesses: List[DiasporaBusiness]
    total: int


class DiasporaEducationResponse(BaseModel):
    """Response model for listing education articles"""
    articles: List[DiasporaEducationArticle]
    total: int
