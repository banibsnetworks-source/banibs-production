"""
BANIBS Founder Authentication Protocol (FAP) Schemas
Phase X - 21-Layer Security Foundation

Pydantic models for FAP authentication, verification, and command authorization.
"""

from pydantic import BaseModel, Field
from typing import Optional, Dict, List, Literal
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """Risk levels for FAP-protected commands"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    SOVEREIGN = "sovereign"


class VerificationStatus(str, Enum):
    """Status of individual verification layer"""
    PASSED = "passed"
    FAILED = "failed"
    SKIPPED = "skipped"
    STUB = "stub"
    NOT_CONFIGURED = "not_configured"


class CommandDecision(str, Enum):
    """Final FAP gateway decision"""
    ALLOW = "allow"
    DENY = "deny"
    HOLD_FOR_REVIEW = "hold_for_review"
    REQUIRES_CONFIRMATION = "requires_confirmation"


class FAPConfig(BaseModel):
    """FAP system configuration"""
    id: str
    layer_number: int = Field(..., ge=1, le=21, description="Layer number (1-21)")
    layer_name: str
    enabled: bool = Field(default=False, description="Whether this layer is active")
    is_stub: bool = Field(default=True, description="True if awaiting hardware/AI implementation")
    description: str
    implementation_status: str = Field(default="stub", description="stub|partial|complete")
    required_for_risk_levels: List[RiskLevel] = Field(default_factory=list)
    config_data: Dict = Field(default_factory=dict, description="Layer-specific configuration")
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class VerificationLayerResult(BaseModel):
    """Result from a single verification layer"""
    layer_number: int
    layer_name: str
    status: VerificationStatus
    details: Optional[str] = None
    metadata: Dict = Field(default_factory=dict)
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)


class FounderAuthSession(BaseModel):
    """Active Founder authentication session"""
    id: str
    founder_user_id: str
    session_token: str
    device_fingerprint: Optional[str] = None
    ip_address: Optional[str] = None
    location_data: Optional[Dict] = None
    created_at: datetime
    expires_at: datetime
    last_activity: datetime
    verification_layers_passed: List[int] = Field(default_factory=list)
    risk_level_authorized: RiskLevel = RiskLevel.LOW
    is_active: bool = True


class CommandAuthorizationRequest(BaseModel):
    """Request to execute a FAP-protected command"""
    command_name: str
    command_category: str
    risk_level: RiskLevel
    requested_by: str
    parameters: Dict = Field(default_factory=dict)
    context: Dict = Field(default_factory=dict)
    requires_delay: bool = Field(default=False)
    delay_hours: Optional[int] = None


class CommandAuthorizationResult(BaseModel):
    """Result of FAP command authorization check"""
    authorization_id: str
    command_name: str
    decision: CommandDecision
    risk_level: RiskLevel
    layers_evaluated: List[VerificationLayerResult]
    passed_layers: int
    failed_layers: int
    reasons: List[str] = Field(default_factory=list)
    hold_until: Optional[datetime] = None
    requires_reconfirmation: bool = False
    evaluated_at: datetime = Field(default_factory=datetime.utcnow)


class SecurityEvent(BaseModel):
    """Security audit log entry"""
    id: str
    event_type: str
    severity: Literal["info", "warning", "critical"]
    founder_user_id: Optional[str] = None
    session_id: Optional[str] = None
    command_name: Optional[str] = None
    authorization_id: Optional[str] = None
    decision: Optional[CommandDecision] = None
    details: str
    metadata: Dict = Field(default_factory=dict)
    ip_address: Optional[str] = None
    device_fingerprint: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class FAPHealthCheck(BaseModel):
    """FAP system health status"""
    total_layers: int = 21
    active_layers: int
    stub_layers: int
    system_status: Literal["operational", "degraded", "offline"]
    last_check: datetime
    layer_status: List[Dict]


class RegisteredCommand(BaseModel):
    """Command registered with FAP for protection"""
    id: str
    command_name: str
    command_category: str
    risk_level: RiskLevel
    description: str
    required_layers: List[int] = Field(default_factory=list)
    requires_time_delay: bool = False
    delay_hours: int = 0
    requires_multi_step: bool = False
    created_at: datetime
    updated_at: datetime
