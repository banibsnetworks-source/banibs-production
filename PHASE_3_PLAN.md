# PHASE 3 - Engagement & Growth Features

## Branch: `banibs-v2.0-engagement-growth`

## Overview
Phase 3 moves BANIBS from "the platform works" to "the platform grows and can be trusted" by adding contributor credibility, admin auditability, automated notifications, and production-ready infrastructure.

---

## Phase 3.1 - Contributor Profiles & Verification ✅ COMPLETE

### Backend Changes

#### Extended Contributor Model
**File**: `models/contributor.py`

New fields added to `contributors` collection:
- `display_name` (str, optional) - Public display name
- `bio` (str, optional) - Short biography
- `website_or_social` (str, optional) - Website or social media link
- `verified` (bool, default: False) - Verification badge status
- `total_submissions` (int, default: 0) - Total opportunities submitted
- `approved_submissions` (int, default: 0) - Number of approved opportunities
- `featured_submissions` (int, default: 0) - Number of featured opportunities

#### New Endpoints

**1. GET `/api/contributors/{contributor_id}/profile`** (Public)
- Fetch contributor profile by ID
- Returns: `ContributorProfile` model
- Response:
  ```json
  {
    "id": "contributor-uuid",
    "display_name": "John Doe",
    "bio": "Passionate about connecting people with opportunities",
    "website_or_social": "https://linkedin.com/in/johndoe",
    "verified": true,
    "total_submissions": 15,
    "approved_submissions": 12,
    "featured_submissions": 3
  }
  ```

**2. PATCH `/api/contributors/profile`** (Contributor Auth Required)
- Update own profile
- Body:
  ```json
  {
    "display_name": "New Display Name",
    "bio": "Updated bio",
    "website_or_social": "https://example.com"
  }
  ```

**3. PATCH `/api/contributors/{contributor_id}/verify`** (Admin Only)
- Toggle verified status for a contributor
- Body:
  ```json
  {
    "verified": true
  }
  ```
- Returns:
  ```json
  {
    "success": true,
    "contributor_id": "...",
    "verified": true,
    "message": "Contributor verification set to true"
  }
  ```

#### Opportunity Model Updates
**File**: `models/opportunity.py`

Extended `OpportunityPublic` model:
- `contributor_display_name` (str, optional)
- `contributor_verified` (bool, default: False)

#### Enhanced Opportunity Endpoints
All opportunity list endpoints now enrich responses with contributor data:
- `/api/opportunities/` (public)
- `/api/opportunities/featured` (public)
- `/api/opportunities/pending` (admin)

Each opportunity includes:
- `contributor_display_name`: Display name or fallback to email
- `contributor_verified`: Boolean indicating verified status

#### Contributor Stats Auto-Update
- **On submission**: `total_submissions` increments
- **On approval**: `approved_submissions` increments
- **On feature**: Both `approved_submissions` and `featured_submissions` increment

---

## Phase 3.2 - Moderation History & Audit Trail ✅ COMPLETE

### New Collection: `moderation_logs`

#### Schema
```json
{
  "_id": "log-uuid",
  "opportunity_id": "opportunity-uuid",
  "moderator_user_id": "admin-user-id",
  "action_type": "approve" | "reject" | "feature",
  "note": "Optional moderator notes",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### New Endpoints

**1. GET `/api/admin/moderation-log/opportunities/{opportunity_id}`** (Admin Only)
- Get all moderation logs for a specific opportunity
- Returns list of `ModerationLogPublic` objects
- Includes moderator email enrichment
- Sorted by timestamp (most recent first)

**2. GET `/api/admin/moderation-log/?moderatorUserId={id}`** (Admin Only)
- Get all moderation logs, optionally filtered by moderator
- Query params:
  - `moderatorUserId` (optional): Filter by specific moderator
- Returns list of `ModerationLogPublic` objects

**3. GET `/api/admin/moderation-log/export.csv`** (Admin Only)
- Export all moderation logs to CSV
- Same filtering as above (accepts `moderatorUserId` query param)
- CSV columns:
  - Log ID
  - Opportunity ID
  - Moderator User ID
  - Moderator Email
  - Action Type
  - Note
  - Timestamp
- Filename: `moderation_logs_YYYYMMDD_HHMMSS.csv`

### Moderation Flow (3-Step Chain)
Every approve/reject/feature action now:
1. **Updates opportunity status** (approved, rejected, featured flags + notes)
2. **Inserts moderation log** (opportunityId, moderatorUserId, actionType, note, timestamp)
3. **Sends email notification** (see Phase 3.3)

### Files
- **Model**: `models/moderation_log.py`
- **DB Layer**: `db/moderation_logs.py`
- **Routes**: `routes/moderation_logs.py`
- **Integration**: Updated `routes/opportunities.py` moderation endpoints

---

## Phase 3.3 - Email Notifications ✅ COMPLETE

### SMTP Configuration

**Required Environment Variables**:
```bash
SMTP_HOST=smtp.gmail.com              # SMTP server hostname
SMTP_PORT=587                         # SMTP port (usually 587 for TLS)
SMTP_USER=your-email@example.com      # SMTP username
SMTP_PASS=your-app-password           # SMTP password
EMAIL_FROM="BANIBS <noreply@banibs.com>"  # From name and email
```

**Fallback Behavior**: If SMTP env vars are missing, emails are logged to console instead of sent (prevents crashes in development).

### Email Service
**File**: `services/email_service.py`

#### Transactional Emails

**1. Opportunity Approved**
- **Trigger**: Admin approves opportunity
- **Recipient**: Contributor email
- **Subject**: "🎉 Your Opportunity Has Been Approved - BANIBS"
- **Content**:
  - Congratulations message
  - Opportunity title
  - Link to view live opportunity
  - BANIBS black/gold branding

**2. Opportunity Rejected**
- **Trigger**: Admin rejects opportunity
- **Recipient**: Contributor email
- **Subject**: "Opportunity Submission Update - BANIBS"
- **Content**:
  - Polite rejection message
  - Opportunity title
  - **Rejection reason (moderator note)**
  - Encouragement to submit again
  - Link to submit new opportunity
  - BANIBS black/gold branding

**3. Opportunity Featured**
- **Trigger**: Admin features opportunity
- **Recipient**: Contributor email
- **Subject**: "⭐ Your Opportunity is Now Featured - BANIBS"
- **Content**:
  - Celebration message
  - Opportunity title
  - Explanation of featured status benefits
  - Link to view featured opportunities
  - BANIBS black/gold branding

### Weekly Digest Function

**Function**: `generate_weekly_digest(db)`
- **Purpose**: Generate structured digest of new/featured opportunities
- **Returns**: Dictionary with:
  - `week_start` / `week_end`: ISO timestamps
  - `total_new_opportunities`: Count
  - `opportunities_by_type`: Dict grouped by type (job, grant, scholarship, training, event)
  - `featured_opportunities`: List of featured opps
  - `summary_counts`: Counts per type

**Usage**:
```python
digest = await generate_weekly_digest(db)
# Use digest data to compose email or dashboard widget
```

**NOT SCHEDULED**: This function is implemented but not automatically triggered. It can be called manually or integrated with a scheduler in the future.

---

## Phase 3.5 - Infrastructure & Production Prep ✅ COMPLETE

### Request Logging Middleware
**File**: `server.py`

Added `RequestLoggingMiddleware`:
- Logs every HTTP request
- Format: `{METHOD} {PATH} - Status: {STATUS_CODE} - Duration: {SECONDS}s`
- Example: `GET /api/opportunities/ - Status: 200 - Duration: 0.143s`
- Helps with observability in production

### Environment Configuration

#### Backend Environment Variables
```bash
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=banibs

# JWT Auth
JWT_SECRET=your-secret-key-here
JWT_ALGORITHM=HS256

# SMTP Email (Phase 3.3)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
EMAIL_FROM="BANIBS <noreply@banibs.com>"

# AWS S3 (optional)
S3_BUCKET_NAME=banibs-uploads
AWS_REGION=us-east-1
CLOUDFRONT_URL=https://cdn.banibs.com
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# CORS
CORS_ORIGINS=http://localhost:3000,https://banibs.com
```

#### Frontend Environment Variables
```bash
# API Base URL
REACT_APP_BACKEND_URL=https://api.banibs.com

# Assets/CDN (if separate)
REACT_APP_ASSETS_URL=https://cdn.banibs.com
```

### No Hardcoded URLs
- All backend URLs read from `REACT_APP_BACKEND_URL` environment variable
- All API routes use `/api` prefix for Kubernetes ingress compatibility
- No Railway-specific URLs remain in codebase

---

## Summary of All Changes

### New Models
1. **ContributorProfile** - Public profile view
2. **ContributorProfileUpdate** - Profile update request
3. **ModerationLogDB** - Moderation log database model
4. **ModerationLogPublic** - Public moderation log view

### New Collections
1. **moderation_logs** - Audit trail for all moderation actions

### New Endpoints

#### Contributor Profiles
- `GET /api/contributors/{id}/profile` (public)
- `PATCH /api/contributors/profile` (contributor auth)
- `PATCH /api/contributors/{id}/verify` (admin)

#### Moderation Logs
- `GET /api/admin/moderation-log/opportunities/{id}` (admin)
- `GET /api/admin/moderation-log/` (admin, with optional filter)
- `GET /api/admin/moderation-log/export.csv` (admin)

### Enhanced Endpoints
- `/api/opportunities/` - Now includes contributor info
- `/api/opportunities/featured` - Now includes contributor info
- `/api/opportunities/pending` - Now includes contributor info
- `/api/opportunities/submit` - Now increments total_submissions
- `/api/opportunities/{id}/approve` - Now logs, updates stats, sends email
- `/api/opportunities/{id}/reject` - Now logs, sends email with reason
- `/api/opportunities/{id}/feature` - Now logs, updates stats, sends email

### New Services
- **Email Service** (`services/email_service.py`)
  - `send_opportunity_approved_email()`
  - `send_opportunity_rejected_email()`
  - `send_opportunity_featured_email()`
  - `generate_weekly_digest()`

### Middleware
- **RequestLoggingMiddleware** - Logs all HTTP requests with duration

---

## Breaking Changes

### None for Existing Features
All Phase 2.9 features remain fully functional. Phase 3 adds new fields and endpoints but does not modify existing behavior.

### Database Migration Notes
1. Existing contributors will have default values for new fields:
   - `display_name`: null (fallback to `name`)
   - `bio`: null
   - `website_or_social`: null
   - `verified`: false
   - `total_submissions`: 0
   - `approved_submissions`: 0
   - `featured_submissions`: 0

2. New `moderation_logs` collection will be created automatically on first moderation action.

3. Existing opportunities will not have contributor display names until re-fetched from API (enrichment happens on read).

---

## Testing Checklist

### Phase 3.1 - Contributor Profiles
- [ ] Create contributor account
- [ ] Update profile (display name, bio, social link)
- [ ] View public profile page
- [ ] Admin can verify/unverify contributor
- [ ] Verified badge appears on opportunities
- [ ] Stats increment correctly (submissions, approved, featured)

### Phase 3.2 - Moderation Logs
- [ ] Approve opportunity creates log entry
- [ ] Reject opportunity creates log entry
- [ ] Feature opportunity creates log entry
- [ ] View logs for specific opportunity
- [ ] Filter logs by moderator
- [ ] Export logs to CSV
- [ ] CSV contains all required columns

### Phase 3.3 - Email Notifications
- [ ] Approve sends email to contributor
- [ ] Reject sends email with moderator note
- [ ] Feature sends email to contributor
- [ ] Emails render correctly with BANIBS branding
- [ ] Emails fall back to logging if SMTP not configured
- [ ] Weekly digest function generates correct data structure

### Phase 3.5 - Infrastructure
- [ ] Request logging appears in backend logs
- [ ] All URLs read from environment variables
- [ ] No hardcoded URLs in codebase
- [ ] Backend runs with production env vars

---

## Next Steps (Not in Scope for Phase 3)

### Future Phases
1. **Public Reactions** (likes, saves, shares)
2. **Newsletter Subscriptions**
3. **Payment Integration** (Stripe for premium features)
4. **Advanced RBAC** (moderator role between contributor and admin)
5. **Contributor Dashboard** (/contributor/my-submissions)
6. **Advanced Analytics** (time-series, approval rates)
7. **Notification Preferences** (email settings per contributor)
8. **Scheduled Digest Emails** (automate weekly digest sending)

---

## Files Created/Modified in Phase 3

### Backend

#### New Files
- `models/contributor.py` - Extended with profile fields
- `models/moderation_log.py` - NEW
- `routes/contributor_profile.py` - NEW
- `routes/moderation_logs.py` - NEW
- `services/email_service.py` - NEW
- `db/moderation_logs.py` - NEW

#### Modified Files
- `models/opportunity.py` - Added contributor fields to OpportunityPublic
- `routes/opportunities.py` - Enhanced all endpoints with contributor data, logging, emails
- `server.py` - Added new routers, request logging middleware

### Frontend
**No frontend changes in Phase 3 backend implementation**

Frontend changes will be implemented separately to display:
- Contributor profiles at `/contributor/:id`
- Verified badges in opportunity cards
- Moderation history in admin dashboard
- CSV export button in admin dashboard

### Documentation
- `PHASE_3_PLAN.md` - THIS FILE
- `DEPLOYMENT_NOTES.md` - See separate file

---

## Production Deployment Checklist

Before deploying to production:

1. ✅ Set all required environment variables (SMTP, JWT, DB, S3)
2. ✅ Verify SMTP credentials work (send test email)
3. ✅ Run database migration to add new fields to existing contributors
4. ✅ Test email notifications in staging environment
5. ✅ Verify request logging doesn't impact performance
6. ✅ Set up log aggregation/monitoring for request logs
7. ✅ Test CSV export with large datasets
8. ✅ Verify contributor stats increment correctly
9. ✅ Test all new endpoints with production-like data
10. ✅ Update API documentation with new endpoints

---

## Support

For questions or issues with Phase 3 features:
- Backend API: Check logs at `/var/log/supervisor/backend.*.log`
- Email issues: Verify SMTP environment variables
- Database issues: Check MongoDB connection and collections
- Moderation logs: Verify `moderation_logs` collection exists

---

**Phase 3 Status**: ✅ Backend Complete (100%)
**Next**: Frontend implementation to display new features
