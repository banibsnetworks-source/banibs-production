# BGLIS Architecture — BANIBS Global Login & Identity System

**Version**: 1.0  
**Status**: ✅ ACTIVE (Master Identity Gateway)  
**Last Updated**: December 9, 2025

---

## 🎯 OVERVIEW

**BGLIS (BANIBS Global Login & Identity System)** is the master identity gateway for all BANIBS applications and services. It implements a **phone-first, privacy-respecting authentication system** with username-based public identity and recovery phrase backup.

### Core Principles

1. **Phone-First**: Phone number is the primary authentication factor
2. **Username Public Identity**: Usernames provide memorable, shareable identity
3. **Recovery Phrase Safety Net**: 12-word recovery phrase enables account recovery
4. **Email Optional**: Email is optional and secondary to phone
5. **Single Identity**: One BGLIS identity works across all BANIBS properties

---

## 🏗️ ARCHITECTURE

### Identity Model: UnifiedUser

**Collection**: `banibs_users`  
**Primary Key**: UUID `id` field  
**Model**: `/app/backend/models/unified_user.py`

### Core Identity Fields

```python
class UnifiedUser(BaseModel):
    # Primary identifier
    id: str  # UUID
    
    # BGLIS v1.0 - Phone (primary authentication factor)
    phone_number: Optional[str]  # E.164 format (+1234567890)
    phone_country_code: Optional[str]  # ISO country code (US, NG, GB)
    is_phone_verified: bool  # Phone verification status
    
    # BGLIS v1.0 - Username (public identity)
    username: Optional[str]  # Unique, 3-30 characters
    
    # BGLIS v1.0 - Email (optional, secondary)
    email: Optional[EmailStr]  # Optional in BGLIS
    is_email_verified: bool
    
    # BGLIS v1.0 - Recovery phrase system
    has_recovery_phrase: bool
    recovery_phrase_hash: Optional[str]  # Hashed 12-word phrase
    recovery_phrase_salt: Optional[str]
    
    # Display identity
    name: str  # Full name or display name
    avatar_url: Optional[str]
    bio: Optional[str]
    
    # Roles and permissions
    roles: List[str]  # ["user", "contributor", "admin", etc.]
    
    # Timestamps
    created_at: str
    last_login: Optional[str]
    updated_at: Optional[str]
```

---

## 🔐 AUTHENTICATION FLOWS

### Flow 1: Registration (Phone-First)

```
┌──────────────────────────────────────────────────────────┐
│ 1. User Registration Flow                               │
└──────────────────────────────────────────────────────────┘

User Action                    System Action
───────────────────────────    ───────────────────────────
Enter phone number      ──────> Normalize to E.164 format
                                Generate 6-digit OTP
                                Send OTP via SMS
                        <────── Return: OTP sent

Enter OTP code          ──────> Validate OTP
(6 digits)                      Check expiry (5 minutes)
                        <────── Return: OTP valid

Enter username          ──────> Check username availability
(3-30 chars)                    Validate format
                        <────── Return: Username available

Optional: Enter email   ──────> Validate email format
                                Check email uniqueness
                        <────── Return: Email valid

Submit registration     ──────> Create BGLIS identity
                                Generate 12-word phrase
                                Hash recovery phrase
                                Create access + refresh tokens
                        <────── Return: Tokens + Recovery Phrase

User saves phrase       ──────> Mark has_recovery_phrase=true
(CRITICAL STEP)                 Account fully secured
```

**Endpoint**: `POST /api/auth/register-bglis`

**Request**:
```json
{
  "phone_number": "+1234567890",
  "username": "johndoe",
  "email": "john@example.com",  // Optional
  "otp_code": "123456",
  "display_name": "John Doe"  // Optional
}
```

**Response**:
```json
{
  "user": { ... },
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "recovery_phrase": [
    "apple", "banana", "cherry", "dog", "elephant",
    "forest", "guitar", "hotel", "island", "jungle",
    "kitchen", "lemon"
  ]
}
```

**⚠️ CRITICAL**: User MUST save recovery phrase. This is the ONLY way to recover account if phone is lost.

---

### Flow 2: Login (Phone + OTP)

```
┌──────────────────────────────────────────────────────────┐
│ 2. Login Flow (Phone + OTP)                             │
└──────────────────────────────────────────────────────────┘

User Action                    System Action
───────────────────────────    ───────────────────────────
Enter phone number      ──────> Lookup user by phone
                                Generate 6-digit OTP
                                Send OTP via SMS
                        <────── Return: OTP sent

Enter OTP code          ──────> Validate OTP
(6 digits)                      Check expiry
                                Update last_login
                                Create access + refresh tokens
                        <────── Return: Tokens + User
```

**Endpoint**: `POST /api/auth/login-phone`

**Request**:
```json
{
  "phone_number": "+1234567890",
  "otp_code": "123456"
}
```

**Response**:
```json
{
  "user": { ... },
  "access_token": "eyJ...",
  "refresh_token": "eyJ..."
}
```

---

### Flow 3: Login (Username + OTP)

```
┌──────────────────────────────────────────────────────────┐
│ 3. Login Flow (Username + OTP)                          │
└──────────────────────────────────────────────────────────┘

User Action                    System Action
───────────────────────────    ───────────────────────────
Enter username          ──────> Lookup user by username
                                Get phone from identity
                                Generate 6-digit OTP
                                Send OTP to user's phone
                        <────── Return: OTP sent

Enter OTP code          ──────> Validate OTP
(6 digits)                      Check expiry
                                Update last_login
                                Create tokens
                        <────── Return: Tokens + User
```

**Endpoint**: `POST /api/auth/login-username`

**Request**:
```json
{
  "username": "johndoe",
  "otp_code": "123456"
}
```

---

### Flow 4: Recovery (Lost Phone)

```
┌──────────────────────────────────────────────────────────┐
│ 4. Account Recovery Flow (Recovery Phrase)              │
└──────────────────────────────────────────────────────────┘

User Action                    System Action
───────────────────────────    ───────────────────────────
Enter username/email    ──────> Lookup user
                        <────── Return: User found

Enter recovery phrase   ──────> Hash phrase with stored salt
(12 words)                      Compare with stored hash
                                Verify match
                        <────── Return: Phrase valid, logged in

Enter new phone         ──────> Generate OTP for new phone
                                Send OTP
                        <────── Return: OTP sent

Enter OTP               ──────> Validate OTP
                                Update phone_number
                                Update last_phone_change_at
                                Create tokens
                        <────── Return: Tokens + User
```

**Endpoint**: `POST /api/auth/recovery/phrase-login`

**Request**:
```json
{
  "identifier": "johndoe",  // Username or email
  "recovery_phrase": "apple banana cherry dog elephant forest guitar hotel island jungle kitchen lemon"
}
```

---

## 🔑 OTP SYSTEM

### OTP Generation

- **Length**: 6 digits
- **Format**: Numeric only (000000 - 999999)
- **Expiry**: 5 minutes
- **Rate Limiting**: Max 3 requests per 10 minutes per phone
- **Delivery**: SMS via external provider (configurable)

### OTP Storage

OTPs are stored in memory/cache (Redis recommended) with TTL:

```json
{
  "phone": "+1234567890",
  "code": "123456",
  "purpose": "login",  // or "register", "change_phone", etc.
  "expires_at": "2025-12-09T10:15:00Z",
  "attempts": 0
}
```

### OTP Validation

- **Max Attempts**: 3 failed attempts = OTP invalidated
- **Case Sensitive**: No (always numeric)
- **Reuse**: No (OTP invalidated after successful use)

---

## 🛡️ RECOVERY PHRASE SYSTEM

### Recovery Phrase Generation

- **Length**: 12 words
- **Word List**: BIP39 English word list (2048 words)
- **Entropy**: ~128 bits
- **Format**: Space-separated lowercase words

**Example**: `"apple banana cherry dog elephant forest guitar hotel island jungle kitchen lemon"`

### Recovery Phrase Storage

**NEVER store recovery phrase in plaintext!**

**Storage Process**:
1. Generate random 12-word phrase from BIP39 list
2. Generate random salt (32 bytes)
3. Hash phrase with salt using bcrypt
4. Store `recovery_phrase_hash` and `recovery_phrase_salt`

**Validation Process**:
1. User enters recovery phrase
2. Hash entered phrase with stored salt
3. Compare hashes (constant-time comparison)
4. Allow recovery if match

### Recovery Phrase Security

- **Never transmitted**: Only hashed version transmitted
- **Never logged**: Phrase never appears in logs
- **One-time display**: Shown once during registration
- **User responsibility**: User must save phrase securely
- **No backdoor**: BANIBS cannot recover lost phrases

---

## 🔐 JWT TOKEN SYSTEM

### Access Token

- **Type**: JWT (JSON Web Token)
- **Lifetime**: 15 minutes
- **Payload**:
  ```json
  {
    "sub": "user-uuid-123",
    "email": "john@example.com",
    "roles": ["user", "contributor"],
    "membership_level": "free",
    "exp": 1234567890,
    "iat": 1234567890
  }
  ```

### Refresh Token

- **Type**: JWT
- **Lifetime**: 7 days
- **Purpose**: Obtain new access token without re-authentication
- **Storage**: HttpOnly cookie (secure, SameSite=Strict)

### Token Refresh Flow

```
User presents refresh token ──────> Validate refresh token
                                     Check expiry
                                     Check user still active
                                     Generate new access token
                            <────── Return: New access token
```

**Endpoint**: `POST /api/auth/refresh`

---

## 📱 SUPPORTED AUTHENTICATION METHODS

| Method | Endpoint | Primary Use | Security Level |
|--------|----------|-------------|----------------|
| **Phone + OTP** | `/login-phone` | New users, mobile | ⭐⭐⭐⭐⭐ High |
| **Username + OTP** | `/login-username` | Returning users | ⭐⭐⭐⭐⭐ High |
| **Recovery Phrase** | `/recovery/phrase-login` | Lost phone recovery | ⭐⭐⭐⭐ Medium-High |
| **Email + Password** | `/login` (legacy) | Legacy users only | ⭐⭐⭐ Medium (deprecated) |

---

## 🌍 PHONE NUMBER HANDLING

### Phone Number Format

All phone numbers are stored in **E.164 format**:
- International format with country code
- No spaces, dashes, or parentheses
- Leading `+` sign
- Example: `+12345678900` (US), `+2348012345678` (Nigeria)

### Phone Number Normalization

User input is automatically normalized:
- Remove all non-digit characters
- Add country code if missing (based on detected region)
- Format to E.164
- Validate against libphonenumber rules

### Supported Regions

BGLIS supports phone numbers from all regions via libphonenumber validation.

---

## 🔄 MIGRATION FROM LEGACY AUTH

### Legacy User Identification

Users created via legacy email+password auth have:
- `needs_bglis_upgrade: true`
- `phone_number: null`
- `username: null`
- `has_recovery_phrase: false`

### Upgrade Flow

```
Legacy user logs in       ──────> Check needs_bglis_upgrade
                                   Prompt for phone number
                          <────── Show upgrade modal

User enters phone         ──────> Send OTP
                          <────── OTP sent

User enters OTP           ──────> Validate OTP
                                   Update phone_number
                                   Set is_phone_verified=true

User enters username      ──────> Check availability
                                   Update username

System generates phrase   ──────> Generate 12-word phrase
                                   Hash and store
                                   Set has_recovery_phrase=true
                          <────── Display phrase (save it!)

Upgrade complete          ──────> Set needs_bglis_upgrade=false
                                   User now BGLIS-compliant
```

---

## 🛠️ IMPLEMENTATION DETAILS

### Service Files

- **Auth Routes**: `/app/backend/routes/bglis_auth.py`
- **Identity Model**: `/app/backend/models/unified_user.py`
- **Database Ops**: `/app/backend/db/unified_users.py`
- **OTP Service**: `/app/backend/services/otp_service.py`
- **Phone Service**: `/app/backend/services/phone_service.py`
- **Recovery Service**: `/app/backend/services/recovery_phrase_service.py`
- **JWT Service**: `/app/backend/services/jwt_service.py`

### Database Collection

- **Name**: `banibs_users`
- **Indexes**:
  - Unique: `id` (UUID)
  - Unique: `phone_number` (nullable)
  - Unique: `username` (nullable)
  - Unique: `email` (nullable)
  - Index: `roles`
  - Index: `created_at`

---

## 🚀 API ENDPOINTS REFERENCE

### Registration

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-otp` | POST | Send OTP for phone verification |
| `/api/auth/verify-otp` | POST | Verify OTP code |
| `/api/auth/register-bglis` | POST | Complete BGLIS registration |

### Login

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login-phone` | POST | Login with phone + OTP |
| `/api/auth/login-username` | POST | Login with username + OTP |

### Recovery

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/recovery/phrase-login` | POST | Login with recovery phrase |
| `/api/auth/recovery/reset-phone` | POST | Set new phone after recovery |
| `/api/auth/recovery/regenerate-phrase` | POST | Generate new recovery phrase |

### Account Management

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/change-phone` | POST | Change phone number |
| `/api/auth/me` | GET | Get current user |
| `/api/auth/profile` | PATCH | Update profile |
| `/api/auth/refresh` | POST | Refresh access token |

---

## 🔒 SECURITY CONSIDERATIONS

### Rate Limiting

- **OTP Requests**: 3 per 10 minutes per phone
- **Login Attempts**: 5 per 15 minutes per user
- **Recovery Attempts**: 3 per hour per user

### Brute Force Protection

- Lock account after 5 failed login attempts
- Require OTP re-verification after lockout
- Admin intervention for repeated lockouts

### Recovery Phrase Protection

- Max 3 recovery phrase attempts
- Lockout for 24 hours after 3 failed attempts
- Email notification (if email provided) on recovery use

### Data Privacy

- Phone numbers are hashed in logs
- Recovery phrases never logged
- Tokens are HttpOnly cookies
- CORS configured for *.banibs.com only

---

## 📊 MONITORING & METRICS

### Key Metrics to Track

1. **Registration Conversion**
   - OTP send → OTP verify success rate
   - OTP verify → Registration complete rate

2. **Login Success Rate**
   - Phone login success rate
   - Username login success rate
   - Average login time

3. **Recovery Usage**
   - Recovery phrase usage frequency
   - Recovery success rate
   - Phone change frequency

4. **Security Events**
   - Failed login attempts
   - Account lockouts
   - Recovery phrase failures

---

## ✅ BGLIS COMPLIANCE CHECKLIST

A BGLIS-compliant identity has:
- [x] `phone_number` is not null
- [x] `is_phone_verified` is true
- [x] `username` is not null
- [x] `has_recovery_phrase` is true
- [x] `recovery_phrase_hash` is not null
- [x] `recovery_phrase_salt` is not null

Check BGLIS compliance:
```python
def is_bglis_compliant(user: dict) -> bool:
    return (
        user.get("phone_number") is not None and
        user.get("is_phone_verified") == True and
        user.get("username") is not None and
        user.get("has_recovery_phrase") == True
    )
```

---

## 🌟 BENEFITS OF BGLIS

1. **Phone-First Security**: Phone numbers are harder to spoof than emails
2. **Memorable Identity**: Usernames are easier to remember than UUIDs
3. **Recovery Safety Net**: Recovery phrase enables account recovery
4. **Privacy-Respecting**: Email is optional, reducing data collection
5. **Universal Login**: One identity for all BANIBS properties
6. **Fraud Reduction**: Phone verification reduces fake accounts

---

**End of BGLIS_ARCHITECTURE.md**
