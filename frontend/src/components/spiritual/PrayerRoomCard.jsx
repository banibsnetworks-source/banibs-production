import React from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * PrayerRoomCard - Phase 11.0
 * Card component for prayer room selection
 */
const PrayerRoomCard = ({ room, onClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-6 rounded-lg border transition-all hover:shadow-lg"
      style={{
        background: isDark ? '#1A1A1A' : '#FFFFFF',
        borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : '#E5E7EB',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#8B5CF6';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(139, 92, 246, 0.2)' : '#E5E7EB';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-2 text-foreground">
            {room.name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {room.description}
          </p>
        </div>
        <ChevronRight size={20} className="text-purple-500 flex-shrink-0 ml-4" />
      </div>
    </button>
  );
};

export default PrayerRoomCard;