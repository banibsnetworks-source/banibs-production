# BANIBS Changelog

All notable changes to the BANIBS platform.

---

## [2026-02-15] Skills World - Reading & Words v1.0 ✅ COMPLETE

### Added
- **Reading & Words Sub-World** - Second major educational module in Skills World
- **Word Explorer** - Vocabulary building through word matching (5 levels, 40 words)
- **Story Paths** - Reading comprehension with short passages (5 levels, 25 stories)
- **Letter Sounds** - Phonics fundamentals with letter-sound associations (3 levels, 24 letters)

### Design (Calm-Tech)
- No timers, no scores, no pressure language
- No rankings, leaderboards, or comparisons
- One activity visible at a time
- Clear exits at all times
- Soft colors, minimal motion
- Age guidance visible but not enforced

### Routes
- `/skillsworld/reading` - Hub page
- `/skillsworld/reading/word-explorer` - Word Explorer activity
- `/skillsworld/reading/story-paths` - Story Paths activity
- `/skillsworld/reading/letter-sounds` - Letter Sounds activity

### Files Created
- `/app/frontend/src/pages/skillsworld/reading/ReadingWordsHome.jsx`
- `/app/frontend/src/pages/skillsworld/reading/WordExplorerGame.jsx`
- `/app/frontend/src/pages/skillsworld/reading/StoryPathsGame.jsx`
- `/app/frontend/src/pages/skillsworld/reading/LetterSoundsGame.jsx`
- `/app/content/skills_world/word_explorer_levels.json`
- `/app/content/skills_world/story_paths_levels.json`
- `/app/content/skills_world/letter_sounds_levels.json`
- `/app/docs/skills_world_subworlds_v1.md`

### Files Modified
- `/app/frontend/src/App.js` - Added Reading & Words routes
- `/app/frontend/src/pages/skillsworld/SkillsWorldHome.jsx` - Updated status to active
- `/app/backend/config/modules_registry.json` - Added reading_words module

### V1.0 Limitations (Intentional)
- No audio (text-based sound hints only)
- No images (text options only)
- Frontend-only (localStorage progress)
- English content only

---

## [2026-02-15] BGLIS v1.0 - Phone Authentication ✅ LOCKED

> **STATUS: LOCKED** - No modifications without explicit directive.

### Added
- **BGLIS Phone Verification System** - Voluntary phone verification for user trust
- Security Settings UI at `/portal/social/settings/security`
- `PhoneVerifiedBadge` component for Marketplace and Messaging
- OTP hashing (SHA-256 with phone salt) for secure storage
- Mock SMS provider for development (`DEV_BYPASS_OTP=true`)

### API Endpoints
- `POST /api/auth/send-otp` - Send verification code
- `POST /api/auth/verify-otp` - Verify OTP code
- `POST /api/bglis/link-phone` - Link verified phone to account
- `PATCH /api/bglis/remove-phone` - Remove phone verification
- `GET /api/bglis/status` - Get verification status (auth required)
- `GET /api/bglis/check/:user_id` - Public verification check

### Security
- OTP codes hashed before storage (not plaintext)
- Server-authoritative `is_phone_verified` flag
- Rate limiting: 5 attempts per OTP
- Auto-expiry: 10 minutes TTL

### Files Changed
- Created: `/app/backend/routes/bglis.py`
- Created: `/app/frontend/src/pages/social/settings/SecuritySettings.jsx`
- Created: `/app/frontend/src/components/badges/PhoneVerifiedBadge.jsx`
- Created: `/app/docs/bglis_v1.md`
- Modified: `/app/backend/services/otp_service.py` (added hashing)
- Modified: `/app/backend/routes/local_exchange.py` (dynamic seller verification)
- Modified: `/app/backend/db/messaging_v2.py` (otherUserPhoneVerified field)
- Modified: `/app/backend/schemas/message.py` (schema update)
- Modified: `/app/frontend/src/components/messaging/ConversationsList.jsx`
- Modified: `/app/frontend/src/pages/socialworld/local-exchange/ListingDetailPage.jsx`
- Modified: `/app/backend/config/modules_registry.json` (BGLIS status: active)

### Environment
- `SMS_PROVIDER=dev` - Mock SMS mode
- `DEV_BYPASS_OTP=true` - Code 111111 works in dev

---


## [2026-02-15] User Pinning + Pin Boards ✅ COMPLETE

### Added
- Platform-wide pinning system for content curation
- Pin Boards - User-owned, private-by-default content collections
- `/pins` page for managing boards and pins
- `PinButton` component integrated on Frames and Marketplace listings
- Lazy initialization of default "Saved" board

### API Endpoints
- `GET /api/pins/boards` - List boards
- `POST /api/pins/boards` - Create board
- `PATCH /api/pins/boards/:id` - Update board
- `DELETE /api/pins/boards/:id` - Delete board
- `POST /api/pins` - Create pin (idempotent)
- `GET /api/pins` - List pins with filters
- `DELETE /api/pins/:id` - Delete pin
- `POST /api/pins/move` - Move pin between boards
- `GET /api/pins/check/:type/:id` - Check pin status

---

## [2026-02-14] HDOS Engine v1 ✅ COMPLETE

### Added
- Deterministic rules engine for interaction pattern classification
- Constitutional lock preventing prescriptive or predictive behavior
- Exit-safe routing model (EXIT-PRESERVED, EXIT-THREATENED, EXIT-SEALED)
- HDOS Glossary and Amendments system

### API Endpoints
- `POST /api/hdos/analyze` - Analyze interaction pattern
- `GET /api/hdos/glossary` - Get HDOS glossary
- `GET /api/hdos/amendments` - Get HDOS amendments

### Frontend
- `/hdos/engine` - Analysis UI
- `/hdos/glossary` - Glossary page
- `/hdos/amendments` - Amendments page
