"""
Test suite for Circle Trust Order Permission Service
Tests all 7-tier permission rules
"""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from services.trust_permissions import (
    TrustPermissionService,
    TrustTier,
    ContentVisibility,
    can_see_content,
    can_send_dm,
    get_profile_visibility,
    can_comment,
    should_notify
)


def test_feed_visibility():
    """Test feed visibility permissions"""
    print("\n=== Testing Feed Visibility ===")
    
    # PEOPLES can see everything
    assert can_see_content("PEOPLES", "PUBLIC") == True
    assert can_see_content("PEOPLES", "COOL") == True
    assert can_see_content("PEOPLES", "PEOPLES_ONLY") == True
    print("✅ PEOPLES can see all content")
    
    # COOL can see PUBLIC and COOL
    assert can_see_content("COOL", "PUBLIC") == True
    assert can_see_content("COOL", "COOL") == True
    assert can_see_content("COOL", "PEOPLES_ONLY") == False
    print("✅ COOL visibility correct")
    
    # CHILL can see PUBLIC, COOL, CHILL
    assert can_see_content("CHILL", "PUBLIC") == True
    assert can_see_content("CHILL", "CHILL") == True
    assert can_see_content("CHILL", "COOL") == False
    print("✅ CHILL visibility correct")
    
    # OTHERS can only see PUBLIC
    assert can_see_content("OTHERS", "PUBLIC") == True
    assert can_see_content("OTHERS", "COOL") == False
    print("✅ OTHERS visibility correct")
    
    # BLOCKED cannot see anything
    assert can_see_content("BLOCKED", "PUBLIC") == False
    assert can_see_content("BLOCKED", "COOL") == False
    print("✅ BLOCKED cannot see content")


def test_dm_permissions():
    """Test DM permissions"""
    print("\n=== Testing DM Permissions ===")
    
    # PEOPLES can always DM
    dm_result = can_send_dm("PEOPLES")
    assert dm_result["can_send"] == True
    assert dm_result["requires_approval"] == False
    print(f"✅ PEOPLES: {dm_result['reason']}")
    
    # COOL can DM with possible approval
    dm_result = can_send_dm("COOL")
    assert dm_result["can_send"] == True
    assert dm_result["requires_approval"] == True
    print(f"✅ COOL: {dm_result['reason']}")
    
    # CHILL needs approval
    dm_result = can_send_dm("CHILL")
    assert dm_result["can_send"] == False
    assert dm_result["requires_approval"] == True
    print(f"✅ CHILL: {dm_result['reason']}")
    
    # OTHERS cannot DM
    dm_result = can_send_dm("OTHERS")
    assert dm_result["can_send"] == False
    print(f"✅ OTHERS: {dm_result['reason']}")
    
    # BLOCKED cannot DM
    dm_result = can_send_dm("BLOCKED")
    assert dm_result["can_send"] == False
    print(f"✅ BLOCKED: {dm_result['reason']}")


def test_profile_visibility():
    """Test profile visibility"""
    print("\n=== Testing Profile Visibility ===")
    
    # PEOPLES can see full profile
    profile = get_profile_visibility("PEOPLES")
    assert profile["full_profile"] == True
    assert profile["contact_info"] == True
    assert profile["peoples_list"] == True
    print("✅ PEOPLES: Full profile access")
    
    # COOL can see most things
    profile = get_profile_visibility("COOL")
    assert profile["full_profile"] == True
    assert profile["contact_info"] == False
    print("✅ COOL: Limited contact info")
    
    # OTHERS minimal visibility
    profile = get_profile_visibility("OTHERS")
    assert profile["name"] == True
    assert profile["username"] == True
    assert profile["bio"] == False
    assert profile["full_profile"] == False
    print("✅ OTHERS: Minimal profile")
    
    # BLOCKED cannot see profile
    profile = get_profile_visibility("BLOCKED")
    assert profile["name"] == False
    assert profile["username"] == False
    assert profile["full_profile"] == False
    print("✅ BLOCKED: No profile access")


def test_comment_permissions():
    """Test comment permissions"""
    print("\n=== Testing Comment Permissions ===")
    
    # PEOPLES can comment on anything
    comment = can_comment("PEOPLES", "PEOPLES_ONLY")
    assert comment["can_comment"] == True
    assert comment["requires_moderation"] == False
    print("✅ PEOPLES can comment freely")
    
    # COOL can comment
    comment = can_comment("COOL", "COOL")
    assert comment["can_comment"] == True
    print("✅ COOL can comment on COOL posts")
    
    # CHILL comments are moderated
    comment = can_comment("CHILL", "PUBLIC")
    assert comment["can_comment"] == True
    assert comment["requires_moderation"] == True
    print("✅ CHILL comments moderated")
    
    # OTHERS can only comment on public (heavily moderated)
    comment = can_comment("OTHERS", "PUBLIC")
    assert comment["can_comment"] == True
    assert comment["requires_moderation"] == True
    print("✅ OTHERS comments heavily moderated")
    
    # OTHERS cannot comment on COOL posts
    comment = can_comment("OTHERS", "COOL")
    assert comment["can_comment"] == False
    print("✅ OTHERS cannot comment on COOL posts")
    
    # BLOCKED cannot comment
    comment = can_comment("BLOCKED", "PUBLIC")
    assert comment["can_comment"] == False
    print("✅ BLOCKED cannot comment")


def test_notification_behavior():
    """Test notification rules"""
    print("\n=== Testing Notification Behavior ===")
    
    # PEOPLES trigger all notifications
    assert should_notify("PEOPLES", "post") == True
    assert should_notify("PEOPLES", "comment") == True
    assert should_notify("PEOPLES", "dm") == True
    print("✅ PEOPLES: All notifications")
    
    # COOL trigger most notifications
    assert should_notify("COOL", "post") == True
    assert should_notify("COOL", "mention") == True
    print("✅ COOL: Most notifications")
    
    # CHILL only mentions
    assert should_notify("CHILL", "post") == False
    assert should_notify("CHILL", "mention") == True
    assert should_notify("CHILL", "dm") == False
    print("✅ CHILL: Mentions only")
    
    # ALRIGHT triggers no notifications
    assert should_notify("ALRIGHT", "post") == False
    assert should_notify("ALRIGHT", "comment") == False
    print("✅ ALRIGHT: No notifications")
    
    # BLOCKED triggers no notifications
    assert should_notify("BLOCKED", "post") == False
    assert should_notify("BLOCKED", "mention") == False
    print("✅ BLOCKED: No notifications")


def test_tier_display():
    """Test tier display names and descriptions"""
    print("\n=== Testing Tier Display ===")
    
    service = TrustPermissionService()
    
    # Test display names
    assert service.get_tier_display_name("PEOPLES") == "My Peoples"
    assert service.get_tier_display_name("COOL") == "Cool"
    assert service.get_tier_display_name("BLOCKED") == "Blocked"
    print("✅ Tier display names correct")
    
    # Test descriptions
    desc = service.get_tier_description("PEOPLES")
    assert "closest circle" in desc.lower()
    print("✅ Tier descriptions correct")


def run_all_tests():
    """Run all Circle Trust Order permission tests"""
    print("\n" + "="*60)
    print("CIRCLE TRUST ORDER - 7-TIER PERMISSION TESTS")
    print("="*60)
    
    try:
        test_feed_visibility()
        test_dm_permissions()
        test_profile_visibility()
        test_comment_permissions()
        test_notification_behavior()
        test_tier_display()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED")
        print("="*60)
        print("\nCircle Trust Order 7-Tier System:")
        print("1. PEOPLES          ⭐⭐⭐⭐⭐")
        print("2. COOL             ⭐⭐⭐⭐")
        print("3. CHILL            ⭐⭐⭐")
        print("4. ALRIGHT          ⭐⭐")
        print("5. OTHERS           ⭐")
        print("6. OTHERS_SAFE_MODE 🛡️")
        print("7. BLOCKED          ⛔")
        print("\n✅ All permission rules validated")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        raise
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        raise


if __name__ == "__main__":
    run_all_tests()
