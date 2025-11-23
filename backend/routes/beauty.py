"""
BANIBS Beauty & Wellness Portal - API Routes
Phase 11.1
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from typing import List, Optional
from uuid import uuid4

from models.beauty import (
    BeautyProvider,
    BeautyProviderCreate,
    BeautyProvidersResponse,
    BeautyPost,
    BeautyPostCreate,
    BeautyPostsResponse,
    BeautyEducationArticle,
    BeautySpendCreate,
    BeautySpendSnapshot
)
from middleware.auth_guard import require_role, get_current_user_optional
from db.beauty import (
    create_beauty_provider,
    get_beauty_providers,
    get_provider_by_id,
    create_beauty_post,
    get_beauty_posts,
    get_post_by_id,
    delete_beauty_post,
    get_education_articles,
    get_article_by_id,
    create_spending_snapshot,
    get_user_spending_snapshots,
    enrich_posts_with_user_info
)


router = APIRouter(prefix="/api/beauty", tags=["Beauty & Wellness"])


# ============= Provider Routes =============

@router.get("/providers", response_model=BeautyProvidersResponse)
async def list_beauty_providers(
    type: Optional[str] = Query(None),
    location: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Get all beauty providers
    Public endpoint - anyone can browse providers
    
    Filters:
    - type: hair, skincare, lashes, nails, barber, etc.
    - location: search by city/state
    """
    providers, total = await get_beauty_providers(
        provider_type=type,
        location=location,
        page=page,
        limit=limit
    )
    
    return {
        "providers": providers,
        "total": total
    }


@router.post("/provider", response_model=BeautyProvider, status_code=status.HTTP_201_CREATED)
async def create_provider(
    provider_data: BeautyProviderCreate,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Create a new beauty provider listing
    Requires authentication
    """
    provider_id = str(uuid4())
    provider = await create_beauty_provider(
        provider_data.model_dump(),
        provider_id
    )
    
    return provider


@router.get("/provider/{provider_id}", response_model=BeautyProvider)
async def get_provider(provider_id: str):
    """Get a specific beauty provider by ID"""
    provider = await get_provider_by_id(provider_id)
    if not provider:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beauty provider not found"
        )
    return provider


# ============= Beauty Board Routes =============

@router.get("/posts", response_model=BeautyPostsResponse)
async def list_beauty_posts(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100)
):
    """
    Get beauty board posts
    Public endpoint
    
    Filters:
    - category: tip, question, empowerment, recommendation
    """
    posts, total = await get_beauty_posts(
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


@router.post("/post", response_model=BeautyPost, status_code=status.HTTP_201_CREATED)
async def create_post(
    post_data: BeautyPostCreate,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Create a new beauty board post
    Requires authentication
    Can be posted anonymously (name hidden from others, but user_id stored)
    """
    post_id = str(uuid4())
    post = await create_beauty_post(
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
    Delete a beauty post
    Users can only delete their own posts
    Admins can delete any post
    """
    # Get post
    post = await get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beauty post not found"
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
    deleted = await delete_beauty_post(post_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete post"
        )


# ============= Education Routes =============

@router.get("/education", response_model=List[BeautyEducationArticle])
async def list_education_articles(
    tags: Optional[List[str]] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=50)
):
    """
    Get beauty education articles
    Public endpoint
    """
    articles, total = await get_education_articles(
        tags=tags,
        page=page,
        limit=limit
    )
    
    return articles


@router.get("/education/{article_id}", response_model=BeautyEducationArticle)
async def get_education_article(article_id: str):
    """Get a specific education article by ID"""
    article = await get_article_by_id(article_id)
    if not article:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Education article not found"
        )
    return article


# ============= Spending Calculator Routes =============

@router.post("/spending", response_model=BeautySpendSnapshot, status_code=status.HTTP_201_CREATED)
async def create_spending(
    spending_data: BeautySpendCreate,
    current_user: dict = Depends(require_role("user", "member"))
):
    """
    Create a beauty spending snapshot
    Requires authentication
    Calculates yearly spend and provides savings insights
    """
    snapshot_id = str(uuid4())
    snapshot = await create_spending_snapshot(
        user_id=current_user["id"],
        monthly_spend=spending_data.monthly_spend,
        categories=spending_data.categories or {},
        snapshot_id=snapshot_id
    )
    
    return snapshot


@router.get("/spending/{user_id}", response_model=List[BeautySpendSnapshot])
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
