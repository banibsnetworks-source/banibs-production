"""
Circle Trust Order - Permission Service
Implements tier-based visibility and permission enforcement across BANIBS

This service provides centralized permission checking for:
- Feed visibility (what posts can they see)
- Messaging permissions (who can DM)
- Profile visibility (what profile data is visible)
- Comments & interactions
- Notifications
"""

from typing import Optional, Dict, List, Any
from enum import Enum


# Circle Trust Order - 7 Tiers
class TrustTier(str, Enum):
    PEOPLES = "PEOPLES"
    COOL = "COOL"
    CHILL = "CHILL"
    ALRIGHT = "ALRIGHT"
    OTHERS = "OTHERS"
    OTHERS_SAFE_MODE = "OTHERS_SAFE_MODE"
    BLOCKED = "BLOCKED"


# Content Visibility Levels
class ContentVisibility(str, Enum):
    PUBLIC = "PUBLIC"              # Everyone can see
    COOL = "COOL"                  # PEOPLES + COOL can see
    CHILL = "CHILL"                # PEOPLES + COOL + CHILL can see
    ALRIGHT = "ALRIGHT"            # PEOPLES + COOL + CHILL + ALRIGHT can see
    PEOPLES_ONLY = "PEOPLES_ONLY"  # Only PEOPLES can see


class TrustPermissionService:
    """
    Service for checking trust-based permissions
    """
    
    # Feed Visibility Matrix
    # Key: Content visibility level
    # Value: List of tiers that can see this content
    FEED_VISIBILITY_MATRIX = {
        ContentVisibility.PUBLIC: [
            TrustTier.PEOPLES,
            TrustTier.COOL,
            TrustTier.CHILL,
            TrustTier.ALRIGHT,
            TrustTier.OTHERS,
            # OTHERS_SAFE_MODE sees limited public content (filtered)
        ],
        ContentVisibility.COOL: [
            TrustTier.PEOPLES,
            TrustTier.COOL,
        ],
        ContentVisibility.CHILL: [
            TrustTier.PEOPLES,
            TrustTier.COOL,
            TrustTier.CHILL,
        ],
        ContentVisibility.ALRIGHT: [
            TrustTier.PEOPLES,
            TrustTier.COOL,
            TrustTier.CHILL,
            TrustTier.ALRIGHT,
        ],
        ContentVisibility.PEOPLES_ONLY: [
            TrustTier.PEOPLES,
        ],
    }
    
    @staticmethod
    def can_see_content(viewer_tier: str, content_visibility: str) -> bool:
        """
        Check if a viewer at a given trust tier can see content with given visibility.
        
        Args:
            viewer_tier: Trust tier of the viewer (PEOPLES, COOL, etc.)
            content_visibility: Visibility level of the content (PUBLIC, COOL, etc.)
        
        Returns:
            True if viewer can see the content, False otherwise
        
        Examples:
            >>> can_see_content("PEOPLES", "PUBLIC")
            True
            
            >>> can_see_content("OTHERS", "COOL")
            False
            
            >>> can_see_content("BLOCKED", "PUBLIC")
            False
        """
        # BLOCKED users cannot see anything
        if viewer_tier == TrustTier.BLOCKED:
            return False
        
        # OTHERS_SAFE_MODE sees very limited content
        if viewer_tier == TrustTier.OTHERS_SAFE_MODE:
            # Only see public content (with restrictions applied elsewhere)
            return content_visibility == ContentVisibility.PUBLIC
        
        # Check visibility matrix
        try:
            allowed_tiers = TrustPermissionService.FEED_VISIBILITY_MATRIX.get(
                ContentVisibility(content_visibility),
                []
            )
            return TrustTier(viewer_tier) in allowed_tiers
        except (ValueError, KeyError):
            # Invalid tier or visibility level
            return False
    
    @staticmethod
    def can_send_dm(sender_tier: str, existing_thread: bool = False) -> Dict[str, Any]:
        """
        Check if someone at a given trust tier can send you a DM.
        
        Args:
            sender_tier: Trust tier of the sender
            existing_thread: Whether a DM thread already exists (tier-change behavior)
        
        Returns:
            Dictionary with permission status and requirements:
            {
                "can_send": bool,
                "requires_approval": bool,
                "reason": str
            }
        """
        tier_permissions = {
            TrustTier.PEOPLES: {
                "can_send": True,
                "requires_approval": False,
                "reason": "PEOPLES can always send DMs"
            },
            TrustTier.COOL: {
                "can_send": True,
                "requires_approval": True,  # Requires approval on first message
                "reason": "COOL can send DMs (first message needs approval)"
            },
            TrustTier.CHILL: {
                "can_send": True,
                "requires_approval": True,  # Must request permission
                "reason": "CHILL must request permission to DM"
            },
            TrustTier.ALRIGHT: {
                "can_send": False,
                "requires_approval": False,
                "reason": "ALRIGHT cannot initiate DMs"
            },
            TrustTier.OTHERS: {
                "can_send": False,
                "requires_approval": False,
                "reason": "OTHERS cannot send DMs"
            },
            TrustTier.OTHERS_SAFE_MODE: {
                "can_send": False,
                "requires_approval": False,
                "reason": "Restricted - cannot send DMs"
            },
            TrustTier.BLOCKED: {
                "can_send": False,
                "requires_approval": False,
                "reason": "BLOCKED cannot contact you"
            },
        }
        
        try:
            permission = tier_permissions[TrustTier(sender_tier)]
            
            # Tier-change behavior: existing threads remain accessible
            # New messages follow current tier rules
            if existing_thread and permission["can_send"]:
                # Thread exists and tier allows messaging - no approval needed for continuation
                permission = permission.copy()
                permission["requires_approval"] = False
                permission["reason"] = f"{permission['reason']} (continuing existing thread)"
            
            return permission
        except (ValueError, KeyError):
            return {
                "can_send": False,
                "requires_approval": False,
                "reason": "Invalid trust tier"
            }
    
    @staticmethod
    def get_profile_visibility(viewer_tier: str) -> Dict[str, bool]:
        """
        Get what profile fields are visible to someone at a given trust tier.
        
        Args:
            viewer_tier: Trust tier of the viewer
        
        Returns:
            Dictionary of field visibilities:
            {
                "name": bool,
                "username": bool,
                "bio": bool,
                "avatar": bool,
                "contact_info": bool,
                "peoples_list": bool,
                "full_profile": bool
            }
        """
        profile_matrix = {
            TrustTier.PEOPLES: {
                "name": True,
                "username": True,
                "bio": True,
                "avatar": True,
                "contact_info": True,
                "peoples_list": True,
                "full_profile": True
            },
            TrustTier.COOL: {
                "name": True,
                "username": True,
                "bio": True,
                "avatar": True,
                "contact_info": False,  # Limited contact info
                "peoples_list": False,  # Can see shared connections only
                "full_profile": True
            },
            TrustTier.CHILL: {
                "name": True,
                "username": True,
                "bio": True,
                "avatar": True,
                "contact_info": False,
                "peoples_list": False,
                "full_profile": False
            },
            TrustTier.ALRIGHT: {
                "name": True,
                "username": True,
                "bio": False,  # Limited bio
                "avatar": True,
                "contact_info": False,
                "peoples_list": False,
                "full_profile": False
            },
            TrustTier.OTHERS: {
                "name": True,
                "username": True,
                "bio": False,
                "avatar": True,
                "contact_info": False,
                "peoples_list": False,
                "full_profile": False
            },
            TrustTier.OTHERS_SAFE_MODE: {
                "name": False,  # Shows "Limited Profile"
                "username": False,
                "bio": False,
                "avatar": False,
                "contact_info": False,
                "peoples_list": False,
                "full_profile": False
            },
            TrustTier.BLOCKED: {
                "name": False,
                "username": False,
                "bio": False,
                "avatar": False,
                "contact_info": False,
                "peoples_list": False,
                "full_profile": False
            },
        }
        
        try:
            return profile_matrix[TrustTier(viewer_tier)]
        except (ValueError, KeyError):
            # Default to minimal visibility
            return profile_matrix[TrustTier.OTHERS]
    
    @staticmethod
    def can_comment(commenter_tier: str, post_visibility: str) -> Dict[str, Any]:
        """
        Check if someone at a given trust tier can comment on a post.
        
        Args:
            commenter_tier: Trust tier of the commenter
            post_visibility: Visibility level of the post (PUBLIC, COOL, etc.)
        
        Returns:
            Dictionary with permission status:
            {
                "can_comment": bool,
                "requires_moderation": bool,
                "reason": str
            }
        """
        # BLOCKED cannot comment
        if commenter_tier == TrustTier.BLOCKED:
            return {
                "can_comment": False,
                "requires_moderation": False,
                "reason": "BLOCKED users cannot comment"
            }
        
        # SAFE MODE cannot comment
        if commenter_tier == TrustTier.OTHERS_SAFE_MODE:
            return {
                "can_comment": False,
                "requires_moderation": False,
                "reason": "Restricted - cannot comment"
            }
        
        # Check if they can see the post first
        if not TrustPermissionService.can_see_content(commenter_tier, post_visibility):
            return {
                "can_comment": False,
                "requires_moderation": False,
                "reason": "Cannot see post"
            }
        
        # Comment permissions by tier
        comment_permissions = {
            TrustTier.PEOPLES: {
                "can_comment": True,
                "requires_moderation": False,
                "reason": "PEOPLES can comment freely"
            },
            TrustTier.COOL: {
                "can_comment": True,
                "requires_moderation": False,
                "reason": "COOL can comment freely"
            },
            TrustTier.CHILL: {
                "can_comment": True,
                "requires_moderation": True,
                "reason": "CHILL comments may be moderated"
            },
            TrustTier.ALRIGHT: {
                "can_comment": post_visibility == ContentVisibility.PUBLIC,
                "requires_moderation": True,
                "reason": "ALRIGHT can comment on public posts (filtered)"
            },
            TrustTier.OTHERS: {
                "can_comment": post_visibility == ContentVisibility.PUBLIC,
                "requires_moderation": True,
                "reason": "OTHERS comments heavily moderated"
            },
        }
        
        try:
            return comment_permissions[TrustTier(commenter_tier)]
        except (ValueError, KeyError):
            return {
                "can_comment": False,
                "requires_moderation": False,
                "reason": "Invalid trust tier"
            }
    
    @staticmethod
    def should_notify(actor_tier: str, notification_type: str) -> bool:
        """
        Check if an action by someone at a given trust tier should trigger a notification.
        
        Args:
            actor_tier: Trust tier of the person taking the action
            notification_type: Type of notification (post, comment, reaction, mention, dm, invite)
        
        Returns:
            True if notification should be sent, False otherwise
        """
        # Notification matrix by tier and type
        notification_matrix = {
            TrustTier.PEOPLES: {
                "post": True,
                "comment": True,
                "reaction": True,
                "mention": True,
                "dm": True,
                "invite": True
            },
            TrustTier.COOL: {
                "post": True,
                "comment": True,
                "reaction": True,
                "mention": True,
                "dm": True,
                "invite": True  # May be filtered
            },
            TrustTier.CHILL: {
                "post": False,
                "comment": True,  # Only if they commented on your post
                "reaction": False,
                "mention": True,
                "dm": False,
                "invite": False
            },
            TrustTier.ALRIGHT: {
                "post": False,
                "comment": False,
                "reaction": False,
                "mention": False,
                "dm": False,
                "invite": False
            },
            TrustTier.OTHERS: {
                "post": False,
                "comment": False,
                "reaction": False,
                "mention": False,
                "dm": False,
                "invite": False
            },
            TrustTier.OTHERS_SAFE_MODE: {
                "post": False,
                "comment": False,
                "reaction": False,
                "mention": False,
                "dm": False,
                "invite": False
            },
            TrustTier.BLOCKED: {
                "post": False,
                "comment": False,
                "reaction": False,
                "mention": False,
                "dm": False,
                "invite": False
            },
        }
        
        try:
            tier_notifications = notification_matrix[TrustTier(actor_tier)]
            return tier_notifications.get(notification_type, False)
        except (ValueError, KeyError):
            return False
    
    @staticmethod
    def get_tier_display_name(tier: str) -> str:
        """Get human-readable display name for a trust tier"""
        display_names = {
            TrustTier.PEOPLES: "My Peoples",
            TrustTier.COOL: "Cool",
            TrustTier.CHILL: "Chill",
            TrustTier.ALRIGHT: "Alright",
            TrustTier.OTHERS: "Others",
            TrustTier.OTHERS_SAFE_MODE: "Others — Safe Mode",
            TrustTier.BLOCKED: "Blocked"
        }
        try:
            return display_names[TrustTier(tier)]
        except (ValueError, KeyError):
            return "Unknown"
    
    @staticmethod
    def get_tier_description(tier: str) -> str:
        """Get description of what a trust tier means"""
        descriptions = {
            TrustTier.PEOPLES: "Your closest circle — family, best friends, trusted community",
            TrustTier.COOL: "Friends and trusted colleagues you know well",
            TrustTier.CHILL: "Acquaintances and new connections you're getting to know",
            TrustTier.ALRIGHT: "People you've interacted with, casual connections",
            TrustTier.OTHERS: "Everyone else — strangers and unclassified",
            TrustTier.OTHERS_SAFE_MODE: "Limited interaction for protection",
            TrustTier.BLOCKED: "No interaction — completely blocked"
        }
        try:
            return descriptions[TrustTier(tier)]
        except (ValueError, KeyError):
            return "Unknown trust level"
    
    @staticmethod
    def get_full_permissions_with_override(
        viewer_tier: str,
        mutual_peoples: bool = False
    ) -> Dict[str, Any]:
        """
        Get full permission set with Founder Rule A (Peoples Override) applied.
        
        **Founder Rule A**: If both users have each other in PEOPLES tier,
        all restrictions are lifted (maximum trust).
        
        Args:
            viewer_tier: Trust tier of the viewer
            mutual_peoples: Whether both users have each other as PEOPLES
        
        Returns:
            Dictionary with all permission flags and details
        """
        # Founder Rule A: Mutual PEOPLES overrides everything
        if mutual_peoples:
            return {
                "can_see_content": True,
                "can_send_dm": True,
                "requires_dm_approval": False,
                "can_comment": True,
                "can_see_profile": True,
                "full_profile_visible": True,
                "should_notify": True,
                "tier_applied": "PEOPLES",
                "override_applied": "MUTUAL_PEOPLES_OVERRIDE",
                "reason": "Mutual PEOPLES - maximum trust (Founder Rule A)"
            }
        
        # Normal tier-based permissions
        dm_permission = TrustPermissionService.can_send_dm(viewer_tier)
        profile_visibility = TrustPermissionService.get_profile_visibility(viewer_tier)
        
        return {
            "can_see_content": TrustPermissionService.can_see_content(viewer_tier, "PUBLIC"),
            "can_send_dm": dm_permission["can_send"],
            "requires_dm_approval": dm_permission["requires_approval"],
            "can_comment": viewer_tier not in [TrustTier.BLOCKED, TrustTier.OTHERS_SAFE_MODE],
            "can_see_profile": profile_visibility["name"],  # Basic visibility
            "full_profile_visible": profile_visibility["full_profile"],
            "should_notify": TrustPermissionService.should_notify(viewer_tier, "post"),
            "tier_applied": viewer_tier,
            "override_applied": None,
            "reason": f"Standard {viewer_tier} tier permissions"
        }


# Convenience functions
def can_see_content(viewer_tier: str, content_visibility: str) -> bool:
    """Check if viewer can see content"""
    return TrustPermissionService.can_see_content(viewer_tier, content_visibility)


def can_send_dm(sender_tier: str) -> Dict[str, Any]:
    """Check if sender can DM"""
    return TrustPermissionService.can_send_dm(sender_tier)


def get_profile_visibility(viewer_tier: str) -> Dict[str, bool]:
    """Get profile visibility for viewer"""
    return TrustPermissionService.get_profile_visibility(viewer_tier)


def can_comment(commenter_tier: str, post_visibility: str) -> Dict[str, Any]:
    """Check if commenter can comment"""
    return TrustPermissionService.can_comment(commenter_tier, post_visibility)


def should_notify(actor_tier: str, notification_type: str) -> bool:
    """Check if action should trigger notification"""
    return TrustPermissionService.should_notify(actor_tier, notification_type)
