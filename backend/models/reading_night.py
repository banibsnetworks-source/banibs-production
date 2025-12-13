"""
Reading Night - Data Models v1.0
BANIBS Reading Night - Guided Communal Reading Experience

Models for:
- ReadingSession: Main session object with Book Vault references
- SessionScript: References to Book Vault entries with content ranges
- SessionRSVP: Access requests for sessions
- SessionReflection: Post-session reflection responses
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum
from datetime import datetime, timezone
from uuid import uuid4


# =============================================================================
# ENUMS
# =============================================================================

class SessionStatus(str, Enum):
    """Session lifecycle status"""
    DRAFT = "draft"           # Being created, not visible
    SCHEDULED = "scheduled"   # Premiere scheduled, accepting RSVPs
    LIVE = "live"             # Currently in premiere mode
    REPLAY = "replay"         # Premiere ended, available for replay
    ARCHIVED = "archived"     # No longer active


class SessionSpeed(str, Enum):
    """Reading speed circles (v1 only uses STANDARD)"""
    STANDARD = "standard"   # 155-165 WPM (default)
    FAST = "fast"           # 175-190 WPM (future)
    STUDY = "study"         # 135-150 WPM (future)


class RSVPStatus(str, Enum):
    """RSVP/access request status"""
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"


class AudioStatus(str, Enum):
    """Audio generation status"""
    PENDING = "pending"       # Not yet generated
    GENERATING = "generating" # Currently being generated
    READY = "ready"           # Audio available
    FAILED = "failed"         # Generation failed


# =============================================================================
# SESSION SCRIPT MODEL (References Book Vault content)
# =============================================================================

class ScriptSegment(BaseModel):
    """A segment of content from Book Vault for the session"""
    entry_id: str                    # Book Vault entry ID
    version_id: Optional[str] = None # Specific version (null = current)
    start_index: Optional[int] = None  # Character start (null = beginning)
    end_index: Optional[int] = None    # Character end (null = end)
    segment_type: str = "reading"      # reading | intro | section_break
    order_index: int = 0               # Order in session


class SessionScriptCreate(BaseModel):
    """Create session script"""
    work_id: str                       # Book Vault work ID
    segments: List[ScriptSegment] = Field(default_factory=list)
    intro_text: Optional[str] = None   # Optional custom intro
    outro_text: Optional[str] = None   # Optional custom outro


# =============================================================================
# READING SESSION MODEL
# =============================================================================

class ReadingSessionCreate(BaseModel):
    """Create a new reading session"""
    title: str = Field(..., min_length=1, max_length=200)
    subtitle: Optional[str] = Field(None, max_length=300)
    synopsis: Optional[str] = None
    work_id: str                       # Book Vault work being read
    episode_number: Optional[int] = None
    
    # Scheduling
    premiere_at: Optional[datetime] = None  # When premiere starts (null = on-demand only)
    estimated_duration_minutes: int = 60    # Estimated runtime
    
    # Script
    script: Optional[SessionScriptCreate] = None
    
    # Settings
    speed_mode: SessionSpeed = SessionSpeed.STANDARD
    discussion_room_link: Optional[str] = None  # Link to Peoples Room
    
    # Commitment Pass (mock for v1)
    commitment_fee_cents: int = 0       # Display amount (not charged in v1)
    commitment_label: str = "Commitment Pass"


class ReadingSessionUpdate(BaseModel):
    """Update session metadata"""
    title: Optional[str] = None
    subtitle: Optional[str] = None
    synopsis: Optional[str] = None
    premiere_at: Optional[datetime] = None
    estimated_duration_minutes: Optional[int] = None
    status: Optional[SessionStatus] = None
    discussion_room_link: Optional[str] = None
    commitment_fee_cents: Optional[int] = None


class ReadingSession(BaseModel):
    """Full reading session record"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    title: str
    subtitle: Optional[str] = None
    synopsis: Optional[str] = None
    work_id: str
    work_title: Optional[str] = None   # Denormalized for display
    episode_number: Optional[int] = None
    
    # Status & Scheduling
    status: SessionStatus = SessionStatus.DRAFT
    premiere_at: Optional[datetime] = None
    estimated_duration_minutes: int = 60
    actual_duration_seconds: Optional[int] = None
    
    # Script (embedded or reference)
    script: Optional[dict] = None
    
    # Audio
    audio_status: AudioStatus = AudioStatus.PENDING
    audio_url: Optional[str] = None
    audio_generated_at: Optional[datetime] = None
    
    # Settings
    speed_mode: SessionSpeed = SessionSpeed.STANDARD
    word_count: Optional[int] = None
    discussion_room_link: Optional[str] = None
    
    # Commitment Pass
    commitment_fee_cents: int = 0
    commitment_label: str = "Commitment Pass"
    
    # Metadata
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_by_user_id: Optional[str] = None
    
    # Stats
    rsvp_count: int = 0
    replay_count: int = 0


# =============================================================================
# RSVP MODEL (Access Requests)
# =============================================================================

class RSVPCreate(BaseModel):
    """Request access to a session"""
    session_id: str
    message: Optional[str] = None  # Optional message to admin


class RSVP(BaseModel):
    """Session RSVP/access record"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    user_id: str
    user_email: Optional[str] = None
    user_name: Optional[str] = None
    status: RSVPStatus = RSVPStatus.PENDING
    message: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewed_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# =============================================================================
# REFLECTION MODEL (Post-session responses)
# =============================================================================

class ReflectionCreate(BaseModel):
    """Submit post-session reflection"""
    session_id: str
    prompt_1_response: Optional[str] = None  # "What stood out?"
    prompt_2_response: Optional[str] = None  # "What challenged you?"
    prompt_3_response: Optional[str] = None  # "What would you test in life?"


class Reflection(BaseModel):
    """Post-session reflection record"""
    id: str = Field(default_factory=lambda: str(uuid4()))
    session_id: str
    user_id: str
    
    # 3 standard prompts
    prompt_1_response: Optional[str] = None  # "What stood out?"
    prompt_2_response: Optional[str] = None  # "What challenged you?"
    prompt_3_response: Optional[str] = None  # "What would you test in life?"
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# =============================================================================
# RESPONSE MODELS
# =============================================================================

class SessionListResponse(BaseModel):
    """List of sessions"""
    sessions: List[dict]
    total: int
    upcoming_count: int = 0
    replay_count: int = 0


class SessionDetailResponse(BaseModel):
    """Session with full details"""
    session: dict
    user_rsvp: Optional[dict] = None
    user_reflection: Optional[dict] = None
    has_access: bool = False


# =============================================================================
# REFLECTION PROMPTS (Standard)
# =============================================================================

REFLECTION_PROMPTS = [
    {
        "id": 1,
        "prompt": "What stood out?",
        "description": "A word, phrase, or idea that caught your attention."
    },
    {
        "id": 2,
        "prompt": "What challenged you?",
        "description": "Something that pushed against what you thought you knew."
    },
    {
        "id": 3,
        "prompt": "What would you test in life?",
        "description": "An insight you'd like to apply or observe in your own experience."
    }
]
