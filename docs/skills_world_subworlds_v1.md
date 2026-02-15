# Skills World Sub-Worlds v1.0 - Reading & Words

**Status**: ACTIVE  
**Version**: v1.0  
**Date**: 2026-02-15

---

## Overview

The "Reading & Words" sub-world is the second major educational module in Skills World, following Math & Logic. It provides three language-focused activities designed for young learners, following the same calm-tech design philosophy as the rest of Skills World.

---

## Design Philosophy

### Core Principles (LOCKED)
- **Guest-first**: No account required to use any activity
- **No ads, no monetization**: Completely free
- **No urgency**: No timers, no streaks, no pressure language
- **No rankings**: No leaderboards, no comparisons
- **No gamification**: No points, no scores, no badges
- **Calm-tech posture**: Soft colors, minimal motion, clear exits
- **One activity visible at a time**: No cognitive overload

### User Experience
- Age guidance is visible but not enforced ("Age is a guide, not a gate")
- Progress through understanding, not time spent
- Pausing or stopping is never punished
- Gentle feedback only ("Try another" instead of "Wrong")
- Optional localStorage persistence for progress continuity

---

## Activities

### 1. Word Explorer (`/skillsworld/reading/word-explorer`)
**Target Age**: 4-8+

Build vocabulary through visual association. Users see a target word with an optional hint and must select the correct word from multiple options.

**Mechanics**:
- 5 levels with 8 words each
- Levels progress from concrete (Everyday Objects) to abstract (Feelings & Ideas)
- Optional hint system (show/hide toggle)
- No wrong answers - incorrect selections show the correct answer
- Progress saved to localStorage

**Levels**:
1. Everyday Objects - Things you see around you
2. Colors & Shapes - Describe what you see
3. Actions & Movement - Words that show doing
4. Nature Words - The world outside
5. Feelings & Ideas - Words for what you feel

### 2. Story Paths (`/skillsworld/reading/story-paths`)
**Target Age**: 5-9+

Reading comprehension through short passages. Users read a passage and answer a simple question about its content.

**Mechanics**:
- 5 levels with 5 passages each
- Passage length increases progressively
- Multiple choice questions (4 options)
- Georgia serif font for comfortable reading
- Progress saved to localStorage

**Levels**:
1. Simple Stories - Short and clear (2 sentences)
2. A Little Longer - Two to three sentences
3. More Details - Stories with more information
4. Think About It - Stories that make you wonder
5. Longer Reads - Full short stories (4-5 sentences)

### 3. Letter Sounds (`/skillsworld/reading/letter-sounds`)
**Target Age**: 4-6+

Phonics fundamentals. Users see a letter with its sound description and must identify which word starts with that letter.

**Mechanics**:
- 3 levels with 8 items each
- Large letter display with sound hints
- No audio in v1.0 (text-based sound descriptions only)
- Progress saved to localStorage

**Levels**:
1. First Sounds - Simple consonants (B, C, D, F, G, H, J, K)
2. More Consonants - Continue learning (L, M, N, P, R, S, T, V)
3. Vowel Sounds - The special letters (A, E, I, O, U)

---

## Technical Architecture

### Frontend Structure
```
/frontend/src/pages/skillsworld/reading/
├── ReadingWordsHome.jsx      # Hub page
├── WordExplorerGame.jsx      # Word matching activity
├── StoryPathsGame.jsx        # Reading comprehension activity
└── LetterSoundsGame.jsx      # Phonics activity
```

### Content Files (JSON-driven)
```
/frontend/src/data/skills_world/
├── word_explorer_levels.json
├── story_paths_levels.json
└── letter_sounds_levels.json
```

### Routes
- `/skillsworld/reading` - Hub page
- `/skillsworld/reading/word-explorer` - Word Explorer activity
- `/skillsworld/reading/story-paths` - Story Paths activity
- `/skillsworld/reading/letter-sounds` - Letter Sounds activity

### localStorage Keys
- `banibs_wordexplorer_progress` - Word Explorer completed levels
- `banibs_storypaths_progress` - Story Paths completed levels
- `banibs_lettersounds_progress` - Letter Sounds completed levels

---

## Content Structure

### Word Explorer JSON Schema
```json
{
  "activity_id": "word-explorer",
  "levels": [
    {
      "id": 1,
      "name": "Level Name",
      "description": "Short description",
      "words": [
        {
          "word": "target_word",
          "hint": "Clue for the word",
          "options": ["word1", "word2", "word3", "word4"]
        }
      ]
    }
  ]
}
```

### Story Paths JSON Schema
```json
{
  "activity_id": "story-paths",
  "levels": [
    {
      "id": 1,
      "name": "Level Name",
      "passages": [
        {
          "id": "1-1",
          "text": "Passage text...",
          "question": "Question about the passage?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correct": 0
        }
      ]
    }
  ]
}
```

### Letter Sounds JSON Schema
```json
{
  "activity_id": "letter-sounds",
  "levels": [
    {
      "id": 1,
      "name": "Level Name",
      "items": [
        {
          "letter": "B",
          "sound_hint": "Makes the 'buh' sound",
          "example_word": "ball",
          "options": ["ball", "cat", "dog", "fish"]
        }
      ]
    }
  ]
}
```

---

## Visual Design

### Colors
- **Word Explorer**: Emerald/Teal gradient (green family)
- **Story Paths**: Blue/Cyan gradient
- **Letter Sounds**: Amber/Orange gradient

### Typography
- Headers: System sans-serif (Inter, etc.)
- Story passages: Georgia serif for comfortable reading
- Large letter display: Georgia serif at 8xl size

### Interactions
- Subtle hover states with scale(1.02) and shadow
- 150ms transitions for smooth level changes
- Progress bars with color-coded completion states
- Floating feedback indicators

---

## V1.0 Limitations (Intentional)

1. **No audio**: Sound hints are text-only. Pronunciation audio is planned for v2.0.
2. **No images**: Word Explorer uses text options only. Visual association with images is planned for v2.0.
3. **No backend**: All progress is localStorage only. User account sync is planned for future versions.
4. **English only**: Content is English-only in v1.0. Localization is planned for future versions.

---

## Testing

### Manual Testing Checklist
- [ ] All three activities load without errors
- [ ] Level selection works correctly
- [ ] Progress is saved to localStorage
- [ ] Level completion triggers correct state
- [ ] Navigation (back buttons) works correctly
- [ ] Dark/light theme toggles work
- [ ] Mobile responsiveness verified
- [ ] No pressure language present

### Data Test IDs
- `back-to-skillsworld` - Back button on hub
- `back-to-reading` - Back button on activities
- `activity-card-{id}` - Activity cards on hub
- `activity-link-{id}` - Activity links on hub
- `level-selector-toggle` - Level dropdown toggle
- `level-{id}` - Level selection buttons
- `option-{idx}` - Answer option buttons
- `next-word-btn` / `next-story-btn` / `next-letter-btn` - Next item buttons
- `next-level-btn` - Next level button

---

## Files Created

### Frontend
- `/app/frontend/src/pages/skillsworld/reading/ReadingWordsHome.jsx`
- `/app/frontend/src/pages/skillsworld/reading/WordExplorerGame.jsx`
- `/app/frontend/src/pages/skillsworld/reading/StoryPathsGame.jsx`
- `/app/frontend/src/pages/skillsworld/reading/LetterSoundsGame.jsx`

### Content
- `/app/frontend/src/data/skills_world/word_explorer_levels.json`
- `/app/frontend/src/data/skills_world/story_paths_levels.json`
- `/app/frontend/src/data/skills_world/letter_sounds_levels.json`

### Modified
- `/app/frontend/src/App.js` - Added routes
- `/app/frontend/src/pages/skillsworld/SkillsWorldHome.jsx` - Updated Reading & Words to active
- `/app/backend/config/modules_registry.json` - Added reading_words module

---

## Future Enhancements (v2.0+)

1. **Audio Support**: Add pronunciation audio for Letter Sounds
2. **Visual Association**: Add images to Word Explorer
3. **More Content**: Add more levels and words
4. **Progress Sync**: Backend storage for logged-in users
5. **Localization**: Multi-language support
6. **Accessibility**: Enhanced screen reader support, keyboard navigation
