"""
Moderation Admin Routes - Phase 6.4
Admin endpoints for viewing and managing the moderation queue
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Optional

from models.moderation import (
    ModerationQueueItem,
    ModerationStats,
    ModerationQueueUpdate
)
from db.moderation_queue import (
    get_moderation_items,
    get_moderation_item_by_id,
    update_moderation_status,
    get_moderation_stats
)
from middleware.auth_guard import require_role

router = APIRouter(prefix="/api/admin/moderation", tags=["admin", "moderation"])


@router.get("", response_model=List[ModerationQueueItem])
async def list_moderation_items(
    status: Optional[str] = "PENDING",
    content_type: Optional[str] = None,
    limit: int = 100,
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    List moderation queue items
    
    - **status**: Filter by status (PENDING/APPROVED/REJECTED), None for all
    - **content_type**: Filter by content type (news/resource), None for all
    - **limit**: Maximum number of items to return (default 100)
    
    Requires: super_admin or moderator role
    """
    items = await get_moderation_items(
        status=status,
        content_type=content_type,
        limit=limit
    )
    
    return items


@router.get("/stats", response_model=ModerationStats)
async def get_moderation_statistics(
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    Get moderation queue statistics
    
    Returns counts for pending, approved, rejected, and total items.
    
    Requires: super_admin or moderator role
    """
    stats = await get_moderation_stats()
    return stats


@router.get("/{mod_id}", response_model=ModerationQueueItem)
async def get_moderation_item(
    mod_id: str,
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    Get a single moderation item by ID
    
    Requires: super_admin or moderator role
    """
    item = await get_moderation_item_by_id(mod_id)
    
    if not item:
        raise HTTPException(status_code=404, detail="Moderation item not found")
    
    return item


@router.post("/{mod_id}/approve")
async def approve_moderation_item(
    mod_id: str,
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    Approve a moderation item
    
    Marks the item as APPROVED and records who reviewed it.
    In Mode A (shadow moderation), this is for audit purposes only.
    
    Requires: super_admin or moderator role
    """
    # Get reviewer info from JWT
    reviewer = current_user.get("email", current_user.get("sub", "unknown"))
    
    # Update status
    success = await update_moderation_status(
        mod_id=mod_id,
        status="APPROVED",
        reviewed_by=reviewer
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Moderation item not found")
    
    return {
        "success": True,
        "message": "Item approved successfully",
        "mod_id": mod_id,
        "reviewed_by": reviewer
    }


@router.post("/{mod_id}/reject")
async def reject_moderation_item(
    mod_id: str,
    current_user: dict = Depends(require_role(["super_admin", "moderator"]))
):
    """
    Reject a moderation item
    
    Marks the item as REJECTED and records who reviewed it.
    In Mode A (shadow moderation), this is for audit purposes only.
    Future: In Mode B, this could trigger content hiding.
    
    Requires: super_admin or moderator role
    """
    # Get reviewer info from JWT
    reviewer = current_user.get("email", current_user.get("sub", "unknown"))
    
    # Update status
    success = await update_moderation_status(
        mod_id=mod_id,
        status="REJECTED",
        reviewed_by=reviewer
    )
    
    if not success:
        raise HTTPException(status_code=404, detail="Moderation item not found")
    
    return {
        "success": True,
        "message": "Item rejected successfully",
        "mod_id": mod_id,
        "reviewed_by": reviewer
    }
