# Phase 6.0 - Endpoint Verification List
**For Review by:** Raymond Neely, CEO  
**Date:** November 1, 2025  
**Status:** Ready for Verification

---

## Authentication Endpoints (Unified Identity)

### Base URL
```
https://health-directory.preview.emergentagent.com/api/auth
```

### Endpoints Implemented

#### 1. **POST /api/auth/register**
**Purpose:** Create new unified BANIBS account

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "accepted_terms": true
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"],
    "membership_level": "free",
    "email_verified": false
  }
}
```

**Features:**
- ✅ Bcrypt password hashing
- ✅ Email verification token sent
- ✅ HttpOnly refresh token cookie set (domain: `.banibs.com`)
- ✅ Access token in response body

---

#### 2. **POST /api/auth/login**
**Purpose:** Authenticate user and return tokens

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "roles": ["user"],
    "membership_level": "free"
  }
}
```

**Features:**
- ✅ Password verification
- ✅ Updates `last_login` timestamp
- ✅ HttpOnly cookie set for SSO
- ✅ Returns user profile

---

#### 3. **POST /api/auth/refresh**
**Purpose:** Refresh access token using refresh token

**Request:**
- Refresh token in HttpOnly cookie OR
- Refresh token in request body:
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

**Features:**
- ✅ Validates refresh token
- ✅ Issues new access token (15 min)
- ✅ Rotates refresh token (security best practice)
- ✅ Updates refresh token cookie

---

#### 4. **POST /api/auth/logout**
**Purpose:** Clear session and invalidate tokens

**Request:** None (automatic cookie handling)

**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

**Features:**
- ✅ Clears refresh token cookie
- ✅ Client discards access token
- ✅ SSO-compatible (clears across `.banibs.com`)

---

#### 5. **POST /api/auth/forgot-password**
**Purpose:** Request password reset email

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If your email is registered, you will receive a password reset link"
}
```

**Features:**
- ✅ Generates secure reset token (1 hour validity)
- ✅ Sends reset email (non-blocking)
- ✅ Always returns success (security: no email enumeration)

---

#### 6. **POST /api/auth/reset-password**
**Purpose:** Complete password reset with token

**Request:**
```json
{
  "token": "secure_reset_token",
  "new_password": "newsecurepassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password reset successfully"
}
```

**Errors:**
- 400: Invalid or expired token

**Features:**
- ✅ Validates reset token
- ✅ Updates password (bcrypt)
- ✅ Clears reset token after use

---

#### 7. **POST /api/auth/verify-email**
**Purpose:** Verify email address with token

**Request:**
```json
{
  "token": "email_verification_token"
}
```

**Response (200 OK):**
```json
{
  "message": "Email verified successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "email_verified": true
  }
}
```

**Features:**
- ✅ Validates verification token (24h validity)
- ✅ Marks email as verified
- ✅ Clears verification token

---

#### 8. **GET /api/auth/me**
**Purpose:** Get current user profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": null,
  "bio": null,
  "roles": ["user"],
  "membership_level": "free",
  "email_verified": true,
  "created_at": "2025-11-01T12:00:00Z"
}
```

**Errors:**
- 401: Missing/invalid token

**Features:**
- ✅ Requires valid access token
- ✅ Returns sanitized user profile
- ✅ No sensitive data exposed

---

#### 9. **PATCH /api/auth/profile**
**Purpose:** Update user profile

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "name": "Jane Doe",
  "bio": "Community member and entrepreneur",
  "avatar_url": "https://cdn.banibs.com/avatars/user.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane Doe",
  "avatar_url": "https://cdn.banibs.com/avatars/user.jpg",
  "bio": "Community member and entrepreneur",
  "roles": ["user"],
  "membership_level": "free",
  "email_verified": true,
  "created_at": "2025-11-01T12:00:00Z"
}
```

**Features:**
- ✅ Requires authentication
- ✅ Updates only provided fields
- ✅ Returns updated profile

---

## JWT Token Specifications

### Access Token
- **Expiry:** 15 minutes
- **Storage:** Client localStorage
- **Usage:** Authorization header (`Bearer <token>`)
- **Payload:**
```json
{
  "sub": "user_id",
  "email": "user@example.com",
  "roles": ["user"],
  "membership_level": "free",
  "type": "access",
  "iat": 1730462400,
  "exp": 1730463300
}
```

### Refresh Token
- **Expiry:** 7 days
- **Storage:** HttpOnly cookie (domain: `.banibs.com`)
- **Usage:** Automatic (browser handles)
- **Security:** Secure, SameSite=Lax, HttpOnly

---

## SSO Compatibility

**Domains:**
- `banibs.com` - Main site
- `banibsnews.com` - News
- `banibsbiz.com` - Business
- `banibs.tv` - Video

**Cookie Domain:** `.banibs.com` (works across all subdomains)

**Token Sharing:**
- Refresh token shared via cookie
- Access token stored in localStorage per domain
- Frontend must sync access token across domains

---

## Middleware Updates

### Updated Functions

#### `get_current_user()`
- ✅ Uses `JWTService.verify_token()`
- ✅ Fetches full user from `banibs_users` collection
- ✅ Returns complete user object (not just payload)

#### `require_role()`
- ✅ Checks user's `roles` array (not single `role` field)
- ✅ Supports multiple roles per user
- ✅ Example: `require_role("super_admin", "moderator")`

#### `require_super_admin()`
- ✅ Checks for `"super_admin"` in roles array
- ✅ Updated for unified identity

#### `can_moderate()`
- ✅ Checks for `"super_admin"` or `"moderator"` in roles array
- ✅ Supports new role system

### New Functions (Phase 6.2)

#### `require_membership(*tiers)`
- Purpose: Tier-based feature gating
- Example: `require_membership("pro", "enterprise")`
- Hierarchy: `free < basic < pro < enterprise`

---

## User Migration Script

**File:** `/app/backend/scripts/migrate_to_unified_users.py`

### Usage

**Dry Run (No Changes):**
```bash
cd /app/backend
python scripts/migrate_to_unified_users.py
```

**Live Migration:**
```bash
cd /app/backend
python scripts/migrate_to_unified_users.py --live
```

### Features
- ✅ Migrates `users` table → `banibs_users`
- ✅ Migrates `contributors` table → `banibs_users`
- ✅ Automatic backup to `/tmp/`
- ✅ Detailed migration report
- ✅ Role mapping (admin → super_admin, etc.)
- ✅ Zero data loss guarantee
- ✅ Rollback capability

### Migration Mapping

**Users Table:**
```
role: "admin" → roles: ["user", "super_admin"]
role: "moderator" → roles: ["user", "moderator"]
```

**Contributors Table:**
```
All contributors → roles: ["user", "contributor"]
organization field → stored in metadata.organization
```

---

## Testing Checklist

### Manual Tests (Priority 1)
- [ ] Register new user
- [ ] Verify email link works
- [ ] Login with credentials
- [ ] Refresh access token
- [ ] Update profile
- [ ] Request password reset
- [ ] Complete password reset
- [ ] Logout

### Integration Tests (Priority 2)
- [ ] SSO across subdomains (test cookie sharing)
- [ ] Token expiry behavior (access + refresh)
- [ ] Role-based access control
- [ ] User migration (dry run)
- [ ] User migration (live, backup restore)

### Security Tests (Priority 3)
- [ ] Invalid token rejection
- [ ] Expired token handling
- [ ] Password strength (min 8 chars)
- [ ] Email enumeration protection
- [ ] CORS configuration
- [ ] HttpOnly cookie security

---

## Environment Variables Required

Add to `/app/backend/.env`:
```bash
# JWT Secret (generate secure random key)
JWT_SECRET="your-secure-random-key-here"

# Frontend URL (for email links)
FRONTEND_URL="https://banibs.com"

# Email service (already configured from Phase 4.2)
# SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD
```

**Generate JWT Secret:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

---

## Next Steps After Verification

1. **Test all 9 endpoints** using Postman/curl
2. **Run migration script** (dry run first)
3. **Verify SSO cookie sharing** across subdomains
4. **Update frontend** to use new auth endpoints
5. **Deploy to production** with monitoring

---

## Known Limitations

1. **Email Service:** Requires SMTP configuration (from Phase 4.2)
2. **SSO Testing:** Requires multiple subdomains configured in environment
3. **Token Rotation:** Refresh tokens rotate on each refresh (may invalidate old clients)

---

## Support & Troubleshooting

### Common Issues

**Issue:** "Invalid or expired token"
- **Solution:** Check token expiry times, ensure clocks are synchronized

**Issue:** "Email already registered"
- **Solution:** User already exists, use login endpoint

**Issue:** "Refresh token cookie not set"
- **Solution:** Verify domain configuration (`.banibs.com`), check HTTPS

**Issue:** "Migration failed"
- **Solution:** Check MongoDB connection, verify backup creation

---

**Prepared by:** Neo (Emergent AI Engineer)  
**Date:** November 1, 2025  
**Status:** Ready for CEO Verification

---

**Next Action:** Await verification and testing approval from Raymond Neely (CEO)
