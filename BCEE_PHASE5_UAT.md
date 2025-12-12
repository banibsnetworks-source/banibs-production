# BCEE v1.0 - User Acceptance Testing (UAT) Checklist

**Version**: 1.0  
**Date**: December 5, 2025  
**Testing Target**: Multi-Currency Price Display (BCEE)  
**Tester**: Founder / UAT Team

---

## Pre-Test Setup

### Required Accounts
- ✅ Test Account (already exists): `social_test_user@example.com` / `TestPass123!`
- ✅ Admin access to backend API (for region changes)

### Test Environment
- **URL**: https://reveal-library.preview.emergentagent.com
- **Backend**: BCEE API v1.0 (Phase 1-4 complete)
- **Frontend**: PriceTag component integrated

### Tools Needed
- Web browser (Chrome, Firefox, Safari)
- Optional: Postman or curl for API testing
- Optional: VPN for region simulation

---

## Test Suite 1: USD Region (Default Behavior)

### Test Case 1.1: Anonymous User Sees USD Only
**Objective**: Verify unauthenticated users see prices in USD

**Steps**:
1. Open a private/incognito browser window
2. Navigate to: `https://reveal-library.preview.emergentagent.com/portal/marketplace`
3. Scroll through the "Featured Marketplace Products" section
4. Look at the prices displayed on product cards

**Expected Result**:
- ✅ All prices show in format: `$XX.XX` (e.g., `$29.99`, `$19.99`)
- ✅ NO secondary currency text (no "approx. ..." line)
- ✅ Prices are clearly visible and formatted
- ✅ Page loads quickly with no errors

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

### Test Case 1.2: Logged-In US User Sees USD Only
**Objective**: Verify authenticated US users see USD format

**Steps**:
1. Log in with: `social_test_user@example.com` / `TestPass123!`
2. Navigate to: `/portal/marketplace`
3. Check prices on product cards
4. Click on any product to see detail page
5. Check the large price display on detail page

**Expected Result**:
- ✅ Product cards show: `$XX.XX` format
- ✅ Detail page shows larger `$XX.XX` format
- ✅ NO multi-currency text visible
- ✅ Consistent pricing across all pages

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

## Test Suite 2: Nigeria Region (NGN)

### Test Case 2.1: Change Region to Nigeria
**Objective**: Update test user's region to Nigeria

**Steps** (Technical - requires API call):
1. Log in to the platform
2. Get your access token from browser localStorage:
   - Open DevTools (F12)
   - Go to Application > Local Storage
   - Find `access_token` value
3. Use Postman or curl to call:
   ```bash
   POST https://reveal-library.preview.emergentagent.com/api/bcee/update-region
   Headers:
     Authorization: Bearer YOUR_ACCESS_TOKEN
     Content-Type: application/json
   Body:
     {
       "country_code": "NG"
     }
   ```

**Expected Result**:
- ✅ API returns 200 OK status
- ✅ Response shows: `{"country_code": "NG", "preferred_currency": "NGN", ...}`

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

### Test Case 2.2: Verify NGN Prices Display
**Objective**: Confirm prices now show in Nigerian Naira

**Steps**:
1. Refresh the marketplace page
2. Check product card prices
3. Click on a product detail page
4. Verify the large price display

**Expected Result**:
- ✅ Primary price shows: `₦XX,XXX` (e.g., `₦17,400`)
- ✅ Secondary line shows: `approx. $XX.XX` (e.g., `approx. $12.00`)
- ✅ Naira symbol (₦) displays correctly
- ✅ Thousands separator (comma) appears for large amounts
- ✅ Both product cards AND detail pages show multi-currency

**Visual Example**:
```
₦17,400
approx. $12.00
```

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

### Test Case 2.3: Verify Exchange Rate Accuracy
**Objective**: Confirm conversion math is correct

**Steps**:
1. Find a product with price `$12.00`
2. Note the NGN price displayed
3. Calculate: `$12.00 × 1,450 (NGN rate) = ₦17,400`

**Expected Result**:
- ✅ Displayed NGN price matches calculation
- ✅ Exchange rate used: ~1,450 NGN per USD (dev mode rate)

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

## Test Suite 3: UK Region (GBP)

### Test Case 3.1: Change Region to UK
**Objective**: Update test user's region to United Kingdom

**Steps**:
1. Use Postman/curl to call update-region API:
   ```bash
   POST https://reveal-library.preview.emergentagent.com/api/bcee/update-region
   Body: { "country_code": "GB" }
   ```

**Expected Result**:
- ✅ API returns 200 OK
- ✅ Region changed to GB/GBP

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

### Test Case 3.2: Verify GBP Prices Display
**Objective**: Confirm prices show in British Pounds

**Steps**:
1. Refresh marketplace page
2. Check product prices

**Expected Result**:
- ✅ Primary price shows: `£XX.XX` (e.g., `£9.48`)
- ✅ Secondary line shows: `approx. $XX.XX` (e.g., `approx. $12.00`)
- ✅ Pound symbol (£) displays correctly
- ✅ Two decimal places shown for GBP

**Visual Example**:
```
£9.48
approx. $12.00
```

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

## Test Suite 4: Ghana Region (GHS)

### Test Case 4.1: Change Region to Ghana
**Objective**: Update test user's region to Ghana

**Steps**:
1. Use Postman/curl to call update-region API:
   ```bash
   POST https://reveal-library.preview.emergentagent.com/api/bcee/update-region
   Body: { "country_code": "GH" }
   ```

**Expected Result**:
- ✅ API returns 200 OK
- ✅ Region changed to GH/GHS

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

### Test Case 4.2: Verify GHS Prices Display
**Objective**: Confirm prices show in Ghanaian Cedi

**Steps**:
1. Refresh marketplace page
2. Check product prices

**Expected Result**:
- ✅ Primary price shows: `₵XXX.XX` (e.g., `₵150.00`)
- ✅ Secondary line shows: `approx. $XX.XX`
- ✅ Cedi symbol (₵) displays correctly

**Visual Example**:
```
₵150.00
approx. $12.00
```

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

## Test Suite 5: Fallback & Error Handling

### Test Case 5.1: Change Back to US (Reset)
**Objective**: Reset region for other tests

**Steps**:
1. Use Postman/curl to call update-region API:
   ```bash
   POST https://reveal-library.preview.emergentagent.com/api/bcee/update-region
   Body: { "country_code": "US" }
   ```
2. Refresh marketplace

**Expected Result**:
- ✅ Back to USD-only display: `$XX.XX`

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

### Test Case 5.2: Simulate API Failure (Technical Test)
**Objective**: Verify graceful fallback when BCEE API is unavailable

**Steps** (Requires Dev Access):
1. Temporarily stop the backend service OR
2. Block `/api/bcee/price-display` in browser DevTools Network tab
3. Refresh marketplace page

**Expected Result**:
- ✅ Prices still display (fallback to USD)
- ✅ Format: `$XX.XX` shown
- ✅ NO error messages visible to user
- ✅ Page doesn't crash or hang
- ✅ Console may show errors (acceptable for dev)

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

### Test Case 5.3: Fast Page Load with Multiple Products
**Objective**: Ensure performance is acceptable

**Steps**:
1. Log in and set region to NG (Nigeria)
2. Navigate to marketplace home page
3. Note page load time
4. Scroll through all products
5. Check browser DevTools Network tab

**Expected Result**:
- ✅ Page loads in < 3 seconds
- ✅ No visible delays or "loading" spinners stuck
- ✅ Price conversion happens smoothly
- ✅ Network tab shows batch API calls (if optimized)

**Performance Note**: If page is slow, this is a known area for Phase 5+ optimization.

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

## Test Suite 6: Product Detail Page

### Test Case 6.1: Large Price Display
**Objective**: Verify detail page shows prominent multi-currency pricing

**Steps**:
1. Set region to NG (Nigeria)
2. Navigate to marketplace
3. Click on any product
4. Check the large price display near the top

**Expected Result**:
- ✅ Large, bold price in NGN: `₦XX,XXX`
- ✅ Secondary USD line: `approx. $XX.XX`
- ✅ Size is noticeably larger than card prices (XL size)
- ✅ Visually prominent and easy to read

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

## Test Suite 7: Cross-Browser & Device Testing

### Test Case 7.1: Desktop Browsers
**Objective**: Verify compatibility across major browsers

**Steps**:
1. Test on Chrome (primary)
2. Test on Firefox
3. Test on Safari (if Mac available)

**Expected Result**:
- ✅ Currency symbols render correctly on all browsers
- ✅ Layout doesn't break
- ✅ No visual glitches

**Pass/Fail**: [ ]

**Browsers Tested**: _______________________________________________________

---

### Test Case 7.2: Mobile Responsive
**Objective**: Verify prices display well on mobile

**Steps**:
1. Open marketplace on mobile device OR
2. Use browser DevTools responsive mode (F12 > Toggle Device Toolbar)
3. Set viewport to iPhone (375×812) or similar
4. Check product card prices
5. Check detail page prices

**Expected Result**:
- ✅ Prices are readable on small screens
- ✅ Two-line format (NGN + USD) doesn't overflow
- ✅ Text size appropriate for mobile
- ✅ No horizontal scrolling required

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

## Test Suite 8: Business Directory (No Prices Expected)

### Test Case 8.1: Verify No Price Display in Business Directory
**Objective**: Confirm Business Directory doesn't show prices (by design)

**Steps**:
1. Navigate to: `/business` or Business Directory page
2. Browse business listings
3. Check business cards

**Expected Result**:
- ✅ NO prices shown (businesses don't have pricing in current schema)
- ✅ Business cards show: Name, Location, Description only
- ✅ This is correct behavior - prices not applicable yet

**Pass/Fail**: [ ]

**Notes**: _______________________________________________________

---

## Known Limitations & Future Enhancements

### Current Limitations (Expected)
1. **Manual Region Change Required**
   - Users cannot yet change currency from UI (settings page coming)
   - Requires API call or automatic detection

2. **Batch API Not Yet Optimized**
   - Each product card may call API individually
   - Phase 5+ will optimize with batch endpoint

3. **Currency Selector UI Not Built**
   - Planned for future phase
   - Users can't manually override from dropdown

4. **IP Geolocation Stubbed**
   - Automatic region detection from IP not yet implemented
   - Falls back to US/USD for new users

5. **Business Directory Pricing N/A**
   - Businesses don't have pricing fields yet
   - Future: If services/products added, PriceTag can be integrated

### Not Tested Yet (Out of Scope for Phase 5)
- ❌ Payment checkout flows (Phase 6+)
- ❌ Cart totals with multi-currency (Phase 6+)
- ❌ Stripe/PayPal integration (Phase 6+)
- ❌ Currency conversion in checkout (Phase 6+)

---

## Summary & Sign-Off

### Test Results Summary

| Test Suite | Pass | Fail | Notes |
|------------|------|------|-------|
| 1. USD Region | [ ] | [ ] | ______ |
| 2. Nigeria (NGN) | [ ] | [ ] | ______ |
| 3. UK (GBP) | [ ] | [ ] | ______ |
| 4. Ghana (GHS) | [ ] | [ ] | ______ |
| 5. Fallback & Error | [ ] | [ ] | ______ |
| 6. Product Detail | [ ] | [ ] | ______ |
| 7. Cross-Browser | [ ] | [ ] | ______ |
| 8. Business Directory | [ ] | [ ] | ______ |

### Critical Issues Found
_______________________________________________________
_______________________________________________________
_______________________________________________________

### Minor Issues / Suggestions
_______________________________________________________
_______________________________________________________
_______________________________________________________

### UAT Approval

**Tested By**: ___________________________  
**Date**: _______________  
**Status**: [ ] APPROVED   [ ] NEEDS REVISION  

**Founder Sign-Off**: ___________________________  
**Date**: _______________  

---

## Quick Reference: Currency Symbols

| Currency | Symbol | Example Display |
|----------|--------|----------------|
| USD | $ | $12.00 |
| NGN | ₦ | ₦17,400 |
| GBP | £ | £9.48 |
| GHS | ₵ | ₵150.00 |
| EUR | € | €11.04 |
| ZAR | R | R222.00 |
| KES | KSh | KSh1,860 |
| CAD | C$ | C$16.32 |

---

## Support & Questions

If you encounter issues during UAT:
1. Check `/app/BCEE_PHASE5_TEST_REPORT.md` for automated test results
2. Review `/app/BCEE_PHASE4_IMPLEMENTATION.md` for technical details
3. Contact development team with specific test case number

**End of UAT Checklist**
