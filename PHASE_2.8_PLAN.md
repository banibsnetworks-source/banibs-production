# BANIBS Phase 2.8 - Admin Dashboard + S3 Uploads + Enhanced Auth

**Branch:** `banibs-v1.8-admin-dashboard`  
**Base:** `v1.7-stable`  
**Date:** October 28, 2025  
**Status:** 🚧 In Progress

---

## 🎯 Goals

Build a secure Admin Dashboard with real S3 image uploads and JWT authentication for moderation and content control.

### Core Objectives:
- ✅ Admin UI for moderation (Approve/Reject/Feature)
- ✅ JWT authentication replacing API keys
- ✅ Real AWS S3 uploads with CloudFront
- ✅ Audit trail for admin actions
- ✅ Live API integration on public pages
- ✅ BANIBS black/gold branding throughout

---

## 🔐 1. Authentication System

### 1.1 JWT Strategy

**Two-Token System:**
- **Access Token:** Short-lived (15 minutes), stored in memory
- **Refresh Token:** Long-lived (7 days), stored in httpOnly cookie (or memory for Phase 2.8)

**Secrets (256-bit):**
```env
JWT_ACCESS_SECRET=-rVB6jpavDLRmHKiowS_952v6LD_4dGUtaUWHtmgZL0
JWT_REFRESH_SECRET=hBFiiNyBQ0HxbXVLA5wb8kz1W7ha_R-M-XHCr6OpWYM
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
```

### 1.2 User Model

**Collection:** `users`

```python
{
  "_id": ObjectId,
  "email": "admin@banibs.com",
  "password_hash": "bcrypt_hash",
  "role": "admin" | "moderator" | "editor",
  "created_at": datetime,
  "updated_at": datetime
}
```

**Roles:**
- `admin`: Full access (approve, reject, feature, delete)
- `moderator`: Review only (approve, reject)
- `editor`: View only (future use)

### 1.3 Initial Admin User

**Seeded from Environment:**
```env
INITIAL_ADMIN_EMAIL=admin@banibs.com
INITIAL_ADMIN_PASSWORD=BanibsAdmin#2025
```

**Login Credentials (Dev/Local):**
- Email: `admin@banibs.com`
- Password: `BanibsAdmin#2025`

**Production:** Override with secure credentials via environment variables.

---

## 📡 2. Backend Implementation

### 2.1 New Files Created

```
/app/backend/
├── models/
│   └── user.py                 # User model with role
├── services/
│   ├── jwt.py                  # JWT sign/verify/refresh
│   └── uploads.py              # S3 presigned URL generator
├── middleware/
│   └── auth_guard.py           # requireAuth / requireRole
├── routes/
│   └── auth.py                 # Login/refresh/logout
└── scripts/
    └── seed_admin.py           # Initial admin seeding
```

### 2.2 Auth Endpoints

#### POST `/api/auth/login`
**Request:**
```json
{
  "email": "admin@banibs.com",
  "password": "BanibsAdmin#2025"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "user": {
    "email": "admin@banibs.com",
    "role": "admin"
  }
}
```

#### POST `/api/auth/refresh`
**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc..."
}
```

#### POST `/api/auth/logout`
**Request:**
```json
{
  "refresh_token": "eyJhbGc..."
}
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### 2.3 JWT Guards

**Two levels of protection:**

```python
# Level 1: Any authenticated user
@requireAuth
async def protected_route():
    pass

# Level 2: Admin role only
@requireRole("admin")
async def admin_only_route():
    pass
```

**Applied to:**
- `GET /api/opportunities/pending` → `@requireRole("admin")`
- `PATCH /api/opportunities/{id}/approve` → `@requireRole("admin")`
- `PATCH /api/opportunities/{id}/reject` → `@requireRole("admin")`
- `PATCH /api/opportunities/{id}/feature` → `@requireRole("admin")`

### 2.4 Audit Trail

**Collection:** `moderation_logs`

```python
{
  "_id": ObjectId,
  "action": "APPROVE_OPPORTUNITY" | "REJECT_OPPORTUNITY" | "FEATURE_OPPORTUNITY",
  "target_id": "opportunity_id",
  "performed_by": "user_email",
  "admin_id": "user_id",
  "timestamp": datetime,
  "notes": "Optional reason"
}
```

**Logged Actions:**
- Approve opportunity
- Reject opportunity
- Feature opportunity
- Unfeature opportunity

**Backend Only:** No UI in Phase 2.8, query via MongoDB directly.

---

## 📤 3. S3 Upload Enhancement

### 3.1 Environment Variables

```env
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET=banibs-opportunities
AWS_REGION=us-east-1
CLOUDFRONT_URL=https://cdn.banibs.com
```

### 3.2 Upload Flow

**Endpoint:** `POST /api/opportunities/upload-presigned-url`

**Request:**
```json
{
  "filename": "image.jpg",
  "content_type": "image/jpeg"
}
```

**Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/banibs-opportunities/...",
  "finalUrl": "https://cdn.banibs.com/opportunities/abc123.jpg",
  "key": "opportunities/abc123.jpg"
}
```

**Frontend Flow:**
1. User selects image
2. Call `/upload-presigned-url` to get signed URL
3. `PUT` file directly to S3 using presigned URL
4. Store `finalUrl` in form
5. Submit opportunity with `imageUrl=finalUrl`

### 3.3 Local Fallback

**When AWS not configured:**
- Upload endpoint returns stub response
- Images saved to `/app/backend/uploads/` (local dev)
- Served via `/uploads/{filename}` route

---

## 🖥️ 4. Frontend Implementation

### 4.1 Admin Dashboard Structure

```
/app/frontend/
├── pages/
│   └── admin/
│       ├── LoginPage.jsx              # Admin login
│       └── OpportunitiesDashboard.jsx # Moderation interface
├── components/
│   ├── AdminOpportunityCard.jsx       # Card with actions
│   └── AuthProvider.jsx               # JWT context
└── services/
    ├── api.js                         # Axios with interceptors
    └── auth.js                        # Login/logout/refresh
```

### 4.2 Routes

| Route | Component | Protection | Purpose |
|-------|-----------|------------|---------|
| `/admin/login` | LoginPage | Public | Admin login form |
| `/admin/opportunities` | OpportunitiesDashboard | Protected | Moderation interface |

### 4.3 Admin Dashboard Features

**Tabs:**
- **Pending** (default) - Unapproved submissions
- **Approved** - Published opportunities
- **Featured** - Featured opportunities

**Actions per opportunity:**
- ✅ **Approve** - Make publicly visible
- ❌ **Reject** - Keep private
- ⭐ **Feature** - Add to featured section (auto-approves)
- 🗑️ **Delete** - Permanent removal (future)

**Card Display:**
- Title, Organization, Type
- Description (truncated)
- Location, Deadline
- Image thumbnail
- Status badge
- Action buttons

### 4.4 Authentication Context

```jsx
// AuthProvider manages JWT tokens
const AuthContext = {
  user: { email, role },
  accessToken: "...",
  refreshToken: "...",
  login: (email, password) => {},
  logout: () => {},
  refreshAccessToken: () => {}
}
```

**Token Storage:**
- Access token: React state (in-memory)
- Refresh token: httpOnly cookie (preferred) or memory (Phase 2.8)
- Silent refresh: Auto-refresh when access token near expiry

### 4.5 Axios Interceptors

```javascript
// Automatically attach JWT to requests
axios.interceptors.request.use(config => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 and refresh token
axios.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      await refreshAccessToken();
      return axios(error.config);
    }
    return Promise.reject(error);
  }
);
```

---

## 🌐 5. Live API Integration (Public Pages)

### 5.1 Replace Mocked Data

**Page:** `/opportunities`

**Before (mocked):**
```javascript
const opportunities = MOCK_DATA;
```

**After (live API):**
```javascript
const { data } = await axios.get('/api/opportunities');
const opportunities = data;
```

### 5.2 Endpoints Used

| Page | Endpoint | Auth Required |
|------|----------|---------------|
| `/opportunities` | GET `/api/opportunities` | No |
| `/opportunities` (featured) | GET `/api/opportunities/featured` | No |
| `/opportunities` (filter) | GET `/api/opportunities?type=job` | No |
| `/opportunities/submit` | POST `/api/opportunities` | No |

**Security:**
- Public endpoints return only `approved: true` items
- No authentication required for public viewing
- Submissions start as `approved: false`

---

## 🎨 6. Branding Guidelines

### 6.1 BANIBS Theme

**Colors:**
- Background: `#000000` (black)
- Primary: `#FFD700` (gold)
- Borders: `#FFD700` with glow
- Text: `#FFFFFF` (white)
- Accents: `#1a1a1a` (dark grey)

**Components:**
- Rounded corners: `rounded-lg`
- Border: `border-2 border-[#FFD700]`
- Hover glow: `shadow-[0_0_15px_rgba(255,215,0,0.5)]`
- Cards: Dark with gold accent
- Buttons: Gold background with black text

### 6.2 Admin Dashboard Styling

**Match existing Opportunities page:**
- Dark background throughout
- Gold borders on cards
- Hover effects with glow
- Status badges with appropriate colors
- Action buttons styled consistently

**Example Card:**
```jsx
<div className="bg-black border-2 border-[#FFD700] rounded-lg p-6 hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all">
  {/* Card content */}
</div>
```

---

## 🧪 7. Testing Plan

### 7.1 Backend Tests

| Test | Endpoint | Expected |
|------|----------|----------|
| Login with valid creds | POST `/auth/login` | 200 + tokens |
| Login with invalid creds | POST `/auth/login` | 401 Unauthorized |
| Refresh valid token | POST `/auth/refresh` | 200 + new access token |
| Refresh expired token | POST `/auth/refresh` | 401 Unauthorized |
| Access admin route without token | GET `/opportunities/pending` | 401 Unauthorized |
| Access admin route with token | GET `/opportunities/pending` | 200 + data |
| Approve opportunity | PATCH `/opportunities/{id}/approve` | 200 + updated |
| Upload presigned URL (with AWS) | POST `/upload-presigned-url` | 200 + URLs |
| Upload presigned URL (no AWS) | POST `/upload-presigned-url` | 200 + fallback |

### 7.2 Frontend Tests

| Test | Action | Expected |
|------|--------|----------|
| Admin login page loads | Visit `/admin/login` | Form renders |
| Login with valid creds | Submit form | Redirect to dashboard |
| Login with invalid creds | Submit form | Error message shown |
| Dashboard loads | Visit `/admin/opportunities` | Tabs + cards render |
| Approve button works | Click approve | Toast + status update |
| Reject button works | Click reject | Toast + status update |
| Feature button works | Click feature | Toast + status update |
| Public page uses live API | Visit `/opportunities` | Real data loads |
| Featured section uses live API | Check featured block | Real featured items |

### 7.3 Integration Tests

**End-to-End Flow:**
1. Submit opportunity from public form
2. Verify NOT visible on `/opportunities`
3. Login to admin dashboard
4. See opportunity in "Pending" tab
5. Click "Approve"
6. Verify NOW visible on `/opportunities`
7. Click "Feature"
8. Verify in featured section
9. Check `moderation_logs` has entries

---

## 📦 8. Deliverables Checklist

### Backend Files:
- [x] `/app/backend/models/user.py`
- [x] `/app/backend/services/jwt.py`
- [x] `/app/backend/services/uploads.py`
- [x] `/app/backend/middleware/auth_guard.py`
- [x] `/app/backend/routes/auth.py`
- [x] `/app/backend/routes/opportunities.py` (updated)
- [x] `/app/backend/scripts/seed_admin.py`
- [x] `/app/backend/.env` (updated)

### Frontend Files:
- [x] `/app/frontend/pages/admin/LoginPage.jsx`
- [x] `/app/frontend/pages/admin/OpportunitiesDashboard.jsx`
- [x] `/app/frontend/components/AdminOpportunityCard.jsx`
- [x] `/app/frontend/components/AuthProvider.jsx`
- [x] `/app/frontend/services/api.js`
- [x] `/app/frontend/services/auth.js`
- [x] `/app/frontend/pages/opportunities.jsx` (updated - live API)

### Documentation:
- [x] `/app/PHASE_2.8_PLAN.md` (this file)
- [x] `/app/PHASE_2.8_SCREENSHOTS.md`
- [x] Updated API documentation

### Screenshots:
- [x] Admin login screen
- [x] Admin dashboard (pending tab)
- [x] Admin dashboard (approve action)
- [x] Public opportunities page (live data)
- [x] Featured section (live data)

---

## 🔧 9. Environment Variables Reference

### Required (.env in backend):

```env
# MongoDB
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database

# CORS
CORS_ORIGINS=https://banibs.com,https://banibsnews.com,https://banibsbiz.com

# JWT
JWT_ACCESS_SECRET=-rVB6jpavDLRmHKiowS_952v6LD_4dGUtaUWHtmgZL0
JWT_REFRESH_SECRET=hBFiiNyBQ0HxbXVLA5wb8kz1W7ha_R-M-XHCr6OpWYM
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Initial Admin (Dev/Local only - override in production)
INITIAL_ADMIN_EMAIL=admin@banibs.com
INITIAL_ADMIN_PASSWORD=BanibsAdmin#2025

# AWS S3 (Optional - graceful fallback if not provided)
AWS_ACCESS_KEY_ID=AKIAXXXXXXXXXXXXXXXX
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET=banibs-opportunities
AWS_REGION=us-east-1
CLOUDFRONT_URL=https://cdn.banibs.com
```

---

## 🚀 10. Deployment Steps

### 10.1 Backend Setup

```bash
# 1. Update .env with all variables
nano /app/backend/.env

# 2. Install new dependencies
cd /app/backend
pip install pyjwt bcrypt pillow boto3

# 3. Seed initial admin user
python scripts/seed_admin.py

# 4. Restart backend
sudo supervisorctl restart backend
```

### 10.2 Frontend Setup

```bash
# 1. Install new dependencies (if any)
cd /app/frontend
yarn install

# 2. Restart frontend
sudo supervisorctl restart frontend
```

### 10.3 Verification

```bash
# Test login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@banibs.com","password":"BanibsAdmin#2025"}'

# Test admin endpoint with JWT
curl http://localhost:8001/api/opportunities/pending \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📝 11. Usage Guide

### 11.1 Admin Login

1. Navigate to `https://yourdomain.com/admin/login`
2. Enter credentials:
   - Email: `admin@banibs.com`
   - Password: `BanibsAdmin#2025` (or your production password)
3. Click "Login"
4. You'll be redirected to `/admin/opportunities`

### 11.2 Moderating Opportunities

**View Pending:**
1. Click "Pending" tab
2. Review submitted opportunities
3. Click action buttons:
   - "Approve" - Makes visible to public
   - "Reject" - Keeps private
   - "Feature" - Adds to featured section

**View Approved:**
1. Click "Approved" tab
2. See all published opportunities
3. Can "Unfeature" or edit

**View Featured:**
1. Click "Featured" tab
2. See opportunities in featured section (max 5)
3. Can remove from featured

### 11.3 Uploading Images

**From Submission Form:**
1. User selects image file
2. Frontend calls `/upload-presigned-url`
3. Frontend uploads to S3 using presigned URL
4. Frontend stores CloudFront URL
5. Form submission includes `imageUrl`

**Admin Review:**
- Image thumbnail visible in moderation card
- Served via CloudFront for fast loading

---

## 📊 12. Success Metrics

### Phase 2.8 Complete When:
- ✅ Admin can login with JWT
- ✅ Admin dashboard displays pending/approved/featured
- ✅ Approve/reject/feature actions work
- ✅ Moderation logged to `moderation_logs`
- ✅ Public pages use live API (no mocks)
- ✅ S3 uploads work (or graceful fallback)
- ✅ All tests passing
- ✅ Screenshots captured
- ✅ Documentation complete

### Ready for v1.8-stable When:
- ✅ No breaking changes to v1.7
- ✅ All v1.7 features still working
- ✅ New features fully tested
- ✅ BANIBS branding consistent
- ✅ Security audit passed

---

## 🐛 13. Known Issues / Future Work

### Phase 2.8 Limitations:
- Tokens stored in memory (lost on refresh) - acceptable for now
- No password reset flow - manual for now
- No user management UI - seed only
- Audit logs backend-only - no UI
- No image validation - accepts any upload

### Phase 2.9 Enhancements:
- Persistent token storage (httpOnly cookies)
- Password reset via email
- User management dashboard
- Audit log viewer UI
- Image validation (size, format, content)
- Rate limiting on auth endpoints
- Two-factor authentication (2FA)
- Role management UI

---

## ✅ 14. Sign-Off Criteria

**Phase 2.8 is complete when:**
1. All deliverables checked off
2. All tests passing (backend + frontend + integration)
3. Screenshots captured and documented
4. Environment variables documented
5. No regressions in v1.7 features
6. BANIBS branding maintained
7. Security review passed
8. Performance acceptable (< 500ms responses)
9. Error handling comprehensive
10. Documentation complete

**Approved by:** Raymond Neely / BANIBS  
**Tagged as:** v1.8-stable  
**Date:** TBD (after verification)

---

## 📞 15. Support & Troubleshooting

### Common Issues:

**Login fails with 401:**
- Check credentials in .env match
- Verify admin user was seeded
- Check password hash in MongoDB

**JWT expired immediately:**
- Check system time is correct
- Verify JWT_ACCESS_EXPIRES in .env
- Check JWT secrets are set

**S3 upload fails:**
- Verify AWS credentials in .env
- Check bucket exists and permissions
- Confirm CORS policy on S3 bucket

**Dashboard won't load:**
- Check JWT token in browser console
- Verify API endpoint returns 200
- Check CORS headers

**Public page shows no data:**
- Verify opportunities are approved
- Check API returns approved items only
- Verify frontend calling correct endpoint

---

**Phase 2.8 Status:** 🚧 In Progress  
**Last Updated:** October 28, 2025  
**Next Milestone:** Backend implementation complete
