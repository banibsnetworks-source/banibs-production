"""
BANIBS Groups Database Operations - Phase 8.5
Handles group creation, membership, and permissions
"""

from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
from typing import Optional, List
import uuid

from db.connection import get_db


# Group Privacy Levels
PRIVACY_PUBLIC = "PUBLIC"
PRIVACY_PRIVATE = "PRIVATE"
PRIVACY_SECRET = "SECRET"

VALID_PRIVACY_LEVELS = [PRIVACY_PUBLIC, PRIVACY_PRIVATE, PRIVACY_SECRET]

# Membership Roles
ROLE_OWNER = "OWNER"
ROLE_ADMIN = "ADMIN"
ROLE_MODERATOR = "MODERATOR"
ROLE_MEMBER = "MEMBER"

VALID_ROLES = [ROLE_OWNER, ROLE_ADMIN, ROLE_MODERATOR, ROLE_MEMBER]

# Membership Status
STATUS_ACTIVE = "ACTIVE"
STATUS_PENDING = "PENDING"
STATUS_BANNED = "BANNED"

VALID_STATUSES = [STATUS_ACTIVE, STATUS_PENDING, STATUS_BANNED]


async def create_group(
    name: str,
    description: str,
    creator_id: str,
    privacy: str = PRIVACY_PUBLIC,
    cover_image: Optional[str] = None,
    rules: Optional[str] = None,
    tags: Optional[List[str]] = None
) -> dict:
    """
    Create a new group.
    
    Args:
        name: Group name
        description: Group description
        creator_id: User ID of the creator
        privacy: PUBLIC, PRIVATE, or SECRET
        cover_image: Optional cover image URL
        rules: Optional group rules text
        tags: Optional list of tags
    
    Returns:
        The created group document
    """
    if privacy not in VALID_PRIVACY_LEVELS:
        raise ValueError(f"Invalid privacy level: {privacy}. Must be one of {VALID_PRIVACY_LEVELS}")
    
    db = await get_db()
    now = datetime.now(timezone.utc)
    
    group = {
        "id": str(uuid.uuid4()),
        "name": name,
        "description": description,
        "creator_id": creator_id,
        "privacy": privacy,
        "cover_image": cover_image,
        "rules": rules,
        "tags": tags or [],
        "member_count": 1,  # Creator is first member
        "created_at": now,
        "updated_at": now
    }
    
    await db.groups.insert_one(group)
    
    # Add creator as owner
    await add_member(
        group_id=group["id"],
        user_id=creator_id,
        role=ROLE_OWNER
    )
    
    return group


async def get_group_by_id(group_id: str) -> Optional[dict]:
    """
    Get a group by ID.
    """
    db = await get_db()
    group = await db.groups.find_one({"id": group_id}, {"_id": 0})
    return group


async def update_group(
    group_id: str,
    name: Optional[str] = None,
    description: Optional[str] = None,
    privacy: Optional[str] = None,
    cover_image: Optional[str] = None,
    rules: Optional[str] = None,
    tags: Optional[List[str]] = None
) -> Optional[dict]:
    """
    Update group details.
    """
    db = await get_db()
    
    update_fields = {"updated_at": datetime.now(timezone.utc)}
    
    if name is not None:
        update_fields["name"] = name
    if description is not None:
        update_fields["description"] = description
    if privacy is not None:
        if privacy not in VALID_PRIVACY_LEVELS:
            raise ValueError(f"Invalid privacy level: {privacy}")
        update_fields["privacy"] = privacy
    if cover_image is not None:
        update_fields["cover_image"] = cover_image
    if rules is not None:
        update_fields["rules"] = rules
    if tags is not None:
        update_fields["tags"] = tags
    
    await db.groups.update_one(
        {"id": group_id},
        {"$set": update_fields}
    )
    
    return await get_group_by_id(group_id)


async def delete_group(group_id: str) -> bool:
    """
    Delete a group and all its memberships.
    """
    db = await get_db()
    
    # Delete all memberships
    await db.group_members.delete_many({"group_id": group_id})
    
    # Delete group
    result = await db.groups.delete_one({"id": group_id})
    
    return result.deleted_count > 0


async def list_groups(
    user_id: Optional[str] = None,
    privacy: Optional[str] = None,
    search_query: Optional[str] = None,
    tags: Optional[List[str]] = None,
    limit: int = 50
) -> List[dict]:
    """
    List groups with optional filtering.
    
    Args:
        user_id: Filter groups where user is a member
        privacy: Filter by privacy level
        search_query: Search in name and description
        tags: Filter by tags
        limit: Maximum number of results
    """
    db = await get_db()
    
    query = {}
    
    if privacy:
        if privacy not in VALID_PRIVACY_LEVELS:
            raise ValueError(f"Invalid privacy level: {privacy}")
        query["privacy"] = privacy
    
    if search_query:
        query["$or"] = [
            {"name": {"$regex": search_query, "$options": "i"}},
            {"description": {"$regex": search_query, "$options": "i"}}
        ]
    
    if tags:
        query["tags"] = {"$in": tags}
    
    if user_id:
        # Get group IDs where user is a member
        memberships = await db.group_members.find(
            {"user_id": user_id, "status": STATUS_ACTIVE},
            {"_id": 0, "group_id": 1}
        ).to_list(1000)
        
        group_ids = [m["group_id"] for m in memberships]
        query["id"] = {"$in": group_ids}
    
    groups = await db.groups.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
    
    return groups


# ==================== MEMBERSHIP OPERATIONS ====================

async def add_member(
    group_id: str,
    user_id: str,
    role: str = ROLE_MEMBER,
    status: str = STATUS_ACTIVE
) -> dict:
    """
    Add a member to a group.
    """
    if role not in VALID_ROLES:
        raise ValueError(f"Invalid role: {role}. Must be one of {VALID_ROLES}")
    
    if status not in VALID_STATUSES:
        raise ValueError(f"Invalid status: {status}. Must be one of {VALID_STATUSES}")
    
    db = await get_db()
    now = datetime.now(timezone.utc)
    
    # Check if membership already exists
    existing = await db.group_members.find_one({
        "group_id": group_id,
        "user_id": user_id
    })
    
    if existing:
        # Update existing membership
        await db.group_members.update_one(
            {"_id": existing["_id"]},
            {
                "$set": {
                    "role": role,
                    "status": status,
                    "updated_at": now
                }
            }
        )
        return await db.group_members.find_one({"_id": existing["_id"]}, {"_id": 0})
    else:
        # Create new membership
        membership = {
            "id": str(uuid.uuid4()),
            "group_id": group_id,
            "user_id": user_id,
            "role": role,
            "status": status,
            "joined_at": now,
            "updated_at": now
        }
        
        await db.group_members.insert_one(membership)
        
        # Update group member count if active
        if status == STATUS_ACTIVE:
            await db.groups.update_one(
                {"id": group_id},
                {"$inc": {"member_count": 1}}
            )
        
        return membership


async def remove_member(group_id: str, user_id: str) -> bool:
    """
    Remove a member from a group.
    """
    db = await get_db()
    
    result = await db.group_members.delete_one({
        "group_id": group_id,
        "user_id": user_id
    })
    
    if result.deleted_count > 0:
        # Update group member count
        await db.groups.update_one(
            {"id": group_id},
            {"$inc": {"member_count": -1}}
        )
        return True
    
    return False


async def update_member_role(
    group_id: str,
    user_id: str,
    new_role: str
) -> Optional[dict]:
    """
    Update a member's role in a group.
    """
    if new_role not in VALID_ROLES:
        raise ValueError(f"Invalid role: {new_role}")
    
    db = await get_db()
    
    await db.group_members.update_one(
        {"group_id": group_id, "user_id": user_id},
        {
            "$set": {
                "role": new_role,
                "updated_at": datetime.now(timezone.utc)
            }
        }
    )
    
    return await get_membership(group_id, user_id)


async def get_membership(group_id: str, user_id: str) -> Optional[dict]:
    """
    Get a user's membership in a group.
    """
    db = await get_db()
    membership = await db.group_members.find_one(
        {"group_id": group_id, "user_id": user_id},
        {"_id": 0}
    )
    return membership


async def list_group_members(
    group_id: str,
    role: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 100
) -> List[dict]:
    """
    List members of a group.
    """
    db = await get_db()
    
    query = {"group_id": group_id}
    
    if role:
        if role not in VALID_ROLES:
            raise ValueError(f"Invalid role: {role}")
        query["role"] = role
    
    if status:
        if status not in VALID_STATUSES:
            raise ValueError(f"Invalid status: {status}")
        query["status"] = status
    
    members = await db.group_members.find(query, {"_id": 0}).limit(limit).to_list(limit)
    
    return members


async def get_user_groups(user_id: str, limit: int = 50) -> List[dict]:
    """
    Get all groups a user is a member of.
    """
    db = await get_db()
    
    # Get memberships
    memberships = await db.group_members.find(
        {"user_id": user_id, "status": STATUS_ACTIVE},
        {"_id": 0}
    ).to_list(1000)
    
    if not memberships:
        return []
    
    # Get group IDs
    group_ids = [m["group_id"] for m in memberships]
    
    # Get groups
    groups = await db.groups.find(
        {"id": {"$in": group_ids}},
        {"_id": 0}
    ).limit(limit).to_list(limit)
    
    # Attach membership info to each group
    membership_map = {m["group_id"]: m for m in memberships}
    
    for group in groups:
        group["membership"] = membership_map.get(group["id"])
    
    return groups


async def check_user_permission(
    group_id: str,
    user_id: str,
    required_role: Optional[str] = None
) -> bool:
    """
    Check if a user has permission to perform an action in a group.
    
    Args:
        group_id: Group ID
        user_id: User ID
        required_role: Minimum role required (None = any active member)
    
    Returns:
        True if user has permission, False otherwise
    """
    membership = await get_membership(group_id, user_id)
    
    if not membership or membership["status"] != STATUS_ACTIVE:
        return False
    
    if required_role is None:
        return True
    
    # Role hierarchy: OWNER > ADMIN > MODERATOR > MEMBER
    role_hierarchy = {
        ROLE_OWNER: 4,
        ROLE_ADMIN: 3,
        ROLE_MODERATOR: 2,
        ROLE_MEMBER: 1
    }
    
    user_role_level = role_hierarchy.get(membership["role"], 0)
    required_role_level = role_hierarchy.get(required_role, 0)
    
    return user_role_level >= required_role_level
