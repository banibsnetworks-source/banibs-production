import React, { useState, useEffect, useCallback, useRef } from 'react';
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
 * 
 * UX REFINEMENTS (v1.1):
 * - Preview what each step will do before selection
 * - Subtle visual feedback on stone selection
 * - Smoother transitions between levels
 * - Better overshoot/recovery messaging
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
    try {
      const saved = localStorage.getItem('banibs_numberpaths_progress');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UX Refinement state
  const [hoveredStone, setHoveredStone] = useState(null); // Track hovered stone for preview
  const [lastAddedValue, setLastAddedValue] = useState(null); // For animation
  const [isTransitioning, setIsTransitioning] = useState(false); // Level transition
  const totalRef = useRef(null);

  const currentLevel = LEVELS[currentLevelIndex];

  // Initialize level with smooth transition
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setCurrentTotal(currentLevel.start);
      setPath([]);
      setIsComplete(false);
      setHoveredStone(null);
      setLastAddedValue(null);
      setIsTransitioning(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [currentLevelIndex, currentLevel.start]);

  // Check for completion
  useEffect(() => {
    if (currentTotal === currentLevel.target && path.length > 0) {
      setIsComplete(true);
      
      if (!completedLevels.includes(currentLevel.id)) {
        const newCompleted = [...completedLevels, currentLevel.id];
        setCompletedLevels(newCompleted);
        try {
          localStorage.setItem('banibs_numberpaths_progress', JSON.stringify(newCompleted));
        } catch {
          // Silent fail
        }
      }
    }
  }, [currentTotal, currentLevel.target, currentLevel.id, path.length, completedLevels]);

  // Handle stepping on a stone with animation
  const handleStepOn = useCallback((stoneIndex, value) => {
    if (isComplete || isTransitioning) return;
    
    setLastAddedValue(value);
    setPath(prev => [...prev, { index: stoneIndex, value }]);
    setCurrentTotal(prev => prev + value);
    
    // Clear animation state after brief delay
    setTimeout(() => setLastAddedValue(null), 600);
  }, [isComplete, isTransitioning]);

  // Reset current level
  const handleReset = useCallback(() => {
    setCurrentTotal(currentLevel.start);
    setPath([]);
    setIsComplete(false);
    setLastAddedValue(null);
    setHoveredStone(null);
  }, [currentLevel.start]);

  // Go to next level with smooth transition
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

  // Calculate preview value when hovering
  const getPreviewTotal = () => {
    if (hoveredStone === null) return null;
    const stoneValue = currentLevel.stones[hoveredStone];
    const isUsed = path.some(p => p.index === hoveredStone);
    if (isUsed) return null;
    return currentTotal + stoneValue;
  };

  const previewTotal = getPreviewTotal();

  // Determine feedback message - improved for clarity
  const getFeedback = () => {
    if (isComplete) return null;
    if (path.length === 0) return 'Tap a stone to add its value';
    if (currentTotal === currentLevel.target) return null;
    
    const diff = currentLevel.target - currentTotal;
    
    if (currentTotal > currentLevel.target) {
      // Overshoot - provide helpful direction
      const availableNegatives = currentLevel.stones
        .filter((v, idx) => v < 0 && !path.some(p => p.index === idx));
      
      if (availableNegatives.length > 0) {
        return `Passed the target — use a subtract stone or start fresh`;
      }
      return `Passed the target — tap "Start fresh" to try again`;
    }
    
    if (currentTotal < 0) {
      return `In negative numbers — keep going or start fresh`;
    }
    
    // Normal progress feedback
    if (diff === 1) return `Almost there — need 1 more`;
    if (diff <= 3) return `Getting close — need ${diff} more`;
    return `Need ${diff} more to reach ${currentLevel.target}`;
  };

  // Check if learner is in a stuck state (no valid moves to reach target)
  const hasValidMoves = () => {
    const unusedStones = currentLevel.stones.filter((_, idx) => !path.some(p => p.index === idx));
    return unusedStones.length > 0;
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
            <span>Explore levels</span>
            <ChevronRight 
              size={16} 
              className={`transition-transform duration-200 ${showLevelSelect ? 'rotate-90' : ''}`}
            />
          </button>
        </div>
      </header>

      {/* Level Selector Dropdown - Smoother animation */}
      <div 
        className={`border-b overflow-hidden transition-all duration-300 ease-out ${
          showLevelSelect ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ 
          backgroundColor: isDark ? 'rgba(20, 20, 20, 0.98)' : 'rgba(245, 245, 245, 0.98)',
          borderColor: showLevelSelect ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') : 'transparent'
        }}
      >
        <div className="max-w-3xl mx-auto px-4 py-4">
          <p 
            className="text-xs mb-3"
            style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
          >
            Pick any level — explore in any order
          </p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map((level, idx) => {
              const isCompleted = completedLevels.includes(level.id);
              const isCurrent = idx === currentLevelIndex;
              
              return (
                <button
                  key={level.id}
                  onClick={() => handleSelectLevel(idx)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                  style={{
                    backgroundColor: isCurrent 
                      ? (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)')
                      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                    color: isCurrent 
                      ? 'rgb(59, 130, 246)'
                      : (isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'),
                    border: isCurrent 
                      ? '1px solid rgba(59, 130, 246, 0.3)'
                      : '1px solid transparent',
                    transform: isCurrent ? 'scale(1.02)' : 'scale(1)'
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

      {/* Main Game Area */}
      <main 
        className={`flex-1 flex flex-col items-center justify-center p-4 sm:p-8 transition-opacity duration-200 ${
          isTransitioning ? 'opacity-50' : 'opacity-100'
        }`}
      >
        {/* Level Info */}
        <div className="text-center mb-6">
          <h2 
            className="text-xl font-semibold mb-1"
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

        {/* Progress Bar - Visual indicator of progress toward target */}
        <div className="w-full max-w-xs mb-6">
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${Math.min(100, Math.max(0, (currentTotal / currentLevel.target) * 100))}%`,
                backgroundColor: isComplete 
                  ? 'rgb(34, 197, 94)' 
                  : currentTotal > currentLevel.target
                    ? 'rgb(251, 146, 60)'
                    : 'rgb(59, 130, 246)'
              }}
            />
          </div>
          <div className="flex justify-between mt-1 text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
            <span>{currentLevel.start}</span>
            <span>{currentLevel.target}</span>
          </div>
        </div>

        {/* Current Total - Hero Display */}
        <div 
          ref={totalRef}
          className={`relative flex flex-col items-center px-8 py-6 rounded-2xl mb-6 transition-all duration-300 ${
            lastAddedValue !== null ? 'scale-105' : 'scale-100'
          }`}
          style={{ 
            backgroundColor: isComplete 
              ? (isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)')
              : currentTotal > currentLevel.target
                ? (isDark ? 'rgba(251, 146, 60, 0.15)' : 'rgba(251, 146, 60, 0.1)')
                : (isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'),
            border: `2px solid ${
              isComplete 
                ? 'rgba(34, 197, 94, 0.4)' 
                : currentTotal > currentLevel.target
                  ? 'rgba(251, 146, 60, 0.4)'
                  : 'rgba(59, 130, 246, 0.4)'
            }`,
            boxShadow: isComplete 
              ? '0 0 30px rgba(34, 197, 94, 0.2)'
              : lastAddedValue !== null 
                ? '0 0 20px rgba(59, 130, 246, 0.2)'
                : 'none'
          }}
        >
          {/* Floating +/- indicator when value added */}
          {lastAddedValue !== null && (
            <span 
              className="absolute -top-3 -right-3 px-2 py-1 rounded-full text-sm font-bold animate-bounce"
              style={{
                backgroundColor: lastAddedValue >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
                color: 'white'
              }}
            >
              {lastAddedValue >= 0 ? '+' : ''}{lastAddedValue}
            </span>
          )}
          
          <span 
            className="text-xs uppercase tracking-wider mb-2 font-medium"
            style={{ 
              color: isComplete 
                ? 'rgb(34, 197, 94)' 
                : currentTotal > currentLevel.target
                  ? 'rgb(251, 146, 60)'
                  : 'rgb(59, 130, 246)' 
            }}
          >
            {isComplete ? '✓ Target reached!' : 'Your total'}
          </span>
          
          <div className="flex items-baseline gap-2">
            <span 
              className="text-5xl font-bold tabular-nums transition-all duration-300"
              style={{ 
                color: isComplete 
                  ? 'rgb(34, 197, 94)' 
                  : currentTotal > currentLevel.target
                    ? 'rgb(251, 146, 60)'
                    : 'rgb(59, 130, 246)'
              }}
            >
              {currentTotal}
            </span>
            
            {/* Preview indicator when hovering a stone */}
            {previewTotal !== null && !isComplete && (
              <span 
                className="text-2xl font-medium animate-pulse"
                style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)' }}
              >
                → {previewTotal}
              </span>
            )}
          </div>
          
          {/* Target reminder */}
          {!isComplete && (
            <span 
              className="text-sm mt-2"
              style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
            >
              Target: {currentLevel.target}
            </span>
          )}
        </div>

        {/* Stepping Stones */}
        <div className="flex flex-wrap justify-center gap-3 mb-6 max-w-md">
          {currentLevel.stones.map((value, idx) => {
            const isUsed = path.some(p => p.index === idx);
            const isPositive = value >= 0;
            const isHovered = hoveredStone === idx;
            const wouldReachTarget = currentTotal + value === currentLevel.target;
            
            return (
              <button
                key={idx}
                onClick={() => !isUsed && !isComplete && handleStepOn(idx, value)}
                onMouseEnter={() => !isUsed && !isComplete && setHoveredStone(idx)}
                onMouseLeave={() => setHoveredStone(null)}
                disabled={isUsed || isComplete}
                className="relative w-16 h-16 rounded-2xl font-bold text-xl transition-all duration-200"
                style={{
                  backgroundColor: isUsed
                    ? (isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)')
                    : isHovered
                      ? isPositive
                        ? (isDark ? 'rgba(34, 197, 94, 0.25)' : 'rgba(34, 197, 94, 0.2)')
                        : (isDark ? 'rgba(239, 68, 68, 0.25)' : 'rgba(239, 68, 68, 0.2)')
                      : isPositive
                        ? (isDark ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.08)')
                        : (isDark ? 'rgba(239, 68, 68, 0.12)' : 'rgba(239, 68, 68, 0.08)'),
                  color: isUsed
                    ? (isDark ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)')
                    : isPositive
                      ? 'rgb(34, 197, 94)'
                      : 'rgb(239, 68, 68)',
                  border: `2px solid ${
                    isUsed
                      ? 'transparent'
                      : isHovered
                        ? isPositive
                          ? 'rgba(34, 197, 94, 0.6)'
                          : 'rgba(239, 68, 68, 0.6)'
                        : wouldReachTarget && !isUsed
                          ? 'rgba(34, 197, 94, 0.5)'
                          : isPositive
                            ? 'rgba(34, 197, 94, 0.25)'
                            : 'rgba(239, 68, 68, 0.25)'
                  }`,
                  cursor: isUsed || isComplete ? 'default' : 'pointer',
                  transform: isUsed 
                    ? 'scale(0.85)' 
                    : isHovered 
                      ? 'scale(1.1) translateY(-2px)' 
                      : 'scale(1)',
                  opacity: isUsed ? 0.35 : 1,
                  boxShadow: isHovered && !isUsed
                    ? isPositive
                      ? '0 4px 12px rgba(34, 197, 94, 0.3)'
                      : '0 4px 12px rgba(239, 68, 68, 0.3)'
                    : wouldReachTarget && !isUsed
                      ? '0 0 12px rgba(34, 197, 94, 0.4)'
                      : 'none'
                }}
              >
                {isPositive ? '+' : ''}{value}
                
                {/* Hint glow for stones that would reach target */}
                {wouldReachTarget && !isUsed && !isComplete && (
                  <span 
                    className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 animate-ping"
                    style={{ opacity: 0.6 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Feedback Message - Clearer and more helpful */}
        <div className="min-h-[48px] mb-4 text-center">
          {!isComplete && (
            <p 
              className="text-sm px-4 py-2 rounded-lg inline-block"
              style={{ 
                color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
                backgroundColor: currentTotal > currentLevel.target 
                  ? (isDark ? 'rgba(251, 146, 60, 0.1)' : 'rgba(251, 146, 60, 0.08)')
                  : 'transparent'
              }}
            >
              {getFeedback()}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
              color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            <RotateCcw size={16} />
            <span>Start fresh</span>
          </button>

          {isComplete && currentLevelIndex < LEVELS.length - 1 && (
            <button
              onClick={handleNextLevel}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                color: 'rgb(59, 130, 246)',
                border: '1px solid rgba(59, 130, 246, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.25)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.15)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>Try another</span>
              <ChevronRight size={16} />
            </button>
          )}
          
          {isComplete && currentLevelIndex === LEVELS.length - 1 && (
            <button
              onClick={() => navigate('/skillsworld/math')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                color: 'rgb(34, 197, 94)',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.25)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.15)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <span>Explore more</span>
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Path History - Cleaner layout */}
        {path.length > 0 && (
          <div 
            className="mt-8 px-4 py-3 rounded-xl max-w-md"
            style={{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
            }}
          >
            <p 
              className="text-xs mb-2 text-center"
              style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}
            >
              Your path
            </p>
            <div className="flex items-center justify-center flex-wrap gap-1 text-sm">
              <span 
                className="px-2 py-0.5 rounded"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}
              >
                {currentLevel.start}
              </span>
              {path.map((step, idx) => (
                <React.Fragment key={idx}>
                  <span style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)' }}>→</span>
                  <span 
                    className="px-2 py-0.5 rounded font-medium"
                    style={{ 
                      backgroundColor: step.value >= 0 
                        ? (isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)')
                        : (isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'),
                      color: step.value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
                    }}
                  >
                    {step.value >= 0 ? '+' : ''}{step.value}
                  </span>
                </React.Fragment>
              ))}
              <span style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(209, 213, 219)' }}>=</span>
              <span 
                className="px-2 py-0.5 rounded font-bold"
                style={{ 
                  backgroundColor: isComplete 
                    ? (isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)')
                    : (isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'),
                  color: isComplete ? 'rgb(34, 197, 94)' : 'rgb(59, 130, 246)'
                }}
              >
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
