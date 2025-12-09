"""
Unit Tests for Peoples Room Phase 1 - Core Backend
Tests room permissions, management, sessions, and knocks

MEGADROP V1 - Peoples Room System
"""

import pytest
import asyncio
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Import services
from services.room_permissions import RoomPermissionService
from services.room_management import (
    get_or_create_room,
    update_room_settings,
    add_to_access_list,
    remove_from_access_list
)
from services.session_management import (
    get_active_session,
    enter_room,
    exit_room,
    add_visitor,
    remove_visitor,
    is_visitor_in_room
)
from services.knock_management import (
    create_knock,
    get_knocks_for_owner,
    respond_to_knock,
    expire_old_knocks
)
from models.peoples_room import (
    DoorState,
    AccessMode,
    KnockStatus
)


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture(scope="module")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="module")
async def db():
    """Create test database connection"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    database = client['banibs_test']
    yield database
    # Cleanup
    await database.peoples_rooms.delete_many({})
    await database.room_sessions.delete_many({})
    await database.room_knocks.delete_many({})
    await database.relationships.delete_many({})
    client.close()


@pytest.fixture
async def test_users(db):
    """Create test users with relationships"""
    users = {
        "owner": "owner_test_123",
        "peoples_user": "peoples_test_456",
        "cool_user": "cool_test_789",
        "blocked_user": "blocked_test_999"
    }
    
    # Create relationships
    relationships = [
        {
            "user_id": users["owner"],
            "target_user_id": users["peoples_user"],
            "tier": "PEOPLES",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "user_id": users["owner"],
            "target_user_id": users["cool_user"],
            "tier": "COOL",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "user_id": users["owner"],
            "target_user_id": users["blocked_user"],
            "tier": "BLOCKED",
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.relationships.insert_many(relationships)
    
    yield users
    
    # Cleanup
    await db.relationships.delete_many({"user_id": users["owner"]})


# ============================================================================
# ROOM MANAGEMENT TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_create_room_with_defaults(db, test_users):
    """Test room creation with default settings"""
    owner_id = test_users["owner"]
    
    room = await get_or_create_room(owner_id, db)
    
    assert room is not None
    assert room["owner_id"] == owner_id
    assert room["door_state"] == DoorState.OPEN
    assert "PEOPLES" in room["room_visible_to_tiers"]
    assert "COOL" in room["room_visible_to_tiers"]
    assert room["access_list"] == []


@pytest.mark.asyncio
async def test_update_room_settings(db, test_users):
    """Test updating room configuration"""
    owner_id = test_users["owner"]
    
    # Update door state
    updated = await update_room_settings(
        owner_id,
        {"door_state": DoorState.LOCKED},
        db
    )
    
    assert updated["door_state"] == DoorState.LOCKED


@pytest.mark.asyncio
async def test_access_list_management(db, test_users):
    """Test adding and removing users from Access List"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_user"]
    
    # Add to access list
    room = await add_to_access_list(
        owner_id=owner_id,
        user_id=visitor_id,
        access_mode=AccessMode.DIRECT_ENTRY,
        notes="Test entry",
        db=db
    )
    
    assert len(room["access_list"]) == 1
    assert room["access_list"][0]["user_id"] == visitor_id
    assert room["access_list"][0]["access_mode"] == AccessMode.DIRECT_ENTRY
    
    # Remove from access list
    room = await remove_from_access_list(owner_id, visitor_id, db)
    assert len(room["access_list"]) == 0


# ============================================================================
# PERMISSION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_permission_hierarchy_access_list(db, test_users):
    """Test Access List > Tier permission hierarchy"""
    owner_id = test_users["owner"]
    visitor_id = test_users["blocked_user"]  # Normally blocked
    
    # BLOCKED user cannot see room by default
    can_see = await RoomPermissionService.can_see_room(owner_id, visitor_id, db)
    assert can_see is False
    
    # Add BLOCKED user to Access List with DIRECT_ENTRY
    await add_to_access_list(
        owner_id=owner_id,
        user_id=visitor_id,
        access_mode=AccessMode.DIRECT_ENTRY,
        db=db
    )
    
    # Now BLOCKED user CAN see room (Access List wins)
    can_see = await RoomPermissionService.can_see_room(owner_id, visitor_id, db)
    assert can_see is True


@pytest.mark.asyncio
async def test_never_allow_blocks_everything(db, test_users):
    """Test NEVER_ALLOW in Access List blocks all access"""
    owner_id = test_users["owner"]
    visitor_id = test_users["peoples_user"]  # Normally has full access
    
    # Add PEOPLES user to Access List with NEVER_ALLOW
    await add_to_access_list(
        owner_id=owner_id,
        user_id=visitor_id,
        access_mode=AccessMode.NEVER_ALLOW,
        db=db
    )
    
    # Cannot see room
    can_see = await RoomPermissionService.can_see_room(owner_id, visitor_id, db)
    assert can_see is False
    
    # Cannot knock
    knock_result = await RoomPermissionService.can_knock(owner_id, visitor_id, db)
    assert knock_result["can_knock"] is False
    
    # Cannot enter
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is False


@pytest.mark.asyncio
async def test_direct_entry_bypasses_knock(db, test_users):
    """Test DIRECT_ENTRY allows entry without knocking"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_user"]  # Normally must knock
    
    # COOL tier cannot enter directly by default
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is False
    
    # Add to Access List with DIRECT_ENTRY
    await add_to_access_list(
        owner_id=owner_id,
        user_id=visitor_id,
        access_mode=AccessMode.DIRECT_ENTRY,
        db=db
    )
    
    # Now can enter directly
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is True


@pytest.mark.asyncio
async def test_locked_door_blocks_all(db, test_users):
    """Test LOCKED door state blocks all knocks and entries"""
    owner_id = test_users["owner"]
    visitor_id = test_users["peoples_user"]  # Has DIRECT_ENTRY normally
    
    # Lock the doors
    await update_room_settings(
        owner_id,
        {"door_state": DoorState.LOCKED},
        db
    )
    
    # Cannot knock
    knock_result = await RoomPermissionService.can_knock(owner_id, visitor_id, db)
    assert knock_result["can_knock"] is False
    assert "LOCKED" in knock_result["reason"]
    
    # Cannot enter
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is False


@pytest.mark.asyncio
async def test_blocked_user_restrictions(db, test_users):
    """Test BLOCKED users cannot access room"""
    owner_id = test_users["owner"]
    visitor_id = test_users["blocked_user"]
    
    # Cannot see room
    can_see = await RoomPermissionService.can_see_room(owner_id, visitor_id, db)
    assert can_see is False
    
    # Cannot knock
    knock_result = await RoomPermissionService.can_knock(owner_id, visitor_id, db)
    assert knock_result["can_knock"] is False
    
    # Cannot enter
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is False


# ============================================================================
# SESSION MANAGEMENT TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_owner_enter_exit_room(db, test_users):
    """Test owner entering and exiting their room"""
    owner_id = test_users["owner"]
    
    # No active session initially
    session = await get_active_session(owner_id, db)
    assert session is None
    
    # Owner enters room
    session = await enter_room(owner_id, db)
    assert session is not None
    assert session["is_active"] is True
    assert session["room_owner_id"] == owner_id
    
    # Exit room
    result = await exit_room(owner_id, db)
    assert result["session_ended"] is True
    
    # No active session after exit
    session = await get_active_session(owner_id, db)
    assert session is None


@pytest.mark.asyncio
async def test_visitor_management(db, test_users):
    """Test adding and removing visitors from session"""
    owner_id = test_users["owner"]
    visitor_id = test_users["peoples_user"]
    
    # Owner enters room
    await enter_room(owner_id, db)
    
    # Add visitor
    session = await add_visitor(owner_id, visitor_id, db)
    assert len(session["current_visitors"]) == 1
    assert session["current_visitors"][0]["user_id"] == visitor_id
    
    # Check if visitor is in room
    is_in = await is_visitor_in_room(owner_id, visitor_id, db)
    assert is_in is True
    
    # Remove visitor
    session = await remove_visitor(owner_id, visitor_id, db)
    assert len(session["current_visitors"]) == 0


@pytest.mark.asyncio
async def test_exit_kicks_all_visitors(db, test_users):
    """Test owner exiting kicks all visitors (Founder Decision)"""
    owner_id = test_users["owner"]
    visitor1 = test_users["peoples_user"]
    visitor2 = test_users["cool_user"]
    
    # Owner enters and visitors join
    await enter_room(owner_id, db)
    await add_visitor(owner_id, visitor1, db)
    await add_visitor(owner_id, visitor2, db)
    
    # Confirm visitors are in
    session = await get_active_session(owner_id, db)
    assert len(session["current_visitors"]) == 2
    
    # Owner exits
    await exit_room(owner_id, db)
    
    # Session is ended and visitors are kicked
    session = await get_active_session(owner_id, db)
    assert session is None


# ============================================================================
# KNOCK MANAGEMENT TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_create_knock(db, test_users):
    """Test creating a knock request"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_user"]
    
    knock = await create_knock(
        room_owner_id=owner_id,
        visitor_id=visitor_id,
        knock_message="Hey, you around?",
        db=db
    )
    
    assert knock is not None
    assert knock["room_owner_id"] == owner_id
    assert knock["visitor_id"] == visitor_id
    assert knock["status"] == KnockStatus.PENDING
    assert knock["knock_message"] == "Hey, you around?"


@pytest.mark.asyncio
async def test_knock_rate_limit(db, test_users):
    """Test knock rate limiting (max 3 per hour)"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_user"]
    
    # Create 3 knocks (should succeed)
    for i in range(3):
        try:
            await create_knock(owner_id, visitor_id, f"Knock {i+1}", db)
        except ValueError:
            pytest.fail(f"Should allow knock {i+1}")
    
    # 4th knock should fail
    with pytest.raises(ValueError, match="Rate limit exceeded"):
        await create_knock(owner_id, visitor_id, "Knock 4", db)


@pytest.mark.asyncio
async def test_approve_knock(db, test_users):
    """Test owner approving a knock"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_user"]
    
    # Create knock
    await create_knock(owner_id, visitor_id, "Let me in!", db)
    
    # Approve knock
    knock = await respond_to_knock(
        room_owner_id=owner_id,
        visitor_id=visitor_id,
        action="APPROVE",
        response_note="Welcome!",
        db=db
    )
    
    assert knock["status"] == KnockStatus.APPROVED
    assert knock["response_note"] == "Welcome!"
    assert knock["responded_at"] is not None


@pytest.mark.asyncio
async def test_deny_knock(db, test_users):
    """Test owner denying a knock"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_user"]
    
    # Create knock
    await create_knock(owner_id, visitor_id, "Knock knock", db)
    
    # Deny knock
    knock = await respond_to_knock(
        room_owner_id=owner_id,
        visitor_id=visitor_id,
        action="DENY",
        response_note="Not now",
        db=db
    )
    
    assert knock["status"] == KnockStatus.DENIED
    assert knock["response_note"] == "Not now"


@pytest.mark.asyncio
async def test_knock_expiry(db, test_users):
    """Test automatic knock expiry after TTL"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_user"]
    
    # Create knock with past expiry
    past_time = datetime.now(timezone.utc) - timedelta(minutes=31)
    knock = {
        "room_owner_id": owner_id,
        "visitor_id": visitor_id,
        "visitor_tier": "COOL",
        "status": KnockStatus.PENDING,
        "knock_message": "Old knock",
        "created_at": past_time,
        "updated_at": past_time,
        "expires_at": past_time,
        "responded_at": None,
        "response_note": None
    }
    await db.room_knocks.insert_one(knock)
    
    # Run expiry job
    expired_count = await expire_old_knocks(db)
    assert expired_count >= 1
    
    # Check knock is expired
    expired_knock = await db.room_knocks.find_one(
        {
            "room_owner_id": owner_id,
            "visitor_id": visitor_id
        },
        {"_id": 0}
    )
    assert expired_knock["status"] == KnockStatus.EXPIRED


@pytest.mark.asyncio
async def test_get_knocks_for_owner(db, test_users):
    """Test fetching owner's knocks with filtering"""
    owner_id = test_users["owner"]
    visitor1 = test_users["peoples_user"]
    visitor2 = test_users["cool_user"]
    
    # Create multiple knocks
    await create_knock(owner_id, visitor1, "Knock 1", db)
    await create_knock(owner_id, visitor2, "Knock 2", db)
    
    # Get all knocks
    knocks = await get_knocks_for_owner(owner_id, db=db)
    assert len(knocks) >= 2
    
    # Get only PENDING knocks
    pending_knocks = await get_knocks_for_owner(
        owner_id,
        status=KnockStatus.PENDING,
        db=db
    )
    assert all(k["status"] == KnockStatus.PENDING for k in pending_knocks)


# ============================================================================
# INTEGRATION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_full_room_workflow(db, test_users):
    """Test complete room workflow: create → enter → knock → approve → visitor enters"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_user"]
    
    # 1. Create room
    room = await get_or_create_room(owner_id, db)
    assert room is not None
    
    # 2. Owner enters room
    session = await enter_room(owner_id, db)
    assert session["is_active"] is True
    
    # 3. Visitor knocks
    knock = await create_knock(owner_id, visitor_id, "Can I come in?", db)
    assert knock["status"] == KnockStatus.PENDING
    
    # 4. Owner approves knock
    approved_knock = await respond_to_knock(
        owner_id,
        visitor_id,
        "APPROVE",
        "Come in!",
        db
    )
    assert approved_knock["status"] == KnockStatus.APPROVED
    
    # 5. Visitor enters room
    session = await add_visitor(owner_id, visitor_id, db)
    assert len(session["current_visitors"]) == 1
    
    # 6. Visitor leaves
    session = await remove_visitor(owner_id, visitor_id, db)
    assert len(session["current_visitors"]) == 0
    
    # 7. Owner exits
    result = await exit_room(owner_id, db)
    assert result["session_ended"] is True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
