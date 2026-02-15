# Skills World Sub-Worlds - Architecture Outline

**Status**: PLANNING (Not Implemented)  
**Version**: Draft v0.1  
**Date**: 2026-02-15

---

## Overview

Extend Skills World with two new sub-worlds:
1. **Reading & Words** - Language, vocabulary, reading comprehension
2. **Critical Thinking** - Logic, reasoning, problem-solving

Both follow the established Skills World design philosophy:
- Guest-first (no account required)
- No ads, monetization, urgency, rankings, or streaks
- Calm, non-coercive visual design
- Progress through understanding, not time or payment

---

## Proposed Structure

```
/skillsworld
├── /math                    ✅ EXISTS (Number Paths)
├── /reading                 🆕 NEW - Reading & Words
│   ├── /word-explorer       Activity: vocabulary building
│   ├── /story-paths         Activity: reading comprehension
│   └── /letter-sounds       Activity: phonics (younger)
└── /thinking                🆕 NEW - Critical Thinking
    ├── /pattern-finder      Activity: sequence/pattern recognition
    ├── /logic-puzzles       Activity: deductive reasoning
    └── /cause-effect        Activity: causal reasoning
```

---

## 1. Reading & Words Sub-World

### Hub Page: `/skillsworld/reading`

**Layout:**
- Hero: "Reading & Words" title with calm illustration
- Activity cards (3 initial activities)
- Age/skill level indicators (non-judgmental)
- "No timers. No pressure. Just words." trust signal

### Activities

#### 1.1 Word Explorer (`/skillsworld/reading/word-explorer`)
- **Concept**: Vocabulary building through visual association
- **Mechanic**: 
  - Show image → select matching word from 3-4 options
  - Progressive difficulty (concrete → abstract)
  - Optional: hear word pronunciation
- **Levels**: 5 levels, ~10 words each
- **No wrong answers**: Gentle "Try another" feedback

#### 1.2 Story Paths (`/skillsworld/reading/story-paths`)
- **Concept**: Reading comprehension through short passages
- **Mechanic**:
  - Read short passage (2-4 sentences)
  - Answer simple question about content
  - Visual confirmation (not score)
- **Levels**: 5 levels, increasing passage length
- **Content**: Culturally relevant, positive narratives

#### 1.3 Letter Sounds (`/skillsworld/reading/letter-sounds`)
- **Concept**: Phonics fundamentals for younger users
- **Mechanic**:
  - Show letter → hear sound → match to word starting with that sound
  - Visual + audio reinforcement
- **Levels**: 3 levels (consonants, vowels, blends)

---

## 2. Critical Thinking Sub-World

### Hub Page: `/skillsworld/thinking`

**Layout:**
- Hero: "Critical Thinking" title with puzzle illustration
- Activity cards (3 initial activities)
- "Think it through. No rush." trust signal

### Activities

#### 2.1 Pattern Finder (`/skillsworld/thinking/pattern-finder`)
- **Concept**: Recognize sequences and patterns
- **Mechanic**:
  - Show sequence of shapes/colors/numbers
  - Select what comes next
  - Visual pattern highlight on success
- **Levels**: 5 levels (simple → complex patterns)
- **Example**: 🔴🔵🔴🔵🔴❓ → 🔵

#### 2.2 Logic Puzzles (`/skillsworld/thinking/logic-puzzles`)
- **Concept**: Deductive reasoning with visual clues
- **Mechanic**:
  - Simple "who has what" style puzzles
  - Given clues, match items to categories
  - Grid-based interface
- **Levels**: 5 levels (2 variables → 4 variables)

#### 2.3 Cause & Effect (`/skillsworld/thinking/cause-effect`)
- **Concept**: Understanding causal relationships
- **Mechanic**:
  - Show scenario (image/text)
  - "What happens next?" or "Why did this happen?"
  - Select from options
- **Levels**: 5 levels (direct → indirect causation)

---

## Technical Architecture

### Frontend Structure

```
/frontend/src/pages/skillsworld/
├── SkillsWorldHome.jsx          ✅ EXISTS
├── math/
│   ├── MathLogicHome.jsx        ✅ EXISTS
│   └── NumberPathsGame.jsx      ✅ EXISTS
├── reading/                      🆕 NEW
│   ├── ReadingWordsHome.jsx     Hub page
│   ├── WordExplorerGame.jsx     Activity
│   ├── StoryPathsGame.jsx       Activity
│   └── LetterSoundsGame.jsx     Activity
└── thinking/                     🆕 NEW
    ├── CriticalThinkingHome.jsx Hub page
    ├── PatternFinderGame.jsx    Activity
    ├── LogicPuzzlesGame.jsx     Activity
    └── CauseEffectGame.jsx      Activity
```

### Routes to Add (App.js)

```jsx
// Reading & Words
<Route path="/skillsworld/reading" element={<ReadingWordsHome />} />
<Route path="/skillsworld/reading/word-explorer" element={<WordExplorerGame />} />
<Route path="/skillsworld/reading/story-paths" element={<StoryPathsGame />} />
<Route path="/skillsworld/reading/letter-sounds" element={<LetterSoundsGame />} />

// Critical Thinking
<Route path="/skillsworld/thinking" element={<CriticalThinkingHome />} />
<Route path="/skillsworld/thinking/pattern-finder" element={<PatternFinderGame />} />
<Route path="/skillsworld/thinking/logic-puzzles" element={<LogicPuzzlesGame />} />
<Route path="/skillsworld/thinking/cause-effect" element={<CauseEffectGame />} />
```

### Backend (Optional/Future)

Currently Skills World is **frontend-only** with:
- No backend APIs
- No database storage
- Optional localStorage for progress continuity

Future considerations:
- Progress sync for logged-in users
- Content management for activities
- Analytics (non-extractive, aggregate only)

---

## Data Model (Frontend Only)

### Activity Content Structure

```javascript
const wordExplorerLevels = [
  {
    level: 1,
    name: "Everyday Objects",
    words: [
      { word: "apple", image: "/images/apple.png", audio: "/audio/apple.mp3" },
      { word: "book", image: "/images/book.png", audio: "/audio/book.mp3" },
      // ...
    ]
  },
  // ... more levels
];
```

### Progress Structure (localStorage)

```javascript
// Key: banibs:skillsworld:progress
{
  "reading": {
    "word-explorer": { currentLevel: 2, completed: [1] },
    "story-paths": { currentLevel: 1, completed: [] }
  },
  "thinking": {
    "pattern-finder": { currentLevel: 3, completed: [1, 2] }
  }
}
```

---

## Design Guidelines

### Visual Style (Consistent with Math)
- Calm, neutral colors (no bright primaries)
- Soft shadows, rounded corners
- Generous whitespace
- No mascots or cartoon characters
- Clean typography (system fonts)

### Interaction Patterns
- **No timers** - Users work at their own pace
- **No scores** - Progress shown as "levels explored"
- **No failure states** - "Try another" instead of "Wrong"
- **No streaks** - No gamification pressure
- **Optional hints** - Available but not forced

### Accessibility
- Keyboard navigation
- Screen reader support
- High contrast mode compatible
- Audio optional (not required)

---

## Implementation Order (Recommended)

### Phase 1: Hub Pages
1. Create `ReadingWordsHome.jsx`
2. Create `CriticalThinkingHome.jsx`
3. Update `SkillsWorldHome.jsx` with new sub-world cards
4. Add routes to `App.js`

### Phase 2: First Activities
5. Implement `WordExplorerGame.jsx` (Reading)
6. Implement `PatternFinderGame.jsx` (Thinking)

### Phase 3: Remaining Activities
7. `StoryPathsGame.jsx`
8. `LogicPuzzlesGame.jsx`
9. `LetterSoundsGame.jsx`
10. `CauseEffectGame.jsx`

### Phase 4: Polish
11. Add images/audio assets
12. Progress persistence (localStorage)
13. Update modules registry

---

## Modules Registry Entry (To Add After Implementation)

```json
{
  "id": "skills_world_reading",
  "display_name": "Reading & Words",
  "world": "Skills World",
  "category": "education",
  "status": "active",
  "frontend_routes": [
    "/skillsworld/reading",
    "/skillsworld/reading/word-explorer",
    "/skillsworld/reading/story-paths",
    "/skillsworld/reading/letter-sounds"
  ],
  "api_routes": [],
  "db_collections": [],
  "last_updated": "2026-02-XX",
  "notes": "Language and reading activities - guest-first, calm tech"
},
{
  "id": "skills_world_thinking",
  "display_name": "Critical Thinking",
  "world": "Skills World",
  "category": "education",
  "status": "active",
  "frontend_routes": [
    "/skillsworld/thinking",
    "/skillsworld/thinking/pattern-finder",
    "/skillsworld/thinking/logic-puzzles",
    "/skillsworld/thinking/cause-effect"
  ],
  "api_routes": [],
  "db_collections": [],
  "last_updated": "2026-02-XX",
  "notes": "Logic and reasoning activities - guest-first, calm tech"
}
```

---

## Open Questions (For Raymond)

1. **Content Source**: Should activity content be hardcoded or loaded from JSON files?
2. **Age Targeting**: Specific age ranges for activities, or keep it flexible?
3. **Audio**: Include pronunciation audio for Reading activities?
4. **Illustrations**: Source for activity images (stock, generated, custom)?
5. **Priority**: Reading first or Critical Thinking first?

---

## Estimated Scope

| Component | Files | Complexity |
|-----------|-------|------------|
| Hub Pages (2) | 2 | Low |
| Activities (6) | 6 | Medium each |
| Assets | ~50-100 images | Medium |
| Routes | 8 new | Low |
| Registry | 2 entries | Low |

**Total new files**: ~10 JSX components + assets

---

*This document is an architecture outline only. No implementation until directive received.*
