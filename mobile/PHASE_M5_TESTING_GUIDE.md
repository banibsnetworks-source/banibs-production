# Phase M5 - Testing Guide

## Overview
This guide covers end-to-end testing for Phase M5 - BANIBS Mobile App (Groups & Notifications Integration)

---

## Pre-Testing Setup

### 1. Test Account
- **Email:** `social_test_user@example.com`
- **Password:** `TestPass123!`

### 2. Backend Requirements
- Backend must be running at configured API URL
- At least one group should exist (create via web if needed)
- At least one notification should exist (trigger by creating a group)

---

## M5.4 Navigation Testing

### Test 1: Social Tab Initial Screen
**Steps:**
1. Log in with test account
2. Tap "Social" tab in bottom navigation

**Expected:**
- ✅ GroupsListScreen loads immediately
- ✅ Screen shows "My Groups" header
- ✅ Groups list displays (or empty state if no groups)
- ✅ No errors in console

**ADCS Check:**
- ✅ Bearer token attached to API request
- ✅ No 401/403 errors

---

### Test 2: Groups List → Detail Navigation
**Steps:**
1. From GroupsListScreen, tap on any group card

**Expected:**
- ✅ GroupDetailScreen opens
- ✅ Group name, description, privacy badge displayed
- ✅ Member count shown
- ✅ Join/Leave button appears (context-appropriate)
- ✅ Back button works

**ADCS Check:**
- ✅ API request for group detail succeeds
- ✅ No authorization errors

---

### Test 3: Notifications → Group Deep Link
**Steps:**
1. Tap "Notifications" tab
2. Tap on any group-related notification (👥 icon, purple badge)

**Expected:**
- ✅ Navigation switches to Social tab
- ✅ GroupDetailScreen opens with correct group
- ✅ Group details load correctly
- ✅ Mark as read updates notification

**ADCS Check:**
- ✅ Both notifications API and groups API calls succeed
- ✅ No token errors

---

### Test 4: Deep Linking Paths
**Test URLs:**
- `banibs://groups` → Should open GroupsList
- `banibs://groups/[groupId]` → Should open GroupDetail
- `banibs://notifications` → Should open Notifications

**Note:** Deep linking requires app to be installed on device. Test in development environment.

---

### Test 5: Join/Leave Group Flow
**Steps:**
1. Navigate to a group you're not a member of
2. Tap "Join Group" button
3. Wait for response
4. Verify membership badge appears
5. Tap "Leave Group"
6. Confirm dialog
7. Verify navigation back to list

**Expected:**
- ✅ Join request succeeds
- ✅ Membership status updates immediately
- ✅ Leave confirmation dialog appears
- ✅ Leave succeeds and returns to GroupsList
- ✅ UI updates reflect membership changes

**ADCS Check:**
- ✅ Join/leave API calls succeed
- ✅ If rate limited, proper error shown

---

## M5.2 Notifications Testing

### Test 6: Notifications List Display
**Steps:**
1. Open Notifications tab
2. Pull to refresh

**Expected:**
- ✅ Notifications load from backend
- ✅ Group events show 👥 icon
- ✅ Relationship events show 🤝 icon (if any)
- ✅ Purple badges for group events
- ✅ Blue badges for relationship events
- ✅ Human-readable labels (e.g., "Group Created", "Join Approved")
- ✅ Relative timestamps ("5m ago", "2h ago")

---

### Test 7: Mark as Read
**Steps:**
1. Tap on an unread notification (blue background)
2. Return to notifications list

**Expected:**
- ✅ Notification background changes (no longer blue)
- ✅ Unread count decreases
- ✅ Backend API call succeeds

---

### Test 8: Mark All as Read
**Steps:**
1. Long press or find "Mark All as Read" button
2. Tap it

**Expected:**
- ✅ All notifications marked as read
- ✅ UI updates immediately
- ✅ Unread count becomes 0

---

## ADCS Compliance Testing

### Test 9: Token Expiry Handling
**Steps:**
1. Manually clear AsyncStorage token (or wait for expiry)
2. Try to navigate to Groups or Notifications

**Expected:**
- ✅ 401 error caught by interceptor
- ✅ Token cleared automatically
- ✅ User redirected to login (or app logs out)
- ✅ No app crash

---

### Test 10: ADCS Protected Actions
**Steps:**
1. Monitor console logs
2. Perform various actions (join group, mark as read, etc.)

**Expected:**
- ✅ All requests log: method, URL, auth status
- ✅ Successful responses log: status, URL
- ✅ ADCS denials (if any) log: status, detail, reasons
- ✅ No unauthorized calls

---

## UI/UX Polish Testing

### Test 11: Loading States
**Steps:**
1. Enable network throttling (slow 3G)
2. Navigate through app

**Expected:**
- ✅ Loading indicators appear during API calls
- ✅ Content doesn't jump or flash
- ✅ Skeleton screens or spinners visible

---

### Test 12: Error States
**Steps:**
1. Disable network
2. Try to load groups or notifications

**Expected:**
- ✅ Error message displays
- ✅ Retry button appears
- ✅ Error is user-friendly
- ✅ No app crash

---

### Test 13: Empty States
**Steps:**
1. Navigate to GroupsList with no groups
2. Navigate to Notifications with no notifications

**Expected:**
- ✅ Friendly empty state message
- ✅ Icon displayed (👥 for groups, 🔔 for notifications)
- ✅ Helpful text explaining what to do
- ✅ No error messages

---

### Test 14: Responsive Design
**Steps:**
1. Test on different screen sizes:
   - Small phone (iPhone SE)
   - Medium phone (iPhone 13)
   - Large phone (iPhone 15 Pro Max)
   - Tablet (if applicable)

**Expected:**
- ✅ All text readable
- ✅ Buttons accessible
- ✅ No content cutoff
- ✅ Proper spacing maintained

---

## Regression Testing

### Test 15: Existing Features Still Work
**Steps:**
1. Test Home tab
2. Test Messaging tab
3. Test Settings tab
4. Test Create Post (if accessible)

**Expected:**
- ✅ All existing features continue to work
- ✅ No navigation breakage
- ✅ No new errors introduced

---

## Performance Testing

### Test 16: App Performance
**Monitor:**
- App launch time
- Screen transition speed
- API response times
- Memory usage

**Expected:**
- ✅ Smooth 60fps navigation
- ✅ No memory leaks
- ✅ Responsive touch interactions
- ✅ Fast API responses

---

## Acceptance Criteria

Phase M5 is complete when:

1. ✅ Authentication works with token persistence
2. ✅ Groups screens load and display data
3. ✅ Notifications screen shows real backend data
4. ✅ Deep linking from notifications to groups works
5. ✅ Join/leave group functionality works
6. ✅ Mark as read functionality works
7. ✅ ADCS compliance verified (no auth errors)
8. ✅ Loading, error, and empty states all work
9. ✅ Back navigation works correctly
10. ✅ No crashes or blocking bugs
11. ✅ UI matches Design System v2
12. ✅ All console logs show proper ADCS logging

---

## Known Issues / Notes

**Document any issues found during testing:**

- Issue 1: [Description]
- Issue 2: [Description]
- ...

---

## Sign-Off

**Tester:** ___________________
**Date:** ___________________
**Status:** [ ] Pass  [ ] Fail  [ ] Pass with minor issues

**Notes:**
