# BANIBS Business Mode - Image Asset Guide

## 📂 Directory Structure

```
/images/business/
├── hero/              # Hero carousel images (Homepage)
├── placeholders/      # Contextual "Coming Soon" page images
├── banners/           # Business profile banner images
└── categories/        # Category-based fallback thumbnails
```

---

## 🎨 Image Specifications

### Hero Carousel (`/hero/`)
**Purpose**: Rotating background images on Business Home page  
**Dimensions**: 1920x1080px (16:9 ratio)  
**Format**: JPG (optimized for web)  
**Style**: Real photography featuring Black-owned businesses and professionals

**Files Needed**:
- `hero-1.jpg` - Black-owned café or restaurant scene
- `hero-2.jpg` - Modern barbershop or salon
- `hero-3.jpg` - Logistics, warehouse, or industrial setting
- `hero-4.jpg` - Beauty salon, retail store, or professional services

**Image Treatment**:
- Warm, rich color tones (gold/amber accents)
- High contrast for text overlay readability
- Professional, editorial-style photography
- Features Black entrepreneurs, staff, or customers

---

### Placeholder Images (`/placeholders/`)
**Purpose**: Contextual imagery for "Coming Soon" feature pages  
**Dimensions**: 800x450px (16:9 ratio)  
**Format**: JPG

**Files Needed**:
- `analytics.jpg` - Business owner reviewing data/charts on laptop or screen
- `team.jpg` - Group of diverse Black professionals in meeting or collaboration
- `services.jpg` - Service provider (barber, stylist, consultant) with client
- `events.jpg` - Business conference, networking event, or workshop
- `lessons.jpg` - Mentoring, classroom, or educational setting
- `network.jpg` - Professional handshake or business networking scene
- `default.jpg` - Generic business setting (fallback)

**Image Treatment**:
- Modern, authentic settings (not stock photo clichés)
- Natural lighting preferred
- Shows people engaged in meaningful business activities

---

### Business Profile Banners (`/banners/`)
**Purpose**: Default banner for business profiles without custom uploads  
**Dimensions**: 1200x675px (16:9 ratio)  
**Format**: JPG

**Files Needed**:
- `default-banner.jpg` - Professional, neutral business banner
  - Suggested: Abstract geometric pattern in gold/black
  - Or: Cityscape, office space, handshake silhouette
  - Should work for ANY business type

**Image Treatment**:
- Elegant but not busy (allows overlay text)
- BANIBS color palette (gold #E8B657, black, cream)
- Slightly muted/desaturated for versatility

---

### Category Thumbnails (`/categories/`)
**Purpose**: Fallback images for business cards when no logo is uploaded  
**Dimensions**: 400x400px (1:1 square)  
**Format**: JPG

**Files Needed**:
- `restaurant.jpg` - Food/dining scene
- `barber.jpg` - Barbershop/grooming
- `salon.jpg` - Beauty salon/hair styling
- `retail.jpg` - Store/shop setting
- `services.jpg` - Professional services (law, accounting, consulting)
- `construction.jpg` - Trades/construction
- `logistics.jpg` - Trucking/delivery/warehouse
- `tech.jpg` - IT/software/digital services
- `healthcare.jpg` - Medical/wellness services
- `education.jpg` - Teaching/training services
- `default.jpg` - Generic business icon/pattern

**Image Treatment**:
- Close-up or mid-shot (recognizable at thumbnail size)
- Branded with subtle BANIBS color tint if possible
- Sharp focus, minimal text

---

## 🎯 Brand Guidelines

### Color Palette
- **Primary Gold**: #E8B657 (warmth, luxury, success)
- **Black**: #0a0a0a to #1a1a1a (sophistication)
- **Cream/Light**: #F9F9F9 to #E5E7EB (light mode backgrounds)

### Photography Style
✅ **DO**:
- Real photography (not vector illustrations)
- Feature Black people, Black-owned spaces
- Modern, aspirational yet authentic
- Warm, rich color tones
- Editorial/documentary style

❌ **DON'T**:
- Generic corporate stock photos (blue backgrounds, forced diversity)
- Overly staged or artificial poses
- Cartoony or illustrative styles
- Cold, sterile color grading
- Low-resolution or pixelated images

---

## 📥 How to Add Images

1. **Obtain Images**:
   - AI-generated (Midjourney, DALL-E, Stable Diffusion)
   - Stock photography (Unsplash, Pexels, paid stock)
   - Real photography from BANIBS community (with permission)

2. **Optimize for Web**:
   - Compress to ~200-300KB per image (use TinyPNG, ImageOptim, or similar)
   - Maintain 80-90% quality for JPGs
   - Resize to specified dimensions

3. **Drop into Directory**:
   - Place files in appropriate subdirectory
   - Use exact filenames as specified above
   - Ensure lowercase file extensions (`.jpg` not `.JPG`)

4. **Test in App**:
   - Refresh Business Mode pages
   - Images should load automatically
   - Check mobile responsiveness

---

## 🚀 Current Status

**Images Wired (Ready for Drop-In)**:
- ✅ Hero carousel (4 images)
- ✅ Placeholder pages (7 images)
- ✅ Default banner (1 image)
- ✅ Category thumbnails (11 images)

**Total Images Needed**: 23

---

## 💡 AI Image Generation Prompts (Optional)

If generating images with AI tools, use these as starting points:

### Hero Carousel
```
"Black-owned upscale café interior, customers and barista, warm natural lighting, 
modern industrial design, professional photography, editorial style, 16:9, realistic"

"Modern Black barbershop, barber cutting client's hair, sleek interior, 
gold accents, natural light from windows, candid moment, 16:9, photorealistic"

"Black woman entrepreneur in small business warehouse, inventory management, 
professional logistics setting, warm tones, inspiring, 16:9, documentary style"

"Elegant Black-owned beauty salon, stylist working on client's hair, 
upscale interior, gold lighting fixtures, 16:9, high-end photography"
```

### Placeholders
```
"Black business owner analyzing data on laptop, charts visible on screen, 
modern office, focused expression, natural window light, 16:9, professional"

"Diverse team of Black professionals in collaborative meeting, 
whiteboard with ideas, modern conference room, engaged discussion, 16:9"

"Black mentor teaching younger entrepreneur in bright classroom setting, 
books and laptops visible, inspiring educational moment, 16:9, warm tones"
```

Adjust prompts as needed for your preferred AI tool's syntax.

---

**Last Updated**: Phase 8.4 - Business Mode Imagery Infrastructure  
**Maintained By**: BANIBS Development Team
