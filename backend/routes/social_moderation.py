"""
Social Moderation API Routes - Phase 8.3.1
User reporting and admin moderation endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from typing import Optional

from middleware.auth_guard import require_role
from db import social_reports as db_reports
from db import social_posts as db_social


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
