# Hub v2 - Phase 6.2 Scope Document
## Interactive Layer Integration

**Document Version**: 1.0  
**Created**: November 2, 2025  
**Author**: AI Engineer (Neo)  
**Approved By**: Raymond E. Neely Jr. (Founder, BANIBS Network)  
**Prerequisite**: Phase 6.1 Hub v1 Dashboard (APPROVED ✅)

---

## Executive Summary

Phase 6.2 transforms Hub v1 from a read-only dashboard into an interactive platform by activating notifications, messaging, and community features. This phase introduces real-time communication capabilities, enhanced navigation, and integrated search—laying the foundation for social features in subsequent phases.

### Objectives
1. **Activate Notifications System** - Real-time alerts with dropdown UI and API backend
2. **Implement Messaging** - Basic inbox with conversation view
3. **Enable Stub Tiles** - Information & Resources, Events & Networking (from placeholders to functional)
4. **Add Feed Filtering & Search** - Unified search across news, businesses, and opportunities
5. **Maintain Integrity** - Preserve Phase 6.0 auth and Phase 6.1 data flows

---

## 1. Scope Overview

### 1.1 Phase 6.2 Components

| Component | Type | Priority | Complexity |
|-----------|------|----------|------------|
| **Notifications System** | Feature | HIGH | Medium |
| **Messaging (Inbox)** | Feature | HIGH | High |
| **Information & Resources** | Tile Activation | MEDIUM | Low |
| **Events & Networking** | Tile Activation | MEDIUM | Medium |
| **Feed Filtering** | Enhancement | MEDIUM | Medium |
| **Unified Search** | Enhancement | HIGH | High |

### 1.2 Out of Scope (Future Phases)

- Real-time WebSocket connections (stubbed for Phase 6.3)
- Advanced messaging features (file uploads, read receipts)
- Event registration/ticketing
- Community posts/feed
- Video/voice calls

---

## 2. Notifications System

### 2.1 Requirements

**Backend**:
- Notification model (MongoDB collection)
- API endpoints for CRUD operations
- Mark as read/unread functionality
- Notification categories (system, opportunity, message, event)

**Frontend**:
- Replace stub dropdown with real notification list
- Show unread count badge
- Real-time polling (every 30s) or WebSocket stub
- Click to mark as read
- Link to relevant content

### 2.2 Data Model

```javascript
// notifications collection
{
  id: "uuid",
  user_id: "uuid",                    // Recipient user ID
  type: "system" | "opportunity" | "message" | "event" | "business",
  title: "New opportunity posted",
  message: "Check out the latest grant opportunity...",
  link: "/opportunities/uuid",        // Click destination
  read: false,
  created_at: Date,
  expires_at: Date | null            // Optional expiry
}
```

### 2.3 API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/notifications` | GET | Get user's notifications (paginated) | JWT |
| `/api/notifications/{id}/read` | PATCH | Mark notification as read | JWT |
| `/api/notifications/read-all` | PATCH | Mark all as read | JWT |
| `/api/notifications/unread-count` | GET | Get unread count (for badge) | JWT |
| `/api/notifications` | POST | Create notification (admin/system) | JWT (admin) |

### 2.4 Frontend Changes

**TopNav.js** (update):
```javascript
// Replace stub with real notifications
- Show unread count badge (red circle)
- Poll /api/notifications/unread-count every 30s
- Dropdown shows latest 10 notifications
- Click notification → mark as read, navigate to link
- "View All Notifications" link → /notifications page
```

**New Component**: `NotificationsPage.js`
- Full list of notifications (all time)
- Filter by type (system, opportunity, message, event)
- Pagination (20 per page)
- Mark as read/unread

### 2.5 WebSocket Stub (Phase 6.3 Prep)

```javascript
// In TopNav.js, add:
useEffect(() => {
  // Future: Replace with WebSocket connection
  const interval = setInterval(() => {
    fetchUnreadCount(); // Polling for now
  }, 30000);
  
  return () => clearInterval(interval);
}, []);
```

---

## 3. Messaging System

### 3.1 Requirements

**Backend**:
- Conversation model (MongoDB)
- Message model (MongoDB)
- API endpoints for inbox, conversation, send message
- Search conversations

**Frontend**:
- Replace stub dropdown with inbox preview
- Full inbox page with conversation list
- Conversation view (chat-style UI)
- Send message form
- Mark as read when viewed

### 3.2 Data Models

```javascript
// conversations collection
{
  id: "uuid",
  participants: ["user_uuid_1", "user_uuid_2"],
  participant_details: [
    { id: "uuid", name: "John Doe", avatar_url: "..." },
    { id: "uuid", name: "Jane Smith", avatar_url: "..." }
  ],
  last_message: "Hey, are you available?",
  last_message_at: Date,
  unread_count: 2,                   // For current user
  created_at: Date,
  updated_at: Date
}

// messages collection
{
  id: "uuid",
  conversation_id: "uuid",
  sender_id: "uuid",
  sender_name: "John Doe",
  content: "Hey, are you available?",
  read: false,
  created_at: Date
}
```

### 3.3 API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/messages/conversations` | GET | Get user's conversations (inbox) | JWT |
| `/api/messages/conversations/{id}` | GET | Get conversation messages | JWT |
| `/api/messages/conversations/{id}/messages` | POST | Send message in conversation | JWT |
| `/api/messages/conversations` | POST | Start new conversation | JWT |
| `/api/messages/unread-count` | GET | Get unread message count | JWT |
| `/api/messages/conversations/{id}/read` | PATCH | Mark conversation as read | JWT |

### 3.4 Frontend Changes

**TopNav.js** (update):
```javascript
// Replace stub with real messages
- Show unread count badge (red circle)
- Dropdown shows latest 5 conversations
- Click conversation → navigate to /messages/{id}
- "View All Messages" link → /messages
```

**New Components**:

1. **InboxPage.js** (`/messages`)
   - List of conversations
   - Search bar (filter by participant name)
   - Show last message, timestamp, unread badge
   - Click conversation → `/messages/{conversation_id}`

2. **ConversationView.js** (`/messages/{id}`)
   - Chat-style UI (messages stacked)
   - Show sender name + avatar
   - Message input at bottom
   - Auto-scroll to bottom
   - Mark as read on mount

3. **NewMessageModal.js**
   - Button: "New Message" in inbox page
   - Search for user by name/email
   - Start conversation

---

## 4. Information & Resources Tile Activation

### 4.1 Requirements

**Backend**:
- Resource model (MongoDB collection)
- Categories: Education, Language, Culture, History, Legal
- API endpoints for browsing resources

**Frontend**:
- Replace stub with functional `/resources` page
- Browse by category
- Search resources
- View resource details

### 4.2 Data Model

```javascript
// resources collection
{
  id: "uuid",
  title: "Intro to Ojibwe Language",
  description: "Learn basic Ojibwe phrases and grammar",
  category: "Language",
  type: "Guide" | "Video" | "Article" | "Tool",
  url: "https://external-link.com" | null,
  content: "Markdown content..." | null,  // For internal resources
  thumbnail_url: "...",
  tags: ["language", "ojibwe", "beginner"],
  featured: false,
  created_at: Date,
  updated_at: Date
}
```

### 4.3 API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/resources` | GET | Get all resources (paginated, filtered) | No |
| `/api/resources/categories` | GET | Get resource categories | No |
| `/api/resources/{id}` | GET | Get resource details | No |
| `/api/resources` | POST | Create resource (admin) | JWT (admin) |
| `/api/resources/{id}` | PATCH | Update resource (admin) | JWT (admin) |

### 4.4 Frontend Changes

**New Component**: `ResourcesPage.js` (`/resources`)
- Browse all resources
- Filter by category (Education, Language, Culture, etc.)
- Search bar
- Card layout with thumbnails
- Click resource → view details (modal or dedicated page)

**QuickDestinations.js** (update):
```javascript
// Remove stub, enable real route
{
  icon: '📚',
  title: 'Information & Resources',
  description: 'Education, culture, language tools',
  badge: `${resourceCount} resources`,  // Fetch count from API
  action: 'Explore Resources',
  route: '/resources',
  stub: false  // Changed from true
}
```

---

## 5. Events & Networking Tile Activation

### 5.1 Requirements

**Backend**:
- Event model (MongoDB collection)
- Categories: Networking, Workshop, Webinar, Conference, Meetup
- RSVP tracking
- API endpoints for browsing events

**Frontend**:
- Replace stub with functional `/events` page
- Browse upcoming/past events
- RSVP to events
- View event details
- Calendar view (optional)

### 5.2 Data Model

```javascript
// events collection
{
  id: "uuid",
  title: "Black Business Networking Mixer",
  description: "Connect with local Black business owners...",
  category: "Networking",
  location: "Chicago, IL" | "Virtual",
  location_url: "https://zoom.us/..." | null,
  start_date: Date,
  end_date: Date,
  organizer_id: "uuid",
  organizer_name: "BANIBS Community",
  rsvp_limit: 100 | null,
  rsvp_count: 35,
  rsvp_users: ["user_uuid_1", "user_uuid_2", ...],
  image_url: "...",
  featured: false,
  created_at: Date,
  updated_at: Date
}
```

### 5.3 API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/events` | GET | Get events (upcoming/past, filtered) | No |
| `/api/events/{id}` | GET | Get event details | No |
| `/api/events/{id}/rsvp` | POST | RSVP to event | JWT |
| `/api/events/{id}/rsvp` | DELETE | Cancel RSVP | JWT |
| `/api/events/my-rsvps` | GET | Get user's RSVPs | JWT |
| `/api/events` | POST | Create event (admin/moderator) | JWT |
| `/api/events/{id}` | PATCH | Update event (admin/moderator) | JWT |

### 5.4 Frontend Changes

**New Component**: `EventsPage.js` (`/events`)
- Browse upcoming events (default)
- Filter: Upcoming, Past, My RSVPs
- Search events
- Card layout with event image, date, location
- Click event → view details modal
- RSVP button in modal

**QuickDestinations.js** (update):
```javascript
// Remove stub, enable real route
{
  icon: '📅',
  title: 'Events & Networking',
  description: 'Connect with the community',
  badge: `${upcomingCount} upcoming`,  // Fetch count from API
  action: 'See Events',
  route: '/events',
  stub: false  // Changed from true
}
```

---

## 6. Feed Filtering & Search Integration

### 6.1 Requirements

**Backend**:
- Unified search endpoint (searches news, businesses, opportunities, resources)
- Feed filtering by category, date, type

**Frontend**:
- Make top nav search bar functional
- Filter controls in activity feed
- Search results page

### 6.2 API Endpoints

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/search` | GET | Unified search (query param: ?q=...) | No |
| `/api/search/suggest` | GET | Search suggestions (autocomplete) | No |

**Example `/api/search` Response**:
```json
{
  "query": "business grants",
  "results": {
    "news": [
      { "id": "...", "type": "news", "title": "...", "snippet": "..." }
    ],
    "opportunities": [
      { "id": "...", "type": "opportunity", "title": "...", "snippet": "..." }
    ],
    "businesses": [
      { "id": "...", "type": "business", "name": "...", "snippet": "..." }
    ],
    "resources": [
      { "id": "...", "type": "resource", "title": "...", "snippet": "..." }
    ]
  },
  "total": 42
}
```

### 6.3 Frontend Changes

**TopNav.js** (update):
```javascript
// Make search functional
const handleSearchSubmit = (e) => {
  e.preventDefault();
  navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
};
```

**New Component**: `SearchResultsPage.js` (`/search`)
- Display results grouped by type (news, opportunities, businesses, resources)
- Each section shows max 5 items, "View All [Type]" button
- Highlight search query in results
- Filter by type tabs

**ActivityFeed.js** (update):
```javascript
// Add filter controls
- Category dropdown (All, Business, Tech, Community, etc.)
- Date range picker (Today, This Week, This Month)
- Type filter (News, Opportunities, Both)
- Apply filters → re-fetch data
```

---

## 7. Technical Architecture

### 7.1 Backend Structure

```
/app/backend/
├── models/
│   ├── notification.py           # NEW
│   ├── conversation.py            # NEW
│   ├── message.py                 # NEW
│   ├── resource.py                # NEW
│   └── event.py                   # NEW
├── db/
│   ├── notifications.py           # NEW
│   ├── messages.py                # NEW
│   ├── resources.py               # NEW
│   └── events.py                  # NEW
├── routes/
│   ├── notifications.py           # NEW
│   ├── messages.py                # NEW
│   ├── resources.py               # NEW
│   ├── events.py                  # NEW
│   └── search.py                  # NEW
└── server.py                      # UPDATE: Register new routers
```

### 7.2 Frontend Structure

```
/app/frontend/src/
├── pages/
│   ├── Hub/
│   │   ├── HubPage.js             # UPDATE: Add filter controls
│   │   ├── TopNav.js              # UPDATE: Real notifications, messages, search
│   │   ├── ActivityFeed.js        # UPDATE: Add filtering
│   │   └── QuickDestinations.js   # UPDATE: Enable stub tiles
│   ├── Notifications/
│   │   └── NotificationsPage.js   # NEW
│   ├── Messages/
│   │   ├── InboxPage.js           # NEW
│   │   ├── ConversationView.js    # NEW
│   │   └── NewMessageModal.js     # NEW
│   ├── Resources/
│   │   └── ResourcesPage.js       # NEW
│   ├── Events/
│   │   └── EventsPage.js          # NEW
│   └── Search/
│       └── SearchResultsPage.js   # NEW
└── App.js                         # UPDATE: Add new routes
```

### 7.3 Database Collections (New)

```mongodb
banibs_notifications     # User notifications
banibs_conversations     # Message conversations
banibs_messages          # Individual messages
banibs_resources         # Educational resources
banibs_events            # Community events
```

---

## 8. Implementation Roadmap

### 8.1 Phase 6.2.1 - Notifications (Week 1)

**Backend**:
1. Create notification model + DB operations
2. Implement notification API endpoints
3. Seed sample notifications for testing

**Frontend**:
1. Update TopNav with real notifications
2. Create NotificationsPage
3. Add polling for unread count

**Testing**:
- Create notification via admin
- View in dropdown
- Mark as read
- Navigate to linked content

### 8.2 Phase 6.2.2 - Messaging (Week 2)

**Backend**:
1. Create conversation + message models
2. Implement messaging API endpoints
3. Add search/filter for conversations

**Frontend**:
1. Update TopNav with real messages
2. Create InboxPage + ConversationView
3. Implement send message functionality

**Testing**:
- Start conversation
- Send/receive messages
- Mark as read
- Unread count updates

### 8.3 Phase 6.2.3 - Resources & Events (Week 3)

**Backend**:
1. Create resource model + API
2. Create event model + API (with RSVP)
3. Seed sample resources + events

**Frontend**:
1. Create ResourcesPage
2. Create EventsPage
3. Update QuickDestinations (remove stubs)

**Testing**:
- Browse resources by category
- Browse events (upcoming/past)
- RSVP to event
- View my RSVPs

### 8.4 Phase 6.2.4 - Search & Filtering (Week 4)

**Backend**:
1. Implement unified search endpoint
2. Add full-text search indexes (MongoDB)
3. Implement search suggestions

**Frontend**:
1. Make TopNav search functional
2. Create SearchResultsPage
3. Add filter controls to ActivityFeed

**Testing**:
- Search for news, businesses, opportunities
- Filter activity feed by category/date
- Verify search relevance

---

## 9. UI/UX Wire References

### 9.1 Notifications Dropdown (Updated)

```
┌────────────────────────────────────┐
│ Notifications                  [x] │
├────────────────────────────────────┤
│ 🔔 New opportunity posted          │
│    "Grant opportunity for Black... │
│    2 hours ago                 [●] │
├────────────────────────────────────┤
│ 📅 Event reminder: Networking Mixer│
│    "Tomorrow at 6pm"           [●] │
│    Yesterday                        │
├────────────────────────────────────┤
│ 💼 Your business was approved      │
│    "Your listing is now live!"     │
│    3 days ago                      │
├────────────────────────────────────┤
│ [View All Notifications]           │
└────────────────────────────────────┘

[●] = Unread indicator (blue dot)
```

### 9.2 Messages Dropdown (Updated)

```
┌────────────────────────────────────┐
│ Messages                       [x] │
├────────────────────────────────────┤
│ 👤 John Doe                    [2] │
│    "Are you available for..."      │
│    5 min ago                        │
├────────────────────────────────────┤
│ 👤 Jane Smith                      │
│    "Thanks for connecting!"        │
│    1 hour ago                       │
├────────────────────────────────────┤
│ [View All Messages] [+ New]        │
└────────────────────────────────────┘

[2] = Unread count
```

### 9.3 Search Results Page

```
┌────────────────────────────────────────────┐
│ Search: "business grants"             [x]  │
├────────────────────────────────────────────┤
│ [All] [News] [Opportunities] [Businesses]  │
├────────────────────────────────────────────┤
│ News (5 results)                           │
│ ─────────────────────────────────────      │
│ 📰 New grant program for Black businesses  │
│    ...highlights "business grants" for...  │
│    Nov 1, 2025                             │
│                                            │
│ [View All News Results]                    │
├────────────────────────────────────────────┤
│ Opportunities (12 results)                 │
│ ─────────────────────────────────────      │
│ 💼 Small Business Grant - $50k            │
│    ...funding for "business grants"...     │
│    Deadline: Dec 15, 2025                  │
│                                            │
│ [View All Opportunity Results]             │
└────────────────────────────────────────────┘
```

### 9.4 ActivityFeed Filters

```
┌────────────────────────────────────────────┐
│ 📰 Top Stories                             │
│ ┌──────────────────────────────────────┐   │
│ │ [All Categories ▼] [This Week ▼] [🔍]│   │
│ └──────────────────────────────────────┘   │
│                                            │
│ [News Card 1]                              │
│ [News Card 2]                              │
└────────────────────────────────────────────┘
```

---

## 10. Data Flow Diagrams

### 10.1 Notification Flow

```
Admin/System
    ↓
POST /api/notifications
    ↓
notifications collection
    ↓
User opens Hub
    ↓
GET /api/notifications/unread-count (polling 30s)
    ↓
TopNav shows badge (e.g., "3")
    ↓
User clicks notification bell
    ↓
GET /api/notifications?limit=10
    ↓
Dropdown displays notifications
    ↓
User clicks notification
    ↓
PATCH /api/notifications/{id}/read
    ↓
Navigate to notification.link
```

### 10.2 Messaging Flow

```
User A opens Hub
    ↓
Click "New Message" in dropdown
    ↓
Search for User B by name
    ↓
POST /api/messages/conversations
    ↓
conversations collection created
    ↓
User A types message
    ↓
POST /api/messages/conversations/{id}/messages
    ↓
messages collection appended
    ↓
User B opens Hub (polling)
    ↓
GET /api/messages/unread-count → "1"
    ↓
TopNav shows badge
    ↓
User B clicks message icon
    ↓
GET /api/messages/conversations
    ↓
See conversation with User A
    ↓
Click conversation
    ↓
GET /api/messages/conversations/{id}
    ↓
Display chat view
    ↓
PATCH /api/messages/conversations/{id}/read
    ↓
Unread count resets
```

---

## 11. Security & Permissions

### 11.1 Access Control

| Feature | Public | User | Moderator | Admin |
|---------|--------|------|-----------|-------|
| View Notifications | ❌ | Own only | Own only | Own only |
| Send Messages | ❌ | ✅ | ✅ | ✅ |
| Create Resources | ❌ | ❌ | ✅ | ✅ |
| Create Events | ❌ | ❌ | ✅ | ✅ |
| Search | ✅ | ✅ | ✅ | ✅ |

### 11.2 Rate Limiting

```python
# Backend rate limits (per user per minute)
/api/notifications: 60 requests
/api/messages: 30 requests
/api/search: 120 requests
/api/resources: 120 requests
/api/events: 120 requests
```

### 11.3 Data Privacy

- Users can only see their own notifications
- Conversations are private (only participants can view)
- Message content is not indexed for search (privacy)
- Resources and events are public (no auth required to view)

---

## 12. Testing Strategy

### 12.1 Unit Tests

**Backend** (pytest):
- Test notification CRUD operations
- Test message sending/receiving
- Test search relevance
- Test RSVP logic

**Frontend** (Jest):
- Test notification dropdown rendering
- Test conversation list rendering
- Test search input/submit
- Test filter controls

### 12.2 Integration Tests

**E2E** (Playwright):
1. User receives notification → clicks → navigates to link
2. User sends message → other user receives → replies
3. User searches "grant" → sees results → clicks opportunity
4. User RSVPs to event → sees in "My RSVPs"

### 12.3 Manual Testing Checklist

- [ ] Notifications display correctly
- [ ] Unread count updates in real-time (polling)
- [ ] Messages send/receive successfully
- [ ] Search returns relevant results
- [ ] Filters narrow down feed items
- [ ] Resources page loads and is searchable
- [ ] Events page loads with RSVP functionality
- [ ] Mobile responsive (all new pages)

---

## 13. Performance Considerations

### 13.1 Optimization Strategies

**Notifications**:
- Index on `user_id` + `read` + `created_at` (MongoDB)
- Limit dropdown to 10 most recent
- Cache unread count (30s TTL)

**Messages**:
- Index on `participants` array
- Paginate conversations (20 per page)
- Lazy load conversation messages (50 per fetch, infinite scroll)

**Search**:
- Full-text search indexes on: `title`, `description`, `content`
- Debounce search input (500ms)
- Cache search results (5 min TTL)

**Feed Filtering**:
- Index on `category`, `publishedAt`
- Client-side caching of fetched items
- Only re-fetch when filter changes

### 13.2 Monitoring

**Metrics to Track**:
- Notification read rate (% clicked vs dismissed)
- Message response time (median time between send and reply)
- Search query frequency (top queries)
- RSVP conversion rate (views vs RSVPs)
- Page load times for new pages

---

## 14. Rollout Plan

### 14.1 Staged Rollout

**Phase 6.2.1 (Week 1)**: Notifications Only
- Deploy backend notification API
- Update frontend TopNav + NotificationsPage
- Test with limited user group (admins/mods)

**Phase 6.2.2 (Week 2)**: + Messaging
- Deploy messaging API
- Update TopNav + InboxPage + ConversationView
- Open to all authenticated users

**Phase 6.2.3 (Week 3)**: + Resources & Events
- Deploy resources + events APIs
- Add ResourcesPage + EventsPage
- Seed sample resources and events

**Phase 6.2.4 (Week 4)**: + Search & Filtering
- Deploy unified search API
- Make search bar functional
- Add filter controls to feed
- Full Phase 6.2 launch

### 14.2 Rollback Plan

If critical issues arise:
1. **Notifications**: Revert TopNav to stub dropdown (keep API running)
2. **Messages**: Revert TopNav to stub, keep API for testing
3. **Resources/Events**: Return tiles to stub state, keep pages accessible via direct URL
4. **Search**: Revert search bar to placeholder alert

---

## 15. Success Criteria

### 15.1 Functional Requirements

| Feature | Criteria | Target |
|---------|----------|--------|
| **Notifications** | Unread count displayed in TopNav | 100% |
| **Notifications** | Click notification → navigate to link | 100% |
| **Messaging** | Send message → receive response | 100% |
| **Messaging** | Unread message count accurate | 100% |
| **Resources** | Browse by category | 100% |
| **Events** | RSVP to event → appears in "My RSVPs" | 100% |
| **Search** | Query returns relevant results | >80% relevance |
| **Filtering** | Feed narrows by category/date | 100% |

### 15.2 Performance Metrics

| Metric | Target |
|--------|--------|
| Notification load time | <500ms |
| Message send latency | <1s |
| Search response time | <2s |
| Feed filter apply time | <500ms |
| Page load time (new pages) | <3s |

### 15.3 User Engagement

| Metric | Target (Month 1) |
|--------|------------------|
| Notification click-through rate | >30% |
| Messages sent per active user | >5 |
| Search queries per session | >2 |
| Event RSVPs | >50 |
| Resources viewed | >500 |

---

## 16. Dependencies & Prerequisites

### 16.1 Prerequisites

- ✅ Phase 6.0 (Unified Auth & SSO) - COMPLETE
- ✅ Phase 6.1 (Hub v1 Dashboard) - COMPLETE
- ✅ MongoDB connection established
- ✅ JWT authentication working

### 16.2 External Dependencies

**Backend**:
- Python 3.9+
- FastAPI 0.100+
- Motor (async MongoDB driver)
- PyJWT

**Frontend**:
- React 18+
- React Router 6+
- Tailwind CSS

**Infrastructure**:
- MongoDB Atlas or local MongoDB
- SMTP server (for email notifications - optional)
- WebSocket server (Phase 6.3 - stubbed for now)

---

## 17. Risk Assessment

### 17.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Search performance slow | MEDIUM | HIGH | Implement full-text indexes, pagination |
| Message storage grows large | HIGH | MEDIUM | Archive old conversations after 1 year |
| Notification polling overhead | LOW | MEDIUM | Optimize query, add caching |
| Real-time expectations (WebSocket) | MEDIUM | LOW | Set clear expectations (polling only in v1) |

### 17.2 UX Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Notification fatigue | MEDIUM | MEDIUM | Allow user to mute categories |
| Message spam | LOW | HIGH | Add report/block functionality |
| Search irrelevant results | MEDIUM | MEDIUM | Tune search weights, add filters |
| Filter controls confusing | LOW | LOW | User testing, clear labels |

---

## 18. Post-Launch Tasks

### 18.1 Monitoring (Week 1)

- [ ] Set up error tracking (Sentry or similar)
- [ ] Monitor API response times (CloudWatch/Datadog)
- [ ] Track notification read rates
- [ ] Monitor message send success rate

### 18.2 Optimization (Week 2-4)

- [ ] Analyze slow queries (MongoDB explain)
- [ ] Optimize search index weights
- [ ] Implement caching for high-traffic endpoints
- [ ] Add lazy loading for conversation messages

### 18.3 User Feedback (Ongoing)

- [ ] Collect feedback on notification relevance
- [ ] Survey users on messaging UX
- [ ] Identify most-searched queries
- [ ] Track event RSVP conversion

---

## 19. Phase 6.3 Prep (Future)

Phase 6.2 prepares for Phase 6.3 by:

1. **WebSocket Stub**: Polling mechanism can be replaced with WebSocket for real-time updates
2. **Notification System**: Foundation for community post notifications
3. **Messaging**: Can expand to group chats, file sharing
4. **Search**: Can add AI-powered recommendations
5. **Events**: Can integrate with calendar apps (Google Calendar, Outlook)

---

## 20. Conclusion

Phase 6.2 transforms Hub v1 from a static dashboard into an interactive platform, enabling users to:
- Receive real-time notifications
- Communicate via direct messages
- Discover educational resources
- Connect at community events
- Search across all content types

All features are designed to **maintain authentication integrity** from Phase 6.0 and **preserve data flow** from Phase 6.1.

---

**Next Steps**:
1. Review and approve this scope document
2. Begin Phase 6.2.1 (Notifications) implementation
3. Iterative deployment (weekly releases)
4. User testing and feedback collection

---

**Document Status**: DRAFT - Awaiting Approval  
**Prepared By**: AI Engineer (Neo)  
**Date**: November 2, 2025  
**Version**: 1.0
