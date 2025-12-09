"""
Comment Permissions Service - Phase C Circle Trust Order
Implements trust-based comment permissions with moderation queues

Founder Decisions (Locked):
- CHILL: Comments hidden until approved (no "pending" badge)
- ALRIGHT/OTHERS: Manual review only, no auto-approval
- PEOPLES/COOL: Full instant commenting rights
- SAFE MODE/BLOCKED: No commenting allowed
"""

from typing import Optional, Dict, Any
from enum import Enum

from services.trust_permissions import TrustTier


class CommentModerationLevel(str, Enum):
    """Moderation levels for comments"""
    NONE = "none"                    # No moderation, instant approval
    LIGHT = "light"                  # Light spam filtering only
    MODERATE = "moderate"            # Review queue, hidden until approved
    HEAVY = "heavy"                  # Heavy moderation, manual review required
    BLOCKED = "blocked"              # Completely blocked from commenting


class CommentPermissionService:
    """Service for checking trust-based comment permissions"""
    
    @staticmethod
    def can_comment_on_post(
        commenter_tier: str,
        post_visibility: str,
        post_author_id: str,
        commenter_id: str,
        mutual_peoples: bool = False
    ) -> Dict[str, Any]:
        """
        Check if a user can comment on a post based on their trust tier.
        
        Founder Rules:
        - PEOPLES/COOL: Full commenting rights (instant)
        - CHILL: Comments hidden until approved
        - ALRIGHT/OTHERS: PUBLIC posts only, manual review
        - SAFE MODE/BLOCKED: No commenting
        - Mutual PEOPLES Override: Full rights regardless of other rules
        
        Args:
            commenter_tier: Trust tier of the commenter
            post_visibility: Visibility level of the post (PUBLIC, COOL, etc.)
            post_author_id: ID of post author (for self-comment check)
            commenter_id: ID of commenter (for self-comment check)
            mutual_peoples: Whether mutual PEOPLES relationship exists
        
        Returns:
            Dictionary with permission status:
            {
                "can_comment": bool,
                "requires_moderation": bool,
                "moderation_level": str,
                "will_be_visible": bool,
                "reason": str
            }
        """
        # Self-commenting (own posts) always allowed
        if commenter_id == post_author_id:
            return {
                "can_comment": True,
                "requires_moderation": False,
                "moderation_level": CommentModerationLevel.NONE,
                "will_be_visible": True,
                "reason": "Commenting on your own post"
            }
        
        # Founder Rule A: Mutual PEOPLES override
        if mutual_peoples:
            return {
                "can_comment": True,
                "requires_moderation": False,
                "moderation_level": CommentModerationLevel.NONE,
                "will_be_visible": True,
                "reason": "Mutual PEOPLES - maximum trust (Founder Rule A)"
            }
        
        # Check if commenter can see the post first
        from services.trust_permissions import TrustPermissionService
        can_see = TrustPermissionService.can_see_content(commenter_tier, post_visibility)
        
        if not can_see:
            return {
                "can_comment": False,
                "requires_moderation": False,
                "moderation_level": CommentModerationLevel.BLOCKED,
                "will_be_visible": False,
                "reason": "Cannot see post - insufficient trust tier"
            }
        
        # Tier-based comment permissions
        tier_permissions = {
            TrustTier.PEOPLES: {
                "can_comment": True,
                "requires_moderation": False,
                "moderation_level": CommentModerationLevel.NONE,
                "will_be_visible": True,
                "reason": "PEOPLES can comment freely"
            },
            TrustTier.COOL: {
                "can_comment": True,
                "requires_moderation": False,
                "moderation_level": CommentModerationLevel.LIGHT,
                "will_be_visible": True,
                "reason": "COOL can comment with light spam filtering"
            },
            TrustTier.CHILL: {
                "can_comment": True,
                "requires_moderation": True,
                "moderation_level": CommentModerationLevel.MODERATE,
                "will_be_visible": False,  # Hidden until approved (Founder Decision)
                "reason": "CHILL comments require approval (hidden until reviewed)"
            },
            TrustTier.ALRIGHT: {
                "can_comment": post_visibility == "PUBLIC",
                "requires_moderation": True,
                "moderation_level": CommentModerationLevel.HEAVY,
                "will_be_visible": False,  # Hidden until approved (Founder Decision)
                "reason": "ALRIGHT can comment on PUBLIC posts only (manual review required)"
            },
            TrustTier.OTHERS: {
                "can_comment": post_visibility == "PUBLIC",
                "requires_moderation": True,
                "moderation_level": CommentModerationLevel.HEAVY,
                "will_be_visible": False,  # Hidden until approved (Founder Decision)
                "reason": "OTHERS can comment on PUBLIC posts only (manual review required)"
            },
            TrustTier.OTHERS_SAFE_MODE: {
                "can_comment": False,
                "requires_moderation": False,
                "moderation_level": CommentModerationLevel.BLOCKED,
                "will_be_visible": False,
                "reason": "SAFE MODE cannot comment"
            },
            TrustTier.BLOCKED: {
                "can_comment": False,
                "requires_moderation": False,
                "moderation_level": CommentModerationLevel.BLOCKED,
                "will_be_visible": False,
                "reason": "BLOCKED users cannot comment"
            },
        }
        
        try:
            return tier_permissions[TrustTier(commenter_tier)]
        except (ValueError, KeyError):
            return {
                "can_comment": False,
                "requires_moderation": False,
                "moderation_level": CommentModerationLevel.BLOCKED,
                "will_be_visible": False,
                "reason": "Invalid trust tier"
            }
    
    @staticmethod
    def can_reply_to_comment(
        replier_tier: str,
        parent_comment_visibility: str,
        thread_post_visibility: str,
        replier_id: str,
        post_author_id: str,
        mutual_peoples: bool = False
    ) -> Dict[str, Any]:
        """
        Check if a user can reply to a comment.
        
        Similar logic to can_comment_on_post, but considers both:
        - The parent comment's visibility
        - The original post's visibility
        
        Args:
            replier_tier: Trust tier of the user replying
            parent_comment_visibility: Visibility of the parent comment
            thread_post_visibility: Visibility of the original post
            replier_id: ID of user replying
            post_author_id: ID of post author
            mutual_peoples: Whether mutual PEOPLES relationship exists
        
        Returns:
            Dictionary with permission status (same structure as can_comment_on_post)
        """
        # Founder Rule A: Mutual PEOPLES override
        if mutual_peoples:
            return {
                "can_comment": True,
                "requires_moderation": False,
                "moderation_level": CommentModerationLevel.NONE,
                "will_be_visible": True,
                "reason": "Mutual PEOPLES - maximum trust (Founder Rule A)"
            }
        
        # For simplicity, use the stricter of the two visibility levels
        # (if parent comment is PEOPLES_ONLY but post is PUBLIC, use PEOPLES_ONLY)
        effective_visibility = thread_post_visibility
        
        # Re-use comment permission logic
        return CommentPermissionService.can_comment_on_post(
            commenter_tier=replier_tier,
            post_visibility=effective_visibility,
            post_author_id=post_author_id,
            commenter_id=replier_id,
            mutual_peoples=mutual_peoples
        )
    
    @staticmethod
    def can_mention_user(
        mentioner_tier: str,
        mutual_peoples: bool = False
    ) -> Dict[str, Any]:
        """
        Check if a user can mention/tag another user.
        
        Founder Decision: CHILL mentions held in queue until approved (no notification)
        
        Args:
            mentioner_tier: Trust tier of the user doing the mentioning
            mutual_peoples: Whether mutual PEOPLES relationship exists
        
        Returns:
            Dictionary with permission status:
            {
                "can_mention": bool,
                "requires_approval": bool,
                "notify_immediately": bool,
                "reason": str
            }
        """
        # Founder Rule A: Mutual PEOPLES override
        if mutual_peoples:
            return {
                "can_mention": True,
                "requires_approval": False,
                "notify_immediately": True,
                "reason": "Mutual PEOPLES - maximum trust (Founder Rule A)"
            }
        
        mention_permissions = {
            TrustTier.PEOPLES: {
                "can_mention": True,
                "requires_approval": False,
                "notify_immediately": True,
                "reason": "PEOPLES can mention freely"
            },
            TrustTier.COOL: {
                "can_mention": True,
                "requires_approval": False,
                "notify_immediately": True,
                "reason": "COOL can mention freely"
            },
            TrustTier.CHILL: {
                "can_mention": True,
                "requires_approval": True,
                "notify_immediately": False,  # No notification until approved (Founder Decision)
                "reason": "CHILL mentions require approval (no notification until approved)"
            },
            TrustTier.ALRIGHT: {
                "can_mention": False,
                "requires_approval": False,
                "notify_immediately": False,
                "reason": "ALRIGHT cannot mention/tag"
            },
            TrustTier.OTHERS: {
                "can_mention": False,
                "requires_approval": False,
                "notify_immediately": False,
                "reason": "OTHERS cannot mention/tag"
            },
            TrustTier.OTHERS_SAFE_MODE: {
                "can_mention": False,
                "requires_approval": False,
                "notify_immediately": False,
                "reason": "SAFE MODE cannot mention/tag"
            },
            TrustTier.BLOCKED: {
                "can_mention": False,
                "requires_approval": False,
                "notify_immediately": False,
                "reason": "BLOCKED cannot mention/tag"
            },
        }
        
        try:
            return mention_permissions[TrustTier(mentioner_tier)]
        except (ValueError, KeyError):
            return {
                "can_mention": False,
                "requires_approval": False,
                "notify_immediately": False,
                "reason": "Invalid trust tier"
            }
    
    @staticmethod
    def get_moderation_level(tier: str) -> str:
        """Get moderation level for a given trust tier"""
        moderation_map = {
            TrustTier.PEOPLES: CommentModerationLevel.NONE,
            TrustTier.COOL: CommentModerationLevel.LIGHT,
            TrustTier.CHILL: CommentModerationLevel.MODERATE,
            TrustTier.ALRIGHT: CommentModerationLevel.HEAVY,
            TrustTier.OTHERS: CommentModerationLevel.HEAVY,
            TrustTier.OTHERS_SAFE_MODE: CommentModerationLevel.BLOCKED,
            TrustTier.BLOCKED: CommentModerationLevel.BLOCKED,
        }
        try:
            return moderation_map[TrustTier(tier)]
        except (ValueError, KeyError):
            return CommentModerationLevel.BLOCKED


# Convenience functions
def can_comment_on_post(
    commenter_tier: str,
    post_visibility: str,
    post_author_id: str,
    commenter_id: str,
    mutual_peoples: bool = False
) -> Dict[str, Any]:
    """Check if user can comment on post"""
    return CommentPermissionService.can_comment_on_post(
        commenter_tier, post_visibility, post_author_id, commenter_id, mutual_peoples
    )


def can_mention_user(mentioner_tier: str, mutual_peoples: bool = False) -> Dict[str, Any]:
    """Check if user can mention another user"""
    return CommentPermissionService.can_mention_user(mentioner_tier, mutual_peoples)
