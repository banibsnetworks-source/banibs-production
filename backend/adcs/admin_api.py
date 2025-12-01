"""
ADCS Admin API - Endpoints for managing pending actions

Provides admin-only endpoints for:
- Listing pending actions awaiting approval
- Approving pending actions
- Rejecting pending actions
- Viewing audit log history
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any
from pydantic import BaseModel

from adcs.services import (
    get_pending_actions_list,
    approve_pending_action,
    reject_pending_action
)
from adcs.audit_log import ADCSAuditLog
from adcs.models import ADCSActionType
from middleware.auth_guard import get_current_user


router = APIRouter(prefix="/api/adcs", tags=["ADCS Admin"])


class ApproveRequest(BaseModel):
    """Request to approve a pending action"""
    log_id: str


class RejectRequest(BaseModel):
    """Request to reject a pending action"""
    log_id: str
    rejection_reason: str = None


def require_founder_role(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to ensure user has founder/admin role.
    ADCS admin operations are restricted to founders only.
    """
    user_roles = current_user.get('roles', [])
    
    # Check for founder or admin roles
    if 'founder' not in user_roles and 'admin' not in user_roles and 'super_admin' not in user_roles:
        raise HTTPException(
            status_code=403,
            detail="ADCS admin operations require founder or admin role"
        )
    
    return current_user


@router.get("/pending", response_model=List[Dict[str, Any]])
async def list_pending_actions(
    limit: int = 50,
    current_user: dict = Depends(require_founder_role)
):
    """
    List all actions awaiting founder approval.
    
    **Requires:** Founder or Admin role
    
    Returns pending actions sorted by timestamp (newest first).
    """
    try:
        pending_actions = await get_pending_actions_list(limit=limit)
        
        return {
            "success": True,
            "count": len(pending_actions),
            "pending_actions": pending_actions
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch pending actions: {str(e)}"
        )


@router.post("/approve")
async def approve_action(
    request: ApproveRequest,
    current_user: dict = Depends(require_founder_role)
):
    """
    Approve a pending action.
    
    **Requires:** Founder or Admin role
    
    Once approved, the user can re-execute their original request.
    """
    try:
        result = await approve_pending_action(
            log_id=request.log_id,
            approved_by=current_user['id']
        )
        
        if not result['success']:
            raise HTTPException(
                status_code=400,
                detail=result.get('error', 'Approval failed')
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to approve action: {str(e)}"
        )


@router.post("/reject")
async def reject_action(
    request: RejectRequest,
    current_user: dict = Depends(require_founder_role)
):
    """
    Reject a pending action.
    
    **Requires:** Founder or Admin role
    
    Rejected actions cannot be re-executed.
    """
    try:
        result = await reject_pending_action(
            log_id=request.log_id,
            rejected_by=current_user['id'],
            rejection_reason=request.rejection_reason
        )
        
        if not result['success']:
            raise HTTPException(
                status_code=400,
                detail=result.get('error', 'Rejection failed')
            )
        
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reject action: {str(e)}"
        )


@router.get("/audit-log/{log_id}")
async def get_audit_log_entry(
    log_id: str,
    current_user: dict = Depends(require_founder_role)
):
    """
    Get a specific audit log entry by ID.
    
    **Requires:** Founder or Admin role
    """
    try:
        entry = await ADCSAuditLog.get_entry(log_id)
        
        if not entry:
            raise HTTPException(
                status_code=404,
                detail="Audit log entry not found"
            )
        
        return {
            "success": True,
            "entry": entry
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch audit log entry: {str(e)}"
        )


@router.get("/user-history/{user_id}")
async def get_user_action_history(
    user_id: str,
    action_type: ADCSActionType = None,
    limit: int = 100,
    current_user: dict = Depends(require_founder_role)
):
    """
    Get action history for a specific user.
    
    **Requires:** Founder or Admin role
    
    Useful for detecting abuse patterns or investigating user behavior.
    """
    try:
        history = await ADCSAuditLog.get_user_actions(
            actor_id=user_id,
            action_type=action_type,
            limit=limit
        )
        
        return {
            "success": True,
            "user_id": user_id,
            "action_type": action_type.value if action_type else "all",
            "count": len(history),
            "history": history
        }
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch user history: {str(e)}"
        )


@router.get("/health")
async def adcs_health_check():
    """
    Health check for ADCS system.
    
    **Public endpoint** - no auth required.
    
    Returns basic system status.
    """
    try:
        from adcs.config import ADCSConfig
        
        return {
            "status": "operational",
            "system": "ADCS v1.0",
            "config": ADCSConfig.get_all_config()
        }
    except Exception as e:
        return {
            "status": "degraded",
            "error": str(e)
        }
