"""
DDM (Dismissal Detection Model) - Data Models

Pattern detection schemas for the Dismissal Detection Model.
This is a discernment tool, NOT an accusation system.

All outputs are probabilistic and require falsifiable testing.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List, Dict, Any
from enum import Enum
from datetime import datetime
from uuid import uuid4


# =============================================================================
# ENUMS
# =============================================================================

class SubjectType(str, Enum):
    """Type of subject being observed"""
    PERSON = "person"
    GROUP = "group"
    PLATFORM = "platform"
    INSTITUTION = "institution"
    UNKNOWN = "unknown"


class EscalationBand(str, Enum):
    """LDI escalation bands - probabilistic, not accusatory"""
    LOW = "low"           # LDI 0-25: Minimal pattern indicators
    MEDIUM = "med"        # LDI 26-50: Moderate pattern indicators
    HIGH = "high"         # LDI 51-75: Strong pattern indicators
    CRITICAL = "critical" # LDI 76-100: Very strong pattern indicators


class TestResult(str, Enum):
    """Falsifiable test results"""
    PASS = "pass"
    FAIL = "fail"
    UNKNOWN = "unknown"


class ObservationStatus(str, Enum):
    """Observation finalization status"""
    PRELIMINARY = "preliminary"  # No tests run
    IN_REVIEW = "in_review"      # Some tests run
    VERIFIED = "verified"        # All tests complete
    DEFENSE_LIKELY = "defense_likely"  # Clarification test indicates defense


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
    f5_substitution: float = Field(0.0, ge=0.0, le=1.0, description="Substitution: Replacing with preferred narrative")
    f6_zealotry: float = Field(0.0, ge=0.0, le=1.0, description="Zealotry: Aggressive defense of position")
    f7_elimination: float = Field(0.0, ge=0.0, le=1.0, description="Elimination: Attempting to remove/silence")
    f8_escalation_velocity: float = Field(0.0, ge=0.0, le=1.0, description="Escalation Velocity: Speed of intensification")


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
    At least 1 must be completed to move beyond 'Preliminary' status.
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


# =============================================================================
# OBSERVATION MODEL
# =============================================================================

class DDMObservationCreate(BaseModel):
    """Input schema for creating a new DDM observation"""
    context_title: str = Field(..., min_length=1, max_length=200)
    context_notes: Optional[str] = None
    subject_type: SubjectType = SubjectType.UNKNOWN
    subject_ref: Optional[str] = Field(None, max_length=100, description="Reference identifier for trend tracking")
    truth_claim: Optional[str] = Field(None, description="The truth claim being evaluated (optional)")
    response_text: str = Field(..., min_length=1, description="The response/behavior being analyzed")
    features: DDMFeatures
    guardrail_ack: bool = Field(False, description="User acknowledges this is for discernment only")


class DDMObservation(BaseModel):
    """Full DDM observation record"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: str
    updated_at: Optional[datetime] = None
    
    # Context
    context_title: str
    context_notes: Optional[str] = None
    subject_type: SubjectType
    subject_ref: Optional[str] = None
    truth_claim: Optional[str] = None
    response_text: str
    
    # Scoring
    features: DDMFeatures
    weights_version: str = "v1"
    ldi_score: float = Field(0.0, ge=0.0, le=100.0, description="Lie Defense Index (0-100)")
    ldi_confidence: float = Field(0.5, ge=0.0, le=1.0, description="Confidence in LDI score")
    escalation_band: EscalationBand = EscalationBand.LOW
    protected_variable: ProtectedVariableScores = Field(default_factory=ProtectedVariableScores)
    
    # Tests
    tests: DDMTests = Field(default_factory=DDMTests)
    guardrail_ack: bool = False
    
    # Status
    status: ObservationStatus = ObservationStatus.PRELIMINARY
    
    # Audit
    audit_log: List[Dict[str, Any]] = Field(default_factory=list)


# =============================================================================
# TIME SERIES (for trend tracking)
# =============================================================================

class DDMTimeSeriesEntry(BaseModel):
    """Single time series data point"""
    observation_id: str
    timestamp: datetime
    ldi_score: float
    escalation_band: EscalationBand
    note: Optional[str] = None


class DDMTrendAnalysis(BaseModel):
    """Trend analysis for a subject"""
    subject_ref: str
    observation_count: int
    time_series: List[DDMTimeSeriesEntry]
    delta_ldi: Optional[float] = Field(None, description="Change in LDI over time")
    trend_direction: Optional[str] = Field(None, description="escalating | stable | de-escalating")
    earliest_observation: Optional[datetime] = None
    latest_observation: Optional[datetime] = None
    
    # Probabilistic language
    trend_summary: str = Field(
        "Insufficient data for trend analysis",
        description="Human-readable trend summary using probabilistic language"
    )


# =============================================================================
# API RESPONSE MODELS
# =============================================================================

class DDMScoreResponse(BaseModel):
    """Response from scoring endpoint"""
    ldi_score: float
    ldi_score_normalized: int = Field(..., description="LDI normalized to 0-100 for display")
    ldi_confidence: float
    escalation_band: EscalationBand
    feature_breakdown: Dict[str, float]
    protected_variable: ProtectedVariableScores
    recommended_tests: List[str]
    
    # Safety fields
    disclaimer: str = "Pattern detection only. Not an accusation or conclusion."
    uncertainty_note: str


class DDMTestUpdate(BaseModel):
    """Input for updating test results"""
    context_tolerance: Optional[FalsifiableTest] = None
    symmetry: Optional[FalsifiableTest] = None
    clarification: Optional[FalsifiableTest] = None
    guardrail_ack: bool = Field(..., description="Must acknowledge discernment-only use")
