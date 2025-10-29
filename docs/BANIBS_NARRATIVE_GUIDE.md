# BANIBS Narrative Blueprint
**The Unbreakable DNA of BANIBS**

Version: 1.0  
Date: October 28, 2025  
Maintainer: BANIBS Core Team  
Status: 🔒 **LOCKED - DO NOT REMOVE**

---

## Core Principle

**"Every public-facing BANIBS page must instantly communicate that BANIBS is not just a news site, but a unified system — Social, Business, Information, Education, Youth, and Opportunities — connecting and empowering communities."**

This is not optional. This is the brand.

---

## Required Storyline Order (Above the Fold)

### 1. Identity Statement (Header Line)

**Text:** "BANIBS — Black America News, Information & Business System"

**Placement:** Must appear in or directly beneath the main logo in the hero section.

**Purpose:** Immediately establishes what BANIBS is — a comprehensive system, not just a website.

**Rules:**
- ✅ Must be visible on every homepage load
- ✅ Must use the full name (not just "BANIBS")
- ✅ Typography should be prominent but not overwhelming
- ❌ Cannot be hidden behind a click or hover
- ❌ Cannot be replaced with generic copy like "Welcome" or "Home"

---

### 2. Primary Function Links (Quick Nav Layer)

**Links:** Social | Business | Information | Education | Youth | Opportunities | Resources

**Placement:** Visible immediately under the hero or top nav

**Purpose:** Shows the breadth of the platform at first glance. Users should never think "BANIBS is just news."

**Rules:**
- ✅ All seven links must be present
- ✅ Must be text-based (pills, compact buttons, or horizontal list)
- ✅ Must be present on all homepage variations (desktop and mobile)
- ✅ May collapse into a dropdown/hamburger on small screens, but never disappear
- ✅ Links should be clickable (even if some lead to "Coming Soon" pages)
- ❌ Cannot reduce to fewer than 7 core links
- ❌ Cannot replace with generic "Explore" or "More" without showing the seven
- ❌ Cannot hide behind scroll or accordion without user action

**Order matters:**
```
Social → Business → Information → Education → Youth → Opportunities → Resources
```

This order tells a story:
1. **Social** - Connect with people
2. **Business** - Support Black-owned businesses
3. **Information** - News and culture
4. **Education** - Learn and grow
5. **Youth** - Next generation focus
6. **Opportunities** - Jobs, grants, scholarships
7. **Resources** - Tools and guides

---

### 3. Mission Context (Tagline)

**Text:** "Connecting Black and Indigenous communities through news, business, and opportunity."

**Placement:** One short tagline visible on every homepage or landing header (typically in hero section).

**Purpose:** Explains the "why" of BANIBS in one sentence.

**Rules:**
- ✅ Must be visible in hero or immediately below
- ✅ Should be styled to complement (not compete with) the identity line
- ✅ Can be shortened for mobile: "Connecting our communities through news, business, and opportunity."
- ❌ Cannot be removed or replaced with generic marketing copy
- ❌ Should not be buried in an "About" page

---

### 4. Ecosystem Showcase (Mid-Page)

**Section Title:** "The BANIBS Network"

**Content:** Cards or grid showing:
- BANIBS Social (community connection)
- BANIBS TV (video platform)
- BANIBS Business (directory)
- Resources (guides, funding, education)

**Placement:** Mid-page, after Latest Stories, before Community Highlights

**Purpose:** Reinforces that BANIBS is a platform ecosystem, not a single app.

**Rules:**
- ✅ Section titled "The BANIBS Network" must always exist
- ✅ Can evolve visually (cards, grid, list), but cannot be removed
- ✅ Should show at least 4 ecosystem products
- ✅ "Coming Soon" states are acceptable for unbuilt products
- ❌ Cannot be collapsed into a single "Learn More" link
- ❌ Cannot be renamed to generic "Our Services" or "Features"

---

### 5. Footer Reinforcement Line

**Text:** "Part of the BANIBS Ecosystem — Social • Business • Information • Education • Youth • Opportunities"

**Placement:** Footer, either as a tagline above footer links or below copyright

**Purpose:** Final reminder that BANIBS is more than what's currently visible.

**Rules:**
- ✅ Must appear in footer of all pages
- ✅ Can use bullet separators (•) or pipes (|)
- ✅ Can be shortened for mobile: "BANIBS Ecosystem: Social • Business • Info • Education • Youth • Opportunities"
- ❌ Cannot be removed to save space
- ❌ Cannot be replaced with generic "All Rights Reserved" only

---

## Required Front-Page Narrative Elements (Checklist)

Every BANIBS build must include:

- [ ] **Identity Header**: "BANIBS — Black America News, Information & Business System"
- [ ] **Primary Quick Links**: Social | Business | Information | Education | Youth | Opportunities | Resources
- [ ] **Mission Tagline**: "Connecting Black and Indigenous communities through news, business, and opportunity."
- [ ] **Ecosystem Section**: "The BANIBS Network" with product cards
- [ ] **Footer Reinforcement**: "Part of the BANIBS Ecosystem — Social • Business • Information • Education • Youth • Opportunities"

---

## Why This Matters

### Problem This Solves

**Without this blueprint:**
- Developers might simplify the nav to "3 clean links" and lose the ecosystem message
- Designers might hide "coming soon" products to avoid looking incomplete
- AI agents might strip "redundant" sections during optimization
- The brand becomes "just another news site with a job board"

**With this blueprint:**
- BANIBS always communicates its full scope on first impression
- Users understand the vision even if some parts aren't built yet
- Partners and investors see a platform, not a feature
- The identity survives redesigns and team changes

---

## What Can Change (And What Cannot)

### ✅ You CAN change:
- Visual style (colors, fonts, spacing)
- Layout structure (horizontal nav vs. vertical, grid vs. list)
- Component order within sections (as long as required sections exist)
- Wording variations (as long as core message is preserved)
- Icons and imagery
- Animations and transitions

### ❌ You CANNOT change:
- The presence of the seven Quick Links
- The identity statement text (must include full name)
- The existence of "The BANIBS Network" section
- The mission tagline (concept, not exact words)
- The footer reinforcement line

---

## Enforcement Mechanisms

### 1. Human Review
- Design mockups must include all required elements
- Code reviews should check for QuickLinks component
- QA testing should verify homepage structure

### 2. Automated Checks
- CI/CD pipeline runs `npm run verify:identity`
- Script checks for QuickLinks component in HomePage
- Build fails if identity layer is missing

### 3. Documentation
- This file lives in `/docs/BANIBS_NARRATIVE_GUIDE.md`
- Referenced in README.md
- Linked from BANIBS_DESIGN_SYSTEM_V1.md

---

## Examples of Violations (What NOT to Do)

### ❌ Bad: Simplified Nav
```
Home | About | News | Contact
```
**Why:** Loses the ecosystem message. Users think BANIBS is just a blog.

### ❌ Bad: Hidden Quick Links
```
[Hamburger Menu]
  → Social
  → Business
  → Information
  → ...
```
**Why:** Forces users to click to discover the breadth. First impression is "just news."

### ❌ Bad: Generic Hero
```
"Welcome to Our Platform"
"Latest Updates and Opportunities"
```
**Why:** Could be any website. Doesn't establish what BANIBS is.

### ❌ Bad: Removed Ecosystem Section
```
Hero → News Feed → Community Highlights → Footer
```
**Why:** No mention of Social, TV, Business, Resources. Platform looks half-built.

---

## Examples of Good Implementation

### ✅ Good: Compact Pills (Desktop)
```
[Social] [Business] [Information] [Education] [Youth] [Opportunities] [Resources]
```

### ✅ Good: Stacked Pills (Mobile)
```
[Social]        [Business]
[Information]   [Education]
[Youth]         [Opportunities]
[Resources]
```

### ✅ Good: Dropdown with Icons (Mobile)
```
[≡ Explore BANIBS ▼]
  💬 Social
  🏢 Business
  📰 Information
  🎓 Education
  👥 Youth
  💼 Opportunities
  📚 Resources
```

---

## Future-Proofing

As BANIBS grows, this blueprint may evolve, but changes require:

1. **Team consensus** (not unilateral decision)
2. **Version update** (increment from 1.0 to 1.1, etc.)
3. **Change log** (document what changed and why)
4. **Re-education** (notify all contributors of changes)

**Last Updated:** October 28, 2025  
**Next Review:** When launching Phase 6 (SSO + Social)

---

## Contact

Questions about this blueprint? Reach out to the BANIBS Core Team or file an issue in the repo.

**Remember:** This is not a suggestion. This is the brand DNA. Protect it.
