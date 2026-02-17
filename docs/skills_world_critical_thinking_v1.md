# Skills World Sub-Worlds v1.1 - Critical Thinking

**Status**: ACTIVE  
**Version**: v1.0  
**Date**: 2026-02-15

---

## Overview

The "Critical Thinking" sub-world is the third major educational module in Skills World, following Math & Logic and Reading & Words. It provides three thinking-focused activities designed to build logical reasoning and problem-solving skills, following the same calm-tech design philosophy as the rest of Skills World.

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
- Gentle feedback only ("Not quite" instead of "Wrong")
- Optional localStorage persistence for progress continuity

---

## Activities

### 1. Pattern Finder (`/skillsworld/thinking/pattern-finder`)
**Target Age**: 5-9+

Discover patterns and predict what comes next. Users see a sequence and must identify the pattern to select the next item.

**Mechanics**:
- 5 levels with 6 patterns each
- Levels progress from simple alternating patterns to complex mixed patterns
- Visual sequence display with placeholder for the answer
- No wrong answers - incorrect selections show the correct answer
- Progress saved to localStorage

**Levels**:
1. Simple Patterns - Basic alternating patterns (AB, AB, AB)
2. Growing Patterns - Numbers that increase in a pattern
3. Shape Sequences - Patterns with shapes
4. Color Patterns - Patterns using colors
5. Mixed Patterns - Combinations of different pattern types

### 2. Logic Puzzles (`/skillsworld/thinking/logic-puzzles`)
**Target Age**: 6-10+

Think carefully and solve puzzles step by step. Users read a setup with clues and must determine the correct answer.

**Mechanics**:
- 5 levels with 5 puzzles each
- Multiple choice answers
- Puzzles require logical deduction
- Progress saved to localStorage

**Levels**:
1. Simple Clues - Basic comparison puzzles (bigger/smaller, more/less)
2. Yes or No - Determining what must be true from statements
3. Order Puzzles - Arranging items in correct sequence
4. If-Then Puzzles - Conditional reasoning
5. Tricky Thinking - Puzzles that require careful reading

### 3. Cause & Effect (`/skillsworld/thinking/cause-effect`)
**Target Age**: 5-9+

Understand why things happen and what happens next. Users match causes to effects or vice versa.

**Mechanics**:
- 5 levels with 6 items each
- Mix of cause-to-effect and effect-to-cause questions
- Multiple choice answers
- Progress saved to localStorage

**Levels**:
1. Simple Causes - Basic everyday cause and effect
2. Nature Connections - Cause and effect in nature
3. Everyday Life - Daily activities and consequences
4. Stories & Actions - Character motivations in stories
5. Thinking Deeper - Chain reactions and multiple causes/effects

---

## Technical Architecture

### Frontend Structure
```
/frontend/src/pages/skillsworld/thinking/
├── CriticalThinkingHome.jsx   # Hub page
├── PatternFinderGame.jsx      # Pattern recognition activity
├── LogicPuzzlesGame.jsx       # Logic puzzle activity
└── CauseEffectGame.jsx        # Cause & effect activity
```

### Content Files (JSON-driven)
```
/frontend/src/data/skills_world/
├── pattern_finder_levels.json
├── logic_puzzles_levels.json
└── cause_effect_levels.json
```

### Routes
- `/skillsworld/thinking` - Hub page
- `/skillsworld/thinking/pattern-finder` - Pattern Finder activity
- `/skillsworld/thinking/logic-puzzles` - Logic Puzzles activity
- `/skillsworld/thinking/cause-effect` - Cause & Effect activity

### localStorage Keys
- `banibs_patternfinder_progress` - Pattern Finder completed levels
- `banibs_logicpuzzles_progress` - Logic Puzzles completed levels
- `banibs_causeeffect_progress` - Cause & Effect completed levels

---

## Content Structure

### Pattern Finder JSON Schema
```json
{
  "activity_id": "pattern-finder",
  "levels": [
    {
      "id": 1,
      "name": "Level Name",
      "description": "Short description",
      "items": [
        {
          "sequence": ["item1", "item2", "item3", "item4", "item5"],
          "answer": "item6",
          "options": ["option1", "option2", "option3", "option4"]
        }
      ]
    }
  ]
}
```

### Logic Puzzles JSON Schema
```json
{
  "activity_id": "logic-puzzles",
  "levels": [
    {
      "id": 1,
      "name": "Level Name",
      "puzzles": [
        {
          "id": "1-1",
          "setup": "Puzzle scenario text...",
          "question": "What is the answer?",
          "options": ["Option A", "Option B", "Option C"],
          "correct": 0
        }
      ]
    }
  ]
}
```

### Cause & Effect JSON Schema
```json
{
  "activity_id": "cause-effect",
  "levels": [
    {
      "id": 1,
      "name": "Level Name",
      "items": [
        {
          "id": "1-1",
          "type": "cause_to_effect",
          "cause": "Something happened...",
          "question": "What might happen next?",
          "options": ["Effect A", "Effect B", "Effect C", "Effect D"],
          "correct": 0
        }
      ]
    }
  ]
}
```

---

## Visual Design

### Colors
- **Pattern Finder**: Amber/Yellow gradient
- **Logic Puzzles**: Purple/Violet gradient
- **Cause & Effect**: Cyan/Teal gradient

### Typography
- Headers: System sans-serif (Inter, etc.)
- Puzzle text: Georgia serif for comfortable reading
- Pattern sequences: Bold system font

### Interactions
- Subtle hover states with scale(1.02) and shadow
- 150ms transitions for smooth level changes
- Progress bars with color-coded completion states
- Floating feedback indicators

---

## V1.0 Limitations (Intentional)

1. **No images**: All content is text-based
2. **No backend**: All progress is localStorage only
3. **English only**: Content is English-only
4. **No hints**: Users must think through problems (no hint system)

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
- `back-to-thinking` - Back button on activities
- `activity-card-{id}` - Activity cards on hub
- `activity-link-{id}` - Activity links on hub
- `level-selector-toggle` - Level dropdown toggle
- `level-{id}` - Level selection buttons
- `option-{idx}` - Answer option buttons
- `next-pattern-btn` / `next-puzzle-btn` / `next-item-btn` - Next item buttons
- `next-level-btn` - Next level button

---

## Files Created

### Frontend
- `/app/frontend/src/pages/skillsworld/thinking/CriticalThinkingHome.jsx`
- `/app/frontend/src/pages/skillsworld/thinking/PatternFinderGame.jsx`
- `/app/frontend/src/pages/skillsworld/thinking/LogicPuzzlesGame.jsx`
- `/app/frontend/src/pages/skillsworld/thinking/CauseEffectGame.jsx`

### Content
- `/app/frontend/src/data/skills_world/pattern_finder_levels.json`
- `/app/frontend/src/data/skills_world/logic_puzzles_levels.json`
- `/app/frontend/src/data/skills_world/cause_effect_levels.json`

### Modified
- `/app/frontend/src/App.js` - Added routes
- `/app/frontend/src/pages/skillsworld/SkillsWorldHome.jsx` - Updated Critical Thinking to active
- `/app/backend/config/modules_registry.json` - Added critical_thinking module

---

## Future Enhancements (v2.0+)

1. **Visual Patterns**: Add image-based pattern recognition
2. **More Levels**: Expand content for each activity
3. **Difficulty Scaling**: Add intermediate and advanced tracks
4. **Progress Sync**: Backend storage for logged-in users
5. **Localization**: Multi-language support
6. **Accessibility**: Enhanced screen reader support, keyboard navigation
