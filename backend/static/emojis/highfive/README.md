# 🖐🏾 BANIBS High Five Emoji System

Complete implementation of the BANIBS High Five sprite-based animation system with tier-based variants.

## Directory Structure

```
/static/emojis/highfive/
├── clean/                          # Free tier variant
│   ├── manifest.json
│   ├── banibs_highfive_clean_strip_128.png
│   ├── banibs_highfive_clean_strip_256.png
│   └── banibs_highfive_clean_strip_512.png
├── spark_small/                    # BANIBS+ tier variant
│   ├── manifest.json
│   ├── banibs_highfive_spark_small_strip_128.png
│   ├── banibs_highfive_spark_small_strip_256.png
│   └── banibs_highfive_spark_small_strip_512.png
├── spark_big/                      # Elite tier variant
│   ├── manifest.json
│   ├── banibs_highfive_spark_big_strip_128.png
│   ├── banibs_highfive_spark_big_strip_256.png
│   └── banibs_highfive_spark_big_strip_512.png
└── README.md
```

## Sprite Format

All sprites are **1×8 horizontal strips**:
- **8 frames** per animation (frame 0 → frame 7)
- **Frame order**: Left to right
- **Sizes**: 128px, 256px, 512px per frame
- **Strip dimensions**:
  - 128: 1024×128px
  - 256: 2048×256px
  - 512: 4096×512px

## Variants

### Clean (Free)
- **Tier**: Free/Basic users
- **Visual**: Dark-brown hands, no spark
- **Use**: Default reaction, free emoji picker

### Small Spark (BANIBS+)
- **Tier**: BANIBS+ / Gold pack users
- **Visual**: Dark-brown hands + subtle gold flash at impact
- **Use**: Enhanced reactions, premium stickers

### Big Gold Spark (Elite)
- **Tier**: Elite / Business Pro
- **Visual**: Dark-brown hands + full BANIBS gold blast
- **Use**: Premium reactions, profile flair, special events

## Animation Behavior

### Play Once (Reactions)
- Plays through all 8 frames once
- Used for feed reactions and comments
- FPS: 10-12 (configurable)

### Loop (Stickers/Flair)
- Continuous playback
- Used for stickers, profile badges, decorative elements
- FPS: 10 (configurable)

## Frontend Components

### `<HighFiveAnim />`
Core sprite animation component
```jsx
<HighFiveAnim 
  variant="spark_big"     // 'clean' | 'spark_small' | 'spark_big'
  size={128}              // 64 | 128 | 256 | 512
  mode="once"             // 'once' | 'loop'
  fps={10}                // frames per second
  onComplete={() => {}}   // callback when done (once mode)
/>
```

### `<HighFiveButton />`
Reaction button with tier-based animation
```jsx
<HighFiveButton
  postId="post-123"
  hasHighFived={false}
  highFiveCount={42}
  userTier="banibs_plus"  // determines variant
  onHighFive={handleHighFive}
  size={32}
  showCount={true}
/>
```

### `useHighFiveVariant()`
Hook to get user's variant based on tier
```jsx
const variant = useHighFiveVariant(userTier);
// 'free' → 'clean'
// 'banibs_plus' → 'spark_small'
// 'elite' → 'spark_big'
```

## Tier Mapping

```
User Tier          → Variant
─────────────────────────────
free               → clean
basic              → clean
banibs_plus        → spark_small
gold               → spark_small
elite              → spark_big
business_pro       → spark_big
premium            → spark_big
```

## Integration Points

### Social Feed Reactions
- Add High Five button to post/comment actions
- Play tier-appropriate animation on click
- Track high five count per post

### Emoji Picker
- Display in emoji palette
- Show tier badge for locked variants
- Trigger upsell modal for premium variants

### Profile Flair (Future)
- Allow Elite users to add looping High Five to profile
- Display near avatar or in bio section

### Business Board (Future)
- Special celebration animations for deals/partnerships
- Enhanced variants for verified businesses

## Asset Replacement

**Current**: Placeholder sprites (colored circles with frame numbers)

**To Replace With Real Assets**:
1. Export 8-frame animation as separate PNGs (frame_0.png → frame_7.png)
2. Create sprite strips:
   ```bash
   # Example with ImageMagick
   convert frame_*.png +append banibs_highfive_clean_strip_512.png
   ```
3. Resize to 256px and 128px versions
4. Replace files in respective variant directories
5. No code changes needed!

## Testing

Visit demo page: `/test/highfive`

Demo includes:
- All variant showcases (looping)
- Animation mode comparison (once vs loop)
- Size options (64, 128, 256px)
- Reaction button with tier selector
- Upsell modal preview

## API Endpoints (Future)

### Track High Five Reactions
```
POST /api/reactions/highfive
{
  "target_type": "post" | "comment",
  "target_id": "uuid",
  "active": true | false
}
```

### Get User's Emoji Packs
```
GET /api/users/me/emoji-packs
Response: {
  "packs": ["free", "gold"],
  "tier": "banibs_plus",
  "available_variants": ["clean", "spark_small"]
}
```

## Emoji Economy Notes

- High Five is the **flagship animated emoji**
- Part of larger BANIBS Emoji Economy system
- Premium variants drive membership upgrades
- Analytics: Track usage by tier, conversion rates
- Future: Custom High Fives, seasonal variants, partner collabs

## Credits

Design: BANIBS Design Team
Implementation: Phase 8.x - Emoji System
Sprite Format: 1×8 horizontal strip (industry standard)
