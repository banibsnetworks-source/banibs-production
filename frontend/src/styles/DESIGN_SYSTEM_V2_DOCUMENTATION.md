# BANIBS UI v2.0 Design System - Complete Documentation

## Overview

The BANIBS UI v2.0 Design System is a comprehensive, production-ready design language that provides:
- **Consistent visual identity** across all platform modules
- **Premium micro-interactions** and smooth animations
- **Mode-specific theming** for Business, Social, Marketplace, Ability, and Governance
- **Accessibility-first** approach with proper focus states and reduced motion support
- **Performance-optimized** with GPU acceleration and efficient CSS

---

## Design Tokens

### Colors

#### Business Mode (Default)
- **Primary**: `#D4AF37` (Gold)
- **Secondary**: `#4A3B2A` (Bronze/Deep Brown)
- **Background**: `#0D0D0D` (Deep Black)
- **Surface**: `rgba(255, 255, 255, 0.04)`

#### Social Mode
- **Primary**: `#0057FF` (Blue)
- **Secondary**: `#79A8FF` (Light Blue)
- **Background**: `#0F1117` (Dark Blue-Gray)

#### Marketplace Mode
- **Primary**: `#E6BE47` (Enhanced Gold, 1.15x saturation)
- **Enhanced**: Warm, inviting feel with increased contrast

#### Ability Network
- **Primary**: `#6A0DAD` (Royal Purple)
- **Secondary**: `#B48CE3` (Light Purple)

#### Governance/Defense
- **Primary**: `#1A1A1A` (Near Black)
- **Accent**: `#00AEEF` (Cyan)

### Spacing Scale
- `4px` - Micro spacing
- `8px` - Tight spacing
- `16px` - Base spacing
- `24px` - Comfortable spacing
- `32px` - Generous spacing
- `48px` - Section spacing

### Typography
- **Headings**: 600-700 weight
- **Body**: 400-500 weight
- **Line Height**: 1.25-1.4
- **Max Width**: 650px for paragraphs

### Shadows
- `--shadow-sm`: Subtle elevation
- `--shadow-base`: Default cards
- `--shadow-md`: Elevated components
- `--shadow-lg`: Prominent elements
- `--shadow-xl`: Modals and overlays

### Border Radius
- `--radius-sm`: 8px
- `--radius-md`: 14px
- `--radius-lg`: 18px
- `--radius-xl`: 20px
- `--radius-2xl`: 22px

---

## Component System

### Buttons

#### Variants
1. **Primary** (`.btn-v2-primary`)
   - Gold background, dark text
   - Hover: Lift + glow + ripple effect
   - Active: Scale down (0.98)
   - Use: Main CTAs, primary actions

2. **Secondary** (`.btn-v2-secondary`)
   - Bronze background
   - Hover: Lift + brightness boost
   - Use: Secondary actions

3. **Outline** (`.btn-v2-outline`)
   - Transparent with gold border
   - Hover: Fill with gold
   - Use: Tertiary actions

4. **Ghost** (`.btn-v2-ghost`)
   - Transparent, minimal
   - Hover: Subtle surface background
   - Use: Navigation, low emphasis

5. **Danger** (`.btn-v2-danger`)
   - Red background
   - Hover: Lift + glow
   - Use: Destructive actions

6. **Glass** (`.btn-v2-glass`)
   - Semi-transparent with backdrop blur
   - Hover: Increased opacity
   - Use: Overlay actions

#### Sizes
- **Small** (`.btn-v2-sm`): 32px height
- **Medium** (`.btn-v2-md`): 38px height (default)
- **Large** (`.btn-v2-lg`): 44px height

#### Usage Example
```jsx
<button className="btn-v2 btn-v2-primary btn-v2-lg">
  Click Me
</button>
```

---

### Cards

#### Base Card (`.card-v2`)
- 20px border radius
- Surface background with shadow
- Hover: Scale (1.02) + enhanced shadow
- Smooth GPU-accelerated transitions

#### Variants
1. **Marketplace** (`.card-v2-marketplace`)
   - Increased saturation (1.15x)
   - Warmer feel

2. **Ability** (`.card-v2-ability`)
   - Purple border accent
   - Use in Ability Network module

3. **Governance** (`.card-v2-governance`)
   - Dark background
   - Cyan accents
   - Use in admin/governance pages

4. **Interactive** (`.card-v2-interactive`)
   - Cursor pointer
   - Gradient overlay on hover
   - Active press feedback

5. **Large** (`.card-v2-lg`)
   - 28px padding
   - 22px border radius

#### Usage Example
```jsx
<div className="card-v2 card-v2-marketplace card-v2-interactive">
  <h3>Card Title</h3>
  <p>Card content...</p>
</div>
```

---

### Form Elements

#### Inputs (`.input-v2`)
- 44px height
- 14px border radius
- 2px gold border
- Focus: Gold glow (6px)
- Placeholder: 60% opacity

#### Textarea (`.textarea-v2`)
- Extends input-v2
- Min-height: 100px
- Vertical resize only

#### Select (`.select-v2`)
- Custom dropdown arrow
- Matches input styling
- Consistent with form elements

#### Checkbox (`.checkbox-v2`)
- 20px size
- 2px gold border
- Gold fill when checked

#### Toggle/Chip (`.toggle-v2`)
- Pill-shaped (rounded-full)
- Gold active state with glow
- Smooth transitions

---

### Navigation

#### Top Navigation (`.nav-v2`)
- Sticky positioning
- Semi-transparent background (60% opacity)
- 10px backdrop blur
- Smooth shadow transitions

#### Navigation Items (`.nav-v2-item`)
- Hover: Gold glow
- Active: Gold underline (animated)
- Focus: Clear accessibility ring

#### Side Navigation (`.sidenav-v2`)
- 280px width
- Surface background
- Expandable sections
- Active indicator: Gold left border

---

## Premium Polish Features

### Micro-Animations

#### Fade In Up
```css
.animate-fade-in-up
```
- Duration: 0.3s
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- Use: Card mounting, content reveal

#### Gentle Glow
```css
.animate-gentle-glow
```
- Duration: 2s infinite
- Use: CTAs, important elements

#### Hover Effects
```css
.hover-lift    /* Lift on hover */
.hover-glow    /* Glow on hover */
.hover-scale   /* Scale on hover */
```

### Interactive Feedback

#### Press Effect
```css
.active-press
```
- Active state: Scale (0.98)
- Duration: 0.1s
- Use: Buttons, interactive cards

#### Button Ripple
- Built into `.btn-v2-primary`
- Circular ripple effect on hover
- Smooth expansion animation

---

## Mode-Specific Enhancements

### Business Mode
- Enhanced gold glow on hover (20px, 50% opacity)
- Card borders: Gold accent on hover
- Premium feel with warm tones

### Social Mode
- Blue glow on hover (20px, 50% opacity)
- Card borders: Blue accent
- Clean, modern feel

### Marketplace Mode
- 1.15x saturation boost
- 1.02x contrast enhancement
- Enhanced gold glow (24px, 60% opacity)
- Warm, inviting atmosphere

### Ability Mode
- Purple glow on hover
- 2px purple borders on cards
- Royal, empowering feel

### Governance Mode
- Cyan accents
- Steel gray backgrounds
- Professional, authoritative feel

---

## Layout Utilities

### Breathing Room
```css
.breathing-room-sm  /* 16px bottom margin */
.breathing-room-md  /* 24px bottom margin */
.breathing-room-lg  /* 32px bottom margin */
```

### Clean Spacing
```css
.clean-spacing-sm   /* 16px padding */
.clean-spacing-md   /* 24px padding */
.clean-spacing-lg   /* 32px padding */
```

### Icon-Text Alignment
```css
.icon-text-aligned
```
- Perfect vertical alignment
- 8px gap
- Optical adjustment (-1px)

### Focus Ring
```css
.focus-ring-v2
```
- 2px gold outline
- 2px offset
- Visible on keyboard focus only

---

## Performance Optimizations

### GPU Acceleration
All animations use:
- `transform: translateZ(0)`
- `backface-visibility: hidden`
- `will-change` for smooth transitions

### Reduced Motion Support
```css
@media (prefers-reduced-motion: reduce)
```
- Animations reduced to 0.01ms
- Respects user accessibility preferences

---

## Accessibility

### Focus States
- All interactive elements have clear focus indicators
- 2px gold outline with 2px offset
- Visible on keyboard navigation

### Color Contrast
- All text meets WCAG AA standards
- Primary gold: 4.5:1 contrast minimum
- Surface colors: Sufficient contrast for readability

### Semantic HTML
- Proper heading hierarchy
- ARIA labels where needed
- Keyboard navigation support

---

## Usage Guidelines

### When to Use Each Variant

**Buttons**:
- Primary: Main CTAs (Join BANIBS, Sign In, Submit)
- Secondary: Supporting actions (Cancel, Back)
- Outline: Tertiary options (View Details)
- Ghost: Navigation items, minimal actions
- Danger: Delete, Remove, Destructive actions
- Glass: Overlay actions, floating elements

**Cards**:
- Base: General content containers
- Marketplace: Product listings, business cards
- Ability: Resources, providers, support content
- Governance: Admin panels, system settings
- Interactive: Clickable cards, navigation cards

**Layouts**:
- Use `container-v2` for max-width constraint (1250px)
- Use `section-v2` for standard vertical spacing (40-60px)
- Use breathing room utilities for consistent rhythm

---

## Common Patterns

### Feature Card
```jsx
<div className="card-v2 card-v2-interactive animate-fade-in-up">
  <h3 className="breathing-room-sm">Feature Title</h3>
  <p className="breathing-room-md">Description...</p>
  <button className="btn-v2 btn-v2-primary btn-v2-md">
    Learn More
  </button>
</div>
```

### Auth Form
```jsx
<form className="card-v2 card-v2-lg">
  <input 
    type="email" 
    className="input-v2 breathing-room-md" 
    placeholder="Email"
  />
  <input 
    type="password" 
    className="input-v2 breathing-room-md" 
    placeholder="Password"
  />
  <button className="btn-v2 btn-v2-primary btn-v2-lg w-full">
    Sign In
  </button>
</form>
```

### Navigation Bar
```jsx
<nav className="nav-v2">
  <div className="container-v2">
    <a href="/" className="nav-v2-item active">Home</a>
    <a href="/business" className="nav-v2-item">Business</a>
    <a href="/social" className="nav-v2-item">Social</a>
  </div>
</nav>
```

---

## Browser Support

- Chrome/Edge: 90+
- Firefox: 88+
- Safari: 14+
- All modern mobile browsers

---

## Performance Metrics

- CSS Bundle: ~35KB gzipped
- No JavaScript overhead
- 60fps animations
- GPU-accelerated transforms
- Efficient paint operations

---

## Future Enhancements

Planned for v2.1:
- Dark/light mode toggle
- Additional color themes
- Extended animation library
- Advanced layout components
- Enhanced accessibility features

---

## Credits

**Design System**: BANIBS Platform Team  
**Version**: 2.0.0  
**Last Updated**: November 2025  
**Status**: Production Ready

---

## Support

For questions or issues:
- Internal documentation
- Design system Figma files
- Component storybook (coming soon)
