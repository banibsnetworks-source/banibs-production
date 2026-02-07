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

## Recent Updates (February 7, 2026 - Session 4)

### ✅ P0 - ChatSphere v1 Activation (COMPLETED)
BANIBS's private messaging system is now live in Social World.

**Features Implemented:**
- Changed ChatSphere status from 'coming-soon' to 'active' in Social World
- Created branded `ChatSpherePage.jsx` with full messaging UI
- Purple gradient branding with MessageSquare icon
- "ChatSphere - Private Conversations" header
- "Back to Social World" navigation
- Conversation list sidebar with search
- "Welcome to ChatSphere" empty state
- 1:1 and small group chat support
- Persistent message history

**Files:**
- **Modified**: `/app/frontend/src/pages/socialworld/SocialWorldHome.jsx` - ChatSphere now active
- **Created**: `/app/frontend/src/pages/socialworld/ChatSpherePage.jsx` - Full ChatSphere page
- **Modified**: `/app/frontend/src/App.js` - Added `/socialworld/chat/:conversationId` route

**Routes:**
- `/socialworld/chat` - ChatSphere main page
- `/socialworld/chat/:conversationId` - Specific conversation

### ✅ P0 - NEO Share Feature v1 (COMPLETED)
Platform-neutral sharing for Commons posts.

**Design Philosophy (LOCKED):**
- Platform-neutral: No Facebook/Twitter/Instagram buttons or logos
- BANIBS is the source of truth; users decide where to share links
- "Share → Copy link" is the only action

**Features Implemented:**
- Created `ShareButton.jsx` component with dropdown
- Click "Share" → reveals "Copy link" option
- Copies canonical post URL to clipboard
- Shows "Link copied" toast confirmation
- Mobile: Optional native share sheet (still generic)
- No platform branding anywhere

**Files:**
- **Created**: `/app/frontend/src/components/social/ShareButton.jsx`
- **Modified**: `/app/frontend/src/components/social/SocialPostCard.js` - Uses ShareButton

**Placement:**
- Alongside Like/Comment in Commons post action bar
- Expandable later to Frames & Foundation pages

---

## Recent Updates (February 6, 2026 - Session 3)

### ✅ Go Live Button - SAFE v1 (COMPLETED)
Implemented a super_admin-only system toggle for site mode management.

**Backend:**
- `POST /api/system/site-mode` - Toggle site mode (super_admin only)
- `GET /api/system/site-mode` - Get current mode (public)
- `GET /api/system/site-mode/history` - Get audit log (super_admin only)
- Persists to `banibs_settings` collection with audit logging

**Frontend:**
- Go Live / Go Preview button in Founder Control Center header
- Live status indicator (green pulsing dot) / Preview indicator (amber)
- Confirmation modal before toggle
- Last changed timestamp with user attribution
- **Files Modified**: `/app/frontend/src/pages/founder/FounderControlCenter.js`
- **Files Created**: `/app/backend/routes/system.py`

**Hard constraints enforced:**
- Only super_admin can toggle
- No auto-enabling of Stripe/Donations
- No exposure of founder/admin routes
- Reversible actions only

### ✅ P0 - My Posts Rendering Bug (VERIFIED WORKING)
- Verified posts render correctly - 10 post cards displayed
- Post count matches rendered count
- API returns correct data structure
- No "No posts yet" empty state when posts exist

### ✅ Bio Prep - Schema Only (COMPLETED)
Added nullable bio expansion fields to user schema (no UI):
- `headline` - Short tagline/title
- `about` - Long-form bio text
- `location` - Optional location string
- `focus_tags` - Array of focus/interest tags

**Files Modified**: `/app/backend/models/unified_user.py`
- Added to `User` model
- Added to `UserPublic` model
- Added to `UserUpdate` model

---

## Earlier Updates (February 6, 2026 - Session 2)

### ✅ P0 - BANIBS Social World Naming + UX Integration (COMPLETED)
Implemented canonical naming for all Social World sections:
- **Commons** (PRIMARY): Main social/news exchange (replaced "Feed")
- **Pulse** (LOCKED): Short-form vertical video (replaced "ShortForm")  
- **Frames** (placeholder): Image-forward posts (replaced "Moments")
- **Notes** (placeholder): Short written thoughts (replaced "Stories")
- **Circles** (active): Community/group spaces

**Changes Made:**
1. **SocialWorldHome.jsx**: Already had canonical WORLDS array
2. **LeftRail.js**: Shows "Commons" in main navigation
3. **App.js**: Updated routes to use new FramesPage and NotesPage components
4. **SocialProfilePublicPage.js**: "Back to Commons" (was "Back to Feed")
5. **SocialSettingsDisplay.js**: "Back to Commons" (was "Back to Feed")
6. **ComingSoon.jsx**: "Explore Commons" (was "Explore Social Feed")
7. **ShortFormPage.jsx**: Empty state says "Pulse video" (was "ShortForm video")
8. **FounderControlCenter.js**: Description updated with canonical names

**Files Created:**
- `/app/frontend/src/pages/socialworld/FramesPage.jsx` - New placeholder for Frames
- `/app/frontend/src/pages/socialworld/NotesPage.jsx` - New placeholder for Notes

**Routes (with legacy aliases):**
- `/socialworld` → Social World hub
- `/socialworld/pulse` | `/socialworld/shortform` → Pulse page
- `/socialworld/frames` | `/socialworld/moments` → Frames placeholder
- `/socialworld/notes` | `/socialworld/stories` → Notes placeholder
- `/portal/social` → Commons (main social feed)

### ✅ P0 - "My Posts" Rendering Bug (VERIFIED WORKING)
- Verified that "My Posts" feature renders posts correctly
- Post count (10) matches rendered posts (10)
- API endpoint `/api/social/users/{user_id}/posts` returns correct data
- Frontend properly displays posts in profile Posts tab

---

## Earlier Updates (February 6, 2026 - Session 1)

### ✅ P1 - Marketplace: Persistent Diaspora Region Sub-Nav (COMPLETED)
- Added persistent "Diaspora Region Bar" to `MarketplaceLayout.jsx`
- Bar displays all 6 regions: Africa, Caribbean, North America, South America, Europe, Asia
- Active region highlighted with amber-500 background
- Sticky positioning ensures visibility while scrolling
- Mobile responsive with horizontal scroll
- **Files Modified**: `/app/frontend/src/components/marketplace/MarketplaceLayout.jsx`

### ✅ P0 - News Description HTML Rendering (COMPLETED)
- Added DOMPurify library for safe HTML sanitization
- Created `SafeHtmlRenderer.jsx` component for rendering sanitized HTML
- Created `sanitizeHtml.js` utility with XSS protection
- Updated news components to render HTML descriptions safely:
  - `NewsHeroSection.js`
  - `NewsSectionBlock.js`
  - `TopStoriesGrid.js`
  - `NewsFeed.js`
- External links automatically get `target="_blank"` and `rel="noopener noreferrer"`
- Added CSS styles for safe HTML content
- **Files Added**:
  - `/app/frontend/src/utils/sanitizeHtml.js`
  - `/app/frontend/src/components/SafeHtmlRenderer.jsx`
- **Files Modified**: 4 news components updated

### ✅ P0 - ShortForm Video Submit Wiring (VERIFIED COMPLETE)
- Backend upload endpoint already exists at `/api/shortform/upload`
- Frontend `UploadVideoModal.jsx` fully implemented with:
  - File selection with type/size validation (100MB max)
  - XHR upload with progress tracking
  - Title, description, category, safety rating fields
  - Success/error handling
- CSS import added to `ShortFormPage.jsx`
- **Endpoint**: `POST /api/shortform/upload`
- **Files**: `/app/frontend/src/components/shortform/UploadVideoModal.jsx`

### ✅ P1 - Social World Visual Liveness Pass (COMPLETED)
- Added Black-centered hero banner image to Social World home
- Added background images to Active World cards (Community, ShortForm, Circles, ChatSphere)
- Added feature tags (Video • Photo • Voice, Circles • Communities, Creator Tools)
- Improved visual hierarchy with gradient overlays
- Mobile responsive design maintained
- **Image URLs Used**:
  - Hero: `unsplash.com/photo-1768244016470-271b210a8407` (Three friends laughing)
  - Community: `unsplash.com/photo-1655028065229-d39b85cba6e2` (People gathering)
  - Others: Mixed Black-centered community and conversation images
- **Files Modified**: `/app/frontend/src/pages/socialworld/SocialWorldHome.jsx`

### ✅ P1 - Social World Icon/Tile Visual Maturity Upgrade (COMPLETED)
- Removed all cartoon/emoji-style icons from Social World tiles
- Redesigned Active Worlds section with image-based tiles:
  - Full background images with hover zoom effect
  - Clean dark gradient overlays for text readability
  - Typography-first design (bold world name, subtle description)
  - Subtle accent border on hover
  - "Last used" indicator with pulsing dot
- Redesigned Coming Soon section:
  - Clean typographic tiles without icons
  - Muted gradient backgrounds
  - Status indicator with dot + text
- Updated Hero section:
  - Removed sparkle emoji
  - Added "BANIBS Platform" label with decorative lines
  - Clean white feature tags without colored backgrounds
- Visual style now aligns with Login, Marketplace, and Community hubs
- **Files Modified**: `/app/frontend/src/pages/socialworld/SocialWorldHome.jsx`

### ✅ P1 - Social World Coming Soon Visual Rebalance (COMPLETED)
- Removed heavy greyscale/disabled styling from Coming Soon tiles
- Applied "Low-Contrast but Alive" treatment:
  - White/near-white text (90% opacity) instead of gray
  - Colored gradient dots per tile matching world theme
  - "Opening Soon" labels in warm amber color
  - Subtle colored gradient backgrounds (15% opacity, 20% on hover)
  - Visible borders (10% white opacity)
- Section header changed from gray to amber accent
- Tooltip added: "This world is opening in a future phase"
- Tiles remain non-clickable (cursor: default, role: presentation)
- **Files Modified**: `/app/frontend/src/pages/socialworld/SocialWorldHome.jsx`

### ✅ P0 - ShortForm Navigation Fix (COMPLETED)
- Added circular back arrow button in ShortForm header
- Button navigates to Social World home (`/socialworld`)
- Styled with hover effect (amber accent on hover)
- Works on both mobile and desktop
- **Files Modified**: 
  - `/app/frontend/src/pages/shortform/ShortFormPage.jsx`
  - `/app/frontend/src/styles/shortform.css`

### ✅ P0 - Groups Tab Response Clone Error Fix (COMPLETED)
- Root cause: rrweb session recording intercepting fetch responses
- Solution: Migrated groupsApi.js from fetch() to XMLHttpRequest using existing xhrRequest utility
- This is the same proven pattern used by other APIs (messagingApi, phase83Api)
- **Files Modified**: `/app/frontend/src/api/groupsApi.js`

### ✅ P0 - Groups Dropdown Visibility Fix (COMPLETED)
- Fixed dropdown to use dark background (bg-gray-800) with white text
- Added proper focus states with yellow ring
- Dropdown options readable on both desktop and mobile
- **Files Modified**: `/app/frontend/src/pages/portal/social/GroupsPage.jsx`

### ✅ P1 - Image Focal Point / Crop Adjust (Facebook-like) (COMPLETED)
- Created `ImageFocalPointAdjuster.jsx` modal component with:
  - Visual preview of the feed crop
  - Vertical position slider (Top ↔ Bottom)
  - "Fill Card" (cover) vs "Show Full" (full) toggle
  - Drag-to-reposition on preview
  - Mobile touch support
- Updated `MediaUploader.js`:
  - "Adjust" button appears on each uploaded image
  - Stores `focalY` (0-1) and `fitMode` per media item
  - "Adjusted" badge shows when focalY !== 0.5
- Updated `MediaComposerModal.js` to include focal point data in post submission
- Updated `SocialPostMediaGrid.jsx`:
  - Renders images using `object-position: 50% ${focalY * 100}%`
  - Supports both string URLs and object URLs with focal data
  - Backward compatible (old posts render with default center crop)
- Added CSS styles for Adjust button and Adjusted badge
- **Data Model**: `{ url, type, focalY: 0.5, fitMode: 'cover' }`
- **Files Created**: `/app/frontend/src/components/social/ImageFocalPointAdjuster.jsx`
- **Files Modified**: 
  - `/app/frontend/src/components/social/MediaUploader.js`
  - `/app/frontend/src/components/social/MediaUploader.css`
  - `/app/frontend/src/components/social/MediaComposerModal.js`
  - `/app/frontend/src/components/social/SocialPostMediaGrid.jsx`

### ✅ P0 - "Show Full" Must Actually Show Full (Full Poster Mode) (COMPLETED)
- Added new fitMode: `"full"` for true full-image display
- **Full Poster Mode** (`fitMode: "full"`):
  - Removes aspect-ratio wrapper constraint
  - Uses `height: auto` to show natural image height
  - Max-height capped at 90vh for safety
  - No cropping, no clipping - entire image visible in feed
- Updated `ImageFocalPointAdjuster.jsx`:
  - "Show Full" button now sets `fitMode: 'full'` (not 'contain')
  - Preview shows full image with "Full Poster Mode" badge
  - Green confirmation message when Full mode selected
- Updated `SocialPostMediaGrid.jsx` v2.1:
  - Three fit modes: `cover` | `contain` | `full`
  - Full mode uses new `singleMediaWrapFull` style with no aspect ratio
  - Backward compatible (old posts unchanged)
- Removed `overflow-hidden` from `SocialPostCard.js` article wrapper to prevent clipping
- Updated `MediaUploader.css`:
  - "Full Poster" badge (green) vs "Adjusted" badge (amber)
- **Files Modified**:
  - `/app/frontend/src/components/social/ImageFocalPointAdjuster.jsx`
  - `/app/frontend/src/components/social/SocialPostMediaGrid.jsx`
  - `/app/frontend/src/components/social/SocialPostCard.js`
  - `/app/frontend/src/components/social/MediaUploader.js`
  - `/app/frontend/src/components/social/MediaUploader.css`

### ✅ P0 - Profile Edit, My Posts & Navigation Fixes (COMPLETED)
**Issue 1: Edit Profile - Display Name Not Saving**
- Updated `SocialProfileEditPage.js` to use XMLHttpRequest instead of fetch
- This bypasses the rrweb "Response body already used" error
- Added `refreshUser()` call after successful save to update navbar display name
- **Files Modified**: `/app/frontend/src/pages/portals/SocialProfileEditPage.js`

**Issue 2: "My Posts" → Profile Not Found**
- Root cause: User profile didn't have a `handle` field set in database
- Fixed backend `/api/social/profile/u/{handle}` endpoint to:
  - Allow owner to view their own profile regardless of `is_public` setting
  - Use optional auth to detect if viewer is the profile owner
- Updated `LeftRail.js` to use user ID as fallback when handle is not set
- Added proper error handling in `SocialProfilePublicPage.js` for missing params
- Seeded test user profile with required `handle` field
- **Files Modified**:
  - `/app/backend/routes/social_profile.py`
  - `/app/frontend/src/components/social/LeftRail/LeftRail.js`
  - `/app/frontend/src/pages/portals/SocialProfilePublicPage.js`

**Issue 3: "Back to Social Feed" Navigation**
- Verified working - "← Back to Feed" link at `/portal/social/u/{handle}` routes to `/portal/social`
- No redirect loops observed

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
- [x] **Alternative School Hub Phase-0 Scaffold (COMPLETE - February 5, 2026)**
  - **Purpose**: Read-only display of tutors, programs, and learning resources for alternative education
  - **Backend:**
    - Models: `TutorListing`, `ProgramCategory`, `LearningResource` with status (founding/developing/future)
    - Collections: `alt_school_tutors`, `alt_school_programs`, `alt_school_resources`
    - Public APIs: `GET /api/alt-school/{hub, tutors, programs, resources}`
    - Admin APIs: `POST/PUT/DELETE /api/alt-school/admin/{tutors, programs, resources}`
    - Seed endpoint: `POST /api/alt-school/admin/seed` (idempotent)
  - **Frontend:**
    - Page: `/portal/community/school` via `SchoolHomePage.jsx`
    - Stats row showing counts
    - Tutor cards with avatar, subject, location, grade range
    - Program cards with descriptions
    - Resource cards with category badges and external links
    - Status badges: Active (founding), Coming Soon (developing)
  - **Test coverage**: 100% (24 backend + UI tests passed)
  - **Files:**
    - `/backend/routes/alternative_school.py`
    - `/backend/db/alternative_school.py`
    - `/backend/models/alternative_school.py`
    - `/frontend/src/pages/community/SchoolHomePage.jsx`
- [x] **Login Page Identity Anchor (COMPLETE - February 5, 2026)**
  - Added expanded platform name beneath BANIBS title on login page
  - **Display:** "BANIBS" (gold gradient, 5xl/6xl - dominant) + "Black America News, Information & Business System" (gray-500, secondary)
  - **Functional descriptor updated:** "Your network. Your news. Your marketplace. Connected."
  - Visible immediately on page load (above sign-in form)
  - BANIBS is strongest visual element with highest contrast
  - Preserves existing premium layout and hero imagery
  - **File:** `/frontend/src/pages/auth/SignInPage.jsx`
- [x] **Tutor Intake Form - Phase-0.5 (COMPLETE - February 5, 2026)**
  - Capture-only form for educators to apply to be listed in Alternative School Hub
  - **Frontend Form** (`/portal/community/school/become-a-tutor`):
    - Required fields: Name, Email, Location, Subject/Focus, Age/Grade Range, Bio (50-600 chars), Consent checkbox
    - Optional fields: Phone, Website, Availability
    - Success message: "Applications reviewed in phases. You'll be contacted if there's a fit."
  - **CTA Button** added to SchoolHomePage: "Apply to Be Listed"
  - **Backend API**:
    - Public: `POST /api/alt-school/intake/tutors` - Submit application
    - Admin: `GET/PUT /api/alt-school/admin/intake/tutors` - List/update submissions
    - Admin: `GET /api/alt-school/admin/intake/stats` - Submission counts by status
  - **Admin Review Page** (`/founder/tutor-intake`):
    - Stats row with status filter buttons
    - Submissions table with detail modal
    - Status update (new → reviewed → approved/rejected) + admin notes
  - **Collection:** `tutor_intake_submissions`
  - **Test coverage**: 100% (14 backend + full UI verification)
  - **Files:**
    - `/backend/routes/alt_school_intake.py`
    - `/backend/db/alt_school_intake.py`
    - `/backend/models/alt_school_intake.py`
    - `/frontend/src/pages/community/BecomeTutorPage.jsx`
    - `/frontend/src/pages/founder/TutorIntakeAdmin.jsx`
- [x] **News Mode Control UX Honesty Fix (COMPLETE - February 6, 2026)**
  - **Problem**: MoodMeter in top nav looked like a clickable "News Mode" selector but was read-only
  - **Fix Applied**:
    - Changed `cursor-pointer` to `cursor-default` (no longer looks clickable)
    - Added clarifying tooltip text: "This reflects the current mood of news content. Feed modes roll out in phases."
    - Added `data-testid="mood-meter"` for testing
  - **Result**: Users understand it's a sentiment indicator, not a mode selector
  - **Future Work (Phase-1)**: Full News Mode implementation (Balanced/Chronological/Curated) - scoped separately
  - **File:** `/frontend/src/components/MoodMeter.js`
- [x] **Phase-0 Content Seeding (COMPLETE - February 6, 2026)**
  - Populated three community hubs with credible, heritage-focused starter content
  - **Food & Culture Hub (5 recipes)**:
    - Sunday Baked Chicken (Family-Style) - Deep South heritage
    - Collard Greens with Smoked Turkey - nutritious with history
    - Jollof Rice (West African Roots) - diaspora connection
    - Sweet Potato Pie (Holiday Tradition) - cultural preservation
    - Cornbread Variations Across Regions - regional diversity
    - Each includes cultural note, ingredients, healthier version option
  - **Fitness & Movement Hub (5 programs)**:
    - 15-Minute Morning Stretch (No Equipment) - beginner, accessible
    - Walking as Daily Movement - cardiovascular, all abilities
    - Chair Mobility for Seniors - seated exercise
    - Youth Sports & Community Play - family engagement
    - Breathing & Reset Routines - stress management
    - Each includes safety note, who it's for, chronic-friendly tags
  - **Health & Insurance Hub (5 resources)**:
    - Understanding Health Insurance Terms (Plain Language)
    - Primary Care vs Emergency Care
    - Preventive Screenings by Age Group
    - Mental Health Resources Overview
    - Advocating for Yourself in Healthcare Settings
    - All include disclaimers, external resource links
  - **Admin seed endpoints**:
    - `POST /api/community/admin/seed/food`
    - `POST /api/community/admin/seed/fitness`
    - `POST /api/community/admin/seed/health`
    - `POST /api/community/admin/seed/all` (all three at once)
  - **Files Modified:** `/backend/routes/community.py`

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
Download: `https://community-pulse-85.preview.emergentagent.com/guest_site.zip`

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
