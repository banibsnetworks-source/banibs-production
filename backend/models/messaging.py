# BANIBS Connect - Phase 3.1 Messaging Data Models
from datetime import datetime, timezone
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field


class ConversationType(str, Enum):
    DM = "dm"
    GROUP = "group"
    BUSINESS = "business"


class MessageType(str, Enum):
    TEXT = "text"
    MEDIA = "media"
    SYSTEM = "system"


# --- Conversation Models ---

class ConversationCreate(BaseModel):
    type: ConversationType
    participant_ids: List[str]
    title: Optional[str] = None
    business_id: Optional[str] = None


class ConversationInDB(BaseModel):
    id: str = Field(alias="_id")
    type: ConversationType
    participant_ids: List[str]
    title: Optional[str] = None
    business_id: Optional[str] = None
    last_message_preview: Optional[str] = None
    last_message_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class ConversationResponse(BaseModel):
    id: str
    type: ConversationType
    participant_ids: List[str]
    title: Optional[str] = None
    business_id: Optional[str] = None
    last_message_preview: Optional[str] = None
    last_message_at: Optional[str] = None
    created_at: str
    updated_at: str


# --- Message Models ---

class MessageCreate(BaseModel):
    type: MessageType = MessageType.TEXT
    text: Optional[str] = None
    media_url: Optional[str] = None
    metadata: Optional[dict] = None


class MessageInDB(BaseModel):
    id: str = Field(alias="_id")
    conversation_id: str
    sender_id: str
    type: MessageType
    text: Optional[str] = None
    media_url: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: datetime
    read_by: List[str] = []

    class Config:
        populate_by_name = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    sender_id: str
    type: MessageType
    text: Optional[str] = None
    media_url: Optional[str] = None
    metadata: Optional[dict] = None
    created_at: str
    read_by: List[str] = []


# --- Request/Response Models ---

class MarkReadRequest(BaseModel):
    message_ids: Optional[List[str]] = None  # If None, mark all as read
