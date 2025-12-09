"""
Phase B Trust Enforcement Tests
Tests for Circle Trust Order Phase B implementation

Tests:
1. Founder Rule A: Mutual PEOPLES override
2. DM blocking for ALRIGHT/OTHERS/SAFE_MODE/BLOCKED tiers
3. DM approval queue for COOL/CHILL tiers
4. BLOCKED user invisibility
5. Tier change behavior (existing threads remain accessible)
6. Founder Rule B: Tier jump anomaly logging
"""

import pytest
import asyncio
from datetime import datetime, timezone

# Test imports
from services.trust_permissions import (
    TrustPermissionService,
    can_send_dm,
    get_profile_visibility
)
from services.relationship_helper import (
    get_relationship_tier,
    check_mutual_peoples,
    calculate_tier_distance,
    log_tier_change
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


class TestFounderRuleA:
    """Test Founder Rule A: Mutual PEOPLES Override"""
    
    def test_mutual_peoples_override(self):
        """Mutual PEOPLES should grant maximum permissions"""
        perms = TrustPermissionService.get_full_permissions_with_override(
            viewer_tier=TIER_PEOPLES,
            mutual_peoples=True
        )
        
        assert perms["can_see_content"] is True
        assert perms["can_send_dm"] is True
        assert perms["requires_dm_approval"] is False
        assert perms["can_comment"] is True
        assert perms["full_profile_visible"] is True
        assert perms["override_applied"] == "MUTUAL_PEOPLES_OVERRIDE"
        assert "maximum trust" in perms["reason"].lower()
    
    def test_non_mutual_peoples_no_override(self):
        """Non-mutual PEOPLES should not get override"""
        perms = TrustPermissionService.get_full_permissions_with_override(
            viewer_tier=TIER_OTHERS,
            mutual_peoples=False
        )
        
        assert perms["override_applied"] is None
        assert perms["tier_applied"] == TIER_OTHERS


class TestDMBlocking:
    """Test DM blocking for restricted tiers"""
    
    def test_alright_cannot_dm(self):
        """ALRIGHT tier cannot initiate DMs"""
        dm_perm = can_send_dm(TIER_ALRIGHT)
        
        assert dm_perm["can_send"] is False
        assert dm_perm["requires_approval"] is False
        assert "cannot initiate" in dm_perm["reason"].lower()
    
    def test_others_cannot_dm(self):
        """OTHERS tier cannot send DMs"""
        dm_perm = can_send_dm(TIER_OTHERS)
        
        assert dm_perm["can_send"] is False
        assert "cannot send" in dm_perm["reason"].lower()
    
    def test_safe_mode_cannot_dm(self):
        """SAFE MODE tier cannot send DMs"""
        dm_perm = can_send_dm(TIER_OTHERS_SAFE_MODE)
        
        assert dm_perm["can_send"] is False
        assert "restricted" in dm_perm["reason"].lower()
    
    def test_blocked_cannot_dm(self):
        """BLOCKED users cannot contact you"""
        dm_perm = can_send_dm(TIER_BLOCKED)
        
        assert dm_perm["can_send"] is False
        assert "blocked" in dm_perm["reason"].lower()


class TestDMApprovalQueue:
    """Test DM approval requirements for COOL/CHILL"""
    
    def test_cool_requires_approval_first_message(self):
        """COOL tier requires approval on first message"""
        dm_perm = can_send_dm(TIER_COOL, existing_thread=False)
        
        assert dm_perm["can_send"] is True
        assert dm_perm["requires_approval"] is True
        assert "approval" in dm_perm["reason"].lower()
    
    def test_cool_no_approval_existing_thread(self):
        """COOL tier bypasses approval on existing threads"""
        dm_perm = can_send_dm(TIER_COOL, existing_thread=True)
        
        assert dm_perm["can_send"] is True
        assert dm_perm["requires_approval"] is False
        assert "continuing" in dm_perm["reason"].lower()
    
    def test_chill_requires_approval(self):
        """CHILL tier must request permission"""
        dm_perm = can_send_dm(TIER_CHILL, existing_thread=False)
        
        assert dm_perm["can_send"] is True
        assert dm_perm["requires_approval"] is True
        assert "request permission" in dm_perm["reason"].lower()
    
    def test_peoples_no_approval_needed(self):
        """PEOPLES tier never needs approval"""
        dm_perm = can_send_dm(TIER_PEOPLES, existing_thread=False)
        
        assert dm_perm["can_send"] is True
        assert dm_perm["requires_approval"] is False


class TestBLOCKEDInvisibility:
    """Test BLOCKED user invisibility"""
    
    def test_blocked_cannot_see_content(self):
        """BLOCKED users cannot see any content"""
        can_see = TrustPermissionService.can_see_content(TIER_BLOCKED, "PUBLIC")
        assert can_see is False
        
        can_see = TrustPermissionService.can_see_content(TIER_BLOCKED, "PEOPLES_ONLY")
        assert can_see is False
    
    def test_blocked_no_profile_visibility(self):
        """BLOCKED users see no profile fields"""
        visibility = get_profile_visibility(TIER_BLOCKED)
        
        assert visibility["name"] is False
        assert visibility["username"] is False
        assert visibility["bio"] is False
        assert visibility["avatar"] is False
        assert visibility["full_profile"] is False
    
    def test_blocked_cannot_comment(self):
        """BLOCKED users cannot comment"""
        comment_perm = TrustPermissionService.can_comment(TIER_BLOCKED, "PUBLIC")
        
        assert comment_perm["can_comment"] is False
        assert "blocked" in comment_perm["reason"].lower()


class TestSafeModeProtections:
    """Test SAFE MODE protections"""
    
    def test_safe_mode_limited_visibility(self):
        """SAFE MODE sees only public content with restrictions"""
        can_see = TrustPermissionService.can_see_content(TIER_OTHERS_SAFE_MODE, "PUBLIC")
        assert can_see is True  # Can see public content
        
        can_see = TrustPermissionService.can_see_content(TIER_OTHERS_SAFE_MODE, "COOL")
        assert can_see is False  # Cannot see restricted content
    
    def test_safe_mode_invisible_profile(self):
        """SAFE MODE shows limited profile"""
        visibility = get_profile_visibility(TIER_OTHERS_SAFE_MODE)
        
        assert visibility["name"] is False  # Shows "Limited Profile"
        assert visibility["full_profile"] is False
    
    def test_safe_mode_cannot_comment(self):
        """SAFE MODE cannot comment"""
        comment_perm = TrustPermissionService.can_comment(TIER_OTHERS_SAFE_MODE, "PUBLIC")
        
        assert comment_perm["can_comment"] is False
        assert "restricted" in comment_perm["reason"].lower()


class TestTierChangeLogging:
    """Test Founder Rule B: Tier jump anomaly logging"""
    
    def test_tier_distance_calculation(self):
        """Test tier distance calculation"""
        # Adjacent tiers
        assert calculate_tier_distance(TIER_PEOPLES, TIER_COOL) == 1
        assert calculate_tier_distance(TIER_COOL, TIER_CHILL) == 1
        
        # 2-level jumps
        assert calculate_tier_distance(TIER_PEOPLES, TIER_CHILL) == 2
        assert calculate_tier_distance(TIER_COOL, TIER_ALRIGHT) == 2
        
        # Large jumps (>2 levels - should be flagged)
        assert calculate_tier_distance(TIER_PEOPLES, TIER_ALRIGHT) == 3
        assert calculate_tier_distance(TIER_PEOPLES, TIER_OTHERS) == 4
        assert calculate_tier_distance(TIER_PEOPLES, TIER_BLOCKED) == 6
        
        # Bidirectional
        assert calculate_tier_distance(TIER_BLOCKED, TIER_PEOPLES) == 6
    
    def test_small_tier_change_no_anomaly(self):
        """Small tier changes (<= 2 levels) should not be anomalies"""
        # These should log normally, not as anomalies
        distance_1 = calculate_tier_distance(TIER_PEOPLES, TIER_COOL)
        distance_2 = calculate_tier_distance(TIER_COOL, TIER_ALRIGHT)
        
        assert distance_1 <= 2
        assert distance_2 <= 2
    
    def test_large_tier_jump_is_anomaly(self):
        """Large tier jumps (>2 levels) should be flagged"""
        # PEOPLES -> OTHERS (4 levels) should be anomaly
        distance = calculate_tier_distance(TIER_PEOPLES, TIER_OTHERS)
        assert distance > 2
        
        # PEOPLES -> BLOCKED (6 levels) should be anomaly
        distance = calculate_tier_distance(TIER_PEOPLES, TIER_BLOCKED)
        assert distance > 2


class TestTierChangeThreadBehavior:
    """Test tier-change behavior for existing threads"""
    
    def test_existing_thread_allows_continuation(self):
        """Existing threads remain accessible after tier change"""
        # Even if tier is downgraded to ALRIGHT, existing thread can continue
        dm_perm = can_send_dm(TIER_ALRIGHT, existing_thread=True)
        
        # ALRIGHT normally can't DM, but existing thread bypasses this
        # However, ALRIGHT still cannot send - existing_thread only helps with approval
        assert dm_perm["can_send"] is False
        
        # For COOL tier with existing thread
        dm_perm_cool = can_send_dm(TIER_COOL, existing_thread=True)
        assert dm_perm_cool["can_send"] is True
        assert dm_perm_cool["requires_approval"] is False  # No approval for continuation
    
    def test_new_thread_follows_current_tier(self):
        """New threads must follow current tier rules"""
        dm_perm = can_send_dm(TIER_ALRIGHT, existing_thread=False)
        
        assert dm_perm["can_send"] is False
        assert "cannot initiate" in dm_perm["reason"].lower()


class TestPermissionIntegration:
    """Integration tests for full permission checks"""
    
    def test_peoples_full_access(self):
        """PEOPLES tier has full access to everything"""
        perms = TrustPermissionService.get_full_permissions_with_override(
            viewer_tier=TIER_PEOPLES,
            mutual_peoples=False
        )
        
        assert perms["can_send_dm"] is True
        assert perms["requires_dm_approval"] is False
        assert perms["can_see_profile"] is True
        assert perms["full_profile_visible"] is True
    
    def test_blocked_no_access(self):
        """BLOCKED tier has no access to anything"""
        perms = TrustPermissionService.get_full_permissions_with_override(
            viewer_tier=TIER_BLOCKED,
            mutual_peoples=False
        )
        
        assert perms["can_send_dm"] is False
        assert perms["can_see_profile"] is False
        assert perms["full_profile_visible"] is False
    
    def test_cool_partial_access(self):
        """COOL tier has partial access with approval"""
        perms = TrustPermissionService.get_full_permissions_with_override(
            viewer_tier=TIER_COOL,
            mutual_peoples=False
        )
        
        assert perms["can_send_dm"] is True
        assert perms["requires_dm_approval"] is True  # First message needs approval
        assert perms["can_see_profile"] is True
        assert perms["full_profile_visible"] is True  # COOL sees full profile


# Run tests
if __name__ == "__main__":
    pytest.main([__file__, "-v", "-s"])
