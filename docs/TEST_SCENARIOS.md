# BANIBS Test Scenarios

## Quick Reference Guide for Testing Key Features

---

## Scenario 1: New User Onboarding
**Duration**: 5-10 minutes
**Complexity**: Low

### Steps:
1. Go to `/register`
2. Fill in user details:
   - Name: "Test User"
   - Email: "testuser@test.banibs.com"
   - Password: "TestPass123!"
   - Bio, interests, location (optional fields)
3. Submit registration
4. Verify onboarding page appears
5. Complete onboarding steps
6. Land on dashboard

### Success Criteria:
- ✅ No validation errors
- ✅ Onboarding page displays correctly
- ✅ User is logged in after completion
- ✅ Dashboard shows welcome message

### Common Issues to Check:
- Email already exists error
- Password validation
- Redirect after registration
- Session token stored correctly

---

## Scenario 2: Create and Manage a Group
**Duration**: 10-15 minutes
**Complexity**: Medium

### Setup:
- Must be logged in
- Have at least one other test user account

### Steps:
1. Navigate to `/portal/social/groups`
2. Click "Create Group"
3. Fill in group details:
   - Name: "Test Group Alpha"
   - Description: "Testing group features"
   - Privacy: PUBLIC
4. Create group
5. Verify group appears in "My Groups"
6. Click on the group to view details
7. Invite another user
8. Test member management
9. Update group settings
10. Leave/delete group

### Success Criteria:
- ✅ Group created successfully
- ✅ Appears in group list
- ✅ Group details page loads
- ✅ Notifications sent for invites
- ✅ Member list updates correctly
- ✅ Settings save properly

### Edge Cases to Test:
- Very long group names (100+ characters)
- Special characters in group name
- Empty description
- Private vs public groups
- Maximum members limit

---

## Scenario 3: Notification Center Testing
**Duration**: 15 minutes
**Complexity**: Medium

### Setup:
- Two test accounts
- Perform actions that trigger notifications

### Actions to Trigger Notifications:
1. **Group Notifications**:
   - Create a group (Account A)
   - Invite Account B
   - Account B joins
   - Change Account B's role
   - Update group settings

2. **Relationship Notifications**:
   - Account A sends connection request to Account B
   - Account B accepts
   - Account A changes circle tier

3. **Test Notification Center**:
   - Open notifications
   - Check badge count
   - Verify notification icons
   - Click on each notification
   - Verify deep links work
   - Mark notifications as read
   - Mark all as read

### Success Criteria:
- ✅ All notifications received
- ✅ Badge count accurate
- ✅ Icons display correctly
- ✅ Deep links navigate to correct pages
- ✅ Read/unread status updates
- ✅ No duplicate notifications

### What to Monitor:
- Notification delivery time (should be instant)
- Notification content accuracy
- Link correctness
- Visual presentation

---

## Scenario 4: Connection Workflow
**Duration**: 10 minutes
**Complexity**: Medium

### Setup:
- Two test accounts (A and B)

### Steps:
1. **Account A**:
   - Search for Account B
   - Send connection request
   - Verify request sent notification

2. **Account B**:
   - Receive connection request notification
   - View request in connections page
   - Accept request

3. **Account A**:
   - Receive acceptance notification
   - See Account B in connections
   - Change circle tier to "PEOPLES"

4. **Account B**:
   - Receive tier change notification
   - Verify updated tier

5. **Test Blocking**:
   - Account A blocks Account B
   - Verify connection removed
   - Account A unblocks Account B
   - Account B receives unblock notification

### Success Criteria:
- ✅ Request sent successfully
- ✅ Notifications delivered
- ✅ Connection established
- ✅ Tier changes work
- ✅ Blocking/unblocking functions
- ✅ UI updates correctly

---

## Scenario 5: ADCS Trigger Test (Admin/Developer Only)
**Duration**: 5 minutes
**Complexity**: High

### Setup:
- Admin account
- Access to ADCS endpoints

### Steps:
1. Perform a P0 critical action:
   - Attempt payout
   - Try to ban a user
   - Modify schema
2. Observe ADCS response
3. Check if action requires approval
4. View audit log
5. Approve/deny action (admin)
6. Verify action completes after approval

### Success Criteria:
- ✅ ADCS intercepts critical action
- ✅ Returns 202 Pending status
- ✅ Audit log created
- ✅ Approval flow works
- ✅ Action completes after approval

---

## Scenario 6: Mobile Web Experience
**Duration**: 15 minutes
**Complexity**: Medium

### Setup:
- Mobile device or mobile viewport
- Tester account

### Steps:
1. Open mobile app URL
2. Test responsive design at different sizes
3. Login on mobile
4. Navigate through:
   - Home screen
   - Groups list
   - Group details
   - Notifications
   - Settings
5. Test touch interactions
6. Test bottom navigation
7. Test gestures (swipe, pull-to-refresh)

### Success Criteria:
- ✅ UI scales correctly
- ✅ Touch targets adequate size
- ✅ Navigation smooth
- ✅ No horizontal scrolling
- ✅ Images load properly
- ✅ Forms usable on small screens

### Mobile-Specific Checks:
- Viewport meta tag present
- Font sizes readable
- Buttons accessible
- Input fields easy to use
- No overlapping elements

---

## Scenario 7: Performance & Error Handling
**Duration**: 10 minutes
**Complexity**: Medium

### Tests:
1. **Slow Network Simulation**:
   - Throttle connection to 3G
   - Navigate through app
   - Verify loading states
   - Check error messages

2. **API Errors**:
   - Trigger 401 (invalid token)
   - Trigger 403 (forbidden)
   - Trigger 500 (server error)
   - Verify error handling

3. **Edge Cases**:
   - Submit empty forms
   - Use very long inputs
   - Try invalid data formats
   - Test with special characters

4. **Concurrent Actions**:
   - Open multiple tabs
   - Perform actions in different tabs
   - Check data consistency

### Success Criteria:
- ✅ Loading indicators display
- ✅ Error messages clear and helpful
- ✅ App doesn't crash
- ✅ Automatic retry on network errors
- ✅ Form validation works
- ✅ Data stays consistent

---

## Scenario 8: Cross-Browser Testing
**Duration**: 20 minutes
**Complexity**: Low-Medium

### Browsers to Test:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (Chrome Mobile, Safari iOS)

### Key Features to Test Per Browser:
1. Login/Registration
2. Groups page
3. Notifications
4. Form submissions
5. Image uploads
6. Video playback
7. Animations

### Success Criteria:
- ✅ UI renders correctly
- ✅ All features functional
- ✅ No console errors
- ✅ Acceptable performance
- ✅ Consistent behavior

### Browser-Specific Issues to Watch:
- Safari: Date pickers, video autoplay
- Firefox: Font rendering, animations
- Edge: Compatibility mode issues
- Mobile: Touch events, viewport

---

## Scenario 9: Security Testing
**Duration**: 15 minutes
**Complexity**: High

### Tests:
1. **Authentication**:
   - Try accessing protected routes without login
   - Test token expiration
   - Try using expired tokens
   - Test CSRF protection

2. **Authorization**:
   - Try accessing other users' data
   - Attempt privilege escalation
   - Test group admin permissions
   - Verify ADCS blocks unauthorized actions

3. **Input Validation**:
   - XSS attempts in forms
   - SQL injection attempts
   - Path traversal attempts
   - File upload restrictions

### Success Criteria:
- ✅ Protected routes redirect to login
- ✅ Expired tokens handled correctly
- ✅ User data properly isolated
- ✅ Permissions enforced
- ✅ Dangerous inputs sanitized

---

## Scenario 10: Accessibility Testing
**Duration**: 15 minutes
**Complexity**: Medium

### Tools:
- Keyboard only (no mouse)
- Screen reader (optional)
- Browser dev tools

### Tests:
1. **Keyboard Navigation**:
   - Tab through all interactive elements
   - Use Enter/Space to activate
   - Test form submission with keyboard
   - Verify focus indicators visible

2. **Screen Reader** (if available):
   - Listen to page announcements
   - Verify labels read correctly
   - Check form instructions
   - Test error messages

3. **Visual**:
   - Zoom to 200%
   - Check contrast ratios
   - Verify text readability
   - Test with color blindness filters

### Success Criteria:
- ✅ All functionality accessible via keyboard
- ✅ Focus indicators visible
- ✅ Labels present and descriptive
- ✅ Color not sole indicator
- ✅ Text readable at 200% zoom

---

## Quick Test Checklist

### Critical Path (5 minutes)
- [ ] Login works
- [ ] Dashboard loads
- [ ] Groups page loads
- [ ] Notifications load
- [ ] Can navigate between pages
- [ ] Can logout

### Extended Test (30 minutes)
- [ ] Complete Scenario 1 (Registration)
- [ ] Complete Scenario 2 (Groups)
- [ ] Complete Scenario 3 (Notifications)
- [ ] Complete Scenario 4 (Connections)
- [ ] Test on mobile viewport

### Full Test Suite (2+ hours)
- [ ] All 10 scenarios completed
- [ ] Multiple browsers tested
- [ ] Multiple devices tested
- [ ] All bugs documented
- [ ] Feedback submitted

---

## Reporting Template

### Quick Bug Report
```
BUG: [Short title]
SEVERITY: Low/Medium/High/Critical
STEPS: 1. ... 2. ... 3. ...
EXPECTED: [What should happen]
ACTUAL: [What happened]
BROWSER: [Browser + version]
```

### Feature Feedback
```
FEATURE: [Feature name]
RATING: ⭐⭐⭐⭐⭐ (1-5)
PROS: [What works well]
CONS: [What needs improvement]
SUGGESTIONS: [Ideas for improvement]
```

---

## Testing Tips

1. **Start Fresh**: Clear cache/cookies before major tests
2. **Use Real Data**: Test with realistic content
3. **Be Thorough**: Don't skip steps
4. **Document Everything**: Screenshots are your friend
5. **Test Failures**: Intentionally trigger errors
6. **Think Like a User**: Not just a tester
7. **Report Promptly**: Don't wait to report bugs
8. **Retest Fixes**: Verify bug fixes work

---

For questions or clarifications, contact the testing team on Discord.
