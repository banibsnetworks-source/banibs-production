"""
Social Moderation API Routes - Phase 8.3.1
User reporting and admin moderation endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta

from middleware.auth_guard import require_role
from db import social_reports as db_reports
from db import social_posts as db_social
from db.connection import get_db

# ADCS v1.0 - Import ADCS guard
from adcs.decorators import adcs_guard
from adcs.models import ADCSActionType, ADCSRiskLevel


router = APIRouter(prefix="/api", tags=["social_moderation"])


# ==========================================
# PYDANTIC MODELS
# ==========================================

class ReportCreate(BaseModel):
    """Create report request"""
    reason_code: str  # "spam" | "abuse" | "misinfo" | "other"
    reason_text: Optional[str] = None


class ReportResolve(BaseModel):
    """Resolve report request"""
    action: str  # "keep" or "hide"
    resolution_note: Optional[str] = None


class UserBanRequest(BaseModel):
    """Ban user request"""
    user_id: str
    reason: str
    duration_days: Optional[int] = None  # None = permanent


class UserUnbanRequest(BaseModel):
    """Unban user request"""
    user_id: str


# ==========================================
# USER ENDPOINTS - Reporting
# ==========================================

@router.post("/social/posts/{post_id}/report", status_code=status.HTTP_201_CREATED)
async def report_post(
    post_id: str,
    report_data: ReportCreate,
    current_user=Depends(require_role("user", "member"))
):
    """
    Report a post for moderation
    Requires authentication
    """
    # Check if post exists and is not already deleted
    post = await db_social.get_post_by_id(post_id)
    if not post:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Post not found"
        )
    
    if post.get("is_deleted"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot report a deleted post"
        )
    
    # Validate reason code
    valid_reasons = ["spam", "abuse", "misinfo", "other"]
    if report_data.reason_code not in valid_reasons:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid reason code. Must be one of: {', '.join(valid_reasons)}"
        )
    
    # Create the report
    report = await db_reports.create_report(
        post_id=post_id,
        reporter_id=current_user["id"],
        reason_code=report_data.reason_code,
        reason_text=report_data.reason_text
    )
    
    return {
        "success": True,
        "report_id": report["id"],
        "status": report["status"],
        "message": "Thank you. Your report has been submitted for review."
    }


# ==========================================
# ADMIN ENDPOINTS - Moderation
# ==========================================

@router.get("/admin/social/reports")
async def list_reports(
    status: str = Query("pending", description="Report status filter"),
    limit: int = Query(50, ge=1, le=200, description="Items per page"),
    skip: int = Query(0, ge=0, description="Skip items"),
    current_user=Depends(require_role("admin", "moderator", "super_admin"))
):
    """
    Get list of reports for moderation queue
    Admin/moderator only
    """
    reports = await db_reports.get_reports(
        status=status,
        limit=limit,
        skip=skip
    )
    
    total_count = await db_reports.get_report_count(status=status)
    
    return {
        "items": reports,
        "total": total_count,
        "status_filter": status,
        "limit": limit,
        "skip": skip
    }


@router.patch("/admin/social/reports/{report_id}")
async def resolve_report(
    report_id: str,
    resolve_data: ReportResolve,
    current_user=Depends(require_role("admin", "moderator", "super_admin"))
):
    """
    Resolve a report by keeping or hiding the post
    Admin/moderator only
    """
    # Validate action
    if resolve_data.action not in ["keep", "hide"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Action must be 'keep' or 'hide'"
        )
    
    # Resolve the report
    updated_report = await db_reports.resolve_report(
        report_id=report_id,
        action=resolve_data.action,
        resolved_by=current_user["id"],
        resolution_note=resolve_data.resolution_note
    )
    
    if not updated_report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )
    
    return {
        "success": True,
        "report_id": report_id,
        "new_status": updated_report["status"],
        "action": resolve_data.action
    }


@router.get("/admin/social/reports/stats")
async def get_moderation_stats(
    current_user=Depends(require_role("admin", "moderator", "super_admin"))
):
    """
    Get moderation statistics
    Admin/moderator only
    """
    pending_count = await db_reports.get_report_count("pending")
    kept_count = await db_reports.get_report_count("kept")
    hidden_count = await db_reports.get_report_count("hidden")
    
    return {
        "pending": pending_count,
        "kept": kept_count,
        "hidden": hidden_count,
        "total": pending_count + kept_count + hidden_count
    }


# ==========================================
# USER BAN/UNBAN ENDPOINTS - Phase ADCS v1.0
# ==========================================

@router.post("/admin/social/users/ban", status_code=status.HTTP_201_CREATED)
@adcs_guard(
    action_type=ADCSActionType.SOCIAL_BAN,
    risk_level=ADCSRiskLevel.P0
)
async def ban_user(
    ban_request: UserBanRequest,
    current_user=Depends(require_role("admin", "moderator", "super_admin"))
):
    """
    Ban a user from the social platform.
    
    **ADCS Protected**: Rate-limited to prevent abuse.
    Max 10 bans per hour per moderator.
    
    Admin/moderator only
    """
    db = await get_db()
    
    # Check if user exists
    user = await db.unified_users.find_one({"id": ban_request.user_id}, {"_id": 0})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if user is already banned
    existing_ban = await db.user_bans.find_one(
        {"user_id": ban_request.user_id, "is_active": True},
        {"_id": 0}
    )
    if existing_ban:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is already banned"
        )
    
    # Calculate expiry if duration is specified
    banned_until = None
    if ban_request.duration_days:
        banned_until = datetime.now(timezone.utc) + timedelta(days=ban_request.duration_days)
    
    # Create ban record
    ban_record = {
        "id": str(__import__('uuid').uuid4()),
        "user_id": ban_request.user_id,
        "banned_by": current_user["id"],
        "reason": ban_request.reason,
        "banned_at": datetime.now(timezone.utc),
        "banned_until": banned_until,
        "is_active": True
    }
    
    await db.user_bans.insert_one(ban_record)
    
    return {
        "success": True,
        "ban_id": ban_record["id"],
        "user_id": ban_request.user_id,
        "banned_until": banned_until.isoformat() if banned_until else "permanent",
        "message": f"User has been banned"
    }


@router.post("/admin/social/users/unban", status_code=status.HTTP_200_OK)
@adcs_guard(
    action_type=ADCSActionType.SOCIAL_UNBAN,
    risk_level=ADCSRiskLevel.P0
)
async def unban_user(
    unban_request: UserUnbanRequest,
    current_user=Depends(require_role("admin", "moderator", "super_admin"))
):
    """
    Unban a user from the social platform.
    
    **ADCS Protected**: Validates request and logs action.
    
    Admin/moderator only
    """
    db = await get_db()
    
    # Find active ban
    ban = await db.user_bans.find_one(
        {"user_id": unban_request.user_id, "is_active": True},
        {"_id": 0}
    )
    
    if not ban:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active ban found for this user"
        )
    
    # Deactivate ban
    await db.user_bans.update_one(
        {"id": ban["id"]},
        {
            "$set": {
                "is_active": False,
                "unbanned_by": current_user["id"],
                "unbanned_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return {
        "success": True,
        "user_id": unban_request.user_id,
        "message": "User has been unbanned"
    }
