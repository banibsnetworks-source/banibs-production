---
Phase: 6 (v1.3.2)
Module: BANIBS Ecosystem Expansion
Version: 1.3.2
Date: 2025-11-01
Maintainer: BANIBS Core Team
Status: 🔄 Architecture Phase
---

# BANIBS Phase 6 Architecture v1.3.2
**Complete Digital Ecosystem for Black & Indigenous Communities**

---

## Executive Summary

Phase 6 transforms BANIBS from a news + opportunities platform into a **complete digital infrastructure** serving Black and Indigenous communities through:

- **Unified Identity** (SSO across all properties)
- **Social Network** (community connection and content sharing)
- **Membership Tiers** (monetization through tiered access)
- **Business Directory + Marketplace** (economic empowerment)
- **Education & Language Tools** (cultural preservation and learning)
- **Cross-App Navigation** (seamless user experience)

**Architecture Pattern:** Modular Monolith
**Primary Database:** MongoDB (single instance, multiple collections)
**File Storage:** Cloudflare R2
**Payments:** Stripe Connect (marketplace model)
**Translation:** DeepL (primary) + GPT-5 (fallback)

---

## Implementation Sequence

### **Phase 6.0 - Unified Identity & SSO** (Foundation)
**Timeline:** 2-3 weeks
**Status:** 🔴 Not Started

One BANIBS account for all properties (News, Social, Business, TV, Resources).

**Core Components:**
- BANIBS Identity Service (centralized authentication)
- JWT token-based authentication with refresh mechanism
- Secure token sharing across subdomains (`*.banibs.com`)
- User profile service (unified user data)
- Email verification and password reset flows

**Database Collections:**
```
banibs_users
  ├── id (UUID)
  ├── email (unique, indexed)
  ├── password_hash (bcrypt)
  ├── name
  ├── avatar_url
  ├── bio
  ├── roles (array: ['user', 'contributor', 'creator', 'admin'])
  ├── membership_level ('free', 'basic', 'pro', 'enterprise')
  ├── membership_status ('active', 'cancelled', 'past_due')
  ├── subscription_id (Stripe subscription ID)
  ├── subscription_expires_at
  ├── email_verified (boolean)
  ├── created_at
  ├── last_login
  └── metadata (object: preferences, settings)
```

**API Endpoints:**
```
POST /api/auth/register           → Create new account
POST /api/auth/login              → Authenticate user
POST /api/auth/refresh            → Refresh access token
POST /api/auth/logout             → Invalidate tokens
POST /api/auth/forgot-password    → Request password reset
POST /api/auth/reset-password     → Complete password reset
POST /api/auth/verify-email       → Verify email address
GET  /api/auth/me                 → Get current user profile
PATCH /api/auth/profile           → Update user profile
```

**JWT Token Structure:**
```json
{
  "user_id": "uuid",
  "email": "user@example.com",
  "roles": ["user", "contributor"],
  "membership_level": "free",
  "scopes": ["news", "social", "business"],
  "exp": 1234567890,
  "iat": 1234567800
}
```

**Token Storage Strategy:**
- Access token: `localStorage` (short-lived, 15 min)
- Refresh token: HttpOnly cookie (long-lived, 7 days)
- Shared across subdomains via `.banibs.com` domain cookie

**Migration Strategy:**
1. Create unified `banibs_users` collection
2. Migrate existing users from `users` collection
3. Migrate contributors from `contributors` collection
4. Merge admin users (preserve roles)
5. Generate JWT for all existing sessions

---

### **Phase 6.2 - Membership Tiers** (Monetization)
**Timeline:** 2-3 weeks
**Status:** 🔴 Not Started
**Prerequisite:** Phase 6.0 (SSO)

Monetize premium features while keeping core access free.

**Tier Structure:**

| Tier | Price | Features | Target Audience |
|------|-------|----------|----------------|
| **Free** | $0/month | • Read news<br>• Basic profile<br>• Comment & like<br>• Message (limited) | General users |
| **Basic** | $5/month | • Everything in Free<br>• Unlimited messaging<br>• Business listing (basic)<br>• Upload photos/docs | Content consumers |
| **Pro** | $25/month | • Everything in Basic<br>• Video uploads<br>• Analytics dashboard<br>• Featured business listing<br>• Priority support<br>• Marketplace seller | Creators, entrepreneurs |
| **Enterprise** | Custom | • Everything in Pro<br>• Team accounts (5-50)<br>• Ad placements<br>• White-label options<br>• Dedicated support | Organizations, brands |

**Database Schema:**
```
subscriptions
  ├── id (UUID)
  ├── user_id (ref: banibs_users)
  ├── tier ('free', 'basic', 'pro', 'enterprise')
  ├── status ('active', 'cancelled', 'past_due', 'trialing')
  ├── stripe_subscription_id
  ├── stripe_customer_id
  ├── current_period_start
  ├── current_period_end
  ├── cancel_at_period_end (boolean)
  ├── created_at
  └── updated_at
```

**API Endpoints:**
```
GET  /api/membership/plans                 → List all tiers
POST /api/membership/checkout              → Create subscription
POST /api/membership/cancel                → Cancel subscription
POST /api/membership/upgrade               → Change tier
POST /api/membership/downgrade             → Downgrade tier
GET  /api/membership/status                → Current membership info
GET  /api/membership/invoices              → Billing history
POST /api/membership/webhook               → Stripe webhook handler
```

**Feature Gating Middleware:**
```python
def require_membership(min_tier: str):
    async def decorator(user: User):
        tier_hierarchy = {
            'free': 0,
            'basic': 1,
            'pro': 2,
            'enterprise': 3
        }
        if tier_hierarchy[user.membership_level] < tier_hierarchy[min_tier]:
            raise HTTPException(403, "Upgrade required")
        return user
    return decorator
```

**Stripe Integration:**
- Use existing Stripe SDK (Phase 5.1)
- Create subscription products in Stripe Dashboard
- Webhook handler for subscription events
- Automatic tier updates on payment success/failure

---

### **Phase 6.1 - Social Media MVP** (Community Layer)
**Timeline:** 6-8 weeks
**Status:** 🔴 Not Started
**Prerequisite:** Phase 6.0 (SSO) + 6.2 (Membership)

Private, community-driven social network with multimedia exchange.

**Core Features:**

| Feature | Free | Basic | Pro | Enterprise |
|---------|------|-------|-----|------------|
| **Profile** | ✅ | ✅ | ✅ | ✅ |
| **Text Posts** | ✅ | ✅ | ✅ | ✅ |
| **Image Uploads** | 5 MB | 10 MB | 50 MB | 100 MB |
| **Video Posts** | ❌ | ❌ | ✅ | ✅ |
| **Direct Messages** | 10/day | Unlimited | Unlimited | Unlimited |
| **Community Boards** | View only | Post | Post + Moderate | Create boards |
| **Comments** | ✅ | ✅ | ✅ | ✅ |
| **Reactions** | ✅ | ✅ | ✅ | ✅ |

**Database Collections:**
```
social_profiles
  ├── id (UUID)
  ├── user_id (ref: banibs_users)
  ├── display_name
  ├── bio
  ├── avatar_url (Cloudflare R2)
  ├── banner_url (Cloudflare R2)
  ├── location
  ├── website
  ├── social_links (object: twitter, linkedin, instagram)
  ├── verified (boolean)
  ├── follower_count
  ├── following_count
  ├── post_count
  ├── created_at
  └── updated_at

social_posts
  ├── id (UUID)
  ├── user_id (ref: banibs_users)
  ├── profile_id (ref: social_profiles)
  ├── content (text, max 5000 chars)
  ├── media_urls (array of Cloudflare R2 URLs)
  ├── media_types (array: 'image', 'video', 'document')
  ├── board_id (ref: social_boards, optional)
  ├── visibility ('public', 'followers', 'private')
  ├── like_count
  ├── comment_count
  ├── share_count
  ├── created_at
  ├── updated_at
  └── deleted_at (soft delete)

social_comments
  ├── id (UUID)
  ├── post_id (ref: social_posts)
  ├── user_id (ref: banibs_users)
  ├── content (text, max 1000 chars)
  ├── parent_comment_id (for nested replies)
  ├── like_count
  ├── created_at
  └── updated_at

social_reactions
  ├── id (UUID)
  ├── user_id (ref: banibs_users)
  ├── target_id (post_id or comment_id)
  ├── target_type ('post', 'comment')
  ├── reaction_type ('like', 'love', 'celebrate', 'support')
  └── created_at

social_follows
  ├── id (UUID)
  ├── follower_id (ref: banibs_users)
  ├── following_id (ref: banibs_users)
  ├── created_at

social_messages
  ├── id (UUID)
  ├── sender_id (ref: banibs_users)
  ├── recipient_id (ref: banibs_users)
  ├── content (text, max 2000 chars)
  ├── attachments (array of Cloudflare R2 URLs)
  ├── read (boolean)
  ├── read_at
  ├── created_at
  └── conversation_id (group messages by thread)

social_boards
  ├── id (UUID)
  ├── name (e.g., "Global News", "Africa", "Business")
  ├── slug (URL-friendly)
  ├── description
  ├── region ('Global', 'Africa', 'Americas', 'Europe', 'Asia', 'Middle East')
  ├── category ('News', 'Business', 'Education', 'Culture', 'Religion')
  ├── moderator_ids (array of user_ids)
  ├── post_count
  ├── member_count
  ├── rules (text)
  ├── created_at
  └── updated_at
```

**API Endpoints:**
```
# Profiles
GET    /api/social/profile/:id              → Get user profile
PATCH  /api/social/profile                   → Update own profile
POST   /api/social/profile/avatar            → Upload avatar
POST   /api/social/profile/banner            → Upload banner

# Posts
GET    /api/social/feed                     → Personalized feed
GET    /api/social/posts/:id                 → Get single post
POST   /api/social/posts                     → Create post
PATCH  /api/social/posts/:id                 → Edit post
DELETE /api/social/posts/:id                 → Delete post
POST   /api/social/posts/:id/like            → Like post
DELETE /api/social/posts/:id/like            → Unlike post

# Comments
GET    /api/social/posts/:id/comments       → Get post comments
POST   /api/social/posts/:id/comments        → Add comment
PATCH  /api/social/comments/:id              → Edit comment
DELETE /api/social/comments/:id              → Delete comment

# Messages
GET    /api/social/messages                 → Get all conversations
GET    /api/social/messages/:userId          → Get conversation with user
POST   /api/social/messages                  → Send message
PATCH  /api/social/messages/:id/read         → Mark as read

# Boards (Community Forums)
GET    /api/social/boards                    → List all boards
GET    /api/social/boards/:slug              → Get board details
GET    /api/social/boards/:slug/posts        → Get board posts
POST   /api/social/boards/:slug/join         → Join board
POST   /api/social/boards/:slug/posts        → Create post in board

# Follow System
POST   /api/social/follow/:userId            → Follow user
DELETE /api/social/follow/:userId            → Unfollow user
GET    /api/social/followers/:userId         → Get user's followers
GET    /api/social/following/:userId         → Get users being followed
```

**File Upload Strategy (Cloudflare R2):**
```python
import boto3
from botocore.config import Config

# R2 configuration (S3-compatible)
r2_client = boto3.client(
    's3',
    endpoint_url=os.environ['R2_ENDPOINT'],
    aws_access_key_id=os.environ['R2_ACCESS_KEY'],
    aws_secret_access_key=os.environ['R2_SECRET_KEY'],
    config=Config(signature_version='s3v4')
)

# Upload file
def upload_to_r2(file, bucket, key):
    r2_client.upload_fileobj(file, bucket, key)
    return f"https://cdn.banibs.com/{key}"
```

**Security Measures:**
1. File validation (type, size, malware scan)
2. Rate limiting per tier
3. Content moderation queue
4. Spam detection
5. User reporting system

---

### **Phase 6.4 - Marketplace & Crowdfunding** (Economic Layer)
**Timeline:** 6-8 weeks
**Status:** 🔴 Not Started
**Prerequisite:** Phase 6.0 (SSO) + 6.2 (Membership)

Listing-style marketplace where businesses post services and creators raise community funding.

**Marketplace Model:** Airbnb-style (list → browse → request quote → transact)

**Database Collections:**
```
marketplace_listings
  ├── id (UUID)
  ├── seller_id (ref: banibs_users)
  ├── business_id (ref: business_directory, optional)
  ├── title
  ├── description
  ├── category ('Services', 'Products', 'Consulting', 'Events')
  ├── subcategory
  ├── price_type ('fixed', 'negotiable', 'quote_required')
  ├── price_amount (if fixed)
  ├── currency ('USD')
  ├── images (array of Cloudflare R2 URLs)
  ├── location (city, state, country)
  ├── delivery_method ('in_person', 'virtual', 'shipping')
  ├── tags (array)
  ├── verified_business (boolean)
  ├── status ('active', 'paused', 'sold', 'expired')
  ├── view_count
  ├── inquiry_count
  ├── created_at
  ├── updated_at
  └── expires_at

marketplace_inquiries
  ├── id (UUID)
  ├── listing_id (ref: marketplace_listings)
  ├── buyer_id (ref: banibs_users)
  ├── message
  ├── status ('pending', 'responded', 'declined', 'converted')
  ├── created_at
  └── updated_at

crowdfunding_campaigns
  ├── id (UUID)
  ├── creator_id (ref: banibs_users)
  ├── title
  ├── description
  ├── story (long-form text)
  ├── category ('Business', 'Education', 'Community', 'Arts', 'Technology')
  ├── goal_amount
  ├── current_amount
  ├── currency ('USD')
  ├── backer_count
  ├── images (array of Cloudflare R2 URLs)
  ├── video_url (Cloudflare R2 or YouTube)
  ├── rewards (array of reward tiers)
  ├── status ('draft', 'active', 'funded', 'expired', 'cancelled')
  ├── start_date
  ├── end_date
  ├── created_at
  └── updated_at

crowdfunding_contributions
  ├── id (UUID)
  ├── campaign_id (ref: crowdfunding_campaigns)
  ├── backer_id (ref: banibs_users)
  ├── amount
  ├── reward_tier_id
  ├── anonymous (boolean)
  ├── message
  ├── payment_intent_id (Stripe)
  ├── payment_status ('pending', 'succeeded', 'failed', 'refunded')
  ├── created_at
  └── updated_at
```

**API Endpoints:**
```
# Marketplace Listings
GET    /api/marketplace/listings             → Browse all listings
GET    /api/marketplace/listings/:id         → Get listing details
POST   /api/marketplace/listings             → Create listing (Pro+ only)
PATCH  /api/marketplace/listings/:id         → Update listing
DELETE /api/marketplace/listings/:id         → Delete listing
POST   /api/marketplace/listings/:id/inquiry → Send inquiry to seller
GET    /api/marketplace/my-listings          → Seller's listings
GET    /api/marketplace/my-inquiries         → Seller's inquiries

# Crowdfunding Campaigns
GET    /api/crowdfunding/campaigns           → Browse campaigns
GET    /api/crowdfunding/campaigns/:id       → Get campaign details
POST   /api/crowdfunding/campaigns           → Create campaign (Pro+ only)
PATCH  /api/crowdfunding/campaigns/:id       → Update campaign
DELETE /api/crowdfunding/campaigns/:id       → Cancel campaign
POST   /api/crowdfunding/campaigns/:id/back  → Back a campaign
GET    /api/crowdfunding/my-campaigns        → Creator's campaigns
GET    /api/crowdfunding/my-contributions    → Backer's contributions
```

**Stripe Connect Integration:**
```python
# Create connected account for sellers
stripe.Account.create(
    type="express",
    country="US",
    email=user.email,
    capabilities={
        "card_payments": {"requested": True},
        "transfers": {"requested": True},
    },
)

# Create payment intent with application fee
stripe.PaymentIntent.create(
    amount=listing_price * 100,  # cents
    currency="usd",
    application_fee_amount=int(listing_price * 100 * 0.10),  # 10% platform fee
    transfer_data={
        "destination": seller_stripe_account_id,
    },
)
```

**Revenue Model:**
- 10% platform fee on marketplace transactions
- 5% + $0.30 per crowdfunding contribution
- Featured listing placements ($50/month)

---

### **Phase 6.5 - Education & Language Tools** (Cultural Layer)
**Timeline:** 4-6 weeks
**Status:** 🔴 Not Started
**Prerequisite:** Phase 6.0 (SSO)

Quick-learning tools for language, cultural phrases, and regional customs.

**Core Features:**
1. **Translation Service** (DeepL primary, GPT-5 fallback)
2. **Language Learning Modules** (phrases, pronunciation guides)
3. **Cultural Etiquette Database** (regional customs, greetings, business etiquette)
4. **Religion & Spirituality Resources** (educational, non-proselytizing)

**Database Collections:**
```
translations_cache
  ├── id (UUID)
  ├── source_text (indexed)
  ├── source_lang ('en', 'es', 'fr', 'sw', etc.)
  ├── target_lang
  ├── translated_text
  ├── provider ('deepl', 'gpt5')
  ├── usage_count
  ├── created_at
  └── updated_at

language_modules
  ├── id (UUID)
  ├── language ('Swahili', 'Spanish', 'French', 'Yoruba', etc.)
  ├── category ('Greetings', 'Business', 'Travel', 'Family')
  ├── phrases (array of { phrase, translation, pronunciation, context })
  ├── difficulty ('beginner', 'intermediate', 'advanced')
  ├── created_at
  └── updated_at

cultural_guides
  ├── id (UUID)
  ├── region ('West Africa', 'Caribbean', 'Southern US', etc.)
  ├── country (optional)
  ├── topic ('Greetings', 'Business Etiquette', 'Dining', 'Dress Code')
  ├── content (markdown)
  ├── do_dont_list (array of { do: 'text', dont: 'text' })
  ├── images (Cloudflare R2)
  ├── created_at
  └── updated_at

religion_resources
  ├── id (UUID)
  ├── tradition ('Christianity', 'Islam', 'Judaism', 'Indigenous Spirituality')
  ├── topic ('History', 'Practices', 'Holidays', 'Texts')
  ├── content (markdown, educational tone)
  ├── resources (array of external links)
  ├── created_at
  └── updated_at
```

**API Endpoints:**
```
# Translation
POST   /api/translate                        → Translate text
GET    /api/translate/languages              → Supported languages
GET    /api/translate/history                → User's translation history

# Language Learning
GET    /api/education/languages              → Available language modules
GET    /api/education/languages/:lang        → Get language module
GET    /api/education/phrases                → Get phrases by category
POST   /api/education/progress               → Track learning progress

# Cultural Guides
GET    /api/education/cultures               → Browse cultural guides
GET    /api/education/cultures/:region       → Get regional guide
GET    /api/education/etiquette/:topic       → Get etiquette guide

# Religion & Spirituality
GET    /api/education/religion               → Browse religion resources
GET    /api/education/religion/:tradition    → Get tradition resources
```

**Translation Service Implementation:**
```python
import deepl
from emergentintegrations.llm.chat import LlmChat, UserMessage

async def translate_text(source_text: str, target_lang: str) -> str:
    # Try DeepL first
    try:
        translator = deepl.Translator(os.environ['DEEPL_API_KEY'])
        result = translator.translate_text(source_text, target_lang=target_lang.upper())
        return result.text
    except Exception as e:
        print(f"DeepL failed: {e}, falling back to GPT-5")
    
    # Fallback to GPT-5
    chat = LlmChat(
        api_key=os.environ['EMERGENT_LLM_KEY'],
        session_id="translation",
        system_message="You are a professional translator. Translate accurately while preserving cultural context."
    )
    chat.with_model("openai", "gpt-5")
    
    prompt = f"Translate this to {target_lang}: {source_text}"
    response = await chat.send_message(UserMessage(text=prompt))
    return response
```

---

### **Phase 6.6 - Cross-App Navigation** (Unification)
**Timeline:** 2-3 weeks
**Status:** 🔴 Not Started
**Prerequisite:** All previous phases

Seamless movement between BANIBS properties with unified navigation.

**Components:**
1. **Global Navigation Bar** (shared React component)
2. **Deep Linking** (cross-property URLs)
3. **Unified Search** (search across News, Social, Business, Resources)
4. **Activity Feed** (notifications from all properties)
5. **API Gateway** (optional, for future scale)

**Global Navigation Structure:**
```jsx
<GlobalNav>
  <Logo /> {/* BANIBS */}
  
  <NavLinks>
    <NavLink href="/" label="News" />
    <NavLink href="/social/feed" label="Social" />
    <NavLink href="/business" label="Business" />
    <NavLink href="/marketplace" label="Marketplace" />
    <NavLink href="/education" label="Education" />
    <NavLink href="/opportunities" label="Opportunities" />
  </NavLinks>
  
  <Search />
  <Notifications />
  <UserMenu />
</GlobalNav>
```

**Deep Linking Examples:**
```
banibs.com/news/article/123              → News article
banibs.com/social/post/456               → Social post
banibs.com/business/listing/789          → Business profile
banibs.com/marketplace/item/012          → Marketplace listing
banibs.com/education/culture/west-africa → Cultural guide
```

**Unified Search API:**
```
GET /api/search?q={query}&filter={type}

Types:
- news
- social_posts
- users
- businesses
- marketplace_listings
- crowdfunding_campaigns
- education_resources
```

**Activity Feed (Notifications):**
```
notifications
  ├── id (UUID)
  ├── user_id (ref: banibs_users)
  ├── type ('like', 'comment', 'follow', 'message', 'inquiry', 'contribution')
  ├── actor_id (user who triggered notification)
  ├── target_id (post_id, listing_id, etc.)
  ├── target_type ('post', 'comment', 'listing', 'campaign')
  ├── message (e.g., "John liked your post")
  ├── link (URL to navigate to)
  ├── read (boolean)
  ├── created_at
```

---

## Technical Stack Summary

### **Backend**
- **Framework:** FastAPI (Python 3.11+)
- **Database:** MongoDB (Motor async driver)
- **Authentication:** JWT (access + refresh tokens)
- **File Storage:** Cloudflare R2 (S3-compatible)
- **Payments:** Stripe Connect + Webhooks
- **Translation:** DeepL API + GPT-5 fallback
- **Email:** Existing email service (Phase 4.2)
- **Scheduler:** APScheduler (existing)

### **Frontend**
- **Framework:** React 18+
- **Styling:** Tailwind CSS (BANIBS Design System v1)
- **State:** React Context + localStorage
- **Routing:** React Router
- **HTTP:** Axios with interceptors
- **Real-time:** Future WebSocket integration

### **Infrastructure**
- **Architecture:** Modular Monolith (single codebase, organized by domain)
- **Deployment:** Kubernetes (existing)
- **CDN:** Cloudflare (R2 + CDN)
- **Monitoring:** Backend logs + health checks

---

## Security & Privacy

### **Authentication**
- ✅ Password hashing (bcrypt, existing)
- ✅ JWT with expiration
- ✅ Refresh token rotation
- ✅ Email verification
- 🔜 2FA (optional, Phase 7)

### **File Uploads**
- ✅ File type validation
- ✅ File size limits (tier-based)
- 🔜 Malware scanning (ClamAV or cloud service)
- ✅ CDN delivery (Cloudflare)

### **Payments**
- ✅ Stripe PCI compliance
- ✅ Webhook signature verification
- ✅ Secure payment processing

### **Content Moderation**
- 🔜 User reporting system
- 🔜 Admin moderation queue
- 🔜 AI-powered content filtering
- ✅ Rate limiting (existing)

### **Privacy**
- Aggregate-only analytics (existing)
- No user tracking beyond authentication
- GDPR-compliant data export (future)
- User data deletion requests (future)

---

## Scalability Considerations

### **Current State: Modular Monolith**
Good for: MVP → 10K users → 100K users

**When to Consider Microservices:**
- 500K+ users
- Independent scaling needs per service
- Multiple development teams
- High availability requirements

**Migration Path:**
```
Monolith → Modular Monolith → Domain-Separated Monolith → Microservices
```

### **Database Scaling:**
- Start: Single MongoDB instance
- Scale: Read replicas for analytics
- Future: Sharding by user_id or region

### **File Storage Scaling:**
- Cloudflare R2: Unlimited storage, low egress costs
- CDN: Global edge caching
- Image optimization: On-upload processing

---

## Success Metrics

### **Phase 6.0 (Identity)**
- [ ] 100% user migration (no data loss)
- [ ] SSO working across all properties
- [ ] < 200ms authentication response time

### **Phase 6.2 (Membership)**
- [ ] 5% conversion to paid tiers (free → basic/pro)
- [ ] $10K MRR within 3 months
- [ ] < 5% monthly churn rate

### **Phase 6.1 (Social)**
- [ ] 1,000 profiles created (first month)
- [ ] 10,000 posts created (first month)
- [ ] 50% DAU/MAU ratio

### **Phase 6.4 (Marketplace)**
- [ ] 100 active listings (first month)
- [ ] 10 successful transactions (first month)
- [ ] $1K GMV (gross merchandise value)

### **Phase 6.5 (Education)**
- [ ] 1,000 translation requests (first month)
- [ ] 50 language modules created
- [ ] 10 cultural guides published

### **Phase 6.6 (Navigation)**
- [ ] < 1s cross-property navigation time
- [ ] 80% user navigation through global nav
- [ ] Unified search usage: 500+ queries/day

---

## Risk Mitigation

### **Technical Risks**
| Risk | Impact | Mitigation |
|------|--------|------------|
| SSO implementation complexity | High | Use proven JWT pattern, thorough testing |
| File upload abuse | Medium | Tier-based limits, malware scanning |
| Payment fraud | High | Stripe's built-in fraud detection |
| Translation costs | Medium | Cache translations, use GPT-5 fallback |
| Database performance | Medium | Proper indexing, query optimization |

### **Business Risks**
| Risk | Impact | Mitigation |
|------|--------|------------|
| Low paid conversion | High | Compelling free features, clear value prop |
| Marketplace low liquidity | Medium | Seed with quality listings, promote heavily |
| Social network adoption | High | Invite-only launch, community building |
| Content moderation load | Medium | AI filtering, clear community guidelines |

---

## Next Steps

### **Immediate (This Week)**
1. ✅ Create architecture documentation
2. ✅ Define database schemas
3. ✅ Generate API endpoint specs
4. 🔜 Create stub endpoints
5. 🔜 Set up Cloudflare R2 bucket
6. 🔜 Configure DeepL API account

### **Phase 6.0 Implementation (Weeks 1-3)**
1. Build identity service
2. Implement JWT authentication
3. Create user migration script
4. Build frontend AuthProvider
5. Test SSO across subdomains

### **Phase 6.2 Implementation (Weeks 4-6)**
1. Define Stripe products/prices
2. Build subscription checkout flow
3. Implement feature gating middleware
4. Create membership dashboard
5. Test payment webhooks

---

**Status:** Architecture Complete → Ready for Implementation
**Next Phase:** Stub Endpoint Creation + Development Setup
**Last Updated:** 2025-11-01
**Owner:** BANIBS Core Team
