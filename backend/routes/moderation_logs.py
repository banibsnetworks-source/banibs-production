from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import Optional
from datetime import datetime
import csv
import io

from db.connection import get_db
from db.moderation_logs import (
    get_moderation_logs_for_opportunity,
    get_moderation_logs_by_moderator,
    get_all_moderation_logs
)
from models.moderation_log import ModerationLogPublic
from middleware.auth_guard import require_role

router = APIRouter(prefix="/api/admin/moderation-log", tags=["moderation-logs"])

@router.get("/opportunities/{opportunity_id}", response_model=list[ModerationLogPublic])
async def get_opportunity_moderation_logs(
    opportunity_id: str,
    db=Depends(get_db),
    user: dict = Depends(require_role("admin"))
):
    """
    Phase 3.2 - Get all moderation logs for a specific opportunity
    Admin only
    """
    logs = await get_moderation_logs_for_opportunity(db, opportunity_id)
    
    # Enrich with moderator email
    enriched_logs = []
    for log in logs:
        # Fetch moderator email from users collection
        moderator = await db.users.find_one({"_id": log["moderator_user_id"]})
        moderator_email = moderator.get("email") if moderator else None
        
        enriched_logs.append(ModerationLogPublic(
            id=str(log["_id"]),
            opportunity_id=log["opportunity_id"],
            moderator_user_id=log["moderator_user_id"],
            moderator_email=moderator_email,
            action_type=log["action_type"],
            note=log.get("note"),
            timestamp=log["timestamp"]
        ))
    
    return enriched_logs

@router.get("/", response_model=list[ModerationLogPublic])
async def get_moderation_logs(
    moderator_user_id: Optional[str] = None,
    db=Depends(get_db),
    user: dict = Depends(require_role("admin"))
):
    """
    Phase 3.2 - Get moderation logs, optionally filtered by moderator
    Admin only
    """
    if moderator_user_id:
        logs = await get_moderation_logs_by_moderator(db, moderator_user_id)
    else:
        logs = await get_all_moderation_logs(db)
    
    # Enrich with moderator email
    enriched_logs = []
    for log in logs:
        moderator = await db.users.find_one({"_id": log["moderator_user_id"]})
        moderator_email = moderator.get("email") if moderator else None
        
        enriched_logs.append(ModerationLogPublic(
            id=str(log["_id"]),
            opportunity_id=log["opportunity_id"],
            moderator_user_id=log["moderator_user_id"],
            moderator_email=moderator_email,
            action_type=log["action_type"],
            note=log.get("note"),
            timestamp=log["timestamp"]
        ))
    
    return enriched_logs

@router.get("/export.csv")
async def export_moderation_logs_csv(
    moderator_user_id: Optional[str] = None,
    db=Depends(get_db),
    user: dict = Depends(require_role("admin"))
):
    """
    Phase 3.2 - Export moderation logs to CSV
    Admin only
    """
    if moderator_user_id:
        logs = await get_moderation_logs_by_moderator(db, moderator_user_id)
    else:
        logs = await get_all_moderation_logs(db)
    
    # Create CSV in memory
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Write header
    writer.writerow([
        "Log ID",
        "Opportunity ID",
        "Moderator User ID",
        "Moderator Email",
        "Action Type",
        "Note",
        "Timestamp"
    ])
    
    # Write data rows
    for log in logs:
        # Fetch moderator email
        moderator = await db.users.find_one({"_id": log["moderator_user_id"]})
        moderator_email = moderator.get("email") if moderator else "Unknown"
        
        writer.writerow([
            str(log["_id"]),
            log["opportunity_id"],
            log["moderator_user_id"],
            moderator_email,
            log["action_type"],
            log.get("note", ""),
            log["timestamp"].isoformat()
        ])
    
    # Return CSV as streaming response
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename=moderation_logs_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}.csv"
        }
    )
