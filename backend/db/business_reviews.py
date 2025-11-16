"""
Business Reviews Database Operations - Phase 7.1
BANIBS Professional Reputation Layer
"""

from datetime import datetime, timezone
from uuid import uuid4
from typing import Optional, List
from backend.db.connection import get_db


async def create_business_review(
    business_profile_id: str,
    reviewer_user_id: str,
    rating: int,
    review_text: Optional[str] = None,
    category: str = "general"
):
    """Create a new business review"""
    db = await get_db()
    
    # Check if user already reviewed this business
    existing = await db.business_reviews.find_one({
        "business_profile_id": business_profile_id,
        "reviewer_user_id": reviewer_user_id
    })
    
    if existing:
        # Update existing review instead
        await db.business_reviews.update_one(
            {"id": existing["id"]},
            {
                "$set": {
                    "rating": rating,
                    "review_text": review_text,
                    "category": category,
                    "updated_at": datetime.now(timezone.utc)
                }
            }
        )
        return await get_review_by_id(existing["id"])
    
    # Create new review
    review = {
        "id": str(uuid4()),
        "business_profile_id": business_profile_id,
        "reviewer_user_id": reviewer_user_id,
        "rating": rating,
        "review_text": review_text,
        "category": category,
        "created_at": datetime.now(timezone.utc),
        "updated_at": datetime.now(timezone.utc)
    }
    
    await db.business_reviews.insert_one(review)
    
    # Update business profile rating stats
    await update_business_rating_stats(business_profile_id)
    
    return await get_review_by_id(review["id"])


async def get_review_by_id(review_id: str):
    """Get review by ID with enrichment"""
    db = await get_db()
    
    review = await db.business_reviews.find_one({"id": review_id}, {"_id": 0})
    
    if not review:
        return None
    
    # Enrich with business data
    if review.get("business_profile_id"):
        business = await db.business_profiles.find_one(
            {"id": review["business_profile_id"]},
            {"_id": 0, "name": 1, "handle": 1, "logo": 1}
        )
        if business:
            review["business_name"] = business.get("name")
            review["business_handle"] = business.get("handle")
            review["business_logo"] = business.get("logo")
    
    # Enrich with reviewer data
    if review.get("reviewer_user_id"):
        user = await db.users.find_one(
            {"id": review["reviewer_user_id"]},
            {"_id": 0, "name": 1, "avatar": 1}
        )
        if user:
            review["reviewer_name"] = user.get("name")
            review["reviewer_avatar"] = user.get("avatar")
    
    return review


async def get_reviews_for_business(
    business_profile_id: str,
    page: int = 1,
    limit: int = 20
):
    """Get all reviews for a business with pagination"""
    db = await get_db()
    
    # Get total count
    total = await db.business_reviews.count_documents({
        "business_profile_id": business_profile_id
    })
    
    # Get paginated reviews
    skip = (page - 1) * limit
    reviews = await db.business_reviews.find(
        {"business_profile_id": business_profile_id},
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=limit)
    
    # Enrich each review
    for review in reviews:
        # Enrich with reviewer data
        if review.get("reviewer_user_id"):
            user = await db.users.find_one(
                {"id": review["reviewer_user_id"]},
                {"_id": 0, "name": 1, "avatar": 1}
            )
            if user:
                review["reviewer_name"] = user.get("name")
                review["reviewer_avatar"] = user.get("avatar")
    
    return {
        "reviews": reviews,
        "total": total,
        "page": page,
        "pages": (total + limit - 1) // limit
    }


async def get_reviews_by_user(reviewer_user_id: str):
    """Get all reviews written by a user"""
    db = await get_db()
    
    reviews = await db.business_reviews.find(
        {"reviewer_user_id": reviewer_user_id},
        {"_id": 0}
    ).sort("created_at", -1).to_list(length=1000)
    
    # Enrich with business data
    for review in reviews:
        if review.get("business_profile_id"):
            business = await db.business_profiles.find_one(
                {"id": review["business_profile_id"]},
                {"_id": 0, "name": 1, "handle": 1, "logo": 1}
            )
            if business:
                review["business_name"] = business.get("name")
                review["business_handle"] = business.get("handle")
                review["business_logo"] = business.get("logo")
    
    return reviews


async def get_rating_stats(business_profile_id: str):
    """Get aggregated rating statistics for a business"""
    db = await get_db()
    
    # Get all reviews
    reviews = await db.business_reviews.find(
        {"business_profile_id": business_profile_id},
        {"_id": 0, "rating": 1}
    ).to_list(length=10000)
    
    if not reviews:
        return {
            "business_profile_id": business_profile_id,
            "average_rating": 0.0,
            "total_reviews": 0,
            "rating_distribution": {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
        }
    
    # Calculate stats
    total_reviews = len(reviews)
    total_rating = sum(r["rating"] for r in reviews)
    average_rating = round(total_rating / total_reviews, 1)
    
    # Rating distribution
    distribution = {"5": 0, "4": 0, "3": 0, "2": 0, "1": 0}
    for review in reviews:
        rating_str = str(review["rating"])
        distribution[rating_str] += 1
    
    return {
        "business_profile_id": business_profile_id,
        "average_rating": average_rating,
        "total_reviews": total_reviews,
        "rating_distribution": distribution
    }


async def update_business_rating_stats(business_profile_id: str):
    """Update business profile with aggregated rating stats"""
    db = await get_db()
    
    stats = await get_rating_stats(business_profile_id)
    
    await db.business_profiles.update_one(
        {"id": business_profile_id},
        {
            "$set": {
                "average_rating": stats["average_rating"],
                "total_reviews": stats["total_reviews"]
            }
        }
    )


async def check_user_reviewed(business_profile_id: str, reviewer_user_id: str):
    """Check if user has already reviewed this business"""
    db = await get_db()
    
    review = await db.business_reviews.find_one(
        {
            "business_profile_id": business_profile_id,
            "reviewer_user_id": reviewer_user_id
        },
        {"_id": 0}
    )
    
    return review
