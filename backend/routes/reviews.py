"""
Business Reviews API Routes - Phase 7.1
BANIBS Professional Reputation Layer
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional, List
from models.business_review import (
    BusinessReviewCreate, BusinessReview, BusinessRatingStats
)
from db import business_reviews as db_reviews
from middleware.auth_guard import require_role

router = APIRouter(prefix="/api/reviews", tags=["Business Reviews"])


@router.post("", response_model=BusinessReview, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: BusinessReviewCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Create or update a review for a business
    Users can only have one review per business (updates if exists)
    """
    review = await db_reviews.create_business_review(
        business_profile_id=review_data.business_profile_id,
        reviewer_user_id=current_user["id"],
        rating=review_data.rating,
        review_text=review_data.review_text,
        category=review_data.category
    )
    
    return review


@router.get("/business/{business_profile_id}", response_model=dict)
async def get_business_reviews(
    business_profile_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Get all reviews for a business (public endpoint)
    """
    result = await db_reviews.get_reviews_for_business(
        business_profile_id=business_profile_id,
        page=page,
        limit=limit
    )
    
    return result


@router.get("/mine", response_model=List[BusinessReview])
async def get_my_reviews(
    current_user=Depends(require_role("user", "member"))
):
    """
    Get all reviews written by current user
    """
    reviews = await db_reviews.get_reviews_by_user(current_user["id"])
    return reviews


@router.get("/stats/{business_profile_id}", response_model=BusinessRatingStats)
async def get_business_rating_stats(business_profile_id: str):
    """
    Get aggregated rating statistics for a business (public endpoint)
    """
    stats = await db_reviews.get_rating_stats(business_profile_id)
    return stats


@router.get("/check/{business_profile_id}")
async def check_if_reviewed(
    business_profile_id: str,
    current_user=Depends(require_role("user", "member"))
):
    """
    Check if current user has reviewed this business
    Returns the review if it exists, null otherwise
    """
    review = await db_reviews.check_user_reviewed(
        business_profile_id=business_profile_id,
        reviewer_user_id=current_user["id"]
    )
    
    if review:
        # Enrich the review
        enriched = await db_reviews.get_review_by_id(review["id"])
        return enriched
    
    return None
