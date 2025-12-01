"""
ADCS Audit Log - Append-only logging system

All ADCS decisions, approvals, denials, and actions are logged here.
This provides a permanent, tamper-resistant record for forensics and compliance.
"""

from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
import uuid

from db.connection import get_db
from adcs.models import (
    ADCSActionType,
    ADCSRiskLevel,
    ADCSVerdict,
    ADCSApprovalStatus,
    ADCSAuditLogEntry
)


class ADCSAuditLog:
    """Service for managing ADCS audit logs"""
    
    COLLECTION_NAME = "adcs_audit_logs"
    
    @staticmethod
    async def create_entry(
        action_type: ADCSActionType,
        risk_level: ADCSRiskLevel,
        request_id: str,
        actor_type: str,
        actor_id: str,
        target: Dict[str, Any],
        input_snapshot: Dict[str, Any],
        rules_evaluated: List[str],
        verdict: ADCSVerdict,
        reasons: List[str],
        approval_status: ADCSApprovalStatus,
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Create a new audit log entry.
        
        Returns:
            log_entry_id (UUID)
        """
        db = await get_db()
        
        log_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc)
        
        entry = {
            "id": log_id,
            "timestamp": now,
            "action_type": action_type.value,
            "risk_level": risk_level.value,
            "request_id": request_id,
            "actor_type": actor_type,
            "actor_id": actor_id,
            "target": target,
            "input_snapshot": input_snapshot,
            "rules_evaluated": rules_evaluated,
            "verdict": verdict.value,
            "reasons": reasons,
            "approval_status": approval_status.value,
            "metadata": metadata or {}
        }
        
        await db[ADCSAuditLog.COLLECTION_NAME].insert_one(entry)
        
        return log_id
    
    @staticmethod
    async def get_entry(log_id: str) -> Optional[Dict[str, Any]]:
        """
        Get a specific audit log entry by ID.
        """
        db = await get_db()
        entry = await db[ADCSAuditLog.COLLECTION_NAME].find_one(
            {"id": log_id},
            {"_id": 0}
        )
        return entry
    
    @staticmethod
    async def get_pending_actions(limit: int = 50) -> List[Dict[str, Any]]:
        """
        Get all actions awaiting human approval.
        """
        db = await get_db()
        entries = await db[ADCSAuditLog.COLLECTION_NAME].find(
            {"approval_status": ADCSApprovalStatus.PENDING_FOUNDER.value},
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return entries
    
    @staticmethod
    async def update_approval_status(
        log_id: str,
        new_status: ADCSApprovalStatus,
        approved_by: Optional[str] = None
    ) -> bool:
        """
        Update the approval status of an audit log entry.
        This is the ONLY update operation allowed on audit logs.
        
        Returns:
            True if updated, False if not found
        """
        db = await get_db()
        
        update_data = {
            "approval_status": new_status.value,
            "approval_timestamp": datetime.now(timezone.utc),
        }
        
        if approved_by:
            update_data["approved_by"] = approved_by
        
        result = await db[ADCSAuditLog.COLLECTION_NAME].update_one(
            {"id": log_id},
            {"$set": update_data}
        )
        
        return result.modified_count > 0
    
    @staticmethod
    async def get_user_actions(
        actor_id: str,
        action_type: Optional[ADCSActionType] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """
        Get all actions by a specific user/actor.
        Useful for detecting abuse patterns.
        """
        db = await get_db()
        
        query = {"actor_id": actor_id}
        if action_type:
            query["action_type"] = action_type.value
        
        entries = await db[ADCSAuditLog.COLLECTION_NAME].find(
            query,
            {"_id": 0}
        ).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return entries
    
    @staticmethod
    async def get_recent_actions_count(
        actor_id: str,
        action_type: ADCSActionType,
        hours: int = 24
    ) -> int:
        """
        Count how many times an actor has performed a specific action
        in the last N hours.
        
        Used for rate limiting and abuse detection.
        """
        db = await get_db()
        
        from datetime import timedelta
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        count = await db[ADCSAuditLog.COLLECTION_NAME].count_documents({
            "actor_id": actor_id,
            "action_type": action_type.value,
            "timestamp": {"$gte": cutoff_time},
            "verdict": {"$in": [ADCSVerdict.ALLOW.value, ADCSApprovalStatus.APPROVED.value]}
        })
        
        return count
    
    @staticmethod
    async def ensure_indexes():
        """
        Create indexes for efficient querying of audit logs.
        Should be called on application startup.
        """
        db = await get_db()
        
        # Index for finding pending actions
        await db[ADCSAuditLog.COLLECTION_NAME].create_index("approval_status")
        
        # Index for user action history
        await db[ADCSAuditLog.COLLECTION_NAME].create_index("actor_id")
        
        # Compound index for rate limiting queries
        await db[ADCSAuditLog.COLLECTION_NAME].create_index([
            ("actor_id", 1),
            ("action_type", 1),
            ("timestamp", -1)
        ])
        
        # Index for timestamp-based queries
        await db[ADCSAuditLog.COLLECTION_NAME].create_index("timestamp")
