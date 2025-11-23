"""
BANIBS Sneakers & Fashion Ownership Portal - API Routes
Phase 11.2
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from uuid import uuid4

from models.fashion import (
    FashionBrand,
    FashionBrandCreate,
    FashionBrandsResponse,
    FashionPost,
    FashionPostCreate,
    FashionPostsResponse,
    FashionEducationArticle,
    FashionSpendCreate,
    FashionSpendSnapshot
)
from middleware.auth_guard import require_role, get_current_user_optional
from db.fashion import (
    create_fashion_brand,
    get_fashion_brands,
    get_brand_by_id,
    create_fashion_post,
    get_fashion_posts,
    get_post_by_id,
    delete_fashion_post,
    get_education_articles,
    get_article_by_id,
    create_spending_snapshot,
    get_user_spending_snapshots,
    enrich_posts_with_user_info
)


router = APIRouter(prefix="/api/fashion", tags=["Sneakers & Fashion"])


# ============= Brand Routes =============

@router.get("/brands", response_model=FashionBrandsResponse)
async def list_fashion_brands(
    type: Optional[str] = Query(None),
    country: Optional[str] = Query(None),
    city: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Get all Black-owned fashion brands
    Public endpoint - anyone can browse brands
    
    Filters:
    - type: sneaker, clothing, accessory, boutique, designer, customizer
    - country: search by country
    - city: search by city
    """
    brands, total = await get_fashion_brands(
        brand_type=type,
        country=country,
        city=city,
        page=page,
        limit=limit
    )
    
    return {
        "brands": brands,
        "total": total
    }


@router.post("/brand", response_model=FashionBrand, status_code=status.HTTP_201_CREATED)
async def create_brand(
    brand_data: FashionBrandCreate,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Create a new fashion brand listing
    Requires authentication
    """
    brand_id = str(uuid4())
    brand = await create_fashion_brand(
        brand_data.model_dump(),
        brand_id
    )
    
    return brand


@router.get("/brand/{brand_id}", response_model=FashionBrand)
async def get_brand(brand_id: str):
    """Get a specific fashion brand by ID"""
    brand = await get_brand_by_id(brand_id)
    if not brand:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fashion brand not found"
        )
    return brand


# ============= Fashion Board Routes =============

@router.get("/posts", response_model=FashionPostsResponse)
async def list_fashion_posts(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Get fashion board posts
    Public endpoint
    
    Filters:
    - category: idea, question, win, resource
    """
    posts, total = await get_fashion_posts(
        category=category,
        page=page,
        limit=limit
    )
    
    # Enrich with user info
    enriched_posts = await enrich_posts_with_user_info(posts)
    
    return {
        "posts": enriched_posts,
        "total": total
    }


@router.post("/post", response_model=FashionPost, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: FashionPostCreate,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Create a new fashion board post
    Requires authentication
    Can be posted anonymously (name hidden from others, but user_id stored)
    """
    post_id = str(uuid4())
    post = await create_fashion_post(
        user_id=current_user["id"],
        content=post_data.content,
        category=post_data.category,
        anonymous=post_data.anonymous,
        post_id=post_id
    )
    
    # Enrich with user info
    enriched_posts = await enrich_posts_with_user_info([post])
    
    return enriched_posts[0]


@router.delete("/post/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post(
    post_id: str,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Delete a fashion post
    Users can only delete their own posts
    Admins can delete any post
    """
    # Get post
    post = await get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Fashion post not found"
        )
    
    # Check ownership or admin
    is_admin = "admin" in current_user.get("roles", []) or "moderator" in current_user.get("roles", [])
    is_owner = post["user_id"] == current_user["id"]
    
    if not is_owner and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own posts"
        )
    
    # Delete post
    deleted = await delete_fashion_post(post_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete post"
        )


# ============= Education Routes =============

@router.get("/education", response_model=List[FashionEducationArticle])
async def list_education_articles(
    tags: Optional[List[str]] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50)
):
    """
    Get fashion education articles
    Public endpoint
    """
    articles, total = await get_education_articles(
        tags=tags,
        page=page,
        limit=limit
    )
    
    return articles


@router.get("/education/{article_id}", response_model=FashionEducationArticle)
async def get_education_article(article_id: str):
    """Get a specific education article by ID"""
    article = await get_article_by_id(article_id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education article not found"
        )
    return article


# ============= Spending Tool Routes =============

@router.post("/spend", response_model=FashionSpendSnapshot, status_code=status.HTTP_201_CREATED)
async def create_spending(
    spending_data: FashionSpendCreate,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Create a fashion spending snapshot
    Requires authentication
    Calculates annual spend and 10% ownership amount
    """
    snapshot_id = str(uuid4())
    snapshot = await create_spending_snapshot(
        user_id=current_user["id"],
        pairs_per_year=spending_data.pairs_per_year,
        avg_price=spending_data.avg_price,
        snapshot_id=snapshot_id
    )
    
    return snapshot


@router.get("/spend/{user_id}", response_model=List[FashionSpendSnapshot])
async def get_spending_history(
    user_id: str,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Get user's spending history
    Users can only view their own spending
    """
    # Check ownership
    if user_id != current_user["id"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own spending"
        )
    
    snapshots = await get_user_spending_snapshots(user_id)
    return snapshots
