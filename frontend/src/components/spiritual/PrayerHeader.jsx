import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * PrayerHeader - Phase 11.0
 * Header for prayer room pages
 */
const PrayerHeader = ({ room, onBack }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className="mb-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
      >
        <ArrowLeft size={16} />
        Back to Lobby
      </button>
      
      <div 
        className="p-6 rounded-lg border"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(167, 139, 250, 0.05))'
            : 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(167, 139, 250, 0.02))',
          borderColor: isDark ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.2)'
        }}
      >
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          {room.name}
        </h1>
        <p className="text-muted-foreground">
          {room.description}
        </p>
      </div>
    </div>
  );
};

export default PrayerHeader;