# BANIBS Backend Health Check Fix - Deployment Instructions

## Issue Fixed
**Problem**: Backend container marked as "unhealthy" in Docker. Logs show:
```
INFO:server:GET /health - Status: 404 - Duration: 0.005s
127.0.0.1:xxxxx - "GET /health HTTP/1.1" 404
```

**Root Cause**: Docker healthcheck is calling `/health` endpoint, but the existing health router only exposes `/api/health` (with `/api` prefix). The main app had no `/health` endpoint at the root level.

**Solution**: Added a simple `/health` endpoint directly to the main FastAPI app (without `/api` prefix) that returns `{"status": "ok"}` with HTTP 200.

---

## Changes Made

### File: `/app/backend/server.py`

**Added after line 69 (right after FastAPI app creation):**

```python
# Simple health check endpoint for Docker healthcheck (without /api prefix)
@app.get("/health")
def health_check():
    """
    Minimal health check endpoint for Docker container healthcheck.
    Returns 200 OK if the application is running.
    For detailed health status, use /api/health
    """
    return {"status": "ok"}
```

---

## How It Works

### Before:
- **Docker healthcheck**: Calls `GET /health` → 404 Not Found → Container marked "unhealthy"
- **Existing health endpoint**: `/api/health` (detailed health check with DB status, etc.)

### After:
- **Docker healthcheck**: Calls `GET /health` → 200 OK `{"status": "ok"}` → Container marked "healthy"
- **Detailed health check**: Still available at `/api/health` (unchanged)

---

## Deployment Steps (EC2 @ 3.133.179.147)

### 1. Navigate to deployment directory
```bash
cd /app/banibs-app/deploy
```

### 2. Rebuild ONLY the backend container
```bash
docker compose -f docker-compose.prod.yml build --no-cache backend
```

### 3. Restart ONLY the backend container
```bash
docker compose -f docker-compose.prod.yml up -d backend
```

### 4. Verify the backend is running and healthy
```bash
docker compose -f docker-compose.prod.yml ps backend
```

Expected output:
```
NAME                        STATUS          PORTS
banibs-backend-prod         Up (healthy)    8001/tcp
```

Note: It may take 30-60 seconds for the health status to update from "starting" to "healthy".

### 5. Check backend logs
```bash
docker compose -f docker-compose.prod.yml logs -f backend | tail -20
```

Look for:
- ✅ No more 404 errors for `/health`
- ✅ `INFO:server:GET /health - Status: 200`
- ✅ Application started successfully

### 6. Test the health endpoints

**Test simple health endpoint (Docker uses this):**
```bash
curl http://localhost:8001/health
```

Expected response:
```json
{"status":"ok"}
```

**Test detailed health endpoint:**
```bash
curl http://localhost:8001/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-12-08T...",
  "service": "BANIBS API",
  "version": "1.0.0",
  "checks": {
    "api_server": {...},
    "database": {...},
    "collections": {...},
    ...
  }
}
```

### 7. Verify via proxy (public URL)
```bash
# Test via domain
curl https://banibs.com/api/health

# Or test simple health
curl https://banibs.com/health
```

### 8. Check Docker container health status
```bash
docker inspect banibs-backend-prod | grep -A 10 "Health"
```

Look for:
```json
"Health": {
    "Status": "healthy",
    "FailingStreak": 0,
    "Log": [
        {
            "ExitCode": 0,
            "Output": "{\"status\":\"ok\"}\n"
        }
    ]
}
```

---

## Verification Checklist

- [ ] Backend container shows status as "Up (healthy)" not just "Up"
- [ ] `/health` endpoint returns 200 with `{"status": "ok"}`
- [ ] `/api/health` endpoint still works (detailed health check)
- [ ] No 404 errors in backend logs for `/health`
- [ ] Docker healthcheck passes
- [ ] Waitlist API works: `https://banibs.com/api/waitlist/health`

---

## Technical Notes

### Why Two Health Endpoints?

**`/health` (Simple)**
- Purpose: Docker healthcheck only
- Response: `{"status": "ok"}`
- Fast, no database calls
- Used by container orchestration

**`/api/health` (Detailed)**
- Purpose: Monitoring, debugging, operations
- Response: Full system status with DB, collections, ADCS, etc.
- May take longer (queries database)
- Used by UptimeRobot, monitoring dashboards, ops team

### Docker Healthcheck Configuration

The healthcheck in `docker-compose.prod.yml` likely looks like:
```yaml
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:8001/health"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

With this fix, the healthcheck will now succeed.

---

## Rollback (if needed)

If something goes wrong:

```bash
cd /app/banibs-app/deploy
docker compose -f docker-compose.prod.yml down backend
docker compose -f docker-compose.prod.yml up -d backend
```

Or restore from git if you need the previous version of `server.py`.

---

## Status After Fix

✅ `/health` endpoint added to main app
✅ Docker healthcheck will pass
✅ Backend container will show as "healthy"
✅ Detailed `/api/health` endpoint unchanged
✅ No breaking changes to existing functionality

---

**Last Updated**: December 8, 2024
**Environment**: AWS EC2 @ 3.133.179.147
**Domain**: banibs.com
**Fix Location**: `/app/backend/server.py` lines 71-79
