# 📰 NEWS TAXONOMY V2 — IMPLEMENTATION VIEW (ULTRA MODE)
**Date**: December 4, 2024  
**Status**: Architecture Analysis (No Implementation Yet)  
**Purpose**: Strategic planning for BANIBS News Taxonomy v2 system

---

## 🎯 EXECUTIVE SUMMARY

The proposed **3-tier taxonomy system** (Tier 1: Public Categories → Tier 2: Structured Subcategories → Tier 3: Micro-tags) is **architecturally sound** and addresses key pain points in the current news system. This analysis provides a detailed implementation roadmap with risk mitigation strategies.

**Key Finding**: Current routing structure is compatible with v2 taxonomy. No breaking changes required if implemented correctly.

---

## 📊 CURRENT STATE ANALYSIS

### **Existing Routes** (verified in codebase)
```
/                          → NewsHomePage (Top Stories)
/news/black                → BlackNewsPage
/news/:section             → NewsSectionPage (catch-all)
```

### **Current Data Model** (inferred from `/app/backend/models/news.py`)
Likely structure:
```python
class NewsArticle:
    title: str
    url: str
    source: str
    category: str              # Current: flat single category
    published_date: datetime
    is_black_owned: bool       # Phase B3 admin control
    is_black_focus: bool       # Phase B3 admin control
    region: Optional[str]
    sentiment_score: Optional[float]
```

### **Gap Analysis**
| Current | V2 Needed | Gap |
|---------|-----------|-----|
| Single `category` field | Three fields: `tier1`, `tier2`, `tier3` | Medium |
| Flat categories | Hierarchical taxonomy | High |
| No Black News subcategorization | 10+ Black News Tier 2 categories | High |
| Manual categorization | AI-assisted auto-tagging | High |

---

## 🏗️ PROPOSED DATA MODEL (V2)

### **Database Schema Update**

```python
# /app/backend/models/news.py (v2)

from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class NewsArticleTaxonomy(BaseModel):
    """V2 Taxonomy System"""
    tier1_category: str                    # REQUIRED: Top Stories, Black News, U.S., etc.
    tier2_category: str                    # REQUIRED: Structured subcategory
    tier3_categories: Optional[List[str]]  # OPTIONAL: Micro-tags for search/personalization
    
    # Editorial metadata
    is_featured: bool = False
    is_trending: bool = False
    editorial_priority: int = 0  # 0=normal, 1=high, 2=urgent
    
class NewsArticle(BaseModel):
    # Core fields
    id: str
    title: str
    description: Optional[str]
    url: str
    source: str
    published_date: datetime
    
    # V2 Taxonomy
    taxonomy: NewsArticleTaxonomy
    
    # Black News flags (Phase B3)
    is_black_owned: bool = False
    is_black_focus: bool = False
    
    # Region & Sentiment
    region: Optional[str]
    sentiment_score: Optional[float]
    
    # Engagement
    views: int = 0
    shares: int = 0
    saves: int = 0
```

### **MongoDB Collection Structure**

```javascript
// news_articles collection (v2 schema)
{
  "_id": ObjectId("..."),
  "id": "uuid-string",
  "title": "Community Health Fair Brings Services to South Side",
  "url": "https://...",
  "source": "Chicago Defender",
  "published_date": ISODate("2024-12-04T..."),
  
  // V2 Taxonomy
  "taxonomy": {
    "tier1_category": "Black News",
    "tier2_category": "Community Progress",
    "tier3_categories": ["Health Inequities", "Community Events"],
    "is_featured": true,
    "is_trending": false,
    "editorial_priority": 1
  },
  
  // Black News flags
  "is_black_owned": true,
  "is_black_focus": true,
  
  // Other fields...
  "region": "Midwest",
  "sentiment_score": 0.82,
  "views": 1247,
  "created_at": ISODate("...")
}
```

---

## 🔄 MIGRATION STRATEGY

### **Phase 1: Additive Schema (No Breaking Changes)**

**Goal**: Add v2 fields alongside existing `category` field

**Actions**:
1. Add `taxonomy` subdocument to `NewsArticle` model
2. Keep existing `category` field for backward compatibility
3. Create migration script to backfill `tier1_category` from existing `category`
4. Default `tier2_category` to "General" for old articles

**Script**: `/app/backend/scripts/migrate_news_taxonomy_v2.py`
```python
async def migrate_existing_articles():
    """Backfill v2 taxonomy from existing category field"""
    
    # Mapping table: old category → (tier1, tier2)
    CATEGORY_MAPPING = {
        "world": ("World", "Global News"),
        "us": ("U.S.", "National News"),
        "politics": ("Politics & Government", "Federal Government"),
        "health": ("Health & Healthcare", "Public Health"),
        "entertainment": ("Entertainment & Lifestyle", "Celebrity News"),
        # ... etc
    }
    
    articles = await db.news_articles.find({"taxonomy": {"$exists": False}})
    
    for article in articles:
        old_category = article.get("category", "other")
        tier1, tier2 = CATEGORY_MAPPING.get(old_category, ("Top Stories", "General"))
        
        await db.news_articles.update_one(
            {"_id": article["_id"]},
            {"$set": {
                "taxonomy": {
                    "tier1_category": tier1,
                    "tier2_category": tier2,
                    "tier3_categories": [],
                    "is_featured": False,
                    "is_trending": False,
                    "editorial_priority": 0
                }
            }}
        )
```

**Timeline**: 2-3 hours  
**Risk**: LOW (additive only)

---

### **Phase 2: API Endpoint Updates**

**Goal**: Update news endpoints to support v2 taxonomy

#### **Endpoint Changes**

**Current**:
```
GET /api/news?category=politics&limit=20
```

**V2** (backward compatible):
```
GET /api/news?tier1=Politics&tier2=Federal%20Government&limit=20
GET /api/news?category=politics&limit=20  # Still works (legacy support)
```

**New Endpoints**:
```
GET /api/news/taxonomy/tier1                # Get all Tier 1 categories
GET /api/news/taxonomy/tier2/:tier1         # Get Tier 2 for a Tier 1
GET /api/news/categories/:tier1/:tier2      # Get articles by Tier 1 + Tier 2
```

#### **Updated News API** (`/app/backend/routes/news.py`)

```python
@router.get("/api/news")
async def get_news(
    tier1: Optional[str] = None,
    tier2: Optional[str] = None,
    tier3: Optional[str] = None,
    category: Optional[str] = None,  # Legacy support
    limit: int = 20,
    skip: int = 0
):
    """
    V2 news endpoint with taxonomy support.
    Maintains backward compatibility with 'category' param.
    """
    
    query = {}
    
    # V2 taxonomy filtering
    if tier1:
        query["taxonomy.tier1_category"] = tier1
    if tier2:
        query["taxonomy.tier2_category"] = tier2
    if tier3:
        query["taxonomy.tier3_categories"] = {"$in": [tier3]}
    
    # Legacy category support (maps to tier1)
    if category and not tier1:
        tier1_mapped = LEGACY_CATEGORY_MAP.get(category)
        if tier1_mapped:
            query["taxonomy.tier1_category"] = tier1_mapped
    
    # Execute query
    articles = await db.news_articles.find(query, {"_id": 0})\
        .sort("published_date", -1)\
        .skip(skip)\
        .limit(limit)\
        .to_list(limit)
    
    return {"articles": articles, "count": len(articles)}


@router.get("/api/news/taxonomy/tier1")
async def get_tier1_categories():
    """Get all Tier 1 categories with article counts"""
    pipeline = [
        {"$group": {
            "_id": "$taxonomy.tier1_category",
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.news_articles.aggregate(pipeline).to_list(100)
    return {"categories": results}


@router.get("/api/news/taxonomy/tier2/{tier1}")
async def get_tier2_categories(tier1: str):
    """Get Tier 2 subcategories for a given Tier 1"""
    pipeline = [
        {"$match": {"taxonomy.tier1_category": tier1}},
        {"$group": {
            "_id": "$taxonomy.tier2_category",
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    
    results = await db.news_articles.aggregate(pipeline).to_list(100)
    return {"tier1": tier1, "subcategories": results}
```

**Timeline**: 4-6 hours  
**Risk**: LOW (backward compatible)

---

### **Phase 3: Frontend Integration**

**Goal**: Update frontend to use v2 taxonomy for filtering and display

#### **A. Update NewsSectionPage Component**

**Current**:
```javascript
// /app/frontend/src/pages/NewsSectionPage.js
const section = useParams().section;
const response = await axios.get(`${API}/news?category=${section}`);
```

**V2**:
```javascript
// Support both old routes and new taxonomy
const section = useParams().section;
const tier1 = SECTION_TO_TIER1_MAP[section] || section;

const response = await axios.get(`${API}/news?tier1=${tier1}`);
```

#### **B. Create Taxonomy Filter Component**

**New Component**: `/app/frontend/src/components/news/TaxonomyFilter.jsx`

```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaxonomyFilter = ({ onFilterChange }) => {
  const [tier1Categories, setTier1Categories] = useState([]);
  const [tier2Categories, setTier2Categories] = useState([]);
  const [selectedTier1, setSelectedTier1] = useState(null);
  const [selectedTier2, setSelectedTier2] = useState(null);
  
  // Load Tier 1 categories
  useEffect(() => {
    const loadTier1 = async () => {
      const response = await axios.get(`${API}/news/taxonomy/tier1`);
      setTier1Categories(response.data.categories);
    };
    loadTier1();
  }, []);
  
  // Load Tier 2 when Tier 1 changes
  useEffect(() => {
    if (selectedTier1) {
      const loadTier2 = async () => {
        const response = await axios.get(`${API}/news/taxonomy/tier2/${selectedTier1}`);
        setTier2Categories(response.data.subcategories);
      };
      loadTier2();
    }
  }, [selectedTier1]);
  
  return (
    <div className="taxonomy-filter">
      {/* Tier 1 pills */}
      <div className="tier1-categories">
        {tier1Categories.map(cat => (
          <button
            key={cat._id}
            className={selectedTier1 === cat._id ? 'active' : ''}
            onClick={() => {
              setSelectedTier1(cat._id);
              onFilterChange({ tier1: cat._id, tier2: null });
            }}
          >
            {cat._id} ({cat.count})
          </button>
        ))}
      </div>
      
      {/* Tier 2 dropdown (if Tier 1 selected) */}
      {selectedTier1 && tier2Categories.length > 0 && (
        <select
          value={selectedTier2 || ''}
          onChange={(e) => {
            setSelectedTier2(e.target.value);
            onFilterChange({ tier1: selectedTier1, tier2: e.target.value });
          }}
        >
          <option value="">All {selectedTier1}</option>
          {tier2Categories.map(cat => (
            <option key={cat._id} value={cat._id}>
              {cat._id} ({cat.count})
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default TaxonomyFilter;
```

**Timeline**: 6-8 hours  
**Risk**: MEDIUM (requires UX design for filter component)

---

## 📍 ROUTING IMPACT ANALYSIS

### **Current Routes** (No Changes Needed)
```
/                       → NewsHomePage (Top Stories - Tier 1)
/news/black             → BlackNewsPage (Black News - Tier 1)
/news/:section          → NewsSectionPage (Tier 1 catch-all)
```

### **Potential New Routes** (Optional for v2)
```
/news/:tier1                           → Tier 1 landing
/news/:tier1/:tier2                    → Tier 2 landing
/news/black/:subcategory               → Black News subcategories
```

**Recommendation**: Keep existing routes, add new optional routes incrementally.

---

## 🎯 INTEGRATION POINTS

### **1. Admin Console (Phase B3)**
**Location**: `/app/backend/routes/admin_rss.py`

**Updates Needed**:
- Add Tier 1, Tier 2, Tier 3 dropdowns to RSS admin UI
- Allow admins to categorize news sources
- Bulk categorization tools

**Timeline**: 4-6 hours

---

### **2. AI Auto-Tagging Pipeline**
**Location**: `/app/backend/services/news_categorization_service.py`

**Enhancement**:
```python
async def auto_categorize_article(article_text: str, title: str) -> dict:
    """
    Use AI to suggest tier1, tier2, tier3 categories.
    Fallback to keyword matching if AI unavailable.
    """
    
    # Option 1: Use Emergent LLM Key (GPT-5 or Claude)
    prompt = f"""
    Categorize this news article into BANIBS taxonomy:
    
    Title: {title}
    Text: {article_text[:500]}
    
    Available Tier 1 categories: {TIER1_CATEGORIES}
    
    Respond in JSON:
    {{
      "tier1_category": "...",
      "tier2_category": "...",
      "tier3_categories": ["...", "..."],
      "confidence": 0.95
    }}
    """
    
    # Call LLM and parse response
    # ...
    
    return categorization
```

**Timeline**: 8-12 hours (includes AI integration)

---

### **3. Search System**
**Location**: `/app/backend/routes/search.py`

**Enhancement**:
- Index Tier 1, Tier 2, Tier 3 fields
- Allow users to filter search results by taxonomy
- Autocomplete for Tier 2/Tier 3 tags

**Timeline**: 6-8 hours

---

### **4. Recommendation Engine** (Future)
**Purpose**: Personalized news feed based on user preferences

**Data Model**:
```python
class UserNewsPreferences:
    user_id: str
    preferred_tier1_categories: List[str]
    preferred_tier2_categories: List[str]
    followed_tier3_tags: List[str]
```

**Timeline**: Not in scope for v2 (future enhancement)

---

## ⚠️ RISKS & MITIGATION

### **Risk #1: Inconsistent Categorization**
**Issue**: Different admins/AI may categorize same story differently  
**Probability**: HIGH  
**Impact**: MEDIUM

**Mitigation**:
- Create clear editorial guidelines document
- Implement AI confidence scoring (flag low-confidence for human review)
- Add bulk recategorization tool for cleanup
- Quarterly taxonomy audit

---

### **Risk #2: Empty Categories**
**Issue**: Some Tier 2 categories may have 0 articles  
**Probability**: MEDIUM  
**Impact**: LOW

**Mitigation**:
- Hide categories with 0 articles from public navigation
- Admin view shows all categories (including empty)
- RSS source tagging ensures continuous flow

---

### **Risk #3: Tier 3 Tag Explosion**
**Issue**: Too many micro-tags, hard to maintain  
**Probability**: MEDIUM  
**Impact**: LOW

**Mitigation**:
- Make Tier 3 optional (not required)
- Limit to 3-5 tags per article
- Use controlled vocabulary (predefined tag list)
- Tag deduplication script

---

### **Risk #4: Performance Impact**
**Issue**: Complex taxonomy queries may slow down news API  
**Probability**: LOW  
**Impact**: MEDIUM

**Mitigation**:
- Add MongoDB indexes:
  ```javascript
  db.news_articles.createIndex({"taxonomy.tier1_category": 1, "published_date": -1})
  db.news_articles.createIndex({"taxonomy.tier2_category": 1, "published_date": -1})
  db.news_articles.createIndex({"taxonomy.tier3_categories": 1})
  ```
- Cache taxonomy hierarchy (Tier 1 + Tier 2 lists)
- Use aggregation pipelines for counts

**Timeline**: 2 hours for indexing

---

### **Risk #5: Breaking Changes to Existing RSS Flow**
**Issue**: Phase B3 admin controls may conflict with v2 taxonomy  
**Probability**: LOW  
**Impact**: MEDIUM

**Mitigation**:
- Phase B3 and Taxonomy v2 are complementary (not conflicting)
- `is_black_owned` and `is_black_focus` are separate from taxonomy
- Taxonomy is content-based, flags are source-based
- Both systems can coexist

---

## 🛠️ IMPLEMENTATION PHASES

### **PHASE A: Data Model + Migration** (8-10 hours)
**Deliverables**:
1. Update `NewsArticle` model with `taxonomy` field
2. Create migration script
3. Backfill existing articles
4. Add MongoDB indexes
5. Test data integrity

**Dependencies**: None  
**Risk**: LOW

---

### **PHASE B: Backend API Updates** (6-8 hours)
**Deliverables**:
1. Update `/api/news` endpoint to support v2 params
2. Add `/api/news/taxonomy/tier1` endpoint
3. Add `/api/news/taxonomy/tier2/:tier1` endpoint
4. Update response models
5. Test backward compatibility

**Dependencies**: Phase A complete  
**Risk**: LOW

---

### **PHASE C: Admin Console Integration** (6-8 hours)
**Deliverables**:
1. Add Tier 1/Tier 2/Tier 3 selectors to admin UI
2. Update RSS source admin to include taxonomy
3. Add bulk categorization tool
4. Editorial guidelines documentation

**Dependencies**: Phase B complete  
**Risk**: MEDIUM (UX design needed)

---

### **PHASE D: Frontend Taxonomy Filter** (8-10 hours)
**Deliverables**:
1. Create `TaxonomyFilter` component
2. Update `NewsSectionPage` to use v2 API
3. Update `BlackNewsPage` with subcategory navigation
4. Visual design with v2 tokens (gold accents, etc.)

**Dependencies**: Phase B complete  
**Risk**: MEDIUM (UX design needed)

---

### **PHASE E: AI Auto-Tagging** (10-12 hours)
**Deliverables**:
1. Implement AI categorization service
2. Confidence scoring
3. Human review queue for low-confidence
4. Batch processing for RSS ingestion

**Dependencies**: Phase A, B complete  
**Risk**: MEDIUM (AI integration complexity)

---

### **PHASE F: Search Integration** (6-8 hours)
**Deliverables**:
1. Index taxonomy fields in search
2. Add taxonomy filters to search UI
3. Autocomplete for tags

**Dependencies**: Phase D complete  
**Risk**: LOW

---

## 🎯 RECOMMENDED STARTING POINT

### **Start with Phase A + Phase B** (14-18 hours total)

**Why?**
1. **Foundation work** - Everything else depends on these
2. **No user-facing changes** - Can be done "under the hood"
3. **Backward compatible** - No risk to existing functionality
4. **Sets up success** - Makes Phases C-F much easier

**Execution Order**:
1. Week 1: Phase A (data model + migration)
2. Week 2: Phase B (API updates + testing)
3. Week 3: Phase C (admin console)
4. Week 4: Phase D (frontend filter)

---

## 📋 QUESTIONS & CLARIFICATIONS NEEDED

### **Question 1: Black News Subcategorization Priority**
The spec lists 10 Black News Tier 2 categories. Do we need all 10 at launch, or can we start with 5-6 most important?

**Recommendation**: Start with 5-6, add more based on editorial need.

---

### **Question 2: Editorial Workflow**
Who will be responsible for categorizing news articles?
- Admins manually?
- AI auto-tagging with human review?
- Community contribution (future)?

**Recommendation**: Start with AI auto-tagging + admin override.

---

### **Question 3: Tier 3 Tag Library**
Should we maintain a controlled vocabulary for Tier 3 tags, or allow free-form tags?

**Recommendation**: Controlled vocabulary (predefined list) to prevent tag explosion.

---

### **Question 4: Legacy Category Cleanup**
After v2 migration is complete, should we remove the old `category` field?

**Recommendation**: Keep for 6 months, then deprecate (gives time for external integrations to update).

---

## 📊 SUCCESS METRICS

| Metric | Baseline | V2 Target |
|--------|----------|-----------|
| Categorization accuracy | ~60% | 90%+ |
| Empty categories | ~30% | <5% |
| User navigation clarity | Low | High |
| Admin categorization time | 2-3 min/article | <30 sec |
| Search relevance | Moderate | High |

---

## 🚀 FINAL RECOMMENDATION

**Taxonomy v2 is architecturally sound and ready for implementation.**

**Green light to proceed** once:
1. Editorial guidelines are documented
2. AI auto-tagging service is scoped (or deferred to Phase E)
3. Admin console UX is designed

**Timeline**: 44-56 hours total across 6 phases  
**Risk Level**: LOW-MEDIUM (mostly backend work, well-contained)  
**Business Impact**: HIGH (improved navigation, better Black News identity, scalable system)

---

**End of News Taxonomy v2 Implementation View**
