"""
Peoples Room API Routes - BANIBS Peoples Room System
Owner-facing and visitor-facing endpoints for room management

Integrated with BGLIS/BDII identity and Circle Trust Order
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from datetime import datetime, timezone
import logging

from db.connection import get_db
from services.room_management import (
    get_or_create_room,
    update_room_settings,
    add_to_access_list,
    remove_from_access_list,
    lock_room_doors,
    unlock_room_doors
)
from services.session_management import (
    get_active_session,
    enter_room,
    exit_room,
    add_visitor,
    remove_visitor,
    is_visitor_in_room,
    get_visitor_count
)
from services.knock_management import (
    create_knock,
    get_knocks_for_owner,
    respond_to_knock,
    expire_old_knocks
)
from services.room_permissions import (
    RoomPermissionService,
    resolve_effective_room_permissions
)
from services.room_events import (
    log_session_started,
    log_session_ended,
    log_knock_created,
    log_knock_approved,
    log_knock_denied,
    log_visitor_entered,
    log_visitor_left,
    log_door_locked,
    log_door_unlocked
)
from models.peoples_room import (
    RoomSettingsUpdate,
    AccessListAddRequest,
    KnockRequest,
    KnockResponse,
    DoorState,
    AccessMode
)
from middleware.auth_guard import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/rooms", tags=["Peoples Room"])


# ============================================================================
# OWNER-FACING ENDPOINTS
# ============================================================================

@router.get("/me")
async def get_my_room(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get owner's room configuration and current session status.
    
    Returns:
        - room: Room configuration
        - session: Active session (if owner is in room)
    """
    user_id = current_user["id"]
    
    # Get or create room
    room = await get_or_create_room(user_id, db)
    
    # Get active session (if any)
    session = await get_active_session(user_id, db)
    
    return {
        "room": room,
        "session": session
    }


@router.post("/me/enter")
async def enter_my_room(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Owner enters their own room (starts/reactivates session).
    
    Returns:
        - session: Active session
        - message: Confirmation message
    """
    user_id = current_user["id"]
    
    # Ensure room exists
    await get_or_create_room(user_id, db)
    
    # Enter room (create/reactivate session)
    session = await enter_room(user_id, db)
    
    # Log event for future social integrations
    await log_session_started(user_id, db)
    # TODO: Emit WebSocket event: ROOM_SESSION_STARTED
    
    return {
        "session": session,
        "message": "You have entered your room"
    }


@router.post("/me/exit")
async def exit_my_room(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Owner exits their room (ends session, kicks all visitors).
    
    Founder Decision: EXIT = kick everyone and end session.
    
    Returns:
        - message: Confirmation message
        - session_ended_at: Timestamp
    """
    user_id = current_user["id"]
    
    result = await exit_room(user_id, db)
    
    # Log event for future social integrations
    await log_session_ended(user_id, db=db)
    # TODO: Emit WebSocket event: ROOM_SESSION_ENDED
    # TODO: Notify all kicked visitors
    
    return {
        "message": "You have exited your room",
        "session_ended_at": result["ended_at"],
        "visitors_kicked": result["visitors_kicked"]
    }


@router.patch("/me/settings")
async def update_my_room_settings(
    settings: RoomSettingsUpdate,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Update room configuration.
    
    Body (all fields optional):
        - door_state: OPEN | LOCKED | DND
        - presence_mode: PUBLIC_ROOM_PRESENCE | GHOST_ROOM_PRESENCE
        - room_visible_to_tiers: List of tier names
        - room_visible_to_circles: List of circle IDs
        - room_visible_to_users: List of user IDs
        - show_visitor_list_mode: FULL | OWNER_ONLY | NONE
        - tier_rules: Dict of tier -> permissions
    
    Returns:
        - room: Updated room configuration
        - message: Confirmation message
    """
    user_id = current_user["id"]
    
    # Convert Pydantic model to dict, excluding None values
    updates = settings.model_dump(exclude_none=True)
    
    if not updates:
        raise HTTPException(status_code=400, detail="No settings to update")
    
    # Update room
    updated_room = await update_room_settings(user_id, updates, db)
    
    # TODO: Emit WebSocket event: ROOM_SETTINGS_UPDATED
    
    # If door state changed to LOCKED, handle pending knocks
    if "door_state" in updates and updates["door_state"] == DoorState.LOCKED:
        # TODO: Emit WebSocket event: ROOM_DOOR_LOCKED
        logger.info(f"Room {user_id} door locked - new knocks blocked")
    
    return {
        "room": updated_room,
        "message": "Room settings updated"
    }


@router.get("/me/knocks")
async def get_my_knocks(
    status: Optional[str] = Query(None, description="Filter by status (PENDING, APPROVED, DENIED, EXPIRED)"),
    limit: int = Query(50, ge=1, le=100),
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get list of knocks on owner's room.
    
    Query Params:
        - status: Filter by status (optional)
        - limit: Max number of knocks (default: 50)
    
    Returns:
        - knocks: List of knock records with visitor info
        - count: Total count
    """
    user_id = current_user["id"]
    
    # Get knocks (auto-expires old ones)
    knocks = await get_knocks_for_owner(user_id, status, limit, db)
    
    # Enrich with visitor info
    for knock in knocks:
        visitor_id = knock["visitor_id"]
        
        # Get visitor info from banibs_users
        visitor = await db.banibs_users.find_one(
            {"id": visitor_id},
            {"_id": 0, "id": 1, "name": 1, "email": 1, "avatar_url": 1, "handle": 1}
        )
        
        if visitor:
            knock["visitor_info"] = visitor
        else:
            knock["visitor_info"] = {
                "id": visitor_id,
                "name": "Unknown User"
            }
    
    return {
        "knocks": knocks,
        "count": len(knocks)
    }


@router.post("/me/knocks/{visitor_id}/respond")
async def respond_to_knock_request(
    visitor_id: str,
    response: KnockResponse,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Owner responds to a knock (approve or deny).
    
    Path Params:
        - visitor_id: ID of visitor who knocked
    
    Body:
        - action: APPROVE | DENY
        - remember_access: If true, add visitor to Access List (for APPROVE)
        - response_note: Optional note from owner
    
    Returns:
        - knock: Updated knock record
        - message: Confirmation message
        - visitor_can_enter: True if approved
    """
    user_id = current_user["id"]
    
    if response.action not in ["APPROVE", "DENY"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid action. Must be APPROVE or DENY"
        )
    
    try:
        # Respond to knock
        knock = await respond_to_knock(
            room_owner_id=user_id,
            visitor_id=visitor_id,
            action=response.action,
            response_note=response.response_note,
            db=db
        )
        
        # If approved and remember_access is True, add to Access List
        if response.action == "APPROVE" and response.remember_access:
            await add_to_access_list(
                owner_id=user_id,
                user_id=visitor_id,
                access_mode=AccessMode.DIRECT_ENTRY,
                notes="Auto-added after knock approval",
                db=db
            )
            logger.info(f"Added {visitor_id} to {user_id}'s Access List (DIRECT_ENTRY)")
        
        # TODO: Emit WebSocket event to visitor
        if response.action == "APPROVE":
            # TODO: Emit ROOM_KNOCK_APPROVED
            message = "Knock approved"
        else:
            # TODO: Emit ROOM_KNOCK_DENIED
            message = "Knock denied"
        
        return {
            "knock": knock,
            "message": message,
            "visitor_can_enter": response.action == "APPROVE"
        }
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/me/access-list")
async def add_user_to_access_list(
    request: AccessListAddRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Add user to room's Access List.
    
    Body:
        - user_id: User to add
        - access_mode: DIRECT_ENTRY | MUST_KNOCK | NEVER_ALLOW
        - temporary: If True, entry expires (optional)
        - expires_at: Expiration datetime (if temporary)
        - notes: Optional notes
    
    Returns:
        - access_list: Updated access list
        - message: Confirmation message
    """
    user_id = current_user["id"]
    
    # Validate user exists
    target_user = await db.banibs_users.find_one(
        {"id": request.user_id},
        {"_id": 0, "id": 1}
    )
    
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Add to access list
    updated_room = await add_to_access_list(
        owner_id=user_id,
        user_id=request.user_id,
        access_mode=request.access_mode,
        temporary=request.temporary,
        expires_at=request.expires_at,
        notes=request.notes,
        db=db
    )
    
    return {
        "access_list": updated_room.get("access_list", []),
        "message": "User added to Access List"
    }


@router.delete("/me/access-list/{target_user_id}")
async def remove_user_from_access_list(
    target_user_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Remove user from room's Access List.
    
    Path Params:
        - target_user_id: User to remove
    
    Returns:
        - message: Confirmation message
    """
    user_id = current_user["id"]
    
    await remove_from_access_list(user_id, target_user_id, db)
    
    return {
        "message": "User removed from Access List"
    }


@router.post("/me/lock")
async def lock_my_room(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Lock room doors (blocks new knocks and entries).
    
    Founder Decision: Existing visitors may remain.
    
    Returns:
        - room: Updated room configuration
        - message: Confirmation message
    """
    user_id = current_user["id"]
    
    updated_room = await lock_room_doors(user_id, db)
    
    # TODO: Emit WebSocket event: ROOM_DOOR_LOCKED
    
    return {
        "room": updated_room,
        "message": "Room doors locked"
    }


@router.post("/me/unlock")
async def unlock_my_room(
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Unlock room doors (resumes normal knock/entry behavior).
    
    Returns:
        - room: Updated room configuration
        - message: Confirmation message
    """
    user_id = current_user["id"]
    
    updated_room = await unlock_room_doors(user_id, db)
    
    return {
        "room": updated_room,
        "message": "Room doors unlocked"
    }


# ============================================================================
# VISITOR-FACING ENDPOINTS (Phase 2)
# ============================================================================

@router.get("/{owner_id}/status")
async def get_room_status(
    owner_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Get room status and visitor's permissions (Phase 2).
    
    Returns:
        - owner: Owner info
        - room: Room visibility & state
        - permissions: Visitor's effective permissions
        - my_status: Visitor's current state in this room
    """
    visitor_id = current_user["id"]
    
    # Get owner info
    owner = await db.banibs_users.find_one(
        {"id": owner_id},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "avatar_url": 1, "handle": 1}
    )
    
    if not owner:
        raise HTTPException(status_code=404, detail="Room owner not found")
    
    # Check if visitor can see room
    can_see = await RoomPermissionService.can_see_room(owner_id, visitor_id, db)
    
    if not can_see:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to view this room"
        )
    
    # Get room config
    room = await get_or_create_room(owner_id, db)
    
    # Get active session
    session = await get_active_session(owner_id, db)
    owner_in_room = session is not None and session.get("is_active", False)
    
    # Get visitor permissions
    permissions = await resolve_effective_room_permissions(owner_id, visitor_id, db)
    
    # Check visitor's current status
    am_inside = await is_visitor_in_room(owner_id, visitor_id, db) if owner_in_room else False
    
    # Check for pending knock
    pending_knock = await db.room_knocks.find_one(
        {
            "room_owner_id": owner_id,
            "visitor_id": visitor_id,
            "status": "PENDING"
        },
        {"_id": 0}
    )
    
    # Get visitor count (if allowed)
    visitor_count = None
    visitors_list = None
    
    if owner_in_room and session:
        show_mode = room.get("show_visitor_list_mode", "FULL")
        
        if show_mode == "FULL" and can_see:
            visitor_count = len(session.get("current_visitors", []))
            # Enrich visitor list
            visitors_list = []
            for v in session.get("current_visitors", []):
                visitor_info = await db.banibs_users.find_one(
                    {"id": v["user_id"]},
                    {"_id": 0, "id": 1, "name": 1, "avatar_url": 1, "handle": 1}
                )
                if visitor_info:
                    visitors_list.append({
                        **visitor_info,
                        "joined_at": v.get("joined_at"),
                        "tier": v.get("tier")
                    })
        elif show_mode == "OWNER_ONLY" and visitor_id == owner_id:
            visitor_count = len(session.get("current_visitors", []))
    
    return {
        "owner": owner,
        "room": {
            "is_visible": can_see,
            "door_state": room.get("door_state"),
            "owner_in_room": owner_in_room,
            "visitor_count": visitor_count,
            "visitors": visitors_list
        },
        "permissions": permissions.model_dump(),
        "my_status": {
            "am_inside": am_inside,
            "have_pending_knock": pending_knock is not None,
            "last_knock": pending_knock
        }
    }


@router.post("/{owner_id}/knock")
async def knock_on_room(
    owner_id: str,
    request: KnockRequest,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Visitor knocks on owner's door (Phase 2).
    
    Body:
        - message: Optional knock message (max 500 chars)
    
    Returns:
        - knock: Created knock record
        - message: Status message
    """
    visitor_id = current_user["id"]
    
    # Cannot knock on own room
    if owner_id == visitor_id:
        raise HTTPException(
            status_code=400,
            detail="Cannot knock on your own room"
        )
    
    # Check permission to knock
    knock_check = await RoomPermissionService.can_knock(owner_id, visitor_id, db)
    
    if not knock_check["can_knock"]:
        raise HTTPException(
            status_code=403,
            detail=knock_check.get("reason", "You cannot knock on this room")
        )
    
    # Check if visitor already has direct entry
    enter_check = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    if enter_check["can_enter_direct"]:
        raise HTTPException(
            status_code=400,
            detail="You have direct entry access - no need to knock"
        )
    
    try:
        # Create knock
        knock = await create_knock(
            room_owner_id=owner_id,
            visitor_id=visitor_id,
            knock_message=request.message,
            db=db
        )
        
        # TODO: Emit WebSocket event: ROOM_KNOCK_CREATED
        logger.info(f"🚪 ROOM_KNOCK_CREATED: {visitor_id} -> {owner_id}")
        
        return {
            "knock": knock,
            "message": "Knock sent. Waiting for approval..."
        }
    
    except ValueError as e:
        # Rate limit or duplicate knock
        raise HTTPException(status_code=429, detail=str(e))


@router.post("/{owner_id}/enter")
async def enter_room_as_visitor(
    owner_id: str,
    knock_id: Optional[str] = None,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Visitor enters the room (Phase 2).
    
    Query Params:
        - knock_id: Optional knock ID if entering via approved knock
    
    Returns:
        - message: Confirmation message
        - session: Room session info
    """
    visitor_id = current_user["id"]
    
    # Cannot enter own room as visitor
    if owner_id == visitor_id:
        raise HTTPException(
            status_code=400,
            detail="Use POST /api/rooms/me/enter to enter your own room"
        )
    
    # Check if owner has active session
    session = await get_active_session(owner_id, db)
    
    if not session or not session.get("is_active"):
        raise HTTPException(
            status_code=400,
            detail="Owner is not in their room"
        )
    
    # Check if visitor can enter directly
    enter_check = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    
    if enter_check["can_enter_direct"]:
        # Direct entry allowed
        pass
    elif knock_id:
        # Check if knock is approved
        knock = await db.room_knocks.find_one(
            {
                "room_owner_id": owner_id,
                "visitor_id": visitor_id,
                "status": "APPROVED"
            },
            {"_id": 0}
        )
        
        if not knock:
            raise HTTPException(
                status_code=403,
                detail="No approved knock found. You must knock first."
            )
    else:
        raise HTTPException(
            status_code=403,
            detail="You must knock and be approved before entering"
        )
    
    # Check if visitor is BLOCKED or in SAFE MODE
    visitor_tier = await db.relationships.find_one(
        {
            "user_id": owner_id,
            "target_user_id": visitor_id
        },
        {"_id": 0, "tier": 1}
    )
    
    tier_value = visitor_tier.get("tier") if visitor_tier else "OTHERS"
    
    if tier_value in ["BLOCKED", "OTHERS_SAFE_MODE"]:
        raise HTTPException(
            status_code=403,
            detail=f"{tier_value} tier cannot enter"
        )
    
    # Add visitor to session
    updated_session = await add_visitor(owner_id, visitor_id, db)
    
    # TODO: Emit WebSocket event: ROOM_VISITOR_ENTERED
    logger.info(f"🚪 ROOM_VISITOR_ENTERED: {visitor_id} -> {owner_id}")
    
    return {
        "message": "You have entered the room",
        "session": updated_session
    }


@router.post("/{owner_id}/leave")
async def leave_room_as_visitor(
    owner_id: str,
    current_user = Depends(get_current_user),
    db = Depends(get_db)
):
    """
    Visitor leaves the room (Phase 2).
    
    Returns:
        - message: Confirmation message
    """
    visitor_id = current_user["id"]
    
    # Check if visitor is actually in the room
    is_in_room = await is_visitor_in_room(owner_id, visitor_id, db)
    
    if not is_in_room:
        raise HTTPException(
            status_code=400,
            detail="You are not in this room"
        )
    
    # Remove visitor from session
    await remove_visitor(owner_id, visitor_id, db)
    
    # TODO: Emit WebSocket event: ROOM_VISITOR_LEFT
    logger.info(f"🚪 ROOM_VISITOR_LEFT: {visitor_id} <- {owner_id}")
    
    return {
        "message": "You have left the room"
    }
