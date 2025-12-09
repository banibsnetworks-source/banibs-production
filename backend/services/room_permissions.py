"""
Room Permissions Service - BANIBS Peoples Room System
Centralized permission resolution for room access

Permission Hierarchy (Founder-Approved):
1. Access List (per-person overrides) - HIGHEST PRIORITY
2. Circle-based rules (per-group permissions)
3. Tier-based defaults (from Circle Trust Order)
4. Door state (LOCKED blocks all)

Special Rules:
- NEVER_ALLOW in Access List wins over everything
- DIRECT_ENTRY bypasses knock (unless door locked)
- BLOCKED and SAFE MODE users denied unless in Access List
"""

from typing import Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging

from db.connection import get_db
from services.relationship_helper import get_relationship_tier
from models.peoples_room import (
    RoomPermissionResult,
    DoorState,
    AccessMode,
    TierRules
)

logger = logging.getLogger(__name__)


class RoomPermissionService:
    """Service for checking room access permissions"""
    
    @staticmethod
    async def get_room_config(
        owner_id: str,
        db: Optional[AsyncIOMotorDatabase] = None
    ) -> Optional[Dict[str, Any]]:
        """
        Get room configuration for owner.
        
        Args:
            owner_id: Room owner's user ID
            db: Database connection (optional)
        
        Returns:
            Room config dict or None if not found
        """
        if db is None:
            db = await get_db()
        
        room = await db.peoples_rooms.find_one(
            {"owner_id": owner_id},
            {"_id": 0}
        )
        
        return room
    
    @staticmethod
    async def can_see_room(
        owner_id: str,
        viewer_id: str,
        db: Optional[AsyncIOMotorDatabase] = None
    ) -> bool:
        """
        Check if viewer can see that owner's room exists.
        
        Permission Logic:
        1. Get room config
        2. Get relationship tier (via BDII)
        3. If viewer is BLOCKED → False
        4. Check Access List:
           - NEVER_ALLOW → False
           - In room_visible_to_users → True
        5. Check Circle membership → True if in room_visible_to_circles
        6. Check tier rules → True if tier allows
        7. Check visibility lists → True if tier in room_visible_to_tiers
        8. Default → False
        
        Args:
            owner_id: Room owner
            viewer_id: User trying to view
            db: Database connection (optional)
        
        Returns:
            True if viewer can see room, False otherwise
        """
        if db is None:
            db = await get_db()
        
        # Self always sees own room
        if owner_id == viewer_id:
            return True
        
        # Get room config
        room = await RoomPermissionService.get_room_config(owner_id, db)
        if not room:
            return False
        
        # Get relationship tier
        viewer_tier = await get_relationship_tier(owner_id, viewer_id, db)
        
        # BLOCKED users cannot see room
        if viewer_tier == "BLOCKED":
            return False
        
        # Check Access List (highest priority)
        for entry in room.get("access_list", []):
            if entry["user_id"] == viewer_id:
                if entry["access_mode"] == AccessMode.NEVER_ALLOW:
                    return False
                # Any other access mode means they can see room
                return True
        
        # Check explicit user visibility list
        if viewer_id in room.get("room_visible_to_users", []):
            return True
        
        # Check Circle membership
        # TODO: Implement circle check when Circle Engine is available
        # for circle_id in room.get("room_visible_to_circles", []):
        #     if await is_member_of_circle(viewer_id, circle_id, db):
        #         return True
        
        # Check tier rules
        tier_rules = room.get("tier_rules", {}).get(viewer_tier, {})
        if tier_rules.get("can_see_room", False):
            return True
        
        # Check tier visibility list
        if viewer_tier in room.get("room_visible_to_tiers", []):
            return True
        
        # Default: cannot see
        return False
    
    @staticmethod
    async def can_knock(
        owner_id: str,
        visitor_id: str,
        db: Optional[AsyncIOMotorDatabase] = None
    ) -> Dict[str, Any]:
        """
        Check if visitor can knock on owner's door.
        
        Permission Logic:
        1. Check door state (LOCKED/DND → False)
        2. Get relationship tier
        3. If BLOCKED or SAFE MODE → False
        4. Check Access List:
           - NEVER_ALLOW → False
           - DIRECT_ENTRY → {"can_knock": False, "reason": "direct_entry"}
           - MUST_KNOCK → True
        5. Check Circle membership → True if in allowed_circles_can_knock
        6. Check tier rules → True if tier allows knock
        7. Default → False
        
        Args:
            owner_id: Room owner
            visitor_id: User trying to knock
            db: Database connection (optional)
        
        Returns:
            Dict with can_knock, reason, and optional notes
        """
        if db is None:
            db = await get_db()
        
        # Cannot knock on own room
        if owner_id == visitor_id:
            return {
                "can_knock": False,
                "reason": "Cannot knock on your own room"
            }
        
        # Get room config
        room = await RoomPermissionService.get_room_config(owner_id, db)
        if not room:
            return {
                "can_knock": False,
                "reason": "Room not found"
            }
        
        # Check door state
        door_state = room.get("door_state", DoorState.OPEN)
        if door_state in [DoorState.LOCKED, DoorState.DND]:
            return {
                "can_knock": False,
                "reason": f"Door is {door_state}"
            }
        
        # Get relationship tier
        visitor_tier = await get_relationship_tier(owner_id, visitor_id, db)
        
        # BLOCKED and SAFE MODE users cannot knock
        if visitor_tier in ["BLOCKED", "OTHERS_SAFE_MODE"]:
            return {
                "can_knock": False,
                "reason": f"{visitor_tier} tier cannot knock"
            }
        
        # Check Access List (highest priority)
        for entry in room.get("access_list", []):
            if entry["user_id"] == visitor_id:
                if entry["access_mode"] == AccessMode.NEVER_ALLOW:
                    return {
                        "can_knock": False,
                        "reason": "Access denied (owner preference)"
                    }
                elif entry["access_mode"] == AccessMode.DIRECT_ENTRY:
                    return {
                        "can_knock": False,
                        "reason": "direct_entry",
                        "note": "You have direct entry access - no need to knock"
                    }
                elif entry["access_mode"] == AccessMode.MUST_KNOCK:
                    return {
                        "can_knock": True,
                        "reason": "Access List: MUST_KNOCK",
                        "override_applied": "ACCESS_LIST"
                    }
        
        # Check Circle membership
        # TODO: Implement when Circle Engine available
        # for circle_id in room.get("allowed_circles_can_knock", []):
        #     if await is_member_of_circle(visitor_id, circle_id, db):
        #         return {
        #             "can_knock": True,
        #             "reason": "Circle membership allows knock",
        #             "override_applied": "CIRCLE"
        #         }
        
        # Check tier rules
        tier_rules = room.get("tier_rules", {}).get(visitor_tier, {})
        if tier_rules.get("can_knock", False):
            return {
                "can_knock": True,
                "reason": f"{visitor_tier} tier can knock",
                "override_applied": "TIER"
            }
        
        # Default: cannot knock
        return {
            "can_knock": False,
            "reason": f"{visitor_tier} tier not allowed to knock"
        }
    
    @staticmethod
    async def can_enter_direct(
        owner_id: str,
        visitor_id: str,
        db: Optional[AsyncIOMotorDatabase] = None
    ) -> Dict[str, Any]:
        """
        Check if visitor can enter room without knocking.
        
        Permission Logic:
        1. Check door state (LOCKED/DND → False)
        2. Get relationship tier
        3. If BLOCKED or SAFE MODE → False
        4. Check Access List:
           - NEVER_ALLOW → False
           - DIRECT_ENTRY → True
        5. Check Circle membership → True if in allowed_circles_can_enter
        6. Check tier rules → True if tier allows direct entry
        7. Default → False
        
        Args:
            owner_id: Room owner
            visitor_id: User trying to enter
            db: Database connection (optional)
        
        Returns:
            Dict with can_enter_direct, reason, override info
        """
        if db is None:
            db = await get_db()
        
        # Owner always has direct entry to own room
        if owner_id == visitor_id:
            return {
                "can_enter_direct": True,
                "reason": "Owner of room"
            }
        
        # Get room config
        room = await RoomPermissionService.get_room_config(owner_id, db)
        if not room:
            return {
                "can_enter_direct": False,
                "reason": "Room not found"
            }
        
        # Check door state
        door_state = room.get("door_state", DoorState.OPEN)
        if door_state in [DoorState.LOCKED, DoorState.DND]:
            return {
                "can_enter_direct": False,
                "reason": f"Door is {door_state}"
            }
        
        # Get relationship tier
        visitor_tier = await get_relationship_tier(owner_id, visitor_id, db)
        
        # BLOCKED and SAFE MODE users cannot enter
        if visitor_tier in ["BLOCKED", "OTHERS_SAFE_MODE"]:
            return {
                "can_enter_direct": False,
                "reason": f"{visitor_tier} tier cannot enter"
            }
        
        # Check Access List (highest priority)
        for entry in room.get("access_list", []):
            if entry["user_id"] == visitor_id:
                if entry["access_mode"] == AccessMode.NEVER_ALLOW:
                    return {
                        "can_enter_direct": False,
                        "reason": "Access denied (owner preference)"
                    }
                elif entry["access_mode"] == AccessMode.DIRECT_ENTRY:
                    return {
                        "can_enter_direct": True,
                        "reason": "Access List: DIRECT_ENTRY",
                        "override_applied": "ACCESS_LIST"
                    }
        
        # Check Circle membership
        # TODO: Implement when Circle Engine available
        # for circle_id in room.get("allowed_circles_can_enter", []):
        #     if await is_member_of_circle(visitor_id, circle_id, db):
        #         return {
        #             "can_enter_direct": True,
        #             "reason": "Circle membership allows entry",
        #             "override_applied": "CIRCLE"
        #         }
        
        # Check tier rules
        tier_rules = room.get("tier_rules", {}).get(visitor_tier, {})
        if tier_rules.get("can_enter_direct", False):
            return {
                "can_enter_direct": True,
                "reason": f"{visitor_tier} tier has direct entry",
                "override_applied": "TIER"
            }
        
        # Default: cannot enter directly
        return {
            "can_enter_direct": False,
            "reason": f"{visitor_tier} tier requires knock approval"
        }
    
    @staticmethod
    async def resolve_effective_room_permissions(
        owner_id: str,
        visitor_id: str,
        db: Optional[AsyncIOMotorDatabase] = None
    ) -> RoomPermissionResult:
        """
        Resolve complete permission set for visitor.
        
        Combines all permission checks into single decision object.
        
        Args:
            owner_id: Room owner
            visitor_id: User checking permissions
            db: Database connection (optional)
        
        Returns:
            RoomPermissionResult with all permissions
        """
        if db is None:
            db = await get_db()
        
        # Get all permission checks
        can_see = await RoomPermissionService.can_see_room(owner_id, visitor_id, db)
        knock_result = await RoomPermissionService.can_knock(owner_id, visitor_id, db)
        enter_result = await RoomPermissionService.can_enter_direct(owner_id, visitor_id, db)
        
        can_knock_val = knock_result.get("can_knock", False)
        can_enter_val = enter_result.get("can_enter_direct", False)
        
        # Get tier for blocked check
        visitor_tier = await get_relationship_tier(owner_id, visitor_id, db)
        is_blocked = visitor_tier in ["BLOCKED", "OTHERS_SAFE_MODE"]
        
        # Determine must_knock: can eventually enter but needs knock approval first
        must_knock = can_knock_val and not can_enter_val
        
        # Determine override applied
        override = None
        if "override_applied" in enter_result:
            override = enter_result["override_applied"]
        elif "override_applied" in knock_result:
            override = knock_result["override_applied"]
        
        # Determine reason
        if not can_see:
            reason = "Cannot see room"
        elif is_blocked:
            reason = f"{visitor_tier} tier is blocked"
        elif can_enter_val:
            reason = enter_result.get("reason", "Direct entry allowed")
        elif can_knock_val:
            reason = knock_result.get("reason", "Can knock for entry")
        else:
            reason = "Insufficient permissions"
        
        return RoomPermissionResult(
            can_see_room=can_see,
            can_knock=can_knock_val,
            can_enter_direct=can_enter_val,
            must_knock=must_knock,
            is_blocked=is_blocked,
            reason=reason,
            override_applied=override
        )


# Convenience functions
async def can_see_room(owner_id: str, viewer_id: str) -> bool:
    """Check if viewer can see room"""
    return await RoomPermissionService.can_see_room(owner_id, viewer_id)


async def can_knock(owner_id: str, visitor_id: str) -> Dict[str, Any]:
    """Check if visitor can knock"""
    return await RoomPermissionService.can_knock(owner_id, visitor_id)


async def can_enter_direct(owner_id: str, visitor_id: str) -> Dict[str, Any]:
    """Check if visitor can enter without knocking"""
    return await RoomPermissionService.can_enter_direct(owner_id, visitor_id)


async def resolve_effective_room_permissions(
    owner_id: str,
    visitor_id: str
) -> RoomPermissionResult:
    """Get complete permission set for visitor"""
    return await RoomPermissionService.resolve_effective_room_permissions(owner_id, visitor_id)
