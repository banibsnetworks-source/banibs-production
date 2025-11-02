# BANIBS Platform Expansion Roadmap v1.3.2
**Vision:** Complete Digital Ecosystem for Black & Indigenous Communities

**Status:** ✅ Phase 6.3 Complete | 🔄 Phase 6.0-6.6 Architecture Defined  
**Last Updated:** November 1, 2025

---

## 🎯 Strategic Vision

Transform BANIBS from a news + opportunities platform into a **comprehensive digital infrastructure** that serves Black and Indigenous communities through:
- **Unified Identity** (SSO across all properties: News, Social, Business, TV, Resources)
- **Social Network** (community connection, content sharing, regional boards)
- **Membership Tiers** (affordable $5/$25/Custom monetization model)
- **Business Directory + Marketplace** (economic empowerment through listings & crowdfunding)
- **Education & Language Tools** (cultural preservation, translation, learning)
- **Cross-App Navigation** (seamless experience across entire ecosystem)

**Technical Foundation:** Modular Monolith | MongoDB | Cloudflare R2 | Stripe Connect | DeepL + GPT-5

---

## 🔐 Phase 6.0: Platform-Wide Identity (SSO)

### Goal
One BANIBS account for all properties (News, Social, Business, TV, Resources).

### Core Concept
- **BANIBS Identity Service** handles all authentication
- Users sign in once, access everything
- Secure token-based authentication (JWT/OAuth2)
- Seamless navigation between sub-apps

### Technical Implementation

**Backend Architecture:**
```
/auth                → BANIBS Identity Service
  ├── /register      → User registration
  ├── /login         → Authentication
  ├── /refresh       → Token refresh
  ├── /reset         → Password reset
  └── /verify        → Email/phone verification
```

**Database:**
- Single `users` collection with:
  - `id` (UUID)
  - `email`, `password_hash`
  - `name`, `avatar_url`, `bio`
  - `roles` (array: `user`, `contributor`, `creator`, `admin`)
  - `permissions` (object with scope: `news`, `social`, `tv`, `business`)
  - `membership_level` (`free`, `pro`, `enterprise`)
  - `created_at`, `last_login`

**JWT Token Structure:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "roles": ["user", "contributor"],
  "scopes": ["news", "social", "business"],
  "membership_level": "free",
  "exp": 1234567890
}
```

**Frontend Integration:**
```jsx
// Central AuthProvider wraps all sub-apps
<BanibsAuthProvider>
  <NewsApp />
  <SocialApp />
  <BusinessApp />
  <TVApp />
</BanibsAuthProvider>
```

**Token Storage:**
- `localStorage` for access token
- HttpOnly cookie for refresh token (secure)
- Shared across subdomains (`*.banibs.com`)

**API Interceptor:**
```javascript
// Automatically attach token to all requests
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('banibs_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

**Future Expansion:**
- OAuth2 integration (Google, Apple, LinkedIn)
- Social login (Sign in with BANIBS)
- Multi-factor authentication (2FA)

---

## 💬 Phase 6.1: BANIBS Social MVP

### Goal
Private, community-driven social network with multimedia exchange.

### Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **Profiles** | Avatar, banner, bio, links, location | High |
| **Posts** | Text, images, short video/audio clips | High |
| **File Attachments** | Upload docs, images (size limits, virus scan) | High |
| **Messaging** | Private 1-on-1 and small group chats | High |
| **Comments & Reactions** | Likes, replies, emoji support | Medium |
| **Feed** | Posts from followed users or categories | High |
| **Moderation** | Admin flagging, abuse reports | High |
| **Verified Badge** | Community leaders, businesses | Low |

### Technical Implementation

**Storage:**
- **AWS S3** or **Cloudflare R2** for file/image uploads
- CDN for fast media delivery
- Image optimization (compression, resizing)

**Backend Endpoints:**
```
/api/social/posts              → CRUD for posts
/api/social/posts/:id/like     → Like a post
/api/social/posts/:id/comment  → Comment on post
/api/social/messages           → Direct messaging
/api/social/files              → File upload/download
/api/social/profiles/:id       → User profiles
/api/social/feed               → Personalized feed
/api/social/follow             → Follow/unfollow users
```

**Realtime Features:**
- **WebSockets** or **Socket.io** for:
  - Live chat
  - Typing indicators
  - Real-time notifications
  - Audio/video rooms (Phase 6.3)

**Security Measures:**
1. **File Validation:**
   - Type checking (images, videos, documents only)
   - Size limits (10MB free, 100MB pro, 1GB enterprise)
   - Malware/virus scanning (ClamAV or cloud service)

2. **Rate Limiting:**
   - Post creation: 20/hour for free, unlimited for pro
   - File uploads: 100MB/day free, 1GB/day pro
   - Messages: 100/day free, unlimited pro

3. **Content Moderation:**
   - AI-powered content filtering
   - User report system
   - Admin review queue
   - Auto-ban for repeated violations

**Data Models:**

```python
# Post Model
class SocialPost(BaseModel):
    id: str
    user_id: str
    content: str
    media_urls: List[str]
    visibility: str  # public, followers, private
    like_count: int
    comment_count: int
    created_at: datetime

# Message Model
class DirectMessage(BaseModel):
    id: str
    sender_id: str
    recipient_id: str
    content: str
    attachments: List[str]
    read: bool
    created_at: datetime
```

---

## 💎 Phase 6.2: Membership Tiers

### Goal
Monetize premium features while keeping core access free.

### Tier Structure

| Tier | Price | Access | Use Case |
|------|-------|--------|----------|
| **Free** | $0/month | • Read news<br>• Create profile<br>• Post text/photos<br>• Basic messaging<br>• Comment & like | General community members |
| **Creator / Pro** | $9.99/month | • Everything in Free<br>• Upload long videos/audio<br>• Advanced analytics<br>• Business listing<br>• Priority support | Content creators, entrepreneurs |
| **Enterprise** | Custom pricing | • Everything in Pro<br>• Team accounts (5-50 users)<br>• Ad placements<br>• Sponsor tools<br>• White-label options | Organizations, brands |

### Feature Gating

**Database Field:**
```python
class User(BaseModel):
    membership_level: str  # "free", "pro", "enterprise"
    subscription_status: str  # "active", "cancelled", "past_due"
    subscription_id: str  # Stripe subscription ID
    subscription_expires_at: datetime
```

**Middleware Check:**
```python
def require_membership(level: str):
    def decorator(func):
        async def wrapper(user: User, *args, **kwargs):
            if user.membership_level not in TIER_HIERARCHY[level]:
                raise HTTPException(403, "Upgrade required")
            return await func(user, *args, **kwargs)
        return wrapper
    return decorator

@router.post("/social/posts/video")
@require_membership("pro")
async def upload_video(user: User, file: UploadFile):
    # Only pro/enterprise can upload videos
    pass
```

### Stripe Integration

**Subscription Flow:**
1. User clicks "Upgrade to Pro"
2. Frontend calls `POST /api/membership/checkout`
3. Backend creates Stripe Checkout session
4. User completes payment on Stripe
5. Webhook updates `users.membership_level`
6. User immediately gains pro access

**Existing Infrastructure:**
- ✅ Stripe already integrated (Phase 5.1)
- ✅ Webhook handler already built
- ✅ Payment processing proven

**New Endpoints:**
```
POST /api/membership/checkout      → Create subscription
POST /api/membership/cancel        → Cancel subscription
POST /api/membership/upgrade       → Change tier
GET  /api/membership/status        → Current membership info
```

---

## 🔄 Phase 6.3: Audio/Video Chat (Future)

### Goal
Real-time communication for community building.

### Features
- **Audio Rooms** (like Twitter Spaces)
- **Video Calls** (1-on-1 and group)
- **Screen Sharing** (pro/enterprise only)
- **Recording** (save sessions for later)

### Technical Stack
- **WebRTC** for peer-to-peer connections
- **Twilio** or **Agora** for infrastructure
- **Turn/STUN servers** for NAT traversal

### Use Cases
- Community town halls
- Business networking
- Creator Q&A sessions
- Educational workshops

---

## 🔗 Phase 6.4: Cross-App Navigation

### Goal
Seamless movement between BANIBS properties.

### Implementation
- **Global Navigation Bar** (shared across all apps)
- **Deep Linking** (news article → social discussion)
- **Unified Search** (search across News, Social, Business, Resources)
- **Activity Feed** (notifications from all properties in one place)

### User Experience
```
User reads news article about Black-owned coffee shop
  ↓
Clicks "View on BANIBS Business"
  ↓
Lands on business profile page (no re-login)
  ↓
Joins live audio room hosted by owner
  ↓
Posts about experience to BANIBS Social
  ↓
All in one session, one identity
```

---

## 🏗️ Architecture Overview

### Microservices Structure

```
banibs-platform/
├── auth-service/              → Identity & SSO
│   ├── /register
│   ├── /login
│   ├── /refresh
│   └── /verify
├── news-service/              → News & opportunities (current)
│   ├── /opportunities
│   ├── /news
│   └── /newsletter
├── social-service/            → Social network (Phase 6.1)
│   ├── /posts
│   ├── /messages
│   ├── /profiles
│   └── /feed
├── business-service/          → Business directory (future)
│   ├── /listings
│   ├── /reviews
│   └── /bookings
├── tv-service/                → Video platform (future)
│   ├── /videos
│   ├── /channels
│   └── /live
├── resources-service/         → Content library (future)
│   ├── /guides
│   ├── /courses
│   └── /templates
└── shared/                    → Common utilities
    ├── components/
    ├── AuthProvider/
    ├── design-tokens/
    └── api-client/
```

### Database Strategy

**Option 1: Single MongoDB Instance (MVP)**
```
banibs_db
├── users                 → Shared across all services
├── news_items
├── opportunities
├── social_posts
├── social_messages
├── business_listings
└── resources
```

**Option 2: Separate Databases per Service (Scale)**
```
auth_db       → users, sessions, tokens
news_db       → news_items, opportunities, newsletter_sends
social_db     → posts, messages, follows, reactions
business_db   → listings, reviews, bookings
tv_db         → videos, channels, subscriptions
resources_db  → guides, courses, templates
```

### API Gateway (Optional, for Scale)

```
All requests → API Gateway (Kong/Nginx)
                    ↓
        Routes to appropriate service
                    ↓
    /api/auth/*      → auth-service
    /api/news/*      → news-service
    /api/social/*    → social-service
    /api/business/*  → business-service
    /api/tv/*        → tv-service
```

**Benefits:**
- Load balancing
- Rate limiting
- Authentication at gateway level
- Request logging
- API versioning

---

## 📊 Implementation Priorities

### Phase 6.0 (Identity Core) — **CRITICAL FOUNDATION**
**Estimated Timeline:** 2-3 weeks

Must-Have:
- [ ] Unified user database
- [ ] JWT authentication service
- [ ] Token refresh mechanism
- [ ] Frontend AuthProvider
- [ ] Migrate existing users (contributors + admins)

### Phase 6.1 (Social MVP) — **HIGH VALUE**
**Estimated Timeline:** 4-6 weeks

Must-Have:
- [ ] User profiles
- [ ] Text posts
- [ ] Image uploads (S3/R2)
- [ ] Basic messaging
- [ ] Feed algorithm (chronological to start)
- [ ] Moderation tools

Nice-to-Have:
- [ ] Video posts
- [ ] Audio posts
- [ ] Group chats
- [ ] Advanced feed (algorithmic)

### Phase 6.2 (Membership) — **MONETIZATION**
**Estimated Timeline:** 2-3 weeks

Must-Have:
- [ ] Three-tier system (Free, Pro, Enterprise)
- [ ] Stripe subscription integration
- [ ] Feature gating middleware
- [ ] Upgrade/downgrade flows

### Phase 6.3 (Audio/Video) — **ENGAGEMENT BOOST**
**Estimated Timeline:** 4-6 weeks

Must-Have:
- [ ] Audio rooms (WebRTC)
- [ ] 1-on-1 video calls

Nice-to-Have:
- [ ] Group video calls
- [ ] Screen sharing
- [ ] Recording

### Phase 6.4 (Cross-App Nav) — **POLISH**
**Estimated Timeline:** 2-3 weeks

Must-Have:
- [ ] Global navigation bar
- [ ] Deep linking
- [ ] Unified search

---

## 🎨 Design System Extension

All new features will use **BANIBS Design System v1**:
- Glass cards for profiles, posts, messages
- Gold accents for verified badges, premium features
- Dark bands for CTAs (upgrade prompts)
- Consistent spacing and typography

### Social-Specific Additions

**Profile Card:**
```jsx
<div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 shadow-sm">
  {/* Avatar, name, bio, stats */}
</div>
```

**Post Card:**
```jsx
<article className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
  {/* User, content, media, reactions */}
</article>
```

**Message Thread:**
```jsx
<div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-4 shadow-sm">
  {/* Message bubbles, send input */}
</div>
```

---

## 🚀 Success Metrics

### Phase 6.0 (Identity)
- [ ] 100% user migration (no data loss)
- [ ] SSO working across News + Social
- [ ] < 200ms authentication response time

### Phase 6.1 (Social)
- [ ] 1,000 social profiles created (first month)
- [ ] 10,000 posts created (first month)
- [ ] 50% DAU/MAU ratio (daily/monthly active users)

### Phase 6.2 (Membership)
- [ ] 5% conversion to Pro (free → paid)
- [ ] $10K MRR (monthly recurring revenue)
- [ ] < 5% churn rate

---

## 🔒 Security Considerations

### Identity Service
- ✅ Password hashing (bcrypt)
- ✅ JWT with expiration
- ✅ Refresh token rotation
- ✅ Email verification
- ⚠️ 2FA (future)
- ⚠️ Account recovery (future)

### Social Service
- ✅ File size limits
- ✅ File type validation
- ✅ Virus scanning
- ✅ Rate limiting
- ✅ Content moderation
- ⚠️ End-to-end encryption for DMs (future)

### Payment Processing
- ✅ Stripe handles PCI compliance
- ✅ Webhook signature verification
- ✅ Subscription state management

---

## 📝 Next Steps

### Immediate (This Week)
1. Review and approve this roadmap
2. Prioritize Phase 6.0 vs. Phase 6.1
3. Decide: start with Identity Core or Social MVP?

### Short-Term (This Month)
1. Design detailed specs for chosen phase
2. Create database migration plan
3. Set up development environment for new services

### Medium-Term (This Quarter)
1. Build and test Phase 6.0 + 6.1
2. Soft launch BANIBS Social (invite-only)
3. Collect user feedback and iterate

---

**Last Updated:** October 28, 2025  
**Status:** Strategic Vision (Not Yet Implemented)  
**Owner:** BANIBS Development Team
