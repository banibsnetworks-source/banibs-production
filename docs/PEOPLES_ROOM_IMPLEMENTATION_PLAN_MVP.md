# Peoples Room Implementation Plan — MVP (Phases 1-3)

**Author**: Neo (E1 Agent)  
**Approved By**: Raymond Al Zedeck (Founder, BANIBS)  
**Date**: December 2024  
**Status**: PLANNING

---

## 📋 Executive Summary

**Peoples Room** is a personal, sovereign social space for each BANIBS user, integrated with BGLIS/BDII identity and Circle Trust Order. This plan covers **MVP implementation (Phases 1-3 only)**: Core Backend, Visitor Flows, and Basic UI.

**Scope**: 
- 3 new MongoDB collections
- 1 new service (room_permissions)
- 10+ new API endpoints
- 5+ new UI components
- Deep integration with existing trust infrastructure

**Timeline Estimate**: 3-4 days for Phases 1-3 MVP

---

## 🎯 Founder Rules (Implementation Priorities)

### **1. Sovereignty First**
User has **complete control** over:
- Who can see the room
- Who can knock
- Who can enter
- Door state (OPEN/LOCKED/DND)

**Implementation**: Tier rules are **defaults only**, never hard constraints. User can override everything via settings and Access List.

### **2. Access List Priority**
Permission resolution hierarchy (highest to lowest):
1. **Access List** (per-person overrides)
2. **Circle-based rules** (per-group permissions)
3. **Tier-based defaults** (from Circle Trust Order)
4. **Door state** (LOCKED blocks all)

**Rule**: `NEVER_ALLOW` in Access List wins over everything. `DIRECT_ENTRY` bypasses knock (unless door locked).

### **3. Safety & Trust Alignment**
- **BLOCKED users**: Cannot see room, cannot knock, cannot enter
- **SAFE MODE users**: Same restrictions unless explicitly added to Access List
- **Anomaly logging**: Track repeated denied knocks for future ADCS integration
- **Respect existing Phase B/C trust enforcement**

---

## 🏗️ Phase 1: Core Backend

### **1.1 MongoDB Collections**

#### **1.1.1 `peoples_rooms`**

**Purpose**: Stores room configuration for each user

**Schema**:
```javascript
{
  "_id": ObjectId,
  "owner_id": "<BGLIS_UUID>",  // UnifiedUser ID
  
  // Door state
  "door_state": "OPEN" | "LOCKED" | "DND",
  "presence_mode": "PUBLIC_ROOM_PRESENCE" | "GHOST_ROOM_PRESENCE",
  
  // Visibility settings
  "room_visible_to_tiers": ["PEOPLES", "COOL", "CHILL"],
  "room_visible_to_circles": ["<circle_id_1>", "<circle_id_2>"],
  "room_visible_to_users": ["<user_id_1>", "<user_id_2>"],
  
  // Visitor list visibility
  "show_visitor_list_mode": "FULL" | "OWNER_ONLY" | "NONE",
  
  // Tier-based default rules
  "tier_rules": {
    "PEOPLES": {
      "can_see_room": true,
      "can_knock": true,
      "can_enter_direct": true
    },
    "COOL": {
      "can_see_room": true,
      "can_knock": true,
      "can_enter_direct": false
    },
    "CHILL": {
      "can_see_room": true,
      "can_knock": true,
      "can_enter_direct": false
    },
    "ALRIGHT": {
      "can_see_room": false,
      "can_knock": false,
      "can_enter_direct": false
    },
    "OTHERS": {
      "can_see_room": false,
      "can_knock": false,
      "can_enter_direct": false
    },
    "OTHERS_SAFE_MODE": {
      "can_see_room": false,
      "can_knock": false,
      "can_enter_direct": false
    },
    "BLOCKED": {
      "can_see_room": false,
      "can_knock": false,
      "can_enter_direct": false
    }
  },
  
  // Per-person overrides (highest priority)
  "access_list": [
    {
      "user_id": "<BGLIS_UUID>",
      "access_mode": "DIRECT_ENTRY" | "MUST_KNOCK" | "NEVER_ALLOW",
      "temporary": false,
      "expires_at": null,  // ISODate or null
      "notes": "Mentor",  // optional
      "added_at": ISODate
    }
  ],
  
  // Circle-based access
  "allowed_circles_can_enter": ["<circle_id_1>"],
  "allowed_circles_can_knock": ["<circle_id_2>"],
  
  // Timestamps
  "created_at": ISODate,
  "updated_at": ISODate
}
```

**Indexes**:
```javascript
db.peoples_rooms.createIndex({ "owner_id": 1 }, { unique: true })
db.peoples_rooms.createIndex({ "access_list.user_id": 1 })
```

**Default Values** (on room creation):
- `door_state`: "OPEN"
- `presence_mode`: "PUBLIC_ROOM_PRESENCE"
- `room_visible_to_tiers`: ["PEOPLES", "COOL", "CHILL"]
- `show_visitor_list_mode`: "FULL"
- `tier_rules`: Use Founder-approved defaults (see schema above)
- `access_list`: []
- `allowed_circles_can_enter`: []
- `allowed_circles_can_knock`: []

---

#### **1.1.2 `room_sessions`**

**Purpose**: Tracks active room presence (who's in the room right now)

**Schema**:
```javascript
{
  "_id": ObjectId,
  "room_owner_id": "<BGLIS_UUID>",
  "is_active": true,
  "started_at": ISODate,
  "ended_at": null,  // null while active, ISODate when ended
  "current_visitors": [
    {
      "user_id": "<BGLIS_UUID>",
      "joined_at": ISODate,
      "tier": "COOL"  // Snapshot of tier at join time
    }
  ]
}
```

**Indexes**:
```javascript
db.room_sessions.createIndex({ "room_owner_id": 1, "is_active": 1 })
db.room_sessions.createIndex({ "current_visitors.user_id": 1 })
```

**Rules**:
- Only **one active session** per owner at a time
- When owner enters room: create/reactivate session
- When owner exits: set `is_active = false`, `ended_at = now`
- Visitors can only exist in an active session

---

#### **1.1.3 `room_knocks`**

**Purpose**: Tracks knock requests (pending, approved, denied, expired)

**Schema**:
```javascript
{
  "_id": ObjectId,
  "room_owner_id": "<BGLIS_UUID>",
  "visitor_id": "<BGLIS_UUID>",
  "visitor_tier": "COOL",  // Snapshot at knock time
  "status": "PENDING" | "APPROVED" | "DENIED" | "EXPIRED",
  "knock_message": "Hey, you around?",  // Optional message from visitor
  "created_at": ISODate,
  "updated_at": ISODate,
  "expires_at": ISODate,  // Auto-expire after TTL (e.g., 30 min)
  "responded_at": null,  // ISODate when owner responds
  "response_note": null  // Optional note from owner
}
```

**Indexes**:
```javascript
db.room_knocks.createIndex({ "room_owner_id": 1, "status": 1 })
db.room_knocks.createIndex({ "visitor_id": 1 })
db.room_knocks.createIndex({ "expires_at": 1 })
```

**Knock Expiry**:
- Default TTL: 30 minutes
- Background job (or check on query) to auto-expire PENDING knocks
- Expired knocks: `status = EXPIRED`

---

### **1.2 Room Permission Service**

**File**: `/app/backend/services/room_permissions.py`

**Purpose**: Centralized permission resolution for all room access checks

**Key Functions**:

#### **1.2.1 `can_see_room(owner_id, viewer_id)`**

**Logic**:
1. Get room config for `owner_id`
2. Get relationship tier between `viewer_id` and `owner_id` (via BDII)
3. If viewer is BLOCKED → **return False**
4. Check Access List:
   - If `NEVER_ALLOW` → **return False**
   - If in `room_visible_to_users` → **return True**
5. Check Circle membership:
   - If viewer in `room_visible_to_circles` → **return True**
6. Check tier rules:
   - If `tier_rules[tier]["can_see_room"] == true` → **return True**
7. Check visibility lists:
   - If tier in `room_visible_to_tiers` → **return True**
8. Default: **return False**

**Founder Rule**: Access List > Circle > Tier > Default

---

#### **1.2.2 `can_knock(owner_id, visitor_id)`**

**Logic**:
1. Get room config
2. Check door state:
   - If `door_state == LOCKED or DND` → **return False**
3. Get relationship tier (via BDII)
4. If visitor is BLOCKED or SAFE MODE → **return False**
5. Check Access List:
   - If `NEVER_ALLOW` → **return False**
   - If `DIRECT_ENTRY` → **return {"can_knock": False, "reason": "direct_entry"}** (no need to knock)
   - If `MUST_KNOCK` → **return True**
6. Check Circle:
   - If visitor in `allowed_circles_can_knock` → **return True**
7. Check tier rules:
   - If `tier_rules[tier]["can_knock"] == true` → **return True**
8. Default: **return False**

**Special Case**: If visitor already has `can_enter_direct`, they don't need to knock

---

#### **1.2.3 `can_enter_direct(owner_id, visitor_id)`**

**Logic**:
1. Get room config
2. Check door state:
   - If `door_state == LOCKED or DND` → **return False**
3. Get relationship tier
4. If visitor is BLOCKED or SAFE MODE → **return False**
5. Check Access List:
   - If `NEVER_ALLOW` → **return False**
   - If `DIRECT_ENTRY` → **return True**
6. Check Circle:
   - If visitor in `allowed_circles_can_enter` → **return True**
7. Check tier rules:
   - If `tier_rules[tier]["can_enter_direct"] == true` → **return True**
8. Default: **return False**

**Note**: This checks if user can enter **without knocking**. If False, they must knock first.

---

#### **1.2.4 `resolve_effective_room_permissions(owner_id, visitor_id)`**

**Returns**:
```python
{
  "can_see_room": bool,
  "can_knock": bool,
  "can_enter_direct": bool,
  "must_knock": bool,  # True if can enter but must knock first
  "is_blocked": bool,
  "reason": str,  # Explanation for decision
  "override_applied": str | None  # "ACCESS_LIST", "CIRCLE", "TIER", None
}
```

**Logic**: Calls all three functions above and combines into single decision object.

---

### **1.3 Core API Endpoints**

**Base Path**: `/api/rooms`

#### **1.3.1 GET `/api/rooms/me`**

**Auth**: Required (current user)

**Purpose**: Get owner's room configuration and current session status

**Response**:
```json
{
  "room": {
    "owner_id": "...",
    "door_state": "OPEN",
    "presence_mode": "PUBLIC_ROOM_PRESENCE",
    "room_visible_to_tiers": ["PEOPLES", "COOL"],
    "show_visitor_list_mode": "FULL",
    "tier_rules": {...},
    "access_list": [...],
    "created_at": "...",
    "updated_at": "..."
  },
  "session": {
    "is_active": true,
    "started_at": "...",
    "current_visitors": [...]
  } | null
}
```

**Logic**:
1. Get room from `peoples_rooms` (create if doesn't exist)
2. Get active session from `room_sessions` (if any)
3. Return combined data

---

#### **1.3.2 POST `/api/rooms/me/enter`**

**Auth**: Required (current user)

**Purpose**: Owner enters their own room (starts/reactivates session)

**Request Body**: None required

**Response**:
```json
{
  "session": {
    "room_owner_id": "...",
    "is_active": true,
    "started_at": "...",
    "current_visitors": []
  },
  "message": "You have entered your room"
}
```

**Logic**:
1. Check if active session exists
2. If yes: return existing session
3. If no: create new session:
   - `room_owner_id = current_user_id`
   - `is_active = true`
   - `started_at = now`
   - `current_visitors = []`
4. Emit WebSocket event: `ROOM_SESSION_STARTED`
5. Return session

---

#### **1.3.3 POST `/api/rooms/me/exit`**

**Auth**: Required (current user)

**Purpose**: Owner exits their room (ends session)

**Request Body**: None

**Response**:
```json
{
  "message": "You have exited your room",
  "session_ended_at": "..."
}
```

**Logic**:
1. Find active session
2. Set `is_active = false`, `ended_at = now`
3. Clear `current_visitors` (kick all visitors)
4. Emit WebSocket event: `ROOM_SESSION_ENDED`
5. Return confirmation

---

#### **1.3.4 PATCH `/api/rooms/me/settings`**

**Auth**: Required (current user)

**Purpose**: Update room configuration

**Request Body** (all fields optional):
```json
{
  "door_state": "LOCKED",
  "presence_mode": "GHOST_ROOM_PRESENCE",
  "room_visible_to_tiers": ["PEOPLES"],
  "room_visible_to_circles": ["circle_id_1"],
  "room_visible_to_users": ["user_id_1"],
  "show_visitor_list_mode": "OWNER_ONLY",
  "tier_rules": {
    "COOL": {
      "can_see_room": false,
      "can_knock": false,
      "can_enter_direct": false
    }
  }
}
```

**Response**:
```json
{
  "room": {...},  // Updated room config
  "message": "Room settings updated"
}
```

**Logic**:
1. Validate fields
2. Update room document
3. Emit WebSocket event: `ROOM_SETTINGS_UPDATED`
4. If `door_state` changed to LOCKED: kick pending knocks, optionally kick visitors
5. Return updated config

---

#### **1.3.5 GET `/api/rooms/me/knocks`**

**Auth**: Required (current user)

**Purpose**: Get list of knocks on owner's room

**Query Params**:
- `status`: "PENDING" | "APPROVED" | "DENIED" | "EXPIRED" (optional)
- `limit`: int (default: 50)

**Response**:
```json
{
  "knocks": [
    {
      "id": "...",
      "visitor_id": "...",
      "visitor_info": {
        "name": "Malik",
        "avatar_url": "..."
      },
      "visitor_tier": "COOL",
      "status": "PENDING",
      "knock_message": "You around?",
      "created_at": "...",
      "expires_at": "..."
    }
  ],
  "count": 5
}
```

**Logic**:
1. Query `room_knocks` for owner's room
2. Filter by status if provided
3. Enrich with visitor info from `banibs_users`
4. Return list

---

#### **1.3.6 POST `/api/rooms/me/knocks/{knock_id}/respond`**

**Auth**: Required (current user)

**Purpose**: Owner responds to a knock (approve or deny)

**Request Body**:
```json
{
  "action": "APPROVE" | "DENY",
  "remember_access": false,  // If true, add visitor to Access List
  "response_note": "Come on in!"  // Optional
}
```

**Response**:
```json
{
  "knock": {...},  // Updated knock record
  "message": "Knock approved",
  "visitor_can_enter": true
}
```

**Logic**:
1. Find knock by ID (must be PENDING and belong to owner)
2. If `action == APPROVE`:
   - Set `status = APPROVED`, `responded_at = now`
   - If `remember_access == true`:
     - Add visitor to Access List with `access_mode = DIRECT_ENTRY`
   - Emit WebSocket event: `ROOM_KNOCK_APPROVED` (to visitor)
3. If `action == DENY`:
   - Set `status = DENIED`, `responded_at = now`
   - Log anomaly if repeated denials (for ADCS)
   - Emit WebSocket event: `ROOM_KNOCK_DENIED` (to visitor)
4. Update knock record
5. Return result

---

#### **1.3.7 POST `/api/rooms/me/access-list`**

**Auth**: Required (current user)

**Purpose**: Add user to Access List

**Request Body**:
```json
{
  "user_id": "...",
  "access_mode": "DIRECT_ENTRY" | "MUST_KNOCK" | "NEVER_ALLOW",
  "temporary": false,
  "expires_at": null,
  "notes": "My mentor"
}
```

**Response**:
```json
{
  "access_list": [...],  // Updated list
  "message": "User added to Access List"
}
```

**Logic**:
1. Validate user exists (via BDII)
2. Check if user already in Access List (update if exists)
3. Add to `access_list` array in room config
4. Return updated list

---

#### **1.3.8 DELETE `/api/rooms/me/access-list/{user_id}`**

**Auth**: Required (current user)

**Purpose**: Remove user from Access List

**Response**:
```json
{
  "message": "User removed from Access List"
}
```

**Logic**:
1. Remove user from `access_list` array
2. Return confirmation

---

### **1.4 Phase 1 Testing**

**Unit Tests** (`/app/backend/tests/test_room_permissions.py`):
- Test permission resolution hierarchy (Access List > Circle > Tier)
- Test `NEVER_ALLOW` override
- Test `DIRECT_ENTRY` bypass
- Test BLOCKED/SAFE MODE restrictions
- Test door state (LOCKED blocks all)

**API Tests** (via testing agent or curl):
- Create room (auto-creation)
- Enter/exit room
- Update settings
- Add/remove Access List entries
- Get knocks list

**Integration Tests**:
- BDII identity resolution
- Tier lookup from relationships
- Circle membership checks

---

## 🏗️ Phase 2: Visitor Flows

### **2.1 Visitor API Endpoints**

#### **2.1.1 GET `/api/rooms/{owner_id}/status`**

**Auth**: Required (current user as visitor)

**Purpose**: Get room status and visitor's permissions

**Response**:
```json
{
  "owner": {
    "id": "...",
    "name": "Tanya",
    "avatar_url": "..."
  },
  "room": {
    "is_visible": true,
    "door_state": "OPEN",
    "owner_in_room": true,
    "visitor_count": 3,  // If allowed to see
    "visitors": [...]  // If show_visitor_list_mode allows
  },
  "permissions": {
    "can_see_room": true,
    "can_knock": true,
    "can_enter_direct": false,
    "must_knock": true,
    "is_blocked": false,
    "reason": "..."
  },
  "my_status": {
    "am_inside": false,
    "have_pending_knock": false,
    "last_knock": null
  }
}
```

**Logic**:
1. Check if visitor can see room (`can_see_room()`)
2. If not visible: return 403 or limited info
3. Get room session (owner presence)
4. Get visitor permissions (`resolve_effective_room_permissions()`)
5. Check if visitor has pending knock
6. Check if visitor is currently inside
7. Apply visitor list visibility rules
8. Return combined status

---

#### **2.1.2 POST `/api/rooms/{owner_id}/knock`**

**Auth**: Required (current user as visitor)

**Purpose**: Visitor knocks on owner's door

**Request Body**:
```json
{
  "message": "Hey, you around?"  // Optional
}
```

**Response**:
```json
{
  "knock": {
    "id": "...",
    "status": "PENDING",
    "created_at": "...",
    "expires_at": "..."
  },
  "message": "Knock sent. Waiting for approval..."
}
```

**Logic**:
1. Check `can_knock()` permission
2. If False: return 403 with reason
3. Check if visitor already has pending knock:
   - If yes: return existing knock
4. Create knock record:
   - `room_owner_id = owner_id`
   - `visitor_id = current_user_id`
   - `visitor_tier = <tier from BDII>`
   - `status = PENDING`
   - `expires_at = now + 30 minutes`
5. Emit WebSocket event: `ROOM_KNOCK_RECEIVED` (to owner)
6. Return knock record

**Rate Limiting**: Max 3 knocks per user per room per hour (prevent spam)

---

#### **2.1.3 POST `/api/rooms/{owner_id}/enter`**

**Auth**: Required (current user as visitor)

**Purpose**: Visitor enters the room

**Request Body** (optional):
```json
{
  "knock_id": "..."  // If entering via approved knock
}
```

**Response**:
```json
{
  "message": "You have entered the room",
  "session": {
    "room_owner_id": "...",
    "current_visitors": [...]
  }
}
```

**Logic**:
1. Check if owner has active session:
   - If no: return 400 "Owner is not in their room"
2. Check `can_enter_direct()`:
   - If True: allow entry immediately
3. If False, check if `knock_id` provided:
   - Verify knock is APPROVED
   - If yes: allow entry
   - If no: return 403 "You must knock first"
4. Add visitor to `room_sessions.current_visitors`:
   - `user_id`, `joined_at`, `tier`
5. Emit WebSocket event: `ROOM_VISITOR_ENTERED` (to owner + visible visitors)
6. Return confirmation

**Safety Check**: If visitor is BLOCKED or in SAFE MODE, deny entry

---

#### **2.1.4 POST `/api/rooms/{owner_id}/leave`**

**Auth**: Required (current user as visitor)

**Purpose**: Visitor leaves the room

**Request Body**: None

**Response**:
```json
{
  "message": "You have left the room"
}
```

**Logic**:
1. Find active session
2. Remove visitor from `current_visitors`
3. Emit WebSocket event: `ROOM_VISITOR_LEFT` (to owner + visible visitors)
4. Return confirmation

---

### **2.2 Knock Expiry & Cleanup**

**Background Job** (or check on query):

```python
async def expire_old_knocks():
    """Auto-expire PENDING knocks past their TTL"""
    now = datetime.now(timezone.utc)
    
    result = await db.room_knocks.update_many(
        {
            "status": "PENDING",
            "expires_at": {"$lt": now}
        },
        {
            "$set": {
                "status": "EXPIRED",
                "updated_at": now
            }
        }
    )
    
    logger.info(f"Expired {result.modified_count} old knocks")
```

**Schedule**: Run every 5 minutes (or on demand when fetching knocks)

---

### **2.3 Phase 2 Testing**

**Unit Tests**:
- Knock creation and expiry
- Enter/leave flows
- Permission checks for visitors
- Knock approval/denial

**Integration Tests**:
- Full visitor flow: see room → knock → wait → approved → enter → leave
- Test BLOCKED user cannot knock
- Test DIRECT_ENTRY bypasses knock
- Test door LOCKED blocks entry

**Backend Testing Agent**: Full visitor flows with multiple scenarios

---

## 🏗️ Phase 3: Basic UI

### **3.1 New UI Components**

#### **3.1.1 "My Room" Button**

**Location**: Global navigation bar (next to profile icon)

**Behavior**:
- Click → Navigate to `/room` (owner's room page)
- Badge indicator if user has pending knocks

---

#### **3.1.2 PeoplesRoomPage (Owner View)**

**Route**: `/room`

**Layout**:
```
┌─────────────────────────────────────────┐
│ Header: "My Room"                       │
│ Status: 🟢 In Room | 🔴 Not In Room    │
│                                         │
│ Actions:                                │
│  [Enter Room] [Exit Room] [Lock Doors] │
│  [Settings]                             │
├─────────────────────────────────────────┤
│ Current Visitors (3)                    │
│  • Malik (COOL) - joined 5 min ago     │
│  • Tanya (PEOPLES) - joined 10 min ago │
│  • Darius (PEOPLES) - joined 15 min    │
├─────────────────────────────────────────┤
│ Pending Knocks (2)                      │
│  🚪 Aaliyah (CHILL)                    │
│     "Hey, you around?"                  │
│     [Let In] [Deny]                     │
│  🚪 Marcus (COOL)                      │
│     [Let In] [Deny]                     │
└─────────────────────────────────────────┘
```

**Components**:
- `RoomHeader`: Shows status, actions
- `RoomVisitorList`: Current visitors (if `show_visitor_list_mode` allows)
- `RoomKnockList`: Pending knocks with approve/deny buttons
- `RoomSettings`: Settings panel (see 3.1.4)

**State Management**:
- Fetch room status on load: `GET /api/rooms/me`
- Real-time updates via WebSocket
- Actions call appropriate endpoints

---

#### **3.1.3 RoomPresenceIndicator (Profile Integration)**

**Location**: On user profiles (when viewing someone else's profile)

**Behavior**:
- Show "🟢 In Room" badge if:
  - Owner has active session
  - Viewer has permission to see room (`can_see_room()`)
- Show "Knock" or "Enter" button based on permissions
- Click "Knock" → Opens knock dialog
- Click "Enter" → Navigate to visitor room view

**Example**:
```
┌────────────────────────┐
│ Tanya's Profile        │
│ @tanya_peoples         │
│                        │
│ 🟢 In Room             │
│ [Knock on Door]        │
└────────────────────────┘
```

---

#### **3.1.4 RoomSettings Panel**

**Location**: Modal or sidebar on `/room`

**Sections**:

1. **Door State**:
   - Radio buttons: OPEN | LOCKED | DND
   - Help text: "While locked, no one can enter or knock"

2. **Room Visibility**:
   - Checkboxes for tiers: PEOPLES, COOL, CHILL, etc.
   - Section: "Or select specific users/circles"

3. **Visitor List Visibility**:
   - Radio: FULL | OWNER_ONLY | NONE
   - Help text: "Who can see who's inside your room"

4. **Access List** (see 3.1.5)

**Actions**:
- Save → PATCH `/api/rooms/me/settings`
- Cancel → Close modal

---

#### **3.1.5 AccessListManager Component**

**Purpose**: Add/remove users from Access List

**UI**:
```
┌──────────────────────────────────────┐
│ Access List                          │
│                                      │
│ [Search users...]                    │
│                                      │
│ Current Access List:                 │
│  • Malik (COOL)                     │
│    Mode: Direct Entry                │
│    [Edit] [Remove]                   │
│  • Tanya (PEOPLES)                  │
│    Mode: Must Knock                  │
│    [Edit] [Remove]                   │
│  • Darius (PEOPLES)                 │
│    Mode: Never Allow                 │
│    [Edit] [Remove]                   │
│                                      │
│ [+ Add User]                         │
└──────────────────────────────────────┘
```

**Actions**:
- Add user: POST `/api/rooms/me/access-list`
- Remove user: DELETE `/api/rooms/me/access-list/{user_id}`

---

#### **3.1.6 RoomVisitorView (Visitor Experience)**

**Route**: `/rooms/{owner_id}`

**Layout** (if visitor can see room):
```
┌─────────────────────────────────────────┐
│ Tanya's Room                            │
│ 🟢 Tanya is in their room               │
│                                         │
│ Your Status: Outside                    │
│                                         │
│ Actions:                                │
│  [Knock on Door] or [Enter]             │
├─────────────────────────────────────────┤
│ Inside: (if allowed to see)             │
│  • Malik (COOL)                         │
│  • Darius (PEOPLES)                     │
└─────────────────────────────────────────┘
```

**When visitor is inside**:
```
┌─────────────────────────────────────────┐
│ Tanya's Room                            │
│ 🟢 You are inside                       │
│                                         │
│ [Leave Room]                            │
├─────────────────────────────────────────┤
│ Inside:                                 │
│  • You                                  │
│  • Malik (COOL)                         │
│  • Darius (PEOPLES)                     │
│                                         │
│ (Future: Chat area here)                │
└─────────────────────────────────────────┘
```

**Actions**:
- Knock: POST `/api/rooms/{owner_id}/knock`
- Enter: POST `/api/rooms/{owner_id}/enter`
- Leave: POST `/api/rooms/{owner_id}/leave`

---

#### **3.1.7 KnockDialog Component**

**Purpose**: Dialog shown when visitor clicks "Knock"

**UI**:
```
┌────────────────────────────────────┐
│ Knock on Tanya's Door              │
│                                    │
│ [Optional message]                 │
│ ┌────────────────────────────────┐ │
│ │ Hey, you around?               │ │
│ └────────────────────────────────┘ │
│                                    │
│ [Cancel] [Send Knock]              │
└────────────────────────────────────┘
```

**After knock sent**:
```
┌────────────────────────────────────┐
│ Knock Sent                         │
│                                    │
│ ⏳ Waiting for Tanya to respond... │
│                                    │
│ Your knock will expire in 28 min  │
│                                    │
│ [OK]                               │
└────────────────────────────────────┘
```

---

### **3.2 WebSocket Integration**

**Events to Handle**:

| Event | Payload | Listeners |
|-------|---------|-----------|
| `ROOM_SESSION_STARTED` | `{ owner_id }` | Allowed viewers |
| `ROOM_SESSION_ENDED` | `{ owner_id }` | All visitors (kicked) |
| `ROOM_KNOCK_RECEIVED` | `{ knock_id, visitor_id }` | Room owner |
| `ROOM_KNOCK_APPROVED` | `{ knock_id }` | Visitor |
| `ROOM_KNOCK_DENIED` | `{ knock_id }` | Visitor |
| `ROOM_KNOCK_EXPIRED` | `{ knock_id }` | Visitor |
| `ROOM_VISITOR_ENTERED` | `{ visitor_id }` | Owner + visible visitors |
| `ROOM_VISITOR_LEFT` | `{ visitor_id }` | Owner + visible visitors |
| `ROOM_SETTINGS_UPDATED` | `{ owner_id }` | Owner |
| `ROOM_DOOR_LOCKED` | `{ owner_id }` | All visitors |

**Implementation**: Use existing WebSocket infrastructure (if any) or create new event handlers

---

### **3.3 Phase 3 Testing**

**Manual UI Testing**:
- Navigate to "My Room"
- Enter/exit room
- Lock/unlock doors
- Add users to Access List
- View pending knocks
- Approve/deny knocks

**Frontend Testing Agent**:
- Test room creation flow
- Test knock workflow end-to-end
- Test visitor entry/exit
- Test permission-based UI rendering

---

## 🔗 Integration with Existing Systems

### **4.1 BGLIS/BDII Integration**

**Identity Resolution**:
- All user IDs are BGLIS UUIDs
- Use BDII service to resolve identities
- Use existing `banibs_users` collection for user info

**Implementation**:
```python
from services.bdii.identity_resolution import resolve_identity

user = await resolve_identity(user_id)
# Returns: { id, name, email, avatar_url, ... }
```

---

### **4.2 Circle Trust Order Integration**

**Tier Resolution**:
- Use existing relationship service to get trust tier
- Default room permissions based on tier
- Respect BLOCKED and SAFE MODE

**Implementation**:
```python
from services.relationship_helper import get_relationship_tier

tier = await get_relationship_tier(owner_id, visitor_id)
# Returns: "PEOPLES" | "COOL" | "CHILL" | ... | "BLOCKED"
```

---

### **4.3 Circle Engine Integration**

**Circle Membership**:
- Check if visitor is in allowed circles
- Use for circle-based access rules

**Implementation**:
```python
from db.circle_engine import is_member_of_circle

is_member = await is_member_of_circle(visitor_id, circle_id)
# Returns: bool
```

---

### **4.4 Trust Logger Integration**

**Anomaly Logging**:
- Log repeated denied knocks
- Log suspicious access patterns
- Feed into future ADCS

**Implementation**:
```python
from services.trust_logger import get_trust_logger

logger = get_trust_logger()
logger.log_permission_check(
    check_type="room_knock",
    viewer_tier=visitor_tier,
    action="knock_denied",
    decision="deny",
    details={
        "room_owner_id": owner_id,
        "visitor_id": visitor_id,
        "reason": "repeated_knocks"
    }
)
```

---

## 📋 Safety & Abuse Prevention

### **5.1 BLOCKED/SAFE MODE Enforcement**

**Rules**:
- BLOCKED users:
  - Cannot see room existence
  - Cannot knock
  - Cannot enter
  - Filtered out at API level
- SAFE MODE users:
  - Same restrictions unless explicitly in Access List

**Implementation**: Check in all permission functions

---

### **5.2 Rate Limiting**

**Knock Spam Prevention**:
- Max 3 knocks per user per room per hour
- If exceeded: return 429 Too Many Requests
- Log excessive knocking attempts

**Implementation**:
```python
# In knock endpoint
knock_count = await db.room_knocks.count_documents({
    "room_owner_id": owner_id,
    "visitor_id": visitor_id,
    "created_at": {"$gte": one_hour_ago}
})

if knock_count >= 3:
    raise HTTPException(429, "Too many knock attempts. Please wait.")
```

---

### **5.3 Forced Removal**

**Tier Change Behavior**:
- If visitor's tier changes to BLOCKED mid-session:
  - Remove them from room immediately
  - Emit `ROOM_VISITOR_KICKED` event

**Implementation**: Background job or on permission check

---

## 🧪 Testing Strategy

### **6.1 Unit Tests**

**Permission Service** (`test_room_permissions.py`):
- Test hierarchy: Access List > Circle > Tier
- Test `NEVER_ALLOW` override
- Test `DIRECT_ENTRY` bypass
- Test BLOCKED/SAFE MODE restrictions
- Test door state blocking

**Models** (`test_room_models.py`):
- Test room creation with defaults
- Test session lifecycle
- Test knock expiry

---

### **6.2 Integration Tests**

**API Tests** (via testing agent):
- Full owner flow: create → enter → exit → settings
- Full visitor flow: see room → knock → approve → enter → leave
- Access List management
- Knock approval/denial

**Permission Tests**:
- PEOPLES tier direct entry
- COOL tier knock required
- BLOCKED tier denied
- Access List override

---

### **6.3 Frontend Tests**

**UI Tests** (via frontend testing agent):
- Navigate to "My Room"
- Enter/exit room
- Knock workflow
- Settings panel interactions

---

## 📊 Timeline Estimate

### **Phase 1: Core Backend** (Day 1-2)
- MongoDB collections: 2 hours
- Permission service: 4 hours
- Core API endpoints: 6 hours
- Unit tests: 4 hours
- **Total: ~16 hours (2 days)**

### **Phase 2: Visitor Flows** (Day 2-3)
- Visitor endpoints: 4 hours
- Knock system: 4 hours
- Integration with BDII/Trust: 3 hours
- Testing: 3 hours
- **Total: ~14 hours (1.5 days)**

### **Phase 3: Basic UI** (Day 3-4)
- UI components: 8 hours
- WebSocket integration: 4 hours
- Testing: 4 hours
- **Total: ~16 hours (2 days)**

**Overall MVP Timeline**: 3-4 days for Phases 1-3

---

## ✅ MVP Completion Criteria

**Phase 1 Complete When**:
- ✅ All 3 collections created with indexes
- ✅ Permission service working with all checks
- ✅ Owner can enter/exit room
- ✅ Owner can update settings
- ✅ Owner can manage Access List
- ✅ Unit tests passing

**Phase 2 Complete When**:
- ✅ Visitor can see room status
- ✅ Visitor can knock
- ✅ Owner can approve/deny knocks
- ✅ Visitor can enter (direct or via approved knock)
- ✅ Visitor can leave
- ✅ BLOCKED users properly restricted
- ✅ Integration tests passing

**Phase 3 Complete When**:
- ✅ "My Room" page functional (owner view)
- ✅ Room presence indicator on profiles
- ✅ Knock/Enter buttons work
- ✅ Settings panel functional
- ✅ Access List UI working
- ✅ Real-time updates via WebSocket
- ✅ Frontend tests passing

---

## 🚀 Future Enhancements (Post-MVP)

**Phase 4**: Real-time polish, advanced WebSockets  
**Phase 5**: In-room chat, audio/video, room themes, monetization

These are **out of scope** for MVP but the architecture will support them.

---

## 📝 Open Questions / Decisions Needed

### **Q1: Visitor Kick Policy**
When owner locks doors or exits room, should existing visitors be:
- **Option A**: Immediately kicked
- **Option B**: Allowed to remain but no new entries

**Recommendation**: Option A (immediate kick) for simplicity

### **Q2: Knock TTL**
Default knock expiry time:
- **Option A**: 30 minutes (proposed)
- **Option B**: 1 hour
- **Option C**: Configurable by owner

**Recommendation**: Option A (30 min) for MVP

### **Q3: WebSocket Infrastructure**
Does BANIBS already have WebSocket support, or should I create it as part of this?
- If exists: integrate
- If not: create basic WebSocket handler for room events

**Recommendation**: Check existing infrastructure first

---

## ✅ Next Steps

1. **Founder Review**: Raymond reviews this plan
2. **Approval**: Founder approves or requests changes
3. **Phase 1 Implementation**: Begin coding backend
4. **Phase 2 Implementation**: Visitor flows
5. **Phase 3 Implementation**: UI
6. **Testing & Iteration**: Backend testing agent + manual testing
7. **Documentation**: Update docs with final implementation details

---

**End of Implementation Plan**

**Status**: ⏸️ AWAITING FOUNDER APPROVAL TO BEGIN CODING

**Next Action**: Raymond reviews plan → Approves → Neo begins Phase 1 implementation
