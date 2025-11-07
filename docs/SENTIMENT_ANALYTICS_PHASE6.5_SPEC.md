# Phase 6.5: Sentiment Analytics Panel
## Planning & Specification Document

**Date:** November 3, 2025  
**Phase:** 6.5 - Sentiment Analytics & Reporting  
**Status:** 📋 PLANNING - Awaiting Approval  
**Owner:** Raymond Neely  
**Developer:** Neo (Emergent AI Builder)

---

## 1. Executive Summary

Phase 6.5 builds on the sentiment analysis foundation (Phase 6.3) and moderation routing (Phase 6.4) by adding comprehensive analytics and reporting capabilities. Admins will be able to track sentiment trends over time, identify patterns by source/category/region, and export data for external analysis.

**Key Goals:**
- Aggregate sentiment data for historical analysis
- Visualize sentiment trends with charts
- Identify problematic sources or categories
- Export data for reporting and compliance
- Support data-driven content curation decisions

---

## 2. Data Aggregation Strategy

### 2.1 Aggregation Granularity

**Daily Aggregates** (Primary)
- One record per day per dimension
- Captures: avg sentiment, count by label, total items
- Use for: Recent trends (last 7-30 days)

**Weekly Aggregates** (Secondary)
- One record per week (Sunday-Saturday)
- Rolled up from daily data
- Use for: Medium-term trends (last 3-6 months)

**Monthly Aggregates** (Tertiary)
- One record per month
- Rolled up from daily data
- Use for: Long-term trends (yearly view)

### 2.2 Aggregation Dimensions

**By Time Period:**
- Date (YYYY-MM-DD)
- Week (YYYY-Wnn)
- Month (YYYY-MM)

**By Content Attributes:**
- Source (RSS feed name/URL)
- Category (Business, Politics, Culture, etc.)
- Region (Americas, Africa, Asia, Europe, Pacific)
- Content Type (news, resource)

**By Sentiment:**
- Positive count
- Neutral count
- Negative count
- Average sentiment score
- Min/max sentiment scores

---

## 3. Database Schema

### 3.1 Collection: `sentiment_analytics_daily`

```javascript
{
  "_id": ObjectId("..."),
  "id": "uuid",
  "date": "2025-11-03",                    // ISO date string
  "dimension": "overall",                   // "overall" | "source" | "category" | "region"
  "dimension_value": null,                  // null for overall, else source name/category/region
  "content_type": "news",                   // "news" | "resource" | "all"
  
  // Counts
  "total_items": 150,
  "positive_count": 20,
  "neutral_count": 100,
  "negative_count": 30,
  
  // Sentiment scores
  "avg_sentiment": -0.15,
  "min_sentiment": -0.85,
  "max_sentiment": 0.72,
  
  // Metadata
  "created_at": ISODate("2025-11-03T23:59:59Z"),
  "updated_at": ISODate("2025-11-03T23:59:59Z")
}
```

**Indexes:**
```javascript
{ "date": -1, "dimension": 1, "dimension_value": 1 }  // Query by date + dimension
{ "date": -1, "content_type": 1 }                     // Query by date + type
{ "dimension": 1, "dimension_value": 1 }              // Query by dimension
```

### 3.2 Collection: `sentiment_analytics_weekly`

Same schema as daily, but:
- `date` represents start of week (Sunday)
- `week` field: "2025-W44" format

### 3.3 Collection: `sentiment_analytics_monthly`

Same schema as daily, but:
- `date` represents first day of month
- `month` field: "2025-11" format

---

## 4. Data Pipeline

### 4.1 Aggregation Job

**Scheduled Task:**
- Runs daily at 00:30 UTC (after RSS sync settles)
- Aggregates previous day's sentiment data
- Updates/creates daily aggregates
- Rolls up to weekly/monthly if needed

**Process Flow:**
```
1. Get all news/resources with sentiment from previous day
2. Group by dimension (overall, source, category, region)
3. Calculate counts and averages
4. Upsert into sentiment_analytics_daily
5. If end of week, roll up to weekly
6. If end of month, roll up to monthly
```

**Pseudocode:**
```python
async def aggregate_sentiment_daily(target_date):
    # Get all items from target date
    items = await get_items_with_sentiment(target_date)
    
    # Aggregate overall
    await create_aggregate(
        date=target_date,
        dimension="overall",
        items=items
    )
    
    # Aggregate by source
    for source in unique_sources(items):
        source_items = filter_by_source(items, source)
        await create_aggregate(
            date=target_date,
            dimension="source",
            dimension_value=source,
            items=source_items
        )
    
    # Aggregate by category, region, etc.
    # ...
```

### 4.2 Backfill Strategy

**For Existing Data:**
- Run backfill script to aggregate historical data
- Process in batches (7 days at a time)
- Create daily aggregates first, then roll up

**Script:** `/app/backend/scripts/backfill_sentiment_analytics.py`

---

## 5. API Endpoints

### 5.1 Analytics API (Admin Only)

**Base:** `/api/admin/analytics/sentiment`

#### Endpoint 1: Overall Trends

**GET /api/admin/analytics/sentiment/trends**

Query params:
- `start_date` (optional): Start date (YYYY-MM-DD), default: 30 days ago
- `end_date` (optional): End date (YYYY-MM-DD), default: today
- `granularity` (optional): "daily" | "weekly" | "monthly", default: "daily"
- `content_type` (optional): "news" | "resource" | "all", default: "all"

Response:
```json
{
  "start_date": "2025-10-04",
  "end_date": "2025-11-03",
  "granularity": "daily",
  "data": [
    {
      "date": "2025-10-04",
      "total_items": 150,
      "positive_count": 20,
      "neutral_count": 100,
      "negative_count": 30,
      "avg_sentiment": -0.15
    },
    // ... more dates
  ]
}
```

---

#### Endpoint 2: By Source

**GET /api/admin/analytics/sentiment/by-source**

Query params:
- `start_date` (optional)
- `end_date` (optional)
- `limit` (optional): Top N sources, default: 10

Response:
```json
{
  "start_date": "2025-10-04",
  "end_date": "2025-11-03",
  "sources": [
    {
      "source": "CBC News",
      "total_items": 45,
      "positive_count": 5,
      "neutral_count": 30,
      "negative_count": 10,
      "avg_sentiment": -0.08
    },
    // ... more sources
  ]
}
```

---

#### Endpoint 3: By Category

**GET /api/admin/analytics/sentiment/by-category**

Query params:
- `start_date` (optional)
- `end_date` (optional)

Response:
```json
{
  "start_date": "2025-10-04",
  "end_date": "2025-11-03",
  "categories": [
    {
      "category": "Politics",
      "total_items": 60,
      "positive_count": 10,
      "neutral_count": 35,
      "negative_count": 15,
      "avg_sentiment": -0.12
    },
    // ... more categories
  ]
}
```

---

#### Endpoint 4: By Region

**GET /api/admin/analytics/sentiment/by-region**

Query params:
- `start_date` (optional)
- `end_date` (optional)

Response:
```json
{
  "start_date": "2025-10-04",
  "end_date": "2025-11-03",
  "regions": [
    {
      "region": "Americas",
      "total_items": 80,
      "positive_count": 15,
      "neutral_count": 50,
      "negative_count": 15,
      "avg_sentiment": -0.05
    },
    // ... more regions
  ]
}
```

---

#### Endpoint 5: Export CSV

**GET /api/admin/analytics/sentiment/export**

Query params:
- `start_date` (required)
- `end_date` (required)
- `dimension` (optional): "overall" | "source" | "category" | "region", default: "overall"
- `granularity` (optional): "daily" | "weekly" | "monthly", default: "daily"

Response:
- Content-Type: text/csv
- CSV file with columns: date, dimension_value, total_items, positive_count, neutral_count, negative_count, avg_sentiment

Example CSV:
```
date,dimension_value,total_items,positive_count,neutral_count,negative_count,avg_sentiment
2025-11-01,,150,20,100,30,-0.15
2025-11-02,,145,25,95,25,-0.10
```

---

#### Endpoint 6: Summary Stats

**GET /api/admin/analytics/sentiment/summary**

Query params:
- `period` (optional): "7d" | "30d" | "90d" | "1y", default: "30d"

Response:
```json
{
  "period": "30d",
  "total_items": 4500,
  "positive_count": 600,
  "neutral_count": 3000,
  "negative_count": 900,
  "avg_sentiment": -0.12,
  "positive_percentage": 13.3,
  "neutral_percentage": 66.7,
  "negative_percentage": 20.0,
  "most_negative_source": "Source XYZ",
  "most_positive_source": "Source ABC",
  "trend": "declining"  // "improving" | "stable" | "declining"
}
```

---

## 6. Admin UI Design

### 6.1 New Page: Sentiment Analytics

**Route:** `/admin/analytics/sentiment`

**Layout:**

```
┌─────────────────────────────────────────────────────────┐
│ BANIBS Admin - Sentiment Analytics                      │
│ [Opportunities] [Moderation] [Analytics]                │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Summary Stats (Last 30 Days)                            │
│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐           │
│ │Total   │ │Positive│ │Neutral │ │Negative│           │
│ │4,500   │ │600     │ │3,000   │ │900     │           │
│ │items   │ │(13.3%) │ │(66.7%) │ │(20.0%) │           │
│ └────────┘ └────────┘ └────────┘ └────────┘           │
│                                                          │
│ Avg Sentiment: -0.12  |  Trend: ↓ Declining           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Filters                                                  │
│ Date Range: [Last 30 Days ▼] or [Start] to [End]       │
│ Content Type: [All ▼] [News] [Resources]               │
│ Granularity: [Daily] [Weekly] [Monthly]                │
│ [Apply Filters] [Export CSV]                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Sentiment Trends Over Time                              │
│                                                          │
│  Chart: Line graph showing positive/neutral/negative    │
│         counts or percentages over time                 │
│         X-axis: Date, Y-axis: Count or %               │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Sentiment by Source (Top 10)                            │
│                                                          │
│  Chart: Horizontal bar chart showing sources            │
│         X-axis: Avg Sentiment, Y-axis: Source name     │
│         Color: Green (positive) to Red (negative)      │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Sentiment by Category                                    │
│                                                          │
│  Chart: Pie chart or bar chart showing distribution    │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ Sentiment by Region                                      │
│                                                          │
│  Chart: Bar chart showing regional sentiment           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 6.2 Chart Library

**Recommendation:** Use **Recharts** or **Chart.js**

**Recharts** (preferred):
- React-friendly
- Responsive
- Supports line, bar, pie, area charts
- Easy to style for BANIBS aesthetic
- NPM: `yarn add recharts`

**Chart.js** (alternative):
- More feature-rich
- Better for complex charts
- Requires react-chartjs-2 wrapper
- NPM: `yarn add chart.js react-chartjs-2`

### 6.3 UI Components

**File Structure:**
```
frontend/src/pages/Admin/
  └── SentimentAnalytics.js         (main page)
      └── components/
          ├── SummaryStats.js        (4 stat cards)
          ├── FilterPanel.js         (date range, filters)
          ├── TrendsChart.js         (line chart over time)
          ├── SourcesChart.js        (horizontal bar chart)
          ├── CategoriesChart.js     (pie or bar chart)
          └── RegionsChart.js        (bar chart)
```

---

## 7. Implementation Plan

### Phase 1: Backend (Day 1-2)

**Day 1:**
1. Create sentiment analytics models (daily/weekly/monthly)
2. Create database operations (CRUD, aggregation helpers)
3. Create aggregation service (daily aggregation logic)
4. Create backfill script
5. Test aggregation logic with sample data

**Day 2:**
6. Create admin analytics API endpoints (6 endpoints)
7. Implement CSV export functionality
8. Register routes in server.py
9. Run backend tests

### Phase 2: Data Backfill (Day 2-3)

10. Run backfill script for existing news/resources
11. Verify aggregates are correct
12. Create weekly/monthly aggregates

### Phase 3: Frontend (Day 3-4)

**Day 3:**
13. Install chart library (Recharts)
14. Create SentimentAnalytics.js main page
15. Create SummaryStats component
16. Create FilterPanel component
17. Wire up API calls

**Day 4:**
18. Create TrendsChart component (line chart)
19. Create SourcesChart component (horizontal bar)
20. Create CategoriesChart component
21. Create RegionsChart component
22. Add CSV export button

### Phase 4: Testing & Documentation (Day 5)

23. Backend testing (all endpoints)
24. Frontend testing (charts render, filters work, export works)
25. Update SENTIMENT_ANALYTICS_PHASE6.5.md
26. Capture screenshots
27. Update test_result.md

**Estimated Timeline:** 5 days

---

## 8. Technical Considerations

### 8.1 Performance

**Aggregation Job:**
- Run daily, not real-time
- Process 1 day at a time (manageable data size)
- Use indexes for fast queries
- Consider pagination for large exports

**API Performance:**
- Cache aggregates for common queries (30d, 7d)
- Use indexes on date ranges
- Limit max date range (e.g., 1 year)

### 8.2 Data Accuracy

**Handling Late Data:**
- If news items are added late (after daily aggregation), re-run aggregation for that date
- Add "updated_at" field to track when aggregate was last updated

**Handling Sentiment Updates:**
- If sentiment is recalculated (Phase 6.4 recalculate endpoint), re-run aggregation

**Backfill Strategy:**
- Backfill creates historical data from existing news/resources
- May have gaps if old data is missing sentiment

### 8.3 Chart Rendering

**Data Size:**
- Limit charts to reasonable data points (e.g., 90 days = 90 points)
- Use weekly/monthly granularity for longer periods
- Paginate tables if needed

**Responsiveness:**
- Charts should resize on mobile
- Consider hiding some charts on small screens
- Use horizontal scrolling for wide charts

---

## 9. CSV Export Format

### 9.1 Overall Trends Export

**Filename:** `sentiment_trends_YYYY-MM-DD_to_YYYY-MM-DD.csv`

**Columns:**
```
date,total_items,positive_count,neutral_count,negative_count,positive_pct,neutral_pct,negative_pct,avg_sentiment,min_sentiment,max_sentiment
2025-11-01,150,20,100,30,13.3,66.7,20.0,-0.15,-0.85,0.72
2025-11-02,145,25,95,25,17.2,65.5,17.2,-0.10,-0.80,0.75
```

### 9.2 By Source Export

**Filename:** `sentiment_by_source_YYYY-MM-DD_to_YYYY-MM-DD.csv`

**Columns:**
```
source,total_items,positive_count,neutral_count,negative_count,positive_pct,neutral_pct,negative_pct,avg_sentiment
CBC News,45,5,30,10,11.1,66.7,22.2,-0.08
BBC Africa,50,10,35,5,20.0,70.0,10.0,0.05
```

### 9.3 By Category Export

**Filename:** `sentiment_by_category_YYYY-MM-DD_to_YYYY-MM-DD.csv`

**Columns:** Same as by-source, but grouped by category

### 9.4 By Region Export

**Filename:** `sentiment_by_region_YYYY-MM-DD_to_YYYY-MM-DD.csv`

**Columns:** Same as by-source, but grouped by region

---

## 10. Feature Flags

**Add to `/app/backend/config/features.json`:**

```json
{
  "analytics": {
    "sentiment_enabled": true,
    "aggregation_job_enabled": true,
    "export_enabled": true,
    "max_export_days": 365
  }
}
```

**Purpose:**
- `sentiment_enabled`: Enable/disable analytics endpoints
- `aggregation_job_enabled`: Enable/disable daily aggregation job
- `export_enabled`: Enable/disable CSV exports (for performance)
- `max_export_days`: Limit export size to prevent abuse

---

## 11. Scheduled Task

**File:** `/app/backend/scheduler.py`

**Add job:**
```python
from tasks.sentiment_aggregation import run_daily_aggregation

scheduler.add_job(
    run_daily_aggregation,
    'cron',
    hour=0,
    minute=30,
    id='sentiment_daily_aggregation',
    replace_existing=True
)
```

**Runs:** Daily at 00:30 UTC (after RSS sync at 00:00 UTC)

---

## 12. Success Criteria

Phase 6.5 will be considered complete when:

- [x] Daily sentiment aggregates are created for all dimensions
- [x] Backfill script successfully aggregates existing data
- [x] All 6 admin API endpoints return correct data
- [x] CSV export generates valid files
- [x] Admin UI displays charts correctly
- [x] Filters update charts in real-time
- [x] Charts are responsive and match BANIBS aesthetic
- [x] Backend tests pass (100%)
- [x] Frontend tests pass (100%)
- [x] Documentation complete with screenshots

---

## 13. Future Enhancements (Phase 6.6+)

**Advanced Analytics:**
- Sentiment correlation analysis (does source X predict negative sentiment?)
- Anomaly detection (sudden spikes in negative sentiment)
- Predictive trends (forecast sentiment for next week)

**Alerting:**
- Email admins when negative sentiment spikes
- Slack/Discord webhooks for real-time alerts
- Threshold-based notifications

**User-Facing Analytics:**
- Public sentiment dashboard (anonymized)
- Sentiment filters on public news feed
- "Most positive stories" widget

**Machine Learning:**
- Sentiment clustering (identify topic themes)
- Auto-categorization based on sentiment patterns
- Source reliability scoring

---

## 14. Open Questions for Review

**Q1: Aggregation Granularity**
- Should we support hourly aggregates for real-time dashboards?
- Or is daily sufficient for admin reporting?

**Q2: Chart Types**
- Line chart for trends? (current plan)
- Stacked area chart to show composition over time?
- Both?

**Q3: Export Formats**
- CSV only, or also JSON/Excel?
- CSV is lightweight and widely supported
- Excel requires additional library

**Q4: Data Retention**
- How long should we keep daily aggregates?
- After 90 days, collapse to weekly only?
- After 1 year, collapse to monthly only?

**Q5: Sentiment Recalculation**
- If sentiment is recalculated (Phase 6.4 endpoint), should we automatically re-run aggregation?
- Or require manual re-aggregation?

---

## 15. Dependencies

**Backend:**
- Phase 6.3 (Sentiment Analysis) ✅
- Phase 6.4 (Moderation Routing) ✅

**Frontend:**
- Chart library (Recharts or Chart.js)
- Date picker library (react-datepicker or similar)

**Infrastructure:**
- Scheduled task runner (APScheduler) ✅
- MongoDB indexes for performance

---

## 16. Risk Assessment

**Low Risk:**
- Backend aggregation logic (straightforward SQL-like operations)
- API endpoints (similar to existing admin APIs)
- CSV export (simple format)

**Medium Risk:**
- Chart rendering performance with large datasets
- Frontend complexity (multiple charts, filters)
- Backfill speed (depends on data volume)

**High Risk:**
- None identified

**Mitigation:**
- Use pagination for large datasets
- Cache common queries (30d, 7d)
- Run backfill in batches
- Test with realistic data volumes

---

## 17. Approval Checklist

Before proceeding to implementation, confirm:

- [ ] Schema design approved
- [ ] API endpoints approved
- [ ] Chart types approved
- [ ] CSV export format approved
- [ ] UI layout approved
- [ ] Timeline acceptable (5 days)
- [ ] Feature flags acceptable
- [ ] Open questions answered

---

**Status:** 📋 PLANNING - Awaiting Raymond's Review & Approval

**Next Steps:**
1. Review this specification
2. Answer open questions
3. Approve schema, APIs, and UI design
4. Proceed to implementation

---

**Prepared by:** Neo (Emergent AI Builder)  
**Date:** November 3, 2025  
**For Review by:** Raymond Neely

---

**End of Planning Document**
