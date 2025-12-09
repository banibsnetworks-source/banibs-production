# Phase B Enforcement Plan — Safe Rules Bundle

**Date**: December 9, 2025  
**Status**: 🚧 IN PROGRESS  
**Approved By**: Raymond

---

## 🎯 APPROVED DECISIONS

### Decision 1: DM Approval Workflow ✅
**Implementation**: Message Request Queue (Option A)
- First-contact DMs from COOL/CHILL → message request queue
- Recipient must explicitly Approve or Deny
- No auto-approve timeouts
- No silent auto-upgrades

### Decision 2: Tier Change During Conversation ✅
**Implementation**: Graceful Degradation (Option A)
- Existing conversation history stays visible
- New messages from downgraded tier are blocked
- Clean line in the sand, no history erasure

### Decision 3: SAFE MODE in Shared Circles ✅
**Implementation**: Full Invisibility (Option A)
- SAFE MODE = invisible in shared Circles
- No profile, posts, or presence visible
- Complete protection from unwanted attention

### Decision 4: Phase B Rollout Pace ✅
**Implementation**: Full Safe Rules Bundle (Option C)
- BLOCKED isolation fully enforced
- SAFE MODE protection fully enforced
- DM blocking for OTHERS/SAFE MODE/BLOCKED fully enforced
- All reversible, no permanent deletions

---

## 🛡️ PHASE B ENFORCEMENT SCOPE

### ✅ ACTIVELY ENFORCED (Phase B)

1. **BLOCKED Isolation**
   - Cannot see ANY content
   - Cannot send DMs
   - Cannot comment
   - Cannot see profile
   - Breaks Circle connections (weight: -100)
   - Bidirectional complete invisibility

2. **SAFE MODE Protection**
   - Sees limited PUBLIC content only
   - Cannot send DMs
   - Cannot comment
   - Profile shows "Limited Profile"
   - Invisible in shared Circles
   - No notifications triggered

3. **DM Blocking**
   - OTHERS: Cannot initiate DMs
   - OTHERS_SAFE_MODE: Cannot send DMs
   - BLOCKED: Cannot contact at all

4. **DM Approval Queue**
   - COOL: First-contact DM → approval required
   - CHILL: First-contact DM → approval required
   - Explicit approve/deny needed
   - No auto-approval

5. **Profile Filtering**
   - BLOCKED: No profile visible
   - SAFE MODE: "Limited Profile" only
   - ALRIGHT/OTHERS: Minimal info (name, username)

6. **Feed Filtering (Conservative)**
   - BLOCKED: Cannot see any posts
   - SAFE MODE: Only PUBLIC (filtered)
   - Others: Existing behavior maintained

---

### 🔍 SHADOW MODE ONLY (Not Enforced Yet)

1. **Comment Permissions**
   - Logging: Yes
   - Enforcement: No
   - Reason: Need moderation queue infrastructure

2. **Notification Filtering**
   - Logging: Yes
   - Enforcement: No
   - Reason: Need more behavioral data

3. **Tier-Based Feed Ranking**
   - Logging: Yes
   - Enforcement: No
   - Reason: Need algorithm tuning

---

## 📋 IMPLEMENTATION CHECKLIST

### Phase B Core Infrastructure

- [ ] Create DM request queue model
- [ ] Create DM request approval endpoints
- [ ] Implement tier-based DM blocking
- [ ] Implement BLOCKED isolation in routes
- [ ] Implement SAFE MODE protection in routes
- [ ] Add enforcement logging
- [ ] Update relationship routes
- [ ] Add comprehensive tests
- [ ] Create admin testing guide

---

## 🧪 TESTING STRATEGY

### Test Cases Required

1. **BLOCKED Isolation Tests**
   - User A blocks User B
   - User B cannot see User A's profile
   - User B cannot see User A's posts
   - User B cannot send DMs to User A
   - Circle connections broken

2. **SAFE MODE Tests**
   - User A puts User B in SAFE MODE
   - User B sees "Limited Profile" for User A
   - User B cannot DM User A
   - User B doesn't see User A in shared Circles

3. **DM Approval Tests**
   - COOL user sends first DM → approval queue
   - Recipient approves → conversation opens
   - Recipient denies → DM blocked
   - PEOPLES user sends DM → no approval needed

4. **Tier Downgrade Tests**
   - Active conversation exists
   - User A downgrades User B (COOL → ALRIGHT)
   - History stays visible
   - New messages from B are blocked

---

## 🔄 ROLLBACK PLAN

If critical issues arise:

1. **Feature Flag**: Add `TRUST_ENFORCEMENT_ENABLED` env var
2. **Graceful Degradation**: Fall back to shadow mode logging
3. **No Data Loss**: All enforcement is permission-based, no deletions
4. **Audit Trail**: All blocks/restrictions logged

---

## 📊 SUCCESS METRICS

### Enforcement Metrics
- % of DMs blocked by tier
- % of DM requests approved vs denied
- % of content filtered by tier
- BLOCKED/SAFE MODE usage rate

### Safety Metrics
- Reduction in unwanted contact reports
- User satisfaction with privacy controls
- False positive rate (legitimate interactions blocked)

---

**Status**: Ready for Implementation  
**Risk Level**: Low (safe rules only, no data destruction)  
**Rollback**: Available via feature flag

---

**End of Phase B Enforcement Plan**
