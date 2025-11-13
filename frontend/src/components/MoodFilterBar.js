import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

/**
 * MoodFilterBar - Phase 7.6.5 + Theme Support
 * Allows users to filter news by sentiment/mood
 * Buttons: 🟢 Positive | ⚪ Neutral | 🔴 Negative | 🔁 All
 * Now fully theme-aware for light and dark modes
 */
const MoodFilterBar = ({ activeMood, onMoodChange, itemCount }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const moods = [
    { id: 'all', label: 'All Stories', icon: '🔁', color: 'gray' },
    { id: 'positive', label: 'Positive', icon: '🟢', color: 'green' },
    { id: 'neutral', label: 'Neutral', icon: '⚪', color: 'gray' },
    { id: 'negative', label: 'Negative', icon: '🔴', color: 'red' },
  ];

  const getButtonClasses = (mood) => {
    const isActive = activeMood === mood.id;
    
    const baseClasses = 'flex items-center space-x-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200';
    
    if (isActive) {
      if (mood.color === 'green') {
        return `${baseClasses} bg-green-500 text-white shadow-lg shadow-green-500/30`;
      } else if (mood.color === 'red') {
        return `${baseClasses} bg-red-500 text-white shadow-lg shadow-red-500/30`;
      } else {
        return `${baseClasses} bg-muted text-foreground shadow-lg border border-border`;
      }
    }
    
    return `${baseClasses} bg-background text-muted-foreground hover:bg-muted hover:text-foreground border border-input`;
  };

  return (
    <div className={`backdrop-blur-md rounded-xl border border-border p-4 mb-6 shadow-sm ${
      isDark ? 'bg-gray-900/50' : 'bg-white/90'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-lg">🎭</span>
          </div>
          <h3 className="text-foreground font-bold text-sm">Filter by Mood</h3>
        </div>
        {itemCount !== undefined && (
          <span className="text-xs text-muted-foreground">
            {itemCount} {itemCount === 1 ? 'story' : 'stories'}
          </span>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onMoodChange(mood.id)}
            className={getButtonClasses(mood)}
          >
            <span className="text-lg">{mood.icon}</span>
            <span>{mood.label}</span>
          </button>
        ))}
      </div>

      {/* Helper Text */}
      {activeMood !== 'all' && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground flex items-center space-x-2">
            <RefreshCw size={12} />
            <span>
              Showing {activeMood} stories only. Click "All Stories" to see everything.
            </span>
          </p>
        </div>
      )}
    </div>
  );
};

export default MoodFilterBar;
