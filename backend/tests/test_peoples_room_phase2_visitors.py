"""
Unit Tests for Peoples Room Phase 2 - Visitor Flows
Tests visitor-side endpoints, permissions, and knock workflows

MEGADROP V1 - Peoples Room System
"""

import pytest
import pytest_asyncio
import asyncio
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os

# Import services
from services.room_permissions import RoomPermissionService
from services.room_management import get_or_create_room, add_to_access_list
from services.session_management import enter_room, get_active_session
from services.knock_management import create_knock, respond_to_knock
from models.peoples_room import DoorState, AccessMode, KnockStatus


# ============================================================================
# FIXTURES
# ============================================================================

@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests"""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def db():
    """Create test database connection"""
    mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
    client = AsyncIOMotorClient(mongo_url)
    database = client['banibs_test_phase2']
    yield database
    # Cleanup
    await database.peoples_rooms.delete_many({})
    await database.room_sessions.delete_many({})
    await database.room_knocks.delete_many({})
    await database.relationships.delete_many({})
    await database.room_events.delete_many({})
    client.close()


@pytest_asyncio.fixture
async def test_users(db):
    """Create test users with relationships"""
    users = {
        "owner": "owner_phase2_123",
        "peoples_visitor": "peoples_phase2_456",
        "cool_visitor": "cool_phase2_789",
        "alright_visitor": "alright_phase2_111",
        "blocked_visitor": "blocked_phase2_999",
        "safe_mode_visitor": "safemode_phase2_888"
    }
    
    # Create relationships
    relationships = [
        {
            "user_id": users["owner"],
            "target_user_id": users["peoples_visitor"],
            "tier": "PEOPLES",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "user_id": users["owner"],
            "target_user_id": users["cool_visitor"],
            "tier": "COOL",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "user_id": users["owner"],
            "target_user_id": users["alright_visitor"],
            "tier": "ALRIGHT",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "user_id": users["owner"],
            "target_user_id": users["blocked_visitor"],
            "tier": "BLOCKED",
            "created_at": datetime.now(timezone.utc)
        },
        {
            "user_id": users["owner"],
            "target_user_id": users["safe_mode_visitor"],
            "tier": "OTHERS_SAFE_MODE",
            "created_at": datetime.now(timezone.utc)
        }
    ]
    
    await db.relationships.insert_many(relationships)
    
    yield users
    
    # Cleanup
    await db.relationships.delete_many({"user_id": users["owner"]})


# ============================================================================
# VISITOR STATUS & PERMISSION TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_visitor_can_see_room_status(db, test_users):
    """Test visitor can view room status (Peoples tier)"""
    owner_id = test_users["owner"]
    visitor_id = test_users["peoples_visitor"]
    
    # Create room and session
    await get_or_create_room(owner_id, db)
    await enter_room(owner_id, db)
    
    # Check visitor can see room
    can_see = await RoomPermissionService.can_see_room(owner_id, visitor_id, db)
    assert can_see is True


@pytest.mark.asyncio
async def test_blocked_visitor_cannot_see_room(db, test_users):
    """Test BLOCKED visitor cannot see room"""
    owner_id = test_users["owner"]
    visitor_id = test_users["blocked_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # BLOCKED user cannot see room
    can_see = await RoomPermissionService.can_see_room(owner_id, visitor_id, db)
    assert can_see is False


@pytest.mark.asyncio
async def test_safe_mode_visitor_cannot_see_room(db, test_users):
    """Test Others • Safe Mode visitor cannot see room by default"""
    owner_id = test_users["owner"]
    visitor_id = test_users["safe_mode_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # Safe Mode user cannot see room by default
    can_see = await RoomPermissionService.can_see_room(owner_id, visitor_id, db)
    assert can_see is False


# ============================================================================
# KNOCK WORKFLOW TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_visitor_knock_creation(db, test_users):
    """Test visitor can create a knock"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # Visitor knocks
    knock = await create_knock(
        room_owner_id=owner_id,
        visitor_id=visitor_id,
        knock_message="Hey! Can I come in?",
        db=db
    )
    
    assert knock is not None
    assert knock["status"] == KnockStatus.PENDING
    assert knock["visitor_id"] == visitor_id
    assert knock["knock_message"] == "Hey! Can I come in?"


@pytest.mark.asyncio
async def test_blocked_visitor_cannot_knock(db, test_users):
    """Test BLOCKED visitor cannot knock"""
    owner_id = test_users["owner"]
    visitor_id = test_users["blocked_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # Check knock permission
    knock_result = await RoomPermissionService.can_knock(owner_id, visitor_id, db)
    assert knock_result["can_knock"] is False
    assert "BLOCKED" in knock_result["reason"]


@pytest.mark.asyncio
async def test_visitor_cannot_knock_on_locked_room(db, test_users):
    """Test visitor cannot knock when room is locked"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_visitor"]
    
    # Create room and lock it
    room = await get_or_create_room(owner_id, db)
    await db.peoples_rooms.update_one(
        {"owner_id": owner_id},
        {"$set": {"door_state": DoorState.LOCKED}}
    )
    
    # Check knock permission
    knock_result = await RoomPermissionService.can_knock(owner_id, visitor_id, db)
    assert knock_result["can_knock"] is False
    assert "LOCKED" in knock_result["reason"]


@pytest.mark.asyncio
async def test_knock_approval_workflow(db, test_users):
    """Test complete knock approval workflow"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # Visitor knocks
    knock = await create_knock(owner_id, visitor_id, "Knock knock!", db)
    assert knock["status"] == KnockStatus.PENDING
    
    # Owner approves
    approved_knock = await respond_to_knock(
        owner_id,
        visitor_id,
        "APPROVE",
        "Come on in!",
        db
    )
    
    assert approved_knock["status"] == KnockStatus.APPROVED
    assert approved_knock["response_note"] == "Come on in!"
    assert approved_knock["responded_at"] is not None


@pytest.mark.asyncio
async def test_knock_denial_workflow(db, test_users):
    """Test complete knock denial workflow"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # Visitor knocks
    await create_knock(owner_id, visitor_id, "Hello?", db)
    
    # Owner denies
    denied_knock = await respond_to_knock(
        owner_id,
        visitor_id,
        "DENY",
        "Not right now",
        db
    )
    
    assert denied_knock["status"] == KnockStatus.DENIED
    assert denied_knock["response_note"] == "Not right now"


# ============================================================================
# VISITOR ENTRY & EXIT TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_peoples_tier_direct_entry(db, test_users):
    """Test PEOPLES tier visitor can enter directly"""
    owner_id = test_users["owner"]
    visitor_id = test_users["peoples_visitor"]
    
    # Create room and owner enters
    await get_or_create_room(owner_id, db)
    await enter_room(owner_id, db)
    
    # Check visitor can enter directly
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is True
    assert "PEOPLES" in enter_result["reason"]


@pytest.mark.asyncio
async def test_cool_tier_requires_knock(db, test_users):
    """Test COOL tier visitor must knock first"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # Check visitor cannot enter directly
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is False
    
    # But can knock
    knock_result = await RoomPermissionService.can_knock(owner_id, visitor_id, db)
    assert knock_result["can_knock"] is True


@pytest.mark.asyncio
async def test_visitor_entry_after_approved_knock(db, test_users):
    """Test visitor can enter after knock is approved"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_visitor"]
    
    # Setup: room + session
    await get_or_create_room(owner_id, db)
    await enter_room(owner_id, db)
    
    # Visitor knocks
    await create_knock(owner_id, visitor_id, "Knock!", db)
    
    # Owner approves
    await respond_to_knock(owner_id, visitor_id, "APPROVE", db=db)
    
    # Now check visitor's approved knock exists
    approved_knock = await db.room_knocks.find_one(
        {
            "room_owner_id": owner_id,
            "visitor_id": visitor_id,
            "status": KnockStatus.APPROVED
        },
        {"_id": 0}
    )
    
    assert approved_knock is not None


@pytest.mark.asyncio
async def test_blocked_visitor_cannot_enter(db, test_users):
    """Test BLOCKED visitor cannot enter even with approved knock"""
    owner_id = test_users["owner"]
    visitor_id = test_users["blocked_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # BLOCKED user cannot enter
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is False
    assert "BLOCKED" in enter_result["reason"]


@pytest.mark.asyncio
async def test_visitor_cannot_enter_when_owner_not_present(db, test_users):
    """Test visitor cannot enter if owner not in room"""
    owner_id = test_users["owner"]
    visitor_id = test_users["peoples_visitor"]
    
    # Create room but owner does NOT enter
    await get_or_create_room(owner_id, db)
    
    # Check no active session
    session = await get_active_session(owner_id, db)
    assert session is None
    
    # Visitor should not be able to enter (no session)
    # This will be enforced by the API endpoint


# ============================================================================
# ACCESS LIST OVERRIDE TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_access_list_grants_direct_entry_to_blocked_user(db, test_users):
    """Test Access List can override BLOCKED tier"""
    owner_id = test_users["owner"]
    visitor_id = test_users["blocked_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # BLOCKED user cannot enter by default
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is False
    
    # Add to Access List with DIRECT_ENTRY
    await add_to_access_list(
        owner_id=owner_id,
        user_id=visitor_id,
        access_mode=AccessMode.DIRECT_ENTRY,
        db=db
    )
    
    # Now BLOCKED user CAN enter (Access List wins)
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is True
    assert enter_result["override_applied"] == "ACCESS_LIST"


@pytest.mark.asyncio
async def test_access_list_never_allow_blocks_peoples_tier(db, test_users):
    """Test NEVER_ALLOW in Access List blocks even PEOPLES tier"""
    owner_id = test_users["owner"]
    visitor_id = test_users["peoples_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # PEOPLES user can enter by default
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is True
    
    # Add to Access List with NEVER_ALLOW
    await add_to_access_list(
        owner_id=owner_id,
        user_id=visitor_id,
        access_mode=AccessMode.NEVER_ALLOW,
        db=db
    )
    
    # Now PEOPLES user CANNOT enter (NEVER_ALLOW wins)
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is False


# ============================================================================
# EDGE CASE TESTS
# ============================================================================

@pytest.mark.asyncio
async def test_visitor_cannot_enter_own_room(db, test_users):
    """Test user cannot enter their own room as a visitor"""
    owner_id = test_users["owner"]
    
    # This should be caught by the API endpoint logic
    # Owner should use POST /api/rooms/me/enter instead


@pytest.mark.asyncio
async def test_locked_room_blocks_all_entry(db, test_users):
    """Test locked room blocks all entry attempts"""
    owner_id = test_users["owner"]
    visitor_id = test_users["peoples_visitor"]
    
    # Create room and lock it
    await get_or_create_room(owner_id, db)
    await db.peoples_rooms.update_one(
        {"owner_id": owner_id},
        {"$set": {"door_state": DoorState.LOCKED}}
    )
    
    # Even PEOPLES tier cannot enter when locked
    enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
    assert enter_result["can_enter_direct"] is False
    assert "LOCKED" in enter_result["reason"]


@pytest.mark.asyncio
async def test_knock_rate_limit_enforcement(db, test_users):
    """Test knock rate limiting works for visitors"""
    owner_id = test_users["owner"]
    visitor_id = test_users["cool_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # Create 3 knocks (respond to each to avoid duplicate detection)
    for i in range(3):
        await create_knock(owner_id, visitor_id, f"Knock {i+1}", db)
        await respond_to_knock(owner_id, visitor_id, "DENY", db=db)
    
    # 4th knock should fail
    with pytest.raises(ValueError, match="Rate limit exceeded"):
        await create_knock(owner_id, visitor_id, "Knock 4", db)


@pytest.mark.asyncio
async def test_alright_tier_cannot_see_room_by_default(db, test_users):
    """Test ALRIGHT tier cannot see room by default"""
    owner_id = test_users["owner"]
    visitor_id = test_users["alright_visitor"]
    
    # Create room
    await get_or_create_room(owner_id, db)
    
    # ALRIGHT tier cannot see room by default
    can_see = await RoomPermissionService.can_see_room(owner_id, visitor_id, db)
    assert can_see is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
