"""
Circle Trust Order - Integration Demo Routes
Demonstrates shadow mode integration patterns

This file shows HOW to integrate trust permissions into existing routes.
Use these patterns when updating actual social feature routes.
"""

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Dict, Any

from db.connection import get_db
from services.trust_permissions import (
    can_see_content,
    can_send_dm,
    get_profile_visibility,
    can_comment,
    should_notify
)
from services.trust_logger import (
    log_feed_check,
    log_dm_check,
    log_profile_check,
    log_comment_check,
    log_notification_check,
    generate_shadow_report
)
from services.bdii.identity_resolution import get_identity_service

router = APIRouter(prefix="/api/trust-demo", tags=["Trust Integration Demo"])


@router.get("/shadow-report")
async def get_shadow_report():
    """
    Get shadow mode statistics
    
    Shows what would have been blocked without actually blocking.
    """
    report = generate_shadow_report()
    return report


@router.get("/feed-demo")
async def demo_feed_integration(
    current_user_id: str = "demo-user",  # Would come from auth
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """
    DEMO: How to integrate trust permissions into feed routes
    
    Pattern for updating /api/feed or /api/social/feed routes
    """
    # Get viewer's relationships to determine tiers
    # (In real implementation, this would come from relationships collection)
    
    # Example posts with different visibility levels
    example_posts = [
        {
            "id": "post-1",
            "author_id": "author-1",
            "content": "Public post visible to everyone",
            "visibility": "PUBLIC"
        },
        {
            "id": "post-2",
            "author_id": "author-2",
            "content": "Cool-tier post",
            "visibility": "COOL"
        },
        {
            "id": "post-3",
            "author_id": "author-3",
            "content": "Peoples-only post",
            "visibility": "PEOPLES_ONLY"
        }
    ]
    
    # SHADOW MODE: Check permissions but don't filter yet
    filtered_posts = []
    shadow_blocked = []
    
    for post in example_posts:
        # Get viewer's trust tier with post author
        # In real implementation: lookup from relationships collection
        viewer_tier = "COOL"  # Example: viewer is COOL with this author
        
        # Check if viewer can see this post
        can_see = can_see_content(viewer_tier, post["visibility"])
        
        # LOG the check (Phase A: Shadow Mode)
        decision = "allow" if can_see else "deny"
        log_feed_check(
            viewer_tier=viewer_tier,
            content_visibility=post["visibility"],
            decision=decision,
            details={"post_id": post["id"], "author_id": post["author_id"]}
        )
        
        # For now, include all posts but mark which would be filtered
        post_copy = post.copy()
        post_copy["would_be_visible"] = can_see
        post_copy["viewer_tier"] = viewer_tier
        
        if can_see:
            filtered_posts.append(post_copy)
        else:
            shadow_blocked.append(post_copy)
    
    return {
        "mode": "SHADOW",
        "visible_posts": filtered_posts,
        "shadow_blocked": shadow_blocked,
        "note": "In shadow mode - all posts returned, 'would_be_visible' shows trust decision"
    }


@router.post("/dm-demo")
async def demo_dm_integration(
    recipient_id: str,
    message: str,
    current_user_id: str = "demo-sender"
):
    """
    DEMO: How to integrate trust permissions into messaging routes
    
    Pattern for updating /api/messages or /api/messaging routes
    """
    # Get sender's trust tier with recipient
    # In real implementation: lookup from relationships collection
    sender_tier = "COOL"  # Example
    
    # Check DM permission
    dm_permission = can_send_dm(sender_tier)
    
    # LOG the check (Phase A: Shadow Mode)
    decision = "allow" if dm_permission["can_send"] else "deny"
    if dm_permission["requires_approval"]:
        decision = "require_approval"
    
    log_dm_check(
        sender_tier=sender_tier,
        recipient_tier="unknown",  # Would lookup recipient's tier
        decision=decision,
        details={
            "sender_id": current_user_id,
            "recipient_id": recipient_id,
            "requires_approval": dm_permission["requires_approval"]
        }
    )
    
    # SHADOW MODE: Show what would happen, but don't block yet
    if not dm_permission["can_send"]:
        return {
            "mode": "SHADOW",
            "would_send": False,
            "reason": dm_permission["reason"],
            "sender_tier": sender_tier,
            "note": "In shadow mode - message not actually blocked yet"
        }
    elif dm_permission["requires_approval"]:
        return {
            "mode": "SHADOW",
            "would_send": True,
            "requires_approval": True,
            "reason": dm_permission["reason"],
            "sender_tier": sender_tier,
            "note": "In shadow mode - would require approval in Phase B"
        }
    else:
        return {
            "mode": "SHADOW",
            "would_send": True,
            "sender_tier": sender_tier,
            "note": "Message would be sent"
        }


@router.get("/profile-demo/{user_id}")
async def demo_profile_integration(
    user_id: str,
    current_user_id: str = "demo-viewer"
):
    """
    DEMO: How to integrate trust permissions into profile routes
    
    Pattern for updating /api/users/{user_id} or /api/profile routes
    """
    # Get viewer's trust tier with profile owner
    viewer_tier = "ALRIGHT"  # Example
    
    # Get profile visibility rules
    visibility = get_profile_visibility(viewer_tier)
    
    # LOG the check (Phase A: Shadow Mode)
    log_profile_check(
        viewer_tier=viewer_tier,
        profile_owner_tier="unknown",
        fields_visible=visibility,
        details={"profile_user_id": user_id, "viewer_id": current_user_id}
    )
    
    # Full profile data (would come from database)
    full_profile = {
        "id": user_id,
        "name": "John Doe",
        "username": "johndoe",
        "bio": "Software developer and community builder",
        "avatar_url": "https://example.com/avatar.jpg",
        "email": "john@example.com",
        "phone": "+1234567890",
        "peoples_count": 150,
        "location": "Atlanta, GA"
    }
    
    # SHADOW MODE: Return full profile but mark what would be visible
    filtered_profile = {}
    field_visibility_report = {}
    
    for field, value in full_profile.items():
        # Map fields to visibility rules
        if field in ["name", "username"] and visibility["name"]:
            filtered_profile[field] = value
            field_visibility_report[field] = "visible"
        elif field == "bio" and visibility["bio"]:
            filtered_profile[field] = value
            field_visibility_report[field] = "visible"
        elif field == "avatar_url" and visibility["avatar"]:
            filtered_profile[field] = value
            field_visibility_report[field] = "visible"
        elif field in ["email", "phone"] and visibility["contact_info"]:
            filtered_profile[field] = value
            field_visibility_report[field] = "visible"
        else:
            field_visibility_report[field] = "would_be_hidden"
    
    return {
        "mode": "SHADOW",
        "viewer_tier": viewer_tier,
        "filtered_profile": filtered_profile,
        "full_profile": full_profile,
        "field_visibility": field_visibility_report,
        "note": "In shadow mode - all fields returned, visibility report shows what would be filtered"
    }


@router.get("/integration-guide")
async def get_integration_guide():
    """
    Get integration patterns for developers
    """
    return {
        "integration_patterns": {
            "feed_routes": {
                "routes_to_update": [
                    "/api/feed",
                    "/api/social/feed",
                    "/api/social/posts"
                ],
                "pattern": """
# 1. Get viewer's relationships
relationships = await get_user_relationships(current_user_id)

# 2. For each post, check visibility
for post in posts:
    viewer_tier = relationships.get(post.author_id, 'OTHERS')
    
    # Shadow mode: log but don't filter
    can_see = can_see_content(viewer_tier, post.visibility)
    log_feed_check(viewer_tier, post.visibility, 
                   'allow' if can_see else 'deny',
                   {'post_id': post.id})
    
    # Phase B: actually filter
    if not can_see:
        continue  # Skip this post
                """,
                "test_coverage_required": True
            },
            "messaging_routes": {
                "routes_to_update": [
                    "/api/messages/send",
                    "/api/dm/create"
                ],
                "pattern": """
# 1. Get sender's tier with recipient
sender_tier = await get_relationship_tier(sender_id, recipient_id)

# 2. Check DM permission
dm_permission = can_send_dm(sender_tier)

# Shadow mode: log
log_dm_check(sender_tier, recipient_tier, 
             'allow' if dm_permission['can_send'] else 'deny')

# Phase B: enforce
if not dm_permission['can_send']:
    raise HTTPException(403, dm_permission['reason'])
if dm_permission['requires_approval']:
    # Create pending DM request
    pass
                """,
                "test_coverage_required": True
            },
            "profile_routes": {
                "routes_to_update": [
                    "/api/users/{user_id}",
                    "/api/profile/{user_id}"
                ],
                "pattern": """
# 1. Get viewer's tier with profile owner
viewer_tier = await get_relationship_tier(viewer_id, profile_owner_id)

# 2. Get visibility rules
visibility = get_profile_visibility(viewer_tier)

# Shadow mode: log
log_profile_check(viewer_tier, profile_owner_tier, visibility)

# Phase B: filter fields
filtered_profile = {}
if visibility['name']: filtered_profile['name'] = user.name
if visibility['bio']: filtered_profile['bio'] = user.bio
# ... etc
                """,
                "test_coverage_required": True
            }
        },
        "shadow_mode_guidelines": {
            "phase_a": "Log all checks, don't block anything",
            "phase_b": "Enforce safest rules (BLOCKED, SAFE_MODE)",
            "phase_c": "Full enforcement after review"
        }
    }


@router.post("/test-shadow-mode")
async def test_shadow_mode():
    """
    Run a series of test checks to populate shadow mode logs
    """
    # Simulate various permission checks
    test_results = []
    
    # Test 1: BLOCKED user trying to view content
    can_see = can_see_content("BLOCKED", "PUBLIC")
    log_feed_check("BLOCKED", "PUBLIC", "deny" if not can_see else "allow")
    test_results.append(f"BLOCKED viewing PUBLIC: {can_see}")
    
    # Test 2: OTHERS trying to DM
    dm_perm = can_send_dm("OTHERS")
    log_dm_check("OTHERS", "unknown", "deny" if not dm_perm["can_send"] else "allow")
    test_results.append(f"OTHERS sending DM: {dm_perm['can_send']}")
    
    # Test 3: COOL trying to DM (should require approval)
    dm_perm = can_send_dm("COOL")
    log_dm_check("COOL", "unknown", "require_approval" if dm_perm["requires_approval"] else "allow")
    test_results.append(f"COOL sending DM: {dm_perm['can_send']}, approval: {dm_perm['requires_approval']}")
    
    # Test 4: ALRIGHT viewing profile
    profile_vis = get_profile_visibility("ALRIGHT")
    log_profile_check("ALRIGHT", "unknown", profile_vis)
    test_results.append(f"ALRIGHT viewing profile: full={profile_vis['full_profile']}")
    
    # Test 5: PEOPLES viewing everything
    can_see = can_see_content("PEOPLES", "PEOPLES_ONLY")
    log_feed_check("PEOPLES", "PEOPLES_ONLY", "allow" if can_see else "deny")
    test_results.append(f"PEOPLES viewing PEOPLES_ONLY: {can_see}")
    
    return {
        "test_results": test_results,
        "note": "Check shadow report endpoint for statistics"
    }
