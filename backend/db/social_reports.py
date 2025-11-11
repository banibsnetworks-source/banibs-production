"""
Social Reports Database Operations - Phase 8.3.1
Handles user reports and moderation actions
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
from typing import Optional, List

from db.connection import get_db


async def create_report(
    post_id: str,
    reporter_id: str,
    reason_code: str,
    reason_text: Optional[str] = None
):
    """Create a new report for a post"""
    db = await get_db()
    
    report = {
        "id": str(uuid.uuid4()),
        "post_id": post_id,
        "reporter_id": reporter_id,
        "reason_code": reason_code,  # "spam" | "abuse" | "misinfo" | "other"
        "reason_text": reason_text,
        "status": "pending",  # "pending" | "kept" | "hidden"
        "created_at": datetime.now(timezone.utc),
        "resolved_at": None,
        "resolved_by": None,
        "resolution_note": None
    }
    
    await db.social_reports.insert_one(report)
    return report


async def get_reports(
    status: str = "pending",
    limit: int = 50,
    skip: int = 0
) -> List[dict]:
    """Get reports filtered by status"""
    db = await get_db()
    
    query = {"status": status} if status != "all" else {}
    
    reports = await db.social_reports.find(
        query,
        {"_id": 0}
    ).sort("created_at", -1).skip(skip).limit(limit).to_list(length=None)
    
    # Enrich with post data
    enriched_reports = []
    for report in reports:
        # Get the post
        post = await db.social_posts.find_one(
            {"id": report["post_id"]},
            {"_id": 0, "id": 1, "author_id": 1, "text": 1, "created_at": 1, "moderation_status": 1}
        )
        
        if post:
            # Get post author
            author = await db.banibs_users.find_one(
                {"id": post["author_id"]},
                {"_id": 0, "id": 1, "name": 1}
            )
            
            enriched_reports.append({
                **report,
                "post": {
                    **post,
                    "author": {
                        "id": author["id"] if author else "unknown",
                        "display_name": author.get("name", "Unknown User") if author else "Unknown User"
                    }
                }
            })
    
    return enriched_reports


async def resolve_report(
    report_id: str,
    action: str,  # "keep" or "hide"
    resolved_by: str,
    resolution_note: Optional[str] = None
):
    """Resolve a report by keeping or hiding the post"""
    db = await get_db()
    
    # Get the report
    report = await db.social_reports.find_one({"id": report_id})
    if not report:
        return None
    
    now = datetime.now(timezone.utc)
    
    # Update report status
    new_status = "kept" if action == "keep" else "hidden"
    await db.social_reports.update_one(
        {"id": report_id},
        {
            "$set": {
                "status": new_status,
                "resolved_at": now,
                "resolved_by": resolved_by,
                "resolution_note": resolution_note
            }
        }
    )
    
    # If hiding, update the post
    if action == "hide":
        await db.social_posts.update_one(
            {"id": report["post_id"]},
            {
                "$set": {
                    "is_hidden": True,
                    "moderation_status": "hidden",
                    "moderation_reason": report["reason_code"],
                    "moderation_updated_at": now
                }
            }
        )
    elif action == "keep":
        # If keeping, mark as reviewed
        await db.social_posts.update_one(
            {"id": report["post_id"]},
            {
                "$set": {
                    "moderation_status": "ok",
                    "moderation_updated_at": now
                }
            }
        )
    
    # Get updated report
    updated_report = await db.social_reports.find_one(
        {"id": report_id},
        {"_id": 0}
    )
    
    return updated_report


async def get_report_count(status: str = "pending") -> int:
    """Get count of reports by status"""
    db = await get_db()
    
    query = {"status": status} if status != "all" else {}
    count = await db.social_reports.count_documents(query)
    
    return count
