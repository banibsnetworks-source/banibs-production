# BANIBS Standard Emoji Pack

## Current State (Phase 1)
**Status**: Using Unicode emojis with Black/Brown skin tones (👍🏿, 🙌🏿, etc.)

This pack currently uses native Unicode emoji characters with dark skin tone modifiers to provide culturally representative emojis.

## Phase 2 - Custom Image Implementation

When custom BANIBS emoji images are ready, they should be placed in this directory with the following structure:

### Directory Structure
```
/app/frontend/public/static/emojis/packs/banibs_standard/
├── manifest.json          (emoji metadata and categories)
├── smileys/              (facial expression emojis)
├── gestures/             (hand gesture emojis)
├── people/               (people and community emojis)
├── hearts/               (heart and love emojis)
├── celebration/          (celebration emojis)
└── highfive/             (animated high-five sprites)
```

### Image File Format
**Recommended**: PNG with transparency, 128x128px minimum

**Naming Convention**:
- Use descriptive names: `smile.png`, `thumbs_up.png`, `heart_red.png`
- Use underscores for multi-word names
- All lowercase

**Example Files**:
```
smileys/
  smile.png
  laugh.png
  heart_eyes.png
  sunglasses.png
  party.png

gestures/
  thumbs_up.png
  clap.png
  wave.png
  fist_bump.png
  prayer_hands.png
  high_five.png
  peace.png
  ok_hand.png

hearts/
  red_heart.png
  orange_heart.png
  yellow_heart.png
  brown_heart.png
  black_heart.png

celebration/
  party_popper.png
  confetti.png
  balloon.png
  gift.png
  sparkles.png
```

### manifest.json Update for Images

When images are ready, update the manifest like this:

```json
{
  "id": "banibs_standard",
  "title": "BANIBS Black & Brown Emojis",
  "type": "image",  // Change from "static" to "image"
  "categories": [
    {
      "id": "smileys",
      "name": "Smileys",
      "icon": "smile.png",
      "emojis": [
        {
          "id": "smile",
          "file": "smileys/smile.png",
          "alt": "Smile",
          "keywords": ["smile", "happy", "face"]
        },
        {
          "id": "laugh",
          "file": "smileys/laugh.png",
          "alt": "Laugh",
          "keywords": ["laugh", "funny", "lol"]
        }
      ]
    }
  ]
}
```

### Design Guidelines for Custom Emojis

**BANIBS Brand Identity**:
- Dark/Brown skin tones as primary representation
- Gold accent colors (#EAB308 or similar for highlights)
- Clear, expressive facial features
- Modern, friendly style
- Consistent stroke width and sizing

**Technical Specs**:
- Size: 128x128px (will scale in UI)
- Format: PNG-24 with alpha transparency
- Color depth: 24-bit RGB + 8-bit alpha
- Background: Transparent
- Style: Flat design with subtle gradients/shading

### Implementation Checklist

When images are ready:

1. [ ] Place image files in appropriate category folders
2. [ ] Update manifest.json with image paths
3. [ ] Change manifest type from "static" to "image"
4. [ ] Update EmojiPicker.js to load and render images
5. [ ] Test image loading and display
6. [ ] Verify fallback to Unicode if image fails
7. [ ] Ensure proper sizing (should be large and clear)

### Code Changes Needed for Phase 2

The following files will need updates:
- `/app/frontend/src/components/emoji/EmojiPicker.js` - Add image loading logic
- `/app/frontend/src/utils/emojiSystem.js` - Add image path resolution

Current system is designed to easily swap between Unicode and custom images by checking the manifest `type` field.

## Current Unicode Emojis

**Gesture Coverage**:
👋🏿 Wave, 👍🏿 Thumbs Up, 👎🏿 Thumbs Down, ✊🏿 Fist, 👊🏿 Fist Bump, 
👏🏿 Clap, 🙌🏿 Raised Hands, 🙏🏿 Prayer, ✋🏿 Hand, 👌🏿 OK

**People Coverage**:
👨🏿 Man, 👩🏿 Woman, 🧑🏿 Person, 👶🏿 Baby, 👦🏿 Boy, 👧🏿 Girl

**Celebrations**:
🎉 Party Popper, 🎊 Confetti, 🎈 Balloon, ✨ Sparkles, 🥳 Party Face

All gesture and people emojis use the darkest skin tone modifier (🏿) for proper BANIBS representation.
