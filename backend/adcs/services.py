"""
ADCS Services - Core orchestration logic

Provides high-level functions for:
- Running ADCS checks on actions
- Approving/rejecting pending actions
- Executing approved actions
"""

from typing import Dict, Any, Optional
from datetime import datetime, timezone
import uuid

from adcs.models import (
    ADCSCheckRequest,
    ADCSCheckResult,
    ADCSActionType,
    ADCSRiskLevel,
    ADCSVerdict,
    ADCSApprovalStatus
)
from adcs.rules_engine import ADCSRulesEngine
from adcs.audit_log import ADCSAuditLog


async def run_adcs_check(
    action_type: ADCSActionType,
    risk_level: ADCSRiskLevel,
    actor_type: str,
    actor_id: str,
    target: Dict[str, Any],
    payload: Dict[str, Any],
    metadata: Optional[Dict[str, Any]] = None
) -> ADCSCheckResult:
    """
    Run ADCS evaluation on an action.
    
    This is the main entry point for ADCS checks.
    
    Flow:
    1. Create ADCSCheckRequest
    2. Evaluate rules via RulesEngine
    3. Determine approval status
    4. Log to AuditLog
    5. Return verdict
    
    Returns:
        ADCSCheckResult with verdict and reasoning
    """
    # Generate unique request ID
    request_id = f"adcs-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}-{str(uuid.uuid4())[:8]}"
    
    # Create request object
    request = ADCSCheckRequest(
        action_type=action_type,
        risk_level=risk_level,
        actor_type=actor_type,
        actor_id=actor_id,
        target=target,
        payload=payload,
        metadata=metadata
    )
    
    # Evaluate rules
    verdict, reasons, rules_evaluated = await ADCSRulesEngine.evaluate_rules(request)
    
    # Determine approval status based on verdict
    if verdict == ADCSVerdict.ALLOW:
        approval_status = ADCSApprovalStatus.AUTO
    elif verdict == ADCSVerdict.DENY:
        approval_status = ADCSApprovalStatus.AUTO  # Auto-denied
    else:  # REQUIRE_HUMAN
        approval_status = ADCSApprovalStatus.PENDING_FOUNDER
    
    # Log to audit log
    log_id = await ADCSAuditLog.create_entry(
        action_type=action_type,
        risk_level=risk_level,
        request_id=request_id,
        actor_type=actor_type,
        actor_id=actor_id,
        target=target,
        input_snapshot=payload,
        rules_evaluated=rules_evaluated,
        verdict=verdict,
        reasons=reasons,
        approval_status=approval_status,
        metadata=metadata
    )
    
    # Create result
    result = ADCSCheckResult(
        request_id=request_id,
        verdict=verdict,
        reasons=reasons,
        rules_evaluated=rules_evaluated,
        approval_status=approval_status,
        timestamp=datetime.now(timezone.utc)
    )
    
    return result


async def approve_pending_action(
    log_id: str,
    approved_by: str
) -> Dict[str, Any]:
    """
    Approve a pending action that requires human review.
    
    Args:
        log_id: The audit log entry ID
        approved_by: User ID of the approver (founder)
    
    Returns:
        Status dict with success/error info
    """
    # Get the audit log entry
    entry = await ADCSAuditLog.get_entry(log_id)
    
    if not entry:
        return {
            "success": False,
            "error": "Audit log entry not found"
        }
    
    if entry["approval_status"] != ADCSApprovalStatus.PENDING_FOUNDER.value:
        return {
            "success": False,
            "error": f"Action is not pending approval (status: {entry['approval_status']})"
        }
    
    # Update approval status
    success = await ADCSAuditLog.update_approval_status(
        log_id=log_id,
        new_status=ADCSApprovalStatus.APPROVED,
        approved_by=approved_by
    )
    
    if not success:
        return {
            "success": False,
            "error": "Failed to update approval status"
        }
    
    return {
        "success": True,
        "message": "Action approved successfully",
        "log_id": log_id,
        "approved_by": approved_by,
        "action_type": entry["action_type"],
        "note": "Action has been approved. You may now re-execute the original request."
    }


async def reject_pending_action(
    log_id: str,
    rejected_by: str,
    rejection_reason: Optional[str] = None
) -> Dict[str, Any]:
    """
    Reject a pending action that requires human review.
    
    Args:
        log_id: The audit log entry ID
        rejected_by: User ID of the rejector (founder)
        rejection_reason: Optional reason for rejection
    
    Returns:
        Status dict with success/error info
    """
    # Get the audit log entry
    entry = await ADCSAuditLog.get_entry(log_id)
    
    if not entry:
        return {
            "success": False,
            "error": "Audit log entry not found"
        }
    
    if entry["approval_status"] != ADCSApprovalStatus.PENDING_FOUNDER.value:
        return {
            "success": False,
            "error": f"Action is not pending approval (status: {entry['approval_status']})"
        }
    
    # Update approval status
    success = await ADCSAuditLog.update_approval_status(
        log_id=log_id,
        new_status=ADCSApprovalStatus.REJECTED,
        approved_by=rejected_by
    )
    
    if not success:
        return {
            "success": False,
            "error": "Failed to update approval status"
        }
    
    return {
        "success": True,
        "message": "Action rejected successfully",
        "log_id": log_id,
        "rejected_by": rejected_by,
        "rejection_reason": rejection_reason,
        "action_type": entry["action_type"]
    }


async def get_pending_actions_list(limit: int = 50) -> list[Dict[str, Any]]:
    """
    Get all pending actions awaiting approval.
    
    Returns:
        List of pending action dicts
    """
    return await ADCSAuditLog.get_pending_actions(limit=limit)
