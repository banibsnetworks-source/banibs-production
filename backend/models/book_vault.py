"""
Book Vault - Data Models

Admin-only module for managing Raymond's books, chapters, 
drafts, scripture anchors, and content blocks.

Version history supported - edits create new versions.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime
from uuid import uuid4


# =============================================================================
# ENUMS
# =============================================================================

class BookSeries(str, Enum):
    """Book series classification"""
    D_SERIES = "D"       # Devil's series
    G_SERIES = "G"       # God's series  
    O_SERIES = "O"       # Other revelation series
    COMPANION = "Companion"  # Companion works
    OTHER = "Other"


class BookStatus(str, Enum):
    """Book publication status"""
    PLANNED = "planned"
    DRAFTING = "drafting"
    REVIEW = "review"
    PUBLISHED = "published"


class ChapterStatus(str, Enum):
    """Chapter status"""
    PLANNED = "planned"
    DRAFT = "draft"
    LOCKED = "locked"


class BlockType(str, Enum):
    """Content block types"""
    PROSE = "prose"
    OUTLINE = "outline"
    BLURB = "blurb"
    POSITIONING_NOTE = "positioning_note"
    SCRIPTURE_NOTE = "scripture_note"
    PAGE_COPY = "page_copy"
    RESEARCH_NOTE = "research_note"


# =============================================================================
# BOOK MODEL
# =============================================================================

class BookCreate(BaseModel):
    """Create a new book"""
    series: BookSeries = BookSeries.OTHER
    book_number: Optional[int] = None
    title: str = Field(..., min_length=1, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=300)
    status: BookStatus = BookStatus.PLANNED
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class Book(BaseModel):
    """Full book record"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    series: BookSeries = BookSeries.OTHER
    book_number: Optional[int] = None
    title: str
    subtitle: Optional[str] = None
    status: BookStatus = BookStatus.PLANNED
    description: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    is_deleted: bool = False


# =============================================================================
# CHAPTER MODEL
# =============================================================================

class ChapterCreate(BaseModel):
    """Create a new chapter"""
    book_id: str
    chapter_number: int = Field(..., ge=1)
    title: str = Field(..., min_length=1, max_length=200)
    status: ChapterStatus = ChapterStatus.PLANNED
    summary: Optional[str] = None
    order_index: int = 0


class Chapter(BaseModel):
    """Full chapter record"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    book_id: str
    chapter_number: int
    title: str
    status: ChapterStatus = ChapterStatus.PLANNED
    summary: Optional[str] = None
    order_index: int = 0
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    is_deleted: bool = False


# =============================================================================
# CONTENT BLOCK MODEL (Pull-Down Units)
# =============================================================================

class ContentBlockCreate(BaseModel):
    """Create a new content block"""
    book_id: Optional[str] = None
    chapter_id: Optional[str] = None
    block_type: BlockType = BlockType.PROSE
    title: str = Field(..., min_length=1, max_length=200)
    content: str = Field(..., min_length=1)
    tags: List[str] = Field(default_factory=list)


class ContentBlock(BaseModel):
    """
    Content block with version history.
    Rule: Edits ALWAYS create a new version.
    """
    id: str = Field(default_factory=lambda: str(uuid4()))
    book_id: Optional[str] = None
    chapter_id: Optional[str] = None
    block_type: BlockType = BlockType.PROSE
    title: str
    content: str
    tags: List[str] = Field(default_factory=list)
    version: int = 1
    parent_version_id: Optional[str] = None
    is_locked: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    created_by: Optional[str] = None
    is_deleted: bool = False


# =============================================================================
# SCRIPTURE ANCHOR MODEL
# =============================================================================

class ScriptureAnchorCreate(BaseModel):
    """Create a scripture anchor"""
    book_id: Optional[str] = None
    chapter_id: Optional[str] = None
    reference: str = Field(..., min_length=1, max_length=100, description="e.g., John 8:33-44")
    translation: str = Field("KJV", max_length=20)
    excerpt: Optional[str] = Field(None, max_length=500)
    note: Optional[str] = None
    tags: List[str] = Field(default_factory=list)


class ScriptureAnchor(BaseModel):
    """Scripture anchor record"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    book_id: Optional[str] = None
    chapter_id: Optional[str] = None
    reference: str
    translation: str = "KJV"
    excerpt: Optional[str] = None
    note: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_deleted: bool = False


# =============================================================================
# EXPORT MODELS
# =============================================================================

class ExportFormat(str, Enum):
    MARKDOWN = "markdown"
    JSON = "json"


class ExportRequest(BaseModel):
    """Export request"""
    format: ExportFormat = ExportFormat.MARKDOWN
    include_chapters: bool = True
    include_blocks: bool = True
    include_scripture: bool = True
