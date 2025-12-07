# BANIBS Waitlist System

## Overview

The BANIBS waitlist system captures email signups from the Coming Soon page and notifies the team in real-time.

---

## MongoDB Collection

### `waitlist_emails`

**Document Structure**:
```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "submitted_at": "2024-12-07T10:30:00Z",
  "source": "coming_soon_v2",
  "ip_address": "192.168.1.1"
}
```

**Fields**:
- `email` (string): User's email address (lowercase, trimmed)
- `submitted_at` (datetime): UTC timestamp of submission
- `source` (string): Source of signup (e.g. "coming_soon_v2")
- `ip_address` (string, optional): IP address of submitter

**Indexes**:
```javascript
db.waitlist_emails.createIndex({ "email": 1 }, { unique: true })
db.waitlist_emails.createIndex({ "submitted_at": -1 })
```

---

## API Endpoints

### POST /api/waitlist/subscribe

Subscribe to the BANIBS waitlist.

**Request**:
```json
{
  "email": "user@example.com"
}
```

**Response (Success)**:
```json
{
  "success": true,
  "message": "You're on the list. We'll reach out when there's a real update.",
  "email": "user@example.com"
}
```

**Response (Already Subscribed)**:
```json
{
  "success": true,
  "message": "You're already on the list. We'll reach out when there's a real update.",
  "email": "user@example.com"
}
```

**Response (Error)**:
```json
{
  "detail": "We couldn't save your email right now. Please try again in a moment."
}
```

**Status Codes**:
- `200`: Success (new or existing subscription)
- `500`: Server error

---

### GET /api/waitlist/health

Health check for waitlist service.

**Response**:
```json
{
  "status": "healthy",
  "service": "Waitlist",
  "email_service_enabled": true
}
```

---

### GET /api/waitlist/count

Get total number of waitlist signups.

**Response**:
```json
{
  "count": 1234
}
```

---

## Email Notifications

### Configuration

Email notifications are sent via SMTP. Configure using environment variables in `/app/backend/.env`:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM_EMAIL=noreply@banibs.com
```

**Note**: For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password.

### Notification Details

**Triggered On**: Every successful waitlist signup

**To**: `waitlist@banibs.com`

**BCC**: `RaymondNeely@banibs.com`

**Subject**: "New BANIBS waitlist signup"

**Body**:
```
New waitlist signup received:

Email: user@example.com
Submitted at: 2024-12-07T10:30:00Z
Source: coming_soon_v2

---
BANIBS Waitlist System
```

**Behavior**:
- If email fails to send, the signup is still saved to MongoDB
- Email failures are logged but do not affect the user experience
- User always sees success message if MongoDB save succeeds

---

## Frontend Integration

### Coming Soon Page

**File**: `/app/frontend/src/pages/ComingSoonPage.jsx`

**Behavior**:
1. User enters email and clicks "Notify me when we open"
2. Frontend calls `POST /api/waitlist/subscribe`
3. On success: Shows "You're on the list" message
4. On error: Shows "We couldn't save your email right now..." message

**Environment Variable**:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## Testing

### Test Signup (Local Development)

```bash
curl -X POST http://localhost:8001/api/waitlist/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### Check Waitlist Count

```bash
curl http://localhost:8001/api/waitlist/count
```

### Verify in MongoDB

```javascript
// Connect to MongoDB
use banibs_db

// View all waitlist entries
db.waitlist_emails.find().pretty()

// Count total signups
db.waitlist_emails.count()

// Find specific email
db.waitlist_emails.findOne({ email: "test@example.com" })
```

---

## Security Considerations

1. **Email Validation**: Basic format validation via Pydantic's `EmailStr`
2. **Duplicate Prevention**: Unique index on email field
3. **IP Logging**: Optional IP address capture for abuse detection
4. **Rate Limiting**: Consider adding rate limiting in production
5. **SPAM Protection**: Consider adding reCAPTCHA in future

---

## Monitoring

### Key Metrics to Track

- Total signups per day/week/month
- Signup source distribution
- Email delivery success rate
- Duplicate submission attempts

### MongoDB Queries

**Signups in last 24 hours**:
```javascript
db.waitlist_emails.count({
  submitted_at: {
    $gte: new Date(Date.now() - 24*60*60*1000)
  }
})
```

**Signups by source**:
```javascript
db.waitlist_emails.aggregate([
  { $group: { _id: "$source", count: { $sum: 1 } } }
])
```

---

## Troubleshooting

### Email Not Sending

1. Check SMTP configuration in `.env`
2. Verify credentials are correct
3. For Gmail, ensure App Password is used
4. Check backend logs: `tail -f /var/log/supervisor/backend.*.log`

### Signups Not Saving

1. Verify MongoDB connection
2. Check for unique constraint violations (duplicate emails)
3. Review backend logs for errors

### Frontend Not Connecting

1. Verify `REACT_APP_BACKEND_URL` is set correctly
2. Check CORS configuration in backend
3. Inspect browser console for errors

---

## Future Enhancements

- [ ] Export waitlist to CSV
- [ ] Admin dashboard to view signups
- [ ] Email verification (confirm email addresses)
- [ ] Segmentation by source/date
- [ ] Automated welcome email to subscribers
- [ ] Integration with email marketing platform
- [ ] GDPR compliance tools (export/delete user data)

---

## Files

**Backend**:
- `/app/backend/models/waitlist.py` - Data models
- `/app/backend/routes/waitlist/waitlist_routes.py` - API endpoints
- `/app/backend/services/email/email_service.py` - Email service

**Frontend**:
- `/app/frontend/src/pages/ComingSoonPage.jsx` - Coming Soon page with form

**Documentation**:
- `/app/WAITLIST_SYSTEM.md` - This file

---

**Status**: ✅ Production Ready

**Last Updated**: December 2024
