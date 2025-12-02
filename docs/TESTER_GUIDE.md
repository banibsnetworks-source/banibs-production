# BANIBS Early Tester Guide

## Overview
Welcome to the BANIBS early testing program! This guide will help you understand how to test the platform effectively and provide valuable feedback.

## Tester Mode Features

### What is Tester Mode?
Tester Mode is a special configuration that provides:
- **Enhanced logging**: All your actions are logged for analysis
- **Advanced debugging**: More detailed error messages
- **Unreleased features**: Access to features before they're public
- **Performance metrics**: View API response times and performance data

### How to Become a Tester
1. Use an email with tester patterns: `*@test.banibs.com` or `*@tester.banibs.com`
2. Or use a username starting with `test_` or ending with `_tester`
3. Contact the admin team to be added to the tester whitelist

---

## Testing Flows

### 1. Authentication Flow
**Objective**: Verify login, registration, and session management

**Steps to Test:**
1. **Registration**
   - Navigate to `/register`
   - Fill in all required fields
   - Verify email validation
   - Check onboarding flow after registration
   
2. **Login**
   - Use test credentials
   - Verify redirect to correct page
   - Check "Remember Me" functionality
   
3. **Session Management**
   - Test session expiration (wait 30 minutes)
   - Verify auto-logout behavior
   - Check token refresh

**What to Report:**
- Any error messages
- UI/UX issues
- Performance problems (slow loading)

---

### 2. Groups Feature Flow
**Objective**: Test group creation, joining, and management

**Steps to Test:**
1. **Create a Group**
   - Go to Groups page
   - Click "Create Group"
   - Test both PUBLIC and PRIVATE group types
   - Verify group appears in "My Groups"

2. **Join a Group**
   - Browse available groups
   - Request to join a PRIVATE group
   - Join a PUBLIC group directly
   - Verify membership status

3. **Group Interactions**
   - View group details
   - Check member list
   - Test group navigation
   - Verify deep linking from notifications

**What to Report:**
- Group creation failures
- Join/leave issues
- UI rendering problems
- Navigation bugs

---

### 3. Notifications Flow
**Objective**: Verify notification delivery and interactions

**Steps to Test:**
1. **Receive Notifications**
   - Perform actions that trigger notifications
   - Check notification center
   - Verify badge counts
   - Test notification icons

2. **Interact with Notifications**
   - Click on notifications
   - Verify deep links work correctly
   - Mark notifications as read
   - Test "Mark All Read" functionality

3. **Notification Types to Test**
   - Group invites
   - Join requests
   - Role changes
   - Connection requests
   - Connection acceptances

**What to Report:**
- Missing notifications
- Incorrect notification content
- Broken deep links
- Badge count errors

---

### 4. Relationships Flow
**Objective**: Test connection system and circle tiers

**Steps to Test:**
1. **Send Connection Requests**
   - Find other users
   - Send connection requests
   - Verify notification sent

2. **Manage Connections**
   - Accept/reject requests
   - Change circle tiers (PEOPLES, COOL, ALRIGHT, OTHERS)
   - Test blocking/unblocking

3. **View Connections**
   - Check connections list
   - Filter by circle tier
   - Verify connection count

**What to Report:**
- Connection request failures
- Circle tier update issues
- Blocking/unblocking problems

---

### 5. ADCS (AI Double-Check System) Flow
**Objective**: Test safety guardrails on critical actions

**Steps to Test:**
1. **Trigger ADCS**
   - Attempt a high-risk action (e.g., multiple payouts)
   - Observe ADCS response
   - Check for approval requirement

2. **Admin Approval**
   - View pending actions (admin only)
   - Approve/deny actions
   - Verify audit logs

**What to Report:**
- ADCS false positives
- Missing ADCS protection
- Approval flow issues

---

## How to Report Issues

### Bug Report Format
```
**Title**: [Brief description]

**Type**: Bug / Feature Request / Improvement

**Severity**: Low / Medium / High / Critical

**Description**: 
[Detailed description of the issue]

**Steps to Reproduce**:
1. Step 1
2. Step 2
3. ...

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happened]

**Environment**:
- Browser: [e.g., Chrome 120]
- Device: [e.g., iPhone 14, Desktop]
- OS: [e.g., iOS 17, Windows 11]
- Screen Size: [e.g., 1920x1080]

**Screenshots**:
[Attach screenshots if applicable]
```

### Where to Report
1. **Discord**: Join #testers channel
2. **Email**: testers@banibs.com
3. **In-App**: Use the feedback button (tester mode only)

---

## Testing Best Practices

### Do's ✅
- Test on multiple devices (mobile, tablet, desktop)
- Test on different browsers (Chrome, Firefox, Safari, Edge)
- Try edge cases (very long names, special characters, etc.)
- Test with slow internet connections
- Document every bug with screenshots
- Be specific in your feedback

### Don'ts ❌
- Don't share test accounts publicly
- Don't test with real/sensitive data
- Don't spam the system with automated requests
- Don't ignore warning messages
- Don't assume something "probably works"

---

## Testing Checklist

### Before Each Testing Session
- [ ] Clear browser cache and cookies
- [ ] Check your internet connection
- [ ] Have screenshot tool ready
- [ ] Review recent changes/features to test
- [ ] Log into your tester account

### During Testing
- [ ] Follow the testing flow systematically
- [ ] Take notes of any issues
- [ ] Capture screenshots of errors
- [ ] Test both success and failure cases
- [ ] Verify notifications are received

### After Testing
- [ ] Submit all bug reports
- [ ] Fill out the testing survey
- [ ] Share any suggestions for improvement
- [ ] Log out properly

---

## Tester Rewards

As an early tester, you'll receive:
- **Early Access**: Be the first to try new features
- **Influence**: Your feedback shapes the product
- **Recognition**: Credits in the app
- **Perks**: Special tester badges and benefits

---

## Contact & Support

**Tester Support:**
- Discord: https://discord.gg/banibs
- Email: support@banibs.com
- Slack: #testers (for active testers)

**Emergency Contact:**
If you find a critical security issue, contact: security@banibs.com

---

## Frequently Asked Questions

**Q: How often should I test?**
A: Ideally, test for 30-60 minutes per week. More testing = better product!

**Q: What if I find a critical bug?**
A: Mark it as "Critical" severity and ping the team on Discord immediately.

**Q: Can I share my tester account?**
A: No, tester accounts are personal and should not be shared.

**Q: Will my test data be deleted?**
A: Yes, test databases are periodically reset. Don't rely on test data persisting.

**Q: How do I know if my feedback was received?**
A: You'll receive a confirmation email, and your feedback will be tracked in our system.

---

Thank you for being an early tester! Your contribution is invaluable in making BANIBS the best platform it can be. 🙏
