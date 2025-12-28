"""
CCRAM - CCR Anchor Module Models
Conversation Containment Rule (CCR) Support Tool
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
from enum import Enum


class TrapType(str, Enum):
    """CCR Trap Classification Types"""
    IDENTITY = "identity"           # "Are you Elijah?" / "Who do you think you are?"
    MOTIVE = "motive"               # "You just want money/power"
    URGENCY = "urgency"             # "Answer yes/no now"
    GOTCHA = "gotcha"               # Contradiction trap
    SMEAR = "smear"                 # "Cult / extremist / grifter"
    SCOPE_CREEP = "scope_creep"     # "Explain everything right now"
    MISQUOTE = "misquote"           # "Did you say X?"
    EVIDENCE = "evidence"           # "Prove it scientifically in 10 seconds"
    FALSE_BINARY = "false_binary"   # "Either you admit Y or you're lying"
    NEUTRAL = "neutral"             # Genuine question, no trap detected


class TopicPack(str, Enum):
    """Available Topic/Context Packs"""
    BANIBS = "banibs"                   # sovereignty, circulation, agency
    HDOS = "hdos"                       # decision-space collapse, exits intact
    DISMISSIVE_ARGUMENT = "dismissive"  # fault scanning, inquiry collapse
    RESTORATIVE_CIRCLES = "restorative" # circulation, regeneration
    TREE_OF_LIFE = "tree_of_life"       # Word-as-life nourishment
    GENERAL = "general"                 # No specific pack


class ResponseLength(str, Enum):
    """Response duration variants"""
    SHORT = "10s"      # 10-second tight version
    BALANCED = "30s"   # 30-second balanced version
    EXPANDED = "60s"   # 60-second expanded version


class InputMode(str, Enum):
    """Input mode for question source"""
    TEXT = "text"           # Typed question
    TRANSCRIPT = "transcript"  # Pasted transcript
    AUDIO = "audio"         # Live audio (speech-to-text)


class CCRAMRequest(BaseModel):
    """Input request for CCRAM processing"""
    question: str = Field(..., description="The question/statement to analyze")
    topic_pack: TopicPack = Field(default=TopicPack.GENERAL, description="Context pack to use")
    session_id: Optional[str] = Field(default=None, description="Optional session ID for continuity")
    
    # NQR (No Quick Response) Timing Fields
    input_mode: InputMode = Field(default=InputMode.TEXT, description="Source of the question input")
    default_wait_seconds: int = Field(default=15, ge=5, le=60, description="Minimum baseline pause (floor)")
    buffer_seconds: int = Field(default=0, ge=0, le=120, description="Additional operator-controlled buffer")
    estimated_words_per_minute: int = Field(default=150, ge=100, le=200, description="WPM for duration estimation")
    question_duration_seconds: Optional[float] = Field(default=None, description="Caller-supplied duration (if known)")
    enforce_nqr: bool = Field(default=True, description="Enable No Quick Response timing rules")


class TrapClassification(BaseModel):
    """Classification result from CCR Router"""
    primary_trap: TrapType
    secondary_traps: List[TrapType] = []
    confidence: float = Field(ge=0.0, le=1.0)
    reasoning: str


class CCRResponse(BaseModel):
    """A single CCR-anchored response"""
    length: ResponseLength
    mechanism_anchor: str           # Core mechanism statement
    example: Optional[str] = None   # Illustrative example
    boundary_statement: str         # Exit-preserving statement
    redirect_question: str          # Return-to-mechanism question
    full_response: str              # Complete assembled response
    timing_prefixed_response: Optional[str] = None  # Response with timing boundary prepended


class CCRAMOutput(BaseModel):
    """Complete CCRAM output"""
    original_question: str
    classification: TrapClassification
    topic_pack_used: TopicPack
    responses: List[CCRResponse]    # 3 responses (10s, 30s, 60s)
    glasses_cards: List[str]        # Big text cards for AR glasses
    earpiece_cues: List[str]        # Short whisper cues (3-8 words)
    red_flag_triggered: bool = False
    red_flag_reason: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    # NQR Timing Output Fields
    computed_question_duration_seconds: float = Field(default=0.0, description="Estimated duration to ask the question")
    required_pause_seconds: float = Field(default=15.0, description="Required pause before responding")
    engagement_rule_notice: str = Field(default="", description="Displayable engagement protocol statement")
    timing_boundary_line: str = Field(default="", description="One-liner to prepend to responses")
    public_engagement_rules: Optional[List[str]] = Field(default=None, description="Full public engagement rules block")


class PanicMuteRequest(BaseModel):
    """Request to trigger panic mute"""
    session_id: str
    clear_buffer: bool = True


class TestQuestion(BaseModel):
    """Hostile interview test question"""
    id: str
    question: str
    expected_trap_types: List[TrapType]
    topic_context: Optional[TopicPack] = None
    notes: Optional[str] = None
    # Timing test fields
    expected_min_pause: Optional[float] = None  # For timing tests
