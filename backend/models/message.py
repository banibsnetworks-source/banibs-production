"""
Conversation & Message Models - Pydantic schemas for messaging system
Phase 6.2.2 - Messaging System
"""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


# ============================================
# Conversation Models
# ============================================

class ParticipantInfo(BaseModel):
    """Participant details for conversation"""
    id: str
    name: str
    avatar_url: Optional[str] = None


class ConversationBase(BaseModel):
    """Base conversation schema"""
    participants: List[str] = Field(..., min_items=2, max_items=2, description="UUIDs of participants (2 for one-on-one)")


class ConversationCreate(ConversationBase):
    """Schema for creating a conversation"""
    pass


class ConversationPublic(BaseModel):
    """Public conversation schema (returned to users)"""
    id: str
    participants: List[str]
    participant_details: List[ParticipantInfo]
    last_message: Optional[str] = None
    last_message_at: Optional[datetime] = None
    unread_count: int = 0  # For current user
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# Message Models
# ============================================

class MessageBase(BaseModel):
    """Base message schema"""
    content: str = Field(..., min_length=1, max_length=5000)


class MessageCreate(MessageBase):
    """Schema for creating a message"""
    pass


class MessagePublic(BaseModel):
    """Public message schema (returned to users)"""
    id: str
    conversation_id: str
    sender_id: str
    sender_name: str
    content: str
    read: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================
# Response Models
# ============================================

class UnreadMessageCount(BaseModel):
    """Schema for unread message count response"""
    unread_count: int


class ConversationWithMessages(BaseModel):
    """Conversation with messages"""
    conversation: ConversationPublic
    messages: List[MessagePublic]
