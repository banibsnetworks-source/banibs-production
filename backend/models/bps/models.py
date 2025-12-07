"""
BANIBS Protection Suite (BPS) - Shared Data Models
Version 1.0
"""

from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
from enum import Enum


# ==================== ENUMS ====================

class Verdict(str, Enum):
    """TIES verdict types"""
    OK = "OK"
    WARN = "WARN"
    BLOCK = "BLOCK"


class SensitivityLevel(str, Enum):
    """SCI sensitivity classification"""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRISIS = "CRISIS"


class InfoClarity(str, Enum):
    """MDI information clarity levels"""
    CLEAR = "CLEAR"
    PARTIAL = "PARTIAL"
    CONFLICTING = "CONFLICTING"
    UNKNOWN = "UNKNOWN"


class MessageType(str, Enum):
    """AAER message types"""
    UPDATE = "UPDATE"
    SAFETY = "SAFETY"
    CONTEXT = "CONTEXT"
    TRAUMA = "TRAUMA"
    MINIMAL = "MINIMAL"


class ToneProfile(str, Enum):
    """Tone engine profiles"""
    CALM = "CALM"
    CARE = "CARE"
    COMPASSION = "COMPASSION"
    SAFETY = "SAFETY"
    TRAUMA = "TRAUMA"
    MINIMAL = "MINIMAL"


# ==================== SHARED MODELS ====================

class FactSnapshot(BaseModel):
    """Fact snapshot for events"""
    verified_elements: List[str] = Field(default_factory=list)
    official_statements: List[str] = Field(default_factory=list)
    time_context: str = ""
    situation_summary: str = ""


class ContextFlags(BaseModel):
    """Context flags for events"""
    has_casualties: bool = False
    has_law_enforcement: bool = False
    has_protests: bool = False
    has_political_figures: bool = False
    has_misinformation: bool = False
    national_attention: bool = False
    local_attention: bool = False
    community_trauma: bool = False


class Event(BaseModel):
    """Event model for BPS processing"""
    id: str
    event_type: str
    location: str
    timestamp: datetime
    fact_snapshot: FactSnapshot
    context_flags: ContextFlags


# ==================== TIES MODELS ====================

class TIESIssue(BaseModel):
    """Individual issue detected by TIES"""
    type: str
    description: str
    severity: Literal["minor", "moderate", "critical"]
    location: Optional[str] = None  # Text snippet where issue was found


class TIESRewrite(BaseModel):
    """Suggested rewrite from TIES"""
    original: str
    suggested: str
    reason: str


class FactsConfig(BaseModel):
    """Configuration for fact checking"""
    allowed_claims: List[str] = Field(default_factory=list)
    prohibited_phrases: List[str] = Field(default_factory=list)
    requires_verification: List[str] = Field(default_factory=list)
    platform_capabilities: Dict[str, bool] = Field(default_factory=dict)


class TIESInput(BaseModel):
    """Input to TIES module"""
    content: str
    facts_config: Optional[FactsConfig] = None
    context: Optional[Dict[str, Any]] = None


class TIESOutput(BaseModel):
    """Output from TIES module"""
    verdict: Verdict
    issues: List[TIESIssue] = Field(default_factory=list)
    suggested_rewrites: List[TIESRewrite] = Field(default_factory=list)
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0)
    processing_notes: List[str] = Field(default_factory=list)


# ==================== SCI MODELS ====================

class SCIInput(BaseModel):
    """Input to SCI module"""
    event: Event
    additional_context: Optional[Dict[str, Any]] = None


class SCIOutput(BaseModel):
    """Output from SCI module"""
    sensitivity_level: SensitivityLevel
    recommended_tone: ToneProfile
    reasoning: List[str] = Field(default_factory=list)
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0)


# ==================== MDI MODELS ====================

class MDIInput(BaseModel):
    """Input to MDI module"""
    event: Event
    sources: List[str] = Field(default_factory=list)


class MDIOutput(BaseModel):
    """Output from MDI module"""
    info_clarity: InfoClarity
    risk_notes: List[str] = Field(default_factory=list)
    conflicting_claims: List[str] = Field(default_factory=list)
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0)


# ==================== AAER MODELS ====================

class AAERInput(BaseModel):
    """Input to AAER module"""
    fact_snapshot: FactSnapshot
    sensitivity_level: SensitivityLevel
    info_clarity: InfoClarity
    context_flags: ContextFlags
    recommended_tone: Optional[ToneProfile] = None


class AAEROutput(BaseModel):
    """Output from AAER module"""
    message_type: MessageType
    public_statement: str
    tone_used: ToneProfile
    template_id: Optional[str] = None
    reasoning: List[str] = Field(default_factory=list)


# ==================== PIPELINE MODELS ====================

class BPSPipelineInput(BaseModel):
    """Input to full BPS pipeline"""
    content: str
    event: Optional[Event] = None
    facts_config: Optional[FactsConfig] = None
    require_aaer: bool = False


class BPSPipelineOutput(BaseModel):
    """Output from full BPS pipeline"""
    ties_result: TIESOutput
    sci_result: Optional[SCIOutput] = None
    mdi_result: Optional[MDIOutput] = None
    aaer_result: Optional[AAEROutput] = None
    final_verdict: Verdict
    requires_human_approval: bool = True
    pipeline_timestamp: datetime = Field(default_factory=datetime.utcnow)
    processing_log: List[str] = Field(default_factory=list)


# ==================== AUDIT LOG MODEL ====================

class BPSAuditLog(BaseModel):
    """Audit log for BPS processing"""
    id: str
    module: str
    input_content: str
    output: Dict[str, Any]
    verdict: Optional[Verdict] = None
    human_approved: bool = False
    approved_by: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = None
