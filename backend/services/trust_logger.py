"""
Circle Trust Order - Shadow Mode Logger
Logs permission checks without enforcing them (Phase A)

This service logs what WOULD be blocked by trust rules without actually blocking.
Used for safe rollout and edge case detection.
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime, timezone
from collections import defaultdict
import json

logger = logging.getLogger(__name__)


class TrustPermissionLogger:
    """
    Logger for trust permission checks in shadow mode
    """
    
    def __init__(self):
        # In-memory stats (for quick reporting)
        self.stats = {
            "feed_checks": defaultdict(int),
            "dm_checks": defaultdict(int),
            "profile_checks": defaultdict(int),
            "comment_checks": defaultdict(int),
            "notification_checks": defaultdict(int),
            "total_checks": 0,
            "would_block": 0,
            "would_allow": 0,
            "would_require_approval": 0
        }
    
    def log_permission_check(
        self,
        check_type: str,
        viewer_tier: str,
        target_tier: Optional[str],
        action: str,
        decision: str,
        details: Optional[Dict[str, Any]] = None
    ):
        """
        Log a permission check
        
        Args:
            check_type: Type of check (feed, dm, profile, comment, notification)
            viewer_tier: Trust tier of the viewer/actor
            target_tier: Trust tier of the target (if applicable)
            action: Action attempted (view_post, send_dm, view_profile, etc.)
            decision: What trust engine decided (allow, deny, require_approval)
            details: Additional context (post_id, content_visibility, etc.)
        """
        # Update stats
        self.stats[f"{check_type}_checks"][viewer_tier] += 1
        self.stats["total_checks"] += 1
        
        if decision == "deny":
            self.stats["would_block"] += 1
        elif decision == "allow":
            self.stats["would_allow"] += 1
        elif decision == "require_approval":
            self.stats["would_require_approval"] += 1
        
        # Create log entry
        log_entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "check_type": check_type,
            "viewer_tier": viewer_tier,
            "target_tier": target_tier,
            "action": action,
            "decision": decision,
            "details": details or {}
        }
        
        # Log to file (INFO level for allows, WARNING for denies)
        if decision == "deny":
            logger.warning(f"[SHADOW MODE] Would BLOCK: {json.dumps(log_entry)}")
        elif decision == "require_approval":
            logger.info(f"[SHADOW MODE] Would REQUIRE APPROVAL: {json.dumps(log_entry)}")
        else:
            logger.debug(f"[SHADOW MODE] Would ALLOW: {json.dumps(log_entry)}")
    
    def get_stats(self) -> Dict[str, Any]:
        """Get current statistics"""
        return dict(self.stats)
    
    def reset_stats(self):
        """Reset statistics (for testing)"""
        self.stats = {
            "feed_checks": defaultdict(int),
            "dm_checks": defaultdict(int),
            "profile_checks": defaultdict(int),
            "comment_checks": defaultdict(int),
            "notification_checks": defaultdict(int),
            "total_checks": 0,
            "would_block": 0,
            "would_allow": 0,
            "would_require_approval": 0
        }


# Global logger instance
_trust_logger: Optional[TrustPermissionLogger] = None


def get_trust_logger() -> TrustPermissionLogger:
    """Get or create trust permission logger"""
    global _trust_logger
    if _trust_logger is None:
        _trust_logger = TrustPermissionLogger()
    return _trust_logger


def log_feed_check(viewer_tier: str, content_visibility: str, decision: str, details: Optional[Dict] = None):
    """Log a feed visibility check"""
    logger = get_trust_logger()
    logger.log_permission_check(
        check_type="feed",
        viewer_tier=viewer_tier,
        target_tier=None,
        action=f"view_{content_visibility}_content",
        decision=decision,
        details=details
    )


def log_dm_check(sender_tier: str, recipient_tier: str, decision: str, details: Optional[Dict] = None):
    """Log a DM permission check"""
    logger = get_trust_logger()
    logger.log_permission_check(
        check_type="dm",
        viewer_tier=sender_tier,
        target_tier=recipient_tier,
        action="send_dm",
        decision=decision,
        details=details
    )


def log_profile_check(viewer_tier: str, profile_owner_tier: str, fields_visible: Dict[str, bool], details: Optional[Dict] = None):
    """Log a profile visibility check"""
    logger = get_trust_logger()
    decision = "allow" if fields_visible.get("full_profile") else "partial"
    logger.log_permission_check(
        check_type="profile",
        viewer_tier=viewer_tier,
        target_tier=profile_owner_tier,
        action="view_profile",
        decision=decision,
        details={**(details or {}), "fields_visible": fields_visible}
    )


def log_comment_check(commenter_tier: str, post_visibility: str, decision: str, details: Optional[Dict] = None):
    """Log a comment permission check"""
    logger = get_trust_logger()
    logger.log_permission_check(
        check_type="comment",
        viewer_tier=commenter_tier,
        target_tier=None,
        action=f"comment_on_{post_visibility}_post",
        decision=decision,
        details=details
    )


def log_notification_check(actor_tier: str, notification_type: str, decision: str, details: Optional[Dict] = None):
    """Log a notification permission check"""
    logger = get_trust_logger()
    logger.log_permission_check(
        check_type="notification",
        viewer_tier=actor_tier,
        target_tier=None,
        action=f"notify_{notification_type}",
        decision=decision,
        details=details
    )


def generate_shadow_report() -> Dict[str, Any]:
    """
    Generate a shadow mode report
    
    Returns:
        Dictionary with statistics and insights
    """
    logger = get_trust_logger()
    stats = logger.get_stats()
    
    report = {
        "summary": {
            "total_checks": stats["total_checks"],
            "would_allow": stats["would_allow"],
            "would_block": stats["would_block"],
            "would_require_approval": stats["would_require_approval"],
            "block_rate": round(stats["would_block"] / max(stats["total_checks"], 1) * 100, 2)
        },
        "by_check_type": {
            "feed": dict(stats["feed_checks"]),
            "dm": dict(stats["dm_checks"]),
            "profile": dict(stats["profile_checks"]),
            "comment": dict(stats["comment_checks"]),
            "notification": dict(stats["notification_checks"])
        },
        "insights": []
    }
    
    # Generate insights
    if stats["would_block"] > stats["total_checks"] * 0.5:
        report["insights"].append("⚠️  HIGH BLOCK RATE: Over 50% of actions would be blocked. Review tier distribution.")
    
    if stats["dm_checks"]["BLOCKED"] > 0:
        report["insights"].append(f"✅ BLOCKED users attempted {stats['dm_checks']['BLOCKED']} DMs (would be prevented)")
    
    if stats["dm_checks"]["OTHERS"] > 0:
        report["insights"].append(f"ℹ️  OTHERS tier attempted {stats['dm_checks']['OTHERS']} DMs (would be blocked)")
    
    if stats["would_require_approval"] > 0:
        report["insights"].append(f"📋 {stats['would_require_approval']} actions would require approval (COOL/CHILL DMs)")
    
    return report
