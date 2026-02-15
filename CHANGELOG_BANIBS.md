# BANIBS Changelog

All notable changes to the BANIBS platform.

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
