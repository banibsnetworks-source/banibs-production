# Circle Trust Order — Complete 7-Tier Specification

**Version**: 2.0 (MEGADROP V1)  
**Status**: 🚧 IN PROGRESS  
**Last Updated**: December 9, 2025

---

## 🎯 OVERVIEW

The **Circle Trust Order** is the foundational social law of BANIBS. It defines how users classify their relationships and how those classifications affect visibility, permissions, and interactions across the entire platform.

### Core Principle

**Every relationship has a trust tier.** All social features — feeds, messaging, profiles, notifications, invites — respect this order.

---

## 🏗️ THE 7 TIERS

### Tier Structure (Closest → Most Distant)

```
1. PEOPLES          ⭐⭐⭐⭐⭐  (Closest, highest trust)
2. COOL             ⭐⭐⭐⭐
3. CHILL            ⭐⭐⭐
4. ALRIGHT          ⭐⭐
5. OTHERS           ⭐
6. OTHERS_SAFE_MODE 🛡️ (Limited interaction, protected mode)
7. BLOCKED          ⛔ (No interaction)
```

---

## 📋 TIER DEFINITIONS

### 1. PEOPLES ⭐⭐⭐⭐⭐

**Who**: Your closest circle — family, best friends, trusted community

**Philosophy**: "My Peoples" — those you trust completely

**Permissions**:
- ✅ Can see ALL your content (public + private + Peoples-only)
- ✅ Can send you DMs anytime
- ✅ Can comment on all your posts
- ✅ Can see your full profile (including contact info if shared)
- ✅ Can invite you to Circles
- ✅ Can see your Peoples-of-Peoples (mutual connections)
- ✅ Notifications: All interactions (posts, comments, messages)
- ✅ Feed: Highest priority

**Visibility**: Full

**Trust Level**: Maximum

---

### 2. COOL ⭐⭐⭐⭐

**Who**: Friends, trusted colleagues, community members you know well

**Philosophy**: "Cool people I know and trust"

**Permissions**:
- ✅ Can see PUBLIC + COOL content
- ✅ Can send you DMs (may require approval on first message)
- ✅ Can comment on public + Cool posts
- ✅ Can see your public profile + Cool-visible fields
- ✅ Can invite you to public Circles
- ✅ Can see shared connections
- ✅ Notifications: Major interactions (posts, mentions)
- ✅ Feed: High priority

**Visibility**: High

**Trust Level**: High

---

### 3. CHILL ⭐⭐⭐

**Who**: Acquaintances, new connections, people you're getting to know

**Philosophy**: "Chill folks, no drama, getting to know them"

**Permissions**:
- ✅ Can see PUBLIC + CHILL content
- ⚠️ Cannot send DMs without approval
- ✅ Can comment on public + Chill posts (may be moderated)
- ✅ Can see public profile only
- ⚠️ Cannot invite you to Circles directly
- ⚠️ Cannot see your connections
- ✅ Notifications: Mentions only
- ✅ Feed: Medium priority

**Visibility**: Medium

**Trust Level**: Medium

---

### 4. ALRIGHT ⭐⭐

**Who**: People you've interacted with, recognizable faces, casual connections

**Philosophy**: "They're alright, but not close"

**Permissions**:
- ✅ Can see PUBLIC + ALRIGHT content
- ❌ Cannot send DMs (blocked unless you initiate)
- ⚠️ Can comment on public posts only (may be filtered)
- ✅ Can see limited public profile
- ❌ Cannot invite you to Circles
- ❌ Cannot see your connections
- ⚠️ Notifications: None (silent)
- ✅ Feed: Low priority

**Visibility**: Low

**Trust Level**: Low

---

### 5. OTHERS ⭐

**Who**: Everyone else — strangers, new users, unclassified

**Philosophy**: "Default tier for people I don't know yet"

**Permissions**:
- ✅ Can see PUBLIC content only
- ❌ Cannot send DMs
- ⚠️ Can comment on public posts (heavily moderated)
- ✅ Can see minimal public profile (name, username only)
- ❌ Cannot invite you to Circles
- ❌ Cannot see your connections
- ❌ Notifications: None
- ⚠️ Feed: Minimal visibility

**Visibility**: Minimal

**Trust Level**: Neutral (unclassified)

**Note**: This is the **default tier** for all new connections.

---

### 6. OTHERS — SAFE MODE 🛡️

**Who**: People you want to limit interactions with but not fully block

**Philosophy**: "I see them, but I need distance and protection"

**Permissions**:
- ⚠️ Can see PUBLIC content only (with restrictions)
- ❌ Cannot send DMs
- ❌ Cannot comment on your posts
- ❌ Cannot see your profile (you appear as "Limited Profile")
- ❌ Cannot invite you to Circles
- ❌ Cannot see you in shared Circles (you're invisible to them)
- ❌ Notifications: None
- ❌ Feed: You do not appear in their feed

**Visibility**: Near-zero (they can barely see you exist)

**Trust Level**: Protected

**Use Case**: Manage unwanted attention without full block (ex-relationships, overly persistent people, etc.)

---

### 7. BLOCKED ⛔

**Who**: People you do not want any interaction with

**Philosophy**: "No contact, no visibility, no exceptions"

**Permissions**:
- ❌ Cannot see ANY of your content
- ❌ Cannot send DMs
- ❌ Cannot comment on your posts
- ❌ Cannot see your profile (you appear as non-existent)
- ❌ Cannot invite you to Circles
- ❌ Cannot see you in any shared Circles
- ❌ Cannot search for you
- ❌ Notifications: None
- ❌ Feed: You are completely invisible

**Visibility**: Zero (complete invisibility)

**Trust Level**: None (blocked)

**Effect**: Bidirectional — if you block them, they also cannot see you. The relationship is completely severed.

---

## 🔄 TIER TRANSITIONS

### How People Move Between Tiers

Tier changes are **manual and intentional** — you explicitly choose to upgrade or downgrade someone.

**Upgrade Path** (Building Trust):
```
OTHERS → ALRIGHT → CHILL → COOL → PEOPLES
```

**Downgrade Path** (Reducing Trust):
```
PEOPLES → COOL → CHILL → ALRIGHT → OTHERS → SAFE MODE → BLOCKED
```

**Jump Transitions** (Allowed):
- OTHERS → PEOPLES (immediately trust someone)
- PEOPLES → BLOCKED (immediate block if trust violated)
- Any tier → SAFE MODE (immediate protection)
- Any tier → BLOCKED (immediate block)

**Automatic Transitions** (Future):
- Interaction-based: Frequent positive interactions may *suggest* upgrades (user decides)
- Time-based: Long periods of no interaction may *suggest* downgrades (user decides)

---

## 🔐 PERMISSION MATRIX

### Feed Visibility

| Tier | Public Posts | Cool Posts | Chill Posts | Alright Posts | Peoples-Only Posts |
|------|-------------|------------|-------------|---------------|--------------------|
| **PEOPLES** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **COOL** | ✅ | ✅ | ✅ | ❌ | ❌ |
| **CHILL** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **ALRIGHT** | ✅ | ❌ | ❌ | ✅ | ❌ |
| **OTHERS** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **SAFE MODE** | ⚠️ Limited | ❌ | ❌ | ❌ | ❌ |
| **BLOCKED** | ❌ | ❌ | ❌ | ❌ | ❌ |

---

### Direct Messaging

| Tier | Can DM | Notes |
|------|--------|-------|
| **PEOPLES** | ✅ Always | No restrictions |
| **COOL** | ✅ Yes | May require first-message approval |
| **CHILL** | ⚠️ Requires Approval | Must request permission |
| **ALRIGHT** | ❌ No | You must initiate |
| **OTHERS** | ❌ No | Cannot initiate contact |
| **SAFE MODE** | ❌ No | Completely restricted |
| **BLOCKED** | ❌ No | Cannot contact at all |

---

### Profile Visibility

| Tier | Name | Username | Bio | Contact | Peoples List | Full Profile |
|------|------|----------|-----|---------|--------------|--------------|
| **PEOPLES** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **COOL** | ✅ | ✅ | ✅ | ⚠️ | ⚠️ | ✅ |
| **CHILL** | ✅ | ✅ | ✅ | ❌ | ❌ | ⚠️ |
| **ALRIGHT** | ✅ | ✅ | ⚠️ | ❌ | ❌ | ❌ |
| **OTHERS** | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **SAFE MODE** | ⚠️ | ⚠️ | ❌ | ❌ | ❌ | ❌ |
| **BLOCKED** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

### Comments & Interactions

| Tier | Comment on Public | Comment on Cool/Chill | Reactions | Mentions |
|------|-------------------|---------------------|-----------|----------|
| **PEOPLES** | ✅ | ✅ | ✅ | ✅ |
| **COOL** | ✅ | ✅ | ✅ | ✅ |
| **CHILL** | ✅ | ⚠️ Moderated | ✅ | ⚠️ |
| **ALRIGHT** | ⚠️ Filtered | ❌ | ✅ | ❌ |
| **OTHERS** | ⚠️ Heavy Filter | ❌ | ⚠️ | ❌ |
| **SAFE MODE** | ❌ | ❌ | ❌ | ❌ |
| **BLOCKED** | ❌ | ❌ | ❌ | ❌ |

---

## 🔔 NOTIFICATION BEHAVIOR

### What Triggers Notifications

| Tier | Posts | Comments | Reactions | Mentions | DMs | Circle Invites |
|------|-------|----------|-----------|----------|-----|----------------|
| **PEOPLES** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **COOL** | ✅ | ✅ | ⚠️ | ✅ | ✅ | ⚠️ |
| **CHILL** | ❌ | ⚠️ | ❌ | ✅ | ❌ | ❌ |
| **ALRIGHT** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **OTHERS** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **SAFE MODE** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **BLOCKED** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🌐 CIRCLE ENGINE INTEGRATION

### Circle Weight Scoring

Trust tiers affect Circle graph traversal and recommendations:

```python
TIER_WEIGHTS = {
    "PEOPLES": 100,
    "COOL": 75,
    "CHILL": 50,
    "ALRIGHT": 25,
    "OTHERS": 5,
    "OTHERS_SAFE_MODE": 0,
    "BLOCKED": -100  # Negative weight breaks connections
}
```

### Peoples-of-Peoples Detection

The Infinite Circles Engine respects trust tiers when finding connections:

- **PEOPLES tier**: Your Peoples' Peoples are visible and suggested
- **COOL tier**: Their Cool connections may be suggested
- **CHILL and below**: No connection suggestions

---

## 🛡️ SAFETY & PROTECTION

### Downgrade Protection

Moving someone to **SAFE MODE** or **BLOCKED** immediately:
- Revokes all permissions
- Removes them from your feed
- Hides your profile from them
- Cannot be reversed easily (requires manual unblock)

### Escalation Path

If someone is causing issues:
```
1. Ignore (stay at current tier, just don't engage)
2. Downgrade (CHILL → ALRIGHT → OTHERS)
3. Safe Mode (restrict without full block)
4. Block (complete severance)
```

---

## 🚀 FUTURE EXTENSIONS

### Phase 1: Smart Tier Suggestions (Q2 2026)

Machine learning suggests tier changes based on:
- Interaction frequency
- Response times
- Mutual connections
- Content engagement

**User always decides** — suggestions only.

### Phase 2: Temporary Tiers (Q3 2026)

"Boost" someone temporarily:
- ALRIGHT → COOL for 30 days
- Auto-revert after period

### Phase 3: Circle-Specific Tiers (Q4 2026)

Different tiers in different Circles:
- PEOPLES in "Family Circle"
- COOL in "Work Circle"
- Separate trust contexts

---

## 📊 DEFAULT BEHAVIOR

### New Connections

When someone connects with you:
- Default tier: **OTHERS**
- They see: Public content only
- Notifications: None
- You decide: Upgrade them as trust builds

### Mutual Relationships

Trust tiers are **unidirectional**:
- You can classify Bob as PEOPLES
- Bob can classify you as ALRIGHT
- Each person controls their own trust ladder

---

## ✅ IMPLEMENTATION CHECKLIST

- [ ] Update relationship schema (7 tiers)
- [ ] Update database tier constants
- [ ] Implement tier-based feed filtering
- [ ] Implement tier-based messaging permissions
- [ ] Implement tier-based profile visibility
- [ ] Implement tier-based notification rules
- [ ] Update Circle Engine weights
- [ ] Update Infinite Circles for 7 tiers
- [ ] Create tier management UI endpoints
- [ ] Document API changes
- [ ] Test all tier transitions
- [ ] Test permission enforcement

---

**Status**: 🚧 Specification Complete, Implementation In Progress  
**Next**: Backend implementation of 7-tier system

---

**End of Circle Trust Order Specification**
