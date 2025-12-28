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


class CCRAMRequest(BaseModel):
    """Input request for CCRAM processing"""
    question: str = Field(..., description="The question/statement to analyze")
    topic_pack: TopicPack = Field(default=TopicPack.GENERAL, description="Context pack to use")
    session_id: Optional[str] = Field(default=None, description="Optional session ID for continuity")


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
