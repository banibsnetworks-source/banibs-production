# BANIBS UI v2.0 - Phase 7 Bulk Update Pattern
## Social + Business Mode Parity Upgrade Guide

---

## 🎯 Purpose

This document provides find-and-replace patterns to convert BANIBS Social and Business modules from legacy styles to BANIBS UI v2.0 Design System.

**Scope**: UI/UX parity only. No new features. No backend changes.

---

## 📋 PATTERN 1: BUTTONS

### Old → New Conversions

#### Primary Buttons (CTAs, Submit)
```jsx
// OLD
className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg px-4 py-2"
className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2"

// NEW
className="btn-v2 btn-v2-primary btn-v2-md"
```

#### Secondary Buttons (Cancel, Back)
```jsx
// OLD
className="bg-gray-700 hover:bg-gray-600 text-white rounded-lg px-4 py-2"

// NEW
className="btn-v2 btn-v2-secondary btn-v2-md"
```

#### Outline Buttons (Tertiary actions)
```jsx
// OLD
className="border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-gray-900 rounded-lg px-4 py-2"

// NEW
className="btn-v2 btn-v2-outline btn-v2-md"
```

#### Ghost/Minimal Buttons (Navigation)
```jsx
// OLD
className="text-gray-400 hover:text-white px-3 py-2"

// NEW
className="btn-v2 btn-v2-ghost btn-v2-sm"
```

#### Icon Buttons
```jsx
// OLD
<button className="p-2 rounded-full hover:bg-gray-800">
  <Icon size={20} />
</button>

// NEW
<button className="btn-v2 btn-v2-ghost btn-v2-sm p-2">
  <Icon size={20} />
</button>
```

---

## 📋 PATTERN 2: CARDS

### Social Mode Cards
```jsx
// OLD
className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700"

// NEW
className="card-v2 card-v2-interactive p-6"
data-mode="social"
```

### Business Mode Cards
```jsx
// OLD
className="bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700"

// NEW
className="card-v2 card-v2-marketplace card-v2-interactive p-6"
```

### Profile/User Cards
```jsx
// OLD
<div className="bg-gray-800 rounded-xl p-4 border border-gray-700">

// NEW
<div className="card-v2 card-v2-interactive clean-spacing-md" data-mode="social">
```

### Grid of Cards
```jsx
// OLD
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// NEW
<div className="grid-v2 grid-v2-3 card-cascade">
  {/* Add card-cascade to container for staggered animation */}
```

---

## 📋 PATTERN 3: FORM INPUTS

### Text Inputs
```jsx
// OLD
className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-yellow-500"

// NEW
className="input-v2 w-full"
```

### Text Input with Icon
```jsx
// OLD
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2" />
  <input className="pl-10 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg" />
</div>

// NEW
<div className="relative">
  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-v2" />
  <input className="input-v2 w-full pl-10" />
</div>
```

### Textarea
```jsx
// OLD
className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white min-h-[100px]"

// NEW
className="input-v2 textarea-v2 w-full"
```

### Select/Dropdown
```jsx
// OLD
className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white"

// NEW
className="select-v2 w-full"
```

---

## 📋 PATTERN 4: CONTAINERS & SPACING

### Page Container
```jsx
// OLD
<div className="max-w-7xl mx-auto px-4 py-8">

// NEW
<div className="container-v2 section-v2 page-enter">
```

### Section Wrapper
```jsx
// OLD
<section className="py-12">

// NEW
<section className="section-v2">
```

### Content Section with Spacing
```jsx
// OLD
<div className="mb-8">
  <h2 className="text-2xl font-bold mb-4">Title</h2>
  <p className="mb-6">Content</p>
</div>

// NEW
<div className="breathing-room-lg">
  <h2 className="text-2xl font-bold breathing-room-sm">Title</h2>
  <p className="breathing-room-md">Content</p>
</div>
```

---

## 📋 PATTERN 5: ICON ALIGNMENT

### Button with Icon
```jsx
// OLD
<button className="flex items-center gap-2">
  <Icon size={16} />
  <span>Text</span>
</button>

// NEW
<button className="btn-v2 btn-v2-primary btn-v2-md icon-text-aligned">
  <Icon size={16} />
  <span>Text</span>
</button>
```

### Standalone Icon + Text
```jsx
// OLD
<div className="flex items-center gap-2">
  <Icon />
  <span>Label</span>
</div>

// NEW
<div className="icon-text-aligned">
  <Icon />
  <span>Label</span>
</div>
```

---

## 📋 PATTERN 6: MODE ATTRIBUTES

### Social Mode (Blue Theme)
```jsx
// Add to top-level page wrapper
<div data-mode="social" className="page-enter">
  {/* Page content */}
</div>
```

### Business Mode (Gold Theme)
```jsx
// Add to top-level page wrapper
<div data-mode="business" className="page-enter">
  {/* Page content */}
</div>
```

### Marketplace Mode (Enhanced Gold)
```jsx
// Add to marketplace pages
<div data-mode="marketplace" className="page-enter">
  {/* Page content */}
</div>
```

---

## 📋 PATTERN 7: HERO SECTIONS

### Standard Hero
```jsx
// OLD
<div className="py-20 text-center">
  <h1 className="text-5xl font-bold mb-6">Title</h1>
  <p className="text-xl text-gray-400 mb-8">Subtitle</p>
  <button>CTA</button>
</div>

// NEW
<section className="hero-v2 hero-v2-business">
  <div className="hero-v2-content">
    <h1 className="hero-v2-title">Title</h1>
    <p className="hero-v2-subtitle">Subtitle</p>
    <div className="hero-v2-cta-group">
      <button className="btn-v2 btn-v2-primary btn-v2-lg">CTA</button>
    </div>
  </div>
</section>
```

### Social Hero
```jsx
<section className="hero-v2 hero-v2-social" data-mode="social">
  <div className="hero-v2-content">
    <h1 className="hero-v2-title">Connect with Community</h1>
    <p className="hero-v2-subtitle">Build meaningful relationships</p>
    <div className="hero-v2-cta-group">
      <button className="btn-v2 btn-v2-primary btn-v2-lg">Get Started</button>
    </div>
  </div>
</section>
```

---

## 📋 PATTERN 8: LISTS & GRIDS

### List of Items
```jsx
// OLD
<div className="space-y-4">
  {items.map(item => (
    <div className="bg-gray-800 p-4 rounded-lg">

// NEW
<div className="space-y-4">
  {items.map((item, index) => (
    <div className="card-v2 card-v2-interactive clean-spacing-md card-cascade" key={item.id}>
```

### Grid Layout
```jsx
// OLD
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// NEW
<div className="grid-v2 grid-v2-3">
```

---

## 📋 PATTERN 9: EMPTY STATES

### Empty State
```jsx
// OLD
<div className="text-center py-20">
  <Icon size={64} className="mx-auto mb-4 text-gray-500" />
  <h3 className="text-xl font-bold mb-2">No items</h3>
  <p className="text-gray-400">Description</p>
</div>

// NEW
<div className="empty-state-v2">
  <div className="empty-state-icon">
    <Icon size={80} />
  </div>
  <h3 className="empty-state-title">No items</h3>
  <p className="empty-state-description">Description</p>
  <button className="btn-v2 btn-v2-primary btn-v2-md">Action</button>
</div>
```

---

## 📋 PATTERN 10: NAVIGATION

### Top Navbar
```jsx
// OLD
<nav className="bg-gray-900 border-b border-gray-800 sticky top-0">

// NEW
<nav className="nav-v2">
```

### Nav Items
```jsx
// OLD
<a className="px-4 py-2 text-gray-300 hover:text-white rounded-lg hover:bg-gray-800">

// NEW
<a className="nav-v2-item">
```

### Active Nav Item
```jsx
// Add to active link
className="nav-v2-item active"
```

---

## 📋 PATTERN 11: BADGES & TAGS

### Status Badge
```jsx
// OLD
<span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Active</span>

// NEW
<span className="toggle-v2 active">Active</span>
```

### Tag/Chip
```jsx
// OLD
<span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">Tag</span>

// NEW
<span className="toggle-v2">Tag</span>
```

---

## 📋 PATTERN 12: DETAIL PANELS

### Info Panel
```jsx
// OLD
<div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
  <h3 className="text-lg font-bold mb-4">Details</h3>
  <div className="space-y-3">
    {/* content */}
  </div>
</div>

// NEW
<div className="card-v2 card-v2-lg">
  <h3 className="text-lg font-bold breathing-room-sm">Details</h3>
  <div className="space-y-3">
    {/* content */}
  </div>
</div>
```

---

## 📋 PATTERN 13: HOVER STATES

### Add Hover Effects
```jsx
// Add to interactive elements
className="hover-lift"  // Subtle elevation
className="hover-glow"  // Gold glow effect
className="hover-scale" // Gentle scale
```

---

## 🎯 RECOMMENDED CLASS STACKS

### Profile Card
```jsx
<div className="card-v2 card-v2-interactive clean-spacing-lg hover-lift" data-mode="social">
```

### Business Listing Card
```jsx
<div className="card-v2 card-v2-marketplace card-v2-interactive clean-spacing-md hover-scale">
```

### Form Container
```jsx
<div className="card-v2 card-v2-lg breathing-room-lg">
```

### Page Wrapper
```jsx
<div className="container-v2 section-v2 page-enter" data-mode="social">
```

### Hero Section
```jsx
<section className="hero-v2 hero-v2-social" data-mode="social">
```

---

## 🔄 SYSTEMATIC REPLACEMENT ORDER

1. **Buttons** - Most visible, highest impact
2. **Cards** - Second most visible
3. **Inputs** - User interaction critical
4. **Containers** - Layout consistency
5. **Icons** - Visual alignment
6. **Badges** - Small but noticeable
7. **Empty States** - Professional polish
8. **Navigation** - Platform-wide consistency

---

## ✅ QUALITY CHECKLIST

After updating a file, verify:
- [ ] All buttons use `btn-v2-*` classes
- [ ] All cards use `card-v2` with appropriate variant
- [ ] All inputs use `input-v2`
- [ ] Container uses `container-v2`
- [ ] Icons aligned with `icon-text-aligned`
- [ ] Mode attribute set (`data-mode="social"` or `data-mode="business"`)
- [ ] Spacing uses v2 utilities (`breathing-room-*`, `clean-spacing-*`)
- [ ] Animations applied (`page-enter`, `card-cascade`)
- [ ] No inline styles for colors/spacing
- [ ] No legacy class names (bg-gray-800, border-gray-700, etc.)

---

## 🚨 IMPORTANT NOTES

1. **Remove all inline styles** for colors and spacing
2. **Remove theme context usage** - use CSS variables instead
3. **Remove conditional styling** - use data-mode instead
4. **Keep functionality intact** - only change UI/styling
5. **Test interactivity** - ensure buttons/links still work
6. **Verify responsiveness** - mobile/tablet layouts preserved

---

## 📊 BEFORE/AFTER EXAMPLE

### Before (Legacy)
```jsx
const ProfileCard = ({ user }) => {
  const { theme } = useTheme();
  return (
    <div 
      className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700"
      style={{ background: theme === 'dark' ? '#111' : '#fff' }}
    >
      <h3 className="text-xl font-bold mb-2">{user.name}</h3>
      <p className="text-gray-400 mb-4">{user.bio}</p>
      <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
        Connect
      </button>
    </div>
  );
};
```

### After (v2)
```jsx
const ProfileCard = ({ user }) => {
  return (
    <div className="card-v2 card-v2-interactive clean-spacing-md hover-lift" data-mode="social">
      <h3 className="text-xl font-bold breathing-room-sm">{user.name}</h3>
      <p className="text-secondary-v2 breathing-room-md">{user.bio}</p>
      <button className="btn-v2 btn-v2-primary btn-v2-md">
        Connect
      </button>
    </div>
  );
};
```

---

**End of Bulk Update Pattern Document**
