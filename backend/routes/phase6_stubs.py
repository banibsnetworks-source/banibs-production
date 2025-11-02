"""
BANIBS Phase 6 Stub Endpoints (v1.3.2)
Mock API endpoints for frontend integration and testing

These endpoints return realistic mock data to enable:
- Early frontend development
- API contract validation
- Integration testing
- Demo/prototype builds

⚠️ WARNING: These are STUB endpoints only!
Replace with real implementations during Phase 6.0-6.6
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Optional, List
from datetime import datetime, timezone

# Create stub router
router = APIRouter(prefix="/api/stubs", tags=["Phase 6 Stubs"])

# ============================================
# Phase 6.1 - Social Media Stubs
# ============================================

@router.get("/social/feed")
async def get_social_feed_stub(page: int = 1, limit: int = 20):
    """
    STUB: Get personalized social feed
    
    Real implementation (Phase 6.1): 
    - Fetch posts from followed users
    - Fetch posts from joined boards
    - Sort by recency + engagement
    - Paginate results
    """
    return {
        "posts": [
            {
                "id": "post-001",
                "userId": "user-001",
                "profile": {
                    "displayName": "Maya Johnson",
                    "avatarUrl": "https://cdn.banibs.com/avatars/placeholder.jpg"
                },
                "content": "Excited to announce the launch of our new community marketplace! Black-owned businesses can now list their services directly. #BanibsBusiness",
                "mediaUrls": [],
                "boardId": None,
                "visibility": "public",
                "likeCount": 42,
                "commentCount": 8,
                "createdAt": "2025-11-01T12:00:00Z"
            },
            {
                "id": "post-002",
                "userId": "user-002",
                "profile": {
                    "displayName": "Kwame Osei",
                    "avatarUrl": "https://cdn.banibs.com/avatars/placeholder.jpg"
                },
                "content": "Just completed the Swahili language module on BANIBS Education. Highly recommend for anyone looking to connect with East African culture!",
                "mediaUrls": [],
                "boardId": "board-africa",
                "visibility": "public",
                "likeCount": 67,
                "commentCount": 12,
                "createdAt": "2025-11-01T10:30:00Z"
            }
        ],
        "nextPage": 2,
        "hasMore": True
    }


@router.post("/social/posts")
async def create_post_stub():
    """
    STUB: Create new social post
    
    Real implementation (Phase 6.1):
    - Validate content length
    - Upload media to Cloudflare R2
    - Check tier limits (rate limiting)
    - Store in social_posts collection
    - Notify followers
    """
    return {
        "post": {
            "id": "post-new-001",
            "userId": "current-user",
            "content": "[Your post content]",
            "mediaUrls": [],
            "visibility": "public",
            "likeCount": 0,
            "commentCount": 0,
            "createdAt": datetime.now(timezone.utc).isoformat()
        }
    }


@router.get("/social/boards/{region}")
async def get_regional_board_stub(region: str):
    """
    STUB: Get regional community board
    
    Real implementation (Phase 6.1):
    - Fetch board metadata
    - Get recent posts in board
    - Check user membership status
    - Return board rules and moderators
    """
    boards = {
        "global": {
            "id": "board-global",
            "name": "Global News & Discussion",
            "slug": "global",
            "description": "Worldwide news and perspectives from Black and Indigenous communities",
            "region": "Global",
            "category": "News",
            "postCount": 1234,
            "memberCount": 5678,
            "recentPosts": []
        },
        "africa": {
            "id": "board-africa",
            "name": "Africa Connection",
            "slug": "africa",
            "description": "News, culture, and business from across the African continent",
            "region": "Africa",
            "category": "Culture",
            "postCount": 892,
            "memberCount": 2341,
            "recentPosts": []
        }
    }
    
    return boards.get(region.lower(), boards["global"])


# ============================================
# Phase 6.4 - Marketplace Stubs
# ============================================

@router.get("/marketplace/listings")
async def get_marketplace_listings_stub(
    category: Optional[str] = None,
    verified: Optional[bool] = None,
    page: int = 1,
    limit: int = 20
):
    """
    STUB: Browse marketplace listings
    
    Real implementation (Phase 6.4):
    - Query marketplace_listings collection
    - Filter by category, location, price
    - Sort by recency or relevance
    - Include seller profiles
    - Paginate results
    """
    return {
        "listings": [
            {
                "id": "listing-001",
                "sellerId": "user-003",
                "seller": {
                    "name": "Aisha's Catering",
                    "avatarUrl": "https://cdn.banibs.com/avatars/placeholder.jpg",
                    "verifiedBusiness": True
                },
                "title": "Authentic West African Catering Services",
                "description": "Professional catering for events, weddings, and corporate gatherings. Specializing in Nigerian, Ghanaian, and Senegalese cuisine.",
                "category": "Services",
                "priceType": "quote_required",
                "images": ["https://cdn.banibs.com/marketplace/placeholder.jpg"],
                "location": "Atlanta, GA",
                "deliveryMethod": "in_person",
                "verifiedBusiness": True,
                "viewCount": 342,
                "inquiryCount": 23,
                "createdAt": "2025-10-15T09:00:00Z"
            },
            {
                "id": "listing-002",
                "sellerId": "user-004",
                "seller": {
                    "name": "Marcus Tech Solutions",
                    "avatarUrl": "https://cdn.banibs.com/avatars/placeholder.jpg",
                    "verifiedBusiness": True
                },
                "title": "Web Development & Design Services",
                "description": "Custom websites and applications for small businesses. Affordable rates, fast turnaround, lifetime support.",
                "category": "Services",
                "priceType": "fixed",
                "priceAmount": 2500,
                "images": ["https://cdn.banibs.com/marketplace/placeholder.jpg"],
                "location": "Virtual",
                "deliveryMethod": "virtual",
                "verifiedBusiness": True,
                "viewCount": 891,
                "inquiryCount": 45,
                "createdAt": "2025-10-20T14:30:00Z"
            }
        ],
        "nextPage": 2,
        "total": 47,
        "hasMore": True
    }


@router.get("/crowdfunding/campaigns")
async def get_crowdfunding_campaigns_stub(
    category: Optional[str] = None,
    status: str = "active",
    page: int = 1
):
    """
    STUB: Browse crowdfunding campaigns
    
    Real implementation (Phase 6.4):
    - Query crowdfunding_campaigns collection
    - Filter by category, status
    - Calculate funding percentage
    - Include creator profiles
    - Sort by trending or recent
    """
    return {
        "campaigns": [
            {
                "id": "campaign-001",
                "creatorId": "user-005",
                "creator": {
                    "name": "Layla Robinson",
                    "avatarUrl": "https://cdn.banibs.com/avatars/placeholder.jpg"
                },
                "title": "Community Youth STEM Program",
                "description": "Building a technology learning center for underserved youth in Detroit",
                "category": "Education",
                "goalAmount": 50000,
                "currentAmount": 32450,
                "backerCount": 156,
                "fundingPercentage": 64.9,
                "daysRemaining": 18,
                "status": "active",
                "images": ["https://cdn.banibs.com/campaigns/placeholder.jpg"],
                "createdAt": "2025-10-01T08:00:00Z",
                "endDate": "2025-11-19T23:59:59Z"
            },
            {
                "id": "campaign-002",
                "creatorId": "user-006",
                "creator": {
                    "name": "Indigenous Artisans Collective",
                    "avatarUrl": "https://cdn.banibs.com/avatars/placeholder.jpg"
                },
                "title": "Native American Craft Marketplace Launch",
                "description": "Creating an online platform to connect traditional artisans with global customers",
                "category": "Business",
                "goalAmount": 25000,
                "currentAmount": 18750,
                "backerCount": 89,
                "fundingPercentage": 75.0,
                "daysRemaining": 25,
                "status": "active",
                "images": ["https://cdn.banibs.com/campaigns/placeholder.jpg"],
                "createdAt": "2025-10-10T12:00:00Z",
                "endDate": "2025-11-26T23:59:59Z"
            }
        ],
        "nextPage": 2,
        "total": 23,
        "hasMore": True
    }


# ============================================
# Phase 6.5 - Education & Translation Stubs
# ============================================

@router.post("/translate")
async def translate_text_stub():
    """
    STUB: Translate text
    
    Real implementation (Phase 6.5):
    - Try DeepL API first
    - Fallback to GPT-5 if DeepL fails
    - Cache translation in translations_cache
    - Check user tier limits
    - Return translated text + metadata
    """
    return {
        "translatedText": "[Translated version of your text]",
        "sourceLang": "en",
        "targetLang": "es",
        "provider": "deepl",
        "cached": False
    }


@router.get("/education/languages")
async def get_language_modules_stub():
    """
    STUB: Get available language learning modules
    
    Real implementation (Phase 6.5):
    - Query language_modules collection
    - Group by language family
    - Return module metadata
    - Include progress for authenticated users
    """
    return {
        "languages": [
            {
                "language": "Swahili",
                "family": "Bantu",
                "region": "East Africa",
                "difficulty": "Moderate",
                "moduleCount": 12,
                "phraseCount": 240,
                "completedByUser": 0,
                "thumbnail": "https://cdn.banibs.com/languages/swahili.jpg"
            },
            {
                "language": "Yoruba",
                "family": "Niger-Congo",
                "region": "West Africa",
                "difficulty": "Challenging",
                "moduleCount": 10,
                "phraseCount": 200,
                "completedByUser": 0,
                "thumbnail": "https://cdn.banibs.com/languages/yoruba.jpg"
            },
            {
                "language": "Spanish (Caribbean)",
                "family": "Romance",
                "region": "Caribbean",
                "difficulty": "Easy",
                "moduleCount": 15,
                "phraseCount": 300,
                "completedByUser": 0,
                "thumbnail": "https://cdn.banibs.com/languages/spanish.jpg"
            }
        ]
    }


@router.get("/education/cultures/{region}")
async def get_cultural_guide_stub(region: str):
    """
    STUB: Get regional cultural guide
    
    Real implementation (Phase 6.5):
    - Query cultural_guides collection
    - Filter by region
    - Include do's and don'ts
    - Return related resources
    """
    guides = {
        "west-africa": {
            "region": "West Africa",
            "countries": ["Nigeria", "Ghana", "Senegal", "Mali"],
            "topics": [
                {
                    "topic": "Greetings",
                    "content": "In West African cultures, greetings are lengthy and important...",
                    "doList": [
                        "Always greet elders first",
                        "Use right hand for handshakes",
                        "Ask about family wellbeing"
                    ],
                    "dontList": [
                        "Don't rush greetings",
                        "Don't use left hand for greetings",
                        "Don't ignore hierarchy"
                    ]
                },
                {
                    "topic": "Business Etiquette",
                    "content": "Business relationships are built on personal trust...",
                    "doList": [
                        "Build personal relationships first",
                        "Dress formally for meetings",
                        "Be patient with decision-making"
                    ],
                    "dontList": [
                        "Don't rush to business immediately",
                        "Don't be overly aggressive",
                        "Don't criticize publicly"
                    ]
                }
            ]
        }
    }
    
    return guides.get(region.lower(), {"error": "Region not found"})


# ============================================
# Phase 6.6 - Navigation Stubs
# ============================================

@router.get("/search")
async def unified_search_stub(
    q: str,
    filter: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """
    STUB: Unified search across BANIBS
    
    Real implementation (Phase 6.6):
    - Search news_items
    - Search social_posts
    - Search users/profiles
    - Search marketplace_listings
    - Search crowdfunding_campaigns
    - Search education resources
    - Rank by relevance
    - Paginate results
    """
    return {
        "query": q,
        "results": [
            {
                "type": "news",
                "id": "news-123",
                "title": f"News article matching '{q}'",
                "snippet": f"This article discusses {q} in the context of...",
                "url": "/news/article/news-123",
                "imageUrl": "https://cdn.banibs.com/news/placeholder.jpg",
                "createdAt": "2025-11-01T10:00:00Z"
            },
            {
                "type": "social_post",
                "id": "post-456",
                "content": f"Social post about {q}...",
                "author": "Maya Johnson",
                "url": "/social/post/post-456",
                "createdAt": "2025-11-01T09:30:00Z"
            },
            {
                "type": "marketplace_listing",
                "id": "listing-789",
                "title": f"Service related to {q}",
                "category": "Services",
                "url": "/marketplace/listing/listing-789",
                "imageUrl": "https://cdn.banibs.com/marketplace/placeholder.jpg",
                "price": "$500",
                "seller": "Marcus Tech Solutions"
            }
        ],
        "filters": {
            "news": 12,
            "social": 8,
            "users": 3,
            "businesses": 5,
            "marketplace": 7,
            "campaigns": 2,
            "education": 4
        },
        "nextPage": 2,
        "total": 41
    }


@router.get("/notifications")
async def get_notifications_stub(unreadOnly: bool = False, page: int = 1):
    """
    STUB: Get user notifications
    
    Real implementation (Phase 6.6):
    - Query notifications collection
    - Filter by user_id
    - Filter by read status
    - Group by type
    - Sort by recency
    - Mark as delivered
    """
    return {
        "notifications": [
            {
                "id": "notif-001",
                "type": "like",
                "actorId": "user-007",
                "actor": {
                    "name": "Jordan Williams",
                    "avatarUrl": "https://cdn.banibs.com/avatars/placeholder.jpg"
                },
                "targetType": "post",
                "targetId": "post-001",
                "message": "Jordan Williams liked your post",
                "link": "/social/post/post-001",
                "read": False,
                "createdAt": "2025-11-01T11:30:00Z"
            },
            {
                "id": "notif-002",
                "type": "comment",
                "actorId": "user-008",
                "actor": {
                    "name": "Amara Okonkwo",
                    "avatarUrl": "https://cdn.banibs.com/avatars/placeholder.jpg"
                },
                "targetType": "post",
                "targetId": "post-002",
                "message": "Amara Okonkwo commented on your post",
                "link": "/social/post/post-002#comment-123",
                "read": False,
                "createdAt": "2025-11-01T10:45:00Z"
            },
            {
                "id": "notif-003",
                "type": "inquiry",
                "actorId": "user-009",
                "actor": {
                    "name": "Tyler Jackson",
                    "avatarUrl": "https://cdn.banibs.com/avatars/placeholder.jpg"
                },
                "targetType": "listing",
                "targetId": "listing-001",
                "message": "New inquiry on your marketplace listing",
                "link": "/marketplace/inquiries",
                "read": True,
                "createdAt": "2025-10-31T16:20:00Z"
            }
        ],
        "unreadCount": 2,
        "nextPage": None,
        "hasMore": False
    }


# ============================================
# Stub Router Registration
# ============================================

@router.get("/status")
async def stub_status():
    """
    Check stub endpoint status
    """
    return {
        "status": "active",
        "version": "1.3.2",
        "message": "Phase 6 stub endpoints are active",
        "warning": "These are MOCK endpoints - replace with real implementations",
        "stubEndpoints": {
            "social": {
                "GET /api/stubs/social/feed": "Personalized social feed",
                "POST /api/stubs/social/posts": "Create post",
                "GET /api/stubs/social/boards/{region}": "Regional community board"
            },
            "marketplace": {
                "GET /api/stubs/marketplace/listings": "Browse marketplace",
                "GET /api/stubs/crowdfunding/campaigns": "Browse campaigns"
            },
            "education": {
                "POST /api/stubs/translate": "Translate text",
                "GET /api/stubs/education/languages": "Language modules",
                "GET /api/stubs/education/cultures/{region}": "Cultural guides"
            },
            "navigation": {
                "GET /api/stubs/search": "Unified search",
                "GET /api/stubs/notifications": "User notifications"
            }
        },
        "nextSteps": [
            "Test frontend integration with stub endpoints",
            "Validate API contracts",
            "Begin Phase 6.0 implementation (SSO)",
            "Replace stubs with real implementations phase by phase"
        ]
    }
