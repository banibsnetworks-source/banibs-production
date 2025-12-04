# 🧭 NAVIGATION V2 — IMPLEMENTATION VIEW (ULTRA MODE)
**Date**: December 4, 2024  
**Status**: Architecture Analysis (No Implementation Yet)  
**Purpose**: Strategic planning for BANIBS Navigation v2 system

---

## 🎯 EXECUTIVE SUMMARY

The proposed **3-layer navigation architecture** (Global → Context → Utility) is **well-designed** and addresses major UX challenges in the current system. This analysis provides a detailed implementation roadmap with component architecture, risk mitigation, and phased execution plan.

**Key Finding**: Current GlobalNavBar can be refactored incrementally. No "big bang" rewrite required. Mobile bottom nav is the biggest new addition.

---

## 📊 CURRENT STATE ANALYSIS

### **Existing Navigation Component**
**Location**: `/app/frontend/src/components/GlobalNavBar.js`

**Current Features**:
- Desktop top nav with 6 main links
- Mobile hamburger menu
- Auth modal integration
- Theme switcher
- Account dropdown

**Current Nav Items**:
```javascript
const navLinks = [
  { label: 'BANIBS News', path: '/', icon: '📰' },
  { label: 'Business Directory', path: '/business-directory', icon: '💼' },
  { label: 'BANIBS Social', path: '/social', icon: '🌐' },
  { label: 'Information & Resources', path: '/resources', icon: '📚' },
  { label: 'Marketplace', path: '/portal/marketplace', icon: '🛍️' },
  { label: 'BANIBS TV', path: '/portal/tv', icon: '📺' },
];
```

### **Gap Analysis**

| Feature | Current | V2 Needed | Gap |
|---------|---------|-----------|-----|
| Desktop nav | 6 items, basic styling | 11+ items with mega menu | High |
| Mobile nav | Hamburger only | Bottom nav + hamburger | High |
| Active state | Basic highlight | Gold underline/capsule | Medium |
| Hover effects | Simple | Gold glow + shimmer | Medium |
| Context nav | None | Portal-specific nav | High |
| Mega menu | None | News categories dropdown | High |
| Visual tokens | Hardcoded colors | v2 design tokens | High |

---

## 🏗️ PROPOSED COMPONENT ARCHITECTURE

### **1. Layer 1 - Global Top Nav Component**

**New Component**: `/app/frontend/src/components/navigation/GlobalTopNav.jsx`

```javascript
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import MegaMenu from './MegaMenu';

const GlobalTopNav = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  
  // V2 Navigation Items (Tier 1)
  const navItems = [
    { label: 'Home', path: '/' },
    { label: 'Black News', path: '/news/black', hasMegaMenu: true },
    { label: 'U.S.', path: '/news/us' },
    { label: 'World', path: '/news/world' },
    { label: 'Politics', path: '/news/politics' },
    { label: 'Health', path: '/news/health' },
    { label: 'MoneyWatch', path: '/news/moneywatch' },
    { label: 'Crime', path: '/news/crime' },
    { label: 'Culture', path: '/news/culture' },
    { label: 'Civil Rights', path: '/news/civil-rights' },
    { label: 'Entertainment', path: '/news/entertainment' },
  ];
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="global-top-nav" style={{
      height: 'var(--nav-height)',
      backgroundColor: 'var(--color-onyx)',
      borderBottom: '1px solid var(--border-color)'
    }}>
      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo">
          <span style={{ color: 'var(--color-gold)' }}>BANIBS</span>
        </Link>
        
        {/* Nav Items */}
        <div className="nav-items">
          {navItems.map((item) => (
            <div
              key={item.path}
              className="nav-item"
              onMouseEnter={() => item.hasMegaMenu && setMegaMenuOpen(true)}
              onMouseLeave={() => item.hasMegaMenu && setMegaMenuOpen(false)}
            >
              <Link
                to={item.path}
                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                style={{
                  color: isActive(item.path) ? 'var(--color-gold)' : '#FFFFFF',
                  borderBottom: isActive(item.path) ? '2px solid var(--color-gold)' : 'none',
                  transition: 'var(--anim-medium)'
                }}
              >
                {item.label}
              </Link>
              
              {/* Mega Menu for News categories */}
              {item.hasMegaMenu && megaMenuOpen && (
                <MegaMenu category={item.label} />
              )}
            </div>
          ))}
        </div>
        
        {/* Utility Nav */}
        <div className="nav-utility">
          <SearchButton />
          {isAuthenticated ? (
            <AccountDropdown user={user} />
          ) : (
            <Link to="/auth/signin" className="btn-signin">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default GlobalTopNav;
```

**Timeline**: 8-10 hours  
**Risk**: MEDIUM (requires visual design for gold hover states)

---

### **2. Mega Menu Component**

**New Component**: `/app/frontend/src/components/navigation/MegaMenu.jsx`

```javascript
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MegaMenu = ({ category }) => {
  const [subcategories, setSubcategories] = useState([]);
  
  useEffect(() => {
    const loadSubcategories = async () => {
      if (category === 'Black News') {
        // Fetch Tier 2 categories for Black News
        const response = await axios.get(`${API}/news/taxonomy/tier2/Black News`);
        setSubcategories(response.data.subcategories);
      }
    };
    loadSubcategories();
  }, [category]);
  
  return (
    <div className="mega-menu" style={{
      position: 'absolute',
      top: '100%',
      left: 0,
      width: '100%',
      backgroundColor: 'var(--color-onyx)',
      borderTop: '1px solid var(--border-color)',
      padding: 'var(--space-lg)',
      animation: 'fadeIn var(--anim-medium)',
      zIndex: 1000
    }}>
      <div className="mega-menu-grid">
        {subcategories.map((sub) => (
          <Link
            key={sub._id}
            to={`/news/black/${sub._id.toLowerCase().replace(/\s+/g, '-')}`}
            className="mega-menu-item"
            style={{
              color: '#FFFFFF',
              padding: 'var(--space-sm)',
              borderRadius: 'var(--radius-md)',
              transition: 'var(--anim-fast)'
            }}
          >
            <span>{sub._id}</span>
            <span className="count" style={{ color: 'var(--color-slate)' }}>
              ({sub.count})
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MegaMenu;
```

**Timeline**: 4-6 hours  
**Risk**: LOW

---

### **3. Layer 2 - Context Nav Component**

**New Component**: `/app/frontend/src/components/navigation/ContextNav.jsx`

```javascript
import React from 'react';
import { Link, useLocation } from 'react-router';

/**
 * Context Nav - Appears within specific portals/sections
 * Example: Social Portal has Feed, Messages, Circles, etc.
 */
const ContextNav = ({ items, variant = 'horizontal' }) => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className={`context-nav context-nav--${variant}`}>
      {items.map((item) => (
        <Link
          key={item.path}
          to={item.path}
          className={`context-nav-item ${isActive(item.path) ? 'active' : ''}`}
          style={{
            color: isActive(item.path) ? 'var(--color-gold)' : 'var(--text-secondary)',
            fontWeight: isActive(item.path) ? 'var(--fw-semibold)' : 'var(--fw-regular)',
            transition: 'var(--anim-fast)'
          }}
        >
          {item.icon && <span className="item-icon">{item.icon}</span>}
          <span>{item.label}</span>
          {item.badge && <span className="badge">{item.badge}</span>}
        </Link>
      ))}
    </nav>
  );
};

export default ContextNav;
```

**Usage Example** (Social Portal):
```javascript
// /app/frontend/src/pages/portals/SocialPortal.js

const socialNavItems = [
  { label: 'Feed', path: '/portal/social', icon: '🏠' },
  { label: 'Messages', path: '/portal/social/messages', icon: '💬', badge: 3 },
  { label: 'Circles', path: '/portal/social/circles', icon: '👥' },
  { label: 'Notifications', path: '/portal/social/notifications', icon: '🔔', badge: 12 },
  { label: 'Profile', path: '/portal/social/profile', icon: '👤' },
];

return (
  <div className="social-portal">
    <ContextNav items={socialNavItems} />
    {/* Portal content */}
  </div>
);
```

**Timeline**: 4-6 hours  
**Risk**: LOW

---

### **4. Mobile Bottom Nav Component**

**New Component**: `/app/frontend/src/components/navigation/MobileBottomNav.jsx`

```javascript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Newspaper, Users, ShoppingBag, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Bottom nav items (3-5 max for mobile)
  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'News', path: '/news/black', icon: Newspaper },
    { label: 'Social', path: '/portal/social', icon: Users, requireAuth: true },
    { label: 'Marketplace', path: '/portal/marketplace', icon: ShoppingBag },
    { 
      label: 'Profile', 
      path: isAuthenticated ? '/portal/social/profile' : '/auth/signin', 
      icon: User 
    },
  ];
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };
  
  return (
    <nav className="mobile-bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: 'var(--color-onyx)',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000
    }}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);
        
        // Hide auth-required items if not logged in
        if (item.requireAuth && !isAuthenticated) return null;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className="bottom-nav-item"
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              color: active ? 'var(--color-gold)' : 'var(--text-secondary)',
              transition: 'var(--anim-fast)'
            }}
          >
            <Icon size={24} strokeWidth={active ? 2.5 : 2} />
            <span style={{ fontSize: '10px', fontWeight: active ? 600 : 400 }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default MobileBottomNav;
```

**Timeline**: 6-8 hours  
**Risk**: LOW

---

### **5. Mobile Hamburger Menu**

**Updated Component**: `/app/frontend/src/components/navigation/MobileHamburgerMenu.jsx`

```javascript
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

const MobileHamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Black News', path: '/news/black' },
    { label: 'U.S. News', path: '/news/us' },
    { label: 'World News', path: '/news/world' },
    { label: 'Politics', path: '/news/politics' },
    { label: 'Health', path: '/news/health' },
    { label: 'MoneyWatch', path: '/news/moneywatch' },
    { label: 'Crime', path: '/news/crime' },
    { label: 'Culture', path: '/news/culture' },
    { label: 'Civil Rights', path: '/news/civil-rights' },
    { label: 'Entertainment', path: '/news/entertainment' },
    { divider: true },
    { label: 'Social Portal', path: '/portal/social' },
    { label: 'Marketplace', path: '/portal/marketplace' },
    { label: 'Business Directory', path: '/business-directory' },
  ];
  
  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hamburger-btn"
        style={{
          color: 'var(--color-gold)',
          padding: 'var(--space-sm)'
        }}
      >
        {isOpen ? <X size={28} /> : <Menu size={28} />}
      </button>
      
      {/* Overlay Menu */}
      {isOpen && (
        <div className="mobile-menu-overlay" style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'var(--color-obsidian)',
          zIndex: 999,
          animation: 'slideDown var(--anim-medium)',
          overflowY: 'auto'
        }}>
          {menuItems.map((item, index) => (
            item.divider ? (
              <div key={index} style={{
                height: '1px',
                backgroundColor: 'var(--border-color)',
                margin: 'var(--space-md) 0'
              }} />
            ) : (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'block',
                  padding: 'var(--space-md) var(--space-lg)',
                  color: '#FFFFFF',
                  fontSize: 'var(--fs-md)',
                  borderBottom: '1px solid var(--border-color)'
                }}
              >
                {item.label}
              </Link>
            )
          ))}
        </div>
      )}
    </>
  );
};

export default MobileHamburgerMenu;
```

**Timeline**: 4-6 hours  
**Risk**: LOW

---

## 🔄 ROUTING IMPACT ANALYSIS

### **Current Routes** (from App.js audit)
```
/                       → NewsHomePage
/news/black             → BlackNewsPage
/news/:section          → NewsSectionPage
/portal/social          → SocialPortal
/portal/marketplace     → MarketplacePortal
/auth/signin            → SignInPage
/auth/register          → RegisterPage
```

### **Proposed v2 Routes** (Backward Compatible)

**News Routes**:
```
/                       → NewsHomePage (Top Stories)
/news/black             → BlackNewsPage (Tier 1)
/news/black/:subcategory → BlackNewsSubcategoryPage (Tier 2) [NEW]
/news/us                → NewsSectionPage (Tier 1) [RENAME /news/:section]
/news/world             → NewsSectionPage
/news/politics          → NewsSectionPage
/news/health            → NewsSectionPage
/news/moneywatch        → NewsSectionPage
/news/crime             → NewsSectionPage
/news/culture           → NewsSectionPage
/news/civil-rights      → NewsSectionPage [NEW]
/news/entertainment     → NewsSectionPage
```

**Portal Routes** (No Changes):
```
/portal/social          → SocialPortal
/portal/marketplace     → MarketplacePortal
/portal/business        → BusinessPortal
/portal/tv              → TVPortal
```

**Auth Routes** (No Changes):
```
/auth/signin
/auth/register
/auth/forgot-password
```

### **Migration Path**

**Step 1**: Add new routes without removing old ones
```javascript
// Old (keep for now)
<Route path="/news/:section" element={<NewsSectionPage />} />

// New (add alongside)
<Route path="/news/us" element={<NewsSectionPage section="U.S." />} />
<Route path="/news/world" element={<NewsSectionPage section="World" />} />
// ... etc
```

**Step 2**: Update all internal links to use new routes

**Step 3**: Monitor analytics for old route usage

**Step 4**: After 3 months, add redirects:
```javascript
<Route path="/news/politics-and-government" element={<Navigate to="/news/politics" replace />} />
```

**Timeline**: 4-6 hours for route updates  
**Risk**: LOW (backward compatible)

---

## 🎨 VISUAL IMPLEMENTATION (V2 TOKENS)

### **CSS Variables** (Global Stylesheet)

**New File**: `/app/frontend/src/styles/navigation-v2.css`

```css
/* Navigation v2 Design Tokens */
:root {
  /* NAV STRUCTURE */
  --nav-height: 64px;
  --nav-mobile-bottom-height: 64px;
  
  /* NAV COLORS */
  --nav-bg: var(--color-onyx);
  --nav-text: #FFFFFF;
  --nav-text-secondary: var(--text-secondary);
  --nav-active: var(--color-gold);
  --nav-hover: var(--color-electric-gold);
  --nav-border: var(--border-color);
  
  /* NAV SPACING */
  --nav-padding-x: var(--space-lg);
  --nav-item-gap: var(--space-md);
  
  /* NAV MOTION */
  --nav-transition: var(--anim-fast);
  --nav-hover-transition: var(--anim-medium);
}

/* Global Top Nav */
.global-top-nav {
  height: var(--nav-height);
  background-color: var(--nav-bg);
  border-bottom: 1px solid var(--nav-border);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-link {
  color: var(--nav-text);
  transition: var(--nav-transition);
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-weight: var(--fw-medium);
}

.nav-link:hover {
  color: var(--nav-hover);
  text-shadow: 0 0 8px rgba(238, 209, 140, 0.3); /* Gold glow */
}

.nav-link.active {
  color: var(--nav-active);
  border-bottom: 2px solid var(--nav-active);
  font-weight: var(--fw-semibold);
}

/* Mobile Bottom Nav */
.mobile-bottom-nav {
  display: none; /* Hidden on desktop */
}

@media (max-width: 768px) {
  .mobile-bottom-nav {
    display: flex;
  }
  
  .global-top-nav .nav-items {
    display: none; /* Hide desktop nav items */
  }
}

/* Mega Menu */
.mega-menu {
  position: absolute;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: var(--nav-bg);
  border-top: 1px solid var(--nav-border);
  box-shadow: var(--shadow-lg);
  animation: fadeIn var(--anim-medium);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.mega-menu-item:hover {
  background-color: rgba(200, 168, 87, 0.1); /* Gold tint */
  color: var(--nav-active);
}

/* Context Nav */
.context-nav {
  display: flex;
  gap: var(--nav-item-gap);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border-color);
}

.context-nav-item {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  transition: var(--nav-transition);
}

.context-nav-item.active {
  background-color: rgba(200, 168, 87, 0.15);
  color: var(--color-gold);
}
```

**Timeline**: 2-3 hours  
**Risk**: LOW

---

## 🛠️ IMPLEMENTATION PHASES

### **PHASE A: Architecture Planning** (4-6 hours)
**Deliverables**:
1. Validate all current routes
2. Create route mapping table (old → new)
3. Identify outdated nav patterns
4. Document context nav requirements per portal
5. Design navigation flow diagrams

**Dependencies**: None  
**Risk**: LOW

---

### **PHASE B: Desktop Navigation Redesign** (12-14 hours)
**Deliverables**:
1. Create `GlobalTopNav.jsx` component
2. Implement mega menu component
3. Update `App.js` to use new nav
4. Apply v2 visual tokens (gold underline, hover effects)
5. Test across all pages

**Dependencies**: Phase A complete  
**Risk**: MEDIUM (visual design iteration needed)

---

### **PHASE C: Mobile Navigation Overhaul** (10-12 hours)
**Deliverables**:
1. Create `MobileBottomNav.jsx` component
2. Update `MobileHamburgerMenu.jsx` component
3. Implement responsive breakpoints
4. Test on real mobile devices
5. Ensure parity with desktop

**Dependencies**: Phase B complete  
**Risk**: MEDIUM (cross-device testing required)

---

### **PHASE D: Context Navigation Framework** (8-10 hours)
**Deliverables**:
1. Create `ContextNav.jsx` reusable component
2. Apply to Social Portal
3. Apply to Marketplace Portal
4. Apply to News Article View
5. Standardize patterns

**Dependencies**: Phase B complete  
**Risk**: LOW

---

### **PHASE E: Integration with News Taxonomy v2** (6-8 hours)
**Deliverables**:
1. Update mega menu to load Tier 2 categories
2. Create category landing pages
3. Update nav to reflect taxonomy structure
4. Test navigation flow

**Dependencies**: News Taxonomy v2 Phase B complete  
**Risk**: LOW

---

### **PHASE F: Visual Polish & Animation** (4-6 hours)
**Deliverables**:
1. Implement gold shimmer on hover
2. Add smooth transitions
3. Polish mega menu animations
4. Test motion system consistency

**Dependencies**: Phase B, C, D complete  
**Risk**: LOW

---

## ⚠️ RISKS & MITIGATION

### **Risk #1: Desktop Nav Overflow (Too Many Items)**
**Issue**: 11+ nav items may not fit on smaller desktop screens  
**Probability**: HIGH  
**Impact**: MEDIUM

**Mitigation**:
- Use mega menu to hide subcategories
- Implement responsive nav that collapses at 1024px
- Consider "More" dropdown for less-used items
- Prioritize top 7-8 items, hide rest in mega menu

---

### **Risk #2: Mobile Bottom Nav Conflicts with Portal UI**
**Issue**: Bottom nav may obstruct content in some portals  
**Probability**: MEDIUM  
**Impact**: MEDIUM

**Mitigation**:
- Add `padding-bottom: 80px` to portal containers
- Use z-index carefully to avoid conflicts
- Test with all portal layouts
- Consider hiding bottom nav on scroll (optional)

---

### **Risk #3: Mega Menu Performance**
**Issue**: Loading Tier 2 categories on hover may cause lag  
**Probability**: LOW  
**Impact**: LOW

**Mitigation**:
- Cache Tier 2 categories in localStorage
- Preload on page load (not on hover)
- Use React.memo() for mega menu component
- Add loading skeleton

---

### **Risk #4: Backward Compatibility**
**Issue**: Old bookmarks/links may break  
**Probability**: LOW  
**Impact**: MEDIUM

**Mitigation**:
- Keep old routes active with redirects
- Monitor analytics for old route usage
- Gradual deprecation over 3-6 months
- Add 301 redirects after cutover

---

### **Risk #5: Context Nav Inconsistency**
**Issue**: Different portals may have different nav patterns  
**Probability**: MEDIUM  
**Impact**: MEDIUM

**Mitigation**:
- Create shared ContextNav component
- Document clear usage guidelines
- Design review for each portal
- Enforce pattern in code reviews

---

## 🎯 RECOMMENDED STARTING POINT

### **Start with Phase B (Desktop Nav)** (12-14 hours)

**Why?**
1. **Highest user impact** - Desktop is 40-50% of traffic
2. **Foundation for mobile** - Mobile nav builds on desktop patterns
3. **Visual brand signature** - Gold underline establishes v2 identity
4. **Relatively isolated** - Can be done without touching portals

**Execution**:
1. Week 1: Create new GlobalTopNav component (8 hours)
2. Week 2: Implement mega menu + visual polish (4-6 hours)
3. Week 3: Test across all pages (2 hours)

---

## 📋 QUESTIONS & CLARIFICATIONS NEEDED

### **Question 1: News Category Priority**
Should all 11 Tier 1 categories be in the top nav, or should some be in mega menu only?

**Recommendation**: Top 7-8 visible, rest in "More" dropdown or mega menu.

---

### **Question 2: Social Portal Access**
Should "Social" nav item be visible for unauthenticated users, or hidden/disabled?

**Recommendation**: Visible for all, clicking prompts auth modal if not logged in.

---

### **Question 3: Search Placement**
Should search be in global top nav, or context-specific (e.g., News portal only)?

**Recommendation**: Global nav (right side), context-specific search can be added later.

---

### **Question 4: Mobile Bottom Nav Icons**
Should we use text labels + icons, or icons only?

**Recommendation**: Icons + text labels (better accessibility, lower cognitive load).

---

## 📊 SUCCESS METRICS

| Metric | Baseline | V2 Target |
|--------|----------|-----------|
| Navigation clarity score | Unknown | 90%+ |
| Mobile navigation satisfaction | Unknown | 85%+ |
| Desktop nav discovery rate | Low | High |
| Time to find content | Unknown | -30% |
| Mobile bounce rate | Unknown | -15% |

---

## 🚀 FINAL RECOMMENDATION

**Navigation v2 is architecturally sound and ready for phased implementation.**

**Green light to proceed** once:
1. Visual design mockups are approved (desktop + mobile)
2. Mega menu UX is finalized
3. Context nav patterns are documented per portal

**Timeline**: 44-56 hours total across 6 phases  
**Risk Level**: MEDIUM (requires cross-device testing and visual design iteration)  
**Business Impact**: VERY HIGH (navigation touches every page view, defines brand experience)

---

## 📐 COMPONENT HIERARCHY (V2)

```
App.js
├── GlobalTopNav (Layer 1)
│   ├── NavLogo
│   ├── NavItems
│   │   └── MegaMenu (for News categories)
│   └── UtilityNav (Layer 3)
│       ├── SearchButton
│       └── AccountDropdown
├── MobileTopBar (mobile only)
│   ├── HamburgerMenu
│   ├── Logo
│   └── UtilityIcons
├── MobileBottomNav (mobile only)
│   └── BottomNavItems (5 max)
├── Pages
│   ├── SocialPortal
│   │   ├── ContextNav (Layer 2)
│   │   └── PortalContent
│   ├── MarketplacePortal
│   │   ├── ContextNav (Layer 2)
│   │   └── PortalContent
│   └── NewsHomePage
│       └── Content
```

---

**End of Navigation v2 Implementation View**
