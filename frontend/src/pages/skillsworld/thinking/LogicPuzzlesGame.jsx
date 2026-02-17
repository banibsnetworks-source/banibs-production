import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowLeft, RotateCcw, ChevronRight, Check, Brain } from 'lucide-react';

// Import content from JSON
import logicPuzzlesData from '../../../data/skills_world/logic_puzzles_levels.json';

/**
 * Logic Puzzles - Critical Thinking Activity
 * 
 * CORE MECHANIC:
 * - Read a puzzle setup
 * - Think through the clues
 * - Select the correct answer
 * - No timers, no penalties, no failure states
 * 
 * CANONICAL CONSTRAINTS:
 * - Guest-first (no account required)
 * - No pressure, no competition
 * - Pausing/stopping is never punished
 */

const LEVELS = logicPuzzlesData.levels;

const LogicPuzzlesGame = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Game state
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [completedLevels, setCompletedLevels] = useState(() => {
    try {
      const saved = localStorage.getItem('banibs_logicpuzzles_progress');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [puzzlesCompletedInLevel, setPuzzlesCompletedInLevel] = useState([]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const currentLevel = LEVELS[currentLevelIndex];
  const currentPuzzle = currentLevel?.puzzles[currentPuzzleIndex];
  const totalPuzzlesInLevel = currentLevel?.puzzles.length || 0;
  const isLevelComplete = puzzlesCompletedInLevel.length >= totalPuzzlesInLevel;

  // Initialize level
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setCurrentPuzzleIndex(0);
      setSelectedOption(null);
      setIsCorrect(null);
      setPuzzlesCompletedInLevel([]);
      setIsTransitioning(false);
    }, 150);
    return () => clearTimeout(timer);
  }, [currentLevelIndex]);

  // Save progress when level is complete
  useEffect(() => {
    if (isLevelComplete && !completedLevels.includes(currentLevel.id)) {
      const newCompleted = [...completedLevels, currentLevel.id];
      setCompletedLevels(newCompleted);
      try {
        localStorage.setItem('banibs_logicpuzzles_progress', JSON.stringify(newCompleted));
      } catch {
        // Silent fail
      }
    }
  }, [isLevelComplete, currentLevel?.id, completedLevels]);

  // Handle option selection
  const handleSelectOption = useCallback((optionIndex) => {
    if (isCorrect !== null || isTransitioning) return;
    
    setSelectedOption(optionIndex);
    const correct = optionIndex === currentPuzzle.correct;
    setIsCorrect(correct);
    
    if (correct && !puzzlesCompletedInLevel.includes(currentPuzzleIndex)) {
      setPuzzlesCompletedInLevel(prev => [...prev, currentPuzzleIndex]);
    }
  }, [currentPuzzle, currentPuzzleIndex, isCorrect, isTransitioning, puzzlesCompletedInLevel]);

  // Move to next puzzle
  const handleNextPuzzle = useCallback(() => {
    if (currentPuzzleIndex < totalPuzzlesInLevel - 1) {
      setCurrentPuzzleIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    }
  }, [currentPuzzleIndex, totalPuzzlesInLevel]);

  // Reset current puzzle
  const handleTryAgain = useCallback(() => {
    setSelectedOption(null);
    setIsCorrect(null);
  }, []);

  // Reset level
  const handleResetLevel = useCallback(() => {
    setCurrentPuzzleIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setPuzzlesCompletedInLevel([]);
  }, []);

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

  if (!currentPuzzle) return null;

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
            onClick={() => navigate('/skillsworld/thinking')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            data-testid="back-to-thinking"
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
            <span className="text-sm hidden sm:inline">Critical Thinking</span>
          </button>
          
          <div className="flex-1">
            <h1 
              className="text-lg font-semibold"
              style={{ color: isDark ? '#fff' : '#111' }}
            >
              Logic Puzzles
            </h1>
            <p 
              className="text-xs"
              style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
            >
              {logicPuzzlesData.age_guide} • Level {currentLevel.id}
            </p>
          </div>

          {/* Level selector trigger */}
          <button
            onClick={() => setShowLevelSelect(!showLevelSelect)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
            data-testid="level-selector-toggle"
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

      {/* Level Selector Dropdown */}
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
                  data-testid={`level-${level.id}`}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all duration-200"
                  style={{
                    backgroundColor: isCurrent 
                      ? (isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)')
                      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                    color: isCurrent 
                      ? 'rgb(167, 139, 250)'
                      : (isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'),
                    border: isCurrent 
                      ? '1px solid rgba(147, 51, 234, 0.3)'
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

        {/* Progress indicator */}
        <div className="w-full max-w-lg mb-6">
          <div className="flex justify-between text-xs mb-2" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
            <span>Puzzle {currentPuzzleIndex + 1} of {totalPuzzlesInLevel}</span>
            <span>{puzzlesCompletedInLevel.length} completed</span>
          </div>
          <div 
            className="h-2 rounded-full overflow-hidden"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
          >
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${(puzzlesCompletedInLevel.length / totalPuzzlesInLevel) * 100}%`,
                backgroundColor: isLevelComplete ? 'rgb(34, 197, 94)' : 'rgb(147, 51, 234)'
              }}
            />
          </div>
        </div>

        {isLevelComplete ? (
          /* Level Complete State */
          <div 
            className="text-center p-8 rounded-2xl max-w-md"
            style={{ 
              backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(34, 197, 94, 0.2)' }}
            >
              <Check size={32} className="text-green-500" />
            </div>
            <h3 
              className="text-xl font-semibold mb-2"
              style={{ color: isDark ? '#fff' : '#111' }}
            >
              Level complete!
            </h3>
            <p 
              className="text-sm mb-6"
              style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
            >
              You solved all the puzzles in {currentLevel.name}
            </p>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={handleResetLevel}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}
              >
                <RotateCcw size={16} />
                <span>Solve again</span>
              </button>
              
              {currentLevelIndex < LEVELS.length - 1 && (
                <button
                  onClick={handleNextLevel}
                  data-testid="next-level-btn"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(147, 51, 234, 0.15)',
                    color: 'rgb(167, 139, 250)',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }}
                >
                  <span>Next level</span>
                  <ChevronRight size={16} />
                </button>
              )}
              
              {currentLevelIndex === LEVELS.length - 1 && (
                <button
                  onClick={() => navigate('/skillsworld/thinking')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(34, 197, 94, 0.15)',
                    color: 'rgb(34, 197, 94)',
                    border: '1px solid rgba(34, 197, 94, 0.3)'
                  }}
                >
                  <span>Explore more</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Active Game State */
          <>
            {/* Puzzle Setup */}
            <div 
              className="w-full max-w-lg p-6 rounded-2xl mb-6"
              style={{ 
                backgroundColor: isDark ? 'rgba(147, 51, 234, 0.08)' : 'rgba(147, 51, 234, 0.05)',
                border: `1px solid ${isDark ? 'rgba(147, 51, 234, 0.2)' : 'rgba(147, 51, 234, 0.15)'}`
              }}
            >
              <div className="flex items-center gap-2 mb-4">
                <Brain size={18} className="text-purple-400" />
                <span 
                  className="text-xs uppercase tracking-wider"
                  style={{ color: 'rgb(167, 139, 250)' }}
                >
                  Think about this
                </span>
              </div>
              <p 
                className="text-lg leading-relaxed"
                style={{ 
                  color: isDark ? '#fff' : '#111',
                  fontFamily: 'Georgia, serif'
                }}
              >
                {currentPuzzle.setup}
              </p>
            </div>

            {/* Question */}
            <div 
              className="w-full max-w-lg p-4 rounded-xl mb-4"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`
              }}
            >
              <p 
                className="font-medium text-center"
                style={{ color: isDark ? '#fff' : '#111' }}
              >
                {currentPuzzle.question}
              </p>
            </div>

            {/* Options */}
            <div className="w-full max-w-lg space-y-2 mb-6">
              {currentPuzzle.options.map((option, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectOption = idx === currentPuzzle.correct;
                const showResult = isCorrect !== null;
                
                let bgColor, borderColor, textColor;
                
                if (showResult && isSelected && isCorrect) {
                  bgColor = isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.15)';
                  borderColor = 'rgba(34, 197, 94, 0.5)';
                  textColor = 'rgb(34, 197, 94)';
                } else if (showResult && isSelected && !isCorrect) {
                  bgColor = isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)';
                  borderColor = 'rgba(239, 68, 68, 0.4)';
                  textColor = 'rgb(239, 68, 68)';
                } else if (showResult && isCorrectOption) {
                  bgColor = isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)';
                  borderColor = 'rgba(34, 197, 94, 0.3)';
                  textColor = 'rgb(34, 197, 94)';
                } else {
                  bgColor = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)';
                  borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
                  textColor = isDark ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)';
                }
                
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={isCorrect !== null}
                    data-testid={`option-${idx}`}
                    className="w-full px-4 py-3 rounded-xl text-left transition-all duration-200"
                    style={{
                      backgroundColor: bgColor,
                      border: `2px solid ${borderColor}`,
                      color: textColor,
                      cursor: isCorrect !== null ? 'default' : 'pointer',
                      transform: isSelected ? 'scale(1.01)' : 'scale(1)'
                    }}
                  >
                    <span className="font-medium mr-3" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            {/* Feedback Message */}
            <div className="min-h-[60px] mb-4 text-center">
              {isCorrect === true && (
                <div 
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ 
                    backgroundColor: isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.1)',
                    color: 'rgb(34, 197, 94)'
                  }}
                >
                  <Check size={18} />
                  <span className="font-medium">Great thinking!</span>
                </div>
              )}
              {isCorrect === false && (
                <div 
                  className="text-center"
                  style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
                >
                  <p className="text-sm">Not quite — the answer is highlighted</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isCorrect === false && (
                <button
                  onClick={handleTryAgain}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                  }}
                >
                  <RotateCcw size={16} />
                  <span>Try again</span>
                </button>
              )}
              
              {isCorrect !== null && currentPuzzleIndex < totalPuzzlesInLevel - 1 && (
                <button
                  onClick={handleNextPuzzle}
                  data-testid="next-puzzle-btn"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: 'rgba(147, 51, 234, 0.15)',
                    color: 'rgb(167, 139, 250)',
                    border: '1px solid rgba(147, 51, 234, 0.3)'
                  }}
                >
                  <span>Next puzzle</span>
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </>
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
            Think carefully. There's no timer.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LogicPuzzlesGame;
