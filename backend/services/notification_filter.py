"""
Notification Filter Service - Phase C Circle Trust Order
Implements tier-based notification filtering with batching

Founder Decisions (Locked):
- PEOPLES: Immediate, no batching
- COOL: Immediate, optional grouping
- CHILL: 5-minute batching
- ALRIGHT: 1-hour batching
- OTHERS: Daily digest
- SAFE MODE/BLOCKED: No notifications
- NO user exceptions - batching is strict and tier-based
"""

from typing import Optional, List, Dict, Any
from datetime import datetime, timezone, timedelta
from enum import Enum
import logging

logger = logging.getLogger(__name__)


class NotificationPriority(str, Enum):
    """Notification priority levels by trust tier"""
    CRITICAL = "critical"       # PEOPLES - Immediate
    HIGH = "high"               # COOL - Immediate/grouped
    MEDIUM = "medium"           # CHILL - 5 min batch
    LOW = "low"                 # ALRIGHT - 1 hour batch
    MINIMAL = "minimal"         # OTHERS - Daily digest
    NONE = "none"               # SAFE MODE/BLOCKED


class NotificationBatchInterval(str, Enum):
    """Batch interval configuration"""
    IMMEDIATE = "immediate"     # 0 seconds
    FIVE_MINUTES = "5min"       # 300 seconds
    ONE_HOUR = "1hour"          # 3600 seconds
    DAILY = "daily"             # 86400 seconds


# Batch interval in seconds
BATCH_INTERVALS = {
    NotificationBatchInterval.IMMEDIATE: 0,
    NotificationBatchInterval.FIVE_MINUTES: 300,
    NotificationBatchInterval.ONE_HOUR: 3600,
    NotificationBatchInterval.DAILY: 86400,
}


class NotificationFilterService:
    """Service for filtering and batching notifications by trust tier"""
    
    # Tier -> Priority mapping (Founder-approved)
    TIER_PRIORITY_MAP = {
        "PEOPLES": NotificationPriority.CRITICAL,
        "COOL": NotificationPriority.HIGH,
        "CHILL": NotificationPriority.MEDIUM,
        "ALRIGHT": NotificationPriority.LOW,
        "OTHERS": NotificationPriority.MINIMAL,
        "OTHERS_SAFE_MODE": NotificationPriority.NONE,
        "BLOCKED": NotificationPriority.NONE,
    }
    
    # Priority -> Batch interval mapping (Founder-approved)
    PRIORITY_BATCH_MAP = {
        NotificationPriority.CRITICAL: NotificationBatchInterval.IMMEDIATE,
        NotificationPriority.HIGH: NotificationBatchInterval.IMMEDIATE,
        NotificationPriority.MEDIUM: NotificationBatchInterval.FIVE_MINUTES,
        NotificationPriority.LOW: NotificationBatchInterval.ONE_HOUR,
        NotificationPriority.MINIMAL: NotificationBatchInterval.DAILY,
        NotificationPriority.NONE: None,  # No notifications
    }
    
    @staticmethod
    def get_notification_priority(actor_tier: str) -> str:
        """
        Get notification priority for an actor's trust tier.
        
        Args:
            actor_tier: Trust tier of the user performing the action
        
        Returns:
            Notification priority level (critical, high, medium, low, minimal, none)
        """
        return NotificationFilterService.TIER_PRIORITY_MAP.get(
            actor_tier,
            NotificationPriority.MINIMAL  # Default to minimal for unknown tiers
        )
    
    @staticmethod
    def get_batch_interval(priority: str) -> Optional[str]:
        """
        Get batch interval for a notification priority.
        
        Args:
            priority: Notification priority
        
        Returns:
            Batch interval (immediate, 5min, 1hour, daily) or None if no notifications
        """
        return NotificationFilterService.PRIORITY_BATCH_MAP.get(
            NotificationPriority(priority),
            NotificationBatchInterval.IMMEDIATE
        )
    
    @staticmethod
    def get_batch_interval_seconds(batch_interval: str) -> int:
        """
        Get batch interval in seconds.
        
        Args:
            batch_interval: Batch interval (immediate, 5min, 1hour, daily)
        
        Returns:
            Interval in seconds
        """
        return BATCH_INTERVALS.get(
            NotificationBatchInterval(batch_interval),
            0
        )
    
    @staticmethod
    def should_notify(
        actor_tier: str,
        notification_type: str,
        mutual_peoples: bool = False
    ) -> Dict[str, Any]:
        """
        Check if a notification should be sent based on trust tier.
        
        Founder Rule A: Mutual PEOPLES override - always notify immediately
        
        Args:
            actor_tier: Trust tier of the user performing the action
            notification_type: Type of notification (post, comment, dm, etc.)
            mutual_peoples: Whether mutual PEOPLES relationship exists
        
        Returns:
            Dictionary with notification decision:
            {
                "should_notify": bool,
                "priority": str,
                "batch_interval": str,
                "batch_interval_seconds": int,
                "send_immediately": bool,
                "reason": str
            }
        """
        # Founder Rule A: Mutual PEOPLES override
        if mutual_peoples:
            return {
                "should_notify": True,
                "priority": NotificationPriority.CRITICAL,
                "batch_interval": NotificationBatchInterval.IMMEDIATE,
                "batch_interval_seconds": 0,
                "send_immediately": True,
                "reason": "Mutual PEOPLES - immediate notification (Founder Rule A)"
            }
        
        # Get priority for actor's tier
        priority = NotificationFilterService.get_notification_priority(actor_tier)
        
        # Check if notifications are allowed
        if priority == NotificationPriority.NONE:
            return {
                "should_notify": False,
                "priority": priority,
                "batch_interval": None,
                "batch_interval_seconds": 0,
                "send_immediately": False,
                "reason": f"{actor_tier} tier does not trigger notifications"
            }
        
        # Get batch interval
        batch_interval = NotificationFilterService.get_batch_interval(priority)
        batch_seconds = NotificationFilterService.get_batch_interval_seconds(batch_interval)
        
        # Determine if immediate
        send_immediately = batch_seconds == 0
        
        return {
            "should_notify": True,
            "priority": priority,
            "batch_interval": batch_interval,
            "batch_interval_seconds": batch_seconds,
            "send_immediately": send_immediately,
            "reason": f"{actor_tier} tier: {priority} priority, {batch_interval} batching"
        }
    
    @staticmethod
    def calculate_next_batch_time(
        priority: str,
        current_time: Optional[datetime] = None
    ) -> datetime:
        """
        Calculate the next batch delivery time for a notification priority.
        
        Args:
            priority: Notification priority
            current_time: Current time (defaults to now)
        
        Returns:
            Datetime for next batch delivery
        """
        if current_time is None:
            current_time = datetime.now(timezone.utc)
        
        batch_interval = NotificationFilterService.get_batch_interval(priority)
        
        if batch_interval == NotificationBatchInterval.IMMEDIATE:
            return current_time
        
        batch_seconds = NotificationFilterService.get_batch_interval_seconds(batch_interval)
        
        # Calculate next batch time
        if batch_interval == NotificationBatchInterval.DAILY:
            # Daily digest at 9 AM UTC
            next_batch = current_time.replace(hour=9, minute=0, second=0, microsecond=0)
            if next_batch <= current_time:
                next_batch += timedelta(days=1)
        else:
            # Round up to next interval boundary
            next_batch = current_time + timedelta(seconds=batch_seconds)
        
        return next_batch
    
    @staticmethod
    def group_notifications_by_priority(
        notifications: List[Dict[str, Any]]
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Group notifications by priority for batching.
        
        Args:
            notifications: List of notification dictionaries
        
        Returns:
            Dictionary of {priority: [notifications]}
        """
        grouped = {
            NotificationPriority.CRITICAL: [],
            NotificationPriority.HIGH: [],
            NotificationPriority.MEDIUM: [],
            NotificationPriority.LOW: [],
            NotificationPriority.MINIMAL: [],
        }
        
        for notif in notifications:
            priority = notif.get("priority", NotificationPriority.MINIMAL)
            if priority in grouped:
                grouped[priority].append(notif)
        
        return grouped
    
    @staticmethod
    def should_group_notifications(priority: str) -> bool:
        """
        Check if notifications at this priority should be grouped/collapsed.
        
        COOL tier has optional grouping.
        CHILL/ALRIGHT/OTHERS are batched and grouped.
        
        Args:
            priority: Notification priority
        
        Returns:
            True if should group, False if individual notifications
        """
        grouping_map = {
            NotificationPriority.CRITICAL: False,  # PEOPLES - individual
            NotificationPriority.HIGH: True,       # COOL - optional grouping
            NotificationPriority.MEDIUM: True,     # CHILL - grouped
            NotificationPriority.LOW: True,        # ALRIGHT - collapsed summary
            NotificationPriority.MINIMAL: True,    # OTHERS - collapsed summary
        }
        
        return grouping_map.get(NotificationPriority(priority), False)
    
    @staticmethod
    def format_batched_notification(
        notifications: List[Dict[str, Any]],
        priority: str
    ) -> Dict[str, Any]:
        """
        Format a batch of notifications into a single notification.
        
        For COOL tier: Group similar notifications
        For CHILL/ALRIGHT/OTHERS: Collapse into summary
        
        Args:
            notifications: List of notifications to batch
            priority: Priority level
        
        Returns:
            Single formatted notification representing the batch
        """
        if not notifications:
            return None
        
        count = len(notifications)
        
        # Group by type
        by_type = {}
        for notif in notifications:
            notif_type = notif.get("type", "unknown")
            if notif_type not in by_type:
                by_type[notif_type] = []
            by_type[notif_type].append(notif)
        
        # Format based on priority
        if priority == NotificationPriority.HIGH:
            # COOL - Optional grouping (e.g., "3 people liked your post")
            summary = []
            for notif_type, items in by_type.items():
                if len(items) == 1:
                    summary.append(items[0].get("message", ""))
                else:
                    summary.append(f"{len(items)} {notif_type} notifications")
            
            return {
                "type": "grouped",
                "priority": priority,
                "count": count,
                "summary": " • ".join(summary),
                "notifications": notifications[:5],  # Show top 5
                "has_more": count > 5
            }
        
        elif priority in [NotificationPriority.MEDIUM, NotificationPriority.LOW]:
            # CHILL/ALRIGHT - Batched summary
            return {
                "type": "batched",
                "priority": priority,
                "count": count,
                "summary": f"You have {count} new notifications",
                "by_type": {k: len(v) for k, v in by_type.items()},
                "notifications": notifications[:3],  # Preview top 3
                "has_more": count > 3
            }
        
        else:
            # OTHERS - Daily digest (very collapsed)
            return {
                "type": "digest",
                "priority": priority,
                "count": count,
                "summary": f"Daily digest: {count} notifications",
                "by_type": {k: len(v) for k, v in by_type.items()},
                "has_more": True
            }


# Convenience functions
def should_notify(
    actor_tier: str,
    notification_type: str,
    mutual_peoples: bool = False
) -> Dict[str, Any]:
    """Check if notification should be sent"""
    return NotificationFilterService.should_notify(actor_tier, notification_type, mutual_peoples)


def get_notification_priority(actor_tier: str) -> str:
    """Get notification priority for tier"""
    return NotificationFilterService.get_notification_priority(actor_tier)
