# BANIBS – Phase 6.2.4 Scope Definition
## Feed Filtering + Unified Search

**Date:** November 2, 2025  
**Phase:** 6.2.4 - Week 4 of Hub v2 Interactive Layer  
**Status:** SCOPE APPROVED - READY FOR IMPLEMENTATION  

---

## Executive Summary

Phase 6.2.4 completes the BANIBS Hub v2 Interactive Layer by adding two critical discovery features:

1. **Feed Filtering** - Allow users to filter the Hub Activity Feed by content type (News, Opportunities, Resources, Events, Business)
2. **Unified Search** - Enable cross-module search from the TopNav with grouped results on a dedicated search page

This phase transforms the Hub from a static aggregator into an intelligent discovery platform, giving users precise control over what content they see and the ability to find anything across the entire BANIBS ecosystem.

---

## Objectives

### Primary Goals
1. **Enhanced Content Discovery** - Users can quickly find relevant content across all BANIBS modules
2. **Personalized Feed Experience** - Users control what appears in their Activity Feed
3. **Unified Search Experience** - Single search bar searches everything (News, Opportunities, Resources, Events, Businesses)
4. **Mobile-First Design** - All features work seamlessly on mobile devices

### Success Metrics
- Users can filter feed in < 2 seconds
- Search returns results in < 3 seconds
- Zero empty search result pages (show "No results" per category instead)
- Mobile usability score > 90%

---

## Part 1: Feed Filtering (Hub Activity Feed)

### Overview
Add filtering controls to the existing Hub Activity Feed without redesigning the layout. Users should be able to focus on specific content types with a single click.

### Requirements

#### 1.1 Filter Bar UI
**Location:** Above the Activity Feed (left column on desktop, top on mobile)

**Filter Options:**
- **All** (default) - Show everything
- **News** - News articles only
- **Opportunities** - Jobs, grants, scholarships only
- **Resources** - Educational resources only
- **Events** - Upcoming and past events only
- **Business** - Business directory listings only

**Visual Design:**
- Horizontal pill buttons (similar to category filters on Resources/Events pages)
- Active filter highlighted with yellow background
- Inactive filters with gray background
- Mobile: Dropdown select for space efficiency

#### 1.2 Date Range Filter (Optional Enhancement)
**Options:**
- Today
- This Week (last 7 days)
- This Month (last 30 days)
- All Time (default)

**Behavior:**
- Appears to the right of content type filters on desktop
- Stacked below content filters on mobile
- Works in combination with content type filters

#### 1.3 Filter Behavior
- Default state: "All" + "All Time"
- On filter change:
  - Re-query backend with selected filters
  - Show loading spinner during fetch
  - Update feed content without page reload
  - Maintain scroll position if possible
- Filter state persists during session (not across page reloads)

#### 1.4 Mobile Responsiveness
- Desktop (≥768px): Horizontal pill buttons
- Mobile (<768px): Dropdown select for content type
- Both: Date filter always visible if enabled

### Backend Requirements

#### 1.5 Unified Feed Endpoint
**Endpoint:** `GET /api/feed`

**Query Parameters:**
- `type` (optional) - Content type filter: `news|opportunities|resources|events|business|all`
- `date_range` (optional) - Time filter: `today|week|month|all`
- `limit` (default: 20, max: 100)
- `page` (default: 1)

**Response Schema:**
```json
{
  "items": [
    {
      "id": "uuid",
      "type": "news|opportunity|resource|event|business",
      "title": "string",
      "summary": "string (max 200 chars)",
      "link": "/news/:id | /opportunities/:id | /resources/:id | /events/:id | /business/:id",
      "thumbnail": "url or fallback",
      "created_at": "ISO 8601",
      "metadata": {
        "category": "string (for news/opportunities)",
        "event_date": "ISO 8601 (for events)",
        "location": "string (for events/businesses)"
      }
    }
  ],
  "total": 0,
  "page": 1,
  "pages": 1
}
```

**Data Sources:**
- `news` → `news_items` collection
- `opportunities` → `opportunities` collection (status='approved')
- `resources` → `banibs_resources` collection
- `events` → `banibs_events` collection (status='upcoming')
- `business` → `business_listings` collection (status='approved')

**Aggregation Logic:**
1. Query each relevant collection based on `type` filter
2. Apply date range filter to `created_at` or `published_at` fields
3. Sort by `created_at` DESC (newest first)
4. Normalize into unified feed item schema
5. Return paginated results

**Performance Considerations:**
- Use MongoDB indexes on `created_at`, `type`, `status` fields
- Limit initial query to 20 items
- Cache feed results for 5 minutes per filter combination

---

## Part 2: Unified Search (TopNav Integration)

### Overview
Transform the existing TopNav search box into a functional cross-module search engine. Users can search once and see results from all BANIBS modules grouped by category.

### Requirements

#### 2.1 Search Bar (TopNav)
**Current State:** Placeholder search box in TopNav  
**New Behavior:**
- On form submit or Enter key:
  - Navigate to `/search?q={query}`
  - Show loading indicator during navigation
- Minimum query length: 2 characters
- Auto-trim whitespace
- No search if query is empty

#### 2.2 Search Results Page (`/search`)
**Route:** `/search?q={query}&page={page}`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Search Results for "{query}"           │
│  Found X results across Y categories    │
├─────────────────────────────────────────┤
│  📰 News (5)                            │
│  ├─ Result 1                            │
│  ├─ Result 2                            │
│  └─ View All News Results →            │
├─────────────────────────────────────────┤
│  💼 Opportunities (3)                    │
│  ├─ Result 1                            │
│  └─ View All Opportunities Results →   │
├─────────────────────────────────────────┤
│  📚 Resources (0)                        │
│  └─ No resources found for "{query}"   │
├─────────────────────────────────────────┤
│  📅 Events (2)                          │
│  └─ ...                                 │
├─────────────────────────────────────────┤
│  🏢 Businesses (1)                       │
│  └─ ...                                 │
└─────────────────────────────────────────┘
```

**Features:**
- Grouped results by category
- Show count per category in header
- Max 5 results per category on main page
- "View All" link to filtered view if more results exist
- Empty state per category (not blank page)
- Highlight search terms in results (bold)
- Click result to navigate to detail page

#### 2.3 Search Result Card
**Fields Displayed:**
- Icon (emoji based on type)
- Title (with search term highlighted)
- Summary/Description (truncated to 150 chars, with search term highlighted)
- Category/Type badge
- Date (for news/events)
- Thumbnail image (with fallback)

**Actions:**
- Click anywhere on card → Navigate to detail page
- Hover → Subtle highlight effect

#### 2.4 Advanced Search Filters (Future Phase)
**Not in 6.2.4, but document for Phase 6.3:**
- Filter by date range
- Filter by category within type
- Sort by relevance vs. date
- Save search queries

### Backend Requirements

#### 2.5 Unified Search Endpoint
**Endpoint:** `GET /api/search`

**Query Parameters:**
- `q` (required) - Search query string
- `type` (optional) - Limit to specific type: `news|opportunities|resources|events|business|all` (default: `all`)
- `limit` (default: 5 per category, max: 100 total)
- `page` (default: 1)

**Response Schema:**
```json
{
  "query": "string",
  "total_results": 0,
  "categories": {
    "news": {
      "count": 0,
      "items": [
        {
          "id": "uuid",
          "type": "news",
          "title": "string",
          "summary": "string",
          "thumbnail": "url",
          "category": "string",
          "published_at": "ISO 8601",
          "link": "/world-news/:id"
        }
      ],
      "has_more": false
    },
    "opportunities": {
      "count": 0,
      "items": [...],
      "has_more": false
    },
    "resources": {
      "count": 0,
      "items": [...],
      "has_more": false
    },
    "events": {
      "count": 0,
      "items": [...],
      "has_more": false
    },
    "businesses": {
      "count": 0,
      "items": [...],
      "has_more": false
    }
  }
}
```

**Search Algorithm (Phase 6.2.4 - Basic):**

For each module:
1. **Text Search Fields:**
   - News: `title`, `summary`, `category`
   - Opportunities: `title`, `description`, `type`, `tags`
   - Resources: `title`, `description`, `tags`, `category`
   - Events: `title`, `description`, `tags`, `category`, `location_name`
   - Businesses: `name`, `description`, `category`, `tags`, `city`, `state`

2. **Search Method:**
   - Use MongoDB `$regex` with case-insensitive flag
   - Match on any field (OR logic)
   - No stemming or fuzzy matching in Phase 6.2.4

3. **Ranking:**
   - Title match > Description match > Tag match
   - Exact phrase match > Word match
   - Newer content ranked higher (secondary sort)

4. **Optimization:**
   - Limit results per category to `limit` parameter
   - Use indexes on text fields
   - Parallel queries for each module (async)
   - Total query time should be < 3 seconds

**Phase 6.3 Enhancement (Document for Future):**
- Implement MongoDB Text Index for full-text search
- Add relevance scoring
- Add search suggestions/autocomplete
- Add search history for logged-in users

---

## Part 3: Permissions & Performance

### 3.1 Access Control

**Public Users (Not Logged In):**
- ✅ Can search all modules
- ✅ Can see approved/public content:
  - News: All published articles
  - Opportunities: status='approved'
  - Resources: All published resources
  - Events: All published events
  - Businesses: status='approved'
- ❌ Cannot see draft/pending content

**Authenticated Users (Logged In):**
- ✅ Everything public users can see
- ✅ Plus: Their own draft content (if applicable)
- ✅ Plus: RSVP status on events in search results

**Admin/Moderator:**
- ✅ Can see all content regardless of status
- ✅ Can search pending/rejected content

### 3.2 Performance Requirements

**Response Times:**
- Feed filtering: < 2 seconds
- Search query: < 3 seconds
- Page navigation: < 1 second

**Pagination:**
- Default limit: 20 items per page for feed
- Default limit: 5 items per category for search
- Max limit: 100 items (hard cap)

**Caching Strategy:**
- Feed results: Cache for 5 minutes per filter combination
- Search results: Cache for 2 minutes per query
- Invalidate cache on content updates

**Database Optimization:**
- Create indexes on:
  - `created_at`, `published_at` (for sorting)
  - `status` (for filtering approved content)
  - `title`, `description` (for text search)
  - `type`, `category` (for categorical filtering)

### 3.3 Error Handling

**Empty Results:**
- Never show a completely blank page
- Show "No results found" message per category
- Suggest alternative search terms or browsing by category

**Invalid Queries:**
- Query too short (< 2 chars): Show warning "Please enter at least 2 characters"
- Special characters: Sanitize but allow (for searching phrases like "K-12" or "501(c)(3)")
- SQL injection prevention: Use parameterized queries

**API Errors:**
- Timeout: Show "Search is taking too long, please try again"
- Server error: Show "Unable to complete search, please try again"
- Network error: Show "Connection lost, please check your internet"

---

## Implementation Plan

### Day 1: Backend - Feed & Search Endpoints (4-6 hours)
1. Create `/api/feed` endpoint with type and date filtering
2. Create `/api/search` endpoint with cross-module search
3. Test with curl and document in API reference
4. Register routes in server.py
5. Add to test_result.md for backend testing

### Day 2: Frontend - Feed Filtering (3-4 hours)
1. Add filter bar component to Hub Activity Feed
2. Wire up filter state and API calls
3. Update ActivityFeed component to use `/api/feed` endpoint
4. Add loading states and error handling
5. Test on mobile (responsive behavior)

### Day 3: Frontend - Search Page (4-5 hours)
1. Create `/search` page component
2. Create SearchResults component with grouped display
3. Wire up TopNav search box to navigate to `/search`
4. Add highlighting for search terms
5. Add "View All" links for each category
6. Register route in App.js

### Day 4: Testing & Refinement (2-3 hours)
1. Backend testing via deep_testing_backend_v2
2. Frontend E2E testing (search flow, filter flow)
3. Mobile responsive testing
4. Performance testing (query times)
5. Fix any bugs found

### Day 5: Documentation & Sign-Off (1-2 hours)
1. Update `/app/docs/HUB_V2_PHASE6.2.4_REPORT.md` with screenshots
2. Update `/app/test_result.md` with test results
3. Create demo video or GIF of features
4. Present to stakeholder for sign-off

**Total Estimated Time:** 14-20 hours (2-3 days of focused work)

---

## Technical Specifications

### New Backend Files
- `/app/backend/routes/feed.py` - Unified feed endpoint
- `/app/backend/routes/search.py` - Unified search endpoint
- `/app/backend/db/feed.py` - Feed aggregation logic (optional helper)
- `/app/backend/db/search.py` - Search aggregation logic (optional helper)

### New Frontend Files
- `/app/frontend/src/pages/Search/SearchPage.js` - Main search results page
- `/app/frontend/src/components/Search/SearchResultCard.js` - Individual result card
- `/app/frontend/src/components/Search/SearchResultGroup.js` - Category group component
- `/app/frontend/src/components/Hub/FeedFilterBar.js` - Filter controls for Hub feed

### Modified Files
- `/app/frontend/src/pages/Hub/ActivityFeed.js` - Update to use `/api/feed` with filters
- `/app/frontend/src/pages/Hub/TopNav.js` - Wire up search form submission
- `/app/frontend/src/App.js` - Register `/search` route
- `/app/backend/server.py` - Register feed and search routers

---

## Design Specifications

### Filter Bar Styling (Hub)
```css
- Background: bg-gray-900/50 backdrop-blur-sm
- Border: border border-gray-800
- Pills: 
  - Active: bg-yellow-500 text-black
  - Inactive: bg-gray-800 text-gray-300 hover:bg-gray-700
- Mobile dropdown: Full width, same styling as category filters on Resources page
```

### Search Results Page Styling
```css
- Header: Large title, subtitle with result count
- Category Sections: 
  - Header with icon + count
  - Border-bottom separator
  - Margin between sections
- Result Cards:
  - Similar to Resources/Events cards
  - Hover effect with yellow border
  - Click to navigate
- Empty State:
  - Gray text
  - Friendly message
  - No sad emojis (keep professional)
```

---

## Open Questions (Pre-Implementation)

### Question 1: Search Result Ordering
**Should "News" always appear first in search results, or should we sort categories by number of results (most results first)?**

Options:
- A) Fixed order: News → Opportunities → Resources → Events → Businesses
- B) Dynamic order: Sort by count (category with most results first)
- C) Hybrid: Always show all 5 categories, but sort by count within each

**Recommendation:** Option A (Fixed order) for consistency and predictability. Users will learn where to look for specific content types.

### Question 2: Business Directory in Search
**Should business directory results show phone/email in the search result card, or only on the detail page?**

Options:
- A) Show phone + email in search results (more info, but cluttered)
- B) Show location only in search results (cleaner, privacy-conscious)
- C) Show phone only (compromise)

**Recommendation:** Option B (Location only). Business detail pages should be the primary place for contact info. Search results should tease, detail pages should complete.

### Question 3: Public Access to Search
**Should unauthenticated users see events and resources in search results?**

Options:
- A) Yes - All public content is searchable (recommended)
- B) No - Require login to search events/resources
- C) Limited - Show titles only, require login for details

**Recommendation:** Option A (Full public access). Events and resources are community-focused and should be discoverable by everyone. Authentication should only be required for RSVP/interaction, not viewing.

---

## Success Criteria

### Phase 6.2.4 is complete when:
1. ✅ Feed filtering works on Hub with all 6 content types
2. ✅ Date range filter works (if implemented)
3. ✅ Search bar in TopNav navigates to `/search` page
4. ✅ Search page shows grouped results from all 5 modules
5. ✅ Empty states display per category (not blank page)
6. ✅ Mobile responsive design verified
7. ✅ Backend endpoints tested (100% pass rate)
8. ✅ Performance targets met (< 3s search, < 2s filter)
9. ✅ Documentation complete with screenshots
10. ✅ Stakeholder sign-off received

---

## Future Enhancements (Phase 6.3+)

**Not in Phase 6.2.4, but document for future:**

1. **Advanced Search:**
   - Boolean operators (AND, OR, NOT)
   - Phrase search ("exact match")
   - Field-specific search (title:keyword)

2. **Search Index:**
   - MongoDB Atlas Search or Elasticsearch
   - Full-text search with stemming
   - Fuzzy matching for typos
   - Autocomplete suggestions

3. **Personalization:**
   - Search history for logged-in users
   - Saved searches
   - Recommended content based on search patterns

4. **Analytics:**
   - Track popular search queries
   - Track zero-result searches (for content gaps)
   - A/B test result ordering

5. **Export:**
   - Export search results to CSV
   - Share search results via link
   - Email search results

---

## Risks & Mitigations

### Risk 1: Search Performance
**Risk:** Cross-module search may be slow with large datasets  
**Mitigation:** 
- Implement pagination (max 5 per category on main page)
- Use database indexes
- Cache results for 2 minutes
- Set hard timeout of 5 seconds per module query

### Risk 2: Empty Search Results
**Risk:** Users may get frustrated with no results  
**Mitigation:**
- Always show all 5 categories even if empty
- Provide helpful empty state messages
- Suggest browsing by category
- Consider "Did you mean...?" suggestions in Phase 6.3

### Risk 3: Mobile Filter UX
**Risk:** Filter pills may not fit well on small screens  
**Mitigation:**
- Use dropdown select on mobile (< 768px)
- Test on real devices (iPhone SE, Pixel 5)
- Ensure touch targets are at least 44x44px

### Risk 4: Search Query Abuse
**Risk:** Users may spam search endpoint  
**Mitigation:**
- Implement rate limiting (max 30 searches per minute per IP)
- Require min 2 characters
- Sanitize inputs
- Monitor for abuse patterns

---

## Conclusion

Phase 6.2.4 completes the BANIBS Hub v2 Interactive Layer by adding intelligent content discovery through feed filtering and unified search. These features transform the Hub from a static dashboard into a dynamic, user-controlled discovery platform.

Upon completion of Phase 6.2.4, users will have:
- ✅ Personalized control over their Activity Feed
- ✅ Cross-module search capabilities
- ✅ Mobile-optimized discovery tools
- ✅ Seamless navigation across all BANIBS content

**Next Phase:** Phase 6.3 - AI-Powered Enhancements (Sentiment Analysis, Smart Recommendations, Content Curation)

---

**Document Version:** 1.0  
**Last Updated:** November 2, 2025  
**Author:** BANIBS Development Team  
**Approved By:** Pending Raymond E. Neely Jr. approval
