# BANIBS System Inventory Report
**Generated**: February 10, 2026  
**Registry Version**: 1.1.0  
**Last Updated**: 2026-02-10T07:00:00Z

---

## A) Module Registry Summary

### Registry Statistics
| Metric | Count |
|--------|-------|
| **Total Modules** | 40 |
| **Active** | 32 |
| **Opening Soon** | 8 |
| **Disabled** | 0 |

### Modules by World

| World | Active | Opening Soon |
|-------|--------|--------------|
| Social World | 10 | 5 |
| Community Portal | 5 | 0 |
| Skills World | 2 | 0 |
| Founder Tools | 5 | 0 |
| Education Portal | 1 | 1 |
| Finance Portal | 1 | 0 |
| Developer Portal | 1 | 0 |
| Commerce Portal | 1 | 0 |
| Business Portal | 3 | 0 |
| News Portal | 1 | 0 |
| Platform Infrastructure | 2 | 2 |

### Complete Module List

| ID | Display Name | World | Status | Frontend Routes | API Routes |
|----|--------------|-------|--------|-----------------|------------|
| frames | Frames | Social World | ✅ active | 2 | 9 |
| local_exchange | Local Exchange | Social World | ✅ active | 3 | 11 |
| chatsphere | ChatSphere | Social World | ✅ active | 2 | 10 |
| commons | Commons | Social World | ✅ active | 2 | 6 |
| pulse | Pulse | Social World | ✅ active | 2 | 3 |
| notes | Notes | Social World | 🟡 opening_soon | 1 | 0 |
| circles | Circles | Social World | ✅ active | 3 | 4 |
| live_circle | Live Circle | Social World | 🟡 opening_soon | 1 | 0 |
| voice_share | Voice Share | Social World | 🟡 opening_soon | 1 | 0 |
| talent_world | Talent World | Social World | 🟡 opening_soon | 1 | 0 |
| social_shop | Social Shop | Social World | 🟡 opening_soon | 1 | 0 |
| skills_world | Skills World | Skills World | ✅ active | 3 | 0 |
| number_paths | Number Paths | Skills World | ✅ active | 1 | 0 |
| prayer_rooms | Prayer Rooms | Community Portal | ✅ active | 2 | 3 |
| beauty_wellness | Beauty & Wellness | Community Portal | ✅ active | 5 | 2 |
| fashion_sneakers | Sneakers & Fashion | Community Portal | ✅ active | 5 | 2 |
| diaspora_connect | Diaspora Connect | Community Portal | ✅ active | 6 | 3 |
| academy | BANIBS Academy | Education Portal | ✅ active | 6 | 2 |
| wallet | BANIBS Wallet | Finance Portal | ✅ active | 1 | 2 |
| developer | BANIBS OS / Developer | Developer Portal | ✅ active | 5 | 3 |
| global_marketplace | Global Marketplace | Commerce Portal | ✅ active | 7 | 4 |
| community_life | Community Life Hub | Community Portal | ✅ active | 5 | 4 |
| ability_network | Ability Network | Community Portal | ✅ active | 5 | 2 |
| helping_hands | Helping Hands | Social World | ✅ active | 3 | 3 |
| business_directory | Business Directory | Business Portal | ✅ active | 3 | 3 |
| news | BANIBS News | News Portal | ✅ active | 4 | 3 |
| ccram | CCRAM | Founder Tools | ✅ active | 1 | 2 |
| book_vault | Book Vault Studio | Founder Tools | ✅ active | 2 | 4 |
| founder_command | Founder Command Center | Founder Tools | ✅ active | 2 | 2 |
| bglis | BGLIS Phone Auth | Platform Infrastructure | 🟡 opening_soon | 0 | 2 |

---

## B) Frontend Surface Scan

### React Routes Found (App.js)

#### Auth Routes (3)
- `/auth/register` → RegisterPage
- `/auth/signin` → SignInPage
- `/auth/forgot-password` → ForgotPasswordPage

#### Social World Routes (17)
- `/socialworld` → SocialWorldHome
- `/socialworld/pulse` → SocialWorldPulse
- `/socialworld/shortform` → SocialWorldPulse (Legacy)
- `/socialworld/frames` → SocialWorldFrames
- `/socialworld/frames/new` → CreateFramePage
- `/socialworld/moments` → SocialWorldFrames (Legacy)
- `/socialworld/notes` → SocialWorldNotes
- `/socialworld/stories` → SocialWorldNotes (Legacy)
- `/socialworld/connections` → SocialWorldConnections
- `/socialworld/live` → SocialWorldLive
- `/socialworld/circles` → SocialWorldCircles
- `/socialworld/voice` → SocialWorldVoice
- `/socialworld/chat` → SocialWorldChat
- `/socialworld/chat/:conversationId` → SocialWorldChat
- `/socialworld/talent` → SocialWorldTalent
- `/socialworld/marketplace` → SocialWorldMarketplace
- `/socialworld/local` → LocalExchangeHome
- `/socialworld/local/new` → CreateListingPage
- `/socialworld/local/:listingId` → ListingDetailPage

#### Skills World Routes (3)
- `/skillsworld` → SkillsWorldHome
- `/skillsworld/math` → MathLogicHome
- `/skillsworld/math/number-paths` → NumberPathsGame

#### Portal Routes - Social (30+)
- `/portal/social` → SocialPortal
- `/portal/social/home` → SocialPortal
- `/portal/social/profile` → SocialProfileEditPage
- `/portal/social/profile/theme` → SocialProfileTheme
- `/portal/social/u/:handle` → SocialProfilePublicPage
- `/portal/social/settings/*` → Various settings pages
- `/portal/social/circles` → SocialCirclesPage
- `/portal/social/circles/:slug` → CircleDetailPage
- `/portal/social/groups` → GroupsPage
- `/portal/social/messages` → MessagesPage
- `/portal/social/jobs` → JobsBrowser
- `/portal/social/discover/people` → SocialDiscoverPeoplePage

#### Portal Routes - Business (16)
- `/portal/business` → BusinessPortal
- `/portal/business/profile` → BusinessProfilePage
- `/portal/business/board` → BusinessBoardPage
- `/portal/business/analytics` → BusinessAnalyticsDashboard
- `/portal/business/jobs/*` → Job management pages
- `/portal/business/:businessId` → BusinessProfilePublic

#### Portal Routes - Community (22)
- `/portal/prayer` → PrayerLobbyPage
- `/portal/prayer/room/:roomSlug` → PrayerRoomPage
- `/portal/beauty/*` → Beauty & Wellness pages
- `/portal/fashion/*` → Fashion pages
- `/portal/diaspora/*` → Diaspora Connect pages
- `/portal/community/*` → Community Life pages
- `/portal/ability/*` → Ability Network pages

#### Portal Routes - Other (15)
- `/portal/helping-hands` → HelpingHandsHome
- `/portal/academy/*` → Academy pages
- `/portal/wallet` → WalletHomePage
- `/portal/marketplace/*` → Marketplace pages
- `/portal/news` → NewsPortal

#### Founder Routes (7)
- `/founder/command` → FounderControlCenter
- `/founder/modules` → FounderModulesPage
- `/founder/analytics` → FounderAnalyticsDashboard
- `/founder/book-vault` → BookVaultStudio
- `/founder/book-vault/:bookId` → BookEditor
- `/founder/tutor-intake` → TutorIntakeAdmin
- `/founder/nav-v2-preview` → NavV2Preview

#### Developer Routes (5)
- `/developer` → DevLayout (index)
- `/developer/api-keys` → DevApiKeysPage
- `/developer/apps` → DevAppsPage
- `/developer/webhooks` → DevWebhooksPage
- `/developer/docs` → DevDocsPage

#### Public Routes (15+)
- `/news` → NewsHomePage
- `/news/:section` → NewsSectionPage
- `/news/black` → BlackNewsPage
- `/about` → BanibsHomePage
- `/foundation` → FoundationPage
- `/ccram` → CCRAMPage
- `/business-directory` → BusinessDirectoryPage

### Major Frontend Feature Folders
```
/app/frontend/src/pages/
├── auth/               # Authentication pages
├── founder/            # Founder tools (6 pages)
├── portals/            # Portal landing pages
├── socialworld/        # Social World features
│   ├── local-exchange/ # Local Exchange (3 pages)
│   └── *.jsx           # Other social features
├── skillsworld/        # Skills World
│   └── math/           # Math activities
├── admin/              # Admin dashboards
├── business/           # Business management
├── community/          # Community features
├── messaging/          # Messaging system
└── settings/           # User settings
```

---

## C) Backend Surface Scan

### FastAPI Routers Registered (60+)

| Router File | API Prefix | Key Endpoints |
|-------------|------------|---------------|
| `frames.py` | `/api/frames` | GET, POST, PATCH, DELETE frames |
| `local_exchange.py` | `/api/local-exchange` | CRUD listings, initiate-chat |
| `modules_registry.py` | `/api/founder/modules` | GET registry |
| `messaging.py` | `/api/messaging` | Conversations, messages |
| `social.py` | `/api/social` | Posts, reactions |
| `shortform.py` | `/api/shortform` | Video content |
| `circles.py` | `/api/circles` | Circle management |
| `prayer.py` | `/api/prayer` | Prayer rooms |
| `beauty.py` | `/api/beauty` | Beauty providers |
| `fashion.py` | `/api/fashion` | Fashion brands |
| `diaspora.py` | `/api/diaspora` | Diaspora content |
| `academy.py` | `/api/academy` | Courses, mentors |
| `wallet.py` | `/api/wallet` | Accounts, transactions |
| `developer.py` | `/api/developer` | API keys, apps |
| `marketplace.py` | `/api/marketplace` | Products, stores |
| `community.py` | `/api/community` | Health, fitness, food |
| `ability.py` | `/api/ability` | Disability resources |
| `helpinghands.py` | `/api/helpinghands` | Campaigns |
| `business.py` | `/api/business` | Business profiles |
| `news.py` | `/api/news` | News articles |
| `ccram.py` | `/api/ccram` | AI assistant |
| `book_vault.py` | `/api/books` | Book authoring |
| `founder_ops.py` | `/api/founder/ops` | Founder dashboard |
| `founder_analytics.py` | `/api/founder/analytics` | Analytics |
| `bglis_auth.py` | `/api/bglis` | Phone auth (OTP) |
| `unified_auth.py` | `/api/auth` | Login, tokens |
| `jobs.py` | `/api/jobs` | Job listings |
| `orchestration.py` | `/api/orchestration` | Admin tools |

### Key Service Modules
```
/app/backend/
├── routes/           # 60+ route files
│   ├── frames.py
│   ├── local_exchange.py
│   ├── messaging.py
│   ├── social.py
│   └── ...
├── services/
│   ├── messaging_service.py
│   ├── circle_engine.py
│   └── ...
├── models/
│   ├── messaging_message.py
│   ├── messaging_conversation.py
│   └── ...
├── middleware/
│   └── auth_guard.py
└── config/
    └── modules_registry.json
```

---

## D) Mismatch Report

### ✅ Registry Integrity Patch Applied (v1.1.0)

The following modules were added to eliminate orphan features:

| ID | Display Name | Status | Notes |
|----|--------------|--------|-------|
| groups | Groups | ✅ active | Group membership and community |
| social_profile | Social Profile | ✅ active | User profile management |
| social_settings | Social Settings | ✅ active | User preferences and privacy |
| jobs | Jobs & Opportunities | ✅ active | Job listings and applications |
| orchestration | Orchestration Admin | ✅ active | Internal/admin - task management |
| contributor_portal | Contributor Portal | ✅ active | Content contributor system |
| candidate_portal | Candidate Portal | ✅ active | Job seeker profiles |
| bcee | BCEE Currency Engine | 🟡 opening_soon | Internal - currency exchange |
| governance | Governance System | ✅ active | Internal/admin - policy management |
| alternative_school | Alternative School | 🟡 opening_soon | Alt education programs |

### 🟡 In Registry as Opening Soon (Expected)

All 8 `opening_soon` modules have placeholder pages or backend-only implementations - **working as intended**:
- notes, live_circle, voice_share, talent_world, social_shop, bglis, bcee, alternative_school

### ✅ Properly Aligned

All 32 `active` modules have matching frontend routes and/or backend APIs.

---

## E) Next Actions

### ✅ Completed: Registry Integrity Patch (v1.1.0)
All orphan features have been added to the registry.

### Remaining Recommendations

#### Code Cleanup (Low Priority)
1. **Consolidate messaging routes** - `/portal/social/messages` and `/messages` should redirect to ChatSphere (`/socialworld/chat`)
2. **Review legacy aliases** - `/socialworld/shortform`, `/socialworld/moments`, `/socialworld/stories`

#### Documentation Updates (Low Priority)
1. Update PRD.md with module inventory counts
2. Add module registry to onboarding docs

---

## Summary

| Category | Count |
|----------|-------|
| **Registered Modules** | 40 |
| **Frontend Routes** | ~150+ |
| **Backend Route Files** | 60+ |
| **Orphan Routes** | 0 (patched) |
| **Aligned Modules** | 40 (32 active + 8 opening_soon) |

### Overall Health: ✅ **EXCELLENT**
Registry integrity patch applied - all features now registered.

---

*Report generated by BANIBS System Inventory Scanner*
