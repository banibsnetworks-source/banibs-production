"""
BANIBS Beauty & Wellness Portal - Data Models
Phase 11.1 - Beauty Ownership & Empowerment
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class BeautyProviderType(str, Enum):
    """Types of beauty providers"""
    HAIR = "hair"
    SKINCARE = "skincare"
    LASHES = "lashes"
    NAILS = "nails"
    BARBER = "barber"
    COSMETOLOGIST = "cosmetologist"
    FRAGRANCE = "fragrance"
    SHOP = "shop"
    WELLNESS = "wellness"


class BeautyProviderCreate(BaseModel):
    """Request model for creating a beauty provider"""
    name: str = Field(..., min_length=1, max_length=200)
    type: BeautyProviderType
    location: str
    owner_name: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    social_links: Optional[dict] = {}
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Natural Crown Hair Studio",
                "type": "hair",
                "location": "Atlanta, GA",
                "owner_name": "Sarah Johnson",
                "website": "https://naturalcrown.com",
                "phone": "(404) 555-0123",
                "description": "Specializing in natural hair care and protective styles",
                "social_links": {
                    "instagram": "@naturalcrown",
                    "facebook": "naturalcrownstudio"
                }
            }
        }


class BeautyProvider(BaseModel):
    """Beauty provider document model"""
    id: str
    name: str
    type: BeautyProviderType
    location: str
    owner_name: Optional[str] = None
    website: Optional[str] = None
    phone: Optional[str] = None
    description: Optional[str] = None
    social_links: dict = {}
    rating: Optional[float] = None
    review_count: int = 0
    verified: bool = False
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Natural Crown Hair Studio",
                "type": "hair",
                "location": "Atlanta, GA",
                "owner_name": "Sarah Johnson",
                "website": "https://naturalcrown.com",
                "phone": "(404) 555-0123",
                "description": "Specializing in natural hair care",
                "social_links": {"instagram": "@naturalcrown"},
                "rating": 4.8,
                "review_count": 127,
                "verified": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class BeautyPostCategory(str, Enum):
    """Types of beauty board posts"""
    TIP = "tip"
    QUESTION = "question"
    EMPOWERMENT = "empowerment"
    RECOMMENDATION = "recommendation"


class BeautyPostCreate(BaseModel):
    """Request model for creating a beauty post"""
    content: str = Field(..., min_length=1, max_length=1000)
    category: BeautyPostCategory
    anonymous: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "Just discovered a great natural hair routine that saved me time and money!",
                "category": "tip",
                "anonymous": False
            }
        }


class BeautyPost(BaseModel):
    """Beauty board post document model"""
    id: str
    user_id: str
    content: str
    category: BeautyPostCategory
    anonymous: bool
    created_at: datetime
    
    # Optional user info (only if not anonymous)
    author_name: Optional[str] = None
    author_avatar: Optional[str] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440001",
                "user_id": "770e8400-e29b-41d4-a716-446655440002",
                "content": "Natural hair journey tip...",
                "category": "tip",
                "anonymous": False,
                "created_at": "2024-01-15T10:30:00Z",
                "author_name": "Ashley Williams",
                "author_avatar": "https://..."
            }
        }


class BeautyEducationArticle(BaseModel):
    """Beauty education article model"""
    id: str
    title: str
    content: str
    summary: str
    tags: List[str] = []
    author: str = "BANIBS Beauty Team"
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "880e8400-e29b-41d4-a716-446655440003",
                "title": "Healthy Hair Starts Here",
                "content": "...",
                "summary": "Essential tips for natural hair care",
                "tags": ["hair", "natural", "health"],
                "author": "BANIBS Beauty Team",
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class BeautySpendCreate(BaseModel):
    """Request model for spending snapshot"""
    monthly_spend: float = Field(..., ge=0)
    categories: Optional[dict] = {}
    
    class Config:
        json_schema_extra = {
            "example": {
                "monthly_spend": 250.00,
                "categories": {
                    "hair": 100,
                    "nails": 80,
                    "skincare": 70
                }
            }
        }


class BeautySpendSnapshot(BaseModel):
    """Beauty spending snapshot model"""
    id: str
    user_id: str
    monthly_spend: float
    yearly_spend: float
    categories: dict = {}
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "990e8400-e29b-41d4-a716-446655440004",
                "user_id": "770e8400-e29b-41d4-a716-446655440002",
                "monthly_spend": 250.00,
                "yearly_spend": 3000.00,
                "categories": {"hair": 100, "nails": 80},
                "created_at": "2024-01-15T00:00:00Z"
            }
        }


class BeautyProvidersResponse(BaseModel):
    """Response model for listing beauty providers"""
    providers: List[BeautyProvider]
    total: int


class BeautyPostsResponse(BaseModel):
    """Response model for listing beauty posts"""
    posts: List[BeautyPost]
    total: int
