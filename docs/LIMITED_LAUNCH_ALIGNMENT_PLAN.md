# BANIBS LIMITED-LAUNCH ALIGNMENT PLAN
**Generated:** 2026-03-16  
**Scope:** Social + Business Directory + News (Marketplace hidden)

---

## 1 — EMAIL SYSTEM LOCKDOWN

### Current Reset Flow State
- **Frontend:** `/auth/forgot-password` → form submits email
- **Backend:** `POST /api/auth/forgot-password` in `/app/backend/routes/unified_auth.py`
- **Email Service:** `/app/backend/services/email_service.py`
- **Status:** LOGS EMAIL BUT DOES NOT SEND

### Code Flow (Working):
```
1. User submits email → forgot-password endpoint
2. Token generated → stored in DB with 1hr expiry
3. Reset link built → https://infinite-circles-mvp.preview.emergentagent.com/auth/reset-password?token=XXX
4. HTML email template rendered
5. send_email() called → LOGS ONLY (no SMTP)
```

### Exact SMTP Variables Required
```bash
# Add to /app/backend/.env
SMTP_HOST=smtp.sendgrid.net      # or smtp.resend.com
SMTP_PORT=587
SMTP_USER=apikey                 # for SendGrid
SMTP_PASS=SG.xxxxxx              # actual API key
EMAIL_FROM=BANIBS <noreply@banibs.com>
```

### Provider Assumptions in Code
- **Standard SMTP with STARTTLS** (port 587)
- Compatible with: SendGrid, Resend, Mailgun, AWS SES, Gmail SMTP
- Uses `smtplib.SMTP` with `starttls()`

### Pages/Routes/Functions Depending on Email
| Feature | File | Blocked? |
|---------|------|----------|
| Password Reset | `/app/backend/routes/unified_auth.py` | YES |
| Test Email | `/app/backend/routes/debug.py` | YES |
| Opportunity Approved | `/app/backend/routes/opportunities_legacy.py` | YES |
| Opportunity Rejected | `/app/backend/routes/opportunities_legacy.py` | YES |
| Weekly Newsletter | `/app/backend/routes/newsletter.py` | YES |

### A. Pre-Credential Prep Tasks (Neo Can Do Now)
1. ✅ Email service code already exists and is well-structured
2. ✅ Password reset flow complete (just needs SMTP)
3. ⬜ Update `reset_link` domain from preview to production URL
4. ⬜ Add fallback messaging if SMTP fails (user-friendly error)
5. ⬜ Add "check your spam folder" copy to success message

### B. Exact Credential List Raymond Must Supply
| Credential | Purpose | Notes |
|------------|---------|-------|
| `SMTP_HOST` | Email server hostname | e.g., `smtp.sendgrid.net` |
| `SMTP_PORT` | Server port | Usually `587` for TLS |
| `SMTP_USER` | Auth username | `apikey` for SendGrid |
| `SMTP_PASS` | API key or password | Keep secret |
| `EMAIL_FROM` | Sender address | `BANIBS <noreply@banibs.com>` |

**Recommended Provider:** SendGrid (free tier: 100 emails/day)

---

## 2 — MARKETPLACE TO COMING SOON

### Every Marketplace Route Currently Exposed

| Route | File | Current State |
|-------|------|---------------|
| `/portal/marketplace` | `MarketplaceHomePage.jsx` | Shows demo products |
| `/portal/marketplace/region/:regionId` | `MarketplaceRegionPage.jsx` | Shows demo products |
| `/portal/marketplace/store/:storeId` | `MarketplaceStorePage.jsx` | Placeholder |
| `/portal/marketplace/product/:productId` | `MarketplaceProductPage.jsx` | Partial |
| `/portal/marketplace/checkout` | `MarketplaceCheckoutPage.jsx` | Placeholder |
| `/portal/marketplace/orders` | `MarketplaceOrdersPage.jsx` | Placeholder |
| `/portal/marketplace/seller/dashboard` | `MarketplaceSellerDashboardPage.jsx` | Partial |
| `/socialworld/marketplace` | `MarketplacePage.jsx` | Shows demo products |
| `/about/marketplace` | `MarketplaceLandingPage.jsx` | Info page |

### Navigation Entries to Modify

| Location | Item | Action |
|----------|------|--------|
| `SocialWorldHome.jsx` line 140-145 | "Social Shop" tile | HIDE or mark COMING SOON |
| Portal navigation (if exists) | Marketplace link | HIDE or mark COMING SOON |

### Conversion Plan

**Option A: Hide Completely (Recommended for Launch)**
1. Comment out marketplace routes in `App.js` (lines 803-810)
2. Remove "Social Shop" from `SocialWorldHome.jsx` WORLDS array
3. Keep `/about/marketplace` as info page (optional)

**Option B: Show as Coming Soon**
1. Replace `MarketplaceHomePage.jsx` content with Coming Soon message
2. Keep routing but show "Marketplace Opening Soon" hero
3. Disable all navigation to sub-routes

### Exact Files to Modify

| File | Change |
|------|--------|
| `/app/frontend/src/App.js` | Comment out routes 803-810 |
| `/app/frontend/src/pages/socialworld/SocialWorldHome.jsx` | Remove marketplace from WORLDS (line 140-145) |
| `/app/frontend/src/pages/marketplace/MarketplaceHomePage.jsx` | Replace with Coming Soon (if Option B) |

### How to Avoid Demo-Data Confusion
- Remove `DEMO_PRODUCTS` array from `MarketplaceHomePage.jsx`
- Or gate demo data to `!user` (guest only)
- Add clear "Opening [Month]" messaging

---

## 3 — BLACK BUSINESS ACCOUNT / DIRECTORY PATH

### What Already Exists

| Feature | Status | Files |
|---------|--------|-------|
| Business Profile Create | ✅ COMPLETE | `BusinessProfileCreate.jsx`, `POST /api/business` |
| Business Profile Edit | ✅ COMPLETE | `BusinessProfileEdit.js` |
| Business Profile Public View | ✅ COMPLETE | `BusinessProfilePublic.js` |
| Business Directory | ✅ COMPLETE | `BusinessDirectoryV2.1.js` |
| Business Search | ✅ COMPLETE | `/api/business/search` |
| Business Handle System | ✅ COMPLETE | Auto-generate or custom |
| Business Board (posts) | PARTIAL | `BusinessBoardPage.js` |
| Business Analytics | PLACEHOLDER | Stub pages |
| Business Team | PLACEHOLDER | Stub pages |

### Current User Path for Business Creation
```
1. User logs in
2. Navigate to /portal/business/profile/create
3. Fill form: name, tagline, category, services, location
4. Handle auto-generated or custom
5. Profile created → public at /b/:handle
6. Appears in /directory (Business Directory)
```

### Is Business Tied to Marketplace Seller?
**NO** — Business profiles are SEPARATE from marketplace seller accounts.
- Business Profile = identity + directory listing
- Marketplace Seller = commerce capability (not yet implemented)

### What Needs Building/Separating
| Item | Priority | Notes |
|------|----------|-------|
| Clear CTA on guest page | P1 | "Register Your Business" button |
| Onboarding flow refinement | P2 | Multi-step wizard |
| Business verification badge | P3 | Future |
| Business-to-business messaging | P3 | Future |

### Routes Involved
| Route | Purpose | Status |
|-------|---------|--------|
| `/portal/business/profile/create` | Create business | ✅ READY |
| `/portal/business/profile/edit` | Edit business | ✅ READY |
| `/b/:handle` | Public business page | ✅ READY |
| `/directory` | Business directory | ✅ READY |
| `/portal/business/board` | Business posts | PARTIAL |

### Minimum Viable Version to Ship Now

**Business Creation & Discovery is LAUNCH-READY:**
1. ✅ Create business profile with name, tagline, category, services
2. ✅ Auto-generate unique handle (e.g., `/b/raymonds-barbershop`)
3. ✅ Public profile page with contact info
4. ✅ Directory listing with search/filter
5. ⬜ Add prominent "Register Your Business" CTA on guest page

**Backend Files:**
- `/app/backend/routes/business.py`
- `/app/backend/routes/business_directory.py`
- `/app/backend/routes/business_search.py`

**Frontend Files:**
- `/app/frontend/src/pages/business/BusinessProfileCreate.jsx`
- `/app/frontend/src/pages/business/BusinessProfilePublic.js`
- `/app/frontend/src/pages/business/BusinessDirectoryV2.1.js`

---

## 4 — NEWS / INFORMATION AUDIT

### Current Architecture
```
RSS Sources (config/rss_sources.py)
    ↓
RSS Parser (utils/rss_parser.py)
    ↓
MongoDB (news collection)
    ↓
API Endpoints (/api/news/*)
    ↓
Frontend Components
```

### Source List Currently in Use (Active)
| Category | Sources | Status |
|----------|---------|--------|
| Global Diaspora | BBC World, Al Jazeera, NPR World, Deutsche Welle, Black Enterprise | ✅ Active |
| Africa Watch | Africa News, All Africa | ✅ Active |
| Caribbean | News Americas Now, Caribbean News | ✅ Active |
| Culture/Civil Rights | The Root (Black-owned), Blavity | ✅ Active |
| Business & Finance | Black Enterprise | ✅ Active |
| Entertainment | Various | ✅ Active |

**Total Active Sources:** ~40+ (from 85+ configured)
**Disabled Sources:** Reuters (DNS fail), AP (timeout), VOA (404)

### Ingestion Method
- **Scheduler:** Every 6 hours via `/api/news/rss-sync`
- **Manual Trigger:** Admin endpoint available
- **Items Per Source:** 5 most recent
- **Deduplication:** SHA256 fingerprint

### Current Item Count
- **Health Check Reports:** 1365 news items in database

### Category/Tag Behavior
- Categories come from source config: Global Diaspora, Africa Watch, Caribbean, etc.
- Black focus tagging via `black_news_tagging_service.py`
- Tags: `black_us`, `africa`, `caribbean`, `diaspora`, `hbcu`, `civil_rights`, `culture`, `business`

### International / Middle East Coverage
- **Al Jazeera World:** ✅ ACTIVE (covers Middle East, Gaza, global conflicts)
- **BBC World:** ✅ ACTIVE
- **Deutsche Welle:** ✅ ACTIVE
- **Reuters/AP:** ❌ DISABLED (connection issues)

**Assessment:** Middle East coverage IS surfacing via Al Jazeera and BBC.

### Feed Quality Assessment
| Metric | Status |
|--------|--------|
| Broad | ✅ Yes (40+ sources, 10 categories) |
| Shallow | ⚠️ Only 5 items per source per sync |
| Stale | ⚠️ 6-hour refresh cycle |
| Noisy | ⚠️ Some non-relevant items slip through |

### Quality Risks
1. **Stale during fast news cycles** — 6hr gap can miss breaking news
2. **Missing major sources** — Reuters, AP disabled
3. **No editorial curation** — fully automated
4. **No ranking beyond recency** — newest wins

### Recommended Adjustments
| Priority | Change | Impact |
|----------|--------|--------|
| P1 | Increase sync frequency to 2hr | Fresher content |
| P2 | Fix Reuters/AP feeds (alt RSS URLs) | Better coverage |
| P2 | Add featured/pinned story capability | Editorial control |
| P3 | Add manual boost/bury for stories | Quality control |

### Files/Config Involved
- `/app/backend/config/rss_sources.py` — Source definitions
- `/app/backend/tasks/rss_sync.py` — Sync pipeline
- `/app/backend/routes/news.py` — API endpoints
- `/app/backend/services/black_news_tagging_service.py` — Tagging logic

---

## 5 — PUBLIC OPENING SURFACE

### ✅ PUBLIC for Initial Opening

| Feature | Route | Status |
|---------|-------|--------|
| Guest Page | `/guest`, `/` | ✅ READY |
| Login | `/auth/signin` | ✅ READY |
| Signup | `/auth/register` | ✅ READY |
| Commons (Social Feed) | `/portal/social` | ✅ READY |
| Circles | `/portal/social/circles` | ✅ READY |
| Circle Detail | `/portal/social/circles/:slug` | ✅ READY |
| Circle Feed | `/circle/:circleId/feed` | ✅ READY |
| Post Composer | (modal) | ✅ READY |
| Business Directory | `/directory` | ✅ READY |
| Business Profile Create | `/portal/business/profile/create` | ✅ READY |
| Business Public Page | `/b/:handle` | ✅ READY |
| News/NewsBeat | (RightRail component) | ✅ READY |
| Foundation Pages | `/foundation/*` | ✅ READY |

### ❌ HIDE / GATE / COMING SOON

| Feature | Route | Action | Why |
|---------|-------|--------|-----|
| Marketplace | `/portal/marketplace/*` | **HIDE** | Not ready for commerce |
| Social Shop | `/socialworld/marketplace` | **HIDE** | Demo only |
| Pulse | `/socialworld/pulse` | **HIDE** | Placeholder |
| Seller Dashboard | `/portal/marketplace/seller/*` | **HIDE** | Not ready |
| Checkout | `/portal/marketplace/checkout` | **HIDE** | Not ready |
| Skills World | `/skillsworld/*` | **GATE** or SOFT-LAUNCH | Ready but different audience |
| CCRAM | `/ccram/*` | **GATE** | Internal tool |
| Founder Hub | `/founder/*` | **GATE** | Founder-only |

### Menu Items / Tiles to Change

| Location | Current | Change To |
|----------|---------|-----------|
| `SocialWorldHome.jsx` "Social Shop" tile | Links to marketplace | REMOVE from array |
| Any "Marketplace" nav links | Visible | HIDE |
| "Pulse" tile | Shows as active | Mark COMING SOON or HIDE |

---

## 6 — FORK RECOVERY METHOD

### Fastest Method to Compare Key Forks

**Step 1: Get Fork List from Raymond**
```
Need: List of fork URLs or job IDs with dates and brief descriptions
```

**Step 2: For Each Fork, Run Snapshot Command**
```bash
# Clone fork environment
# Run from Neo:
find /app/frontend/src -name "*.jsx" -o -name "*.js" | xargs wc -l | sort -n | tail -30
find /app/backend/routes -name "*.py" | xargs wc -l | sort -n
ls -la /app/frontend/src/pages/*/
ls -la /app/backend/routes/
git log --oneline -50
```

**Step 3: Generate Diff Report**
```bash
# Compare specific directories
diff -rq /fork1/frontend/src/pages /current/frontend/src/pages
diff -rq /fork1/backend/routes /current/backend/routes
```

### How to Extract Meaningful Differences
1. **Focus on page-level files** — not utilities or configs
2. **Compare route counts** — new routes = new features
3. **Check for unique files** — files that exist in fork but not current
4. **Look at commit messages** — indicate feature intent

### How to Identify UI/Features That Never Made It Forward
```bash
# Files in old fork but not current
comm -23 <(ls oldFork/frontend/src/pages/*/ | sort) <(ls current/frontend/src/pages/*/ | sort)

# Git commits in old fork not in current
git log oldFork --oneline --not current --oneline
```

### What Neo Needs from Raymond

| Item | Purpose |
|------|---------|
| List of fork URLs/job IDs | Access to inspect |
| Date range of each fork | Timeline context |
| 1-line description per fork | What was being built |
| Priority forks (if any) | Where to start |

### Reusable Recovery Workflow

```markdown
## FORK RECOVERY CHECKLIST

1. [ ] Access fork environment
2. [ ] Run snapshot commands (file counts, routes, pages)
3. [ ] Compare against current environment
4. [ ] List unique files in fork
5. [ ] Check git log for feature commits
6. [ ] Identify recoverable features
7. [ ] Report findings to Raymond
8. [ ] If approved, extract and port code
9. [ ] Test ported features
10. [ ] Document what was recovered
```

---

## 7 — TOP PRIORITY BUILD ORDER

### P1 — MUST HAVE FOR LAUNCH

| # | Item | Why | Neo Alone? | Raymond Needed? |
|---|------|-----|------------|-----------------|
| 1 | **Configure SMTP** | Password reset blocked | No | YES (credentials) |
| 2 | **Hide Marketplace from nav** | Avoid confusion | Yes | No |
| 3 | **Add "Register Business" CTA** | Core launch feature | Yes | No |
| 4 | **Verify Business flow works** | Core launch feature | Yes | No |
| 5 | **Update reset link domain** | Production URL | Yes | No |

### P2 — SHOULD HAVE FOR POLISH

| # | Item | Why | Neo Alone? | Raymond Needed? |
|---|------|-----|------------|-----------------|
| 6 | **Hide Pulse tile** | Not ready | Yes | No |
| 7 | **Increase news sync to 2hr** | Fresher content | Yes | No |
| 8 | **Test password reset end-to-end** | After SMTP configured | Yes | After #1 |
| 9 | **Verify Circle Visibility in prod** | Feature complete | Yes | No |
| 10 | **Add "check spam" copy** | UX improvement | Yes | No |

### P3 — CAN WAIT UNTIL AFTER LAUNCH

| # | Item | Why | Neo Alone? | Raymond Needed? |
|---|------|-----|------------|-----------------|
| 11 | **Fix Reuters/AP news feeds** | More coverage | Yes | No |
| 12 | **TD-001 async refactor** | Tech debt | Yes | No |
| 13 | **Route consolidation** | Code cleanup | Yes | No |
| 14 | **Skills World soft-launch** | Different audience | Yes | Decision |
| 15 | **Fork recovery audit** | Historical features | Yes | Fork list |

---

## 8 — FINAL TRUTH SECTION

### What BANIBS Can Honestly Open Now

✅ **Guest Page** — Complete, polished, books linked  
✅ **Auth (Login/Signup)** — Working, JWT tokens  
✅ **Social Core (Commons)** — Posts, comments, reactions, media, circles  
✅ **Circle-Based Visibility** — Post targeting, tier gating  
✅ **Business Directory** — Create profile, public page, search  
✅ **News Feed** — 40+ sources, auto-updated, Black-focus tagging  
✅ **Frames** — Visual storytelling (calm tech)  
✅ **ChatSphere** — Private messaging  

### What BANIBS Should NOT Pretend Is Ready

❌ **Marketplace** — Demo data only, no real commerce  
❌ **Pulse** — Placeholder page  
❌ **Email System** — Logs but doesn't send  
❌ **Password Reset** — UI works, emails don't  
❌ **OAuth** — Not implemented  
❌ **Analytics** — Disabled  

### What MUST Be Fixed Before Public Opening

| Item | Blocker Type | Owner |
|------|--------------|-------|
| SMTP credentials | Config | Raymond |
| Hide marketplace nav | Code | Neo |
| Business CTA on guest page | Code | Neo |
| Update reset link to prod URL | Code | Neo |
| Test auth flow end-to-end | Testing | Neo (after SMTP) |

### What Can Wait Until After Opening

- TD-001 async client refactor (27 files)
- Route duplication cleanup
- Pulse/short-form video
- Skills World promotion
- Fork recovery audit
- Advanced news curation
- OAuth/social login

---

**END OF LIMITED-LAUNCH ALIGNMENT PLAN**
