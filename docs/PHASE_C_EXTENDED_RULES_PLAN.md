# Circle Trust Order - Phase C Extended Rules PLAN

**Date**: December 2024  
**MEGADROP V1**: Priority 1.1 - Phase C  
**Status**: PLANNING (Awaiting Founder Approval)

---

## 🎯 Executive Summary

Phase C implements the **Extended Rules** of the Circle Trust Order, expanding trust-based permissions beyond DMs to include comments, notifications, and feed ranking. This phase follows the Founder's explicit guidance:

**Priority Structure**:
1. 🔴 **FULL ENFORCEMENT**: Comment Permissions by Trust Tier
2. 🔴 **FULL ENFORCEMENT**: Notification Filtering by Trust Tier
3. 🟡 **SHADOW MODE ONLY**: Feed Ranking by Trust Tier (logging, no hard switch)

All rules remain:
- Backend-driven
- Configurable
- Ready for ADCS integration
- Respectful of 7-tier Circle Trust Order
- Respectful of Founder Rule A (Mutual PEOPLES Override)
- Respectful of Founder Rule B (Tier Jump Anomaly Logging)
- Sovereign and reversible

---

## 📊 Phase C Rule Matrix

### 1. COMMENT PERMISSIONS BY TRUST TIER

| Trust Tier | Can Comment on My Posts? | Can Reply to My Comments? | Can Mention/Tag Me? | Moderation Level |
|-----------|-------------------------|---------------------------|---------------------|------------------|
| **PEOPLES** | ✅ Yes, always | ✅ Yes, always | ✅ Yes, always | None |
| **COOL** | ✅ Yes | ✅ Yes | ✅ Yes | Light (spam filter) |
| **CHILL** | ✅ Yes | ✅ Yes | ⚠️ Mentions require approval | Moderate (review queue) |
| **ALRIGHT** | ⚠️ PUBLIC posts only | ⚠️ PUBLIC threads only | ❌ No mentions | Heavy (pre-moderation) |
| **OTHERS** | ⚠️ PUBLIC posts only | ⚠️ PUBLIC threads only | ❌ No mentions | Heavy (pre-moderation) |
| **SAFE MODE** | ❌ No | ❌ No | ❌ No | N/A (blocked) |
| **BLOCKED** | ❌ No | ❌ No | ❌ No | N/A (blocked) |

**Special Rules**:
- **Mutual PEOPLES Override**: Both users in mutual PEOPLES can comment freely on each other's content regardless of visibility level
- **Post Visibility Matters**: Users can only comment on posts they can see (based on content visibility + their tier)
- **Thread Participation**: Once someone comments on a PUBLIC post, they can continue participating in that thread even if downgraded (similar to DM thread behavior)

---

### 2. NOTIFICATION FILTERING BY TRUST TIER

| Trust Tier | Notification Priority | Delivery Method | Grouping/Batching |
|-----------|----------------------|-----------------|-------------------|
| **PEOPLES** | 🔴 Critical (always) | Immediate | No batching |
| **COOL** | 🟠 High | Immediate | Optional grouping |
| **CHILL** | 🟡 Medium | Batched (5 min) | Grouped by user |
| **ALRIGHT** | 🔵 Low | Batched (1 hour) | Collapsed summary |
| **OTHERS** | ⚪ Minimal | Daily digest | Collapsed summary |
| **SAFE MODE** | ❌ None | N/A | N/A |
| **BLOCKED** | ❌ None | N/A | N/A |

**Notification Types Affected**:
- Post interactions (likes, shares)
- Comments on my posts
- Replies to my comments
- Mentions/tags
- DM requests (already handled in Phase B)
- Connection requests
- Event invitations

**Special Rules**:
- **Mutual PEOPLES Override**: Notifications from mutual PEOPLES always come through immediately
- **User Control**: Users can adjust notification preferences per tier (e.g., mute ALRIGHT entirely)
- **ADCS Integration**: Future ADCS can auto-adjust notification thresholds based on behavior patterns

---

### 3. FEED RANKING BY TRUST TIER (SHADOW MODE)

**Status**: 🟡 SHADOW MODE ONLY - Logging without hard switch

**Ranking Formula (Proposed)**:
```
post_score = (
    base_relevance_score +
    (trust_weight * 0.4) +
    (recency_score * 0.3) +
    (engagement_score * 0.3)
)
```

**Trust Weight by Tier**:
- PEOPLES: +100 (highest priority)
- COOL: +75
- CHILL: +50
- ALRIGHT: +25
- OTHERS: +5
- SAFE MODE: -50 (deprioritized)
- BLOCKED: -∞ (invisible)

**Shadow Mode Implementation**:
- Run ranking algorithm in parallel with current feed logic
- Log "would-have-been feed order" vs. "actual feed order"
- Compare engagement metrics between the two orderings
- Generate weekly reports on trust-ranked feed performance
- **NO USER-FACING CHANGES** until Founder approves full activation

**Activation Criteria (for future)**:
- Minimum 2 weeks of shadow mode data
- Engagement metrics show improvement (or neutral)
- No unintended filtering of important content
- User feedback collection (if needed)

---

## 🛠️ Implementation Plan

### **Priority 1: Comment Permissions (Week 1)**

#### **Files to Create/Modify**:
1. **Update `/app/backend/services/trust_permissions.py`**:
   - Add `can_comment_on_post()` method with full logic
   - Add `can_reply_to_comment()` method
   - Add `can_mention_user()` method

2. **Create `/app/backend/services/comment_moderation.py`**:
   - Implement moderation queue for CHILL/ALRIGHT/OTHERS
   - Auto-approval logic for PEOPLES/COOL
   - Integration with ADCS for future spam detection

3. **Modify `/app/backend/routes/social_feed.py` (or equivalent)**:
   - Add trust checks to comment creation endpoints
   - Add trust checks to reply endpoints
   - Add trust checks to mention endpoints

4. **Create `/app/backend/models/comment_moderation.py`**:
   - Pydantic model for moderation queue entries

5. **Tests**:
   - Create `/app/backend/tests/test_comment_permissions.py`
   - Test all 7 tiers
   - Test Mutual PEOPLES override
   - Test moderation queue workflow

---

### **Priority 2: Notification Filtering (Week 1-2)**

#### **Files to Create/Modify**:
1. **Create `/app/backend/services/notification_filter.py`**:
   - Implement tier-based notification filtering
   - Priority assignment logic
   - Batching/grouping logic for lower tiers

2. **Modify `/app/backend/routes/notifications.py` (if exists)**:
   - Integrate notification filter before sending
   - Add user preference endpoints for notification control

3. **Create `/app/backend/models/notification_preference.py`**:
   - User-level notification settings per tier

4. **Tests**:
   - Create `/app/backend/tests/test_notification_filtering.py`
   - Test all priority levels
   - Test batching behavior
   - Test Mutual PEOPLES override

---

### **Priority 3: Feed Ranking Shadow Mode (Week 2)**

#### **Files to Create/Modify**:
1. **Create `/app/backend/services/feed_ranker.py`**:
   - Implement trust-weighted feed ranking algorithm
   - Shadow mode logging
   - Comparison metrics

2. **Create `/app/backend/services/feed_analytics.py`**:
   - Shadow mode report generation
   - Engagement comparison logic

3. **Modify `/app/backend/routes/social_feed.py`**:
   - Run shadow ranker in parallel
   - Log "would-have-been" order

4. **Tests**:
   - Create `/app/backend/tests/test_feed_ranking_shadow.py`
   - Test ranking algorithm
   - Test shadow mode logging

---

## 🧪 Testing Strategy

### **Unit Tests**:
- All trust permission methods (comment, reply, mention)
- Notification filtering logic
- Feed ranking algorithm (without hard switch)

### **Integration Tests**:
- Comment creation with trust checks
- Notification delivery with filtering
- Shadow mode feed comparison

### **Backend Testing Agent**:
- End-to-end comment permission flows
- Notification filtering verification
- Shadow mode data validation

---

## 📊 Success Criteria

### **Phase C Complete When**:
1. ✅ Comment permissions enforced for all 7 tiers
2. ✅ Moderation queue working for CHILL/ALRIGHT/OTHERS
3. ✅ Notification filtering active with proper batching
4. ✅ Feed ranking in shadow mode with logging
5. ✅ All unit tests passing (target: 95%+ coverage)
6. ✅ Backend testing agent verification complete
7. ✅ Documentation complete (`PHASE_C_EXTENDED_RULES_COMPLETE.md`)
8. ✅ No regressions in Phase A/B functionality

---

## 🔄 Rollback Strategy

### **If Issues Arise**:
- Comment permissions can be disabled via feature flag (default to allow all)
- Notification filtering can be bypassed (revert to pre-Phase C behavior)
- Feed ranking is already in shadow mode (no rollback needed)

### **Monitoring Points**:
- Comment creation failure rates
- Notification delivery latency
- Shadow mode feed ranking logs
- User complaint trends (if any)

---

## 📝 Open Questions for Founder Approval

### **1. Comment Moderation Queue**:
- Should CHILL tier comments appear immediately with "pending review" flag, or be hidden until approved?
- Should ALRIGHT/OTHERS comments require manual approval, or can they auto-approve after 24 hours?

### **2. Notification Batching**:
- Confirm batching intervals: CHILL (5 min), ALRIGHT (1 hour), OTHERS (daily)?
- Should users be able to override batching for specific users (e.g., "always notify me immediately from this CHILL user")?

### **3. Mention Permissions**:
- Should CHILL tier mentions require approval before the target user sees them, or just show a "mentioned you" notification with approval option?
- Should there be a limit on how many times ALRIGHT/OTHERS can attempt mentions (rate limiting)?

### **4. Feed Ranking Shadow Mode Duration**:
- Minimum 2 weeks before considering activation?
- What specific metrics should we track to determine success (engagement rate, time-on-feed, user satisfaction)?

---

## 🎯 Phase C Summary

**Scope**: Comment permissions, notification filtering, and feed ranking (shadow mode)

**Timeline**: 2 weeks (1 week for comments/notifications, 1 week for shadow feed ranking)

**Philosophy**: Extend trust-based permissions to all social interactions while maintaining user control and reversibility

**Alignment**: Fully aligned with MEGADROP V1, Circle Trust Order, and Founder Rules A & B

---

**Status**: ⏸️ AWAITING FOUNDER APPROVAL TO PROCEED

**Next Step**: Upon approval, begin implementation of Priority 1 (Comment Permissions)

---

**End of Phase C Plan**  
**Author**: Neo (E1 Agent)  
**Reviewed By**: Raymond Al Zedeck (Founder, BANIBS)
