# Circle-Based Visibility V1

## Overview
Circle-Based Visibility V1 is a privacy and access control feature that allows users to target their posts to specific circles with tier-based viewing restrictions.

## Feature Flag
`CIRCLE_VISIBILITY_V1=true` in `/app/backend/.env`

## Core Concepts

### Target Types
- **GLOBAL**: Visible to everyone (default)
- **CIRCLE**: Visible only to members of a specific circle who meet the tier requirement

### Trust Tier Hierarchy
Tiers are ordered from lowest to highest access:
1. `OTHERS` - Default tier for new connections
2. `ALRIGHT` - Basic trusted members
3. `COOL` - Trusted inner circle
4. `PEOPLES` - Closest connections (self always has PEOPLES access)

### Access Rules
- **GLOBAL posts**: Visible to everyone regardless of tier
- **CIRCLE posts**: Visible only if:
  1. Viewer is a member of the target circle
  2. Author's tier for the viewer meets or exceeds `min_tier_to_view`
  3. Post hasn't expired (if `expires_at` is set)

## API Endpoints

### Get User's Circles
```
GET /api/circles/my-circles
Authorization: Bearer <token>
```
Returns circles where the current user is an active member.

### Circle Feed
```
GET /api/social/circles/{circle_id}/feed
Authorization: Bearer <token>
Query params: page (int), page_size (int)
```
Returns posts targeted to a specific circle. User must be a member.

### Create Circle-Targeted Post
```
POST /api/social/posts
Authorization: Bearer <token>
Body:
{
  "text": "Post content",
  "target_type": "CIRCLE",
  "target_circle_id": "circle-black-entrepreneurs",
  "min_tier_to_view": "ALRIGHT"
}
```

## Frontend Components

### CircleTargetSelector
Located: `/app/frontend/src/components/social/CircleTargetSelector.jsx`
- Dropdown to select Global or a specific circle
- When circle selected, shows tier selector (OTHERS/ALRIGHT/COOL/PEOPLES)

### CircleFeedPage
Located: `/app/frontend/src/pages/circles/CircleFeedPage.jsx`
- Route: `/circle/:circleId/feed`
- Displays posts from a specific circle
- Membership-gated access

### SocialPostCard Updates
- Circle badge shown for circle-targeted posts
- Tier badge shown when tier > OTHERS
- Expiry badge for ephemeral posts

## Data Model Extensions

### social_posts
```javascript
{
  target_type: "GLOBAL" | "CIRCLE",
  target_circle_id: string | null,
  min_tier_to_view: "OTHERS" | "ALRIGHT" | "COOL" | "PEOPLES",
  expires_at: datetime | null
}
```

### circles
```javascript
{
  is_ephemeral: boolean,
  lifespan_seconds: int | null,
  expires_at: datetime | null
}
```

## Testing
Backend tests: `/app/backend/tests/test_circle_visibility.py`
- 17 tests covering tier comparison, asymmetry, feature flags, and model fields

## Implementation Date
March 2, 2026

## Status
MVP Complete - Backend + Frontend UI implemented and tested
