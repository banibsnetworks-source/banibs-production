# BANIBS News V2.0 Category System
**Implementation Date**: December 2, 2025
**Status**: ✅ Complete & Integrated

## Overview
The BANIBS News module has been upgraded to the V2.0 category system with 86 curated RSS sources organized into 10 audience-focused categories for better content discovery and diaspora engagement.

---

## V2.0 Category System

### Categories (10 Total)
1. **Global Diaspora** (14 sources)
2. **Africa Watch** (11 sources)
3. **Caribbean Watch** (10 sources)
4. **Culture / Civil Rights** (9 sources)
5. **Business & Finance** (8 sources)
6. **Entertainment** (8 sources)
7. **Health & Wellness** (7 sources)
8. **Sports** (8 sources)
9. **Science & Tech** (7 sources)
10. **Rights & Justice** (4 sources)

**Total**: 86 sources | **Active**: 84 sources | **Inactive**: 2 sources

---

## Source Breakdown

### 1. Global Diaspora (14 sources)
**Focus**: International news relevant to Black diaspora communities worldwide

**Sources**:
- Reuters World ⭐ (Priority 1)
- BBC World ⭐ (Priority 1)
- AP World News ⭐ (Priority 1)
- Al Jazeera World ⭐ (Priority 1)
- Voice of America (Priority 2)
- NPR World ⭐ (Priority 1)
- Deutsche Welle (Priority 2)
- News Americas Now (Priority 2)
- Africa Times (Priority 2)
- Face2Face Africa ⭐ (Priority 2)
- Black Enterprise (Global) ⭐ (Priority 1)
- Global Voices (Priority 2)
- The Root (World) ❌ INACTIVE (403 Forbidden)
- OkayAfrica ⭐ (Priority 2)

⭐ = Featured source with high-quality images

---

### 2. Africa Watch (11 sources)
**Focus**: News from African nations and continental developments

**Sources**:
- AllAfrica ⭐ (Priority 1)
- Guardian Nigeria (Priority 1)
- Punch Nigeria (Priority 1)
- Daily Trust (Priority 2)
- Vanguard Nigeria (Priority 1)
- ModernGhana (Priority 2)
- The Africa Report ⭐ (Priority 1)
- Business Daily Africa (Priority 2)
- SABC News (Priority 1)
- Mail & Guardian (Priority 1)
- Daily Nation (Kenya) (Priority 1)

---

### 3. Caribbean Watch (10 sources)
**Focus**: News from Caribbean nations and territories

**Sources**:
- Caribbean Journal ⭐ (Priority 1)
- Loop News Caribbean (Priority 1)
- Jamaica Gleaner (Priority 1)
- Jamaica Observer (Priority 1)
- Trinidad Express (Priority 1)
- Barbados Today (Priority 2)
- Haiti Libre (Priority 2)
- St. Lucia Times (Priority 2)
- Bahamas Press (Priority 2)
- Caribbean National Weekly (Priority 2)

---

### 4. Culture / Civil Rights (9 sources)
**Focus**: Black culture, civil rights movements, and social justice

**Sources**:
- The Root ❌ INACTIVE (403 Forbidden)
- Blavity ⭐ (Priority 1)
- Essence ⭐ (Priority 1)
- BET (Priority 1)
- Atlanta Black Star ⭐ (Priority 1)
- The Grio ⭐ (Priority 1)
- Revolt (Priority 2)
- NPR Race & Culture (Priority 1)
- NAACP News (Priority 1)

---

### 5. Business & Finance (8 sources)
**Focus**: Business news, entrepreneurship, and financial markets

**Sources**:
- Black Enterprise ⭐ (Priority 1)
- Forbes ⭐ (Priority 1)
- Reuters Business ⭐ (Priority 1)
- CNBC (Priority 1)
- Bloomberg (Priority 1)
- Financial Times (Priority 1)
- SBA Small Business (Priority 2)
- MarketWatch (Priority 1)

---

### 6. Entertainment (8 sources)
**Focus**: Music, movies, TV, celebrity news, and pop culture

**Sources**:
- Essence Entertainment ⭐ (Priority 1)
- The Shade Room ⭐ (Priority 1)
- Complex (Priority 1)
- Rolling Out ⭐ (Priority 1)
- Billboard ⭐ (Priority 1)
- Variety ⭐ (Priority 1)
- Hollywood Reporter ⭐ (Priority 1)
- Ebony ⭐ (Priority 1)

---

### 7. Health & Wellness (7 sources)
**Focus**: Health news, wellness, medical research, and public health

**Sources**:
- CDC (Priority 1)
- WHO (Priority 1)
- Healthline (Priority 2)
- Medical News Today (Priority 2)
- NPR Health (Priority 1)
- Reuters Health (Priority 1)
- Johns Hopkins (Priority 1)

---

### 8. Sports (8 sources)
**Focus**: Sports news, athletics, and sporting events

**Sources**:
- ESPN ⭐ (Priority 1)
- Bleacher Report (Priority 1)
- Africa Sports Network (Priority 2)
- Caribbean Sports News (Priority 2)
- NCAA (Priority 2)
- NBA (Priority 1)
- NFL (Priority 1)
- ESPN Africa (Priority 2)

---

### 9. Science & Tech (7 sources)
**Focus**: Technology, innovation, science, and research

**Sources**:
- TechCrunch ⭐ (Priority 1)
- Wired ⭐ (Priority 1)
- Ars Technica (Priority 1)
- MIT News (Priority 1)
- Science Daily (Priority 1)
- Reuters Tech (Priority 1)
- BBC Tech (Priority 1)

---

### 10. Rights & Justice (4 sources)
**Focus**: Human rights, civil liberties, and justice advocacy

**Sources**:
- NAACP (Priority 1)
- ACLU (Priority 1)
- Amnesty International (Priority 1)
- UN Human Rights News (Priority 1)

---

## Implementation Details

### Files Modified
1. **`/app/backend/config/rss_sources.py`** (REPLACED)
   - Old file backed up to `rss_sources_old_v1.py`
   - New V2.0 system with 86 sources
   - Added priority field (1-5)
   - Updated schema documentation

### New Fields in RSS Schema
```python
{
    "id": "unique_snake_case_identifier",
    "category": "BANIBS V2 Category",  # NEW: Replaced old category system
    "source_name": "Display Name",
    "rss_url": "https://...",
    "language": "en",
    "active": True,
    "featured_source": True,  # Optional: High-quality images
    "priority": 1,  # NEW: 1-5 priority level (1=highest)
}
```

### Removed Fields
- **`region`**: Replaced by category-based organization
  - Old: Geographic regions (Global, Africa, Asia, Europe, etc.)
  - New: Content-focused categories

### Helper Functions
Added utility functions to `/app/backend/config/rss_sources.py`:
```python
get_sources_by_category(category)  # Get sources for a specific category
get_active_sources()               # Get all active sources
get_categories()                   # Get list of all categories
get_stats()                        # Get statistics
```

---

## Priority System

### Priority Levels
- **Priority 1** (Highest): Major news outlets, featured sources
- **Priority 2** (Standard): Regional and specialized sources

### Usage
The priority field can be used for:
- Feed polling frequency (P1 sources checked more often)
- Content ranking/sorting
- Featured story selection
- Homepage prominence

---

## Integration Status

### ✅ Integrated Components
1. **RSS Sync Task** (`/app/backend/tasks/rss_sync.py`)
   - ✅ Compatible with new schema
   - ✅ Uses `source["category"]` field
   - ✅ Filters active sources

2. **News Routes** (`/app/backend/routes/news.py`)
   - ✅ Imports RSS_SOURCES
   - ✅ Compatible

3. **Scheduler** (`/app/backend/scheduler.py`)
   - ✅ Uses RSS_SOURCES
   - ✅ No changes needed

4. **Scripts**
   - ✅ `migrate_entertainment_lifestyle.py`
   - ✅ `update_news_regions.py`
   - ✅ `validate_rss_schema.py`

---

## Frontend Impact

### Category Display
The frontend will need updates to display the new categories:

**Old Categories** (V1):
- World
- Business
- Community
- Education
- Technology
- Opportunities

**New Categories** (V2):
- Global Diaspora
- Africa Watch
- Caribbean Watch
- Culture / Civil Rights
- Business & Finance
- Entertainment
- Health & Wellness
- Sports
- Science & Tech
- Rights & Justice

### Recommended UI Changes
1. **Navigation**: Update news section tabs/filters
2. **Homepage**: Feature stories from different categories
3. **Category Pages**: Create dedicated pages for each category
4. **Icons**: Assign category-specific icons

---

## RSS Feed Health

### Active vs Inactive
- **Active**: 84 sources (97.7%)
- **Inactive**: 2 sources (2.3%)
  - The Root (403 Forbidden) - in Global Diaspora & Culture
  - (Same feed counted twice across categories)

### Known Issues
- **The Root**: Returns 403 Forbidden (blocked or requires authentication)
  - Marked as `active: False`
  - Can be re-enabled if access is restored

---

## Testing

### Verify Integration
```bash
# Test the new sources file
cd /app/backend
python3 config/rss_sources.py

# Expected output:
# BANIBS RSS Sources V2.0
# Total Sources: 86
# Active Sources: 84
# Inactive Sources: 2
# Categories: 10
```

### Test RSS Sync
```bash
# Trigger RSS sync (admin endpoint)
curl -X POST http://localhost:8001/api/news/rss-sync

# Check results in database
# Should see news items with new category names
```

### Query by Category
```python
from config.rss_sources import get_sources_by_category

# Get all Africa Watch sources
africa_sources = get_sources_by_category("Africa Watch")
print(f"Found {len(africa_sources)} Africa Watch sources")
```

---

## Migration Notes

### Data Migration
- Existing news items have old category names (World, Business, etc.)
- New items will use V2 category names
- **Action Required**: Run migration script to update existing items (optional)

### Backward Compatibility
- Old code referencing `region` field will still work (field returns None)
- New code should use `category` field
- Import statement unchanged: `from config.rss_sources import RSS_SOURCES`

---

## Future Enhancements

### Planned Features
1. **Dynamic Priority**: Auto-adjust priority based on engagement
2. **Regional Filters**: Add back regional filtering within categories
3. **Language Support**: Expand to French, Spanish, Portuguese sources
4. **Custom Feeds**: Allow users to customize category preferences
5. **AI Curation**: Use AI to recommend stories based on category interests

### Additional Sources
Consider adding:
- More Caribbean regional sources
- Latin American Black diaspora sources
- UK Black media (Voice Newspaper, etc.)
- African language sources with translation

---

## Monitoring

### Health Checks
The RSS health check system will continue monitoring:
- Feed availability (HTTP status codes)
- Parse success rates
- Item freshness
- Image quality

### Metrics to Track
- Items per category
- Source reliability scores
- User engagement by category
- Featured source performance

---

## Rollback Plan

If issues arise:
```bash
# Restore old sources
cd /app/backend/config
mv rss_sources.py rss_sources_v2_backup.py
mv rss_sources_old_v1.py rss_sources.py

# Restart backend
sudo supervisorctl restart backend
```

---

## Documentation Files

**Created**:
- `/app/docs/NEWS_V2_CATEGORY_SYSTEM.md` (this file)

**Backup**:
- `/app/backend/config/rss_sources_old_v1.py` (original)
- `/app/backend/config/rss_sources_backup_YYYYMMDD.py` (dated backup)

---

## Summary

✅ **Complete**: 86 RSS sources integrated
✅ **Categories**: 10 audience-focused categories
✅ **Active**: 84 sources (2 temporarily inactive)
✅ **Tested**: All imports and integrations verified
✅ **Compatible**: Existing code continues to work
✅ **Priority System**: Added for better content curation

**Status**: Production ready - all changes are backward compatible and have been tested.

---

**Contact**: For questions or issues, refer to the RSS sync logs at `/app/backend/logs/uptime-report.log` or contact the development team.
