"""
BANIBS Beauty & Wellness Portal - Database Operations
Phase 11.1
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
from db.connection import get_db_client


# ============= Beauty Providers =============

async def create_beauty_provider(provider_data: dict, provider_id: str) -> dict:
    """Create a new beauty provider"""
    db = get_db_client()
    
    now = datetime.now(timezone.utc)
    provider = {
        **provider_data,
        "id": provider_id,
        "rating": None,
        "review_count": 0,
        "verified": False,
        "created_at": now
    }
    
    await db.beauty_providers.insert_one(provider)
    return provider


async def get_beauty_providers(
    provider_type: Optional[str] = None,
    location: Optional[str] = None,
    page: int = 1,
    limit: int = 50
) -> tuple[List[dict], int]:
    """
    Get beauty providers with filters
    Returns (providers, total_count)
    """
    db = get_db_client()
    
    # Build query
    query = {}
    if provider_type:
        query["type"] = provider_type
    if location:
        # Simple location search (case-insensitive)
        query["location"] = {"$regex": location, "$options": "i"}
    
    # Count total
    total = await db.beauty_providers.count_documents(query)
    
    # Fetch providers
    skip = (page - 1) * limit
    providers = await db.beauty_providers.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return providers, total


async def get_provider_by_id(provider_id: str) -> Optional[dict]:
    """Get a beauty provider by ID"""
    db = get_db_client()
    provider = await db.beauty_providers.find_one(
        {"id": provider_id},
        {"_id": 0}
    )
    return provider


# ============= Beauty Board Posts =============

async def create_beauty_post(
    user_id: str,
    content: str,
    category: str,
    anonymous: bool,
    post_id: str
) -> dict:
    """Create a new beauty board post"""
    db = get_db_client()
    
    now = datetime.now(timezone.utc)
    post = {
        "id": post_id,
        "user_id": user_id,
        "content": content,
        "category": category,
        "anonymous": anonymous,
        "created_at": now
    }
    
    await db.beauty_posts.insert_one(post)
    return post


async def get_beauty_posts(
    category: Optional[str] = None,
    page: int = 1,
    limit: int = 50
) -> tuple[List[dict], int]:
    """
    Get beauty board posts with optional category filter
    Returns (posts, total_count)
    """
    db = get_db_client()
    
    # Build query
    query = {}
    if category:
        query["category"] = category
    
    # Count total
    total = await db.beauty_posts.count_documents(query)
    
    # Fetch posts (sorted by most recent first)
    skip = (page - 1) * limit
    posts = await db.beauty_posts.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return posts, total


async def get_post_by_id(post_id: str) -> Optional[dict]:
    """Get a beauty post by ID"""
    db = get_db_client()
    post = await db.beauty_posts.find_one(
        {"id": post_id},
        {"_id": 0}
    )
    return post


async def delete_beauty_post(post_id: str) -> bool:
    """Delete a beauty post"""
    db = get_db_client()
    result = await db.beauty_posts.delete_one({"id": post_id})
    return result.deleted_count > 0


# ============= Beauty Education =============

async def get_education_articles(
    tags: Optional[List[str]] = None,
    page: int = 1,
    limit: int = 20
) -> tuple[List[dict], int]:
    """Get beauty education articles"""
    db = get_db_client()
    
    # Build query
    query = {}
    if tags:
        query["tags"] = {"$in": tags}
    
    # Count total
    total = await db.beauty_education.count_documents(query)
    
    # Fetch articles
    skip = (page - 1) * limit
    articles = await db.beauty_education.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return articles, total


async def get_article_by_id(article_id: str) -> Optional[dict]:
    """Get an education article by ID"""
    db = get_db_client()
    article = await db.beauty_education.find_one(
        {"id": article_id},
        {"_id": 0}
    )
    return article


# ============= Beauty Spending =============

async def create_spending_snapshot(
    user_id: str,
    monthly_spend: float,
    categories: dict,
    snapshot_id: str
) -> dict:
    """Create a beauty spending snapshot"""
    db = get_db_client()
    
    now = datetime.now(timezone.utc)
    snapshot = {
        "id": snapshot_id,
        "user_id": user_id,
        "monthly_spend": monthly_spend,
        "yearly_spend": monthly_spend * 12,
        "categories": categories,
        "created_at": now
    }
    
    await db.beauty_spending.insert_one(snapshot)
    return snapshot


async def get_user_spending_snapshots(
    user_id: str,
    limit: int = 10
) -> List[dict]:
    """Get user's spending snapshots"""
    db = get_db_client()
    
    snapshots = await db.beauty_spending.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("created_at", -1).limit(limit).to_list(length=limit)
    
    return snapshots


# ============= User Info Enrichment =============

async def enrich_posts_with_user_info(posts: List[dict]) -> List[dict]:
    """
    Enrich posts with author info (if not anonymous)
    """
    db = get_db_client()
    
    # Get unique user IDs (only for non-anonymous posts)
    user_ids = [p["user_id"] for p in posts if not p.get("anonymous", False)]
    
    # Fetch user info
    users = {}
    if user_ids:
        user_docs = await db.banibs_users.find(
            {"id": {"$in": user_ids}},
            {"_id": 0, "id": 1, "first_name": 1, "last_name": 1, "profile_picture_url": 1}
        ).to_list(length=len(user_ids))
        
        users = {u["id"]: u for u in user_docs}
    
    # Enrich posts
    enriched = []
    for post in posts:
        enriched_post = post.copy()
        
        # Add user info if not anonymous
        if not post.get("anonymous", False):
            user = users.get(post["user_id"])
            if user:
                enriched_post["author_name"] = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                enriched_post["author_avatar"] = user.get("profile_picture_url")
        
        enriched.append(enriched_post)
    
    return enriched
