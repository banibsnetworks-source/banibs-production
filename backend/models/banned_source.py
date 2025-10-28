from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

# Phase 5.3 - Banned Sources Model
class BannedSourceDB(BaseModel):
    """Banned source stored in MongoDB"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    ip_hash: str  # SHA-256 hash of IP address
    reason: str  # Reason for ban (e.g., "Spam", "Abusive comments")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True

class BanSourceRequest(BaseModel):
    """Request to ban a source"""
    ip_hash: str
    reason: str

class BannedSourcePublic(BaseModel):
    """Public banned source record"""
    id: str
    ip_hash_display: str  # Truncated hash for display (first 6 chars)
    reason: str
    created_at: datetime
