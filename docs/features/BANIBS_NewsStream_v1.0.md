# 📕 BANIBS NewsStream™ – Developer Specification v1.0

**Route:** `/portal/newsstream`  
**Tagline:** "Where the Community Tells the Story"  
**Core Ethos:** Local + National, community-powered, no comments, anonymous-safe, peace-aware.

---

## 1. High-Level Overview

### Goal:
Implement BANIBS NewsStream™ as a dedicated News portal page where users can:

- Watch a scrollable feed of short community news videos and reports.
- Filter view by:
  - **My Stream** (personal blend)
  - **My City** (local news)
  - **Nationwide** (big stories across Black America)
- Submit news reports:
  - From BANIBS Social (post composer → "Share as NewsStream")
  - Directly from NewsStream page → "Submit a News Report"
- Use **AnonymousSafe™**:
  - Hide from Social timeline
  - Post anonymously (identity hidden from public)
  - Free: 4 anonymous posts per month, membership tiers unlock more.
- Use **Peace Mode (🔕)** to temporarily hide/minimize hard/traumatic news.
- **Like 👍** stories and **share** them to Social.
- **No comments** on NewsStream itself. Discussion only happens when shared to Social.

---

## 2. Routes & Navigation

### Frontend Routes

**GET `/portal/newsstream`**
- Main NewsStream page.
- Shows:
  - Tabs: My Stream | My City | Nationwide
  - Peace Mode toggle
  - "Submit a News Report" button
  - Feed list of stories based on selected tab.

**(Optional, v1 can be modal) GET `/portal/newsstream/upload`**
- Dedicated upload page for direct NewsStream submission.
- Can be implemented as:
  - A standalone route with form, OR
  - A modal on `/portal/newsstream` (preferred UX).
- Must support:
  - Video upload
  - Title, summary, location, category, tone, scope
  - Toggles for anonymity & hiding from social.

### Backend Endpoints (Proposed)

**Namespace suggestion:** `/api/newsstream`

**GET `/api/newsstream/feed`**
- Returns stories according to:
  - `view = my_stream | my_city | nationwide`
  - user's profile (city, membership, Peace Mode)
- Query params:
  - `view`: string
  - `cursor`: string (for pagination)
  - `limit`: int
- Response: list of `NewsStreamStoryDTO` + `next_cursor`.

**POST `/api/newsstream`**
- Create a new NewsStream story (direct upload).
- Body: `CreateNewsStreamStoryPayload`
- Applies AnonymousSafe limits, moderation status `pending_review`.
- Returns created story metadata or status.

**POST `/api/newsstream/from-social`**
- Used when a Social post is "also shared as NewsStream".
- Payload includes Social post id and additional NewsStream data (category, tone, scope, location, anonymity flags).

**POST `/api/newsstream/{story_id}/like`**
- Toggles like by current user.
- Returns updated `likes_count` and whether liked.

**POST `/api/newsstream/{story_id}/share`**
- (Optional helper) Tools for creating a Social post stub with "Shared from BANIBS NewsStream".
- Can be done client-side by hitting Social API directly; this is just a convenience.

**POST `/api/newsstream/{story_id}/flag`**
- For users to report an item.
- Body: `{ reason: string, details?: string }`
- Increments flag count, may auto-hide on threshold and/or queue for moderation.

**Admin / Moderator endpoints (can be separate namespace):**
- `GET /api/newsstream/moderation/queue`
- `POST /api/newsstream/{story_id}/moderate`
- `POST /api/newsstream/{story_id}/retag`

---

## 3. Data Models

Use these as guides for MongoDB + Pydantic (backend) and TS types (frontend).

### 3.1 NewsStreamStory (Backend model)

```python
class NewsStreamStory(BaseModel):
    id: str
    created_by_user_id: str  # always stored, even for anonymous
    source_type: Literal["community_upload", "trusted_reporter", "banibs_editorial"]

    # Public-facing identity/exposure
    show_name: bool          # true = show user identity on NewsStream
    show_on_social_timeline: bool  # true = linked to their Social timeline

    # Content
    title: str
    summary: str
    media_type: Literal["video", "image", "mixed"]
    media_url: str           # main video URL (or poster if image only)
    thumbnail_url: Optional[str]
    duration_seconds: Optional[int]

    # Location
    city: str
    state: str
    country: str = "USA"
    geo_region: Optional[str]  # e.g. "ATL_Metro"

    # Classification
    category: Literal[
        "politics", "community", "uplift", "crime_safety",
        "business", "youth", "faith", "entertainment", "sports", "other"
    ]
    tone: Literal["hard", "positive", "light", "neutral"]
    scope: Literal["local", "regional", "national", "global"]

    # Status / Moderation
    status: Literal["pending_review", "approved", "rejected", "hidden", "escalated"]
    flags_count: int = 0
    rejection_reason: Optional[str]

    # Metrics
    likes_count: int = 0
    views_count: int = 0
    shares_count: int = 0

    # Timestamps
    created_at: datetime
    updated_at: datetime
    approved_at: Optional[datetime]
```

### 3.2 Feed DTO (Frontend)

```typescript
export type NewsStreamSourceType = "community_upload" | "trusted_reporter" | "banibs_editorial";

export interface NewsStreamStoryDTO {
  id: string;
  title: string;
  summary: string;
  mediaType: "video" | "image" | "mixed";
  mediaUrl: string;
  thumbnailUrl?: string;
  durationSeconds?: number;

  city: string;
  state: string;
  country: string;
  category: string;  // display label
  tone: "hard" | "positive" | "light" | "neutral";
  scope: "local" | "regional" | "national" | "global";

  sourceType: NewsStreamSourceType;
  displaySourceLabel: string; // "Community Report", "Trusted Reporter", "BANIBS Editorial"

  isAnonymous: boolean; // derived from show_name=false
  likesCount: number;
  userHasLiked: boolean;
  sharesCount: number;
  createdAt: string;    // ISO
}
```

### 3.3 AnonymousSafe Tracking

```python
class AnonymousPostingCounter(BaseModel):
    user_id: str
    month_key: str  # e.g. "2025-11"
    anonymous_posts_used: int
    tier: Literal["free", "silver", "gold", "platinum"]
    monthly_limit: int | None  # None/Null = unlimited for platinum
```

---

## 4. AnonymousSafe™ Enforcement Logic

### 4.1 Limits

- **Free:** `monthly_limit = 4`
- **Silver:** e.g. 10
- **Gold:** e.g. 20
- **Platinum:** None (unlimited)

### 4.2 Enforcement on Create

In `POST /api/newsstream` and `POST /api/newsstream/from-social`:

1. If `payload.post_anonymously == False` → skip AnonymousSafe checks (still may hide from social).
2. If `post_anonymously == True`:
   - Fetch user's membership tier.
   - Compute `month_key = YYYY-MM` from server date.
   - Find or create `AnonymousPostingCounter` document for `(user_id, month_key)`.
   - If `monthly_limit` is not None and `anonymous_posts_used >= monthly_limit`:
     - Return error: `ANONYMOUS_LIMIT_REACHED`.
     - Include "upgrade suggestion" in message (Silver/Gold/Platinum).
   - Else:
     - Allow creation.
     - Increment `anonymous_posts_used += 1`.
     - Story stored with:
       - `show_name = False`
       - `source_type` adjusted if user is Trusted Reporter, etc.

---

## 5. Feed Algorithm & Views

### 5.1 Views

**GET `/api/newsstream/feed?view=...`**

- `view=my_stream` (default)
- `view=my_city`
- `view=nationwide`

The backend will need:
- `user_home_city`, `user_home_state` from profile.
- `user_peace_mode` state (on/off + snooze duration).
- `user_membership_tier` (for extra tuning if needed).

### 5.2 Tone Balance

**Global rule:**  
Without Peace Mode, in the mix of visible posts, hard news should be around **1 in 7 items** (not strict but directional).

**With Peace Mode ON:**
- Hard news heavily reduced or removed (except emergency/high-priority alerts).
- Positive / light / uplift / community / entertainment / sports favored.

### 5.3 My City View

**Filter upstream:**
```python
stories = find stories where (
    (city == user_home_city OR geo_region == user_region) 
    AND status == "approved"
)
+ optionally (state-wide scope == "regional")
```

Then:
- Apply tone balancing.
- Respect Peace Mode filter.
- Rank by:
  - Recency
  - Local likes/shares
  - Priority for Trusted Reporter & BANIBS Editorial.

### 5.4 Nationwide View

**Filter upstream:**
```python
stories = find stories where (
    scope == "national" OR
    (high_trending_local_stories promoted to national)
)
AND status == "approved"
```

Rank by:
- Trending (likes, shares, views).
- Recency.
- Geographical diversity (avoid one city dominating).
- Apply tone/Peace Mode rules.

### 5.5 My Stream View (Blended)

**Rough starting weights (can be config):**
- 60% Local/Regional (My City + Region)
- 30% Nationwide important
- 10% Personal "For You" flavor (based on categories user interacts with)

**Implementation:**
```python
local_bucket = get_local_stories(user, limit = X)
national_bucket = get_national_stories(user, limit = Y)
personal_bucket = get_personalized(user, limit = Z)

merged = interleave(local_bucket, national_bucket, personal_bucket, preserving tone balance and Peace Mode)
```

Return merged slice according to pagination.

---

## 6. Peace Mode (🔕)

### 6.1 User State

Add to user profile or separate table:

```python
class PeaceModeState(BaseModel):
    user_id: str
    is_enabled: bool
    snooze_until: Optional[datetime]  # when to auto-turn off
```

### 6.2 Frontend UI

On `/portal/newsstream`:

Small banner/control:
```
[🔕 Peace Mode: OFF]   (toggle switch)
```

When ON:
```
🔕 Peace Mode (Hard News Paused – {duration label})
[Resume Now]
```

**Snooze options (when enabling):**
- 24 hours
- 48 hours
- 72 hours
- Until tomorrow morning
- Custom (optional later)

### 6.3 Backend Behavior

When Peace Mode is ON and `current time < snooze_until`:
- In feed query composition:
  - Filter out or heavily downrank `tone == "hard"`.
  - Still allow emergency category items via a separate "ALERT STRIP" if implemented later.
- When `now >= snooze_until`, auto turn off.

---

## 7. Upload Flows

### 7.1 From BANIBS Social

Modify Social post composer (frontend):

Add section:
```
[ ] Share this as a NewsStream Report

(if checked)
   Category: [select]
   Tone: [Hard | Positive | Light | Neutral]
   Scope: [Local | Regional | National | Global]
   Location: City, State (required for news)
   [ ] Hide from my Social timeline
   [ ] Post anonymously
```

On submit:
1. Create or update Social post as usual.
2. Also send a `POST /api/newsstream/from-social` payload:
```json
{
  "social_post_id": "abcd1234",
  "title": "...",          // can reuse Social title or ask separate
  "summary": "...",
  "media_url": "...",      // reference same media
  "category": "community",
  "tone": "positive",
  "scope": "local",
  "city": "Atlanta",
  "state": "GA",
  "post_anonymously": true,
  "hide_from_social_timeline": true
}
```

### 7.2 Direct from NewsStream Page

On `/portal/newsstream`:

**Button:** "Submit a News Report"

Shows modal or navigates to `/portal/newsstream/upload` with:
- Title
- Summary
- Video upload (or pick from existing library, optional)
- Category
- Tone
- Scope
- City, State
- ☐ Hide from my Social timeline
- ☐ Post anonymously

**Submit** → `POST /api/newsstream`.

Backend runs AnonymousSafe and moderation logic.

---

## 8. Permissions & Identity Rules

Even for anonymous posts:
- `created_by_user_id` is always stored and visible to admins/moderators.

Public-facing:
- If `show_name == False`: display "Submitted by Community Reporter".
- If `show_name == True` and not hidden from Social: show username/avatar as usual.

When user chooses:
- `hide_from_social_timeline == True`:
  - Story is not linked to Social timeline activity feed.
  - Still appears in NewsStream depending on scope/tone/etc.

---

## 9. Likes, Shares, and Comments Rules

### 9.1 Likes

**Endpoint:** `POST /api/newsstream/{id}/like`

Toggle behavior:
- If user already liked → unlike, decrement.
- If not liked → like, increment.
- `likes_count` is visible on each story card.

### 9.2 Shares

**Action on frontend:** "Share to My Feed"

Result:
- Creates a Social post with:
  - Text: "Shared from BANIBS NewsStream"
  - Embedded preview (thumbnail, title)
  - Link to play the story.
  - No reference to original poster identity if anonymous.
- On NewsStream card, you may show `shares_count` if desired.

### 9.3 Comments

**Strict Rule:** No comments on NewsStream page. No comment count. No comment UI.

- Comments are allowed on the Social post created when user shares the story.
- Trusted/Platinum reporters can reply on their own Social posts, not on NewsStream.

---

## 10. Membership Tier Integration

All membership logic can plug into existing subscription / billing system.

**Key interactions:**
- AnonymousSafe limits enforced based on `membership_tier`.
- **Trusted Reporter badge & behavior:**
  - Enabled for Platinum + manual approval (or future auto logic).
  - On feed card, display a small "Trusted Reporter" badge in the source label.

**Future extended benefits (not required in v1 but supported by design):**
- Higher upload sizes
- More frequent posting
- Visibility boosts
- Early access to features

---

## 11. Moderation Workflow (Backend)

When created:
- `status = "pending_review"`

**Auto-filter (optional):**
- AI model or simple rules for explicit/hate/graphic content.

**Moderator UI (later):**
- List of pending stories.
- View video + metadata.
- **Actions:**
  - Approve → `status = "approved"`, set `approved_at`
  - Reject → `status = "rejected"`, set reason
  - Hide (soft) → `status = "hidden"`
  - Retag → adjust category, tone, scope

**Flags:**
- `POST /api/newsstream/{story_id}/flag`
- On threshold:
  - Auto set `status = "hidden"` (soft hide)
  - Queue for manual review.

---

## 12. Frontend Components (Suggested)

**Directory suggestion:**  
`/app/frontend/src/pages/newsstream/` and `/components/newsstream/`

### Components:

**NewsStreamPage.jsx**
- Handles:
  - Tabs: My Stream / My City / Nationwide
  - Peace Mode toggle UI
  - "Submit a News Report" button
  - Fetching feed for current view
  - Infinite scroll / pagination

**NewsStreamStoryCard.jsx**
- Props: `NewsStreamStoryDTO`
- Renders:
  - Thumbnail/video
  - Title, summary
  - Category + source label
  - City/State
  - Likes count + like button
  - Share button
- Handles:
  - `onLikeClick`
  - `onShareClick` (calls Social share flow)

**NewsReportUploadModal.jsx**
- Props: `isOpen`, `onClose`, `mode` ("direct" vs "fromSocial"?)
- Form fields for new story.
- Submit handler calls `POST /api/newsstream`.

**PeaceModeToggle.jsx**
- Shows state and triggers update via `/api/user/peacemode` (or similar).

**LocationSelector.jsx**
- Used when user changes "My City".

---

## 13. Rollout Checklist for Neo

When Neo is ready to implement:

### Backend
- [ ] Add `NewsStreamStory` model + DB collection.
- [ ] Implement `AnonymousPostingCounter` and membership limit logic.
- [ ] Implement `GET /api/newsstream/feed`.
- [ ] Implement `POST /api/newsstream` + `/from-social`.
- [ ] Implement `POST /api/newsstream/{id}/like`.
- [ ] Implement flag endpoint + basic moderation queue tools.
- [ ] Add `PeaceModeState` & endpoints to toggle it.

### Frontend
- [ ] Add `/portal/newsstream` route.
- [ ] Build `NewsStreamPage` with tabs + Peace Mode.
- [ ] Integrate API calls for feed, likes, share.
- [ ] Implement upload modal with all NewsStream + AnonymousSafe UI options.
- [ ] Wire Social composer to optionally create NewsStream stories (from-social).

### Config / Settings
- [ ] Define membership tiers and monthly anonymous limits (Free=4, Silver=10, Gold=20, Platinum=Unlimited).
- [ ] Add user city and state fields to profile if not already present.
- [ ] Add Peace Mode UI and backend field.

### Testing
- [ ] Free user: try 4 anonymous posts → 5th should prompt upgrade.
- [ ] Membership user: verify higher limits.
- [ ] Anonymous posts: verify identity hidden in all feeds, visible in admin panel.
- [ ] Peace Mode: toggle and verify hard stories drop out in all three views.
- [ ] Share flow: share a story, verify Social post shows "Shared from BANIBS NewsStream" and anonymous identity is NOT exposed.

---

**End of Specification v1.0**
