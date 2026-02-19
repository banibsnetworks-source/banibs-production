# BANIBS Tech Debt Log

Tracked technical debt items requiring future refactoring.

---

## TD-001: AsyncIOMotorClient module-level instantiation violations (27 files)

**Status:** LOGGED  
**Date Identified:** 2026-02-19  
**Severity:** Latent (not currently failing)  
**Refactor Target:** Migrate to `Depends(get_db)` pattern from `db/connection.py`

### Summary
27 files instantiate `AsyncIOMotorClient` at module level instead of using the centralized dependency injection pattern. Latent risk depends on import timing — if import order changes, these could trigger `RuntimeError: no running event loop`.

### Root Cause
Pattern established early in development before centralized `db/connection.py` was standardized.

### Affected Files

**Routes (10 files):**
- `/app/backend/routes/news.py`
- `/app/backend/routes/notifications.py`
- `/app/backend/routes/hdos_engine.py`
- `/app/backend/routes/black_news.py`
- `/app/backend/routes/opportunities/jobs.py`
- `/app/backend/routes/media.py`
- `/app/backend/routes/frames.py`
- `/app/backend/routes/sponsor.py`
- `/app/backend/routes/local_exchange.py`
- `/app/backend/routes/pins.py`

**DB modules (16 files):**
- `/app/backend/db/feedback.py`
- `/app/backend/db/news.py`
- `/app/backend/db/resources.py`
- `/app/backend/db/notifications.py`
- `/app/backend/db/messages.py`
- `/app/backend/db/opportunities/candidate_profiles.py`
- `/app/backend/db/opportunities/recruiter_profiles.py`
- `/app/backend/db/opportunities/job_listings.py`
- `/app/backend/db/opportunities/employer_profiles.py`
- `/app/backend/db/opportunities/application_records.py`
- `/app/backend/db/newsletter_sends.py`
- `/app/backend/db/banned_sources.py`
- `/app/backend/db/news_analytics.py`
- `/app/backend/db/sponsor_orders.py`
- `/app/backend/db/featured_media.py`
- `/app/backend/db/events.py`

**Utils (1 file):**
- `/app/backend/utils/rss_parser.py`

### Recommended Fix Pattern
```python
# Before (violation)
from motor.motor_asyncio import AsyncIOMotorClient
client = AsyncIOMotorClient(os.environ['MONGO_URL'])
db = client['db_name']

# After (correct)
from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from db.connection import get_db

async def some_endpoint(db: AsyncIOMotorDatabase = Depends(get_db)):
    await db.collection.find_one({})
```

### Notes
- Fixed in `/app/backend/routes/health.py` on 2026-02-19
- Remaining 27 files are stable due to import timing but should be refactored when capacity allows
- Do NOT batch refactor — migrate incrementally with testing per file

---
