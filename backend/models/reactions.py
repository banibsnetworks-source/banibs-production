from typing import Literal
from pydantic import BaseModel, Field
from datetime import datetime
from bson import ObjectId

# Phase 4.1 - Reactions Model
class ReactionDB(BaseModel):
    """Reaction stored in MongoDB (like/unlike)"""
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    opportunity_id: str
    ip_hash: str  # SHA-256 hash of IP, not raw IP
    reaction_type: Literal["like"] = "like"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class ReactionCount(BaseModel):
    """Public view of reaction counts"""
    opportunity_id: str
    like_count: int

# Phase 4.1 - Comments Model
class CommentDB(BaseModel):
    """Comment stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    opportunity_id: str
    display_name: str  # Required from user, fallback "Anonymous"
    body: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    status: Literal["visible", "hidden"] = "visible"
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}

class CommentCreate(BaseModel):
    """Request body for creating a comment"""
    display_name: str = "Anonymous"
    body: str

class CommentPublic(BaseModel):
    """Public view of a comment"""
    id: str
    opportunity_id: str
    display_name: str
    body: str
    timestamp: datetime
