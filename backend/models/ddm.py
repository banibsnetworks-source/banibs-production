"""
DDM (Dismissal Detection Model) - Data Models v1.2
EXPANDED SPECIFICATION

Pattern detection schemas for the Dismissal Detection Model.
This is a DISCERNMENT TOOL, NOT an accusation system.

All outputs are probabilistic and require falsifiable testing.

PRIME DIRECTIVES:
D0. Pattern Detection Only - Never labels anyone as "liar/guilty/evil"
D1. Guardrails Enforced by Code - Finalize requires tests
D2. Default Private/Internal - Admin-only access
D3. Apply Inward First - "self" is default subject type
D4. Safety Copy Required - Disclaimers on all outputs
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime
from uuid import uuid4


# =============================================================================
# ENUMS (EXPANDED)
# =============================================================================

class SubjectType(str, Enum):
    """Type of subject being observed - 'self' is FIRST for inward-first principle"""
    SELF = "self"              # D3: Inward-first
    PERSON = "person"
    GROUP = "group"
    PLATFORM = "platform"
    INSTITUTION = "institution"
    UNKNOWN = "unknown"


class ResponseSource(str, Enum):
    """Source type of the response being analyzed"""
    SPOKEN = "spoken"
    WRITTEN = "written"
    SOCIAL_POST = "social_post"
    POLICY = "policy"
    MEDIA = "media"
    OTHER = "other"


class ObservationStatus(str, Enum):
    """Observation workflow status"""
    DRAFT = "draft"                # Initial state, not scored
    PRELIMINARY = "preliminary"    # Scored but no tests run
    FINALIZED = "finalized"        # Tests completed, analysis locked


class Visibility(str, Enum):
    """Visibility level for observations"""
    PRIVATE = "private"        # Creator only
    ADMIN_ONLY = "admin_only"  # All admins (default)


class EscalationBand(str, Enum):
    """LDI escalation bands - probabilistic, not accusatory"""
    LOW = "low"           # LDI 0-25: Minimal pattern indicators
    MEDIUM = "medium"     # LDI 26-50: Moderate pattern indicators
    HIGH = "high"         # LDI 51-75: Strong pattern indicators
    CRITICAL = "critical" # LDI 76-100: Very strong pattern indicators


class TestResult(str, Enum):
    """Falsifiable test results"""
    PASS = "pass"
    FAIL = "fail"
    UNKNOWN = "unknown"


# =============================================================================
# ESCALATION LADDER (CANONICAL - LOCKED)
# =============================================================================

ESCALATION_LADDER = [
    {"stage": 1, "name": "Ignoring", "description": "Disregarding without engagement"},
    {"stage": 2, "name": "Deflection", "description": "Redirecting away from the point"},
    {"stage": 3, "name": "Dismissal", "description": "Active rejection without consideration"},
    {"stage": 4, "name": "Invalidation", "description": "Denying legitimacy of concern"},
    {"stage": 5, "name": "Normalization", "description": "Making abnormal behavior seem normal"},
    {"stage": 6, "name": "Substitution/Deceit", "description": "Replacing truth with preferred narrative"},
    {"stage": 7, "name": "Zealotry", "description": "Aggressive moral overdrive defense"},
    {"stage": 8, "name": "Elimination", "description": "Attempting to remove/silence/destroy"},
    {"stage": 9, "name": "Death", "description": "Theoretical ceiling - REQUIRES EXPLICIT CONFIRMATION"},
]


# =============================================================================
# FEATURE SCORES (f1-f8)
# =============================================================================

class DDMFeatures(BaseModel):
    """
    The 8 core features of the Dismissal Detection Model.
    Each feature is scored 0.0 to 1.0 (intensity/presence).
    """
    f1_ignoring: float = Field(0.0, ge=0.0, le=1.0, description="Ignoring: Disregarding without engagement")
    f2_deflection: float = Field(0.0, ge=0.0, le=1.0, description="Deflection: Redirecting away from the point")
    f3_dismissal: float = Field(0.0, ge=0.0, le=1.0, description="Dismissal: Active rejection without consideration")
    f4_invalidation: float = Field(0.0, ge=0.0, le=1.0, description="Invalidation: Denying legitimacy of concern")
    f5_substitution: float = Field(0.0, ge=0.0, le=1.0, description="Substitution/Deceit: Replacing with preferred narrative")
    f6_zealotry: float = Field(0.0, ge=0.0, le=1.0, description="Zealotry: Aggressive defense of position")
    f7_elimination: float = Field(0.0, ge=0.0, le=1.0, description="Elimination: Attempting to remove/silence")
    f8_escalation_velocity: float = Field(0.0, ge=0.0, le=1.0, description="Escalation Velocity: Speed of intensification")
    
    # Optional per-feature notes
    f1_notes: Optional[str] = None
    f2_notes: Optional[str] = None
    f3_notes: Optional[str] = None
    f4_notes: Optional[str] = None
    f5_notes: Optional[str] = None
    f6_notes: Optional[str] = None
    f7_notes: Optional[str] = None
    f8_notes: Optional[str] = None


# =============================================================================
# PROTECTED VARIABLE ANALYSIS
# =============================================================================

class ProtectedVariableScores(BaseModel):
    """
    Categorized likelihood of what is being protected.
    Each is a probability estimate 0.0 to 1.0.
    """
    identity: float = Field(0.0, ge=0.0, le=1.0, description="Identity protection likelihood")
    power: float = Field(0.0, ge=0.0, le=1.0, description="Power/status protection likelihood")
    narrative: float = Field(0.0, ge=0.0, le=1.0, description="Narrative protection likelihood")
    moral_status: float = Field(0.0, ge=0.0, le=1.0, description="Moral status protection likelihood")
    
    # User can override inferred values
    user_override: bool = Field(False, description="Whether user has overridden inferred values")


# =============================================================================
# FALSIFIABLE TESTS
# =============================================================================

class FalsifiableTest(BaseModel):
    """Single falsifiable test result"""
    result: TestResult = TestResult.UNKNOWN
    notes: Optional[str] = None
    tested_at: Optional[datetime] = None
    tested_by: Optional[str] = None


class DDMTests(BaseModel):
    """
    The 3 required falsifiable tests.
    At least 1 must have result != UNKNOWN to finalize.
    """
    context_tolerance: FalsifiableTest = Field(
        default_factory=FalsifiableTest,
        description="Context Tolerance Test: Does response vary appropriately by context?"
    )
    symmetry: FalsifiableTest = Field(
        default_factory=FalsifiableTest,
        description="Symmetry Test: Is the standard applied equally to all parties?"
    )
    clarification: FalsifiableTest = Field(
        default_factory=FalsifiableTest,
        description="Clarification Test: Does new information change the position?"
    )
    
    def get_completed_count(self) -> int:
        """Count tests with result != unknown"""
        count = 0
        if self.context_tolerance.result != TestResult.UNKNOWN:
            count += 1
        if self.symmetry.result != TestResult.UNKNOWN:
            count += 1
        if self.clarification.result != TestResult.UNKNOWN:
            count += 1
        return count
    
    def can_finalize(self) -> bool:
        """Check if at least one test is completed"""
        return self.get_completed_count() >= 1


# =============================================================================
# OBSERVATION MODEL (EXPANDED)
# =============================================================================

class DDMObservationCreate(BaseModel):
    """Input schema for creating a new DDM observation"""
    context_title: str = Field(..., min_length=1, max_length=140)
    context_notes: Optional[str] = None
    location_tag: Optional[str] = Field(None, max_length=80, description="Platform/channel label")
    
    # Subject - default to "self" for inward-first (D3)
    subject_type: SubjectType = SubjectType.SELF
    subject_ref: Optional[str] = Field(None, max_length=140, description="Normalized key for tracking")
    subject_display_name: Optional[str] = Field(None, max_length=140)
    
    # Content
    truth_claim: Optional[str] = Field(None, description="The truth claim being evaluated (optional)")
    response_text: str = Field(..., min_length=1, description="The response/behavior being analyzed")
    response_source: ResponseSource = ResponseSource.OTHER
    
    # Scoring input
    features: DDMFeatures
    
    # Status - cannot be "finalized" on create
    status: ObservationStatus = ObservationStatus.PRELIMINARY
    visibility: Visibility = Visibility.ADMIN_ONLY
    
    # Guardrail acknowledgment
    guardrail_ack: bool = Field(False, description="User acknowledges this is for discernment only")
    
    # Stage 9 explicit confirmation (D4 safety)
    stage_9_explicit_confirmation: bool = Field(
        False, 
        description="REQUIRED if claiming stage 9 (death context) - cannot be auto-inferred"
    )
    
    @validator('status')
    def status_cannot_be_finalized_on_create(cls, v):
        if v == ObservationStatus.FINALIZED:
            raise ValueError("Cannot create observation as 'finalized'. Use preliminary or draft.")
        return v


class DDMObservation(BaseModel):
    """Full DDM observation record (database model)"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by_user_id: str
    updated_at: Optional[datetime] = None
    updated_by_user_id: Optional[str] = None
    
    # Status & Visibility
    status: ObservationStatus = ObservationStatus.PRELIMINARY
    visibility: Visibility = Visibility.ADMIN_ONLY
    
    # Context
    context_title: str
    context_notes: Optional[str] = None
    location_tag: Optional[str] = None
    
    # Subject
    subject_type: SubjectType = SubjectType.SELF
    subject_ref: Optional[str] = None
    subject_display_name: Optional[str] = None
    
    # Content
    truth_claim: Optional[str] = None
    response_text: str
    response_source: ResponseSource = ResponseSource.OTHER
    
    # Scoring
    features: DDMFeatures
    weights_version: str = "ddm-v1-weights"
    ldi_raw: float = Field(0.0, description="Raw weighted sum")
    ldi_100: float = Field(0.0, ge=0.0, le=100.0, description="LDI normalized to 0-100")
    ldi_confidence: float = Field(0.35, ge=0.0, le=1.0, description="Confidence in LDI score")
    
    # Escalation
    escalation_band: EscalationBand = EscalationBand.LOW
    escalation_stage_observed: Optional[int] = Field(None, ge=1, le=9, description="Best match from ladder")
    stage_9_explicit_confirmation: bool = Field(False, description="User confirmed stage 9 context")
    
    # Protected Variable Analysis
    protected_variable: ProtectedVariableScores = Field(default_factory=ProtectedVariableScores)
    protected_variable_confidence: float = Field(0.35, ge=0.0, le=1.0)
    protected_variable_override: Optional[ProtectedVariableScores] = None
    
    # Tests
    tests: DDMTests = Field(default_factory=DDMTests)
    guardrail_ack: bool = False
    
    # Finalization
    finalized_at: Optional[datetime] = None
    finalized_by_user_id: Optional[str] = None


# =============================================================================
# AUDIT LOG MODEL
# =============================================================================

class DDMAuditLogEntry(BaseModel):
    """Audit log entry for DDM operations"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    ts: datetime = Field(default_factory=datetime.utcnow)
    user_id: str
    action: str  # create | update | finalize | export | delete
    observation_id: str
    diff_json: Optional[Dict[str, Any]] = None  # Changed fields snapshot
    notes: Optional[str] = None


# =============================================================================
# TIME SERIES (for trend tracking)
# =============================================================================

class DDMTimeSeriesEntry(BaseModel):
    """Single time series data point"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    observation_id: str
    subject_ref: str
    ts: datetime
    ldi_100: float
    escalation_band: EscalationBand
    note: Optional[str] = None


class DDMTrendAnalysis(BaseModel):
    """Trend analysis for a subject"""
    subject_ref: str
    observation_count: int
    time_series: List[DDMTimeSeriesEntry]
    delta_ldi: Optional[float] = Field(None, description="Change in LDI over time")
    delta_ldi_per_day: Optional[float] = Field(None, description="ΔLDI/Δt normalized per day")
    trend_direction: Optional[str] = Field(None, description="escalating | stable | de-escalating")
    earliest_observation: Optional[datetime] = None
    latest_observation: Optional[datetime] = None
    
    # Probabilistic language (D4)
    trend_summary: str = Field(
        "Insufficient data for trend analysis",
        description="Human-readable trend summary using probabilistic language"
    )


# =============================================================================
# API RESPONSE MODELS
# =============================================================================

class DDMScoreResponse(BaseModel):
    """Response from scoring endpoint"""
    id: str
    ldi_raw: float
    ldi_100: float = Field(..., description="LDI normalized to 0-100 for display")
    band: EscalationBand
    confidence: float
    escalation_stage_observed: Optional[int]
    feature_breakdown: Dict[str, float]
    protected_variable: ProtectedVariableScores
    protected_variable_confidence: float
    recommended_next_test: str
    status: ObservationStatus
    
    # Safety fields (D4)
    disclaimer: str = "DDM is a pattern-detection tool. It does not determine guilt, intent, or moral worth."
    uncertainty_note: str


class DDMTestUpdate(BaseModel):
    """Input for updating test results"""
    tests: Optional[Dict[str, FalsifiableTest]] = None
    guardrail_ack: bool = Field(..., description="Must acknowledge discernment-only use")
    set_status: ObservationStatus = ObservationStatus.PRELIMINARY
    
    @validator('set_status')
    def validate_status_transition(cls, v, values):
        # Finalize validation happens in endpoint with test check
        return v


class DDMFinalizeRequest(BaseModel):
    """Request to finalize an observation"""
    guardrail_ack: bool = Field(..., description="Must acknowledge discernment-only use")
    final_notes: Optional[str] = None


class DDMExportRequest(BaseModel):
    """Request to export an observation"""
    format: str = Field("json", description="Export format: json | pdf")
    include_audit_log: bool = False


# =============================================================================
# DISALLOWED LANGUAGE CHECK (D0 Enforcement)
# =============================================================================

DISALLOWED_PHRASES = [
    "proves", "confirms", "this is a lie", "they are lying",
    "the devil is", "guilty", "evil", "liar", "lie proven",
    "definitely", "certainly", "absolutely", "without doubt"
]

ALLOWED_PHRASES = [
    "pattern suggests", "likely indicates", "consistent with",
    "preliminary", "not verified", "defense-likely",
    "may indicate", "appears to", "possibly"
]


def check_language_compliance(text: str) -> Dict[str, Any]:
    """Check if text complies with DDM language requirements"""
    text_lower = text.lower()
    violations = []
    
    for phrase in DISALLOWED_PHRASES:
        if phrase in text_lower:
            violations.append(phrase)
    
    return {
        "compliant": len(violations) == 0,
        "violations": violations,
        "note": "DDM outputs must use probabilistic language only" if violations else None
    }
