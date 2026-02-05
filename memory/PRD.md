# BANIBS - Product Requirements Document

## Original Problem Statement
BANIBS is a multi-feature platform for the Black diaspora, featuring news, social networking, business directory, wallet, marketplace, and more. The platform includes:
- A public "Coming Soon" / Guest Page for pre-launch orientation
- CCR Anchor Module (CCRAM) for real-time interview assistance
- Various community and business tools

## Current Production Status
- **AWS Production Server (BANIBS-PROD-01)**: Live and stable
- **HTTPS**: Fully configured (banibs.com / www.banibs.com)
- **SSL**: Let's Encrypt with auto-renewal
- **Mode**: FULL INTERNAL / BUILDER MODE (All modules visible)

---

## P0 ROLLBACK - FULL INTERNAL MODE (January 29, 2026)

The system has been rolled back from News-First gating to Full Internal Mode:
- **All Coming Soon interception DISABLED**
- **All module routes RESTORED** (Social, Marketplace, TV, Wallet, Community, etc.)
- **Sign In visible** in navigation header for internal use
- **RBAC still enforces permissions** - visibility ≠ permission escalation

### Rationale
News-First gating was blocking visibility and troubleshooting during debug phase.
Founder needs full access to ALL modules to stabilize the system.

### Next Phase (Later, Explicit)
After auth + routing + module health is verified, News-First mode can be reintroduced with:
- Explicit allowlists
- Founder-only overrides
- Zero chance of lockout

---

## Navigation (GlobalNavBar) - FULL INTERNAL MODE
All links visible:
- BANIBS News (/)
- Black News (/news/black)
- U.S. (/news/us)
- World (/news/world)
- Business News (/news/business)
- Sports (/news/sports)
- Business Directory (/business-directory)
- BANIBS Social (/social)
- Resources (/resources)
- Marketplace (/portal/marketplace)
- BANIBS TV (/portal/tv)
- Wallet (/portal/wallet)
- Community (/portal/community)

### Public Features
- ✅ Sign In button visible in header
- ✅ All modules accessible for debugging
- ✅ Theme toggle (dark/light) available
- ✅ RBAC permissions still enforced

---

## What's Been Implemented

### Infrastructure (COMPLETE - LOCKED)
- [x] AWS Production Server setup
- [x] HTTPS/SSL configuration
- [x] Let's Encrypt auto-renewal via cron
- [x] Docker Compose finalized
- [x] HTTP → HTTPS redirect

### Guest Page / Coming Soon Page (COMPLETE)
- [x] Full redesign with editorial feel
- [x] BANIBS acronym expansion (Black America News Information & Business System)
- [x] Hero image with Black community visual anchor
- [x] Mission section explaining BANIBS purpose
- [x] Founder's book section with 5 canonical books
- [x] Waitlist functionality
- [x] Status signal: "The full system is opening in phases."
- [x] Static build package ready at `/app/deploy/guest_site/`
- Route: `/guest`

### News System (COMPLETE)
- [x] News Homepage with CNN-style layout
- [x] Section pages: Black News, U.S., World, Business, Sports, etc.
- [x] RSS aggregation from multiple sources
- [x] Image validation and category-level fallbacks
- [x] Trending panels
- [x] Sentiment indicators
- [x] Mood filtering

### CCR Anchor Module - CCRAM (COMPLETE)
- [x] Phase 1 (MVP): GPT-4o text classification and response generation
- [x] Phase 2: Whisper STT + OpenAI TTS for audio
- [x] Phase 2.1: NQR (No Quick Response) timing logic
- Route: `/ccram`

---

## Prioritized Backlog

### P0 - Critical (Current)
- [x] News-first public launch configuration
- [x] Hide unfinished modules from public nav
- [x] Remove BANIBS TV cards from news pages
- [x] **HDOS v2 Circle Trust Order System (COMPLETE - January 30, 2026)**
- [x] **News Feed Aesthetics Pass (COMPLETE - January 30, 2026)**
- [x] **Founder Office Vault Phase 1 (COMPLETE - January 30, 2026)**
- [x] **BANIBS & HDOS Foundation Pages (COMPLETE - January 30, 2026)**
- [x] **Circles Guest Page (COMPLETE - January 30, 2026)**
- [x] **Book Links Refactoring (COMPLETE - January 30, 2026)** - Centralized into booksConfig.js
- [x] **Circles Page Visual Enhancement (COMPLETE - January 30, 2026)** - Warm gradient, glow effects
- [x] **Founder Office Valuation Posture Audit (COMPLETE - January 30, 2026)** - Confirmed no valuation UI exists
- [x] **Global Image Fix - Multi-Fallback Rotation (COMPLETE - February 2, 2026)**
  - Created `/frontend/public/fallbacks/` with 4 high-quality fallback images (network nodes, bokeh city, connected people)
  - Refactored `ImageWithFallback.js` with deterministic hash-based fallback selection
  - Updated `NewsSectionBlock.js`, `TopStoriesGrid.js`, `NewsHeroSection.js` to use new `itemId` prop
  - Same article always gets same fallback image (consistent UX)
  - **Coverage Gap Fix**: Added detection of old backend Unsplash fallback URLs (10 patterns) to force local fallback usage
  - **Regression Fix**: Added detection of tracking pixels and invalid image URLs (npr-rss-pixel, 1x1, spacer, etc.)
  - Now ALL pages (Homepage, US, Politics, World, etc.) use new fallback rotation consistently
- [x] **Social Page Auth Redirect Loop Fix (COMPLETE - February 2, 2026)**
  - Fixed nav link: Changed "BANIBS Social" from `/social` (landing page) to `/portal/social` (actual feed)
  - Authenticated users now see full social feed with composer and sidebar
  - Unauthenticated users see preview page with "Join" and "Sign In" CTAs (no redirect loop)
- [x] **Glass Drawer Toggle (COMPLETE & LOCKED - February 3, 2026)**
  - Added user preference toggle at bottom of nav drawer ("Glass Drawer: ON/OFF")
  - localStorage persistence (`navDrawerStyle = "solid" | "glass"`)
  - **Solid mode (default)**: Pure white/black opaque drawer for maximum readability
  - **Glass mode**: Dark 15% opacity / Light 18% opacity with `blur(16px) saturate(180%)`
  - Both modes work in Light and Dark themes
  - Original translucent aesthetic restored with toggle option
  - Backdrop dimming removed (zero page dim when drawer opens)
  - **DO NOT MODIFY** unless explicitly reopened by user
- [x] **Marketplace Demo/Seed Products (COMPLETE & LOCKED - February 3, 2026)**
  - Created `/frontend/public/marketplace-images/` with 12 product-specific images
  - Added demo products to `MarketplaceHomePage.jsx` (8 shown on home)
  - Added region-specific demo products to `MarketplaceRegionPage.jsx` (4-6 per region)
  - Products include: Kente cloth, spice jars, skincare, wooden sculptures, coffee, hair care, jewelry, drums, baskets, journals
  - Demo products auto-hide when real products exist
  - **DO NOT reuse news fallback images in Marketplace**
  - **DO NOT MODIFY** unless explicitly reopened by user
- [x] **P3 - Founder Analytics Dashboard (COMPLETE - February 3, 2026)**
  - Created `/backend/routes/founder_analytics.py` with `/api/founder/analytics/overview` endpoint
  - Created `/frontend/src/pages/founder/FounderAnalyticsDashboard.jsx`
  - Dashboard displays: Total Users, Total Articles, Total Posts, Demo Orders (mock_paid)
  - System Health panel: Backend Health, Database Connected, Build Version
  - Refresh button and last updated timestamp
  - Role-gated: super_admin only
  - Fixed localStorage key: `access_token` (not `token`)
- [x] **P2 - Social Page Visual Layer (COMPLETE - February 3, 2026)**
  - Added `CommunityMomentsStrip` component to `SocialPortal.js`
  - Displays 5 curated Unsplash images showing Black community/social moments
  - Positioned between tip banner and post composer
  - Includes "Share yours" and "Add yours" CTAs
  - Images have hover zoom effects
  - Strip is horizontally scrollable
- [x] **Black News Content Routing Fix (COMPLETE - February 3, 2026)**
  - **Backend**: Strict source-level filtering only - no keyword-based inclusion from non-Black sources
  - **Frontend**: Show `black_focus_type` badges (Africa, Caribbean, Diaspora, etc.) instead of category
  - **DB Cleanup**: Removed incorrectly tagged items from non-Black sources
  - Files: `black_news_tagging_service.py`, `TopStoriesGrid.js`, `BlackNewsPage.jsx`
- [x] **Book Vault Studio v1 (COMPLETE - February 3, 2026)**
  - Founder-only book authoring system (super_admin access)
  - **Backend**: `/api/book-vault/*` endpoints for books and chapters
  - **Frontend**: `BookVaultStudio.jsx` (book list) + `BookEditor.jsx` (chapter editor)
  - Features: Create/edit/delete books, chapter-based writing, autosave (2s debounce)
  - Distraction-free editor with Georgia serif font
  - Link added to Founder Control Center
  - **Left drawer**: Primary BANIBS modules only (News, Directory, Social, Resources, Marketplace, TV, Wallet, Community)
  - **Top bar**: Section title ("News") + global actions (Search) - minimal, no category overload
  - **Sub-nav**: News categories only appear on news pages (Top Stories, Black News, U.S., World, etc.)
  - Clear separation: WHERE (drawer) → WHAT section (top bar) → WHICH category (sub-nav)
  - Removed duplicate news category items from left drawer
  - Made top bar compact (no icons, reduced padding, shortened labels) to eliminate horizontal scrolling
  - Control Plane section retained for Founder/Admin access
  - Added `sectionTitle` prop to GlobalNavBar for context
- [x] **Community Circles Exposure (COMPLETE & LOCKED - February 3, 2026)**
  - Backend: Auto-seeding of 6 default community circles via `GET /api/circles`
  - Circles: Black Entrepreneurs Network, Parents & Caregivers Support, Mental Health & Wellness, Black in Tech, Black Creatives Collective, Faith & Spirituality
  - Frontend: `SocialCirclesPage.jsx` listing all circles with cards
  - Card displays: name, description, tags, member count, privacy level, verified badge
  - Left rail "Circles" link navigates to `/portal/social/circles`
  - Intentional empty state for when no circles exist
  - UI surfacing only (no creation, join rules, or moderation)
  - Route: `/portal/social/circles`
  - **DO NOT MODIFY** unless explicitly reopened by user
- [x] **Last Used World Persistence (COMPLETE - February 4, 2026)**
  - Created `/frontend/src/hooks/useWorldPersistence.js` hook for consistent persistence
  - localStorage key: `banibs:last_world`, default: `community`
  - Each world page (Community, ShortForm, Circles, Chat) calls hook on mount
  - `/socialworld` page shows "Last used" indicator on the correct world card
  - Dropdown selector reflects current world from localStorage
  - Persistence works across: page refresh, direct navigation, world card clicks
  - **Test coverage**: 9/9 tests passed (100%)
  - Files updated: `SocialWorldHome.jsx`, `ShortFormPage.jsx`, `SocialCirclesPage.jsx`, `MessagingHomePage.jsx`, `SocialPortal.js`
- [x] **Donations v1 - Operations Support (COMPLETE - February 4, 2026)**
  - External Stripe Payment Link integration (no backend payment processing)
  - **Guest Page (`/guest`)**: Added "Support BANIBS" section with donate button
  - **In-App Support Page (`/portal/support`, `/support`)**: Clean donation page with infrastructure & security info
  - **User Menu**: Added "Support BANIBS" link (gold color, heart icon)
  - Stripe URL: `https://buy.stripe.com/6oU00jaPqeMffyx0hk3sI00`
  - Files: `ComingSoonPage.jsx`, `SupportPage.jsx`, `GlobalNavBar.js`, `App.js`
- [x] **Login Page UX Polish (COMPLETE - February 4, 2026)**
  - Changed "Welcome back to BANIBS" → "Sign in to BANIBS" (neutral language for public page)
  - Changed subtext "Sign in to continue where you left off" → "Access your account"
  - Changed "Back to Home" → "Browse News" (links to public `/news` not auth-gated `/`)
  - "Welcome back" language now only appears on authenticated pages (Hub, etc.)
  - Login form remains centered and visually primary
  - Files: `SignInPage.jsx`, `AuthLayout.jsx`
- [x] **Meta-Governance v1 (COMPLETE - February 4, 2026)**
  - Structural visibility layer for system complexity management
  - **Governing Rule (LOCKED)**: May Observe, Flag, Suggest. May NOT Decide, Enforce, Punish, Override.
  - **Backend API** (`/api/governance/*`):
    - `/overview` - System counts (total circles, by type, by visibility, orphaned, dormant)
    - `/signals` - Attention flags (orphaned, dormant, large without governance, missing config)
    - `/circles` - Circle inventory table with sorting/filtering
    - `/templates` - Opt-in governance templates (institutional, support_care, community_open, founder_experimental)
  - **Frontend**: New "Governance" tab in Founder Control Center with sub-tabs:
    - System Overview (counts only)
    - Attention Signals (informational flags)
    - Circle Inventory (sortable table: name, type, visibility, members, admins, mods, rules, entry, status)
    - Templates (opt-in guidance)
  - **Access**: Founder/super_admin only
  - **EXPLICITLY FORBIDDEN**: Content inspection, ranking, scoring, auto-enforcement, moderation
  - Files: `/backend/routes/governance.py`, `FounderControlCenter.js`
- [x] **Feed Image Display Fix (COMPLETE - February 5, 2026)**
  - **Problem**: Portrait/poster images (promo flyers, announcements) were being cropped in feed
  - **Root Cause**: Fixed height containers with `object-fit: cover` cropped portrait content
  - **Fix Applied**:
    - Single images: `aspect-ratio: 4/5` + `object-fit: contain` (no cropping)
    - Dark letterbox background (`#0b0b0b`) for clean presentation
    - Multi-image grids (2-4+) keep `object-cover` (designed for thumbnails, click opens full)
  - **Result**: BANIBS now displays full promo images like Facebook - no cropping
  - Files: `SocialPostMediaGrid.jsx`, `SocialPostCard.js`
- [x] **Media Display System v2.0 (COMPLETE - February 5, 2026)**
  - Extended clarity-first ruleset to VIDEO and MIXED MEDIA
  - **Canonical UI Rules:**
    - RULE 1: Single media (image OR video) = CONTAIN, no cropping
    - RULE 2: Grid thumbnails (2+) = COVER, cropping OK
    - RULE 3: Mixed media (image+video) = treated as grid
    - RULE 4: Single video = full frame, contain, controls, no autoplay
    - RULE 5: Performance = lazy load, preload="metadata" for video
  - **Video Support:**
    - Feed: Full frame display with controls, playsInline, no autoplay
    - Grid: Play icon overlay on video thumbnails
    - Modal: Full video playback with autoPlay when opened
  - **Files updated:**
    - `SocialPostMediaGrid.jsx` - Complete rewrite with media type detection
    - `SocialPostCard.js` - Legacy media_url handles video
    - `MediaViewer.jsx` - Video playback in modal (was placeholder)
- [x] **BANIBS Multi-Reaction System v2.0 (COMPLETE - February 5, 2026)**
  - **Problem Fixed**: Like button was showing mismatch (Heart icon + "Like" label), click wasn't working
  - **Root Cause**: Old handler existed but UI needed upgrade
  - **BANIBS-Styled Reactions** (distinct from Facebook):
    - ❤️ Love (respect/appreciation) - default
    - ✋ High Five (support/encouragement)
    - ✌️ Peace (non-escalation/solidarity)
    - 👍 Like (general approval)
    - 😎 Cool (admiration)
  - **Behavior:**
    - Single tap = toggle default reaction (Love)
    - Hover (desktop) / Long-press (mobile) = open reaction tray
    - Click count = open "Who Reacted" modal with filter tabs
  - **Backend API:**
    - `POST /api/social/posts/:id/react` - Toggle reaction with type
    - `DELETE /api/social/posts/:id/react` - Remove reaction
    - `GET /api/social/posts/:id/reactors` - List who reacted with filter
  - **Frontend Components:**
    - `ReactionButton.jsx` - Main button with picker tray
    - `ReactionsModal` - Shows who reacted with filter tabs
    - Updated `SocialPostCard.js` - Uses new ReactionButton
  - **Files:**
    - `/backend/db/social_posts.py` - `toggle_like()` now supports reaction types
    - `/backend/routes/social.py` - New `/react`, `/reactors` endpoints
    - `/frontend/src/components/social/ReactionButton.jsx` (NEW)
    - `/frontend/src/components/social/SocialPostCard.js` (UPDATED)
- [x] **Login Page Premium Redesign v2.0 (COMPLETE - February 5, 2026)**
  - **Problem Fixed**: Page looked "elementary/old", cheap B-square placeholder, sign-in buried below marketing copy
  - **Changes Made:**
    - Sign-in card now TOP/LEFT (primary, visible immediately)
    - Replaced cheap "B" square with gold gradient BANIBS wordmark
    - Added premium hero image panel (right on desktop, below on mobile)
    - Feature blurbs moved BELOW the fold (6-column grid)
    - Modern dark aesthetic (#030303 background)
    - Gold accent color (#C5A059) consistent with BANIBS branding
    - Trust badges: Encrypted, Community-first, Privacy-aware
  - **Layout:**
    - Desktop: 2-column (sign-in left 480px, hero right flex)
    - Mobile: Stacked (sign-in first, hero below, features at bottom)
  - **File:** `/frontend/src/pages/auth/SignInPage.jsx` (complete rewrite)

### P1 - High Priority (Post-Launch)
- [x] HDOS (Circle Trust Order System v2) - 7-level trust system ✅ COMPLETE
- [x] Fix News Feed Aesthetics (thumbnails, empty sections) ✅ COMPLETE
- [x] Founder Office Vault Phase 2 - UI integration ✅ COMPLETE
- [x] BANIBS Book Vault Studio v1 - Book authoring module ✅ COMPLETE
- [x] Community Circles Exposure ✅ COMPLETE
- [ ] Re-enable Social with full functionality
- [ ] **Marketplace Page original bug fix (ON HOLD)** - Empty state rendering issue for logged-in users with real data

### P2 - Medium Priority
- [ ] Raymond Health Core System - Daily tracker
- [ ] Business Directory public release
- [ ] Marketplace launch
- [ ] BANIBS TV content

### P3 - Low Priority / Blocked
- [ ] Password reset emails (BLOCKED - awaiting SMTP credentials)
- [ ] BGLIS phone auth (MOCKED - awaiting provider selection)
- [ ] Backend route refactoring
- [ ] Raw HTML rendering in news description (low priority)

---

## Technical Architecture

### Frontend Key Files
- `/components/GlobalNavBar.js` - Public nav (News-first links only)
- `/components/NewsNavigationBar.js` - Category tabs
- `/components/ImageWithFallback.js` - **Shared image component with deterministic multi-fallback rotation**
- `/components/NewsSectionBlock.js` - News section blocks with fallback images
- `/components/TopStoriesGrid.js` - Top stories grid with fallback images
- `/components/NewsHeroSection.js` - Hero section with fallback images
- `/pages/NewsHomePage.js` - Main news page (TV card hidden)
- `/pages/NewsSectionPage.js` - Section pages (TV card hidden)
- `/pages/BlackNewsPage.jsx` - Black News page
- `/pages/ComingSoonPage.jsx` - Guest Page

### Public Assets
- `/public/fallbacks/` - 4 fallback images for broken news images
  - `news-fallback-01.jpg` - Network nodes world map
  - `news-fallback-02.jpg` - Bokeh city lights  
  - `news-fallback-03.jpg` - Connected people network
  - `news-fallback-04.jpg` - Social network circles

### Backend Key Files
- `/routes/news.py` - News API with image validation
- `/services/news_categorization_service.py` - Category routing

### Key API Endpoints
- `GET /api/news/homepage` - Structured news data
- `GET /api/news/section?section=<name>` - Section-specific news
- `GET /api/news/black` - Black-focused news

---

## Founder Ops Hub (January 29, 2026) - COMPLETE

### P0: Ops Log (COMPLETE - LOCKED)
- [x] Full CRUD API for operational log entries
- [x] Categories: Decision, Bug, Feature, Ops, Infra, HDOS, Note
- [x] Status: Open, Locked, Superseded
- [x] UI integrated in Founder Control Center

### P1: Tasks Kanban (COMPLETE - LOCKED - January 29, 2026)
- [x] Tasks CRUD API with exact data model specification
  - Columns: P0 (Now), P1 (Next), LATER
  - Status: OPEN, IN_PROGRESS, DONE, BLOCKED, ARCHIVED
  - Priority: LOW, MEDIUM, HIGH, CRITICAL
  - Fields: title, description, column, status, priority, tags, order, due_at, owner, linked, audit
- [x] Move endpoint for drag/drop (POST /api/founder-ops/tasks/:id/move)
- [x] Response envelope: {success, data, error}
- [x] Frontend Kanban board with 3 columns
- [x] **Drag-and-drop using @dnd-kit/core + @dnd-kit/sortable**
- [x] Task cards with drag handle, priority badges, status badges
- [x] New Task form with all fields
- [x] Edit and delete functionality

### P1: HDOS Detectors (COMPLETE - LOCKED - January 29, 2026)
- [x] Detectors CRUD API with exact data model specification
  - Domains: HDOS, BANIBS, TRUST, IDENTITY, SOCIAL, BUSINESS, NEWS, SECURITY
  - Types: DOG, BDL_BIS, LPL, SPOOFING_*, TRUST_EROSION_LOOP, PRESSURE_TRANSFER, CUSTOM
  - Status: DRAFT, ACTIVE, PAUSED, DEPRECATED
  - Severity: INFO, LOW, MEDIUM, HIGH, CRITICAL
  - Fields: name, domain, type, status, severity_default, description, canonical_rules, signals, actions, ui, linked, audit
- [x] Response envelope: {success, data, error}
- [x] Frontend Detectors list with domain colors, severity badges, status badges
- [x] Canonical rules displayed on detector cards
- [x] New Detector form with all fields
- [x] Edit and delete functionality

### UI Fix (January 29, 2026)
- [x] Added GlobalNavBar to CommunityLayout - fixes missing left nav on Community route

### P2: Documents Vault (COMPLETE - LOCKED - January 29, 2026)
- [x] Collection: `founder_ops_documents`
- [x] Endpoints: CRUD + upload + download
- [x] File storage: `/app/data/founder_docs` (server filesystem)
- [x] Metadata: id, title, description, tags[], filename, content_type, size_bytes, storage_path, sha256, audit
- [x] SHA256 integrity verification on download
- [x] No public exposure; all endpoints require `super_admin`
- [x] Frontend Documents tab with:
  - Upload form (title, type, tags, description, file)
  - List view with type colors, tags display
  - Download + Delete actions
  - File integrity (SHA256) display

### Database Collections
- `ops_log` - Operational log entries
- `founder_ops_tasks` - Kanban tasks
- `founder_ops_detectors` - HDOS detectors
- `founder_ops_documents` - Document vault
- `hdos_trust_levels` - 7 canonical trust levels (seeded, read-only)
- `hdos_trust_policies` - Trust policies per level (CRUD)
- `hdos_subject_trust` - Subject trust assignments (CRUD)

### Founder Office Vault (Server Filesystem - COMPLETE Phase 1)
**Location:** `/opt/banibs-office/`

**Directory Structure:**
```
/opt/banibs-office/
├── index.json              # Master registry (dedupe, versioning, stats)
├── inbox/                  # Thread sweep JSON imports
├── items/{discoveries,inventions,contacts,projects,tasks,books,glossary,mechanisms,scripts,detectors,policies,ops}/
├── documents/{legal,patents,contracts,ids,screenshots,drafts}/
├── threads/YYYY/MM/        # Thread extracts by date
├── media/{images,audio,video}/
├── exports/                # Exported archives
└── backups/
```

**CLI Tools:**
- `./office_ingest [--file] [--dry-run] [--verbose]` - Process thread sweep JSON
- `./office_export --type TYPE [--confidentiality] [--format zip|md]` - Export filtered items

**Item Schema:** Markdown with YAML frontmatter (id, type, title, status, classification, confidentiality, hash_sha256, version, supersedes)

**Dedupe Logic:** SHA256 hash match → SKIP | Title match with different hash → VERSION | Otherwise → INSERT

### P0: HDOS v2 Circle Trust Order (COMPLETE - LOCKED - January 30, 2026)
**7-level trust hierarchy for managing access and permissions across BANIBS systems.**

**Trust Levels (Canonical Order):**
1. **Peoples** - Highest trust. Inner circle. Full access.
2. **Cool** - High trust. Trusted associates.
3. **CHILL** - Good trust. Relaxed access.
4. **Alright** - Neutral trust. Standard access.
5. **Others** - Default trust. Limited access.
6. **Others • Safe Mode** - Low trust with protection.
7. **Blocked** - No trust. Access denied.

**Backend API Endpoints:**
- `GET /api/hdos/trust/levels` - List all 7 levels (read-only)
- `GET /api/hdos/trust/levels/{level_key}` - Single level
- `POST /api/hdos/trust/levels/seed` - Seed levels (idempotent)
- `GET /api/hdos/trust/policies` - List policies
- `POST /api/hdos/trust/policies` - Create policy
- `PATCH /api/hdos/trust/policies/{id}` - Update policy
- `PATCH /api/hdos/trust/policies/by-level/{level_key}` - Upsert policy by level
- `GET /api/hdos/trust/assignments` - List assignments
- `POST /api/hdos/trust/assignments` - Create assignment
- `PATCH /api/hdos/trust/assignments/{id}` - Update assignment
- `DELETE /api/hdos/trust/assignments/{id}` - Delete assignment
- `GET /api/hdos/trust/check/{subject_id}` - Check effective trust level

**Frontend UI (Founder Control Center > Trust Order tab):**
- Levels sub-tab: Read-only display of 7 canonical levels with colors/icons
- Policies sub-tab: CRUD for managing rules per trust level
- Assignments sub-tab: CRUD for assigning subjects (users/emails/etc.) to levels
- Extensible structure for future "Modes" feature

**Test Coverage:**
- `/app/backend/tests/test_hdos_trust.py` - 17 backend API tests
- 100% backend success rate
- 100% frontend success rate

### File Storage
- `/app/data/founder_docs/` - Document files (protected, super_admin only)

### Test Coverage
- `/app/backend/tests/test_founder_ops_p1.py` - Comprehensive API tests
- 100% backend success rate
- 100% frontend success rate

---

## Static Guest Page Build
Location: `/app/deploy/guest_site/`
Download: `https://socialux-2.preview.emergentagent.com/guest_site.zip`

---

## Known Issues / Edge Cases
1. **Sports section**: Currently 0 stories (no sports RSS sources configured)
2. **Some images**: Show placeholder text watermarks (Unsplash fallbacks)
3. **Minor HTML in descriptions**: Some RSS sources include raw HTML tags
4. **Password reset emails**: NOT WORKING - blocked on SMTP credentials

## Super Admin Access (Configured January 28, 2026)
Two accounts have been granted `super_admin` role with access to:
- `/founder/command` - Founder Control Center
- `/admin/*` - All admin dashboards (opportunities, moderation, analytics)

**Super Admin Accounts:**
1. `raymondneely@banibs.com` - Founder account
2. `raymond3x@gmail.com` - Admin account
3. `test_admin@banibs.com` - Test admin account (Admin123!)

**Note:** Temporary passwords were set during configuration. Rotate these credentials once SMTP/password reset is configured.

### Auth Access Routes (Control Plane)
The following routes are always accessible regardless of Coming Soon mode:
- `/auth/signin` - Main sign-in page
- `/auth/register` - Registration page
- `/auth/forgot-password` - Password reset
- `/login` - Alias that redirects to `/auth/signin`
- `/founder/*` - Founder control routes (redirects to signin if unauthenticated)
- `/admin/*` - Admin routes (redirects to signin if unauthenticated)
- `/about/*` - About pages

## Notes
- BGLIS phone auth system remains MOCKED
- Gmail SMTP blocked pending credentials
- Unfinished modules hidden but routes still accessible if URL typed directly

*Last Updated: January 30, 2026*

---

## Session Completed (January 30, 2026)

### Completed This Session:
1. **HDOS v2 Circle Trust Order** - Full frontend UI (Levels, Policies, Assignments tabs)
2. **News Feed Aesthetics** - Category gradients, empty/sparse state handling
3. **Founder Office Vault Phase 1** - Filesystem MVP with CLI tools
4. **BANIBS & HDOS Foundation Pages** - /about (orientation) + /foundation (15-section canonical source)
5. **Founder Office Vault Phase 2** - UI integration in Founder Hub (Archive, Contacts, Inventions, Books tabs)
6. **Circles Guest Page** - Visual orientation for Circle Architecture (/circles)
