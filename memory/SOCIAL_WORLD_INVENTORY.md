# BANIBS Social World Inventory
## Founder-Only Reference Document
**Generated:** February 3, 2026  
**Purpose:** Governance and clarity on Social World architecture

---

## 1. EXISTING SOCIAL-RELATED ROUTES/PAGES

### A. Primary Social Portal (`/portal/social/*`)
| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/portal/social` | `SocialPortal.js` | **LIVE** | Main social feed with posts |
| `/portal/social/profile` | `SocialProfileEditPage.js` | **LIVE** | User profile (identity-first view) |
| `/portal/social/profile/theme` | `SocialProfileTheme.js` | **LIVE** | Profile theme customization |
| `/portal/social/u/:handle` | `SocialProfilePublicPage.js` | **LIVE** | Public profile view |
| `/portal/social/circles` | `SocialCirclesPage.jsx` | **LIVE** | Community circles listing (22 circles) |
| `/portal/social/circles/:slug` | `CircleDetailPage.jsx` | **LIVE** | Individual circle detail |
| `/portal/social/home` | `SocialPortal.js` | **LIVE** | Alias to main feed |
| `/portal/social/my-peoples` | `InfiniteCirclePage` | **PARTIAL** | People System visualization |
| `/portal/social/groups` | `GroupsPage.js` | **PLACEHOLDER** | Groups feature |

### B. Social World Container (`/socialworld/*`)
| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/socialworld` | `SocialWorldHome.jsx` | **PLACEHOLDER** | Multi-mode social hub concept |
| `/socialworld/chat` | `ChatSpherePage.jsx` | **PLACEHOLDER** | Chat mode |
| `/socialworld/circles` | `CirclesPage.jsx` | **PLACEHOLDER** | Circles mode |
| `/socialworld/connections` | `ConnectionsPage.jsx` | **PLACEHOLDER** | Connections mode |
| `/socialworld/live` | `LiveCirclePage.jsx` | **PLACEHOLDER** | Live mode |
| `/socialworld/marketplace` | `MarketplacePage.jsx` | **PLACEHOLDER** | Marketplace mode |
| `/socialworld/moments` | `MomentsPage.jsx` | **PLACEHOLDER** | Photo/stories mode |
| `/socialworld/shortform` | `ShortFormPage.jsx` | **PARTIAL** | Short-form video (TikTok-style) |
| `/socialworld/stories` | `StoriesPage.jsx` | **PLACEHOLDER** | Stories mode |
| `/socialworld/talent` | `TalentWorldPage.jsx` | **PLACEHOLDER** | Talent showcase |
| `/socialworld/voice` | `VoiceSharePage.jsx` | **PLACEHOLDER** | Voice share mode |

### C. Messaging (`/messages/*`)
| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/messages` | `MessagingHomePage.jsx` | **LIVE** | Direct messaging home |
| `/messages/:conversationId` | `MessagingHomePage.jsx` | **LIVE** | Individual conversation |

### D. Infinite Circle Engine (`/social/circles/*`, `/circles/*`)
| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/social/circles` | `InfiniteCirclePage.js` | **PARTIAL** | People-of-Peoples visualization |
| `/social/circles/:userId` | `InfiniteCirclePage.js` | **PARTIAL** | User's circle view |
| `/circles` | `CirclesPage.js` | **LIVE** | Public Circle Architecture explainer |
| `/circles/share/:userId` | `SharedCirclePage.js` | **PARTIAL** | Shared circle view |

### E. Short-Form Video (`/shortform/*`)
| Route | Component | Status | Description |
|-------|-----------|--------|-------------|
| `/shortform` | `ShortFormPage.jsx` | **PARTIAL** | Video feed (working backend) |
| `/shortform/video/:videoId` | N/A | **PARTIAL** | Individual video view |

---

## 2. EXISTING DATA MODELS

### A. Content Types

#### `social_post.py` (Phase 8.3) - **LIVE**
```python
class PostType(str, Enum):
    TEXT = "text"
    IMAGE = "image"
    VIDEO = "video"
    LINK = "link"
    POLL = "poll"
    ARTICLE = "article"

class SocialPost:
    id, author_id, author_name, author_handle, author_avatar_url
    post_type: PostType
    content: str
    media_urls: List[str]  # Images/videos
    link_preview: LinkPreview (optional)
    hashtags, mentions
    visibility: PostVisibility (public/peoples/private)
    like_count, comment_count, share_count, view_count
```

#### `shortform_video.py` - **PARTIAL**
```python
class ShortFormVideo:
    id, uploader_id, uploader_name
    title, description
    video_url, thumbnail_url
    category: VideoCategory
    safety_rating: VideoSafetyRating
    views, likes, comments, shares
    is_community_boost, is_micro_learning
```

### B. Relationship Models

#### `peoples.py` (Phase 8.3) - **LIVE**
```python
class PeoplesRelation:
    """Core relationship: A added B to their Peoples"""
    user_id: str        # Who added
    peoples_id: str     # Who was added
    trust_level: str    # HDOS trust level
    category: str       # Custom grouping
```

#### `hdos_trust.py` (HDOS v2) - **LIVE**
```python
class TrustLevelKey(str, Enum):
    PEOPLES = "PEOPLES"      # Level 1 - Highest trust
    COOL = "COOL"            # Level 2
    CHILL = "CHILL"          # Level 3
    ALRIGHT = "ALRIGHT"      # Level 4
    OTHERS = "OTHERS"        # Level 5
    OTHERS_SAFE = "OTHERS_SAFE"  # Level 6
    BLOCKED = "BLOCKED"      # Level 7 - No access
```

#### `circles.py` (Phase 11.5.3) - **LIVE**
```python
class CircleType(str, Enum):
    COMMUNITY = "community"
    SUPPORT = "support"
    PRAYER = "prayer"
    FAITH = "faith"

class Circle:
    id, name, slug, description
    circle_type: CircleType  # Presentation layer
    pillar: CirclePillar
    privacy_level, member_count
```

### C. Messaging Models

#### `messaging.py` - **LIVE**
```python
class Conversation:
    id, participants: List[str]
    last_message, last_activity_at
    is_group, group_name

class Message:
    id, conversation_id, sender_id
    content, message_type
    attachments, reactions
```

---

## 3. EXISTING COMPONENTS (Partial/Dormant Features)

### A. Short-Form Video System
| Component | Location | Status |
|-----------|----------|--------|
| `ShortFormPage.jsx` | `/pages/shortform/` | **PARTIAL** - UI exists |
| `shortform.py` (routes) | `/backend/routes/` | **LIVE** - Upload, feed, likes |
| `ShortFormDB` | `/backend/db/` | **LIVE** - MongoDB operations |
| Video storage | `/backend/uploads/shortform/` | **LIVE** - Local storage |

**Capabilities:**
- Video upload (MP4, MOV, AVI, WEBM up to 100MB)
- Discovery feed (trending, for-you, following)
- Likes, views tracking
- Categories, safety ratings

**Missing:**
- Mobile-optimized viewer
- Creator tools
- Audio sync
- Duets/stitches

### B. Infinite Circle Engine (People-of-Peoples)
| Component | Location | Status |
|-----------|----------|--------|
| `InfiniteCirclePage.jsx` | `/pages/circles/` | **PARTIAL** |
| `CircleDepthTabs.jsx` | `/components/circles/` | **PARTIAL** |
| `CircleUserCard.jsx` | `/components/circles/` | **PARTIAL** |
| `TrustScoreDisplay.jsx` | `/components/circles/` | **PARTIAL** |
| `circle_engine.py` | `/backend/routes/` | **LIVE** |

**Capabilities:**
- Depth-based circle visualization (1-6 degrees)
- Trust score display
- People-of-peoples queries

**Missing:**
- Full UI polish
- Interactive graph view
- Real-time updates

### C. Multi-Format Post Composer
| Component | Location | Status |
|-----------|----------|--------|
| `SocialPostComposer.js` | `/components/social/` | **LIVE** |
| `MediaComposerModal.js` | `/components/social/` | **LIVE** |
| `MediaUploader.js` | `/components/social/` | **LIVE** |
| `LinkPreviewCard.js` | `/components/social/` | **LIVE** |

**Supported Formats:**
- Text posts ✅
- Image posts (multi-image) ✅
- Link previews ✅
- Emoji insertion ✅
- Video posts ⚠️ (backend ready, UI partial)
- Polls ❌
- Articles ❌

### D. Community Circles (Support Groups)
| Component | Location | Status |
|-----------|----------|--------|
| `SocialCirclesPage.jsx` | `/pages/portals/social/` | **LIVE** |
| `CircleDetailPage.jsx` | `/pages/portals/social/` | **LIVE** |
| `circles.py` (routes) | `/backend/routes/` | **LIVE** |

**Current State:**
- 22 seeded circles (6 community, 10 support, 5 prayer, 1 faith)
- Circle type tabs
- Circle detail view
- Join button (placeholder)

**Missing:**
- Circle posts/feed
- Member management
- Moderation tools

---

## 4. PLANNED-BUT-NOT-IMPLEMENTED CONCEPTS

### A. "Social World" Container Vision
**Original Concept:**
A unified container for multiple social modes, all governed by:
- One identity (BANIBS profile)
- One People System (HDOS trust)
- One content policy

**Modes Envisioned:**
1. **Feed** - Traditional social feed (✅ LIVE)
2. **Chat** - Direct messaging (✅ LIVE)
3. **Circles** - Community groups (✅ PARTIAL)
4. **Moments** - Photo/visual stories (❌ PLACEHOLDER)
5. **ShortForm** - Vertical video (⚠️ PARTIAL)
6. **Voice** - Audio content (❌ PLACEHOLDER)
7. **Live** - Live streaming (❌ PLACEHOLDER)
8. **Talent** - Creator showcase (❌ PLACEHOLDER)
9. **Marketplace** - Social commerce (❌ PLACEHOLDER)

### B. Mode Selector UI
**Concept:** A unified navigation allowing users to switch between social modes
**Status:** `SocialWorldHome.jsx` has a grid of mode cards, but:
- No persistent mode state
- No cross-mode navigation bar
- Each mode is essentially a separate page

### C. Alternate Social Views
**Planned:**
- "For You" algorithmic feed
- "Following" chronological feed
- "Peoples Only" filtered feed
- "Discovery" trending/explore

**Current State:**
- Single feed with visibility filtering
- No algorithmic personalization
- Basic trending via hashtags

### D. Content Abstraction Layer
**Planned Concept:** Universal "Content" model supporting:
- Polymorphic media (text/image/video/audio)
- Cross-mode sharing
- Unified engagement metrics

**Current State:**
- `SocialPost` and `ShortFormVideo` are separate models
- No shared content abstraction
- Separate engagement tracking per type

---

## 5. SUMMARY STATUS MATRIX

| Feature | Backend | Frontend | Status |
|---------|---------|----------|--------|
| **Social Feed** | ✅ | ✅ | **LIVE** |
| **Profile System** | ✅ | ✅ | **LIVE** |
| **Peoples System (HDOS)** | ✅ | ⚠️ | **PARTIAL** |
| **Community Circles** | ✅ | ✅ | **LIVE** |
| **Messaging** | ✅ | ✅ | **LIVE** |
| **Short-Form Video** | ✅ | ⚠️ | **PARTIAL** |
| **Infinite Circle Engine** | ✅ | ⚠️ | **PARTIAL** |
| **Social World Hub** | ❌ | ⚠️ | **PLACEHOLDER** |
| **Moments/Stories** | ❌ | ❌ | **PLACEHOLDER** |
| **Voice Share** | ❌ | ❌ | **PLACEHOLDER** |
| **Live Streaming** | ❌ | ❌ | **PLACEHOLDER** |
| **Social Commerce** | ❌ | ❌ | **PLACEHOLDER** |

---

## 6. KEY ARCHITECTURAL DECISIONS

### What Exists and Works:
1. **Single identity** across all social features (BANIBS profile)
2. **HDOS Trust System** governing visibility and access
3. **Circle-based organization** (Community + Support + Prayer + Faith)
4. **Multi-format posting** (text, image, link) in main feed
5. **Direct messaging** with conversations

### What's Partially Built:
1. **Short-form video** - Backend complete, frontend needs polish
2. **Infinite Circle visualization** - API exists, UI incomplete
3. **Circle posts** - Model exists, no feed implementation

### What's Conceptual Only:
1. **Social World as a unified mode container**
2. **Cross-mode content sharing**
3. **Algorithmic feed personalization**
4. **Live streaming infrastructure**
5. **Audio/voice content system**

---

*Document maintained for Founder governance. Not for public distribution.*
