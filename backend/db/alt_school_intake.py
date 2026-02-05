"""
Alternative School Hub - Tutor Intake Database Operations
Phase-0.5: CRUD for educator intake submissions

Collection: tutor_intake_submissions
"""

import uuid
from datetime import datetime, timezone
from typing import Optional, List
from db.connection import get_db


async def create_intake_submission(data: dict) -> dict:
    """Create a new tutor intake submission (public)"""
    db = await get_db()
    
    now = datetime.now(timezone.utc)
    submission = {
        "id": str(uuid.uuid4()),
        "name": data["name"],
        "email": data["email"],
        "phone": data.get("phone"),
        "location": data["location"],
        "subject_focus": data["subject_focus"],
        "age_grade_range": data["age_grade_range"],
        "bio": data["bio"],
        "website": data.get("website"),
        "availability": data.get("availability"),
        "status": "new",
        "notes": None,
        "created_at": now,
        "updated_at": None
    }
    
    await db.tutor_intake_submissions.insert_one(submission)
    
    # Return without _id
    submission.pop("_id", None)
    return submission


async def get_all_intake_submissions(
    status_filter: Optional[str] = None,
    limit: int = 100
) -> List[dict]:
    """Get all intake submissions (admin only)"""
    db = await get_db()
    
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    submissions = []
    async for doc in db.tutor_intake_submissions.find(query, {"_id": 0}).sort("created_at", -1).limit(limit):
        submissions.append(doc)
    
    return submissions


async def get_intake_submission_by_id(submission_id: str) -> Optional[dict]:
    """Get a single intake submission by ID (admin only)"""
    db = await get_db()
    return await db.tutor_intake_submissions.find_one({"id": submission_id}, {"_id": 0})


async def update_intake_submission(submission_id: str, data: dict) -> Optional[dict]:
    """Update an intake submission (admin only)"""
    db = await get_db()
    
    # Only allow updating status and notes
    update_data = {}
    if "status" in data and data["status"] is not None:
        update_data["status"] = data["status"]
    if "notes" in data:
        update_data["notes"] = data["notes"]
    
    if not update_data:
        return await get_intake_submission_by_id(submission_id)
    
    update_data["updated_at"] = datetime.now(timezone.utc)
    
    result = await db.tutor_intake_submissions.update_one(
        {"id": submission_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        return None
    
    return await get_intake_submission_by_id(submission_id)


async def delete_intake_submission(submission_id: str) -> bool:
    """Delete an intake submission (admin only)"""
    db = await get_db()
    result = await db.tutor_intake_submissions.delete_one({"id": submission_id})
    return result.deleted_count > 0


async def get_intake_stats() -> dict:
    """Get intake submission statistics (admin only)"""
    db = await get_db()
    
    pipeline = [
        {
            "$group": {
                "_id": "$status",
                "count": {"$sum": 1}
            }
        }
    ]
    
    stats = {"new": 0, "reviewed": 0, "approved": 0, "rejected": 0, "total": 0}
    async for doc in db.tutor_intake_submissions.aggregate(pipeline):
        status = doc["_id"]
        count = doc["count"]
        if status in stats:
            stats[status] = count
        stats["total"] += count
    
    return stats
