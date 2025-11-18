# BANIBS News & TV Integration – Navigation + Placement Spec v1.0

## 1. High-Level Intent

The goal is to:

- Introduce **BANIBS News** as its own top-level portal, separate from BANIBS TV.
- Place **BANIBS NewsStream™** inside the News portal as the primary community news feed.
- Keep **BANIBS TV** as the home for shows, series, and partner programming (e.g., pro news content like David Watts & future partners).
- Keep this spec ready for implementation after Phase 10.0 (Helping Hands) stabilizes.

**This doc does not change Phase 10.0 scope — it's a roadmap for the next phase.**

---

## 2. Top Navigation Layout

### 2.1 Current (Conceptual)

Right now, the top nav conceptually looks like:

- Home
- Social
- Business / Biz
- Helping Hands
- BANIBS TV
- Search

### 2.2 Target Navigation

We want to evolve it to:

- **Home**
- **Social**
- **News**
- **Biz** (or Business)
- **Helping Hands**
- **TV**
- **Search**

**Key changes:**
- Add a dedicated **News** tab.
- Rename "BANIBS TV" to a simple **TV** tab (cleaner, still branded internally).
- Do not remove or replace TV with NewsStream.

### 2.3 Route Mapping

- **News tab** → `/portal/news`
- **TV tab** → `/portal/tv`
- **NewsStream** (previous spec) → `/portal/newsstream` (linked from inside News)

**Implementation detail for later:**
- Use existing portal layout system so News and TV behave like other portal pages (Social, Biz, etc.).

---

## 3. BANIBS News – Structure & Relationship to NewsStream

### 3.1 BANIBS News Overview

`/portal/news` is the news hub. It will:

- Introduce BANIBS News.
- Feature NewsStream as the main community-driven feed.
- Provide entry points for:
  - Local/National NewsStream views
  - Future curated "Breaking News"
  - Future Correspondent / Desk content
  - Future BANIBS editorial/newsroom programs

### 3.2 Layout Concept for `/portal/news`

**Header:**
- Title: **BANIBS News**
- Subline: *News, voices, and context from Black America.*
- Action: **Go to NewsStream** (primary button)

**Main sections (stacked or 2-column depending on layout):**

1. **NewsStream Highlight**
   - Short explanation:
     *"BANIBS NewsStream™ – Where the Community Tells the Story"*
   - Button: **Open NewsStream**
     - Navigates to `/portal/newsstream`
   - Possibly a small preview strip of top stories.

2. **Featured / Curated (Future Phase)**
   - "Today's Top Stories" (curated or algorithmic, from NewsStream or editorial)
   - This can be built in a later phase.

3. **Coming Soon Blocks (Future)**
   - BANIBS National Desk
   - Correspondent Channels
   - Breaking Alerts

**For now, main v1 work:**
- Implement `/portal/news` route.
- Display a hero card that points users to `/portal/newsstream`.

---

## 4. BANIBS TV – Role & Evolution

### 4.1 Purpose

`/portal/tv` is for:

- Long-form video
- Shows & series
- Partner channels (like David Watts and pro news teams)
- BANIBS original programming
- Future live shows, interviews, panels, documentaries, etc.
- Future AI anchor shows using Raymond's digital persona.

**TV is not a scrolling news feed.**  
It's more like hubs/channels with episodes.

### 4.2 Layout Concept for `/portal/tv`

**Header:**
- Title: **BANIBS TV**
- Subline: *Shows, stories, and series from BANIBS and our partners.*

**Sections (future-ready):**

1. **Featured Shows**
   - Large hero for a top program (e.g., "BANIBS Nightly" or partner show).

2. **Categories or Rows**
   - "News & Commentary"
   - "Business & Money"
   - "Community & Culture"
   - "Youth & Voices"
   - "Partner Channels" (e.g., David Watts / OnStage Plus integration later)

3. **Episode Cards**
   - Thumbnails + titles + runtime.

**This is a separate build, but this spec clarifies that TV ≠ NewsStream.**

---

## 5. NewsStream Placement & Links

### 5.1 Direct Route

NewsStream itself remains at:

```
/portal/newsstream
```

(Already specced in `BANIBS_NewsStream_v1.0.md`)

### 5.2 Entry Points

Users should be able to enter NewsStream from:

1. **News tab** → `/portal/news` → "Open NewsStream" button

2. **(Optional future)** Direct shortcut in global nav/left-rail:
   - A small link labeled **NewsStream** under the News icon if you're using a sidebar layout.

3. **Shared links:**
   - Social posts that say "Shared from BANIBS NewsStream" link to either:
     - the story player inside `/portal/newsstream`
     - or a dedicated story detail route like `/portal/newsstream/story/{id}` (future).

---

## 6. UI Placement: Tabs / Left Nav / Global Layout

### 6.1 Top Bar Tabs

**Goal:** keep major portals visible & simple.

**Final top bar:**
```
[Home] [Social] [News] [Biz] [Helping Hands] [TV] [Search]
```

On smaller viewports, this can collapse into a menu, but that's UI responsive detail.

### 6.2 Left Sidebar (If/Where Applicable)

If the app layout has a left sidebar for subsections, then for the **News** section:

When on `/portal/news` or `/portal/newsstream`:

**Left-hand nav can show:**
```
BANIBS News
  - News Home
  - NewsStream
  - (Future) Breaking Alerts
  - (Future) Correspondent Channels
  - (Future) National Desk
```

At this stage, only **News Home** and **NewsStream** need to be functional.

**No changes required right now for TV left-nav**, but it could later mirror a similar structure:
```
BANIBS TV
  - TV Home
  - Shows
  - Partner Channels
  - Live (future)
```

---

## 7. Relationships Between News, NewsStream, and TV

### 7.1 Clear Separation

- **NewsStream** = community-driven, short-form, scrollable video news feed.
- **News** = portal that introduces news, with NewsStream at its core and room to grow into a full news ecosystem.
- **TV** = long-form programming, partner shows, and future live TV formats.

### 7.2 Where Pro News People (Like David Watts) Belong

- David Watts and similar broadcast-level teams belong under **TV → Partner Channels** or a "News & Commentary" row.
- They do **not** replace NewsStream.
- They may optionally be **featured** in the News portal, but their content is TV programming, not community feed items.

---

## 8. Phase & Implementation Notes for Neo

### 8.1 Not in Phase 10.0 Scope

This spec is to be used **after:**
- Helping Hands P0 issues are resolved
- Business Mode P0 issues are resolved

**No changes to nav or new portals should block current fix work.**

### 8.2 Implementation Steps (Later Phase)

When ready to implement:

**Top Nav**
- Add **News** tab routing to `/portal/news`.
- Rename "BANIBS TV" to **TV** (still pointing to `/portal/tv`).

**News Portal**
- Implement `/portal/news` page with:
  - Header (BANIBS News)
  - Short description
  - Primary button → `/portal/newsstream`
  - Slot to show a preview row of top NewsStream stories (optional).

**NewsStream**
- Already specced in `BANIBS_NewsStream_v1.0.md`.
- Link `/portal/newsstream` into `/portal/news` as the hero destination.

**TV Portal**
- Keep `/portal/tv` alive.
- For now, can be simple placeholder or current implementation.
- Future phase: expand to support shows/series/partner channels.

---

## 9. Summary for Neo

- **Do not retire or repurpose BANIBS TV.**
- Introduce a new **News** tab that leads to `/portal/news`.
- Treat **NewsStream** as the primary experience under the News portal, with its own route `/portal/newsstream`.
- **TV's purpose:** long-form shows, partner content, and future pro broadcasting.
- **News's purpose:** community news, NewsStream, future editorial/correspondent content.

---

**End of Specification v1.0**
