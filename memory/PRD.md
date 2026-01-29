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

### P1 - High Priority (Post-Launch)
- [ ] HDOS (Circle Trust Order System v2) - 7-level trust system
- [ ] BANIBS Book Vault Studio - Book authoring module
- [ ] Re-enable Social with full functionality

### P2 - Medium Priority
- [ ] Raymond Health Core System - Daily tracker
- [ ] Business Directory public release
- [ ] Marketplace launch
- [ ] BANIBS TV content

### P3 - Low Priority / Blocked
- [ ] Password reset emails (BLOCKED - awaiting SMTP credentials)
- [ ] BGLIS phone auth (currently mocked)
- [ ] Backend route refactoring

---

## Technical Architecture

### Frontend Key Files
- `/components/GlobalNavBar.js` - Public nav (News-first links only)
- `/components/NewsNavigationBar.js` - Category tabs
- `/pages/NewsHomePage.js` - Main news page (TV card hidden)
- `/pages/NewsSectionPage.js` - Section pages (TV card hidden)
- `/pages/BlackNewsPage.jsx` - Black News page
- `/pages/ComingSoonPage.jsx` - Guest Page

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

### Database Collections
- `ops_log` - Operational log entries
- `founder_ops_tasks` - Kanban tasks
- `founder_ops_detectors` - HDOS detectors

### Test Coverage
- `/app/backend/tests/test_founder_ops_p1.py` - Comprehensive API tests
- 100% backend success rate
- 100% frontend success rate

---

## Static Guest Page Build
Location: `/app/deploy/guest_site/`
Download: `https://opshub-tasks.preview.emergentagent.com/guest_site.zip`

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

*Last Updated: January 29, 2026*
