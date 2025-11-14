# backend/models/messaging_conversation.py
from datetime import datetime
from typing import List, Optional, Literal, Any, Dict

from beanie import Document
from pydantic import Field
from bson import ObjectId


ConversationType = Literal["dm", "group", "business"]


class Conversation(Document):
    type: ConversationType = Field(default="dm")
    participant_ids: List[str] = Field(default_factory=list)
    title: Optional[str] = None
    business_id: Optional[str] = None

    last_message_preview: Optional[str] = None
    last_message_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Settings:
        name = "conversations"  # Mongo collection name

    class Config:
        json_encoders = {ObjectId: str}
    
    def dict(self, **kwargs) -> Dict[str, Any]:
        """Override dict() to replace _id with id for frontend compatibility"""
        data = super().dict(**kwargs)
        
        # Replace _id with id
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        
        # Generate title for DMs if not set
        if self.type == "dm" and not data.get("title"):
            data["title"] = "Direct Message"
        
        return data
