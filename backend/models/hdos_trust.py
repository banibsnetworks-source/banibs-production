"""
HDOS v2 - Circle Trust Order Models
7-Level Trust System

Trust Levels (canonical order):
1. Peoples - Highest trust
2. Cool
3. CHILL
4. Alright
5. Others
6. Others • Safe Mode
7. Blocked - Lowest trust / No access
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum


# =====================
# TRUST LEVELS
# =====================

class TrustLevelKey(str, Enum):
    """Canonical trust level identifiers"""
    PEOPLES = "PEOPLES"
    COOL = "COOL"
    CHILL = "CHILL"
    ALRIGHT = "ALRIGHT"
    OTHERS = "OTHERS"
    OTHERS_SAFE = "OTHERS_SAFE"
    BLOCKED = "BLOCKED"


# Canonical order (1 = highest trust, 7 = lowest/blocked)
TRUST_LEVEL_ORDER = {
    TrustLevelKey.PEOPLES: 1,
    TrustLevelKey.COOL: 2,
    TrustLevelKey.CHILL: 3,
    TrustLevelKey.ALRIGHT: 4,
    TrustLevelKey.OTHERS: 5,
    TrustLevelKey.OTHERS_SAFE: 6,
    TrustLevelKey.BLOCKED: 7,
}


class TrustLevelAudit(BaseModel):
    created_at: datetime
    updated_at: datetime


class TrustLevel(BaseModel):
    """Trust level definition (seeded, read-only after init)"""
    id: str
    key: str  # TrustLevelKey value
    order: int  # 1-7, canonical order
    name: str  # Display name
    description: str
    color: str  # UI color hint
    icon: Optional[str] = None
    is_active: bool = True
    audit: TrustLevelAudit


# =====================
# TRUST POLICIES
# =====================

class DetectorThreshold(BaseModel):
    """Threshold for a detector type at this trust level"""
    detector_type: str  # e.g., "DOG", "BDL_BIS"
    max_severity: str  # Maximum severity allowed: INFO, LOW, MEDIUM, HIGH, CRITICAL
    action_on_exceed: str = "flag"  # flag, warn, block


class TrustPolicyCreate(BaseModel):
    """Create/update a trust policy for a level"""
    level_key: str  # TrustLevelKey
    allowed_modules: List[str] = Field(default_factory=list)  # Module keys from moduleRegistry
    detector_thresholds: List[DetectorThreshold] = Field(default_factory=list)
    notes: str = ""  # Canonical text/rules


class TrustPolicyUpdate(BaseModel):
    """Update trust policy"""
    allowed_modules: Optional[List[str]] = None
    detector_thresholds: Optional[List[DetectorThreshold]] = None
    notes: Optional[str] = None


class TrustPolicy(BaseModel):
    """Trust policy for a specific level"""
    id: str
    level_key: str
    level_order: int  # Denormalized for sorting
    allowed_modules: List[str] = Field(default_factory=list)
    detector_thresholds: List[dict] = Field(default_factory=list)
    notes: str = ""
    audit: TrustLevelAudit


# =====================
# TRUST ASSIGNMENTS
# =====================

class SubjectType(str, Enum):
    """Types of subjects that can have trust assigned"""
    USER = "USER"
    EMAIL = "EMAIL"
    PHONE = "PHONE"
    DEVICE = "DEVICE"
    IP = "IP"
    ORGANIZATION = "ORGANIZATION"
    CUSTOM = "CUSTOM"


class TrustAssignmentCreate(BaseModel):
    """Assign trust level to a subject"""
    subject_type: SubjectType
    subject_id: str  # email, user_id, phone, etc.
    subject_label: Optional[str] = None  # Human-readable label
    level_key: str  # TrustLevelKey
    reason: str = ""  # Why this assignment
    expires_at: Optional[datetime] = None  # Optional expiration
    assigned_by: Optional[str] = None  # Who assigned it


class TrustAssignmentUpdate(BaseModel):
    """Update trust assignment"""
    level_key: Optional[str] = None
    subject_label: Optional[str] = None
    reason: Optional[str] = None
    expires_at: Optional[datetime] = None


class TrustAssignment(BaseModel):
    """Trust assignment record"""
    id: str
    subject_type: str
    subject_id: str
    subject_label: Optional[str] = None
    level_key: str
    level_order: int  # Denormalized for sorting
    level_name: str  # Denormalized for display
    reason: str = ""
    expires_at: Optional[datetime] = None
    assigned_by: Optional[str] = None
    is_active: bool = True
    audit: TrustLevelAudit


# =====================
# SEED DATA
# =====================

SEED_TRUST_LEVELS = [
    {
        "key": "PEOPLES",
        "order": 1,
        "name": "Peoples",
        "description": "Highest trust. Inner circle. Full access to all systems and modules.",
        "color": "#C8A857",  # Gold
        "icon": "crown"
    },
    {
        "key": "COOL",
        "order": 2,
        "name": "Cool",
        "description": "High trust. Trusted associates. Access to most systems with minimal restrictions.",
        "color": "#10B981",  # Green
        "icon": "star"
    },
    {
        "key": "CHILL",
        "order": 3,
        "name": "CHILL",
        "description": "Good trust. Relaxed access. Standard features available, some sensitive areas restricted.",
        "color": "#0EA5E9",  # Blue
        "icon": "thumbs-up"
    },
    {
        "key": "ALRIGHT",
        "order": 4,
        "name": "Alright",
        "description": "Neutral trust. Standard access. Core features available, elevated monitoring.",
        "color": "#8B5CF6",  # Purple
        "icon": "check"
    },
    {
        "key": "OTHERS",
        "order": 5,
        "name": "Others",
        "description": "Unknown/Default trust. Limited access. Public features only, full monitoring.",
        "color": "#6B7280",  # Gray
        "icon": "user"
    },
    {
        "key": "OTHERS_SAFE",
        "order": 6,
        "name": "Others • Safe Mode",
        "description": "Low trust with protection. Highly restricted access. All actions logged and reviewed.",
        "color": "#F59E0B",  # Amber
        "icon": "shield"
    },
    {
        "key": "BLOCKED",
        "order": 7,
        "name": "Blocked",
        "description": "No trust. Access denied. All interactions blocked.",
        "color": "#EF4444",  # Red
        "icon": "ban"
    }
]
