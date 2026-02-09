import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowLeft, RotateCcw, ChevronRight, Check } from 'lucide-react';

/**
 * Number Paths - Math & Logic Activity
 * 
 * CORE MECHANIC:
 * - Start number (default 0)
 * - Target number (e.g., 10, 15, 20)
 * - Stepping stones with + / – values
 * - Visual running total updates each step
 * - No timers, no penalties, no failure states
 * - Gentle feedback only ("Try another path")
 * 
 * PROGRESSION:
 * - Difficulty increases by number size and available steps
 * - No scores, no leaderboards
 * - Completion unlocks harder challenges naturally
 * 
 * CANONICAL CONSTRAINTS:
 * - Guest-first (no account required)
 * - No pressure, no competition
 * - Pausing/stopping is never punished
 */

// Level configurations
const LEVELS = [
  {
    id: 1,
    name: 'First Steps',
    start: 0,
    target: 5,
    stones: [1, 2, 1, 2, 3],
    description: 'Reach 5 by stepping on numbers'
  },
  {
    id: 2,
    name: 'A Little Further',
    start: 0,
    target: 10,
    stones: [2, 3, 5, 2, 3, 4],
    description: 'Can you reach 10?'
  },
  {
    id: 3,
    name: 'Mix It Up',
    start: 5,
    target: 12,
    stones: [3, 2, 4, -1, 3, 2],
    description: 'Some stones subtract — watch carefully'
  },
  {
    id: 4,
    name: 'Careful Choices',
    start: 0,
    target: 15,
    stones: [5, 3, -2, 4, 6, 2, -1, 5],
    description: 'Choose your path wisely'
  },
  {
    id: 5,
    name: 'Finding Balance',
    start: 10,
    target: 10,
    stones: [3, -3, 5, -5, 2, -2, 4, -4],
    description: 'Start and end at the same number'
  }
];

const NumberPathsGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Game state
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentTotal, setCurrentTotal] = useState(0);
  const [path, setPath] = useState([]); // Track which stones were stepped on
  const [isComplete, setIsComplete] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [completedLevels, setCompletedLevels] = useState(() => {
    // Optional: Load from localStorage (passive, not required)
    try {
      const saved = localStorage.getItem('banibs_numberpaths_progress');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const currentLevel = LEVELS[currentLevelIndex];

  // Initialize level
  useEffect(() => {
    setCurrentTotal(currentLevel.start);
    setPath([]);
    setIsComplete(false);
  }, [currentLevelIndex, currentLevel.start]);

  // Check for completion
  useEffect(() => {
    if (currentTotal === currentLevel.target && path.length > 0) {
      setIsComplete(true);
      
      // Mark level as completed (passive localStorage)
      if (!completedLevels.includes(currentLevel.id)) {
        const newCompleted = [...completedLevels, currentLevel.id];
        setCompletedLevels(newCompleted);
        try {
          localStorage.setItem('banibs_numberpaths_progress', JSON.stringify(newCompleted));
        } catch {
          // Silent fail - progress saving is optional
        }
      }
    }
  }, [currentTotal, currentLevel.target, currentLevel.id, path.length, completedLevels]);

  // Handle stepping on a stone
  const handleStepOn = useCallback((stoneIndex, value) => {
    if (isComplete) return;
    
    setPath(prev => [...prev, { index: stoneIndex, value }]);
    setCurrentTotal(prev => prev + value);
  }, [isComplete]);

  // Reset current level
  const handleReset = useCallback(() => {
    setCurrentTotal(currentLevel.start);
    setPath([]);
    setIsComplete(false);
  }, [currentLevel.start]);

  // Go to next level
  const handleNextLevel = useCallback(() => {
    if (currentLevelIndex < LEVELS.length - 1) {
      setCurrentLevelIndex(prev => prev + 1);
    }
  }, [currentLevelIndex]);

  // Select a specific level
  const handleSelectLevel = useCallback((index) => {
    setCurrentLevelIndex(index);
    setShowLevelSelect(false);
  }, []);

  // Determine feedback message
  const getFeedback = () => {
    if (isComplete) return null;
    if (path.length === 0) return 'Step on stones to add or subtract';
    if (currentTotal === currentLevel.target) return null;
    if (currentTotal > currentLevel.target) return 'You passed the target — try another path';
    if (currentTotal < currentLevel.start && currentLevel.start === 0) return 'Negative territory — try a different route';
    return `${currentLevel.target - currentTotal} more to reach ${currentLevel.target}`;
  };

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
        color: isDark ? '#e5e5e5' : '#1a1a1a'
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 border-b"
        style={{ 
          backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/skillsworld/math')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{
              color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft size={20} />
            <span className="text-sm hidden sm:inline">Math & Logic</span>
          </button>
          
          <div className="flex-1">
            <h1 
              className="text-lg font-semibold"
              style={{ color: isDark ? '#fff' : '#111' }}
            >
              Number Paths
            </h1>
            <p 
              className="text-xs"
              style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
            >
              Ages 5–8+ • Level {currentLevel.id}
            </p>
          </div>

          {/* Level selector trigger */}
          <button
            onClick={() => setShowLevelSelect(!showLevelSelect)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
            }}
          >
            <span>Levels</span>
            <ChevronRight 
              size={16} 
              className={`transition-transform ${showLevelSelect ? 'rotate-90' : ''}`}
            />
          </button>
        </div>
      </header>

      {/* Level Selector Dropdown */}
      {showLevelSelect && (
        <div 
          className="border-b"
          style={{ 
            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.98)' : 'rgba(245, 245, 245, 0.98)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'
          }}
        >
          <div className="max-w-3xl mx-auto px-4 py-4">
            <p 
              className="text-xs mb-3"
              style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
            >
              Choose any level — no order required
            </p>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((level, idx) => {
                const isCompleted = completedLevels.includes(level.id);
                const isCurrent = idx === currentLevelIndex;
                
                return (
                  <button
                    key={level.id}
                    onClick={() => handleSelectLevel(idx)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                    style={{
                      backgroundColor: isCurrent 
                        ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)')
                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: isCurrent 
                        ? 'rgb(59, 130, 246)'
                        : (isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'),
                      border: isCurrent 
                        ? '1px solid rgba(59, 130, 246, 0.3)'
                        : '1px solid transparent'
                    }}
                  >
                    {isCompleted && <Check size={14} className="text-green-500" />}
                    <span>{level.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        {/* Level Info */}
        <div className="text-center mb-8">
          <h2 
            className="text-xl font-semibold mb-2"
            style={{ color: isDark ? '#fff' : '#111' }}
          >
            {currentLevel.name}
          </h2>
          <p 
            className="text-sm"
            style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
          >
            {currentLevel.description}
          </p>
        </div>

        {/* Start → Target Display */}
        <div className="flex items-center gap-4 mb-8">
          <div 
            className="flex flex-col items-center px-4 py-3 rounded-xl"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <span 
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
            >
              Start
            </span>
            <span 
              className="text-2xl font-bold"
              style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
            >
              {currentLevel.start}
            </span>
          </div>

          <div 
            className="text-2xl"
            style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)' }}
          >
            →
          </div>

          {/* Current Total (Live Counter) */}
          <div 
            className="flex flex-col items-center px-6 py-4 rounded-xl transition-all duration-300"
            style={{ 
              backgroundColor: isComplete 
                ? (isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)')
                : (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'),
              border: `2px solid ${isComplete ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`
            }}
          >
            <span 
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: isComplete ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)' }}
            >
              {isComplete ? 'Complete!' : 'Current'}
            </span>
            <span 
              className="text-4xl font-bold transition-all"
              style={{ color: isComplete ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)' }}
            >
              {currentTotal}
            </span>
          </div>

          <div 
            className="text-2xl"
            style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)' }}
          >
            →
          </div>

          <div 
            className="flex flex-col items-center px-4 py-3 rounded-xl"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'
            }}
          >
            <span 
              className="text-xs uppercase tracking-wider mb-1"
              style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
            >
              Target
            </span>
            <span 
              className="text-2xl font-bold"
              style={{ color: isDark ? '#fff' : '#111' }}
            >
              {currentLevel.target}
            </span>
          </div>
        </div>

        {/* Stepping Stones */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-lg">
          {currentLevel.stones.map((value, idx) => {
            const isUsed = path.some(p => p.index === idx);
            const isPositive = value >= 0;
            
            return (
              <button
                key={idx}
                onClick={() => !isUsed && handleStepOn(idx, value)}
                disabled={isUsed || isComplete}
                className="relative w-16 h-16 rounded-2xl font-bold text-xl transition-all duration-200"
                style={{
                  backgroundColor: isUsed
                    ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)')
                    : isPositive
                      ? (isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)')
                      : (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'),
                  color: isUsed
                    ? (isDark ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)')
                    : isPositive
                      ? 'rgb(34, 197, 94)'
                      : 'rgb(239, 68, 68)',
                  border: `2px solid ${
                    isUsed
                      ? 'transparent'
                      : isPositive
                        ? 'rgba(34, 197, 94, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                  }`,
                  cursor: isUsed || isComplete ? 'default' : 'pointer',
                  transform: isUsed ? 'scale(0.9)' : 'scale(1)',
                  opacity: isUsed ? 0.4 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isUsed && !isComplete) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isUsed) {
                    e.currentTarget.style.transform = 'scale(1)';
                  }
                }}
              >
                {isPositive ? '+' : ''}{value}
              </button>
            );
          })}
        </div>

        {/* Feedback Message */}
        {!isComplete && (
          <p 
            className="text-sm text-center mb-6 min-h-[24px]"
            style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
          >
            {getFeedback()}
          </p>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            }}
          >
            <RotateCcw size={16} />
            <span>Try again</span>
          </button>

          {isComplete && currentLevelIndex < LEVELS.length - 1 && (
            <button
              onClick={handleNextLevel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: 'rgb(59, 130, 246)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
              }}
            >
              <span>Try next</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Path History (subtle) */}
        {path.length > 0 && (
          <div 
            className="mt-8 text-center"
            style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)' }}
          >
            <p className="text-xs mb-2">Your path:</p>
            <div className="flex items-center justify-center gap-1 text-sm">
              <span>{currentLevel.start}</span>
              {path.map((step, idx) => (
                <span key={idx}>
                  <span className="mx-1">→</span>
                  <span style={{ color: step.value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)' }}>
                    {step.value >= 0 ? '+' : ''}{step.value}
                  </span>
                </span>
              ))}
              <span className="mx-1">=</span>
              <span style={{ color: isComplete ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)' }}>
                {currentTotal}
              </span>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer 
        className="border-t py-4"
        style={{ 
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
        }}
      >
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p 
            className="text-xs"
            style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)' }}
          >
            Take your time. There's no rush.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default NumberPathsGame;
