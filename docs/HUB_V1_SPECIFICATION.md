# BANIBS Hub v1 - Specification Document
**Post-Login Unified Dashboard**

**Date:** November 1, 2025  
**Phase:** 6.1 (Social MVP) - Entry Point  
**Route:** `/hub`  
**Authentication:** Required

---

## 🎯 Purpose

Hub v1 is the **primary authenticated landing page** where users arrive immediately after login. It serves as the convergence point for:
- News (global + regional)
- Business directory access
- Opportunities (jobs, grants, resources)
- Community activity (Phase 6.1+)

**Core Principle:** Immediate value - users see real activity the moment they log in.

---

## 🧭 User Flow

```
User logs in → JWT issued → Redirect to /hub → Load personalized dashboard
```

**Navigation:**
- Logged out → `/login` or `/register`
- Logged in → `/hub` (default landing)
- Deep links preserved (e.g., `/hub` → `/business/directory` → back to `/hub`)

---

## 🏗️ Layout Structure

### Top Navigation Bar (Global)
**Always visible across all authenticated pages**

| Element | Function | Alignment |
|---------|----------|-----------|
| **BANIBS Logo** | Home link (→ `/hub`) | Left |
| **Global Search** | Search: news, businesses, people | Center-Left |
| **Notifications 🔔** | Activity alerts (badge count) | Right |
| **Messages 💬** | Direct messages (badge count) | Right |
| **Profile Avatar** | Dropdown menu (profile, settings, logout) | Far Right |

**Profile Dropdown:**
- My Profile
- My Businesses
- My Posts (Phase 6.1)
- Settings
- Billing / Membership (Phase 6.2)
- Logout

---

### Welcome Panel (Hero Area)
**Personalized greeting + quick actions**

**Layout:**
```
┌─────────────────────────────────────────────────────┐
│  Welcome back, [First Name] 👋                      │
│  Here's what's happening today.                     │
│                                                     │
│  [+ Add Business] [Post to Community] [View Opps]  │
│  [Read News]                                        │
│                                                     │
│  Background: Rotating tagline                       │
│  "News • Business • Community • Opportunity"        │
└─────────────────────────────────────────────────────┘
```

**Quick Action Buttons:**
1. **+ Add a Business** → `/business/create`
2. **Post to Community** → `/social/compose` (Phase 6.1)
3. **View Opportunities** → `/opportunities`
4. **Read News** → `/news`

**Visual Design:**
- Background: Gradient or hero image (Black-cultural inspired)
- Typography: Bold, modern sans-serif
- Colors: BANIBS brand palette (soft glass aesthetic)
- Responsive: Stacks vertically on mobile

---

### Main Body (2-Column Layout)

#### Left Column (70% width) - Activity Feed

**Content Sections (Initial Implementation - Phase 6.0/6.1):**

1. **Top Stories by Region**
   - Source: `/api/news/latest?limit=5`
   - Display: News card (image, headline, summary, "Read More")
   - Filterable by region (Global, Africa, Americas, etc.)

2. **Featured Opportunities**
   - Source: `/api/opportunities/featured?limit=3`
   - Display: Opportunity tile (title, organization, deadline, "Apply")

3. **Trending in BANIBS**
   - Source: `/api/news/trending?region=Global&limit=5` (Phase 6.2)
   - Display: Compact list with engagement metrics

4. **Community Posts** (Phase 6.1+)
   - Source: `/api/social/feed?limit=10`
   - Display: Social post card (author, content, likes, comments)

**Feed Component Reusability:**
- Build as `<ActivityFeed />` component
- Reuse in Hub v1 and Social page
- Props: `feedType`, `limit`, `showFilters`

---

#### Right Column (30% width) - Quick Destinations

**Tile Cards (Vertical Stack):**

1. **🏢 Business Directory**
   - "Discover Black & Indigenous businesses"
   - Button: "Browse Directory" → `/business/directory`
   - Badge: "X verified businesses"

2. **📚 Information & Resources**
   - "Education, culture, language tools"
   - Button: "Explore Resources" → `/resources`
   - Badge: "New guides available"

3. **💼 Opportunities**
   - "Jobs, grants, funding"
   - Button: "View All" → `/opportunities`
   - Badge: "X new this week"

4. **📅 Events & Networking** (Phase 6.1+)
   - "Connect with the community"
   - Button: "See Events" → `/events`

5. **My Activity**
   - "My Businesses" (count)
   - "My Posts" (count, Phase 6.1)
   - "My Applications" (count)
   - Button: "View All" → `/profile`

**Tile Design:**
- Card style: Soft glass effect
- Icon + title + description + CTA button
- Hover: Subtle elevation
- Responsive: Full width on mobile (stack below feed)

---

## 📊 Data Sources & API Integration

### Initial Implementation (Phase 6.0/6.1)

**News Feed:**
```javascript
GET /api/news/latest?limit=5&region=Global
→ Returns: [{id, title, summary, imageUrl, sourceUrl, publishedAt}]
```

**Opportunities:**
```javascript
GET /api/opportunities/featured?limit=3
→ Returns: [{id, title, organization, deadline, type}]
```

**User Profile:**
```javascript
GET /api/auth/me
→ Returns: {id, name, email, roles, membership_level}
```

**Business Listings (User's):**
```javascript
GET /api/business/my-listings
→ Returns: [{id, business_name, verified}]
```

### Future APIs (Phase 6.1+)

**Social Feed:**
```javascript
GET /api/social/feed?page=1&limit=10
→ Returns: [{id, content, author, likes, comments}]
```

**Notifications:**
```javascript
GET /api/notifications?unread=true
→ Returns: [{id, type, message, createdAt}]
```

**Messages:**
```javascript
GET /api/social/messages?unread=true
→ Returns: [{id, sender, preview, createdAt}]
```

---

## 🎨 Design Specifications

### Brand Aesthetic
- **Primary Colors:** 
  - BANIBS Yellow: `#FFD700`
  - Deep Charcoal: `#1E1E1E`
  - Soft White: `#F5F5F5`
- **Typography:**
  - Headings: `Inter Bold` or `Montserrat Bold`
  - Body: `Inter Regular`
- **UI Pattern:** Soft glass cards (backdrop blur, subtle shadows)
- **Cultural Elements:** 
  - Afrocentric patterns (subtle background)
  - Human imagery (diverse community photos)

### Responsive Breakpoints

**Desktop (>1024px):**
```
┌───────────────────────────────────────┐
│  Top Nav (full)                       │
├───────────────────────────────────────┤
│  Welcome Panel (hero)                 │
├─────────────────────┬─────────────────┤
│  Activity Feed (70%)│ Quick Tiles(30%)│
│                     │                 │
└─────────────────────┴─────────────────┘
```

**Tablet (768px - 1024px):**
```
┌───────────────────────────────────────┐
│  Top Nav (condensed)                  │
├───────────────────────────────────────┤
│  Welcome Panel                        │
├─────────────────────┬─────────────────┤
│  Activity Feed (60%)│ Quick Tiles(40%)│
└─────────────────────┴─────────────────┘
```

**Mobile (<768px):**
```
┌───────────────────────────────────────┐
│  Top Nav (hamburger menu)             │
├───────────────────────────────────────┤
│  Welcome Panel (compact)              │
├───────────────────────────────────────┤
│  Quick Actions (horizontal scroll)    │
├───────────────────────────────────────┤
│  Activity Feed (full width)           │
├───────────────────────────────────────┤
│  Quick Tiles (stacked, full width)    │
└───────────────────────────────────────┘
```

---

## 🔒 Authentication & Authorization

### Access Control
- **Route:** `/hub` (protected)
- **Middleware:** `requireAuth()` - Redirect to `/login` if not authenticated
- **Token Check:** JWT from localStorage + refresh token from cookie

### Personalization
- **Welcome Message:** Use `user.name` from JWT payload
- **Feed Content:** Filter by user preferences (future)
- **Quick Actions:** Show/hide based on user roles

**Role-Based Features:**
| Role | Features |
|------|----------|
| `user` | View all content, post (Phase 6.1+) |
| `contributor` | + Submit opportunities |
| `creator` | + Create business listings |
| `super_admin` | + Moderation tools |

---

## 🧩 Component Architecture

### Frontend Structure (React)

```
/src/pages/
  ├── Hub/
  │   ├── HubPage.js               # Main dashboard container
  │   ├── WelcomePanel.js          # Hero area with quick actions
  │   ├── ActivityFeed.js          # Left column feed (reusable)
  │   └── QuickDestinations.js     # Right column tiles

/src/components/
  ├── Layout/
  │   ├── TopNav.js                # Global navigation
  │   ├── SearchBar.js             # Global search
  │   ├── NotificationBell.js      # Notifications dropdown
  │   └── ProfileMenu.js           # Profile dropdown
  │
  ├── Feed/
  │   ├── NewsCard.js              # News item display
  │   ├── OpportunityTile.js       # Opportunity display
  │   ├── SocialPostCard.js        # Social post (Phase 6.1)
  │   └── TrendingWidget.js        # Trending stories (Phase 6.2)
  │
  └── Tiles/
      ├── DestinationTile.js       # Quick destination card
      └── MyActivityTile.js        # User's activity summary
```

### State Management

**Global State (Context):**
```javascript
// src/contexts/HubContext.js
const HubContext = createContext();

const HubProvider = ({ children }) => {
  const [feedData, setFeedData] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch dashboard data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);
  
  return (
    <HubContext.Provider value={{ feedData, notifications, loading }}>
      {children}
    </HubContext.Provider>
  );
};
```

**API Calls:**
```javascript
// src/services/hubApi.js
export const fetchDashboardData = async () => {
  const [news, opportunities, userProfile] = await Promise.all([
    fetch(`${BACKEND_URL}/api/news/latest?limit=5`),
    fetch(`${BACKEND_URL}/api/opportunities/featured?limit=3`),
    fetch(`${BACKEND_URL}/api/auth/me`, { headers: authHeaders })
  ]);
  
  return {
    news: await news.json(),
    opportunities: await opportunities.json(),
    user: await userProfile.json()
  };
};
```

---

## ⚡ Performance Optimization

### Initial Load
1. **Parallel API Calls:** Fetch news + opportunities + profile simultaneously
2. **Skeleton Loading:** Show placeholders while data loads
3. **Image Lazy Loading:** Defer below-fold images
4. **Cache Strategy:** 
   - Session cache for feed (5 min TTL)
   - LocalStorage for user profile

### Infinite Scroll (Feed)
```javascript
// Load more on scroll
const handleScroll = () => {
  if (isNearBottom() && !loading) {
    loadMoreFeed();
  }
};
```

### Optimistic Updates
- Like/unlike actions update UI immediately
- Background sync with API

---

## 🧪 Testing Plan

### Unit Tests
- [ ] WelcomePanel renders user name
- [ ] ActivityFeed fetches and displays news
- [ ] QuickDestinations tiles navigate correctly
- [ ] TopNav profile menu shows correct options

### Integration Tests
- [ ] Login redirects to `/hub`
- [ ] Feed loads news from API
- [ ] Quick action buttons navigate
- [ ] Notifications dropdown works

### E2E Tests (Playwright)
- [ ] User logs in → lands on Hub
- [ ] Click "Browse Directory" → navigates to `/business/directory`
- [ ] Click news article → opens article page
- [ ] Profile dropdown → logout → redirects to login

---

## 📅 Implementation Timeline

### Phase 6.1 - Week 1 (After 6.0 Verified)
- [ ] **Day 1-2:** Frontend layout (WelcomePanel, ActivityFeed, QuickDestinations)
- [ ] **Day 3:** API integration (news, opportunities)
- [ ] **Day 4:** TopNav + SearchBar components
- [ ] **Day 5:** Responsive design + polish

### Phase 6.1 - Week 2
- [ ] **Day 1-2:** Notifications dropdown (stub)
- [ ] **Day 3:** Messages dropdown (stub)
- [ ] **Day 4-5:** Testing + bug fixes

**Total:** 10 days from Phase 6.0 completion

---

## 🚀 Deployment Checklist

### Backend (Ready)
- [x] `/api/news/latest` endpoint
- [x] `/api/opportunities/featured` endpoint (existing)
- [x] `/api/auth/me` endpoint (Phase 6.0)
- [x] `/api/business/my-listings` endpoint (Business Directory v2)

### Frontend (To Build)
- [ ] `/hub` route protected
- [ ] HubPage component
- [ ] Activity feed component
- [ ] Quick destinations tiles
- [ ] Top navigation integrated
- [ ] Responsive design tested

### Infrastructure
- [ ] Route `/hub` in React Router
- [ ] Auth middleware on frontend
- [ ] Session cache configured
- [ ] Error boundaries in place

---

## 🔄 Future Enhancements (Phase 6.1+)

### Social Feed Integration
- Community posts mixed with news
- Follow/unfollow users
- Like/comment on posts

### Personalization
- "Quick Start" buttons based on user behavior
- Regional news preferences
- Custom feed filters

### Advanced Features
- Embedded video carousel (BANIBS TV)
- In-page mini-messenger
- Real-time notifications (WebSocket)
- Trending hashtags
- Featured community members

---

## 📊 Success Metrics

**Engagement:**
- 80% of users click at least one item in feed (first visit)
- 50% explore a quick destination tile
- 30% return daily

**Performance:**
- Initial page load: <2 seconds
- Time to interactive: <3 seconds
- Lighthouse score: >90

**User Feedback:**
- "I immediately see what's happening" (qualitative)
- Reduced bounce rate vs. static landing page

---

## 🗂️ Related Documents

- `/app/docs/PHASE_6.0_ENDPOINT_VERIFICATION.md` - Auth/SSO endpoints
- `/app/docs/PHASE_6_ARCHITECTURE_V1.3.md` - Overall Phase 6 architecture
- `/app/docs/business_directory_v2.md` - Business directory API
- `/app/docs/BANIBS_IDENTITY_CONTRACT.md` - UI/UX brand standards

---

## 📝 Notes

**Technical Decisions:**
1. **Route:** `/hub` (not `/` or `/dashboard`) - clear semantic meaning
2. **Feed Source:** News + Opportunities initially, Social posts added in Phase 6.1
3. **Responsive:** Mobile-first design, progressive enhancement
4. **Cache:** Client-side session cache (5 min) to reduce API load

**Open Questions:**
1. Should `/` (root) redirect to `/hub` for authenticated users?
2. What happens if feed fails to load (error state)?
3. Should we show "What's New" onboarding on first login?

---

**Status:** Specification Complete ✅  
**Next:** Implement after Phase 6.0 (Auth/SSO) verification  
**Prepared by:** Neo (Emergent AI Engineer)  
**Date:** November 1, 2025
