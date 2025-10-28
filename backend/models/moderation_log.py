from typing import Literal
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId

class ModerationLogDB(BaseModel):
    """Moderation log entry stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    opportunity_id: str
    moderator_user_id: str
    action_type: Literal["approve", "reject", "feature"]
    note: str | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ModerationLogPublic(BaseModel):
    """Public view of moderation log"""
    id: str
    opportunity_id: str
    moderator_user_id: str
    moderator_email: str | None = None  # enriched from users collection
    action_type: str
    note: str | None
    timestamp: datetime
