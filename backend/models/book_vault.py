"""
Book Vault - Data Models v1.0
CANONICAL SPEC - Raymond Al Zedeck

Admin-only module for managing founder's literary works with:
- Works (books/volumes/companions/appendices/modules/notes)
- Entries (chapters/sections/blurbs/page_copy/scripture_notes/research_notes)
- Entry Versions (version history - edits NEVER overwrite)

GUIDING PRINCIPLES:
1) Nothing gets lost: edits create versions, never overwrite
2) Scales forever: structure must not require redesign
3) Admin/Founder only (private by default)
4) Exportable at any time (Markdown v1)
5) Fast retrieval: search + "copy/pull down" on every block
6) Guardrails: soft delete only; locking requires new version
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime, timezone
from uuid import uuid4


# =============================================================================
# ENUMS (Canonical v1)
# =============================================================================

class SeriesKey(str, Enum):
    """Book series classification"""
    D = "D"           # Devil's series (D-Series)
    G = "G"           # God's series (G-Series)
    O = "O"           # Other revelation series
    BANIBS = "BANIBS" # BANIBS platform works
    LIFE = "LIFE"     # Life/personal works
    OTHER = "OTHER"   # Uncategorized


class WorkType(str, Enum):
    """Type of literary work"""
    BOOK = "book"
    VOLUME = "volume"
    COMPANION = "companion"
    APPENDIX = "appendix"
    MODULE = "module"
    NOTE = "note"


class WorkStatus(str, Enum):
    """Work publication status"""
    PLANNED = "planned"
    DRAFTING = "drafting"
    REVIEW = "review"
    PUBLISHED = "published"
    ARCHIVED = "archived"


class EntryType(str, Enum):
    """Entry type within a work"""
    CHAPTER = "chapter"
    SECTION = "section"
    BLURB = "blurb"
    PAGE_COPY = "page_copy"
    OUTLINE = "outline"
    SCRIPTURE_NOTE = "scripture_note"
    RESEARCH_NOTE = "research_note"
    APPENDIX = "appendix"
    ASSET = "asset"


class ContentFormat(str, Enum):
    """Content format for entry versions"""
    MARKDOWN = "markdown"
    RICHTEXT = "richtext"


class VersionSource(str, Enum):
    """Source of version content"""
    USER = "user"
    ASSISTANT = "assistant"
    IMPORT = "import"


# =============================================================================
# WORKS MODEL (Collection: vault_works)
# =============================================================================

class WorkCreate(BaseModel):
    """Create a new work"""
    series_key: SeriesKey = SeriesKey.OTHER
    work_type: WorkType = WorkType.BOOK
    order_key: Optional[str] = Field(None, max_length=20, description="e.g., 'D-1', 'D-2', 'G-1'")
    title: str = Field(..., min_length=1, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=300)
    status: WorkStatus = WorkStatus.PLANNED
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class WorkUpdate(BaseModel):
    """Update work metadata"""
    series_key: Optional[SeriesKey] = None
    work_type: Optional[WorkType] = None
    order_key: Optional[str] = None
    title: Optional[str] = None
    subtitle: Optional[str] = None
    status: Optional[WorkStatus] = None
    description: Optional[str] = None
    tags: Optional[List[str]] = None


class Work(BaseModel):
    """Full work record"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    series_key: SeriesKey = SeriesKey.OTHER
    work_type: WorkType = WorkType.BOOK
    order_key: Optional[str] = None
    title: str
    subtitle: Optional[str] = None
    status: WorkStatus = WorkStatus.PLANNED
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by_user_id: Optional[str] = None
    is_deleted: bool = False


# =============================================================================
# ENTRIES MODEL (Collection: vault_entries)
# =============================================================================

class EntryCreate(BaseModel):
    """Create a new entry"""
    work_id: str
    entry_type: EntryType = EntryType.CHAPTER
    title: str = Field(..., min_length=1, max_length=200)
    order_index: Optional[int] = None
    tags: List[str] = Field(default_factory=list)
    # Optional initial content - if provided, creates v1 version
    content: Optional[str] = None
    content_format: ContentFormat = ContentFormat.MARKDOWN


class EntryUpdate(BaseModel):
    """Update entry metadata (NOT content - use versions for that)"""
    title: Optional[str] = None
    order_index: Optional[int] = None
    tags: Optional[List[str]] = None
    is_locked: Optional[bool] = None


class Entry(BaseModel):
    """Full entry record"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    work_id: str
    entry_type: EntryType = EntryType.CHAPTER
    title: str
    order_index: Optional[int] = None
    current_version_id: Optional[str] = None
    is_locked: bool = False
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_deleted: bool = False


# =============================================================================
# ENTRY VERSIONS MODEL (Collection: vault_entry_versions)
# The vault's "memory" - never overwrite, always create new versions
# =============================================================================

class EntryVersionCreate(BaseModel):
    """Create a new version of an entry"""
    content: str = Field(..., min_length=1)
    content_format: ContentFormat = ContentFormat.MARKDOWN
    source: VersionSource = VersionSource.USER
    notes: Optional[str] = None


class EntryVersion(BaseModel):
    """Full entry version record"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    entry_id: str
    version_number: int = 1
    content_format: ContentFormat = ContentFormat.MARKDOWN
    content: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by_user_id: Optional[str] = None
    source: VersionSource = VersionSource.USER
    notes: Optional[str] = None
    parent_version_id: Optional[str] = None  # Supports branching if needed


# =============================================================================
# SEARCH & EXPORT MODELS
# =============================================================================

class SearchResult(BaseModel):
    """Search result item"""
    type: str  # "work", "entry", "version"
    id: str
    title: str
    snippet: Optional[str] = None
    work_id: Optional[str] = None
    work_title: Optional[str] = None
    relevance: float = 1.0


class ExportOptions(BaseModel):
    """Export configuration"""
    include_entries: bool = True
    include_versions: bool = False  # Just current version by default
    watermark: bool = True


# =============================================================================
# RESPONSE MODELS
# =============================================================================

class WorkResponse(BaseModel):
    """Work with entry counts"""
    work: dict
    entry_count: int = 0
    version_count: int = 0


class EntryWithVersion(BaseModel):
    """Entry with current version content"""
    entry: dict
    current_version: Optional[dict] = None
    version_count: int = 0
