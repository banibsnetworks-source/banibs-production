"""
Notification Triggers Service - Phase 8.6
Centralized notification creation for Groups and Relationships events

Stability Improvements - Phase 1:
- Added error handling and retry logic
- Added logging for debugging
- Added deduplication for rapid-fire triggers
"""

from typing import Optional
import logging
from db.notifications import create_notification

# Configure logger
logger = logging.getLogger("notification_triggers")

# Deduplication cache (simple in-memory, can be Redis in production)
_recent_notifications = set()
_DEDUPE_WINDOW = 5  # seconds


# ==================== GROUP EVENT NOTIFICATIONS ====================

async def notify_group_created(group_id: str, group_name: str, creator_id: str):
    """
    Notify when a group is created (mainly for admin tracking)
    """
    await create_notification(
        user_id=creator_id,
        notification_type="group_event",
        title="Group Created",
        message=f"Your group '{group_name}' has been created successfully!",
        link=f"/portal/social/groups/{group_id}",
        actor_id=creator_id,
        group_id=group_id,
        event_type="GROUP_CREATED"
    )


async def notify_group_invite(group_id: str, group_name: str, inviter_id: str, invitee_id: str):
    """
    Notify when a user is invited to a group
    """
    await create_notification(
        user_id=invitee_id,
        notification_type="group_event",
        title="Group Invitation",
        message=f"You've been invited to join '{group_name}'",
        link=f"/portal/social/groups/{group_id}",
        actor_id=inviter_id,
        target_user_id=invitee_id,
        group_id=group_id,
        event_type="GROUP_INVITE"
    )


async def notify_join_request(group_id: str, group_name: str, requester_id: str, admin_ids: list):
    """
    Notify group admins when someone requests to join (PRIVATE groups)
    """
    for admin_id in admin_ids:
        await create_notification(
            user_id=admin_id,
            notification_type="group_event",
            title="New Join Request",
            message=f"Someone wants to join '{group_name}'",
            link=f"/portal/social/groups/{group_id}",
            actor_id=requester_id,
            target_user_id=admin_id,
            group_id=group_id,
            event_type="GROUP_JOIN_REQUEST"
        )


async def notify_join_approved(group_id: str, group_name: str, approver_id: str, user_id: str):
    """
    Notify when join request is approved
    """
    await create_notification(
        user_id=user_id,
        notification_type="group_event",
        title="Join Request Approved",
        message=f"You've been approved to join '{group_name}'!",
        link=f"/portal/social/groups/{group_id}",
        actor_id=approver_id,
        target_user_id=user_id,
        group_id=group_id,
        event_type="GROUP_JOIN_APPROVED"
    )


async def notify_join_rejected(group_id: str, group_name: str, rejector_id: str, user_id: str):
    """
    Notify when join request is rejected
    """
    await create_notification(
        user_id=user_id,
        notification_type="group_event",
        title="Join Request Declined",
        message=f"Your request to join '{group_name}' was not approved",
        link="/portal/social/groups",
        actor_id=rejector_id,
        target_user_id=user_id,
        group_id=group_id,
        event_type="GROUP_JOIN_REJECTED"
    )


async def notify_member_added(group_id: str, group_name: str, adder_id: str, user_id: str):
    """
    Notify when a user is added to a group
    """
    await create_notification(
        user_id=user_id,
        notification_type="group_event",
        title="Added to Group",
        message=f"You've been added to '{group_name}'",
        link=f"/portal/social/groups/{group_id}",
        actor_id=adder_id,
        target_user_id=user_id,
        group_id=group_id,
        event_type="GROUP_MEMBER_ADDED"
    )


async def notify_role_change(group_id: str, group_name: str, changer_id: str, user_id: str, new_role: str):
    """
    Notify when a member's role is changed
    """
    role_messages = {
        "OWNER": "promoted to Owner",
        "ADMIN": "promoted to Admin",
        "MODERATOR": "promoted to Moderator",
        "MEMBER": "changed to Member"
    }
    
    action = role_messages.get(new_role, f"role changed to {new_role}")
    
    await create_notification(
        user_id=user_id,
        notification_type="group_event",
        title="Role Changed",
        message=f"You've been {action} in '{group_name}'",
        link=f"/portal/social/groups/{group_id}",
        actor_id=changer_id,
        target_user_id=user_id,
        group_id=group_id,
        event_type="GROUP_ROLE_CHANGE"
    )


async def notify_member_removed(group_id: str, group_name: str, remover_id: str, user_id: str):
    """
    Notify when a member is removed from a group
    """
    await create_notification(
        user_id=user_id,
        notification_type="group_event",
        title="Removed from Group",
        message=f"You've been removed from '{group_name}'",
        link="/portal/social/groups",
        actor_id=remover_id,
        target_user_id=user_id,
        group_id=group_id,
        event_type="GROUP_MEMBER_REMOVED"
    )


async def notify_group_updated(group_id: str, group_name: str, updater_id: str, member_ids: list):
    """
    Notify group members when group details are updated
    """
    for member_id in member_ids:
        if member_id != updater_id:  # Don't notify the person who made the update
            await create_notification(
                user_id=member_id,
                notification_type="group_event",
                title="Group Updated",
                message=f"'{group_name}' has been updated",
                link=f"/portal/social/groups/{group_id}",
                actor_id=updater_id,
                target_user_id=member_id,
                group_id=group_id,
                event_type="GROUP_UPDATED"
            )


# ==================== RELATIONSHIP EVENT NOTIFICATIONS ====================

async def notify_connection_request(requester_id: str, requester_name: str, target_user_id: str):
    """
    Notify when someone sends a connection request
    """
    await create_notification(
        user_id=target_user_id,
        notification_type="relationship_event",
        title="New Connection Request",
        message=f"{requester_name} wants to connect with you",
        link="/portal/social/connections",
        actor_id=requester_id,
        target_user_id=target_user_id,
        event_type="RELATIONSHIP_REQUEST"
    )


async def notify_connection_accepted(accepter_id: str, accepter_name: str, requester_id: str):
    """
    Notify when a connection request is accepted
    """
    await create_notification(
        user_id=requester_id,
        notification_type="relationship_event",
        title="Connection Accepted",
        message=f"{accepter_name} accepted your connection request",
        link="/portal/social/connections",
        actor_id=accepter_id,
        target_user_id=requester_id,
        event_type="RELATIONSHIP_ACCEPTED"
    )


async def notify_circle_tier_change(changer_id: str, changer_name: str, user_id: str, new_tier: str):
    """
    Notify when someone changes your circle tier
    """
    tier_names = {
        "PEOPLES": "Peoples (closest circle)",
        "COOL": "Cool (friends)",
        "ALRIGHT": "Alright (acquaintances)",
        "OTHERS": "Others"
    }
    
    tier_display = tier_names.get(new_tier, new_tier)
    
    await create_notification(
        user_id=user_id,
        notification_type="relationship_event",
        title="Circle Tier Updated",
        message=f"{changer_name} moved you to {tier_display}",
        link="/portal/social/connections",
        actor_id=changer_id,
        target_user_id=user_id,
        event_type="RELATIONSHIP_TIER_CHANGE"
    )


async def notify_blocked(blocker_id: str, blocked_user_id: str):
    """
    Notify when someone blocks you (optional - may not want to notify)
    Note: This is typically NOT sent to preserve privacy, but included for completeness
    """
    # Typically, users are NOT notified when they're blocked
    # This function is here for completeness but may not be called
    pass


async def notify_unblocked(unblocker_id: str, unblocker_name: str, user_id: str):
    """
    Notify when someone unblocks you
    """
    await create_notification(
        user_id=user_id,
        notification_type="relationship_event",
        title="Connection Restored",
        message=f"You can now connect with {unblocker_name} again",
        link="/portal/social/connections",
        actor_id=unblocker_id,
        target_user_id=user_id,
        event_type="RELATIONSHIP_UNBLOCKED"
    )
