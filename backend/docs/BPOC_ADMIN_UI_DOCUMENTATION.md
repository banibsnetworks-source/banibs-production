# BPOC Admin UI Documentation

## Overview

The **BPOC (BANIBS Platform Orchestration Core) Admin UI** is an internal, founder/admin-only dashboard for managing the entire BANIBS platform expansion. It provides visual tools for module management, rollout governance, and strategic platform planning.

**Access**: `/admin/orchestration`  
**Authentication**: Admin-only (requires admin token)  
**Phase**: 0.0 - Infrastructure & Governance

---

## Features

### 1. Module Management Dashboard

**Three Main Tabs**:
1. **Modules** - Complete module table with search and filtering
2. **Readiness Summary** - Platform-wide readiness metrics
3. **Event History** - Complete audit log of all rollout events

---

### 2. Modules Tab

#### Module Table
Displays all 24 BANIBS modules with:
- **Module Name**: Full module name
- **Code**: Unique module identifier (e.g., `integrity_tracking`)
- **Layer**: Color-coded layer badges
  - L0: Infrastructure (Purple)
  - L1: Governance (Indigo)
  - L2: Foundation (Blue)
  - L3: Social (Cyan)
  - L4: High-Impact (Amber)
- **Stage**: Current rollout stage with color indicators
  - PLANNED (Gray)
  - IN_DEV (Blue)
  - SOFT_LAUNCH (Yellow)
  - FULL_LAUNCH (Green)
- **Status**: Active/Blocked indicator

#### Search & Filters
- **Search**: Find modules by name or code
- **Layer Filter**: Filter by specific layer (L0-L4)
- **Stage Filter**: Filter by rollout stage
- **Refresh Button**: Reload module data

#### Module Detail Drawer
Clicking any module opens a side panel with:

**Module Information**:
- Current stage with badge
- Layer classification
- Phase number
- Owner team
- Active/Blocked status

**Readiness Evaluation**:
- Evaluate button to check promotion readiness
- Displays readiness status (READY/WAIT)
- Shows triggers met (X / Y met)
- Lists dependency issues if any

**Triggers**:
- Lists all triggers for the module
- Shows current status (MET/NOT_MET)
- Displays target values
- Indicates mandatory triggers

**Dependencies**:
- Lists all module dependencies
- Shows required stage for each dependency
- Indicates hard dependencies

**Recent Events**:
- Last 5 events for this module
- Event type and timestamp
- Stage transitions
- Event details and correlation IDs

**Actions**:
- **Promote Stage**: Open promotion dialog
- **Close**: Close the drawer

---

### 3. Module Promotion Dialog

When promoting a module, users must provide:

**Target Stage Selection**:
- Dropdown with available stages
- Visual arrow showing transition (Current → Target)

**Reason for Promotion**:
- Required text field
- Explain why the module should be promoted
- Stored in event log

**Override Checkbox**:
- Option to bypass readiness checks
- Use with caution (yellow warning)
- Bypasses trigger and dependency validation

**Actions**:
- **Promote**: Execute the promotion
- **Cancel**: Close dialog

---

### 4. Readiness Summary Tab

#### Overall Status Cards
- **Total Modules**: 24 modules tracked
- **Ready**: Modules ready for promotion (green)
- **Waiting**: Modules waiting on triggers (yellow)
- **Blocked**: Modules administratively blocked (red)

#### Stage Distribution
Visual breakdown of modules by stage:
- Planned
- In Dev
- Soft Launch
- Full Launch

Shows count for each stage with color indicators.

#### Layer Breakdown
For each layer (L0-L4):
- **Progress Bar**: Shows percentage of modules active
- **Module Count**: X / Y active
- **Module Badges**: Quick view of all modules in that layer

---

### 5. Event History Tab

Complete audit log of all platform rollout events.

**Event Table Columns**:
- **Timestamp**: When the event occurred
- **Module**: Which module was affected
- **Event Type**: Type of event (STAGE_CHANGE, MODULE_BLOCKED, etc.)
- **Stage Change**: Before → After stage transition
- **Correlation ID**: Batch/rollout identifier (e.g., TIER_4_BATCH_1)
- **Details**: Full explanation of the event

**Search**:
- Search by module name, event type, or correlation ID
- Results count displayed
- Real-time filtering

**Use Cases**:
- Audit trail for compliance
- Debugging module issues
- Tracking rollout batches
- Investigating stage changes

---

## API Endpoints Used

All endpoints are under `/api/admin/orchestration/*`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/modules` | GET | List all modules with filters |
| `/modules/{id}` | GET | Get detailed module info |
| `/modules/{id}/evaluate` | POST | Evaluate module readiness |
| `/modules/{id}/stage` | POST | Promote module to new stage |
| `/readiness_summary` | GET | Get platform-wide readiness stats |
| `/events` | GET | Get all rollout events |

---

## User Workflows

### Workflow 1: View Platform Status
1. Navigate to `/admin/orchestration`
2. View **Readiness Summary** tab
3. Review overall stats and layer breakdown
4. Identify modules ready for promotion

### Workflow 2: Promote a Module
1. Navigate to **Modules** tab
2. Search/filter for target module
3. Click on module to open detail drawer
4. Click **Evaluate** to check readiness
5. Click **Promote Stage** button
6. Select target stage
7. Enter promotion reason
8. Toggle override if needed (caution)
9. Click **Promote**
10. Verify in Event History

### Workflow 3: Audit Rollout History
1. Navigate to **Event History** tab
2. Search for specific module or correlation ID
3. Review stage transitions and timestamps
4. Track rollout batches by correlation ID

### Workflow 4: Investigate Module Issues
1. Navigate to **Modules** tab
2. Find blocked or waiting modules
3. Click to open detail drawer
4. Review triggers and dependencies
5. Check recent events for context
6. Evaluate readiness to identify blockers

---

## Technical Implementation

### Frontend Stack
- **Framework**: React
- **UI Components**: shadcn/ui (Tailwind CSS)
- **Routing**: React Router
- **State Management**: React useState/useEffect
- **API Calls**: Fetch API

### Key Components
```
/app/frontend/src/pages/admin/orchestration/
├── OrchestrationDashboardPage.jsx       # Main dashboard
└── components/
    ├── ModuleTable.jsx                  # Module list with filters
    ├── ReadinessSummary.jsx             # Readiness metrics
    ├── EventHistory.jsx                 # Event log table
    ├── ModuleDetailDrawer.jsx           # Module details panel
    └── PromoteModuleDialog.jsx          # Promotion form
```

### Backend Stack
- **Framework**: FastAPI
- **Database**: MongoDB
- **Authentication**: JWT tokens with admin middleware
- **Authorization**: `require_admin` dependency

### Key Files
```
/app/backend/
├── routes/orchestration.py              # API endpoints
├── db/orchestration.py                  # Database logic
└── models/orchestration.py              # Pydantic models
```

---

## Security

### Authentication
- **Required**: Valid JWT access token
- **Admin Check**: All endpoints use `require_admin` middleware
- **Session**: Stored in localStorage as `access_token`

### Authorization
- Only admin users can access `/admin/orchestration`
- Non-admin users are redirected to login
- 403 error if attempting to access without admin privileges

### Audit Trail
- All module promotions are logged in `rollout_events` collection
- Events include:
  - User ID (who performed the action)
  - Timestamp
  - Module affected
  - Stage change
  - Reason provided
  - Correlation ID for batch tracking

---

## Color Scheme & Styling

**Theme**: Dark mode (slate-950 background)

**Layer Colors**:
- L0 Infrastructure: Purple (`purple-600`)
- L1 Governance: Indigo (`indigo-600`)
- L2 Foundation: Blue (`blue-600`)
- L3 Social: Cyan (`cyan-600`)
- L4 High-Impact: Amber (`amber-600`)

**Stage Colors**:
- PLANNED: Gray (`slate-600`)
- IN_DEV: Blue (`blue-600`)
- SOFT_LAUNCH: Yellow (`yellow-600`)
- FULL_LAUNCH: Green (`green-600`)

**Status Indicators**:
- Active: Green checkmark
- Blocked: Red lock icon
- Ready: Green badge
- Waiting: Yellow badge

---

## Performance Considerations

### Optimization Strategies
1. **Pagination**: Events limited to 100 by default
2. **Search**: Client-side filtering for instant results
3. **Lazy Loading**: Module details loaded on-demand
4. **Caching**: Readiness summary cached for 30 seconds
5. **Debouncing**: Search input debounced to reduce re-renders

### API Limits
- Modules: Max 1000 results (default 100)
- Events: Max 500 results (default 100)
- Module details: Single module only
- Readiness evaluation: On-demand only

---

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration for live updates
2. **Bulk Operations**: Promote multiple modules at once
3. **Rollout Templates**: Pre-configured rollout batches
4. **Advanced Analytics**: Charts and graphs for trends
5. **Notification System**: Alerts for blocked modules
6. **Export Functionality**: Download event history as CSV
7. **Rollback Feature**: Revert module to previous stage
8. **Dependency Graph**: Visual representation of dependencies
9. **Module Notes**: Add internal notes to modules
10. **User Activity Log**: Track which admin performed actions

### UI Improvements
- Dark/light theme toggle
- Customizable dashboard layout
- Saved filters and views
- Keyboard shortcuts
- Mobile responsive design (currently desktop-first)

---

## Troubleshooting

### Issue: Redirected to Login
**Cause**: Missing or expired JWT token  
**Solution**: Login with admin credentials

### Issue: 403 Forbidden
**Cause**: User account lacks admin privileges  
**Solution**: Contact system administrator to grant admin access

### Issue: Module Not Updating
**Cause**: Stale cache or backend issue  
**Solution**: Click **Refresh** button or check backend logs

### Issue: Promotion Fails
**Cause**: Readiness checks failing  
**Solution**: 
1. Click **Evaluate** to see specific issues
2. Check triggers and dependencies
3. Use **Override** checkbox if intentional

### Issue: Events Not Loading
**Cause**: API endpoint issue  
**Solution**: Check backend logs at `/var/log/supervisor/backend.*.log`

---

## Testing Credentials

**Admin User**:
- Email: `social_test_user@example.com`
- Password: `TestPass123!`

**Test Scenarios**:
1. View all modules and filter by layer
2. Evaluate readiness for Reputation Shield
3. Promote a PLANNED module to IN_DEV
4. Review Tier 4 rollout events (correlation ID: `TIER_4_BATCH_1`)
5. Check readiness summary for platform health

---

## Maintenance

### Regular Tasks
1. **Weekly**: Review blocked modules and resolve issues
2. **Monthly**: Audit event history for anomalies
3. **Quarterly**: Evaluate readiness metrics and plan rollouts

### Monitoring
- Check `/admin/orchestration` loads correctly
- Verify API endpoints respond within 2 seconds
- Ensure event logging is working for all promotions
- Monitor for 403/500 errors in backend logs

---

## Support & Documentation

**Internal Documentation**:
- BPOC Tier 4 Rollout Protocol: `/app/backend/docs/BPOC_TIER_4_BATCH_1_PROTOCOL.md`
- Tier 3 Debug Report: `/app/backend/docs/TIER_3_SCRIPT_HANG_DEBUG_REPORT.md`

**External Resources**:
- shadcn/ui Documentation: https://ui.shadcn.com/
- React Documentation: https://react.dev/
- FastAPI Documentation: https://fastapi.tiangolo.com/

**Contact**:
- For access issues: System Administrator
- For feature requests: Product Team
- For bugs: Development Team

---

**Last Updated**: November 2025  
**Version**: 1.0  
**Status**: Production Ready
