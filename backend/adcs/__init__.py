"""
ADCS v1.0 - AI Double-Check System
Phase 1: Core Guards

Purpose:
Ensure no single AI or action can make critical changes without validation.
Every critical action goes through: Rules Check → Audit Log → Verdict

Core Components:
- RulesEngine: Hardcoded domain-specific rules
- AuditLog: Append-only logging system
- Guards: Decorator-based endpoint protection
- Admin API: Human approval for require_human verdicts
"""

from adcs.decorators import adcs_guard
from adcs.services import run_adcs_check, approve_pending_action, reject_pending_action
from adcs.models import ADCSActionType, ADCSRiskLevel, ADCSVerdict

__all__ = [
    "adcs_guard",
    "run_adcs_check",
    "approve_pending_action",
    "reject_pending_action",
    "ADCSActionType",
    "ADCSRiskLevel",
    "ADCSVerdict"
]
