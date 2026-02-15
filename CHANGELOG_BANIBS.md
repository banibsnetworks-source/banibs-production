# BANIBS Changelog

All notable changes to the BANIBS platform.

---

## [2026-02-15] BGLIS v1.0 - Phone Authentication

### Added
- **BGLIS Phone Verification System** - Voluntary phone verification for user trust
- `POST /api/bglis/link-phone` - Link verified phone to user account
- `PATCH /api/bglis/remove-phone` - Remove phone verification
- `GET /api/bglis/status` - Get phone verification status
- `GET /api/bglis/check/:user_id` - Public endpoint to check verification
- `PhoneVerifiedBadge` component for Marketplace and Messaging
- Security Settings UI at `/portal/social/settings/security`
- Mock SMS provider for development (`DEV_BYPASS_OTP=true`)

### Changed
- Updated `local_exchange.py` to dynamically fetch seller phone verification
- Updated `messaging_v2.py` to include `otherUserPhoneVerified` in previews
- Updated `ConversationPreview` schema with phone verification field
- Updated `modules_registry.json` - BGLIS status changed to `active`

### Documentation
- Created `/app/docs/bglis_v1.md` - Full BGLIS documentation

---

## [2026-02-15] User Pinning + Pin Boards

### Added
- Platform-wide pinning system for content curation
- Pin Boards - User-owned, private-by-default content collections
- `/pins` page for managing boards and pins
- `PinButton` component integrated on Frames and Marketplace listings

---

## [2026-02-14] HDOS Engine v1

### Added
- Deterministic rules engine for interaction pattern classification
- Constitutional lock preventing prescriptive or predictive behavior
- Exit-safe routing model (EXIT-PRESERVED, EXIT-THREATENED, EXIT-SEALED)
- HDOS Glossary and Amendments system
