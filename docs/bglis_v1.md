# BGLIS v1.0 - Phone Authentication

**Status**: Active (Mock SMS Mode)  
**Version**: 1.0.0  
**Last Updated**: 2026-02-15

## Overview

BGLIS (Black Global Linked Identity System) v1.0 provides voluntary phone number verification for BANIBS users. This strengthens user identity integrity without being mandatory.

## Key Principles

1. **Voluntary Opt-In** - Phone verification is never required for using BANIBS
2. **No Scoring/Ranking** - Verified status does not affect algorithmic placement
3. **Minimal Badge** - Only displayed on Marketplace listings and Messaging
4. **Fully Reversible** - Users can remove verification at any time
5. **Rate Limited** - OTP attempts are capped to prevent abuse

## User Flow

1. User navigates to Settings > Security
2. Clicks "Add Phone Number"
3. Enters phone number (E.164 format)
4. Receives 6-digit OTP via SMS
5. Enters OTP to verify
6. Badge appears on listings and messages

## API Endpoints

### OTP Flow (via unified auth)
- `POST /api/auth/send-otp` - Send verification code
- `POST /api/auth/verify-otp` - Verify the code

### BGLIS Specific
- `POST /api/bglis/link-phone` - Link verified phone to account
- `PATCH /api/bglis/remove-phone` - Remove phone verification
- `GET /api/bglis/status` - Get user's verification status
- `GET /api/bglis/check/{user_id}` - Check if user is verified (public)

## Security

- **OTP Expiry**: 10 minutes
- **Max Attempts**: 5 per OTP
- **Rate Limiting**: 1 OTP per phone per minute
- **Hashing**: Phone numbers stored in E.164 format
- **OTP Storage**: TTL indexed, auto-cleaned

## Environment Variables

```env
# SMS Provider Configuration
SMS_PROVIDER=dev          # dev | twilio
DEV_BYPASS_OTP=true       # Allow code "111111" in dev mode

# Future: Twilio Config
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

## Database Collections

- `otp_tokens` - Temporary OTP storage with TTL
- `banibs_users` - User records with phone fields:
  - `phone_number` (E.164 format)
  - `phone_country_code`
  - `is_phone_verified` (boolean)
  - `phone_verified_at` (timestamp)

## Frontend Components

- `/pages/social/settings/SecuritySettings.jsx` - Phone verification UI
- `/components/badges/PhoneVerifiedBadge.jsx` - Reusable badge component

## Badge Placement

The "Verified" badge appears in:
1. **Marketplace Listings** - Next to seller name
2. **Messaging UI** - Next to sender name in conversations

## Mock Mode (Development)

When `DEV_BYPASS_OTP=true`:
- OTPs are logged to console
- Code `111111` always validates
- No real SMS sent

## Future Enhancements

- Twilio production integration
- Additional SMS providers (AWS SNS, etc.)
- Phone change flow with old/new verification
