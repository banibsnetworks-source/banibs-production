# BANIBS – Phase 6.2.2 Messaging System
**Module:** Messaging (One-on-One)  
**Status:** Backend COMPLETE ✅ | Frontend INTEGRATION 🟡  
**Auth:** All routes require valid JWT (BANIBS unified auth from Phase 6.0)  
**Version:** 1.0  
**Last Updated:** November 2, 2025

---

## 1. Overview

The BANIBS Messaging System API powers the in-app messaging feature introduced in Phase 6.2.2 (Week 2). This API enables authenticated users to:

- **List conversations** (inbox view)
- **Fetch messages** for a specific conversation
- **Start new conversations** or find existing ones with other users
- **Send messages** with automatic XSS sanitization
- **Mark conversations as read** to update unread counts
- **Retrieve unread counts** for badge notifications in TopNav

### Key Characteristics

- **User-scoped**: All endpoints are participant-validated. Users can only access conversations they're part of.
- **One-on-One Only (v1)**: Current implementation supports 2-participant conversations. Data model is designed for future group chat expansion.
- **Real-time Updates**: v1 uses 30-second polling. WebSocket implementation planned for Phase 6.3.
- **Security**: JWT authentication required, XSS prevention via HTML sanitization, participant authorization enforced.

---

## 2. Database Collections

### 2.1 `banibs_conversations`

Stores conversation metadata and participant information.

```javascript
{
  id: "uuid",                               // Unique conversation identifier
  participants: ["user_uuid_1", "user_uuid_2"], // Array of participant UUIDs (sorted)
  participant_details: [                    // Cached participant info
    {
      id: "user_uuid_1",
      name: "John Doe",
      avatar_url: "https://..."
    },
    {
      id: "user_uuid_2",
      name: "Jane Smith",
      avatar_url: "https://..."
    }
  ],
  last_message: "Hello, how are you?",      // Last message content (truncated to 100 chars)
  last_message_at: Date,                    // Timestamp of last message (for sorting)
  created_at: Date,                         // Conversation creation timestamp
  updated_at: Date,                         // Last update timestamp
  unread_count: 3                           // Computed per-user (not stored in DB)
}
```

**Indexes**:
- `participants` (array index for user lookup)
- `last_message_at` (descending for inbox sorting)

**Design Notes**:
- `participants` array is always sorted for consistent lookups
- Future group chat: Expand `participants` array to 3+ users
- `unread_count` is computed dynamically for each user (not stored in conversation document)

### 2.2 `banibs_messages`

Stores individual messages within conversations.

```javascript
{
  id: "uuid",                               // Unique message identifier
  conversation_id: "uuid",                  // Reference to conversation
  sender_id: "uuid",                        // UUID of message sender
  sender_name: "John Doe",                  // Cached sender name (for display)
  content: "Hello, how are you?",           // Message content (HTML-escaped)
  read: false,                              // Read status (per message, not per user)
  created_at: Date                          // Message timestamp
}
```

**Indexes**:
- `conversation_id` (for fetching conversation messages)
- `conversation_id + created_at` (compound index for sorted message retrieval)
- `conversation_id + sender_id + read` (for unread count queries)

**Design Notes**:
- `content` is automatically sanitized via `html.escape()` on creation
- `read` flag is simple boolean in v1 (works for 1-on-1). For group chat, would need per-user read tracking.
- Maximum content length: 5000 characters (enforced by Pydantic)

---

## 3. API Endpoints

### Base URL
```
https://your-domain.com/api/messages
```

### Authentication Header
All endpoints require JWT authentication:
```
Authorization: Bearer <access_token>
```

---

### 3.1 GET `/api/messages/conversations`

**Description**: List all conversations for the authenticated user (inbox view).

**Auth**: Required (JWT)

**Query Parameters**:
| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `limit` | int | 50 | 1-100 | Maximum conversations to return |
| `skip` | int | 0 | ≥0 | Number to skip for pagination |

**Request Example**:
```http
GET /api/messages/conversations?limit=20&skip=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK)**:
```json
[
  {
    "id": "conv-uuid-1",
    "participants": ["user-uuid-1", "user-uuid-2"],
    "participant_details": [
      {
        "id": "user-uuid-1",
        "name": "John Doe",
        "avatar_url": "https://cdn.banibs.com/avatars/john.jpg"
      },
      {
        "id": "user-uuid-2",
        "name": "Jane Smith",
        "avatar_url": null
      }
    ],
    "last_message": "Thanks for your help!",
    "last_message_at": "2025-11-02T14:30:00Z",
    "unread_count": 2,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-02T14:30:00Z"
  }
]
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `422 Unprocessable Entity`: Invalid query parameters (e.g., limit > 100)

**Notes**:
- Conversations are sorted by `last_message_at` descending (most recent first)
- `unread_count` is computed per request for the current user
- Empty array `[]` returned if user has no conversations

---

### 3.2 GET `/api/messages/conversations/{id}`

**Description**: Get a conversation with all its messages.

**Auth**: Required (JWT)

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `conversation_id` | string | UUID of the conversation |

**Query Parameters**:
| Parameter | Type | Default | Range | Description |
|-----------|------|---------|-------|-------------|
| `limit` | int | 100 | 1-200 | Maximum messages to return |
| `skip` | int | 0 | ≥0 | Number to skip for pagination |

**Request Example**:
```http
GET /api/messages/conversations/conv-uuid-1?limit=50&skip=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK)**:
```json
{
  "conversation": {
    "id": "conv-uuid-1",
    "participants": ["user-uuid-1", "user-uuid-2"],
    "participant_details": [
      {
        "id": "user-uuid-1",
        "name": "John Doe",
        "avatar_url": "https://cdn.banibs.com/avatars/john.jpg"
      },
      {
        "id": "user-uuid-2",
        "name": "Jane Smith",
        "avatar_url": null
      }
    ],
    "last_message": "Thanks for your help!",
    "last_message_at": "2025-11-02T14:30:00Z",
    "unread_count": 2,
    "created_at": "2025-11-01T10:00:00Z",
    "updated_at": "2025-11-02T14:30:00Z"
  },
  "messages": [
    {
      "id": "msg-uuid-1",
      "conversation_id": "conv-uuid-1",
      "sender_id": "user-uuid-1",
      "sender_name": "John Doe",
      "content": "Hi, I need help with my business listing.",
      "read": true,
      "created_at": "2025-11-02T14:00:00Z"
    },
    {
      "id": "msg-uuid-2",
      "conversation_id": "conv-uuid-1",
      "sender_id": "user-uuid-2",
      "sender_name": "Jane Smith",
      "content": "Sure, what do you need?",
      "read": true,
      "created_at": "2025-11-02T14:15:00Z"
    },
    {
      "id": "msg-uuid-3",
      "conversation_id": "conv-uuid-1",
      "sender_id": "user-uuid-1",
      "sender_name": "John Doe",
      "content": "Thanks for your help!",
      "read": false,
      "created_at": "2025-11-02T14:30:00Z"
    }
  ]
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Conversation not found or user is not a participant

**Notes**:
- Messages are sorted by `created_at` ascending (oldest first, like a chat)
- Participant authorization is enforced (404 if user is not in conversation)
- Use pagination for long conversations (skip/limit)

---

### 3.3 POST `/api/messages/conversations`

**Description**: Start a new conversation or find an existing one with another user.

**Auth**: Required (JWT)

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `other_user_id` | string | Yes | UUID of the user to message |

**Request Example**:
```http
POST /api/messages/conversations?other_user_id=user-uuid-2
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK - Existing Conversation)**:
```json
{
  "id": "conv-uuid-1",
  "participants": ["user-uuid-1", "user-uuid-2"],
  "participant_details": [
    {
      "id": "user-uuid-1",
      "name": "John Doe",
      "avatar_url": "https://cdn.banibs.com/avatars/john.jpg"
    },
    {
      "id": "user-uuid-2",
      "name": "Jane Smith",
      "avatar_url": null
    }
  ],
  "last_message": "Thanks for your help!",
  "last_message_at": "2025-11-02T14:30:00Z",
  "unread_count": 0,
  "created_at": "2025-11-01T10:00:00Z",
  "updated_at": "2025-11-02T14:30:00Z"
}
```

**Response (201 Created - New Conversation)**:
```json
{
  "id": "conv-uuid-new",
  "participants": ["user-uuid-1", "user-uuid-3"],
  "participant_details": [
    {
      "id": "user-uuid-1",
      "name": "John Doe",
      "avatar_url": "https://cdn.banibs.com/avatars/john.jpg"
    },
    {
      "id": "user-uuid-3",
      "name": "Bob Johnson",
      "avatar_url": null
    }
  ],
  "last_message": null,
  "last_message_at": null,
  "unread_count": 0,
  "created_at": "2025-11-02T15:00:00Z",
  "updated_at": "2025-11-02T15:00:00Z"
}
```

**Error Responses**:
- `400 Bad Request`: Cannot start conversation with yourself
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Other user does not exist

**Notes**:
- Idempotent: Returns existing conversation if one already exists between the two users
- Prevents self-messaging (400 error)
- Automatically caches participant details from user database

---

### 3.4 POST `/api/messages/conversations/{id}/send`

**Description**: Send a message in an existing conversation.

**Auth**: Required (JWT)

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `conversation_id` | string | UUID of the conversation |

**Request Body**:
```json
{
  "content": "Hello, how can I help you?"
}
```

**Request Example**:
```http
POST /api/messages/conversations/conv-uuid-1/send
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{
  "content": "Hello, how can I help you?"
}
```

**Response (200 OK)**:
```json
{
  "id": "msg-uuid-new",
  "conversation_id": "conv-uuid-1",
  "sender_id": "user-uuid-1",
  "sender_name": "John Doe",
  "content": "Hello, how can I help you?",
  "read": false,
  "created_at": "2025-11-02T15:30:00Z"
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Conversation not found or user is not a participant
- `422 Unprocessable Entity`: Content empty or exceeds 5000 characters

**Notes**:
- Content is automatically sanitized via `html.escape()` to prevent XSS
- Maximum content length: 5000 characters (enforced by Pydantic)
- Automatically updates conversation's `last_message` and `last_message_at`
- Message is marked as `read: false` by default

---

### 3.5 PATCH `/api/messages/conversations/{id}/read`

**Description**: Mark all messages in a conversation as read for the current user.

**Auth**: Required (JWT)

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `conversation_id` | string | UUID of the conversation |

**Request Example**:
```http
PATCH /api/messages/conversations/conv-uuid-1/read
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK)**:
```json
{
  "marked_read": 3
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token
- `404 Not Found`: Conversation not found or user is not a participant

**Notes**:
- Only marks messages **not sent by the current user** as read
- Returns count of messages marked as read
- Used when user opens a conversation (ConversationView component)
- Updates unread_count to 0 for this conversation

---

### 3.6 GET `/api/messages/unread-count`

**Description**: Get total unread message count across all conversations for the current user.

**Auth**: Required (JWT)

**Request Example**:
```http
GET /api/messages/unread-count
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**Response (200 OK)**:
```json
{
  "unread_count": 5
}
```

**Error Responses**:
- `401 Unauthorized`: Missing or invalid JWT token

**Notes**:
- Used by TopNav to display unread message badge
- Frontend polls this endpoint every 30 seconds (v1)
- Phase 6.3 will replace polling with WebSocket push notifications

---

## 4. Security Features

### 4.1 Authentication
- **JWT Required**: All endpoints require valid access token from Phase 6.0 Unified Auth
- **Token Validation**: Tokens are verified using `JWTService.verify_token()`
- **User Context**: User ID extracted from token payload (`current_user["id"]`)

### 4.2 Auth & Expired Token Behavior
- **Expired Token**: All messaging endpoints return `401 Unauthorized` when JWT token expires (15-minute lifespan)
- **Frontend Redirect**: On 401 response, frontend should redirect to `/login?return=/messages` or `/login?return=/hub`
  - Preserves user context: After re-authentication, user lands back in the messaging interface
  - Example: User viewing `/messages/conv-123` → token expires → redirect to `/login?return=/messages/conv-123`
- **Token Refresh**: Frontend can attempt to refresh token using `/api/auth/refresh` before redirecting to login
- **Graceful UX**: Display "Session expired, please login again" message before redirect

**Implementation Example** (Frontend):
```javascript
// In API error handler
if (response.status === 401) {
  const returnUrl = window.location.pathname;
  localStorage.removeItem('accessToken');
  navigate(`/login?return=${encodeURIComponent(returnUrl)}`);
}
```

### 4.3 Authorization
- **Participant Validation**: Users can only access conversations they're part of
- **Automatic Filtering**: DB queries filter by `participants` array
- **404 on Unauthorized**: Returns "Not found" instead of "Forbidden" to prevent conversation enumeration

### 4.4 Input Sanitization
- **XSS Prevention**: Message content sanitized via `html.escape()` before storage
- **Length Limits**: Message content max 5000 characters (Pydantic validation)
- **Query Parameter Validation**: FastAPI validates limit/skip ranges

### 4.4 Privacy
- **Self-Messaging Blocked**: Cannot start conversation with yourself (400 error)
- **User Existence Check**: Validates recipient exists before creating conversation
- **No Message Enumeration**: Cannot access messages without conversation membership

### 4.5 Error Handling
- **Generic 404**: "Not found" for both non-existent and unauthorized resources
- **No User Details Leaked**: Error messages don't reveal other users' existence
- **Safe Error Responses**: No stack traces or internal details exposed

---

## 5. Frontend Usage Map

### 5.1 TopNav Component (`/app/frontend/src/pages/Hub/TopNav.js`)

**Endpoints Used**:
- `GET /api/messages/unread-count` - Polls every 30s for badge count
- `GET /api/messages/conversations?limit=5` - Dropdown shows latest 5 conversations

**Behavior**:
```javascript
useEffect(() => {
  fetchUnreadCount(); // Initial fetch
  const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
  return () => clearInterval(interval);
}, []);
```

**UI Elements**:
- 💬 Message icon with red badge showing unread count
- Dropdown preview: Latest 5 conversations with last message
- "View All Messages" link → `/messages`

---

### 5.2 InboxPage Component (`/app/frontend/src/pages/Messages/InboxPage.js`)

**Endpoints Used**:
- `GET /api/messages/conversations?limit=50` - Full conversation list
- `POST /api/messages/conversations?other_user_id={id}` - Start new conversation (from "New Message" button)

**Behavior**:
```javascript
useEffect(() => {
  fetchConversations(); // On mount
}, []);
```

**UI Elements**:
- List of conversations (avatar, name, last message, timestamp, unread badge)
- Search bar (client-side filter by participant name)
- "New Message" button → opens modal to select user
- Click conversation → navigate to `/messages/{conversation_id}`

---

### 5.3 ConversationView Component (`/app/frontend/src/pages/Messages/ConversationView.js`)

**Endpoints Used**:
- `GET /api/messages/conversations/{id}` - Load conversation + messages on mount
- `POST /api/messages/conversations/{id}/send` - Send new message
- `PATCH /api/messages/conversations/{id}/read` - Mark as read on mount

**Behavior**:
```javascript
useEffect(() => {
  fetchConversationWithMessages(); // On mount
  markAsRead(); // Mark as read when opened
}, [conversationId]);
```

**UI Elements**:
- Chat-style message list (bubbles aligned left/right by sender)
- Message input at bottom (textarea + send button)
- Auto-scroll to bottom on new message
- Sender avatar + name displayed with each message

---

## 6. Testing Checklist

### 6.1 Authentication Tests
- [ ] All endpoints return 401 without Authorization header
- [ ] All endpoints return 401 with invalid/expired token
- [ ] All endpoints return 401 with token from different user

### 6.2 Conversation Tests
- [ ] **List Conversations**: Returns user's conversations sorted by last_message_at
- [ ] **List Conversations**: Returns empty array for user with no conversations
- [ ] **Get Conversation**: Returns 404 for non-existent conversation
- [ ] **Get Conversation**: Returns 404 for conversation user is not part of
- [ ] **Start Conversation**: Creates new conversation with valid other_user_id
- [ ] **Start Conversation**: Returns existing conversation if already exists
- [ ] **Start Conversation**: Returns 400 when trying to message self
- [ ] **Start Conversation**: Returns 404 for non-existent other_user_id

### 6.3 Message Tests
- [ ] **Send Message**: Creates message in conversation
- [ ] **Send Message**: Updates conversation's last_message and last_message_at
- [ ] **Send Message**: Returns 404 for non-existent conversation
- [ ] **Send Message**: Returns 404 if user is not conversation participant
- [ ] **Send Message**: Returns 422 for empty content
- [ ] **Send Message**: Returns 422 for content > 5000 characters
- [ ] **Send Message**: Sanitizes HTML content (e.g., `<script>` → `&lt;script&gt;`)

### 6.4 Unread Count Tests
- [ ] **Unread Count**: Returns correct count across all conversations
- [ ] **Unread Count**: Updates after sending message (recipient's count increases)
- [ ] **Mark as Read**: Reduces unread count to 0 for conversation
- [ ] **Mark as Read**: Only marks messages from other user as read (not own messages)
- [ ] **Mark as Read**: Returns 404 for non-existent conversation

### 6.5 Integration Tests
- [ ] User A starts conversation with User B
- [ ] User A sends message to User B
- [ ] User B sees unread count increase
- [ ] User B opens conversation and unread count resets
- [ ] User B sends reply
- [ ] User A sees unread count increase
- [ ] Both users see conversation in their inbox

### 6.6 Security Tests
- [ ] Cannot access another user's conversations
- [ ] Cannot send message in conversation user is not part of
- [ ] XSS attempts are sanitized (`<script>alert('xss')</script>`)
- [ ] SQL injection attempts are blocked (parameterized queries)
- [ ] Cannot enumerate conversations by guessing IDs (returns 404)

---

## 7. Notes for Phase 6.3

### 7.1 Planned Upgrades

**WebSocket Real-Time Updates** (`/ws/messages`):
```javascript
// Future implementation
const ws = new WebSocket('wss://api.banibs.com/ws/messages?token={jwt}');

ws.onmessage = (event) => {
  const { type, conversation_id, message } = JSON.parse(event.data);
  
  if (type === 'new_message') {
    // Update conversation in real-time
    updateConversation(conversation_id, message);
  } else if (type === 'typing_indicator') {
    // Show "User is typing..."
    showTypingIndicator(conversation_id);
  }
};
```

**Typing Indicators**:
- Send `typing_start` event when user begins typing
- Send `typing_stop` event 3 seconds after last keystroke
- Display "John is typing..." in ConversationView

**File Attachments**:
```javascript
POST /api/messages/conversations/{id}/send
Content-Type: multipart/form-data

{
  content: "Check out this document",
  attachments: [File]  // Max 5 files, 10MB each
}
```

**Group Chat Support**:
- Expand `participants` array to 3+ users
- Add conversation `type` field: "direct" | "group"
- Add `name` field for group conversations
- Per-user read tracking (replace boolean `read` with `read_by` array)

**Message Reactions**:
```javascript
POST /api/messages/{message_id}/react
{
  reaction: "❤️" | "👍" | "😂" | "😮" | "😢" | "🙏"
}
```

**Message Search**:
```javascript
GET /api/messages/search?q=grant+opportunity
// Full-text search across message content
```

**Push Notifications**:
- Integrate with notification system (Phase 6.2.1)
- Send notification when user receives message while offline
- Notification links to conversation

---

## 8. Database Migration Notes

### 8.1 Collections Created

```javascript
// Create indexes for optimal performance
db.banibs_conversations.createIndex({ "participants": 1 });
db.banibs_conversations.createIndex({ "last_message_at": -1 });

db.banibs_messages.createIndex({ "conversation_id": 1, "created_at": 1 });
db.banibs_messages.createIndex({ "conversation_id": 1, "sender_id": 1, "read": 1 });
```

### 8.2 Future Schema Changes

**For Group Chat** (Phase 6.3+):
```javascript
// Add to banibs_conversations
{
  type: "direct" | "group",
  name: "Project Team Chat",  // For group conversations
  avatar_url: "https://...",  // Group avatar
}

// Update banibs_messages
{
  read_by: ["user_uuid_1", "user_uuid_2"],  // Replace boolean read
}
```

---

## 9. Performance Considerations

### 9.1 Current Optimizations
- **Pagination**: All list endpoints support limit/skip
- **Indexes**: Optimized queries on participants, timestamps
- **Caching**: Participant details cached in conversation (no join needed)
- **Truncation**: last_message truncated to 100 chars (inbox performance)

### 9.2 Monitoring Metrics
- Average conversation list load time: < 500ms
- Average message fetch time: < 300ms
- Unread count query time: < 100ms
- Send message latency: < 200ms

### 9.3 Scalability Notes
- Current design supports ~10,000 messages per conversation
- For high-volume conversations, implement message archiving
- Consider read-replica for unread count queries (read-heavy)

---

## 10. Changelog

### Version 1.0 (November 2, 2025)
- Initial release
- 6 API endpoints implemented
- One-on-one messaging support
- XSS sanitization
- Participant authorization
- Unread count tracking

---

**Document Author**: AI Engineer (Neo)  
**Last Updated**: November 2, 2025  
**Status**: Backend COMPLETE ✅ | Frontend INTEGRATION 🟡  
**Next Phase**: Frontend integration + E2E testing
