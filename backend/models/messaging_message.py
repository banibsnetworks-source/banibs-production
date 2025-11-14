# backend/models/messaging_message.py
from datetime import datetime
from typing import List, Optional, Literal, Dict, Any

from beanie import Document
from pydantic import Field
from bson import ObjectId


MessageType = Literal["text", "media", "system"]


class Message(Document):
    conversation_id: str
    sender_id: str

    type: MessageType = Field(default="text")
    text: Optional[str] = None   # BANIBS format with [emoji:...] if needed
    media_url: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    read_by: List[str] = Field(default_factory=list)
    
    # Phase 3 Add-Ons: Delete functionality
    deleted_at: Optional[datetime] = None  # Delete for everyone
    deleted_for: List[str] = Field(default_factory=list)  # Delete for specific users

    class Settings:
        name = "messages"

    class Config:
        json_encoders = {ObjectId: str}
    
    def dict(self, **kwargs) -> Dict[str, Any]:
        """Override dict() to replace _id with id for frontend compatibility"""
        data = super().dict(**kwargs)
        
        # Replace _id with id
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        
        return data
