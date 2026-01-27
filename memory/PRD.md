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
- [x] Founder's book section with 5 canonical books:
  1. The Devil's Dismissive Argument
  2. Before You Call It Out
  3. The Devil's Deceitful Master Plan
  4. The Light God Wants You to See
  5. Human Decision Operating System (HDOS)
- [x] Waitlist functionality
- [x] Status signal: "The full system is opening in phases."
- [x] Static build package ready at `/app/deploy/guest_site/`
- Route: `/guest`

### CCR Anchor Module - CCRAM (COMPLETE)
- [x] Phase 1 (MVP): GPT-4o text classification and response generation
- [x] Phase 2: Whisper STT + OpenAI TTS for audio
- [x] Phase 2.1: NQR (No Quick Response) timing logic
- Route: `/ccram`

### News System Fixes (Jan 2026)
- [x] Image validation - filters out tracking pixels and invalid URLs
- [x] Category routing working correctly (US, World, Business, Sports, etc.)
- [x] Fallback images for stories without valid images

---

## Prioritized Backlog

### P0 - Critical (Current)
- [ ] Nav Bar dropdown consistency (under investigation)
- [ ] News category data quality (RSS sources need better image extraction)

### P1 - High Priority
- [ ] HDOS (Circle Trust Order System v2) - 7-level trust system
- [ ] BANIBS Book Vault Studio - Book authoring module

### P2 - Medium Priority
- [ ] Raymond Health Core System - Daily tracker
- [ ] Navigation v2.0 Integration
- [ ] News Taxonomy v2
- [ ] CCOS (Circle Consolidation OS) Phase 1

### P3 - Low Priority / Blocked
- [ ] Password reset emails (BLOCKED - awaiting SMTP credentials)
- [ ] Backend route refactoring (messaging, business, auth)
- [ ] BGLIS v1.0 Full Implementation (Paused)

---

## Technical Architecture

### Backend
```
/app/backend/
├── models/ccram.py          # CCRAM Pydantic models
├── routes/
│   ├── ccram.py             # CCRAM analysis API
│   ├── ccram_audio.py       # CCRAM audio/TTS API
│   └── news.py              # News API with image validation
├── services/
│   ├── ccram_service.py     # Core CCRAM logic
│   ├── ccram_audio_service.py
│   ├── ccram_templates.py
│   └── news_categorization_service.py  # Category routing logic
└── server.py
```

### Frontend
```
/app/frontend/src/
├── components/
│   ├── GlobalNavBar.js      # Main navigation
│   ├── NewsNavigationBar.js # News category tabs
│   └── NewsSectionBlock.js  # News story blocks
├── pages/
│   ├── ComingSoonPage.jsx   # Guest Page (redesigned)
│   ├── NewsHomePage.js      # Main news homepage
│   └── ccram/CCRAMPage.jsx  # CCRAM module
└── App.js
```

### Key API Endpoints
- `GET /api/news/homepage` - Structured news data for homepage
- `GET /api/news/section?section=<name>` - Section-specific news
- `POST /api/ccram/analyze` - Question analysis
- `POST /api/ccram/audio/generate-cue` - TTS generation

### 3rd Party Integrations
- OpenAI GPT-4o (via Emergent LLM Key)
- OpenAI Whisper STT
- OpenAI TTS
- MongoDB Atlas
- Let's Encrypt SSL

---

## Static Guest Page Build
Location: `/app/deploy/guest_site/`
Contents:
- `index.html` - Complete standalone page
- `assets/images/hero.jpg` - Hero image

Download: `https://founder-books.preview.emergentagent.com/guest_site.zip`

---

## Notes
- BGLIS phone auth system remains MOCKED
- Gmail SMTP blocked pending credentials
- Infrastructure is LOCKED - do not modify without explicit request
- News images issue: Many RSS feeds return tracking pixels instead of real images

*Last Updated: January 2026*
