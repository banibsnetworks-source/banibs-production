# BGLIS v1.0 - Phone Authentication

**Status**: Active  
**Version**: 1.0.0  
**Last Updated**: 2026-02-15

---

## Overview

BGLIS (Black Global Linked Identity System) v1.0 provides voluntary phone number verification for BANIBS users. This strengthens user identity integrity and builds trust within the community.

## Key Principles

1. **Voluntary Opt-In** - Phone verification is NEVER required for using BANIBS
2. **No Scoring/Ranking** - Verified status does not affect algorithmic placement
3. **Minimal Badge** - Only displayed on Marketplace listings and Messaging
4. **Fully Reversible** - Users can remove verification at any time
5. **Rate Limited** - OTP attempts are capped to prevent abuse
6. **Server-Authoritative** - Verification status is set server-side only, cannot be spoofed by clients

---

## User Flow

1. User navigates to **Settings > Security** (`/portal/social/settings/security`)
2. Clicks "Add Phone Number"
3. Enters phone number (E.164 format, e.g., +15551234567)
4. Receives 6-digit OTP via SMS
5. Enters OTP to verify
6. "Verified" badge appears on their Marketplace listings and in Messaging

---

## API Endpoints

### OTP Flow (via unified auth)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-otp` | POST | Send 6-digit verification code |
| `/api/auth/verify-otp` | POST | Verify the code |

### BGLIS Phone Management

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/bglis/link-phone` | POST | Required | Link verified phone to account |
| `/api/bglis/remove-phone` | PATCH | Required | Remove phone verification |
| `/api/bglis/status` | GET | Required | Get user's verification status |
| `/api/bglis/check/:user_id` | GET | Public | Check if any user is verified |

---

## Security Implementation

### OTP Rules

| Setting | Value |
|---------|-------|
| **OTP Length** | 6 digits |
| **Expiry** | 10 minutes |
| **Max Attempts** | 5 per OTP |
| **Storage** | SHA-256 hashed (phone as salt) |
| **TTL Cleanup** | Auto-deleted after expiry via MongoDB TTL index |

### Data Fields Stored

**In `banibs_users` collection:**
```json
{
  "phone_number": "+15551234567",      // E.164 format
  "phone_country_code": "US",          // ISO country code
  "is_phone_verified": true,           // Server-authoritative flag
  "phone_verified_at": "2026-02-15..." // ISO timestamp
}
```

**In `otp_tokens` collection (temporary):**
```json
{
  "phone_number": "+15551234567",
  "code_hash": "sha256...",            // Hashed, NOT plaintext
  "purpose": "upgrade",
  "expires_at": "...",                 // TTL indexed
  "attempts": 0,
  "max_attempts": 5,
  "used": false
}
```

### Security Guarantees

- ✅ OTP codes are **hashed** before storage (SHA-256 with phone as salt)
- ✅ OTP codes are **not logged** in production
- ✅ `is_phone_verified` flag is **server-authoritative** (cannot be client-spoofed)
- ✅ Rate limiting prevents brute force (5 attempts max)
- ✅ Auto-expiry prevents stale OTPs (10 minute TTL)
- ✅ Default mode is **MOCK** unless explicit env vars set

---

## Environment Variables

### Required

```env
# SMS Provider Mode
SMS_PROVIDER=dev          # Options: dev | twilio

# Dev Mode Only (mock SMS)
DEV_BYPASS_OTP=true       # Allows code "111111" to verify in dev
```

### Twilio Configuration (Production)

```env
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=AC...  # Your Twilio Account SID
TWILIO_AUTH_TOKEN=...     # Your Twilio Auth Token
TWILIO_PHONE_NUMBER=+1... # Your Twilio phone number
```

**⚠️ Do NOT commit real Twilio credentials to version control.**

---

## MOCK Mode (Development)

When `SMS_PROVIDER=dev` and `DEV_BYPASS_OTP=true`:

- OTPs are logged to server console (for debugging only)
- Code `111111` **always verifies** successfully
- No real SMS is sent

This allows full testing without SMS provider costs.

---

## Frontend Components

| Component | Path | Description |
|-----------|------|-------------|
| SecuritySettings | `/pages/social/settings/SecuritySettings.jsx` | Phone verification UI |
| PhoneVerifiedBadge | `/components/badges/PhoneVerifiedBadge.jsx` | Reusable "Verified" badge |

### Badge Placement

The "Verified" badge appears in:
1. **Marketplace Listings** - Next to seller name on listing detail
2. **Messaging Conversations** - Next to user name in conversation list

---

## Switching to Production (Twilio)

1. Sign up at [twilio.com](https://www.twilio.com)
2. Get your Account SID, Auth Token, and a phone number
3. Update `/app/backend/.env`:
   ```env
   SMS_PROVIDER=twilio
   DEV_BYPASS_OTP=false
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxxxx
   TWILIO_PHONE_NUMBER=+15551234567
   ```
4. Restart backend: `sudo supervisorctl restart backend`

---

## Files Reference

### Backend
- `/app/backend/routes/bglis.py` - Phone management endpoints
- `/app/backend/routes/bglis_auth.py` - OTP send/verify endpoints
- `/app/backend/services/otp_service.py` - OTP logic with hashing
- `/app/backend/services/sms_provider.py` - SMS provider abstraction
- `/app/backend/services/phone_service.py` - E.164 normalization

### Frontend
- `/app/frontend/src/pages/social/settings/SecuritySettings.jsx`
- `/app/frontend/src/components/badges/PhoneVerifiedBadge.jsx`

### Configuration
- `/app/backend/config/modules_registry.json` - BGLIS module entry

---

## Future Enhancements

- [ ] Twilio production integration (credentials required)
- [ ] Additional SMS providers (AWS SNS, Vonage)
- [ ] Phone change flow with old/new verification
- [ ] Admin dashboard for verification stats
