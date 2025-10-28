# BANIBS Design System v1

**Date Established:** October 28, 2025  
**Status:** ✅ Locked for Production

---

## 🏛️ BANIBS Brand Lock

**BANIBS — Black America News Information & Business System**

BANIBS is a digital infrastructure that informs, empowers, and connects the Black community through news, opportunity, and enterprise.  
It unites four pillars — **News, Business, Resources, and Social Connectivity** — within one cohesive ecosystem designed to expand access and strengthen collaboration across Black America.

**Tagline:** Connecting our people to opportunity, resources, and each other.

---

This document defines the visual language, component tokens, and layout patterns for the BANIBS platform. All future pages and components should inherit this design DNA to maintain consistency.

---

## Visual Hierarchy

BANIBS uses a clear content hierarchy that guides users from awareness → relevance → proof → conversion:

```
1. Hero Section (black gradient - identity & mission)
2. Compact Category Strip (utility navigation for opportunity-seekers)
3. Featured Story (flagship editorial content)
4. Latest Stories (dynamic news feed)
5. The BANIBS Network (ecosystem showcase)
6. Community Highlights (social proof & pride)
7. Opportunities CTA (conversion band)
8. Footer
```

**Key Principle:** This flow serves two audiences simultaneously:
- **Opportunity seekers** get immediate category access (Jobs, Grants, etc.) without scrolling
- **Culture/news readers** get uninterrupted editorial storytelling
- **Ecosystem explorers** discover the broader BANIBS platform vision

---

## Design Tokens

### Core Component Styles

| Token | Tailwind Classes | Usage |
|-------|------------------|-------|
| **Glass Card** | `bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition` | Primary content containers (Featured Story, Latest Stories, Browse Category cards) |
| **Glass Card with Hover Lift** | `hover:shadow-lg hover:-translate-y-1 transition-transform duration-200 ease-in-out` | Interactive cards that need prominent hover feedback |
| **Pill Button** | `px-3 py-1.5 text-sm font-medium text-gray-800 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition` | Category navigation pills |
| **Gold Accent Card** | `border border-yellow-400/60 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm` | Community Highlights (recognition/pride content) |
| **Dark CTA Band Wrapper** | `bg-gray-900 text-white px-4 py-10 text-center` | Conversion sections (Opportunities CTA) |

### Layout & Spacing

| Token | Tailwind Classes | Usage |
|-------|------------------|-------|
| **Section Wrapper** | `max-w-7xl mx-auto px-4 mt-8 md:mt-10` | Standard section container with responsive top margin |
| **Section Header** | `text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2` | All major section headings (with emoji icon) |
| **Card Padding** | `p-6 md:p-8` | Internal padding for large content cards |
| **Small Card Padding** | `p-5` | Internal padding for compact cards (news items, highlights) |
| **2-Column Grid** | `grid grid-cols-1 md:grid-cols-2 gap-6` | Latest Stories, Community Highlights |
| **5-Column Responsive Grid** | `grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4` | Large category grids (if needed elsewhere) |

### Typography & Color

| Element | Classes | Notes |
|---------|---------|-------|
| **Section Heading** | `text-xl md:text-2xl font-bold text-gray-800` | With emoji icon, mb-4 spacing |
| **Card Title** | `text-lg font-semibold text-gray-900 leading-snug` | Story/card headlines |
| **Body Text** | `text-sm text-gray-700 leading-relaxed` | Descriptions, summaries |
| **Meta Text** | `text-xs text-gray-500` | Dates, categories, auxiliary info |
| **Gold Accent Text** | `text-yellow-700` | Community Highlights labels/links |
| **Dark Background Text** | `text-white` on `bg-gray-900` | CTA sections |

---

## Section Patterns

### 1. Hero Section
```jsx
<div className="relative bg-gradient-to-b from-black to-[#1a1a1a] py-16">
  {/* Black gradient background, gold text (#FFD700) for branding */}
</div>
```

### 2. Compact Category Strip
```jsx
<section className="max-w-7xl mx-auto px-4 mt-6">
  <h2 className="text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
    <span className="text-lg">🗂️</span>
    <span>Browse by category</span>
  </h2>
  
  <div className="flex flex-wrap gap-2">
    {/* Pill buttons for each category */}
  </div>
</section>
```

### 3. Featured Story
```jsx
<section className="max-w-7xl mx-auto px-4 mt-8 md:mt-10">
  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    <span className="text-lg">🌟</span>
    <span>Featured Story</span>
  </h2>
  
  <div className="bg-white/80 backdrop-blur-sm border border-gray-100 rounded-2xl p-6 md:p-8 shadow-md">
    {/* Large glass card with image + text content */}
  </div>
</section>
```

### 4. Latest Stories (Dynamic Feed)
```jsx
<section className="max-w-7xl mx-auto px-4 mt-8 md:mt-10">
  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    <span className="text-lg">📰</span>
    <span>Latest Stories</span>
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Story cards in 2-column grid */}
  </div>
</section>
```

**Empty State Message:**
```
We're building out community coverage right now. Fresh stories will start appearing here first.
```

### 5. The BANIBS Network
```jsx
<section className="max-w-7xl mx-auto px-4 mt-10 md:mt-12">
  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    <span className="text-lg">🌐</span>
    <span>The BANIBS Network</span>
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Ecosystem product cards - Social, TV, Business, Resources */}
  </div>
</section>
```

**Purpose:** Showcases the broader BANIBS ecosystem beyond opportunities. Positions BANIBS as a multi-faceted platform (social network, media, business directory, resource library).

**Card Pattern:**
```jsx
<div className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col justify-between">
  <div>
    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 mb-2">
      <span className="text-xl">{emoji}</span>
      <span>{productName}</span>
    </div>
    <p className="text-sm text-gray-700 leading-relaxed">
      {description}
    </p>
  </div>
  <div className="mt-4">
    {/* CTA or "Coming soon" label */}
  </div>
</div>
```

**Responsive:** 1 column mobile → 2 columns tablet → 4 columns desktop

### 6. Community Highlights
```jsx
<section className="max-w-7xl mx-auto px-4 mt-8 md:mt-10">
  <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
    <span className="text-lg">🏆</span>
    <span>Community Highlights</span>
  </h2>
  
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Gold-accent glass cards */}
  </div>
</section>
```

### 7. Opportunities CTA
```jsx
<section className="mt-12 bg-gray-900 text-white">
  <div className="max-w-7xl mx-auto px-4 py-10 text-center">
    <h2 className="text-2xl font-bold">Looking for Opportunities?</h2>
    <p className="text-gray-300 max-w-2xl mx-auto mt-3 text-base">
      {/* Value proposition */}
    </p>
    
    <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
      {/* Primary CTA button + secondary link */}
    </div>
  </div>
</section>
```

---

## Mobile Responsiveness

### Key Breakpoints
- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md/lg)
- **Desktop:** > 1024px

### Mobile-Specific Adjustments
1. **Section Spacing:** Use `mt-8 md:mt-10` to tighten spacing on mobile
2. **Pill Buttons:** Wrap naturally with `flex flex-wrap gap-2`
3. **Featured Story:** Image stacks above text on mobile (`flex-col md:flex-row`)
4. **Grids:** All multi-column grids collapse to single column on mobile

---

## Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| **BANIBS Gold** | `#FFD700` | Brand primary (hero text, accents) |
| **Gray 900** | `#111827` | Dark backgrounds, CTA bands |
| **Gray 800** | `#1F2937` | Section headings |
| **Gray 700** | `#374151` | Body text |
| **Gray 500** | `#6B7280` | Meta text, muted content |
| **Yellow 700** | `#A16207` | Gold accent text (Community Highlights) |
| **Yellow 400/60** | `rgba(251, 191, 36, 0.6)` | Gold accent borders |
| **White/70** | `rgba(255, 255, 255, 0.7)` | Glass card backgrounds |
| **White/80** | `rgba(255, 255, 255, 0.8)` | Stronger glass backgrounds |

---

## Implementation Rules

### DO:
✅ Use these tokens for all new pages (Opportunity Detail, Admin Dashboard, etc.)  
✅ Keep section order consistent with the hierarchy defined above  
✅ Use emoji icons (🌟 📰 🏆 etc.) in section headers for visual anchors  
✅ Test mobile responsiveness at 375px width  
✅ Maintain `rounded-2xl` for large cards, `rounded-xl` for small cards  
✅ Use `backdrop-blur-sm` with transparency for the glass effect  

### DON'T:
❌ Revert to "random gray boxes and harsh borders"  
❌ Break the hero → pills → story flow order  
❌ Use ObjectId in news data (UUID only)  
❌ Add images to empty states (text-only is cleaner)  
❌ Remove the compact category strip (it serves opportunity-seekers)  
❌ Change spacing tokens without updating this document  

---

## Future Extensions

When building new sections/pages, apply these patterns:

- **Admin Dashboard:** Reskin with glass cards instead of current dark theme
- **Opportunity Detail Page:** Use large glass card wrapper, section headers with icons
- **Contributor Profile:** Follow Community Highlights style (gold accents for achievements)
- **Search Results:** Use Latest Stories card pattern (2-column grid)

### BANIBS Network Products (Roadmap)

The ecosystem cards in "The BANIBS Network" section represent future platform expansions:

1. **BANIBS Social** (Coming Soon)
   - Social network for Black and Indigenous creators, founders, and community leaders
   - Features: Profiles, conversations, community building
   - Use glass card design system throughout

2. **BANIBS TV**
   - Video platform for interviews, business spotlights, culture segments
   - Live community conversations and recorded content
   - Potential integration: YouTube/Vimeo embed or custom player

3. **BANIBS Business**
   - Business directory for Black and Native Indigenous-owned businesses
   - "Buy direct, support local" marketplace features
   - Search, filtering, business profiles with glass card UI

4. **Resources**
   - Evergreen content library: grants guidance, scholarship how-tos, legal support
   - Startup guides, funding playbooks, education resources
   - Organized by topic (founders, students, organizers)
   - Use same card patterns as Latest Stories for resource listings

---

## Version History

**v1.0** (Oct 28, 2025)
- Initial design system established
- News front page layout finalized
- Core tokens documented
- Mobile responsiveness patterns defined

---

**Last Updated:** October 28, 2025  
**Maintained By:** BANIBS Development Team
