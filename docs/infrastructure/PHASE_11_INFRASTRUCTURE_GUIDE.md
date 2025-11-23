# Phase 11+ Infrastructure Guide

## Overview

This guide documents the modular infrastructure created to support BANIBS Phase 11+ expansion. The system is designed to make it easy to add new portal modules without extensive refactoring.

## Architecture Components

### 1. Module Registry (`/src/config/moduleRegistry.js`)

**Purpose**: Centralized configuration for all BANIBS modules (current and future)

**Structure**:
```javascript
{
  id: 'prayer_rooms',
  name: 'Prayer Rooms',
  route: '/portal/prayer',
  enabled: false,           // Feature flag
  layout: 'SpiritualLayout',
  theme: 'spiritual',
  color: '#8B5CF6',
  permissions: ['user'],
  phase: '11.0',
  description: '...',
  subModules: [...]
}
```

**Usage**:
- Check if module is enabled: `getModule('prayer_rooms').enabled`
- Get all enabled modules: `getEnabledModules()`
- Check user access: `canAccessModule(module, userRoles)`

### 2. Portal Layout System (`/src/components/layouts/PortalLayout.jsx`)

**Purpose**: Abstract base layout for consistent portal structure

**Features**:
- Configurable left/right rails
- Theme support
- Responsive breakpoints
- Layout factory pattern

**Creating a New Portal Layout**:
```javascript
import { createPortalLayout } from '../layouts/PortalLayout';
import SpiritualLeftRail from './SpiritualLeftRail';
import PrayerCirclesRail from './PrayerCirclesRail';

export const SpiritualLayout = createPortalLayout({
  theme: 'theme-spiritual',
  leftRail: SpiritualLeftRail,
  rightRail: PrayerCirclesRail,
  maxWidth: '1400px'
});
```

### 3. Permissions System (`/src/utils/permissions.js`)

**Purpose**: Role-based and capability-based access control

**Roles**:
- `public`, `user`, `member`, `business_owner`, `verified`, `moderator`, `admin`

**Capabilities**:
- Granular feature access (e.g., `CREATE_PRAYER_CIRCLE`, `ACCESS_WALLET`)

**Usage in Components**:
```javascript
import { hasCapability, CAPABILITIES } from '@/utils/permissions';

function PrayerRoomButton({ user }) {
  if (!hasCapability(user, CAPABILITIES.ACCESS_PRAYER_ROOMS)) {
    return null;
  }
  return <button>Enter Prayer Room</button>;
}
```

### 4. Portal Placeholders (`/src/components/portals/PortalPlaceholder.jsx`)

**Purpose**: "Coming Soon" pages for future modules

**Features**:
- Module info display
- Feature preview
- Notification signup
- Phase badges

**Available Placeholders**:
- `PrayerRoomsPlaceholder`
- `BeautyMarketplacePlaceholder`
- `SneakerFashionPlaceholder`
- `DiasporaPlaceholder`
- `YouthAcademyPlaceholder`
- `WalletPlaceholder`

### 5. Route Configuration (`/src/config/routeConfig.js`)

**Purpose**: Declarative route definitions for Phase 11+ modules

**Current Routes** (All show placeholders):
- `/portal/prayer` - Prayer Rooms (Phase 11.0)
- `/portal/beauty` - Beauty & Wellness (Phase 11.0)
- `/portal/fashion` - Sneakers & Fashion (Phase 11.0)
- `/portal/diaspora` - Diaspora Connect (Phase 12.0)
- `/portal/academy` - BANIBS Academy (Phase 13.0)
- `/portal/wallet` - BANIBS Wallet (Phase 14.0)

## Adding a New Module

### Step 1: Register Module

Update `/src/config/moduleRegistry.js`:

```javascript
NEW_MODULE: {
  id: 'new_module',
  name: 'New Module',
  route: '/portal/new',
  enabled: false,  // Start disabled
  layout: 'NewModuleLayout',
  theme: 'new-theme',
  color: '#HEXCOLOR',
  permissions: ['user'],
  phase: 'X.X',
  description: 'Module description',
  subModules: ['feature1', 'feature2']
}
```

### Step 2: Create Placeholder

Add to `/src/components/portals/PortalPlaceholder.jsx`:

```javascript
export const NewModulePlaceholder = () => (
  <PortalPlaceholder
    moduleName="New Module"
    description="..."
    icon={YourIcon}
    color="#HEXCOLOR"
    phase="X.X"
    subModules={['feature1', 'feature2']}
  />
);
```

### Step 3: Add Route

Update `/src/config/routeConfig.js`:

```javascript
{
  path: '/portal/new',
  element: NewModulePlaceholder,
  name: 'New Module',
  phase: 'X.X',
  enabled: true,
  requiresAuth: true
}
```

Update `/src/App.js` imports and routes:

```javascript
// Import
import { NewModulePlaceholder } from './components/portals/PortalPlaceholder';

// Route (in Routes section)
<Route path="/portal/new" element={<NewModulePlaceholder />} />
```

### Step 4: Create Theme (Optional)

Add to `/src/App.css`:

```css
.theme-new-module {
  --primary: YOUR_PRIMARY_COLOR;
  --accent: YOUR_ACCENT_COLOR;
  /* ... other theme vars */
}
```

### Step 5: Build Actual Feature (When Ready)

1. Create layout component (using `createPortalLayout` factory)
2. Create page components
3. Create left/right rail components
4. Update route to use real component instead of placeholder
5. Set `enabled: true` in module registry
6. Add backend API routes
7. Test thoroughly

## Migration Path: Placeholder → Real Feature

```javascript
// BEFORE (Placeholder)
<Route path="/portal/prayer" element={<PrayerRoomsPlaceholder />} />

// AFTER (Real Feature)
import PrayerRoomsHome from './pages/prayer/PrayerRoomsHome';
<Route path="/portal/prayer" element={<PrayerRoomsHome />} />
```

## Permission Patterns

### Backend Permission (Recommended)
Always validate permissions on the backend API. Frontend checks are for UX only.

### Frontend Permission Check
```javascript
import { hasCapability, CAPABILITIES } from '@/utils/permissions';
import { useAuth } from '@/contexts/AuthContext';

function FeatureButton() {
  const { user } = useAuth();
  
  if (!hasCapability(user, CAPABILITIES.ACCESS_PRAYER_ROOMS)) {
    return null; // Or show upgrade prompt
  }
  
  return <button>Access Feature</button>;
}
```

## Theme System

Each portal can have its own theme. Current themes:
- `theme-social` (Blue) - Personal feed
- `theme-connect` (Gold) - Business networking  
- `theme-news` (Dark) - News portal
- `theme-marketplace` (Varied) - E-commerce
- `theme-spiritual` (Purple) - Prayer/meditation
- `theme-education` (Purple) - Learning
- `theme-finance` (Green) - Financial services

## Best Practices

1. **Always add routes to placeholder pages first** - Prevents 404s and allows testing navigation
2. **Use module registry for consistency** - All modules follow same structure
3. **Start with `enabled: false`** - Use feature flags for gradual rollout
4. **Leverage layout factory** - Don't duplicate layout code
5. **Backend-first permissions** - Frontend checks are UX helpers only
6. **Document as you build** - Update this guide when adding modules

## Testing New Modules

```bash
# Frontend Development
cd /app/frontend
yarn start  # Hot reload enabled

# Test placeholder page
open http://localhost:3000/portal/your-module

# Check permissions
# Login as different user roles and verify access
```

## Backend Integration

When building real features, create matching backend structure:

```
/app/backend/
├── routes/
│   └── your_module.py      # API endpoints
├── models/
│   └── your_module.py      # Data models
├── db/
│   └── your_module.py      # Database operations
└── services/
    └── your_module.py      # Business logic
```

Register router in `/app/backend/server.py`:
```python
from routes.your_module import router as your_module_router
app.include_router(your_module_router)
```

## Future Enhancements

- Dynamic navigation generation from module registry
- Module dependency management
- Feature flag admin panel
- Usage analytics per module
- A/B testing framework for module rollout

## Questions?

Refer to existing modules for examples:
- **Social**: `/portal/social` (Phase 8.0)
- **Business**: `/portal/business` (Phase 8.0)
- **Helping Hands**: `/portal/helping-hands` (Phase 10.0)
