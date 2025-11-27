"""
BANIBS Messaging Engine - Phase 8.4
Message Schemas

Pydantic models for 1-to-1 direct messaging with trust tier context.
"""

from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime


# Trust Tiers (from Relationship Engine)
TrustTier = Literal["Peoples", "Cool", "Alright", "Others"]


class MessageCreate(BaseModel):
    """Request to send a message"""
    receiverId: str = Field(..., description="User ID of the recipient")
    messageText: str = Field(..., min_length=1, max_length=5000, description="Message content")


class MessageInDB(BaseModel):
    """Message stored in database"""
    id: str = Field(alias="_id")
    senderId: str
    receiverId: str
    messageText: str
    conversationKey: str = Field(..., description="Sorted pair: user1:user2")
    trustTierContext: TrustTier
    encryptionFlag: bool = False
    timestamp: datetime
    createdAt: datetime
    readStatus: Literal["unread", "read"] = "unread"
    
    class Config:
        populate_by_name = True


class MessagePublic(BaseModel):
    """Public message response"""
    id: str
    senderId: str
    receiverId: str
    messageText: str
    trustTierContext: TrustTier
    encryptionFlag: bool
    timestamp: datetime
    readStatus: Literal["unread", "read"]


class ConversationPreview(BaseModel):
    """Preview of a conversation for inbox list"""
    conversationKey: str
    otherUserId: str
    otherUserName: Optional[str] = None
    otherUserAvatar: Optional[str] = None
    lastMessageText: str
    lastSenderId: str
    lastTimestamp: datetime
    unreadCount: int
    trustTierContext: TrustTier


class MarkReadRequest(BaseModel):
    """Request to mark messages as read"""
    otherUserId: str


class ConversationThread(BaseModel):
    """Full conversation thread response"""
    conversationKey: str
    otherUser: dict
    messages: list[MessagePublic]
    trustTier: TrustTier
    totalMessages: int
