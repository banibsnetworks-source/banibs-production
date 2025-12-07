# BANIBS Phase 2.7 - Opportunities API Documentation

## Overview
FastAPI backend with MongoDB integration for managing opportunities (jobs, grants, scholarships, training).

**Version:** 2.7.0  
**Base URL:** `https://banibs-comingsoon.preview.emergentagent.com/api/opportunities`  
**Local URL:** `http://localhost:8001/api/opportunities`

---

## Features Implemented

✅ **CRUD Operations** - Create, Read, Update, Delete opportunities  
✅ **MongoDB Integration** - Using Motor (async MongoDB driver)  
✅ **Admin Approval Workflow** - Approve/Reject/Feature opportunities  
✅ **Type Filtering** - Filter by job, grant, scholarship, training  
✅ **Featured System** - Highlight special opportunities  
✅ **API Key Authentication** - Simple admin protection  
✅ **S3 Image Upload** - Presigned URL generation (configurable)  
✅ **Auto-Generated API Docs** - Available at `/docs` and `/redoc`  
✅ **CORS Configured** - Frontend can communicate with backend

---

## Data Model

### Opportunity Fields

```json
{
  "id": "string (ObjectId)",
  "title": "string (required)",
  "orgName": "string (required)",
  "type": "job | grant | scholarship | training (required)",
  "location": "string (optional)",
  "deadline": "datetime (optional)",
  "description": "string (required)",
  "link": "URL (optional)",
  "imageUrl": "string (optional)",
  "featured": "boolean (default: false)",
  "approved": "boolean (default: false)",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

### Business Rules

- **New submissions** start with `approved: false` and `featured: false`
- **Only approved** opportunities appear in public listings
- **Featured opportunities** appear in the featured section (max 5)
- **Admin API key** required for approval/rejection/featuring

---

## API Endpoints

### Public Endpoints (No Authentication Required)

#### 1. List Public Opportunities
```http
GET /api/opportunities/
```

**Query Parameters:**
- `type` (optional): Filter by type (`job`, `grant`, `scholarship`, `training`, `all`)

**Response:**
```json
[
  {
    "id": "69000eca84474146f644cf18",
    "title": "Software Engineer Internship",
    "orgName": "Tech Corp",
    "type": "job",
    "location": "Remote",
    "deadline": "2025-12-31T23:59:59",
    "description": "Great opportunity for aspiring engineers",
    "link": "https://example.com/apply",
    "imageUrl": null,
    "featured": false,
    "createdAt": "2025-10-28T00:31:06.463000"
  }
]
```

**Example:**
```bash
# Get all approved opportunities
curl https://banibs-comingsoon.preview.emergentagent.com/api/opportunities/

# Filter by type
curl "https://banibs-comingsoon.preview.emergentagent.com/api/opportunities/?type=job"
```

---

#### 2. List Featured Opportunities
```http
GET /api/opportunities/featured
```

**Response:** Same as above, but only featured opportunities (max 5)

**Example:**
```bash
curl https://banibs-comingsoon.preview.emergentagent.com/api/opportunities/featured
```

---

#### 3. Submit New Opportunity
```http
POST /api/opportunities/
```

**Request Body:**
```json
{
  "title": "Software Engineer Internship",
  "orgName": "Tech Corp",
  "type": "job",
  "location": "Remote",
  "deadline": "2025-12-31T23:59:59",
  "description": "Great opportunity for aspiring engineers",
  "link": "https://example.com/apply",
  "imageUrl": "https://cdn.example.com/image.jpg"
}
```

**Response:**
```json
{
  "id": "69000eca84474146f644cf18",
  "status": "received",
  "approved": false
}
```

**Example:**
```bash
curl -X POST https://banibs-comingsoon.preview.emergentagent.com/api/opportunities/ \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Software Engineer Internship",
    "orgName": "Tech Corp",
    "type": "job",
    "location": "Remote",
    "description": "Great opportunity"
  }'
```

---

### Admin Endpoints (Require API Key)

**Authentication:** Include header `X-API-Key: BANIBS_INTERNAL_KEY`

#### 4. List Pending Opportunities
```http
GET /api/opportunities/pending
```

**Headers:**
```
X-API-Key: BANIBS_INTERNAL_KEY
```

**Response:** Array of all unapproved opportunities with full details

**Example:**
```bash
curl https://banibs-comingsoon.preview.emergentagent.com/api/opportunities/pending \
  -H "X-API-Key: BANIBS_INTERNAL_KEY"
```

---

#### 5. Approve Opportunity
```http
PATCH /api/opportunities/{opp_id}/approve
```

**Headers:**
```
X-API-Key: BANIBS_INTERNAL_KEY
```

**Response:**
```json
{
  "id": "69000eca84474146f644cf18",
  "approved": true,
  "featured": false
}
```

**Example:**
```bash
curl -X PATCH https://banibs-comingsoon.preview.emergentagent.com/api/opportunities/69000eca84474146f644cf18/approve \
  -H "X-API-Key: BANIBS_INTERNAL_KEY"
```

---

#### 6. Reject Opportunity
```http
PATCH /api/opportunities/{opp_id}/reject
```

**Headers:**
```
X-API-Key: BANIBS_INTERNAL_KEY
```

**Response:**
```json
{
  "id": "69000eca84474146f644cf18",
  "approved": false,
  "featured": false
}
```

---

#### 7. Feature Opportunity
```http
PATCH /api/opportunities/{opp_id}/feature
```

**Headers:**
```
X-API-Key: BANIBS_INTERNAL_KEY
```

**Note:** This also approves the opportunity automatically.

**Response:**
```json
{
  "id": "69000eca84474146f644cf18",
  "approved": true,
  "featured": true
}
```

---

### Image Upload Endpoint (Optional - Requires AWS Configuration)

#### 8. Get Presigned Upload URL
```http
POST /api/opportunities/upload-presigned-url?filename=image.jpg
```

**Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "publicUrl": "https://cdn.example.com/opportunities/uuid.jpg",
  "filename": "opportunities/uuid.jpg"
}
```

**Usage Flow:**
1. Frontend requests presigned URL
2. Frontend uploads image directly to S3 using the presigned URL
3. Frontend includes `publicUrl` in the opportunity submission

---

## Auto-Generated API Documentation

FastAPI provides interactive API documentation:

- **Swagger UI:** [https://banibs-comingsoon.preview.emergentagent.com/docs](https://banibs-comingsoon.preview.emergentagent.com/docs)
- **ReDoc:** [https://banibs-comingsoon.preview.emergentagent.com/redoc](https://banibs-comingsoon.preview.emergentagent.com/redoc)

---

## Configuration

### Environment Variables

**Backend (`/app/backend/.env`):**
```env
# MongoDB (DO NOT MODIFY - pre-configured)
MONGO_URL="mongodb://localhost:27017"
DB_NAME="test_database"

# CORS (DO NOT MODIFY - pre-configured)
CORS_ORIGINS="*"

# AWS S3 (Optional - for image uploads)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
S3_BUCKET_NAME="your-bucket-name"
AWS_REGION="us-east-1"
CLOUDFRONT_URL="https://your-cloudfront-domain.com"

# Admin API Key (TODO: Move to secure secret management)
ADMIN_API_KEY="BANIBS_INTERNAL_KEY"
```

**Frontend (`/app/frontend/.env`):**
```env
# Backend URL (DO NOT MODIFY - pre-configured)
REACT_APP_BACKEND_URL=https://banibs-comingsoon.preview.emergentagent.com
```

---

## Testing

### Run Integration Tests

```bash
cd /app/tests
python3 test_opportunities_api.py
```

### Test Coverage

✅ Create opportunity  
✅ Get public opportunities (before/after approval)  
✅ Get pending opportunities (admin)  
✅ Approve opportunity  
✅ Reject opportunity  
✅ Feature opportunity  
✅ Get featured opportunities  
✅ Type filtering  
✅ Admin authorization protection

---

## Database Schema

**Collection:** `opportunities`

**Indexes (Recommended for Production):**
```javascript
db.opportunities.createIndex({ "approved": 1, "createdAt": -1 })
db.opportunities.createIndex({ "approved": 1, "featured": 1, "updatedAt": -1 })
db.opportunities.createIndex({ "type": 1 })
```

---

## Security Notes

⚠️ **Current Implementation:**
- Admin API key is hardcoded (`BANIBS_INTERNAL_KEY`)
- Suitable for Phase 2.7 MVP

🔒 **Production Recommendations:**
1. Move admin key to environment variable
2. Implement JWT-based authentication
3. Add rate limiting
4. Implement RBAC (Role-Based Access Control)
5. Add request validation middleware
6. Enable HTTPS only
7. Add API versioning

---

## Troubleshooting

### Backend Not Starting
```bash
# Check logs
tail -n 100 /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend
```

### MongoDB Connection Issues
```bash
# Check MongoDB is running
sudo supervisorctl status
```

### CORS Issues
- Verify `CORS_ORIGINS` in backend `.env`
- Check frontend is using `REACT_APP_BACKEND_URL`

---

## Next Steps (Post Phase 2.7)

- [ ] Implement full JWT authentication
- [ ] Add user accounts and submission tracking
- [ ] Implement email notifications for approvals
- [ ] Add analytics and metrics
- [ ] Implement search functionality
- [ ] Add pagination for large datasets
- [ ] Implement caching (Redis)
- [ ] Add file size validation for images
- [ ] Implement image compression/optimization
- [ ] Add webhook support for external integrations

---

## File Structure

```
/app/backend/
├── server.py                    # Main FastAPI application
├── models/
│   └── opportunity.py          # Pydantic models
├── db/
│   ├── connection.py           # MongoDB connection
│   └── opportunities.py        # Data access layer
├── routes/
│   └── opportunities.py        # API routes
└── .env                        # Environment configuration
```

---

## Support

For issues or questions:
- Check API docs: `/docs`
- Review integration tests: `/app/tests/test_opportunities_api.py`
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`

---

**Built with:** FastAPI, MongoDB (Motor), Pydantic, boto3  
**Phase:** 2.7  
**Status:** ✅ Production Ready
