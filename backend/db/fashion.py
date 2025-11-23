"""
BANIBS Sneakers & Fashion Ownership Portal - Database Operations
Phase 11.2
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
from db.connection import get_db_client


# ============= Fashion Brands =============

async def create_fashion_brand(brand_data: dict, brand_id: str) -> dict:
    """Create a new fashion brand"""
    db = get_db_client()
    
    now = datetime.now(timezone.utc)
    brand = {
        **brand_data,
        "id": brand_id,
        "is_black_owned": True,
        "created_at": now
    }
    
    await db.fashion_brands.insert_one(brand)
    return brand


async def get_fashion_brands(
    brand_type: Optional[str] = None,
    country: Optional[str] = None,
    city: Optional[str] = None,
    page: int = 1,
    limit: int = 50
) -> tuple[List[dict], int]:
    """
    Get fashion brands with filters
    Returns (brands, total_count)
    """
    db = get_db_client()
    
    # Build query
    query = {}
    if brand_type:
        query["type"] = brand_type
    if country:
        query["country"] = {"$regex": country, "$options": "i"}
    if city:
        query["city"] = {"$regex": city, "$options": "i"}
    
    # Count total
    total = await db.fashion_brands.count_documents(query)
    
    # Fetch brands
    skip = (page - 1) * limit
    brands = await db.fashion_brands.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return brands, total


async def get_brand_by_id(brand_id: str) -> Optional[dict]:
    """Get a fashion brand by ID"""
    db = get_db_client()
    brand = await db.fashion_brands.find_one(
        {"id": brand_id},
        {"_id": 0}
    )
    return brand


# ============= Fashion Board Posts =============

async def create_fashion_post(
    user_id: str,
    content: str,
    category: str,
    anonymous: bool,
    post_id: str
) -> dict:
    """Create a new fashion board post"""
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
    
    await db.fashion_posts.insert_one(post)
    return post


async def get_fashion_posts(
    category: Optional[str] = None,
    page: int = 1,
    limit: int = 50
) -> tuple[List[dict], int]:
    """
    Get fashion board posts with optional category filter
    Returns (posts, total_count)
    """
    db = get_db_client()
    
    # Build query
    query = {}
    if category:
        query["category"] = category
    
    # Count total
    total = await db.fashion_posts.count_documents(query)
    
    # Fetch posts (sorted by most recent first)
    skip = (page - 1) * limit
    posts = await db.fashion_posts.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return posts, total


async def get_post_by_id(post_id: str) -> Optional[dict]:
    """Get a fashion post by ID"""
    db = get_db_client()
    post = await db.fashion_posts.find_one(
        {"id": post_id},
        {"_id": 0}
    )
    return post


async def delete_fashion_post(post_id: str) -> bool:
    """Delete a fashion post"""
    db = get_db_client()
    result = await db.fashion_posts.delete_one({"id": post_id})
    return result.deleted_count > 0


# ============= Fashion Education =============

async def get_education_articles(
    tags: Optional[List[str]] = None,
    page: int = 1,
    limit: int = 20
) -> tuple[List[dict], int]:
    """Get fashion education articles"""
    db = get_db_client()
    
    # Build query
    query = {}
    if tags:
        query["tags"] = {"$in": tags}
    
    # Count total
    total = await db.fashion_education.count_documents(query)
    
    # Fetch articles
    skip = (page - 1) * limit
    articles = await db.fashion_education.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    return articles, total


async def get_article_by_id(article_id: str) -> Optional[dict]:
    """Get an education article by ID"""
    db = get_db_client()
    article = await db.fashion_education.find_one(
        {"id": article_id},
        {"_id": 0}
    )
    return article


# ============= Fashion Spending =============

async def create_spending_snapshot(
    user_id: str,
    pairs_per_year: int,
    avg_price: float,
    snapshot_id: str
) -> dict:
    """Create a fashion spending snapshot"""
    db = get_db_client()
    
    now = datetime.now(timezone.utc)
    annual_spend = pairs_per_year * avg_price
    ten_percent = annual_spend * 0.1
    
    snapshot = {
        "id": snapshot_id,
        "user_id": user_id,
        "pairs_per_year": pairs_per_year,
        "avg_price": avg_price,
        "annual_spend": annual_spend,
        "ten_percent_amount": ten_percent,
        "created_at": now
    }
    
    await db.fashion_spending.insert_one(snapshot)
    return snapshot


async def get_user_spending_snapshots(
    user_id: str,
    limit: int = 10
) -> List[dict]:
    """Get user's spending snapshots"""
    db = get_db_client()
    
    snapshots = await db.fashion_spending.find(
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
