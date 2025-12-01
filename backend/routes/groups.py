"""
BANIBS Groups API Routes - Phase 8.5
Handles group creation, membership, and permissions
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional

from schemas.group import (
    GroupCreate,
    GroupUpdate,
    GroupRead,
    GroupWithMembership,
    MembershipCreate,
    MembershipRead,
    MembershipWithUser,
    JoinGroupRequest,
    UpdateRoleRequest,
    RemoveMemberRequest
)
from db import groups as groups_db
from middleware.auth_guard import get_current_user

# Phase 8.6 - Import notification triggers
from services import notification_triggers

router = APIRouter(prefix="/api/groups", tags=["groups"])


# ==================== GROUP ENDPOINTS ====================

@router.post("/", response_model=GroupRead)
async def create_group(
    payload: GroupCreate,
    current_user: dict = Depends(get_current_user)
):
    """
    Create a new group.
    The creator automatically becomes the owner.
    """
    try:
        group = await groups_db.create_group(
            name=payload.name,
            description=payload.description,
            creator_id=current_user["id"],
            privacy=payload.privacy,
            cover_image=payload.cover_image,
            rules=payload.rules,
            tags=payload.tags
        )
        
        # Phase 8.6 - Send notification
        await notification_triggers.notify_group_created(
            group_id=group["id"],
            group_name=group["name"],
            creator_id=current_user["id"]
        )
        
        return group
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create group: {str(e)}")


@router.get("/", response_model=List[GroupWithMembership])
async def list_groups(
    my_groups: bool = Query(False, description="Filter to groups I'm a member of"),
    privacy: Optional[str] = Query(None, description="Filter by privacy: PUBLIC, PRIVATE, SECRET"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    tags: Optional[str] = Query(None, description="Comma-separated tags"),
    limit: int = Query(50, le=100, description="Max results"),
    current_user: dict = Depends(get_current_user)
):
    """
    List groups with optional filtering.
    """
    try:
        tag_list = tags.split(',') if tags else None
        
        groups = await groups_db.list_groups(
            user_id=current_user["id"] if my_groups else None,
            privacy=privacy,
            search_query=search,
            tags=tag_list,
            limit=limit
        )
        
        # Attach membership info if available
        for group in groups:
            membership = await groups_db.get_membership(
                group_id=group["id"],
                user_id=current_user["id"]
            )
            group["membership"] = membership
        
        return groups
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list groups: {str(e)}")


@router.get("/my-groups", response_model=List[GroupWithMembership])
async def get_my_groups(
    limit: int = Query(50, le=100),
    current_user: dict = Depends(get_current_user)
):
    """
    Get all groups the current user is a member of.
    """
    try:
        groups = await groups_db.get_user_groups(
            user_id=current_user["id"],
            limit=limit
        )
        return groups
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user groups: {str(e)}")


@router.get("/{group_id}", response_model=GroupWithMembership)
async def get_group(
    group_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific group by ID.
    """
    try:
        group = await groups_db.get_group_by_id(group_id)
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Attach membership info
        membership = await groups_db.get_membership(
            group_id=group_id,
            user_id=current_user["id"]
        )
        group["membership"] = membership
        
        return group
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch group: {str(e)}")


@router.patch("/{group_id}", response_model=GroupRead)
async def update_group(
    group_id: str,
    payload: GroupUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Update group details.
    Only group admins and owners can update.
    """
    try:
        # Check permission
        has_permission = await groups_db.check_user_permission(
            group_id=group_id,
            user_id=current_user["id"],
            required_role="ADMIN"
        )
        
        if not has_permission:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update this group"
            )
        
        group = await groups_db.update_group(
            group_id=group_id,
            name=payload.name,
            description=payload.description,
            privacy=payload.privacy,
            cover_image=payload.cover_image,
            rules=payload.rules,
            tags=payload.tags
        )
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        return group
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update group: {str(e)}")


@router.delete("/{group_id}")
async def delete_group(
    group_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a group.
    Only the group owner can delete.
    """
    try:
        # Check if user is owner
        has_permission = await groups_db.check_user_permission(
            group_id=group_id,
            user_id=current_user["id"],
            required_role="OWNER"
        )
        
        if not has_permission:
            raise HTTPException(
                status_code=403,
                detail="Only the group owner can delete the group"
            )
        
        deleted = await groups_db.delete_group(group_id)
        
        if not deleted:
            raise HTTPException(status_code=404, detail="Group not found")
        
        return {"ok": True, "message": "Group deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete group: {str(e)}")


# ==================== MEMBERSHIP ENDPOINTS ====================

@router.post("/{group_id}/join", response_model=MembershipRead)
async def join_group(
    group_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Join a group.
    For PUBLIC groups: immediately become an active member.
    For PRIVATE groups: request pending approval.
    SECRET groups cannot be joined without invitation.
    """
    try:
        group = await groups_db.get_group_by_id(group_id)
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        if group["privacy"] == "SECRET":
            raise HTTPException(
                status_code=403,
                detail="Cannot join secret groups without invitation"
            )
        
        status = "ACTIVE" if group["privacy"] == "PUBLIC" else "PENDING"
        
        membership = await groups_db.add_member(
            group_id=group_id,
            user_id=current_user["id"],
            role="MEMBER",
            status=status
        )
        
        # Phase 8.6 - Send notifications
        if status == "ACTIVE":
            # PUBLIC group - user joined successfully
            await notification_triggers.notify_member_added(
                group_id=group_id,
                group_name=group["name"],
                adder_id="system",  # Auto-added
                user_id=current_user["id"]
            )
        else:
            # PRIVATE group - notify admins of join request
            admin_members = await groups_db.list_group_members(
                group_id=group_id,
                role="ADMIN",
                status="ACTIVE",
                limit=100
            )
            admin_ids = [m["user_id"] for m in admin_members if m["user_id"] != current_user["id"]]
            
            if admin_ids:
                await notification_triggers.notify_join_request(
                    group_id=group_id,
                    group_name=group["name"],
                    requester_id=current_user["id"],
                    admin_ids=admin_ids
                )
        
        return membership
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to join group: {str(e)}")


@router.post("/{group_id}/leave")
async def leave_group(
    group_id: str,
    current_user: dict = Depends(get_current_user)
):
    """
    Leave a group.
    Owners cannot leave unless they transfer ownership first.
    """
    try:
        membership = await groups_db.get_membership(
            group_id=group_id,
            user_id=current_user["id"]
        )
        
        if not membership:
            raise HTTPException(status_code=404, detail="You are not a member of this group")
        
        if membership["role"] == "OWNER":
            raise HTTPException(
                status_code=400,
                detail="Owners cannot leave. Transfer ownership first."
            )
        
        removed = await groups_db.remove_member(
            group_id=group_id,
            user_id=current_user["id"]
        )
        
        if not removed:
            raise HTTPException(status_code=404, detail="Membership not found")
        
        return {"ok": True, "message": "Left group successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to leave group: {str(e)}")


@router.get("/{group_id}/members", response_model=List[MembershipRead])
async def list_group_members(
    group_id: str,
    role: Optional[str] = Query(None, description="Filter by role"),
    status: Optional[str] = Query(None, description="Filter by status"),
    limit: int = Query(100, le=200),
    current_user: dict = Depends(get_current_user)
):
    """
    List members of a group.
    Only group members can view the member list.
    """
    try:
        # Check if user is a member
        has_permission = await groups_db.check_user_permission(
            group_id=group_id,
            user_id=current_user["id"]
        )
        
        if not has_permission:
            raise HTTPException(
                status_code=403,
                detail="You must be a member to view the member list"
            )
        
        members = await groups_db.list_group_members(
            group_id=group_id,
            role=role,
            status=status,
            limit=limit
        )
        
        return members
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list members: {str(e)}")


@router.post("/{group_id}/members/role", response_model=MembershipRead)
async def update_member_role(
    group_id: str,
    payload: UpdateRoleRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update a member's role.
    Only admins and owners can update roles.
    Owners cannot be demoted except by transferring ownership.
    """
    try:
        # Check permission
        has_permission = await groups_db.check_user_permission(
            group_id=group_id,
            user_id=current_user["id"],
            required_role="ADMIN"
        )
        
        if not has_permission:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to update member roles"
            )
        
        # Check if target is owner
        target_membership = await groups_db.get_membership(
            group_id=group_id,
            user_id=payload.user_id
        )
        
        if target_membership and target_membership["role"] == "OWNER":
            raise HTTPException(
                status_code=400,
                detail="Cannot change owner's role. Transfer ownership first."
            )
        
        membership = await groups_db.update_member_role(
            group_id=group_id,
            user_id=payload.user_id,
            new_role=payload.role
        )
        
        if not membership:
            raise HTTPException(status_code=404, detail="Member not found")
        
        # Phase 8.6 - Send notification
        group = await groups_db.get_group_by_id(group_id)
        if group:
            await notification_triggers.notify_role_change(
                group_id=group_id,
                group_name=group["name"],
                changer_id=current_user["id"],
                user_id=payload.user_id,
                new_role=payload.role
            )
        
        return membership
    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update role: {str(e)}")


@router.post("/{group_id}/members/remove")
async def remove_member(
    group_id: str,
    payload: RemoveMemberRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Remove a member from the group.
    Only moderators, admins, and owners can remove members.
    Cannot remove owners.
    """
    try:
        # Check permission
        has_permission = await groups_db.check_user_permission(
            group_id=group_id,
            user_id=current_user["id"],
            required_role="MODERATOR"
        )
        
        if not has_permission:
            raise HTTPException(
                status_code=403,
                detail="You don't have permission to remove members"
            )
        
        # Check if target is owner
        target_membership = await groups_db.get_membership(
            group_id=group_id,
            user_id=payload.user_id
        )
        
        if target_membership and target_membership["role"] == "OWNER":
            raise HTTPException(
                status_code=400,
                detail="Cannot remove the group owner"
            )
        
        removed = await groups_db.remove_member(
            group_id=group_id,
            user_id=payload.user_id
        )
        
        if not removed:
            raise HTTPException(status_code=404, detail="Member not found")
        
        return {"ok": True, "message": "Member removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove member: {str(e)}")
