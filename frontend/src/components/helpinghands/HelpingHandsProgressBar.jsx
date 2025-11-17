import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * HelpingHandsProgressBar - Phase 10.0
 * Visual progress bar showing campaign fundraising progress
 */
const HelpingHandsProgressBar = ({ raised, goal, showAmounts = true }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Calculate percentage
  const percentage = goal && goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const isGoalMet = goal && raised >= goal;
  
  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div 
        className="relative w-full h-3 rounded-full overflow-hidden"
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        }}
      >
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            background: isGoalMet 
              ? 'linear-gradient(90deg, #22C55E 0%, #16A34A 100%)'
              : 'linear-gradient(90deg, #E8B657 0%, #D4A446 100%)',
            boxShadow: isGoalMet
              ? '0 2px 8px rgba(34, 197, 94, 0.4)'
              : '0 2px 8px rgba(232, 182, 87, 0.4)'
          }}
        />
      </div>
      
      {/* Amounts */}
      {showAmounts && (
        <div 
          className="flex justify-between items-center mt-2 text-sm"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        >
          <span className="font-semibold" style={{ color: isDark ? '#E8B657' : '#D4A446' }}>
            ${raised.toLocaleString()}
          </span>
          {goal && (
            <>
              <span className="text-xs">raised</span>
              <span className="font-medium">
                ${goal.toLocaleString()} goal
              </span>
            </>
          )}
          {!goal && <span className="text-xs">raised • No fixed goal</span>}
        </div>
      )}
      
      {/* Goal Met Badge */}
      {isGoalMet && (
        <div className="mt-2">
          <span 
            className="inline-block px-3 py-1 rounded-full text-xs font-medium"
            style={{
              background: 'rgba(34, 197, 94, 0.1)',
              color: '#22C55E',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}
          >
            ✓ Goal Met!
          </span>
        </div>
      )}
    </div>
  );
};

export default HelpingHandsProgressBar;
