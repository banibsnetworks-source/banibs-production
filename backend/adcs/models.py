"""
ADCS Models - Data structures for ADCS system
"""

from pydantic import BaseModel, Field
from typing import Literal, Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ADCSActionType(str, Enum):
    """Types of actions that ADCS can guard"""
    WALLET_PAYOUT = "wallet_payout"
    MARKETPLACE_PAYOUT = "marketplace_payout"
    RELATIONSHIP_BLOCK = "relationship_block"
    RELATIONSHIP_UNBLOCK = "relationship_unblock"
    SOCIAL_BAN = "social_ban"
    SOCIAL_UNBAN = "social_unban"
    AUTH_ROLE_CHANGE = "auth_role_change"
    AUTH_CONFIG_CHANGE = "auth_config_change"
    SCHEMA_MIGRATION = "schema_migration"
    MASS_DELETE = "mass_delete"
    GLOBAL_CONFIG_CHANGE = "global_config_change"


class ADCSRiskLevel(str, Enum):
    """Risk levels for ADCS actions"""
    P0 = "P0"  # Critical - must be protected
    P1 = "P1"  # Important - should be monitored
    P2 = "P2"  # Low - light protection


class ADCSVerdict(str, Enum):
    """Possible verdicts from ADCS evaluation"""
    ALLOW = "allow"
    DENY = "deny"
    REQUIRE_HUMAN = "require_human"


class ADCSApprovalStatus(str, Enum):
    """Approval status for actions requiring human review"""
    AUTO = "auto"  # Auto-approved by rules
    PENDING_FOUNDER = "pending_founder"  # Awaiting founder approval
    APPROVED = "approved"  # Manually approved
    REJECTED = "rejected"  # Manually rejected


class RuleResult(BaseModel):
    """Result of a single rule evaluation"""
    rule_name: str
    verdict: ADCSVerdict
    reasons: List[str] = []
    normalized_data: Optional[Dict[str, Any]] = None


class ADCSCheckRequest(BaseModel):
    """Request for ADCS to evaluate an action"""
    action_type: ADCSActionType
    risk_level: ADCSRiskLevel
    actor_type: Literal["human", "system", "ai"]
    actor_id: str
    target: Dict[str, Any]
    payload: Dict[str, Any]
    metadata: Optional[Dict[str, Any]] = None


class ADCSCheckResult(BaseModel):
    """Result of ADCS evaluation"""
    request_id: str
    verdict: ADCSVerdict
    reasons: List[str]
    rules_evaluated: List[str]
    approval_status: ADCSApprovalStatus
    timestamp: datetime


class ADCSAuditLogEntry(BaseModel):
    """Audit log entry for ADCS action"""
    id: str
    timestamp: datetime
    action_type: ADCSActionType
    risk_level: ADCSRiskLevel
    request_id: str
    actor_type: Literal["human", "system", "ai"]
    actor_id: str
    target: Dict[str, Any]
    input_snapshot: Dict[str, Any]
    rules_evaluated: List[str]
    verdict: ADCSVerdict
    reasons: List[str]
    approval_status: ADCSApprovalStatus
    metadata: Optional[Dict[str, Any]] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "id": "adcs-2025-12-01-001",
                "timestamp": "2025-12-01T07:00:00Z",
                "action_type": "wallet_payout",
                "risk_level": "P0",
                "request_id": "req-12345",
                "actor_type": "human",
                "actor_id": "user-123",
                "target": {"wallet_id": "wallet-456", "amount": 100},
                "input_snapshot": {"amount": 100, "currency": "BANIBS"},
                "rules_evaluated": ["money.balance_check", "money.limit_check"],
                "verdict": "allow",
                "reasons": ["All checks passed"],
                "approval_status": "auto",
                "metadata": {}
            }
        }


class ADCSPendingAction(BaseModel):
    """Pending action awaiting human approval"""
    id: str
    action_type: ADCSActionType
    risk_level: ADCSRiskLevel
    actor_id: str
    target: Dict[str, Any]
    payload: Dict[str, Any]
    reasons: List[str]
    created_at: datetime
    approval_status: ADCSApprovalStatus
