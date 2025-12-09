"""
Notification Filtering Tests - Phase C Circle Trust Order
Tests for trust-based notification filtering and batching

Founder Decisions Tested:
- PEOPLES: Immediate, no batching
- COOL: Immediate, optional grouping
- CHILL: 5-minute batching
- ALRIGHT: 1-hour batching
- OTHERS: Daily digest
- SAFE MODE/BLOCKED: No notifications
- NO user exceptions - strict tier-based batching
- Mutual PEOPLES Override: Immediate notification
"""

import pytest
from datetime import datetime, timezone, timedelta

from services.notification_filter import (
    NotificationFilterService,
    should_notify,
    get_notification_priority,
    NotificationPriority,
    NotificationBatchInterval,
    BATCH_INTERVALS
)
from db.relationships import (
    TIER_PEOPLES,
    TIER_COOL,
    TIER_CHILL,
    TIER_ALRIGHT,
    TIER_OTHERS,
    TIER_OTHERS_SAFE_MODE,
    TIER_BLOCKED
)


class TestNotificationPriority:
    """Test notification priority assignment by trust tier"""
    
    def test_peoples_critical_priority(self):
        """PEOPLES tier should have critical priority"""
        priority = get_notification_priority(TIER_PEOPLES)
        assert priority == NotificationPriority.CRITICAL
    
    def test_cool_high_priority(self):
        """COOL tier should have high priority"""
        priority = get_notification_priority(TIER_COOL)
        assert priority == NotificationPriority.HIGH
    
    def test_chill_medium_priority(self):
        """CHILL tier should have medium priority"""
        priority = get_notification_priority(TIER_CHILL)
        assert priority == NotificationPriority.MEDIUM
    
    def test_alright_low_priority(self):
        """ALRIGHT tier should have low priority"""
        priority = get_notification_priority(TIER_ALRIGHT)
        assert priority == NotificationPriority.LOW
    
    def test_others_minimal_priority(self):
        """OTHERS tier should have minimal priority"""
        priority = get_notification_priority(TIER_OTHERS)
        assert priority == NotificationPriority.MINIMAL
    
    def test_safe_mode_no_priority(self):
        """SAFE MODE should have no notification priority"""
        priority = get_notification_priority(TIER_OTHERS_SAFE_MODE)
        assert priority == NotificationPriority.NONE
    
    def test_blocked_no_priority(self):
        """BLOCKED should have no notification priority"""
        priority = get_notification_priority(TIER_BLOCKED)
        assert priority == NotificationPriority.NONE


class TestNotificationBatching:
    """Test batching intervals by trust tier"""
    
    def test_peoples_immediate_no_batching(self):
        """PEOPLES notifications should be immediate (Founder Decision)"""
        decision = should_notify(TIER_PEOPLES, "post")
        
        assert decision["should_notify"] is True
        assert decision["priority"] == NotificationPriority.CRITICAL
        assert decision["batch_interval"] == NotificationBatchInterval.IMMEDIATE
        assert decision["batch_interval_seconds"] == 0
        assert decision["send_immediately"] is True
    
    def test_cool_immediate_optional_grouping(self):
        """COOL notifications should be immediate with optional grouping (Founder Decision)"""
        decision = should_notify(TIER_COOL, "post")
        
        assert decision["should_notify"] is True
        assert decision["priority"] == NotificationPriority.HIGH
        assert decision["batch_interval"] == NotificationBatchInterval.IMMEDIATE
        assert decision["batch_interval_seconds"] == 0
        assert decision["send_immediately"] is True
    
    def test_chill_5min_batching(self):
        """CHILL notifications should batch every 5 minutes (Founder Decision)"""
        decision = should_notify(TIER_CHILL, "post")
        
        assert decision["should_notify"] is True
        assert decision["priority"] == NotificationPriority.MEDIUM
        assert decision["batch_interval"] == NotificationBatchInterval.FIVE_MINUTES
        assert decision["batch_interval_seconds"] == 300  # 5 minutes
        assert decision["send_immediately"] is False
    
    def test_alright_1hour_batching(self):
        """ALRIGHT notifications should batch every 1 hour (Founder Decision)"""
        decision = should_notify(TIER_ALRIGHT, "post")
        
        assert decision["should_notify"] is True
        assert decision["priority"] == NotificationPriority.LOW
        assert decision["batch_interval"] == NotificationBatchInterval.ONE_HOUR
        assert decision["batch_interval_seconds"] == 3600  # 1 hour
        assert decision["send_immediately"] is False
    
    def test_others_daily_digest(self):
        """OTHERS notifications should be daily digest (Founder Decision)"""
        decision = should_notify(TIER_OTHERS, "post")
        
        assert decision["should_notify"] is True
        assert decision["priority"] == NotificationPriority.MINIMAL
        assert decision["batch_interval"] == NotificationBatchInterval.DAILY
        assert decision["batch_interval_seconds"] == 86400  # 24 hours
        assert decision["send_immediately"] is False
    
    def test_safe_mode_no_notifications(self):
        """SAFE MODE should not send notifications (Founder Decision)"""
        decision = should_notify(TIER_OTHERS_SAFE_MODE, "post")
        
        assert decision["should_notify"] is False
        assert decision["priority"] == NotificationPriority.NONE
        assert decision["batch_interval"] is None
    
    def test_blocked_no_notifications(self):
        """BLOCKED should not send notifications (Founder Decision)"""
        decision = should_notify(TIER_BLOCKED, "post")
        
        assert decision["should_notify"] is False
        assert decision["priority"] == NotificationPriority.NONE
        assert decision["batch_interval"] is None


class TestMutualPeoplesOverride:
    """Test Founder Rule A: Mutual PEOPLES Override for notifications"""
    
    def test_mutual_peoples_immediate_notification(self):
        """Mutual PEOPLES should always get immediate notifications (Founder Rule A)"""
        # Even with low tier
        decision = should_notify(
            actor_tier=TIER_OTHERS,
            notification_type="post",
            mutual_peoples=True
        )
        
        assert decision["should_notify"] is True
        assert decision["priority"] == NotificationPriority.CRITICAL
        assert decision["send_immediately"] is True
        assert "mutual peoples" in decision["reason"].lower()
        assert "founder rule a" in decision["reason"].lower()
    
    def test_mutual_peoples_bypasses_blocked_tier(self):
        """Mutual PEOPLES should override even BLOCKED tier"""
        decision = should_notify(
            actor_tier=TIER_BLOCKED,
            notification_type="post",
            mutual_peoples=True
        )
        
        assert decision["should_notify"] is True
        assert decision["send_immediately"] is True


class TestBatchIntervalCalculations:
    """Test batch interval configurations"""
    
    def test_batch_intervals_match_founder_spec(self):
        """Batch intervals should match Founder specifications"""
        assert BATCH_INTERVALS[NotificationBatchInterval.IMMEDIATE] == 0
        assert BATCH_INTERVALS[NotificationBatchInterval.FIVE_MINUTES] == 300
        assert BATCH_INTERVALS[NotificationBatchInterval.ONE_HOUR] == 3600
        assert BATCH_INTERVALS[NotificationBatchInterval.DAILY] == 86400
    
    def test_next_batch_time_immediate(self):
        """Immediate notifications should have current time as next batch"""
        now = datetime.now(timezone.utc)
        next_batch = NotificationFilterService.calculate_next_batch_time(
            NotificationPriority.CRITICAL,
            now
        )
        
        assert next_batch == now
    
    def test_next_batch_time_5min(self):
        """5-minute batching should calculate next interval"""
        now = datetime.now(timezone.utc)
        next_batch = NotificationFilterService.calculate_next_batch_time(
            NotificationPriority.MEDIUM,
            now
        )
        
        # Should be 5 minutes from now
        expected = now + timedelta(seconds=300)
        assert next_batch >= expected - timedelta(seconds=1)
    
    def test_next_batch_time_daily(self):
        """Daily digest should be at 9 AM UTC"""
        now = datetime(2024, 12, 9, 10, 30, 0, tzinfo=timezone.utc)  # 10:30 AM
        next_batch = NotificationFilterService.calculate_next_batch_time(
            NotificationPriority.MINIMAL,
            now
        )
        
        # Should be next day at 9 AM
        assert next_batch.hour == 9
        assert next_batch.minute == 0
        assert next_batch > now


class TestNotificationGrouping:
    """Test notification grouping behavior"""
    
    def test_peoples_no_grouping(self):
        """PEOPLES notifications should not be grouped (individual)"""
        should_group = NotificationFilterService.should_group_notifications(
            NotificationPriority.CRITICAL
        )
        assert should_group is False
    
    def test_cool_optional_grouping(self):
        """COOL notifications should have optional grouping"""
        should_group = NotificationFilterService.should_group_notifications(
            NotificationPriority.HIGH
        )
        assert should_group is True
    
    def test_chill_grouped(self):
        """CHILL notifications should be grouped"""
        should_group = NotificationFilterService.should_group_notifications(
            NotificationPriority.MEDIUM
        )
        assert should_group is True
    
    def test_alright_collapsed_summary(self):
        """ALRIGHT notifications should be collapsed into summary"""
        should_group = NotificationFilterService.should_group_notifications(
            NotificationPriority.LOW
        )
        assert should_group is True
    
    def test_others_collapsed_summary(self):
        """OTHERS notifications should be collapsed into summary"""
        should_group = NotificationFilterService.should_group_notifications(
            NotificationPriority.MINIMAL
        )
        assert should_group is True


class TestBatchFormatting:
    """Test batch notification formatting"""
    
    def test_cool_grouped_format(self):
        """COOL tier should create grouped notifications"""
        notifications = [
            {"type": "like", "message": "User A liked your post"},
            {"type": "like", "message": "User B liked your post"},
            {"type": "comment", "message": "User C commented on your post"},
        ]
        
        batched = NotificationFilterService.format_batched_notification(
            notifications,
            NotificationPriority.HIGH
        )
        
        assert batched["type"] == "grouped"
        assert batched["count"] == 3
        assert "like" in batched["summary"].lower() or "comment" in batched["summary"].lower()
    
    def test_chill_batched_format(self):
        """CHILL tier should create batched summary"""
        notifications = [
            {"type": "like", "message": "User A liked your post"},
            {"type": "comment", "message": "User B commented on your post"},
        ]
        
        batched = NotificationFilterService.format_batched_notification(
            notifications,
            NotificationPriority.MEDIUM
        )
        
        assert batched["type"] == "batched"
        assert batched["count"] == 2
        assert "new notifications" in batched["summary"].lower()
        assert "by_type" in batched
    
    def test_others_digest_format(self):
        """OTHERS tier should create daily digest"""
        notifications = [
            {"type": "like", "message": "User A liked your post"},
            {"type": "like", "message": "User B liked your post"},
            {"type": "comment", "message": "User C commented on your post"},
        ]
        
        batched = NotificationFilterService.format_batched_notification(
            notifications,
            NotificationPriority.MINIMAL
        )
        
        assert batched["type"] == "digest"
        assert batched["count"] == 3
        assert "daily digest" in batched["summary"].lower()
        assert "by_type" in batched


class TestNoUserExceptions:
    """Test that batching is strict with NO user-level exceptions (Founder Decision)"""
    
    def test_chill_always_batches_no_exceptions(self):
        """CHILL tier should ALWAYS batch, no user exceptions"""
        # No mechanism to override batching should exist
        decision = should_notify(TIER_CHILL, "post")
        
        assert decision["batch_interval_seconds"] == 300
        assert decision["send_immediately"] is False
        
        # No way to make it immediate (except mutual PEOPLES)
    
    def test_alright_always_batches_no_exceptions(self):
        """ALRIGHT tier should ALWAYS batch, no user exceptions"""
        decision = should_notify(TIER_ALRIGHT, "post")
        
        assert decision["batch_interval_seconds"] == 3600
        assert decision["send_immediately"] is False


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
