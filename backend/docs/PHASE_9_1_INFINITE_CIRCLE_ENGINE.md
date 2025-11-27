# Phase 9.1 - BANIBS Infinite Circle Engine (Backend Foundation)

## ✅ Status: COMPLETE

Phase 9.1 implements the backend infrastructure for the Infinite Circle Engine — BANIBS' deep trust and relationship graph system that powers Peoples-of-Peoples discovery and shared circle detection.

---

## 🎯 Objectives Achieved

### 1. **Graph Data Model** ✅
- Two new MongoDB collections: `circle_edges`, `circle_graph_meta`
- Weighted edge system based on relationship tiers
- Fast lookup indexes for graph traversal

### 2. **Graph Algorithms** ✅
- Multi-hop traversal (depth 1, 2, 3)
- Peoples-of-Peoples detection
- Shared circle computation
- Circle reach scoring

### 3. **API Layer** ✅
- 6 RESTful endpoints for graph queries
- Authentication and privacy controls
- Comprehensive error handling

---

## 📊 Data Model

### **Collection: circle_edges**

Stores directional edges between users after relationship tiering.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | MongoDB ID |
| `ownerUserId` | String | User who owns this edge |
| `targetUserId` | String | Target user |
| `tier` | String | PEOPLES/COOL/ALRIGHT/OTHERS |
| `weight` | Integer | Numeric tier weight |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

**Indexes:**
- Unique: `(ownerUserId, targetUserId)`
- Index: `tier`
- Index: `weight`

### **Collection: circle_graph_meta**

Stores aggregate stats for fast lookups.

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | MongoDB ID |
| `userId` | String | User this meta applies to |
| `peoplesCount` | Integer | Count of PEOPLES connections |
| `coolCount` | Integer | Count of COOL connections |
| `alrightCount` | Integer | Count of ALRIGHT connections |
| `othersCount` | Integer | Count of OTHERS connections |
| `updatedAt` | DateTime | Last update timestamp |

---

## ⚖️ Graph Weights

Standardized scoring system for trust calculations:

| Tier | Weight |
|------|--------|
| PEOPLES | 100 |
| COOL | 60 |
| ALRIGHT | 30 |
| OTHERS | 5 |

---

## 🔧 Database Functions

File: `/app/backend/db/circle_engine.py`

### **Core Functions**

1. **`refresh_circle_edges_for_user(user_id)`**
   - Rebuilds circle edges from relationship data
   - Deletes old edges and creates new ones
   - Updates graph metadata
   - Returns: Number of edges created

2. **`refresh_all_circle_edges()`**
   - Refreshes edges for ALL users (heavy operation)
   - Returns: Statistics (users processed, total edges, errors)

3. **`get_circle_edges(user_id, tier=None)`**
   - Retrieves user's circle edges
   - Optional tier filtering
   - Returns: List of edge documents

4. **`get_circle_of_peoples(user_id)`**
   - Computes Peoples-of-Peoples (depth 2 from PEOPLES only)
   - Returns: Direct peoples + second-hop peoples with mutual counts

5. **`get_circle_depth(user_id, depth=2)`**
   - Multi-hop traversal to specified depth (1, 2, or 3)
   - Avoids circular loops
   - Returns: Edges at each depth level

6. **`get_shared_circle(user_id, other_id)`**
   - Computes intersection of two users' circles
   - Calculates overlap score
   - Returns: Shared connections by tier + score

7. **`get_circle_reach_score(user_id)`**
   - Calculates weighted reach score
   - Includes direct + depth-2 scoring
   - Returns: Total score + breakdown

8. **`update_circle_graph_meta(user_id)`**
   - Updates/creates metadata document
   - Stores aggregate tier counts
   - Auto-called by refresh functions

---

## 🚀 API Endpoints

Base: `/api/circle`

All endpoints require authentication.

### **1. GET `/api/circle/{userId}/edges`**

Get user's circle graph edges.

**Query Parameters:**
- `tier` (optional): Filter by tier (PEOPLES, COOL, ALRIGHT, OTHERS)

**Response:**
```json
[
  {
    "ownerUserId": "user-123",
    "targetUserId": "user-456",
    "tier": "PEOPLES",
    "weight": 100,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

**Privacy:** User can only view their own edges.

---

### **2. GET `/api/circle/{userId}/peoples`**

Get Peoples-of-Peoples (second-degree PEOPLES connections).

**Response:**
```json
{
  "direct_peoples": [
    {
      "ownerUserId": "user-123",
      "targetUserId": "user-456",
      "tier": "PEOPLES",
      "weight": 100,
      ...
    }
  ],
  "peoples_of_peoples": [
    {
      "user_id": "user-789",
      "mutual_count": 2,
      "mutual_peoples": ["user-456", "user-111"]
    }
  ]
}
```

**Privacy:** User can only view their own Peoples-of-Peoples.

---

### **3. GET `/api/circle/{userId}/shared/{otherId}`**

Get shared circle between two users.

**Response:**
```json
{
  "shared_peoples": ["user-789", "user-101"],
  "shared_cool": ["user-202"],
  "shared_alright": [],
  "overlap_score": 0.75
}
```

**Privacy:** Either user can view their shared circle.

---

### **4. GET `/api/circle/{userId}/depth/{level}`**

Multi-depth circle traversal.

**Path Parameters:**
- `level`: Depth (1, 2, or 3)

**Response:**
```json
{
  "depth_1": [...],  // Direct connections
  "depth_2": [...],  // Second-hop
  "depth_3": [...]   // Third-hop (if level=3)
}
```

**Privacy:** User can only view their own depth traversal.

---

### **5. GET `/api/circle/{userId}/score`**

Get user's circle reach score.

**Response:**
```json
{
  "total_score": 450,
  "direct_score": 300,
  "depth_2_score": 150,
  "breakdown": {
    "tier_counts": {
      "PEOPLES": 3,
      "COOL": 5,
      "ALRIGHT": 2
    },
    "peoples_of_peoples_count": 15
  }
}
```

---

### **6. POST `/api/circle/refresh/{userId}`**

Refresh circle edges for a specific user.

**Response:**
```json
{
  "success": true,
  "message": "Circle refreshed successfully",
  "edges_created": 10
}
```

---

### **7. POST `/api/circle/refresh-all`**

Refresh all users' circle edges (heavy operation).

**Response:**
```json
{
  "success": true,
  "message": "All circles refreshed successfully",
  "stats": {
    "total_users": 150,
    "total_edges": 1200,
    "errors": 0
  }
}
```

**Note:** Should be restricted to admins in production.

---

## 🔐 Privacy & Security

### **Privacy Controls**
- Users can only view their own circle data
- Shared circle queries require involvement of the requesting user
- BLOCKED users are excluded from all graph calculations

### **Performance**
- Graph traversal limited to depth 3 maximum
- Circular loop prevention
- Efficient indexing on key fields

### **Future Enhancements**
- Admin-only access for refresh-all
- Rate limiting on expensive queries
- Caching layer for frequent computations

---

## 🧪 Testing

### **Manual Testing**

```bash
# Get JWT token
TOKEN="your-jwt-token"

# Get circle edges
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/circle/{userId}/edges

# Get Peoples-of-Peoples
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/circle/{userId}/peoples

# Get shared circle
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/circle/{userId}/shared/{otherId}

# Refresh user's circle
curl -X POST -H "Authorization: Bearer $TOKEN" \
  http://localhost:8001/api/circle/refresh/{userId}
```

### **Expected Behavior**
- Depth-2 traversal excludes original user and direct connections
- Shared circle accurately identifies mutual connections
- Reach score increases with more/higher-tier connections
- Refresh operations update both edges and metadata

---

## 📁 File Structure

```
/app/backend/
├── db/
│   └── circle_engine.py           # Graph database operations
├── schemas/
│   └── circle_engine.py           # Pydantic models
├── routes/
│   └── circle_engine.py           # API endpoints
├── server.py                      # Router registration
└── docs/
    └── PHASE_9_1_INFINITE_CIRCLE_ENGINE.md
```

---

## 🎯 Integration Points

### **Phase 8 Integration**
- Reads from `relationships` collection (Phase 8.1)
- Can trigger edge refresh on relationship changes

### **Future Phases**
- **Phase 9.2**: Circle visualization UI
- **Phase 9.3**: Recommendation engine
- **Phase 9.4**: Trust-based ranking
- **Phase 9.5**: Social radar map

---

## ✅ Completion Checklist

- [x] `circle_edges` collection implemented
- [x] `circle_graph_meta` collection implemented
- [x] 8 database functions created
- [x] 6 API endpoints implemented
- [x] Router registered in server.py
- [x] Authentication middleware integrated
- [x] Privacy controls implemented
- [x] Pydantic schemas created
- [x] Documentation created
- [ ] Backend service restarted (**Next step**)
- [ ] API endpoints verified (**Next step**)
- [ ] Integration testing (**Next step**)

---

**Phase 9.1 Status**: ✅ **CODE COMPLETE**

Backend implementation finished. Ready for service restart and API verification.

Next: Restart backend, test endpoints, proceed to Phase 9.2 (Circle Visualization UI).
