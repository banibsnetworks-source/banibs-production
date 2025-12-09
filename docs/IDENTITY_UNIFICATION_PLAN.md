# BANIBS Identity Unification Plan — Priority 0 Sprint

**Created**: December 9, 2025  
**Status**: 🚧 IN PROGRESS  
**Sprint Duration**: 4-6 days  
**Goal**: Designate BGLIS as master identity gateway, implement BDII threading layer

---

## 📊 CURRENT STATE ANALYSIS

### Identity Models Discovered

#### 1. **UnifiedUser** (`/app/backend/models/unified_user.py`)
- **Collection**: `banibs_users`
- **Primary Key**: UUID `id` field
- **Status**: Most comprehensive model (384 lines)
- **Features**:
  - BGLIS v1.0 fields present (phone, username, recovery phrase)
  - Email + password (legacy auth)
  - Roles: `user`, `contributor`, `creator`, `admin`, `super_admin`
  - Membership levels
  - Region preferences
  - Profile customization
  - Emoji identity
  - Metadata dict

**Assessment**: ✅ **This is our BGLIS identity model** — most feature-complete

---

#### 2. **UserDB** (`/app/backend/models/user.py`)
- **Collection**: `users` (assumed, not `banibs_users`)
- **Primary Key**: MongoDB ObjectId (`_id`)
- **Status**: Legacy admin-only model (54 lines)
- **Features**:
  - Email + password_hash only
  - Role: `super_admin` or `moderator` only
  - Created/updated timestamps
  - Minimal fields

**Assessment**: ❌ **Legacy admin model** — should be deprecated or merged into UnifiedUser roles

---

#### 3. **ContributorDB** (`/app/backend/models/contributor.py`)
- **Collection**: `contributors` (assumed)
- **Primary Key**: MongoDB ObjectId (`_id`)
- **Status**: Separate contributor identity (79 lines)
- **Features**:
  - Email + password_hash
  - Name, organization
  - Display name, bio, website
  - Verification status
  - Submission stats (total, approved, featured)

**Assessment**: 🟡 **Separate contributor identity** — needs BDII threading to link to UnifiedUser

---

#### 4. **UserConnection/Peoples** (`/app/backend/models/peoples.py`)
- **Collection**: Not a user identity, but a relationship model
- **Status**: Social layer, not identity
- **Features**:
  - follower_user_id → target_user_id connections
  - "Add to My Peoples" concept

**Assessment**: ✅ **Correct design** — Peoples is a social layer on top of identity (not identity itself)

---

### Authentication Routes Discovered

#### 1. **unified_auth.py** (`/app/backend/routes/unified_auth.py`)
- **Purpose**: "Phase 6.0 Unified Identity" routes
- **Endpoints**: `/api/auth/*`
  - `POST /register` — Email + password registration
  - `POST /login` — Email + password login
  - `POST /refresh` — Token refresh
  - `POST /logout` — Logout
  - `POST /forgot-password` — Password reset
  - `POST /reset-password` — Complete password reset
  - `GET /me` — Get current user
  - `PATCH /profile` — Update profile
- **Collection Used**: `banibs_users` (via `db.unified_users`)
- **Status**: Active, uses UnifiedUser model

**Assessment**: 🟡 **Currently active but should be absorbed by BGLIS**

---

#### 2. **bglis_auth.py** (`/app/backend/routes/bglis_auth.py`)
- **Purpose**: "BGLIS v1.0 Phone-first Global Identity"
- **Endpoints**: `/api/auth/*`
  - `POST /send-otp` — Send OTP for phone verification
  - `POST /verify-otp` — Verify OTP
  - `POST /register-bglis` — Phone-first registration
  - `POST /login-phone` — Login with phone + OTP
  - `POST /login-username` — Login with username + OTP
  - `POST /recovery/phrase-login` — Recovery phrase login
  - `POST /recovery/reset-phone` — Reset phone after recovery
  - `POST /change-phone` — Change phone number
  - `POST /recovery/regenerate-phrase` — Regenerate recovery phrase
- **Collection Used**: `banibs_users` (via `db.unified_users`)
- **Status**: Active, BGLIS-compliant users only

**Assessment**: ✅ **This is our master gateway** — should handle ALL authentication

---

#### 3. **auth.py** (`/app/backend/routes/auth.py`)
- **Purpose**: Legacy admin authentication
- **Endpoints**: `/api/admin/auth/*` (assumed)
- **Collection Used**: `users` (not `banibs_users`)
- **Status**: Unknown (need to check if still registered)

**Assessment**: ❌ **Legacy admin auth** — should be deprecated

---

#### 4. **contributor_auth.py** (`/app/backend/routes/contributor_auth.py`)
- **Purpose**: Contributor-specific authentication
- **Endpoints**: `/api/contributor/auth/*` (assumed)
- **Collection Used**: `contributors`
- **Status**: Active for opportunity submission system

**Assessment**: 🟡 **Contributor auth** — should become BGLIS + role check

---

### Database Collections in Use

| Collection | Model | Primary Key | Purpose | Status |
|------------|-------|-------------|---------|--------|
| `banibs_users` | UnifiedUser | UUID `id` | Main user accounts | ✅ KEEP (rename to BGLIS) |
| `users` | UserDB | ObjectId `_id` | Legacy admin accounts | ❌ DEPRECATE |
| `contributors` | ContributorDB | ObjectId `_id` | Contributor accounts | 🟡 MERGE or THREAD |
| `relationships` | N/A | Composite key | User relationships (trust tiers) | ✅ KEEP |
| `circle_edges` | N/A | Composite key | Graph edges | ✅ KEEP |

---

## 🎯 BGLIS DESIGNATION DECISION

### BGLIS Identity = UnifiedUser Model

**Rationale**:
1. UnifiedUser already contains BGLIS v1.0 fields:
   - `phone_number`, `phone_country_code`, `is_phone_verified`
   - `username`
   - `has_recovery_phrase`, `recovery_phrase_hash`, `recovery_phrase_salt`
   - `needs_bglis_upgrade` migration flag

2. UnifiedUser uses `banibs_users` collection (already in use)

3. BGLIS auth routes (`bglis_auth.py`) already use UnifiedUser

4. Most comprehensive user model (roles, membership, region, profile)

**Action**: Formally designate `UnifiedUser` as **BGLIS Identity Model**

---

## 🧵 BDII IDENTITY THREADING ARCHITECTURE

### What is BDII (Distributed Identity Infrastructure)?

BDII creates a **single identity graph** that threads through all identity types:
- **BGLIS Identity** (authentication layer) → base identity
- **Peoples Identity** (social layer) → social presence
- **Contributor Identity** (content creator layer) → submission tracking
- **Seller Identity** (business layer) → marketplace presence
- **Admin Identity** (moderation layer) → system access

### Threading Model

```
┌─────────────────────────────────────────────────────┐
│         BGLIS Identity (banibs_users)               │
│  id: UUID                                           │
│  phone_number: +1234567890                          │
│  username: "johndoe"                                │
│  email: "john@example.com"                          │
│  roles: ["user", "contributor", "admin"]            │
└─────────────────┬───────────────────────────────────┘
                  │
                  │ BDII Threading Layer
                  │
    ┌─────────────┼─────────────┬──────────────┐
    │             │              │              │
    ▼             ▼              ▼              ▼
┌────────┐  ┌─────────────┐  ┌────────┐  ┌──────────┐
│Peoples │  │ Contributor │  │ Seller │  │  Admin   │
│Profile │  │   Profile   │  │Profile │  │ Profile  │
└────────┘  └─────────────┘  └────────┘  └──────────┘
```

### Threading Implementation Strategy

**Option A: Single Collection (Recommended)**
- Keep all identity in `banibs_users`
- Use `roles` array to indicate identity types
- Store role-specific data in nested objects or metadata
- Example:
  ```json
  {
    "id": "uuid-123",
    "username": "johndoe",
    "roles": ["user", "contributor", "seller"],
    "contributor_profile": {
      "total_submissions": 50,
      "verified": true
    },
    "seller_profile": {
      "business_name": "John's Shop",
      "verified_seller": true
    }
  }
  ```

**Option B: Multiple Collections with Foreign Keys (Alternate)**
- Keep `banibs_users` as master identity
- Create `contributor_profiles`, `seller_profiles` collections
- Link via `bglis_user_id` foreign key
- Requires join operations

**Decision**: Choose **Option A** for performance and simplicity

---

## 📋 MIGRATION PLAN

### Phase 1: BGLIS Elevation (Days 1-2)

#### Day 1: Identity Audit & Documentation ✅ IN PROGRESS

**Tasks**:
- [x] Map all user/identity models
- [x] Map all authentication routes
- [x] Document collections and keys
- [x] Create this unification plan
- [ ] Identify all code references to legacy auth
- [ ] Document breaking changes

**Deliverables**:
- This document
- Identity flow diagrams (to create)
- Breaking changes document (to create)

---

#### Day 2: Designate BGLIS as Master Gateway

**Tasks**:
1. **Update Documentation**
   - Rename "UnifiedUser" → "BGLISIdentity" in comments
   - Update all route/model comments to reference BGLIS
   - Create `/app/docs/BGLIS_ARCHITECTURE.md`

2. **Deprecate Legacy Auth Routes**
   - Add deprecation warnings to `unified_auth.py` routes
   - Add deprecation warnings to `auth.py` routes (if exists)
   - Update API docs to show BGLIS routes as primary

3. **Route All Auth Through BGLIS**
   - Ensure `bglis_auth.py` is registered before other auth routes
   - Add middleware to redirect legacy auth to BGLIS
   - Create migration endpoint for legacy users

**Deliverables**:
- Updated route documentation
- Deprecation warnings in code
- Migration path for legacy users

---

### Phase 2: Contributor Integration (Days 3-4)

#### Day 3: Merge Contributor Identity into BGLIS

**Tasks**:
1. **Update UnifiedUser Model**
   - Add `contributor_profile` nested object:
     ```python
     contributor_profile: Optional[Dict[str, Any]] = Field(
         default=None,
         description="Contributor-specific profile data"
     )
     ```
   - Fields to include:
     - `total_submissions`
     - `approved_submissions`
     - `featured_submissions`
     - `verified`
     - `display_name` (contributor-specific)
     - `bio` (contributor-specific)
     - `website_or_social`

2. **Create Migration Script**
   - Script: `/app/backend/scripts/migrate_contributors_to_bglis.py`
   - For each contributor in `contributors` collection:
     - Check if email exists in `banibs_users`
     - If yes: Add `contributor_profile` to existing user, add "contributor" to roles
     - If no: Create new BGLIS user with contributor profile
   - Log all migrations

3. **Update Contributor Auth Routes**
   - Modify `contributor_auth.py` to:
     - Use BGLIS phone/username auth OR legacy email auth
     - Check for "contributor" role in BGLIS identity
     - Return BGLIS tokens

**Deliverables**:
- Updated UnifiedUser model with contributor_profile
- Migration script
- Updated contributor auth routes

---

#### Day 4: Test Contributor Integration

**Tasks**:
1. **Run Migration Script**
   - Backup `contributors` collection
   - Run migration in test mode
   - Verify data integrity
   - Run migration in prod mode

2. **Test Contributor Flows**
   - Test contributor registration via BGLIS
   - Test contributor login via BGLIS
   - Test opportunity submission with BGLIS identity
   - Test contributor profile endpoints

3. **Update Frontend**
   - Update contributor registration to use BGLIS endpoints
   - Update contributor login to use BGLIS endpoints
   - Update contributor profile pages

**Deliverables**:
- Migrated contributors
- Test results
- Updated frontend code

---

### Phase 3: BDII Identity Resolution Service (Days 5-6)

#### Day 5: Create Identity Resolution Service

**Tasks**:
1. **Create BDII Service**
   - File: `/app/backend/services/bdii/identity_resolution.py`
   - Functions:
     - `resolve_identity(identifier: str) -> BGLISIdentity`
       - Accept: UUID, username, email, phone
       - Return: Full BGLIS identity
     - `get_peoples_identity(bglis_id: str) -> PeoplesProfile`
       - Return social profile for BGLIS user
     - `get_contributor_identity(bglis_id: str) -> ContributorProfile`
       - Return contributor profile for BGLIS user
     - `link_external_identity(bglis_id: str, external_type: str, external_id: str)`
       - Link BGLIS to external systems (future: OAuth, SSO)

2. **Update Relationship Engine**
   - Modify relationships to always use BGLIS UUID
   - Ensure trust tiers reference BGLIS identities

3. **Update Circle Engine**
   - Modify circle edges to use BGLIS UUID
   - Ensure graph traversal uses BGLIS identities

**Deliverables**:
- BDII identity resolution service
- Updated relationship engine
- Updated circle engine

---

#### Day 6: Integration Testing & Documentation

**Tasks**:
1. **Integration Testing**
   - Test identity resolution across all identity types
   - Test BGLIS → Peoples lookup
   - Test BGLIS → Contributor lookup
   - Test relationship creation with BGLIS identities
   - Test circle graph with BGLIS identities

2. **Create Documentation**
   - `/app/docs/BGLIS_ARCHITECTURE.md`
   - `/app/docs/BDII_IDENTITY_THREADING.md`
   - Update `/app/docs/IDENTITY_ARCHITECTURE.md`

3. **Update API Documentation**
   - Mark legacy endpoints as deprecated
   - Document BGLIS endpoints as primary
   - Document identity resolution flows

**Deliverables**:
- Integration test results
- Complete BGLIS/BDII documentation
- Updated API docs

---

## 🔐 AUTHENTICATION FLOW (Post-Unification)

### Primary Flow: BGLIS Phone-First

```
User Registration:
1. User enters phone number
2. System sends OTP via SMS
3. User enters OTP + username + optional email
4. System creates BGLIS identity in banibs_users
5. System generates recovery phrase (12 words)
6. User saves recovery phrase
7. System returns JWT tokens

User Login:
1. User enters phone OR username
2. System sends OTP to registered phone
3. User enters OTP
4. System validates OTP
5. System returns JWT tokens

Recovery Flow:
1. User enters username OR email + recovery phrase
2. System validates recovery phrase
3. User sets new phone number
4. System sends OTP to new phone
5. User enters OTP
6. System updates phone, returns JWT tokens
```

### Legacy Flow: Email + Password (Deprecated)

```
Legacy User Login:
1. User enters email + password
2. System checks banibs_users collection
3. If user has needs_bglis_upgrade=true:
   - System prompts for phone number
   - System sends OTP
   - User completes BGLIS upgrade
4. System returns JWT tokens
```

---

## 🚨 BREAKING CHANGES

### For API Consumers

1. **Auth Endpoints**
   - **Deprecated**: `POST /api/auth/register` (email + password)
   - **Recommended**: `POST /api/auth/register-bglis` (phone + OTP)
   - **Timeline**: 90-day deprecation period

2. **Contributor Endpoints**
   - **Deprecated**: `POST /api/contributor/auth/register`
   - **Recommended**: `POST /api/auth/register-bglis` + role="contributor"
   - **Timeline**: 60-day deprecation period

3. **User Identity Fields**
   - **Added**: `username` (required for BGLIS users)
   - **Added**: `phone_number` (required for BGLIS users)
   - **Added**: `has_recovery_phrase` (required for BGLIS users)

### For Internal Services

1. **Database Queries**
   - All user lookups should use BGLIS UUID (`id` field)
   - No direct queries to `users` or `contributors` collections

2. **Authentication Middleware**
   - JWT tokens now contain BGLIS identity
   - Roles array indicates identity types (user, contributor, seller, admin)

---

## ✅ SUCCESS CRITERIA

### Day 1-2: BGLIS Elevation
- [ ] BGLIS designated as master identity in documentation
- [ ] Legacy auth routes marked as deprecated
- [ ] Migration path documented

### Day 3-4: Contributor Integration
- [ ] Contributors merged into banibs_users
- [ ] Contributor auth routes use BGLIS
- [ ] Contributor flows tested end-to-end

### Day 5-6: BDII Threading
- [ ] Identity resolution service created
- [ ] Relationship/Circle engines use BGLIS
- [ ] Integration tests passing
- [ ] Documentation complete

### Overall Success
- [ ] Single source of truth for identity (banibs_users)
- [ ] BGLIS serves as master gateway
- [ ] BDII threads all identity types
- [ ] No breaking changes to active users
- [ ] Clear migration path for legacy users

---

## 🔄 ROLLBACK PLAN

If critical issues arise:

1. **Immediate Rollback**: Revert route registration order to prioritize `unified_auth.py`
2. **Database Rollback**: Restore `contributors` collection from backup
3. **Code Rollback**: Git revert commits related to identity unification
4. **User Communication**: Notify users of temporary auth issues

---

## 📊 MONITORING & METRICS

Post-unification metrics to track:

1. **Auth Success Rate**
   - BGLIS phone auth success rate
   - Legacy email auth success rate
   - OTP delivery success rate

2. **Identity Resolution Performance**
   - Average resolution time
   - Cache hit rate
   - Failed resolution count

3. **Migration Progress**
   - % of users with BGLIS upgrade
   - % of contributors migrated
   - Legacy auth usage decline

---

## 🚀 NEXT STEPS AFTER UNIFICATION

Once identity unification is complete:

1. **Priority 1: Circle Trust Order Completion** (3-5 days)
   - Add CHILL, Safe Mode, Blocked tiers
   - Implement trust-based visibility
   - Update Infinite Circles for 7 tiers

2. **Priority 2: BDII Naming Resolution** (1-2 days)
   - Rename device system to BDI
   - Reserve BDII namespace

3. **Priority 3: Phase Realignment** (1 day)
   - Correct phase numbering
   - Update documentation

---

**Status**: 📝 Day 1 in progress — mapping complete, implementation starting  
**Next Action**: Complete Day 1 tasks, begin Day 2 BGLIS designation

---

**End of IDENTITY_UNIFICATION_PLAN.md**
