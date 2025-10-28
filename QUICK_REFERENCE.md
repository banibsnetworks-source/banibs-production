# BANIBS Phase 2.7 - Quick Reference Card

## 🚀 API Endpoints at a Glance

### Public (No Auth)
```bash
# List all approved opportunities
GET /api/opportunities/

# Filter by type
GET /api/opportunities/?type=job
GET /api/opportunities/?type=grant
GET /api/opportunities/?type=scholarship
GET /api/opportunities/?type=training

# Get featured (top 5)
GET /api/opportunities/featured

# Submit new opportunity
POST /api/opportunities/
Body: {title, orgName, type, location?, deadline?, description, link?, imageUrl?}
```

### Admin (Requires X-API-Key: BANIBS_INTERNAL_KEY)
```bash
# View pending submissions
GET /api/opportunities/pending

# Approve
PATCH /api/opportunities/{id}/approve

# Reject
PATCH /api/opportunities/{id}/reject

# Feature (auto-approves)
PATCH /api/opportunities/{id}/feature
```

## 🔧 Quick Commands

### Check Services
```bash
sudo supervisorctl status
```

### Restart Backend
```bash
sudo supervisorctl restart backend
```

### View Logs
```bash
tail -f /var/log/supervisor/backend.err.log
```

### Run Tests
```bash
cd /app/tests && python3 test_opportunities_api.py
```

### View API Docs
```
http://localhost:8001/docs
```

## 📊 Test an Opportunity Flow

```bash
# 1. Submit
curl -X POST http://localhost:8001/api/opportunities/ \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","orgName":"Corp","type":"job","description":"Test"}'

# Get the ID from response: {"id":"...","status":"received","approved":false}

# 2. Check it's NOT public yet
curl http://localhost:8001/api/opportunities/

# 3. View as admin
curl http://localhost:8001/api/opportunities/pending \
  -H "X-API-Key: BANIBS_INTERNAL_KEY"

# 4. Approve it
curl -X PATCH http://localhost:8001/api/opportunities/{ID}/approve \
  -H "X-API-Key: BANIBS_INTERNAL_KEY"

# 5. Check it's NOW public
curl http://localhost:8001/api/opportunities/

# 6. Feature it
curl -X PATCH http://localhost:8001/api/opportunities/{ID}/feature \
  -H "X-API-Key: BANIBS_INTERNAL_KEY"

# 7. Check featured list
curl http://localhost:8001/api/opportunities/featured
```

## 🔒 Security Notes

- **Admin Key:** `BANIBS_INTERNAL_KEY` (in header, NOT in frontend)
- **New submissions:** Always `approved: false`
- **Public API:** Only returns `approved: true`
- **Featured limit:** Max 5 items

## 📁 Key Files

```
/app/backend/models/opportunity.py       # Data models
/app/backend/db/opportunities.py         # Database layer
/app/backend/routes/opportunities.py     # API endpoints
/app/backend/server.py                   # Main app
/app/tests/test_opportunities_api.py     # Tests
/app/API_DOCUMENTATION.md                # Full docs
/app/PHASE_2.7_VERIFICATION_REPORT.md   # Verification
```

## ✅ Status

- **Backend:** Running on port 8001
- **MongoDB:** Connected
- **Tests:** 10/10 passing
- **Documentation:** Complete
- **Ready for:** Frontend integration

---
**Phase 2.7** | **Status: COMPLETE** | **Version: 2.7.0**
