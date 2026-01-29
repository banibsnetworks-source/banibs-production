"""
Founder Ops Hub Models
- Ops Log: Operational memory/changelog
- Tasks: Priority-based kanban
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
# TASKS
# =====================

class TaskColumn(str, Enum):
    P0 = "P0"  # Now
    P1 = "P1"  # Next
    LATER = "Later"


class TaskStatus(str, Enum):
    OPEN = "Open"
    IN_PROGRESS = "In Progress"
    DONE = "Done"


class TaskOwner(str, Enum):
    FOUNDER = "Founder"
    NEO = "Neo"
    SYSTEM = "System"


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="")
    column: TaskColumn = TaskColumn.P1
    status: TaskStatus = TaskStatus.OPEN
    owner: TaskOwner = TaskOwner.FOUNDER
    related_link: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    column: Optional[TaskColumn] = None
    status: Optional[TaskStatus] = None
    owner: Optional[TaskOwner] = None
    related_link: Optional[str] = None


class Task(BaseModel):
    id: str
    title: str
    description: str
    column: str
    status: str
    owner: str
    related_link: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: str


# =====================
# DETECTORS (HDOS)
# =====================

class DetectorStatus(str, Enum):
    ACTIVE = "Active"
    PAUSED = "Paused"
    RETIRED = "Retired"


class DetectorTrigger(str, Enum):
    MANUAL = "Manual"
    SCHEDULED = "Scheduled"
    EVENT = "Event"
    CONTINUOUS = "Continuous"


class DetectorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="")
    detection_logic: str = Field(default="")  # What this detector looks for
    response_action: str = Field(default="")  # What happens when triggered
    trigger_type: DetectorTrigger = DetectorTrigger.MANUAL
    status: DetectorStatus = DetectorStatus.ACTIVE
    related_system: Optional[str] = None  # Which system/module it relates to


class DetectorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    detection_logic: Optional[str] = None
    response_action: Optional[str] = None
    trigger_type: Optional[DetectorTrigger] = None
    status: Optional[DetectorStatus] = None
    related_system: Optional[str] = None


class Detector(BaseModel):
    id: str
    name: str
    description: str
    detection_logic: str
    response_action: str
    trigger_type: str
    status: str
    related_system: Optional[str] = None
    last_triggered: Optional[datetime] = None
    trigger_count: int = 0
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: str


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
    OTHER = "Other"


class DocumentCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(default="")
    doc_type: DocumentType = DocumentType.OTHER
    external_url: Optional[str] = None  # For links to external resources
    internal_path: Optional[str] = None  # For internal file references


class DocumentUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    doc_type: Optional[DocumentType] = None
    external_url: Optional[str] = None
    internal_path: Optional[str] = None


class Document(BaseModel):
    id: str
    title: str
    description: str
    doc_type: str
    external_url: Optional[str] = None
    internal_path: Optional[str] = None
    file_id: Optional[str] = None  # GridFS file ID if uploaded
    file_name: Optional[str] = None
    file_size: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: str
