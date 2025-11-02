# BANIBS – Phase 6.2.3 Scope Definition
## Information & Resources + Events & Networking

**Document Version**: 1.0  
**Created**: November 2, 2025  
**Author**: AI Engineer (Neo)  
**Phase**: Week 3 of Phase 6.2 Interactive Layer Integration  
**Prerequisites**: Phase 6.2.1 (Notifications) ✅, Phase 6.2.2 (Messaging) ✅

---

## 1. Executive Summary

Phase 6.2.3 transforms two placeholder tiles in the Hub dashboard into fully functional, data-driven modules:

1. **Information & Resources** - Educational content, guides, and community resources
2. **Events & Networking** - Community events with RSVP functionality

Both modules will integrate with the existing notification system (Phase 6.2.1) to alert users about new resources, upcoming events, and RSVP confirmations.

### Objectives
- Activate "Information & Resources" and "Events & Networking" Hub tiles
- Implement backend data models and CRUD APIs
- Build frontend browsing pages with filtering and search
- Enable user RSVPs for events
- Seed initial content for both modules
- Integrate with notification system for event reminders

---

## 2. Module 1: Information & Resources

### 2.1 Overview

A centralized repository of educational content, guides, and community resources supporting Black and Indigenous entrepreneurs and communities.

**Content Categories**:
- Business Support
- Grants & Funding
- Education
- Health & Wellness
- Technology
- Community & Culture

**Resource Types**:
- Articles (internal markdown content)
- Guides (PDF/external links)
- Videos (YouTube/Vimeo embeds)
- Tools (external web apps)
- Downloads (documents, templates)

### 2.2 Data Model

**Collection**: `banibs_resources`

```javascript
{
  id: "uuid",
  title: "Small Business Grant Application Guide",
  description: "Step-by-step guide to applying for small business grants",
  category: "Grants & Funding",
  type: "Guide" | "Article" | "Video" | "Tool" | "Download",
  
  // Content
  content: "Markdown content..." | null,      // For internal articles
  external_url: "https://..." | null,         // For external resources
  
  // Media
  thumbnail_url: "https://..." | null,        // Preview image
  video_url: "https://youtube.com/..." | null, // For video type
  
  // Metadata
  tags: ["grant", "funding", "business"],
  author_id: "uuid",                          // Creator user ID
  author_name: "BANIBS Team",                 // Cached author name
  
  // Engagement
  view_count: 0,
  featured: false,
  
  // Timestamps
  created_at: Date,
  updated_at: Date,
  published_at: Date | null                   // For draft/published workflow
}
```

**Indexes**:
```javascript
db.banibs_resources.createIndex({ "category": 1, "published_at": -1 });
db.banibs_resources.createIndex({ "tags": 1 });
db.banibs_resources.createIndex({ "featured": 1, "published_at": -1 });
```

### 2.3 API Endpoints (5 total)

#### 2.3.1 GET `/api/resources`
**Description**: List all published resources with filtering

**Auth**: Public (no JWT required)

**Query Parameters**:
```
?category=Business Support    // Filter by category
?type=Guide                   // Filter by type
?tags=grant,funding           // Filter by tags (comma-separated)
?featured=true                // Featured resources only
?limit=20                     // Pagination (default 20, max 100)
?skip=0                       // Pagination offset
?search=grant                 // Full-text search in title/description
```

**Response**:
```json
{
  "resources": [
    {
      "id": "uuid",
      "title": "Small Business Grant Application Guide",
      "description": "Step-by-step guide...",
      "category": "Grants & Funding",
      "type": "Guide",
      "thumbnail_url": "https://...",
      "tags": ["grant", "funding", "business"],
      "author_name": "BANIBS Team",
      "view_count": 245,
      "created_at": "2025-11-01T10:00:00Z"
    }
  ],
  "total": 42,
  "page": 1,
  "pages": 3
}
```

#### 2.3.2 GET `/api/resources/{id}`
**Description**: Get single resource details

**Auth**: Public

**Response**:
```json
{
  "id": "uuid",
  "title": "Small Business Grant Application Guide",
  "description": "Comprehensive guide...",
  "category": "Grants & Funding",
  "type": "Guide",
  "content": "# Introduction\n\nThis guide...",
  "external_url": null,
  "thumbnail_url": "https://...",
  "video_url": null,
  "tags": ["grant", "funding", "business"],
  "author_id": "uuid",
  "author_name": "BANIBS Team",
  "view_count": 246,
  "featured": true,
  "created_at": "2025-11-01T10:00:00Z",
  "updated_at": "2025-11-02T15:00:00Z",
  "published_at": "2025-11-01T12:00:00Z"
}
```

**Side Effect**: Increments `view_count` by 1

#### 2.3.3 POST `/api/resources`
**Description**: Create new resource (admin/moderator only)

**Auth**: Required (JWT) - Role: `super_admin` or `moderator`

**Request Body**:
```json
{
  "title": "New Resource Title",
  "description": "Resource description",
  "category": "Business Support",
  "type": "Article",
  "content": "Markdown content...",
  "external_url": null,
  "thumbnail_url": "https://...",
  "tags": ["business", "support"],
  "featured": false
}
```

**Response**: `201 Created` with resource object

#### 2.3.4 PATCH `/api/resources/{id}`
**Description**: Update resource (admin/moderator only)

**Auth**: Required (JWT) - Role: `super_admin` or `moderator`

**Request Body**: Partial update (any fields)

**Response**: `200 OK` with updated resource object

#### 2.3.5 DELETE `/api/resources/{id}`
**Description**: Delete resource (admin only)

**Auth**: Required (JWT) - Role: `super_admin`

**Response**: `200 OK` with `{"deleted": true}`

### 2.4 Frontend: `/resources` Page

**Components**:
1. **ResourcesPage.js** - Main container
2. **ResourceCard.js** - Individual resource card
3. **ResourceDetailModal.js** - Full resource view
4. **CategoryFilter.js** - Filter sidebar

**Layout**:
```
┌─────────────────────────────────────────────┐
│ Information & Resources                      │
├────────────┬────────────────────────────────┤
│ Filters    │ Search: [______________] [🔍]  │
│            │                                 │
│ [ ] All    │ ┌──────┐ ┌──────┐ ┌──────┐    │
│ [x] Business│ │Card 1│ │Card 2│ │Card 3│    │
│ [ ] Grants │ └──────┘ └──────┘ └──────┘    │
│ [ ] Education│ ┌──────┐ ┌──────┐ ┌──────┐  │
│ [ ] Health │ │Card 4│ │Card 5│ │Card 6│    │
│ [ ] Tech   │ └──────┘ └──────┘ └──────┘    │
│            │ [Load More]                     │
└────────────┴────────────────────────────────┘
```

**Features**:
- Category filter (checkboxes)
- Search bar (client-side filter by title/description)
- Card layout with thumbnail, title, description, category badge
- Click card → open detail modal or navigate to detail page
- "Featured" badge on featured resources
- View count display

### 2.5 Seeding Strategy

**Initial Dataset**: 20 resources across 6 categories

**Categories & Examples**:
1. **Business Support** (4 resources)
   - "How to Register Your Business"
   - "Business Plan Template"
   - "Marketing for Small Businesses"
   - "Financial Management Basics"

2. **Grants & Funding** (4 resources)
   - "Small Business Grant Application Guide"
   - "List of Available Grants for Black Entrepreneurs"
   - "Crowdfunding Best Practices"
   - "SBA Loan Programs Overview"

3. **Education** (3 resources)
   - "Free Online Business Courses"
   - "Certification Programs for Entrepreneurs"
   - "Mentorship Opportunities"

4. **Health & Wellness** (3 resources)
   - "Mental Health Resources for Entrepreneurs"
   - "Work-Life Balance Strategies"
   - "Healthcare Options for Small Business Owners"

5. **Technology** (3 resources)
   - "Free Tools for Small Businesses"
   - "Website Building Guide"
   - "Social Media Marketing Tools"

6. **Community & Culture** (3 resources)
   - "Networking Groups & Organizations"
   - "Cultural Heritage Preservation Guides"
   - "Community Building Strategies"

---

## 3. Module 2: Events & Networking

### 3.1 Overview

A community calendar for networking events, workshops, webinars, conferences, and meetups. Users can browse upcoming events, RSVP, and receive reminders.

**Event Categories**:
- Networking
- Workshop
- Webinar
- Conference
- Meetup
- Social Gathering

**Event Types**:
- In-Person (with location)
- Virtual (with meeting link)
- Hybrid (both)

### 3.2 Data Model

**Collection**: `banibs_events`

```javascript
{
  id: "uuid",
  title: "Black Business Networking Mixer",
  description: "Connect with local Black business owners...",
  category: "Networking",
  
  // Date & Time
  start_date: Date,                           // Event start (ISO 8601)
  end_date: Date,                             // Event end
  timezone: "America/Chicago",                // Timezone string
  
  // Location
  event_type: "In-Person" | "Virtual" | "Hybrid",
  location_name: "Chicago Convention Center" | null,
  location_address: "123 Main St, Chicago, IL" | null,
  location_url: "https://maps.google.com/..." | null,
  virtual_url: "https://zoom.us/..." | null,  // For virtual/hybrid
  
  // Organizer
  organizer_id: "uuid",                       // Creator user ID
  organizer_name: "BANIBS Community",         // Cached organizer name
  organizer_email: "events@banibs.com",
  
  // Media
  image_url: "https://..." | null,            // Event banner/poster
  
  // RSVP
  rsvp_limit: 100 | null,                     // Max attendees (null = unlimited)
  rsvp_count: 35,                             // Current RSVPs
  rsvp_users: ["user_uuid_1", "user_uuid_2"], // Array of RSVP'd user IDs
  
  // Metadata
  tags: ["networking", "business", "chicago"],
  featured: false,
  status: "upcoming" | "ongoing" | "completed" | "cancelled",
  
  // Timestamps
  created_at: Date,
  updated_at: Date,
  published_at: Date | null
}
```

**Indexes**:
```javascript
db.banibs_events.createIndex({ "start_date": 1, "status": 1 });
db.banibs_events.createIndex({ "category": 1, "start_date": 1 });
db.banibs_events.createIndex({ "featured": 1, "start_date": 1 });
db.banibs_events.createIndex({ "rsvp_users": 1 });
```

### 3.3 API Endpoints (7 total)

#### 3.3.1 GET `/api/events`
**Description**: List events with filtering

**Auth**: Public (no JWT required)

**Query Parameters**:
```
?status=upcoming              // Filter by status (upcoming, ongoing, completed)
?category=Networking          // Filter by category
?event_type=Virtual           // Filter by type
?start_date=2025-11-01        // Events after this date
?end_date=2025-12-31          // Events before this date
?featured=true                // Featured events only
?limit=20                     // Pagination (default 20, max 100)
?skip=0                       // Pagination offset
```

**Response**:
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Black Business Networking Mixer",
      "description": "Connect with...",
      "category": "Networking",
      "start_date": "2025-11-15T18:00:00Z",
      "end_date": "2025-11-15T21:00:00Z",
      "timezone": "America/Chicago",
      "event_type": "In-Person",
      "location_name": "Chicago Convention Center",
      "image_url": "https://...",
      "organizer_name": "BANIBS Community",
      "rsvp_count": 35,
      "rsvp_limit": 100,
      "status": "upcoming",
      "featured": true
    }
  ],
  "total": 12,
  "page": 1,
  "pages": 1
}
```

#### 3.3.2 GET `/api/events/{id}`
**Description**: Get single event details

**Auth**: Public

**Response**: Full event object with all fields

#### 3.3.3 POST `/api/events`
**Description**: Create new event (admin/moderator only)

**Auth**: Required (JWT) - Role: `super_admin` or `moderator`

**Request Body**:
```json
{
  "title": "Tech Workshop: AI for Small Business",
  "description": "Learn how to leverage AI...",
  "category": "Workshop",
  "start_date": "2025-11-20T14:00:00Z",
  "end_date": "2025-11-20T16:00:00Z",
  "timezone": "America/New_York",
  "event_type": "Virtual",
  "virtual_url": "https://zoom.us/j/123456",
  "organizer_email": "workshops@banibs.com",
  "image_url": "https://...",
  "rsvp_limit": 50,
  "tags": ["tech", "ai", "workshop"],
  "featured": false
}
```

**Response**: `201 Created` with event object

#### 3.3.4 PATCH `/api/events/{id}`
**Description**: Update event (admin/moderator only)

**Auth**: Required (JWT) - Role: `super_admin` or `moderator`

**Request Body**: Partial update

**Response**: `200 OK` with updated event

#### 3.3.5 DELETE `/api/events/{id}`
**Description**: Delete event (admin only)

**Auth**: Required (JWT) - Role: `super_admin`

**Response**: `200 OK` with `{"deleted": true}`

#### 3.3.6 POST `/api/events/{id}/rsvp`
**Description**: RSVP to an event

**Auth**: Required (JWT)

**Request Body**: Empty (user ID from JWT)

**Response**:
```json
{
  "rsvp_status": "confirmed",
  "event_id": "uuid",
  "user_id": "uuid",
  "rsvp_count": 36
}
```

**Side Effects**:
- Adds user ID to `rsvp_users` array
- Increments `rsvp_count`
- Creates notification: "RSVP Confirmed: [Event Title]"
- Idempotent: Returns existing RSVP if already registered

**Error Responses**:
- `400 Bad Request`: Event is full (rsvp_count >= rsvp_limit)
- `400 Bad Request`: Event has already ended
- `404 Not Found`: Event not found

#### 3.3.7 DELETE `/api/events/{id}/rsvp`
**Description**: Cancel RSVP

**Auth**: Required (JWT)

**Response**:
```json
{
  "rsvp_status": "cancelled",
  "event_id": "uuid",
  "user_id": "uuid",
  "rsvp_count": 35
}
```

**Side Effects**:
- Removes user ID from `rsvp_users` array
- Decrements `rsvp_count`

### 3.4 Frontend: `/events` Page

**Components**:
1. **EventsPage.js** - Main container
2. **EventCard.js** - Individual event card
3. **EventDetailModal.js** - Full event view with RSVP button
4. **EventFilters.js** - Filter controls

**Layout**:
```
┌─────────────────────────────────────────────┐
│ Events & Networking                          │
├──────────────────────────────────────────────┤
│ [Upcoming] [Past] [My RSVPs]                │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ 📅 Nov 15, 6:00 PM                     │  │
│ │ Black Business Networking Mixer        │  │
│ │ 📍 Chicago Convention Center           │  │
│ │ 👥 35/100 attending                    │  │
│ │ [RSVP Now]                             │  │
│ └────────────────────────────────────────┘  │
│                                              │
│ ┌────────────────────────────────────────┐  │
│ │ 📅 Nov 20, 2:00 PM                     │  │
│ │ Tech Workshop: AI for Small Business   │  │
│ │ 💻 Virtual Event                       │  │
│ │ 👥 12/50 attending                     │  │
│ │ [RSVP Now]                             │  │
│ └────────────────────────────────────────┘  │
└──────────────────────────────────────────────┘
```

**Features**:
- Tab navigation: Upcoming, Past, My RSVPs
- Event cards with date, time, location, attendee count
- RSVP button (disabled if full or past)
- Click card → open detail modal
- "Featured" badge on featured events
- Calendar view (optional enhancement)

### 3.5 Notification Integration

**Event Notifications** (using Phase 6.2.1 system):

1. **RSVP Confirmation**:
   - Type: `event`
   - Title: "RSVP Confirmed: Black Business Networking Mixer"
   - Message: "You're registered! Event starts Nov 15 at 6:00 PM."
   - Link: `/events/{event_id}`
   - Created: On RSVP

2. **Event Reminder** (24 hours before):
   - Type: `event`
   - Title: "Tomorrow: Black Business Networking Mixer"
   - Message: "Your event is tomorrow at 6:00 PM. See you there!"
   - Link: `/events/{event_id}`
   - Created: Automated (via scheduled task)

3. **Event Update**:
   - Type: `event`
   - Title: "Event Updated: Black Business Networking Mixer"
   - Message: "The event location has changed. Check details."
   - Link: `/events/{event_id}`
   - Created: When admin updates event

**Implementation**:
- Reuse existing `create_notification()` from Phase 6.2.1
- Automated reminders via APScheduler (check events 24h ahead every hour)
- All event notifications use same badge/dropdown UI

### 3.6 Seeding Strategy

**Initial Dataset**: 10 events (5 upcoming, 3 ongoing, 2 past)

**Example Events**:

1. **Black Business Networking Mixer** (Upcoming)
   - Category: Networking
   - Type: In-Person
   - Date: Nov 15, 2025, 6:00 PM - 9:00 PM
   - Location: Chicago Convention Center
   - Limit: 100
   - RSVPs: 35

2. **Tech Workshop: AI for Small Business** (Upcoming)
   - Category: Workshop
   - Type: Virtual
   - Date: Nov 20, 2025, 2:00 PM - 4:00 PM
   - Zoom Link
   - Limit: 50
   - RSVPs: 12

3. **Indigenous Entrepreneurs Webinar** (Upcoming)
   - Category: Webinar
   - Type: Virtual
   - Date: Nov 22, 2025, 11:00 AM - 12:00 PM
   - Zoom Link
   - Limit: 200
   - RSVPs: 87

4. **Small Business Conference 2025** (Upcoming)
   - Category: Conference
   - Type: Hybrid
   - Date: Dec 1-3, 2025
   - Location: Atlanta + Virtual
   - Limit: 500
   - RSVPs: 234

5. **Community Meetup: Chicago** (Upcoming)
   - Category: Meetup
   - Type: In-Person
   - Date: Nov 18, 2025, 7:00 PM - 9:00 PM
   - Location: Local Coffee Shop
   - Limit: 30
   - RSVPs: 28

---

## 4. Hub Integration

### 4.1 QuickDestinations Tile Updates

**Current State** (Phase 6.1):
```javascript
{
  icon: '📚',
  title: 'Information & Resources',
  badge: 'Coming in Phase 6.2',
  stub: true
}
```

**Updated State** (Phase 6.2.3):
```javascript
{
  icon: '📚',
  title: 'Information & Resources',
  badge: `${resourceCount} resources`,  // e.g., "20 resources"
  action: 'Explore Resources',
  route: '/resources',
  stub: false,
  preview: [                             // Top 3 resources
    { title: "Small Business Grant Guide", category: "Grants" },
    { title: "Business Plan Template", category: "Business" },
    { title: "Free Online Courses", category: "Education" }
  ]
}
```

**Events Tile**:
```javascript
{
  icon: '📅',
  title: 'Events & Networking',
  badge: `${upcomingCount} upcoming`,   // e.g., "5 upcoming"
  action: 'See Events',
  route: '/events',
  stub: false,
  preview: [                             // Next 3 events
    { title: "Networking Mixer", date: "Nov 15, 6:00 PM" },
    { title: "Tech Workshop", date: "Nov 20, 2:00 PM" },
    { title: "Webinar", date: "Nov 22, 11:00 AM" }
  ]
}
```

### 4.2 API Calls for Hub Tiles

**Resources Tile**:
- `GET /api/resources?limit=3&featured=true` - Fetch top 3 featured resources

**Events Tile**:
- `GET /api/events?status=upcoming&limit=3` - Fetch next 3 upcoming events
- `GET /api/events?status=upcoming` (count only) - Get upcoming event count

---

## 5. Security & Permissions

### 5.1 Access Control

| Action | Public | User | Moderator | Admin |
|--------|--------|------|-----------|-------|
| View Resources | ✅ | ✅ | ✅ | ✅ |
| View Events | ✅ | ✅ | ✅ | ✅ |
| RSVP to Events | ❌ | ✅ | ✅ | ✅ |
| Create Resources | ❌ | ❌ | ✅ | ✅ |
| Create Events | ❌ | ❌ | ✅ | ✅ |
| Update Resources | ❌ | ❌ | ✅ | ✅ |
| Update Events | ❌ | ❌ | ✅ | ✅ |
| Delete Resources | ❌ | ❌ | ❌ | ✅ |
| Delete Events | ❌ | ❌ | ❌ | ✅ |

**Note**: Resources and Events are **publicly viewable** (no authentication required to browse). Only RSVP and content management require authentication.

### 5.2 Input Validation

**Resources**:
- Title: 1-200 characters
- Description: 1-1000 characters
- Content: Max 50,000 characters (markdown)
- Tags: Max 10 tags, each 1-50 characters
- URLs: Valid URL format

**Events**:
- Title: 1-200 characters
- Description: 1-2000 characters
- Start date: Must be in the future (for new events)
- End date: Must be after start date
- RSVP limit: 1-10,000 (if specified)

### 5.3 Rate Limiting

```python
# Per user per hour
/api/resources: 500 requests
/api/events: 500 requests
/api/events/{id}/rsvp: 10 requests  # Prevent spam RSVPs
```

---

## 6. Testing Strategy

### 6.1 Backend Tests

**Resources API**:
- [ ] List resources (all, filtered by category, filtered by tags)
- [ ] Get resource by ID
- [ ] Create resource (admin/moderator only)
- [ ] Update resource (admin/moderator only)
- [ ] Delete resource (admin only)
- [ ] Search resources by title/description
- [ ] View count increments on GET /{id}

**Events API**:
- [ ] List events (upcoming, past, by category)
- [ ] Get event by ID
- [ ] Create event (admin/moderator only)
- [ ] Update event (admin/moderator only)
- [ ] Delete event (admin only)
- [ ] RSVP to event (auth required)
- [ ] Cancel RSVP
- [ ] RSVP limit enforcement (400 when full)
- [ ] Duplicate RSVP handling (idempotent)
- [ ] Notification creation on RSVP

### 6.2 Frontend Tests

**Resources Page**:
- [ ] Browse all resources
- [ ] Filter by category
- [ ] Search by keyword
- [ ] Click resource → view detail
- [ ] Responsive layout (mobile/desktop)

**Events Page**:
- [ ] Browse upcoming events
- [ ] View past events
- [ ] View "My RSVPs"
- [ ] RSVP to event (logged in)
- [ ] Cancel RSVP
- [ ] "Event Full" message when at capacity
- [ ] "Login to RSVP" message when not authenticated
- [ ] Responsive layout

**Hub Integration**:
- [ ] Resources tile shows count
- [ ] Events tile shows upcoming count
- [ ] Tile preview displays top 3 items
- [ ] Click tile → navigate to full page

### 6.3 Integration Tests

- [ ] Create resource → appears in /resources
- [ ] Create event → appears in /events (upcoming)
- [ ] RSVP to event → appears in "My RSVPs"
- [ ] RSVP to event → notification created
- [ ] Event date passes → moves to "Past" tab
- [ ] Featured resource/event → appears in Hub preview

---

## 7. Documentation Plan

### 7.1 Documents to Create

1. **HUB_V2_PHASE6.2.3_SCOPE.md** (this document)
   - Requirements and specifications
   - Data models
   - API endpoints
   - Frontend design

2. **HUB_V2_PHASE6.2.3_REPORT.md** (post-implementation)
   - Implementation summary
   - API testing results
   - Screenshots (desktop + mobile)
   - Known issues and future enhancements

3. **HUB_V2_PHASE6.2.3_API_REFERENCE.md** (optional)
   - Detailed API documentation (similar to Phase 6.2.2)
   - Request/response examples
   - Error codes

### 7.2 Seeding Scripts

1. **seed_resources.py** - Populate 20 initial resources
2. **seed_events.py** - Populate 10 initial events

---

## 8. Implementation Roadmap

### Phase 6.2.3 Timeline (Week 3)

**Days 1-2: Backend Implementation**
- [ ] Create resource model + DB operations
- [ ] Create event model + DB operations
- [ ] Implement resources API endpoints (5 endpoints)
- [ ] Implement events API endpoints (7 endpoints)
- [ ] Register routers in server.py
- [ ] Create seeding scripts
- [ ] Seed initial data

**Days 3-4: Frontend Implementation**
- [ ] Create ResourcesPage component
- [ ] Create EventsPage component
- [ ] Update QuickDestinations to activate tiles
- [ ] Add /resources and /events routes to App.js
- [ ] Test browsing and filtering

**Day 5: Integration & Testing**
- [ ] RSVP flow testing
- [ ] Notification integration testing
- [ ] Hub tile preview testing
- [ ] Mobile responsive testing
- [ ] Screenshot capture
- [ ] Documentation completion

---

## 9. Questions for Approval

### 9.1 Event Images
**Question**: Should Events include image uploads (poster/banner)?

**Options**:
- **Option A**: Admin provides image URL (external hosting)
  - Pros: Simple, no storage needed
  - Cons: Relies on external URLs (could break)
  
- **Option B**: Upload to `/uploads` directory (same as business listings)
  - Pros: Full control, no broken links
  - Cons: Storage management, file size limits
  
- **Option C**: No images in v1 (use default placeholders)
  - Pros: Fastest implementation
  - Cons: Less engaging UI

**Recommendation**: Option A (URL-based) for v1, add uploads in Phase 6.3

### 9.2 Search Index
**Question**: Should Resources and Events share a unified search index or remain separate?

**Options**:
- **Option A**: Separate searches (`/api/resources?search=...` and `/api/events?search=...`)
  - Pros: Simple, clear separation
  - Cons: Users must search each module separately
  
- **Option B**: Unified search endpoint (`/api/search?q=...&type=resources,events`)
  - Pros: Better UX, search across all content
  - Cons: More complex, already planned for Phase 6.2.4

**Recommendation**: Option A (separate) for Phase 6.2.3, unified search in Phase 6.2.4

### 9.3 Public Access
**Question**: Confirm whether public (unauthenticated) users can view Resources and Events, or if login is required.

**Options**:
- **Option A**: Public viewing (no auth required)
  - Pros: Better for SEO, wider reach, easier to share
  - Cons: No tracking of who views what
  
- **Option B**: Login required
  - Pros: User tracking, personalization
  - Cons: Friction, limits reach

**Recommendation**: Option A (public viewing) for browsing, login only required for RSVP

---

## 10. Success Criteria

### 10.1 Functional Requirements
- [ ] Resources module fully functional (5 API endpoints)
- [ ] Events module fully functional (7 API endpoints)
- [ ] RSVP system working with notification integration
- [ ] Hub tiles activated with live data
- [ ] Public viewing enabled (no auth required to browse)
- [ ] Admin CRUD operations working
- [ ] Seeding scripts populate initial data

### 10.2 Non-Functional Requirements
- [ ] API response time < 500ms
- [ ] Mobile responsive design
- [ ] Consistent with BANIBS "soft glass" aesthetic
- [ ] Zero breaking changes to existing features
- [ ] Documentation complete

### 10.3 User Experience
- [ ] Resources easy to browse and filter
- [ ] Events easy to find and RSVP
- [ ] Hub tiles provide useful preview
- [ ] RSVP notifications delivered instantly
- [ ] Clear messaging when event is full or past

---

## 11. Risk Assessment

### 11.1 Technical Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| RSVP race conditions (simultaneous RSVPs) | LOW | MEDIUM | MongoDB atomic operations |
| Event reminder job overload | LOW | LOW | Limit reminders to 24h window |
| Search performance on large datasets | MEDIUM | MEDIUM | Implement pagination, indexes |

### 11.2 UX Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Too many categories (overwhelming users) | LOW | LOW | Start with 6 core categories |
| RSVP spam (fake registrations) | MEDIUM | MEDIUM | Rate limiting, user validation |
| Outdated events clogging UI | MEDIUM | LOW | Auto-archive past events after 30 days |

---

## 12. Future Enhancements (Phase 6.3+)

### Resources Module
- [ ] User-submitted resources (with moderation queue)
- [ ] Resource ratings/reviews
- [ ] Bookmarking/saving resources
- [ ] Resource collections (curated playlists)
- [ ] Download tracking (for PDFs/documents)

### Events Module
- [ ] Calendar integration (Google Calendar, Outlook)
- [ ] Recurring events support
- [ ] Event check-in (QR codes)
- [ ] Post-event surveys/feedback
- [ ] Event recordings (for webinars)
- [ ] Group RSVP (register multiple attendees)

---

## 13. Conclusion

Phase 6.2.3 activates two critical Hub modules (Information & Resources, Events & Networking), providing BANIBS users with:
- **Centralized resource library** for business education and support
- **Community event calendar** with RSVP functionality
- **Notification integration** for event reminders
- **Hub dashboard preview** of top resources and upcoming events

**Dependencies**: Phase 6.2.1 (Notifications) ✅, Phase 6.2.2 (Messaging) ✅

**Deliverables**:
- 12 API endpoints (5 resources + 7 events)
- 2 frontend pages (/resources, /events)
- 2 MongoDB collections (banibs_resources, banibs_events)
- 30 seeded items (20 resources + 10 events)
- Comprehensive documentation

**Timeline**: 5 days (Week 3 of Phase 6.2)

---

**Document Status**: DRAFT - Awaiting Approval  
**Prepared By**: AI Engineer (Neo)  
**Date**: November 2, 2025  
**Version**: 1.0

---

**Next Steps**:
1. Review and approve scope document
2. Answer 3 questions (event images, search index, public access)
3. Begin implementation (Days 1-5)
4. Weekly check-in and demo
5. Generate completion report
