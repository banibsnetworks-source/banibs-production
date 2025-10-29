---
Phase: 5
Module: News System + RSS Aggregation
Version: 1.0
Date: 2025-10-28
Maintainer: BANIBS Core Team
Status: ✅ Production-Ready
---

# ✅ BANIBS News System — Foundation for Phase 6

BANIBS has moved from placeholder data to a **living, data-driven publication platform**.  
The News system now combines curated editorial content (featured stories) with automated RSS aggregation from trusted external media sources.

---

## 1. Overview

**Core pipeline:**  
`External Sources → RSS Parser → Database → /api/news/latest → Frontend`

**Two content types:**
- **Editorial (internal)** — manually created or seeded news; can be featured.
- **Aggregated (external)** — automatically pulled from RSS feeds; always attributed.

Both feed the same `news_items` table and are served through identical APIs.

---

## 2. Featured Story (Editorial Control)

**Endpoint:** `GET /api/news/featured`  
Returns the most recent record with `isFeatured = true`.

**Frontend:** `/components/FeaturedStory.js`  
- Fetches dynamically at load.  
- Falls back to static copy if none exist.  
- Displays title, summary, category, formatted date, and image.

**Admin endpoints:**

```
GET /api/news/admin/all
PATCH /api/news/admin/:id/feature
DELETE /api/news/admin/:id
```

Feature any story instantly or remove content without DB edits.

---

## 3. Consistent Date Formatting

**Utility:** `/frontend/src/utils/dateUtils.js`
```js
export function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}
export function formatRelativeDate(iso) {
  const diff = (Date.now() - new Date(iso)) / (1000 * 60 * 60 * 24);
  return diff < 1 ? "Today" : `${Math.round(diff)} days ago`;
}
```

Used across Featured Story, Latest Stories, and any future article pages.

---

## 4. BANIBS Identity Layer (Navigation)

**Component:** `/frontend/src/components/QuickLinks.js`

Dark glass navigation bar with gold accents displaying BANIBS's six-pillar structure:

**Social | Business | Information | Education | Youth | Opportunities | Resources**

Rendered directly under the hero/header and verified by
`scripts/check_identity_layer.js`.

**Verification:**

```bash
cd app/frontend
yarn verify:identity
```

**Brand Contract:** see `/docs/BANIBS_IDENTITY_CONTRACT.md`.

---

## 5. RSS Aggregation (Automated Ingestion)

BANIBS now ingests real news from 15 reputable RSS feeds representing
Black-owned, Indigenous, educational, business, and tech communities.

### Active Sources
| Category | Source |
|----------|--------|
| Business | Black Enterprise, Forbes Entrepreneurs, MBDA |
| Community | The Root, Essence, NAACP, NPR Code Switch, Indian Country Today, Native News Online |
| Education | Education Week, UNCF News |
| Opportunities | Grants.gov, USA.gov Benefits & Grants |
| Technology | AfroTech, TechCrunch Startups |

**Configuration file:** `/app/backend/config/rss_sources.py`  
All feeds defined here — single source of truth.

---

## 6. Backend Architecture

### NewsItem Model
| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Article title |
| summary | Text | Trimmed, sanitized summary |
| category | String | One of defined categories |
| imageUrl | Text | Optional thumbnail |
| publishedAt | DateTime | Original article date |
| createdAt | DateTime | When BANIBS stored it |
| sourceUrl | Text | External "Read More →" link |
| sourceName | String | RSS feed name |
| isFeatured | Boolean | For manual editorials |
| external | Boolean | True for RSS items |
| fingerprint | String | SHA-256 hash of sourceName + title for dedupe |

---

## 7. RSS Parser + Sync

### `/app/backend/utils/rss_parser.py`

Parses RSS feeds via `feedparser`:

- Extracts title, link, summary, image, and published date.
- Normalizes all data to BANIBS schema.

### `/app/backend/tasks/rss_sync.py`

Main orchestration logic:

- Iterates all feeds from `rss_sources.py`.
- Generates fingerprint for each entry.
- Inserts only new items (dedupe).
- Returns per-source statistics.

**Manual endpoint:**

```bash
POST /api/news/rss-sync
```

**Example response:**

```json
{
  "ranAt": "2025-10-28T19:00:00Z",
  "results": [
    {"source": "Black Enterprise", "inserted": 1, "skipped": 9},
    {"source": "TechCrunch Startups", "inserted": 2, "skipped": 8},
    {"source": "Essence", "inserted": 1, "skipped": 7}
  ]
}
```

---

## 8. Scheduler (Automatic Refresh)

### Internal Option (APScheduler)
```python
from app.backend.scheduler import init_scheduler
@app.on_event("startup")
def startup_event():
    init_scheduler()
```

Runs every 6 hours.

### External Option (cron)
```bash
0 */6 * * * curl -X POST http://localhost:8001/api/news/rss-sync \
  > /var/log/banibs_rss_sync.log 2>&1
```

Either option keeps content fresh without manual triggers.

---

## 9. Verification & Testing

**Manual Sync:**

```bash
curl -X POST http://localhost:8001/api/news/rss-sync
```

**Check latest:**

```bash
curl http://localhost:8001/api/news/latest | jq '.[0:5]'
```

**Expected:**

- TechCrunch, Essence, Black Enterprise articles visible.
- "Read More →" links open external sites.

**Identity Check:**

```bash
yarn verify:identity
```

All checks must pass before deployment.

---

## 10. Deployment Safety

- `/api/news/seed-dev` protected by `APP_ENV` check.
- `/api/news/rss-sync` restricted to admin or internal cron.
- Dedupe prevents duplicates across syncs.
- Verification scripts prevent loss of identity navigation.

---

## 11. Future Enhancements
| Feature | Description |
|---------|-------------|
| Admin RSS Dashboard | View source health, sync history, trigger specific sources |
| AI Categorization | Auto-refine categories using article text |
| Image Proxying | Cache thumbnails locally for speed |
| Editorial Merge | Allow manual edits to RSS items before publishing |
| External Indicator | UI badge "via TechCrunch" for external items |

---

## 12. Current Status
| Component | Status |
|-----------|--------|
| News model (enhanced) | ✅ |
| Featured Story endpoint | ✅ |
| Admin moderation routes | ✅ |
| RSS parser / dedupe | ✅ |
| 15 live RSS feeds | ✅ |
| Cron / scheduler ready | ✅ |
| Identity layer navigation | ✅ |
| Verification scripts | ✅ |

### Result

BANIBS now operates as a **hybrid editorial + aggregator platform**, automatically pulling real-time stories from across the diaspora, while maintaining manual editorial control and strict brand identity.

**Pipeline:**
```
RSS Feeds → Parser → DB → API Endpoints → Frontend Cards
```

**Outcome:**
The BANIBS front page now feels **alive** — a constant, trustworthy reflection of business, community, and innovation across Black and Indigenous voices.

**Status:** ✅ Phase 5 Complete — Ready for Phase 6 Integration

---

## 14. Image Pipeline Contract (CDN + Health Logging)

As of 2025-10-29, BANIBS is required to:

1. **Ingest RSS content every 6 hours** via automated scheduler
2. **Mirror and optimize all story images** to `cdn.banibs.com/news` (max width 1280px, ~85% JPEG/WebP quality)
3. **Replace all story `imageUrl` values** with CDN-hosted versions for faster, reliable loading
4. **Generate a health report after each sync** with:
   - Total stories and image coverage percentages
   - CDN compliance (% of images served from `cdn.banibs.com/news`)
   - Average file size per source
   - Oversized asset alerts (>2MB after optimization)
   - Missing image detection (MUST be 0)

**Pipeline Workflow:**
```
RSS Sync → Image Mirror/Optimize → Health Report → Log
```

**Health Report Location:** `/var/log/banibs_rss_health.log`

**Manual Pipeline Trigger:** `POST /api/news/rss-sync`

This pipeline is **not cosmetic**. It is part of BANIBS uptime and brand integrity.
Removing or bypassing any step (ingest, mirror, optimize, report) is considered a production regression.

**Verification Scripts:**
- Image coverage: `python backend/scripts/test_images.py`
- Health monitoring: `python backend/scripts/rss_health_report.py`

---

## 15. BANIBS TV / Featured Video Contract

The homepage MUST include a BANIBS TV / Featured Video section that:

1. **Surfaces a manually featured video** (FeaturedMedia.isFeatured = true), OR
2. **Falls back to the latest video with a thumbnail**, OR  
3. **Falls back to a branded BANIBS TV block** with static thumbnail and internal CTA

**Requirements:**
- The `/api/media/featured` endpoint MUST always return a usable object (title, description, thumbnailUrl, videoUrl)
- The Featured Video component MUST always display a thumbnail area, either real or branded
- All thumbnails MUST be mirrored and optimized to `cdn.banibs.com` via the same pipeline as news images
- The homepage MUST render this block under the Featured Story section

**Fallback Thumbnails by Category:**
- Youth: `https://cdn.banibs.com/fallback/youth_video.jpg`
- Grants/Opportunities: `https://cdn.banibs.com/fallback/opportunities_video.jpg`  
- Business: `https://cdn.banibs.com/fallback/business_video.jpg`
- Education: `https://cdn.banibs.com/fallback/education_video.jpg`
- Community: `https://cdn.banibs.com/fallback/community_video.jpg`
- Default: `https://cdn.banibs.com/fallback/video_default.jpg`

**Admin Endpoints:**
- `GET /api/media/admin/all` - View all video content
- `POST /api/media/admin/create` - Create new video feature
- `PATCH /api/media/admin/{id}/feature` - Set as featured
- `DELETE /api/media/admin/{id}` - Remove video content

This block is **not cosmetic**. It is part of BANIBS' voice layer and identity as a network, not just a feed.

---

## 16. World News + Regional Filtering Contract

As of Phase 6.0, BANIBS ingests global news from CNN, BBC, Reuters, Al Jazeera, The Guardian, Bloomberg, Euronews, AP, and others with **advanced regional filtering**.

**Rules:**

1. **All global sources are tagged with:**
   - category: "World News"  
   - region: one of ["Global", "Africa", "Americas", "Europe", "Asia", "Middle East"]

2. **The NewsItem model MUST include a `region` field.**

3. **The RSS ingest job MUST write `region` for every story** based on `rss_sources.py` metadata.

4. **The API endpoint** `/api/news/category/{category_slug}` MUST support optional `?region=` filtering and return only matching rows.

5. **The front-end `/world-news` page MUST:**
   - Render stories from "World News" 
   - Allow region filtering through UI pills (🌐 Global, 🌍 Africa, 🌎 Americas, 🌍 Europe, 🌏 Asia, 🕌 Middle East)
   - Show both sourceName (credibility) and region (geopolitical framing) 
   - Always display an image panel, using mirrored thumbnails or BANIBS-branded fallback
   - Update header dynamically based on selected region

6. **World News MUST appear in the main homepage navigation / identity layer.**

**Current Regional Coverage:**
- **Global**: CNN, BBC, Reuters, Guardian, AP (15+ sources)
- **Middle East**: Al Jazeera English (5+ sources) 
- **Americas**: Bloomberg World (5+ sources)
- **Europe**: Euronews International
- **Africa**: Future expansion planned
- **Asia**: Future expansion planned

**API Examples:**
- `GET /api/news/category/world-news` → All world news
- `GET /api/news/category/world-news?region=Africa` → Africa-focused stories only
- `GET /api/news/category/world-news?region=Global` → CNN, BBC, Reuters content

Removing World News, removing region filters, or removing source attribution is considered a **regression of Phase 6.0 functionality**.

**BANIBS now operates with the same regional filtering sophistication as major news networks - users can explore Africa, Europe, Middle East, Americas coverage with one click.**
