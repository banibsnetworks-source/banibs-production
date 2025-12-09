"""
Peoples Room Models - BANIBS Peoples Room System
Personal, sovereign social space for each user

Integrated with BGLIS/BDII identity and Circle Trust Order
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class DoorState(str, Enum):
    """Door state options"""
    OPEN = "OPEN"
    LOCKED = "LOCKED"
    DND = "DND"  # Do Not Disturb


class PresenceMode(str, Enum):
    """Room presence visibility modes"""
    PUBLIC_ROOM_PRESENCE = "PUBLIC_ROOM_PRESENCE"  # Others can see you're in room
    GHOST_ROOM_PRESENCE = "GHOST_ROOM_PRESENCE"    # No one sees you're in room


class VisitorListMode(str, Enum):
    """Visitor list visibility modes"""
    FULL = "FULL"             # Authorized viewers see who's inside
    OWNER_ONLY = "OWNER_ONLY"  # Only owner sees who's inside
    NONE = "NONE"             # No one sees visitor list (backend only)


class AccessMode(str, Enum):
    """Access list entry modes"""
    DIRECT_ENTRY = "DIRECT_ENTRY"    # Can enter without knocking
    MUST_KNOCK = "MUST_KNOCK"        # Must knock but on preferred list
    NEVER_ALLOW = "NEVER_ALLOW"      # Explicitly blocked


class KnockStatus(str, Enum):
    """Knock request status"""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    DENIED = "DENIED"
    EXPIRED = "EXPIRED"


class TierRules(BaseModel):
    """Permission rules for a trust tier"""
    can_see_room: bool = False
    can_knock: bool = False
    can_enter_direct: bool = False


class AccessListEntry(BaseModel):
    """Per-person access override entry"""
    user_id: str
    access_mode: AccessMode
    temporary: bool = False
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None
    added_at: datetime = Field(default_factory=lambda: datetime.now())


class PeoplesRoom(BaseModel):
    """
    Peoples Room configuration for a user.
    
    Stores all room settings, access rules, and visibility preferences.
    """
    owner_id: str
    
    # Door state and presence
    door_state: DoorState = DoorState.OPEN
    presence_mode: PresenceMode = PresenceMode.PUBLIC_ROOM_PRESENCE
    
    # Visibility settings
    room_visible_to_tiers: List[str] = ["PEOPLES", "COOL", "CHILL"]
    room_visible_to_circles: List[str] = []
    room_visible_to_users: List[str] = []
    
    # Visitor list visibility
    show_visitor_list_mode: VisitorListMode = VisitorListMode.FULL
    
    # Tier-based default rules
    tier_rules: Dict[str, TierRules] = {
        "PEOPLES": TierRules(can_see_room=True, can_knock=True, can_enter_direct=True),
        "COOL": TierRules(can_see_room=True, can_knock=True, can_enter_direct=False),
        "CHILL": TierRules(can_see_room=True, can_knock=True, can_enter_direct=False),
        "ALRIGHT": TierRules(can_see_room=False, can_knock=False, can_enter_direct=False),
        "OTHERS": TierRules(can_see_room=False, can_knock=False, can_enter_direct=False),
        "OTHERS_SAFE_MODE": TierRules(can_see_room=False, can_knock=False, can_enter_direct=False),
        "BLOCKED": TierRules(can_see_room=False, can_knock=False, can_enter_direct=False),
    }
    
    # Per-person overrides (highest priority)
    access_list: List[AccessListEntry] = []
    
    # Circle-based access
    allowed_circles_can_enter: List[str] = []
    allowed_circles_can_knock: List[str] = []
    
    # Timestamps
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: datetime = Field(default_factory=lambda: datetime.now())
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class RoomVisitor(BaseModel):
    """Visitor currently in a room"""
    user_id: str
    joined_at: datetime
    tier: str  # Snapshot of tier at join time


class RoomSession(BaseModel):
    """
    Active room session - tracks owner presence and current visitors.
    
    Only one active session per owner at a time.
    """
    room_owner_id: str
    is_active: bool = True
    started_at: datetime = Field(default_factory=lambda: datetime.now())
    ended_at: Optional[datetime] = None
    current_visitors: List[RoomVisitor] = []
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class RoomKnock(BaseModel):
    """
    Knock request on a room door.
    
    Tracks pending, approved, denied, and expired knock requests.
    """
    room_owner_id: str
    visitor_id: str
    visitor_tier: str  # Snapshot at knock time
    status: KnockStatus = KnockStatus.PENDING
    knock_message: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now())
    updated_at: datetime = Field(default_factory=lambda: datetime.now())
    expires_at: datetime  # Auto-expire after TTL (30 min default)
    responded_at: Optional[datetime] = None
    response_note: Optional[str] = None
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }


class RoomPermissionResult(BaseModel):
    """Result of permission check"""
    can_see_room: bool
    can_knock: bool
    can_enter_direct: bool
    must_knock: bool  # True if can enter but must knock first
    is_blocked: bool
    reason: str
    override_applied: Optional[str] = None  # "ACCESS_LIST", "CIRCLE", "TIER", None


class RoomSettingsUpdate(BaseModel):
    """Request body for updating room settings"""
    door_state: Optional[DoorState] = None
    presence_mode: Optional[PresenceMode] = None
    room_visible_to_tiers: Optional[List[str]] = None
    room_visible_to_circles: Optional[List[str]] = None
    room_visible_to_users: Optional[List[str]] = None
    show_visitor_list_mode: Optional[VisitorListMode] = None
    tier_rules: Optional[Dict[str, TierRules]] = None


class AccessListAddRequest(BaseModel):
    """Request to add user to access list"""
    user_id: str
    access_mode: AccessMode
    temporary: bool = False
    expires_at: Optional[datetime] = None
    notes: Optional[str] = None


class KnockRequest(BaseModel):
    """Request to knock on a door"""
    message: Optional[str] = Field(None, max_length=500)


class KnockResponse(BaseModel):
    """Response to a knock"""
    action: str  # "APPROVE" or "DENY"
    remember_access: bool = False
    response_note: Optional[str] = Field(None, max_length=500)
