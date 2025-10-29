---
BANIBS Identity Layer Contract
Version: 1.0
Date: 2025-10-28
Owner: BANIBS Core
Status: ACTIVE / NON-NEGOTIABLE
---

## Purpose
BANIBS is not just a news site. BANIBS is a system:
Black America News, Information & Business System.

The public homepage MUST always communicate that system at a glance. This is not optional, not cosmetic, and not something that can be "cleaned up later." It is the product.

## Required Elements

1. Core Navigation Bar ("Identity Layer Nav")
   - A dark glass / blurred bar with gold accents.
   - Must include these links, in any order, visible on desktop:
     - Social
     - Business
     - Information
     - Education
     - Youth
     - Opportunities
     - Resources
   - The bar must appear above core content (Featured Story, News, etc.).
   - The nav may wrap on mobile, but links cannot disappear.
   - This nav may not be collapsed behind a hamburger on desktop viewports.

2. Brand Statement
   - The text "BANIBS — Black America News, Information & Business System" must be present in the hero/heading area of the homepage.

3. Mission Tagline
   - A short line communicating purpose must be visible in or near the hero:
     "Connecting Black and Indigenous communities through news, business, and opportunity."

4. The BANIBS Network Section
   - A mid-page block titled "The BANIBS Network" that highlights what BANIBS is beyond headlines.
   - This section cannot be removed in homepage layouts.

5. Footer Ecosystem Line
   - Above the footer legal copy, include:
     "Part of the BANIBS Ecosystem — Social • Business • Information • Education • Youth • Opportunities."
   - This reinforces the pillars even for users who only scroll.

## Behavior Rules

- These identity elements are considered structural requirements.
- You are allowed to restyle (colors, spacing, animation, hover).
- You are NOT allowed to remove, hide, or rename the pillars without explicit approval from BANIBS Core.
- You are NOT allowed to ship a version of the homepage where the identity nav is missing or moved below content.
- Any A/B test, redesign, landing variant, or marketing splash page that calls itself the "homepage" must comply with this contract.

## Verification

We enforce two checks:

1. Visual / UX Check
   - The dark glass nav bar with gold accents must render and expose all core links above the fold.

2. Code Check
   - `/app/frontend/src/pages/HomePage.js` must import and render `QuickLinks`.
   - The automated script `yarn verify:identity` must pass.

If either fails, the build is considered out of brand compliance.

## Rationale

The BANIBS homepage is not just content. It is political, economic, and cultural infrastructure. Stripping the identity layer reduces BANIBS to "a news site," which breaks the mission and weakens the brand position.

Therefore: this layer is permanent.

## Future Redesign Policy

Any future redesign proposal that attempts to remove or demote the Identity Layer Navigation must be rejected as "out of scope" for visual cleanup and is considered a product decision, not a styling decision.

Changes to this contract require approval from BANIBS Core Team.

---
Last Updated: October 28, 2025
Next Review: Phase 6 Launch
