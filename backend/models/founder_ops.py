"""
Founder Ops Hub Models
- Ops Log: Operational memory/changelog
- Tasks: Priority-based kanban (P0, P1, Later)
- Detectors: HDOS / BANIBS Detectors & Safety Layers
- Documents: Secure document vault

Access: super_admin only
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
from enum import Enum


# =====================
# OPS LOG
# =====================

class OpsLogCategory(str, Enum):
    DECISION = "Decision"
    BUG = "Bug"
    FEATURE = "Feature"
    OPS = "Ops"
    INFRA = "Infra"
    HDOS = "HDOS"
    NOTE = "Note"


class OpsLogStatus(str, Enum):
    OPEN = "Open"
    LOCKED = "Locked"
    SUPERSEDED = "Superseded"


class OpsLogEntryCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    notes: str = Field(default="")
    category: Optional[OpsLogCategory] = None
    status: OpsLogStatus = OpsLogStatus.OPEN


class OpsLogEntryUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    notes: Optional[str] = None
    category: Optional[OpsLogCategory] = None
    status: Optional[OpsLogStatus] = None


class OpsLogEntry(BaseModel):
    id: str
    timestamp: datetime
    title: str
    notes: str
    category: Optional[str] = None
    status: str
    created_by: str  # user_id or "system"
    updated_at: Optional[datetime] = None


# =====================
# TASKS (Kanban)
# =====================

class TaskColumn(str, Enum):
    P0 = "P0"      # Now
    P1 = "P1"      # Next
    LATER = "LATER"


class TaskStatus(str, Enum):
    OPEN = "OPEN"
    IN_PROGRESS = "IN_PROGRESS"
    DONE = "DONE"
    BLOCKED = "BLOCKED"
    ARCHIVED = "ARCHIVED"


class TaskPriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TaskLinked(BaseModel):
    module_key: Optional[str] = None
    discovery_id: Optional[str] = None
    detector_id: Optional[str] = None
    ops_log_id: Optional[str] = None


class TaskAudit(BaseModel):
    created_at: datetime
    updated_at: datetime


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=5000)
    column: TaskColumn = TaskColumn.P0
    status: TaskStatus = TaskStatus.OPEN
    priority: TaskPriority = TaskPriority.MEDIUM
    tags: List[str] = Field(default_factory=list)
    order: float = 0.0
    due_at: Optional[datetime] = None
    owner: str = "Founder"
    linked: Optional[TaskLinked] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=120)
    description: Optional[str] = Field(None, max_length=5000)
    column: Optional[TaskColumn] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    tags: Optional[List[str]] = None
    order: Optional[float] = None
    due_at: Optional[datetime] = None
    owner: Optional[str] = None
    linked: Optional[TaskLinked] = None


class TaskMove(BaseModel):
    to_column: TaskColumn
    to_order: float


class Task(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    column: str
    status: str
    priority: str
    tags: List[str] = Field(default_factory=list)
    order: float = 0.0
    due_at: Optional[datetime] = None
    owner: str = "Founder"
    linked: Optional[TaskLinked] = None
    audit: TaskAudit


# =====================
# DETECTORS (HDOS)
# =====================

class DetectorDomain(str, Enum):
    HDOS = "HDOS"
    BANIBS = "BANIBS"
    TRUST = "TRUST"
    IDENTITY = "IDENTITY"
    SOCIAL = "SOCIAL"
    BUSINESS = "BUSINESS"
    NEWS = "NEWS"
    SECURITY = "SECURITY"


class DetectorType(str, Enum):
    DOG = "DOG"
    BDL_BIS = "BDL_BIS"
    LPL = "LPL"
    SPOOFING_FRIEND = "SPOOFING_FRIEND"
    SPOOFING_FAMILY = "SPOOFING_FAMILY"
    SPOOFING_IDENTITY = "SPOOFING_IDENTITY"
    SPOOFING_WORKPLACE = "SPOOFING_WORKPLACE"
    TRUST_EROSION_LOOP = "TRUST_EROSION_LOOP"
    PRESSURE_TRANSFER = "PRESSURE_TRANSFER"
    CUSTOM = "CUSTOM"


class DetectorStatus(str, Enum):
    DRAFT = "DRAFT"
    ACTIVE = "ACTIVE"
    PAUSED = "PAUSED"
    DEPRECATED = "DEPRECATED"


class Severity(str, Enum):
    INFO = "INFO"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class DetectorSignal(BaseModel):
    key: str
    label: str
    description: Optional[str] = None
    weight: float = 1.0


class DetectorAction(BaseModel):
    key: str
    label: str
    description: Optional[str] = None


class DetectorUI(BaseModel):
    visible: bool = True
    color_hint: Optional[str] = None
    icon: Optional[str] = None


class DetectorLinked(BaseModel):
    module_key: Optional[str] = None
    discovery_ids: List[str] = Field(default_factory=list)
    related_detector_ids: List[str] = Field(default_factory=list)


class DetectorAudit(BaseModel):
    created_at: datetime
    updated_at: datetime


class DetectorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    domain: DetectorDomain = DetectorDomain.HDOS
    type: DetectorType
    status: DetectorStatus = DetectorStatus.DRAFT
    severity_default: Severity = Severity.MEDIUM
    description: Optional[str] = Field(None, max_length=8000)
    canonical_rules: List[str] = Field(default_factory=list)
    signals: List[DetectorSignal] = Field(default_factory=list)
    actions: List[DetectorAction] = Field(default_factory=list)
    ui: Optional[DetectorUI] = None
    linked: Optional[DetectorLinked] = None


class DetectorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    domain: Optional[DetectorDomain] = None
    type: Optional[DetectorType] = None
    status: Optional[DetectorStatus] = None
    severity_default: Optional[Severity] = None
    description: Optional[str] = Field(None, max_length=8000)
    canonical_rules: Optional[List[str]] = None
    signals: Optional[List[DetectorSignal]] = None
    actions: Optional[List[DetectorAction]] = None
    ui: Optional[DetectorUI] = None
    linked: Optional[DetectorLinked] = None


class Detector(BaseModel):
    id: str
    name: str
    domain: str
    type: str
    status: str
    severity_default: str
    description: Optional[str] = None
    canonical_rules: List[str] = Field(default_factory=list)
    signals: List[dict] = Field(default_factory=list)
    actions: List[dict] = Field(default_factory=list)
    ui: dict = Field(default_factory=lambda: {"visible": True, "color_hint": None, "icon": None})
    linked: dict = Field(default_factory=lambda: {"module_key": None, "discovery_ids": [], "related_detector_ids": []})
    audit: DetectorAudit


# =====================
# DOCUMENTS
# =====================

class DocumentType(str, Enum):
    ARCHITECTURE = "Architecture"
    MODULE = "Module"
    LEGAL = "Legal"
    BOOK = "Book"
    HDOS = "HDOS"
    SPEC = "Spec"
    CANONICAL = "Canonical"
    OTHER = "Other"


class DocumentAudit(BaseModel):
    created_at: datetime
    updated_at: datetime


class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="")
    doc_type: DocumentType = DocumentType.OTHER
    tags: List[str] = Field(default_factory=list)


class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    doc_type: Optional[DocumentType] = None
    tags: Optional[List[str]] = None


class Document(BaseModel):
    id: str
    title: str
    description: str
    doc_type: str
    tags: List[str] = Field(default_factory=list)
    # File metadata
    filename: Optional[str] = None
    content_type: Optional[str] = None
    size_bytes: Optional[int] = None
    storage_path: Optional[str] = None
    sha256: Optional[str] = None
    # Audit
    audit: DocumentAudit


# =====================
# API RESPONSE ENVELOPE
# =====================

class APIError(BaseModel):
    code: str
    message: str
    details: Optional[dict] = None


class APIResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[APIError] = None
