# BANIBS Business Directory v2 - MongoDB Implementation
**Date:** November 1, 2025  
**Status:** ✅ Complete  
**Database:** MongoDB

---

## Overview

Business Directory v2 enhances the BANIBS business listings with job titles, geo-location data, and automatic directions link generation.

---

## New Fields Added

### MongoDB Schema Updates (`business_listings` collection)

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `job_title` | String | Contact person's job title | "Owner & Head Chef" |
| `geo_latitude` | Number (Float) | Latitude for mapping | 33.7490 |
| `geo_longitude` | Number (Float) | Longitude for mapping | -84.3880 |
| `directions_url` | String | Custom directions link (optional) | "https://custom-directions.com" |

---

## Computed Field: `directions_link`

### Logic

When returning a business listing from the API, a computed field `directions_link` is automatically included:

**Priority Order:**
1. **If `directions_url` exists** → Use custom URL
2. **Else if `geo_latitude` AND `geo_longitude` exist** → Generate Google Maps link
3. **Else** → Return `null`

**Google Maps Link Format:**
```
https://www.google.com/maps/search/?api=1&query=<lat>,<lng>
```

**Example:**
```
https://www.google.com/maps/search/?api=1&query=33.7490,-84.3880
```

---

## API Endpoints

### Base URL
```
https://themeverse-3.preview.emergentagent.com/api/business
```

### 1. Get Business Directory
**GET /api/business/directory**

**Query Parameters:**
- `skip` (int, default: 0) - Pagination offset
- `limit` (int, default: 50, max: 100) - Results per page
- `category` (string, optional) - Filter by category
- `city` (string, optional) - Filter by city
- `state` (string, optional) - Filter by state
- `verified_only` (boolean, default: false) - Only verified businesses

**Response:**
```json
[
  {
    "id": "uuid",
    "business_name": "Aisha's Catering Services",
    "contact_email": "info@aishascatering.com",
    "contact_phone": "+1-404-555-0123",
    "address_line1": "123 Main Street",
    "city": "Atlanta",
    "state": "GA",
    "postal_code": "30303",
    "country": "United States",
    "job_title": "Owner & Head Chef",
    "geo_latitude": 33.7490,
    "geo_longitude": -84.3880,
    "directions_url": null,
    "directions_link": "https://www.google.com/maps/search/?api=1&query=33.7490,-84.3880",
    "description": "Authentic West African catering",
    "category": "Food & Beverage",
    "website": "https://aishascatering.com",
    "logo_url": null,
    "verified": true,
    "featured": false,
    "created_at": "2025-11-01T12:00:00Z"
  }
]
```

---

### 2. Get Single Business Listing
**GET /api/business/directory/{listing_id}**

**Response:** Same as above, single object

---

### 3. Create Business Listing
**POST /api/business/directory**

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "business_name": "My Business",
  "contact_email": "contact@mybusiness.com",
  "contact_phone": "+1-555-0100",
  "address_line1": "456 Oak Avenue",
  "city": "Chicago",
  "state": "IL",
  "postal_code": "60601",
  "country": "United States",
  "job_title": "CEO",
  "geo_latitude": 41.8781,
  "geo_longitude": -87.6298,
  "directions_url": null,
  "description": "Professional consulting services",
  "category": "Professional Services",
  "website": "https://mybusiness.com"
}
```

**Response:** Created listing with computed `directions_link`

---

### 4. Update Business Listing
**PATCH /api/business/directory/{listing_id}**

**Authentication:** Required (owner or admin)

**Request Body:** Partial update (only include fields to change)
```json
{
  "job_title": "Founder & CEO",
  "geo_latitude": 41.8781,
  "geo_longitude": -87.6298
}
```

---

### 5. Delete Business Listing
**DELETE /api/business/directory/{listing_id}**

**Authentication:** Required (owner or admin)

**Response:**
```json
{
  "message": "Business listing deleted successfully"
}
```

---

### 6. Get My Listings
**GET /api/business/my-listings**

**Authentication:** Required

**Response:** Array of user's business listings

---

### 7. Get Categories
**GET /api/business/categories**

**Response:**
```json
{
  "categories": [
    "Food & Beverage",
    "Retail",
    "Professional Services",
    "Technology",
    "Healthcare",
    "Education",
    "Construction",
    "Transportation",
    "Arts & Entertainment",
    "Real Estate",
    "Other"
  ]
}
```

---

## Database Migration

### Migration Script
**File:** `/app/backend/scripts/migrate_business_directory_v2.py`

### Run Migration

**Production:**
```bash
cd /app/backend
python scripts/migrate_business_directory_v2.py
```

### What It Does
1. Checks if `business_listings` collection exists
2. Adds new fields to existing documents:
   - `job_title: null`
   - `geo_latitude: null`
   - `geo_longitude: null`
   - `directions_url: null`
3. Creates `migration_history` collection if needed
4. Logs migration to `migration_history`
5. Generates migration report: `/tmp/banibs_business_directory_v2_migration_report.json`

### Migration Report Example
```json
{
  "migration": "BANIBS_BusinessDB_v2_Mongo",
  "timestamp": "2025-11-01T14:30:00Z",
  "collection": "business_listings",
  "documents_updated": 42,
  "new_fields": [
    "job_title (String)",
    "geo_latitude (Number)",
    "geo_longitude (Number)",
    "directions_url (String)"
  ]
}
```

---

## Implementation Files

### Backend
- **Model:** `/app/backend/models/business_listing.py`
  - `BusinessListing` (full schema)
  - `BusinessListingPublic` (API response with computed field)
  - `BusinessListingCreate` (create request)
  - `BusinessListingUpdate` (update request)

- **Database:** `/app/backend/db/business_listings.py`
  - CRUD operations
  - `compute_directions_link()` function
  - `sanitize_listing_response()` function

- **Routes:** `/app/backend/routes/business_directory.py`
  - 7 endpoints for directory management
  - Authentication & authorization
  - Filtering & pagination

- **Migration:** `/app/backend/scripts/migrate_business_directory_v2.py`
  - Safe MongoDB migration
  - Automatic backup & logging

### Server Registration
- **File:** `/app/backend/server.py`
  - `business_directory_router` registered
  - Available at `/api/business/*`

---

## Frontend Integration

### Get Directions Button Example

```jsx
// BusinessCard.js
function BusinessCard({ business }) {
  return (
    <div className="business-card">
      <h3>{business.business_name}</h3>
      <p>{business.job_title && `Contact: ${business.job_title}`}</p>
      <p>{business.city}, {business.state}</p>
      
      {business.directions_link && (
        <a 
          href={business.directions_link} 
          target="_blank" 
          rel="noopener noreferrer"
          className="btn-directions"
        >
          📍 Get Directions
        </a>
      )}
    </div>
  );
}
```

### Fetch Directory
```javascript
// services/businessApi.js
export const getBusinessDirectory = async (filters = {}) => {
  const params = new URLSearchParams(filters);
  const response = await fetch(
    `${process.env.REACT_APP_BACKEND_URL}/api/business/directory?${params}`
  );
  return response.json();
};
```

---

## Testing

### Manual Tests

**1. Get Directory:**
```bash
curl https://themeverse-3.preview.emergentagent.com/api/business/directory
```

**2. Get Categories:**
```bash
curl https://themeverse-3.preview.emergentagent.com/api/business/categories
```

**3. Create Listing (requires auth):**
```bash
curl -X POST https://themeverse-3.preview.emergentagent.com/api/business/directory \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "business_name": "Test Business",
    "city": "Atlanta",
    "state": "GA",
    "geo_latitude": 33.7490,
    "geo_longitude": -84.3880
  }'
```

**4. Verify Directions Link:**
- Listing with coordinates → Google Maps link generated
- Listing with custom `directions_url` → Custom link used
- Listing with neither → `directions_link: null`

---

## Security & Access Control

### Public Endpoints
- `GET /api/business/directory` - Anyone can browse
- `GET /api/business/directory/{id}` - Anyone can view
- `GET /api/business/categories` - Public list

### Authenticated Endpoints
- `POST /api/business/directory` - Requires login
- `GET /api/business/my-listings` - Requires login

### Owner/Admin Endpoints
- `PATCH /api/business/directory/{id}` - Owner or admin only
- `DELETE /api/business/directory/{id}` - Owner or admin only

---

## Geocoding Integration (Future)

To automatically populate `geo_latitude` and `geo_longitude` from addresses:

**Option 1: Google Geocoding API**
- API: `https://maps.googleapis.com/maps/api/geocode/json`
- Cost: $5 per 1000 requests

**Option 2: Mapbox Geocoding**
- API: `https://api.mapbox.com/geocoding/v5`
- Free tier: 100,000 requests/month

**Implementation:**
```python
async def geocode_address(address: str) -> tuple:
    # Call geocoding API
    # Return (latitude, longitude)
    pass
```

---

## Summary

✅ **Implemented:**
- MongoDB schema updated with 4 new fields
- Computed `directions_link` logic
- 7 API endpoints for directory management
- Migration script with safety checks
- Complete documentation

✅ **Testing:**
- Migration script tested
- API endpoints registered
- Ready for production use

✅ **Location:**
- Documentation: `/app/docs/business_directory_v2.md`
- Implementation: Complete

**Status:** Business Directory v2 enhancement complete. No impact on Phase 6.0 (Auth/SSO) development.

---

**Prepared by:** Neo (Emergent AI Engineer)  
**Date:** November 1, 2025  
**Next:** Return focus to Phase 6.0 verification
