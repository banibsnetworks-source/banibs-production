"""
BANIBS Platform Orchestration Core (BPOC) - Phase 0.0
Data Models for Module Management & Rollout Governance

Internal-only admin/founder governance system.
Controls when and how BANIBS modules roll out across the platform.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum


# ==================== ENUMS ====================

class ModuleLayer(str, Enum):
    """
    5-layer architecture for BANIBS platform.
    Defines rollout sequence and dependencies.
    Patent-safe separation of concerns.
    """
    LAYER_0_INFRASTRUCTURE = "LAYER_0_INFRASTRUCTURE"  # Auth, DB, BPOC, Core
    LAYER_1_GOVERNANCE = "LAYER_1_GOVERNANCE"          # Integrity, Reputation, Safety
    LAYER_2_FOUNDATION = "LAYER_2_FOUNDATION"          # Help systems, safe to deploy early
    LAYER_3_SOCIAL = "LAYER_3_SOCIAL"                  # Social networks, require risk mitigation
    LAYER_4_HIGH_IMPACT = "LAYER_4_HIGH_IMPACT"        # Financial, legal, high-sensitivity


class ModuleCategory(str, Enum):
    """Category classification for BANIBS modules"""
    HELP_SYSTEM = "HELP_SYSTEM"
    MARKETPLACE = "MARKETPLACE"
    SAFETY = "SAFETY"
    SOCIAL = "SOCIAL"
    NEWS = "NEWS"
    BUSINESS = "BUSINESS"
    INFRASTRUCTURE = "INFRASTRUCTURE"
    EDUCATION = "EDUCATION"
    OTHER = "OTHER"


class RolloutStage(str, Enum):
    """Module rollout stages from concept to legacy"""
    PLANNED = "PLANNED"                   # Designed but not started
    IN_DEV = "IN_DEV"                     # Active development
    INTERNAL_SANDBOX = "INTERNAL_SANDBOX" # Testing with internal team
    PRIVATE_BETA = "PRIVATE_BETA"         # Limited user testing
    SOFT_LAUNCH = "SOFT_LAUNCH"           # Gradual rollout
    FULL_LAUNCH = "FULL_LAUNCH"           # Fully available
    LEGACY = "LEGACY"                     # Deprecated/archived


class ModuleVisibility(str, Enum):
    """Who can see/access the module"""
    INTERNAL_ONLY = "INTERNAL_ONLY"       # Admin/founder only
    INVITE_ONLY = "INVITE_ONLY"           # Requires invitation
    PUBLIC = "PUBLIC"                     # Available to all


class RiskFlag(str, Enum):
    """Risk categories requiring review"""
    LEGAL = "LEGAL"
    SAFETY = "SAFETY"
    TRUST = "TRUST"
    SCALING = "SCALING"
    FINANCE = "FINANCE"
    OTHER = "OTHER"


class TriggerClass(str, Enum):
    """
    Three classes of triggers for patent-safe separation.
    Distinguishes automation types for legal protection.
    """
    SYSTEM = "SYSTEM"                      # Internal BANIBS conditions (automated)
    ENVIRONMENTAL = "ENVIRONMENTAL"         # External readiness (manual verification)
    RISK_MITIGATION = "RISK_MITIGATION"    # Safety brakes (high-sensitivity modules)


class TriggerType(str, Enum):
    """Types of conditions that must be met before rollout"""
    MIN_ACTIVE_USERS = "MIN_ACTIVE_USERS"
    MIN_DAILY_ACTIVE_USERS = "MIN_DAILY_ACTIVE_USERS"
    MIN_ACTIVE_ORGS = "MIN_ACTIVE_ORGS"
    MIN_REGIONS = "MIN_REGIONS"
    EARLIEST_DATE = "EARLIEST_DATE"
    MANUAL_APPROVAL_REQUIRED = "MANUAL_APPROVAL_REQUIRED"
    SAFETY_REVIEW = "SAFETY_REVIEW"
    LEGAL_REVIEW = "LEGAL_REVIEW"
    TECH_STABILITY = "TECH_STABILITY"
    CUSTOM = "CUSTOM"


class TriggerStatus(str, Enum):
    """Current status of a trigger condition"""
    NOT_MET = "NOT_MET"
    NEARLY_MET = "NEARLY_MET"
    MET = "MET"
    OVERRIDDEN = "OVERRIDDEN"


class EventType(str, Enum):
    """Types of orchestration events"""
    STAGE_CHANGE = "STAGE_CHANGE"
    TRIGGER_MET = "TRIGGER_MET"
    TRIGGER_OVERRIDDEN = "TRIGGER_OVERRIDDEN"
    MODULE_BLOCKED = "MODULE_BLOCKED"
    MODULE_UNBLOCKED = "MODULE_UNBLOCKED"
    NOTE_ADDED = "NOTE_ADDED"


class ReadinessStatus(str, Enum):
    """Overall readiness assessment for a module"""
    READY = "READY"       # All conditions met, can advance
    WAIT = "WAIT"         # Some conditions not met yet
    BLOCKED = "BLOCKED"   # Actively blocked, cannot proceed


# ==================== CORE MODELS ====================

class ModuleRecord(BaseModel):
    """
    Core record for each BANIBS module.
    Tracks everything from concept to full launch.
    """
    id: str
    code: str = Field(..., description="Unique code like 'elder_honor_11_14'")
    name: str = Field(..., description="Display name")
    phase: str = Field(..., description="Phase number like '11.14' or '22.0'")
    layer: ModuleLayer = Field(..., description="5-layer architecture position")
    category: ModuleCategory
    description_short: str
    description_internal: str = Field(..., description="Internal strategy rationale")
    rollout_stage: RolloutStage = RolloutStage.PLANNED
    visibility: ModuleVisibility = ModuleVisibility.INTERNAL_ONLY
    owner_team: str = Field(..., description="Team responsible, e.g. 'Neo-Core'")
    risk_flags: List[RiskFlag] = Field(default_factory=list)
    is_blocked: bool = False
    blocked_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class RolloutTrigger(BaseModel):
    """
    Conditions that must be met before a module can advance stages.
    Examples: min users, date requirements, safety reviews.
    """
    id: str
    module_id: str = Field(..., description="FK to ModuleRecord")
    trigger_class: TriggerClass = Field(..., description="Classification for patent separation")
    trigger_type: TriggerType
    target_value_number: Optional[float] = None
    target_value_date: Optional[date] = None
    target_value_text: Optional[str] = None
    is_mandatory: bool = True
    current_status: TriggerStatus = TriggerStatus.NOT_MET
    last_evaluated_at: Optional[datetime] = None


class ModuleDependency(BaseModel):
    """
    Defines parent-child relationships between modules.
    Example: Elder Honor depends on Ability Network being in FULL_LAUNCH
    """
    id: str
    module_id: str = Field(..., description="Child module")
    depends_on_module_id: str = Field(..., description="Parent module")
    required_stage: RolloutStage = Field(..., description="Stage parent must be in")
    is_hard_dependency: bool = True


class RolloutEvent(BaseModel):
    """
    Audit log of all changes to modules.
    Tracks stage changes, approvals, blocks, notes.
    """
    id: str
    module_id: str
    event_type: EventType
    from_stage: Optional[str] = None
    to_stage: Optional[str] = None
    details: str
    created_by_user_id: str = Field(..., description="User ID or 'SYSTEM'")
    created_at: datetime


class OrchestrationSettings(BaseModel):
    """
    Global platform settings for orchestration.
    Controls pacing, safety requirements, concurrent launches.
    """
    id: str
    min_time_between_major_releases_days: int = 14
    require_safety_review_for_safety_category: bool = True
    require_legal_review_for_help_systems: bool = True
    max_concurrent_help_system_live: int = 3
    show_public_coming_soon: bool = False
    created_at: datetime
    updated_at: datetime


# ==================== RESPONSE MODELS ====================

class ModuleSummary(BaseModel):
    """Lightweight module info for list views"""
    id: str
    code: str
    name: str
    phase: str
    layer: ModuleLayer
    category: ModuleCategory
    rollout_stage: RolloutStage
    visibility: ModuleVisibility
    is_blocked: bool
    risk_flags: List[RiskFlag]
    trigger_summary: str = Field(..., description="e.g. '3/5 triggers met'")
    readiness_status: ReadinessStatus
    updated_at: datetime


class ModuleDetail(BaseModel):
    """Full module info including related data"""
    module: ModuleRecord
    triggers: List[RolloutTrigger]
    dependencies: List[ModuleDependency]
    recent_events: List[RolloutEvent]
    readiness_status: ReadinessStatus
    unmet_triggers: List[str]
    dependency_status: str = Field(..., description="Summary of dependency readiness")


class ReadinessEvaluation(BaseModel):
    """Result of evaluating if a module is ready to advance"""
    module_id: str
    current_stage: RolloutStage
    readiness_status: ReadinessStatus
    triggers_met: int
    triggers_total: int
    unmet_triggers: List[dict]
    dependency_issues: List[str]
    risk_notes: List[str]
    can_advance: bool
    recommended_action: str


class StageChangeRequest(BaseModel):
    """Request to change a module's stage"""
    to_stage: RolloutStage
    reason: str
    override: bool = False


class TriggerOverrideRequest(BaseModel):
    """Request to override a trigger that's not met"""
    reason: str
    approved_by: str


class ModulesListResponse(BaseModel):
    """Response for listing modules"""
    modules: List[ModuleSummary]
    total: int


class ReadinessSummaryResponse(BaseModel):
    """Summary of modules sorted by readiness"""
    modules: List[ModuleSummary]
    ready_count: int
    waiting_count: int
    blocked_count: int
