"""
Phase 7.5.3 - Feedback Database Helper
MongoDB operations for user feedback
"""
import os
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import List, Optional
import uuid

# MongoDB connection
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client[os.environ['DB_NAME']]
feedback_collection = db.feedback


async def create_feedback(
    rating: int,
    feedback_text: str,
    category: str,
    email: Optional[str] = None,
    page_url: Optional[str] = None,
    user_agent: Optional[str] = None,
    user_id: Optional[str] = None
) -> dict:
    """
    Create a new feedback entry
    
    Args:
        rating: User rating (1-5)
        feedback_text: Feedback message
        category: Feedback category
        email: Optional contact email
        page_url: Page where feedback was submitted
        user_agent: Browser user agent
        user_id: User ID if authenticated
    
    Returns:
        Created feedback document
    """
    feedback_doc = {
        "id": str(uuid.uuid4()),
        "rating": rating,
        "feedback_text": feedback_text,
        "category": category,
        "email": email,
        "page_url": page_url,
        "user_agent": user_agent,
        "user_id": user_id,
        "created_at": datetime.now(timezone.utc),
        "status": "new",
        "admin_notes": None
    }
    
    await feedback_collection.insert_one(feedback_doc)
    return feedback_doc


async def get_feedback_by_id(feedback_id: str) -> Optional[dict]:
    """Get feedback by ID"""
    return await feedback_collection.find_one({"id": feedback_id}, {"_id": 0})


async def get_all_feedback(
    skip: int = 0,
    limit: int = 50,
    status: Optional[str] = None,
    category: Optional[str] = None
) -> List[dict]:
    """
    Get all feedback with optional filtering
    
    Args:
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        status: Filter by status (new, reviewed, resolved)
        category: Filter by category
    
    Returns:
        List of feedback documents
    """
    query = {}
    
    if status:
        query["status"] = status
    
    if category:
        query["category"] = category
    
    cursor = feedback_collection.find(query, {"_id": 0}) \
        .sort("created_at", -1) \
        .skip(skip) \
        .limit(limit)
    
    return await cursor.to_list(length=limit)


async def update_feedback_status(
    feedback_id: str,
    status: str,
    admin_notes: Optional[str] = None
) -> bool:
    """
    Update feedback status and admin notes
    
    Args:
        feedback_id: Feedback ID
        status: New status (new, reviewed, resolved)
        admin_notes: Optional admin notes
    
    Returns:
        True if updated, False if not found
    """
    update_doc = {"status": status}
    
    if admin_notes:
        update_doc["admin_notes"] = admin_notes
    
    result = await feedback_collection.update_one(
        {"id": feedback_id},
        {"$set": update_doc}
    )
    
    return result.modified_count > 0


async def get_feedback_stats() -> dict:
    """
    Get feedback statistics for admin dashboard
    
    Returns:
        Dictionary with counts by status, category, and average rating
    """
    pipeline = [
        {
            "$facet": {
                "by_status": [
                    {"$group": {"_id": "$status", "count": {"$sum": 1}}}
                ],
                "by_category": [
                    {"$group": {"_id": "$category", "count": {"$sum": 1}}}
                ],
                "ratings": [
                    {"$group": {
                        "_id": None,
                        "avg_rating": {"$avg": "$rating"},
                        "total_count": {"$sum": 1}
                    }}
                ]
            }
        }
    ]
    
    result = await feedback_collection.aggregate(pipeline).to_list(length=1)
    
    if not result:
        return {
            "by_status": {},
            "by_category": {},
            "average_rating": 0,
            "total_count": 0
        }
    
    data = result[0]
    
    # Format results
    by_status = {item["_id"]: item["count"] for item in data.get("by_status", [])}
    by_category = {item["_id"]: item["count"] for item in data.get("by_category", [])}
    
    ratings_data = data.get("ratings", [{}])[0]
    average_rating = ratings_data.get("avg_rating", 0)
    total_count = ratings_data.get("total_count", 0)
    
    return {
        "by_status": by_status,
        "by_category": by_category,
        "average_rating": round(average_rating, 2) if average_rating else 0,
        "total_count": total_count
    }


async def delete_feedback(feedback_id: str) -> bool:
    """
    Delete feedback by ID
    
    Args:
        feedback_id: Feedback ID
    
    Returns:
        True if deleted, False if not found
    """
    result = await feedback_collection.delete_one({"id": feedback_id})
    return result.deleted_count > 0
