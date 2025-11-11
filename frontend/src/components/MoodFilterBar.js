import React from 'react';
import { RefreshCw } from 'lucide-react';

/**
 * MoodFilterBar - Phase 7.6.5
 * Allows users to filter news by sentiment/mood
 * Buttons: 🟢 Positive | ⚪ Neutral | 🔴 Negative | 🔁 All
 */
const MoodFilterBar = ({ activeMood, onMoodChange, itemCount }) => {
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
        return `${baseClasses} bg-gray-700 text-white shadow-lg`;
      }
    }
    
    return `${baseClasses} bg-gray-800/40 text-gray-300 hover:bg-gray-700 hover:text-white border border-gray-700`;
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-xl border border-gray-800 p-4 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <span className="text-lg">🎭</span>
          </div>
          <h3 className="text-white font-bold text-sm">Filter by Mood</h3>
        </div>
        {itemCount !== undefined && (
          <span className="text-xs text-gray-400">
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
        <div className="mt-3 pt-3 border-t border-gray-800">
          <p className="text-xs text-gray-400 flex items-center space-x-2">
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
