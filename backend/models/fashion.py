"""
BANIBS Sneakers & Fashion Ownership Portal - Data Models
Phase 11.2 - From Hype to Ownership
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class FashionBrandType(str, Enum):
    """Types of fashion brands"""
    SNEAKER = "sneaker"
    CLOTHING = "clothing"
    ACCESSORY = "accessory"
    BOUTIQUE = "boutique"
    DESIGNER = "designer"
    CUSTOMIZER = "customizer"


class FashionBrandCreate(BaseModel):
    """Request model for creating a fashion brand"""
    name: str = Field(..., min_length=1, max_length=200)
    type: FashionBrandType
    description: str
    country: str
    city: Optional[str] = None
    website: Optional[str] = None
    social_links: Optional[dict] = {}
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "Black Kicks Co",
                "type": "sneaker",
                "description": "Premium Black-owned sneaker brand",
                "country": "USA",
                "city": "New York",
                "website": "https://blackkicks.example.com",
                "social_links": {
                    "instagram": "@blackkicks",
                    "tiktok": "@blackkicksco"
                }
            }
        }


class FashionBrand(BaseModel):
    """Fashion brand document model"""
    id: str
    name: str
    type: FashionBrandType
    description: str
    country: str
    city: Optional[str] = None
    website: Optional[str] = None
    social_links: dict = {}
    is_black_owned: bool = True
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "name": "Black Kicks Co",
                "type": "sneaker",
                "description": "Premium Black-owned sneaker brand",
                "country": "USA",
                "city": "New York",
                "website": "https://blackkicks.example.com",
                "social_links": {"instagram": "@blackkicks"},
                "is_black_owned": True,
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class FashionPostCategory(str, Enum):
    """Types of fashion board posts"""
    IDEA = "idea"
    QUESTION = "question"
    WIN = "win"
    RESOURCE = "resource"


class FashionPostCreate(BaseModel):
    """Request model for creating a fashion post"""
    content: str = Field(..., min_length=1, max_length=1000)
    category: FashionPostCategory
    anonymous: bool = False
    
    class Config:
        json_schema_extra = {
            "example": {
                "content": "Just launched my first custom sneaker line! Small batch, all handmade.",
                "category": "win",
                "anonymous": False
            }
        }


class FashionPost(BaseModel):
    """Fashion board post document model"""
    id: str
    user_id: str
    content: str
    category: FashionPostCategory
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
                "content": "Just launched my first sneaker line!",
                "category": "win",
                "anonymous": False,
                "created_at": "2024-01-15T10:30:00Z",
                "author_name": "Marcus Johnson",
                "author_avatar": "https://..."
            }
        }


class FashionEducationArticle(BaseModel):
    """Fashion education article model"""
    id: str
    title: str
    content: str
    summary: str
    tags: List[str] = []
    author: str = "BANIBS Fashion Team"
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "880e8400-e29b-41d4-a716-446655440003",
                "title": "How Sneaker Brands Make Money",
                "content": "...",
                "summary": "Understanding the business of sneakers",
                "tags": ["business", "sneakers", "ownership"],
                "author": "BANIBS Fashion Team",
                "created_at": "2024-01-01T00:00:00Z"
            }
        }


class FashionSpendCreate(BaseModel):
    """Request model for fashion spending snapshot"""
    pairs_per_year: int = Field(..., ge=0)
    avg_price: float = Field(..., ge=0)
    
    class Config:
        json_schema_extra = {
            "example": {
                "pairs_per_year": 12,
                "avg_price": 180.00
            }
        }


class FashionSpendSnapshot(BaseModel):
    """Fashion spending snapshot model"""
    id: str
    user_id: str
    pairs_per_year: int
    avg_price: float
    annual_spend: float
    ten_percent_amount: float
    created_at: datetime
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "990e8400-e29b-41d4-a716-446655440004",
                "user_id": "770e8400-e29b-41d4-a716-446655440002",
                "pairs_per_year": 12,
                "avg_price": 180.00,
                "annual_spend": 2160.00,
                "ten_percent_amount": 216.00,
                "created_at": "2024-01-15T00:00:00Z"
            }
        }


class FashionBrandsResponse(BaseModel):
    """Response model for listing fashion brands"""
    brands: List[FashionBrand]
    total: int


class FashionPostsResponse(BaseModel):
    """Response model for listing fashion posts"""
    posts: List[FashionPost]
    total: int
