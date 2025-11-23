import React from 'react';
import { MapPin, ArrowRight, Heart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * DiasporaSnapshotSummary - Phase 12.0
 * Component for displaying user's diaspora snapshot summary
 */
const DiasporaSnapshotSummary = ({ snapshot }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  if (!snapshot) {
    return null;
  }
  
  return (
    <div
      className="rounded-xl p-6"
      style={{
        background: isDark ? 'rgba(180, 130, 50, 0.08)' : 'rgba(180, 130, 50, 0.05)',
        border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.2)' : 'rgba(180, 130, 50, 0.15)'}`,
      }}
    >
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
          }}
        >
          <MapPin size={24} className="text-amber-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">Your Diaspora Snapshot</h3>
          <p className="text-sm text-muted-foreground">Your unique journey</p>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Current Region */}
        {snapshot.current_region_name && (
          <div className="flex items-start gap-3">
            <MapPin size={18} className="text-amber-600 mt-1 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-foreground mb-1">Where I Am Now</div>
              <div className="text-base text-foreground font-semibold">{snapshot.current_region_name}</div>
            </div>
          </div>
        )}
        
        {/* Origin Region */}
        {snapshot.origin_region_name && (
          <>
            <div className="flex justify-center">
              <ArrowRight size={18} className="text-muted-foreground" />
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground mb-1">Where My People Come From</div>
                <div className="text-base text-foreground font-semibold">{snapshot.origin_region_name}</div>
              </div>
            </div>
          </>
        )}
        
        {/* Aspiration Region */}
        {snapshot.aspiration_region_name && (
          <>
            <div className="flex justify-center">
              <Heart size={18} className="text-amber-600" />
            </div>
            <div className="flex items-start gap-3">
              <MapPin size={18} className="text-amber-600 mt-1 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-foreground mb-1">Where I'd Like to Visit or Live</div>
                <div className="text-base text-foreground font-semibold">{snapshot.aspiration_region_name}</div>
              </div>
            </div>
          </>
        )}
      </div>
      
      {/* Encouragement message */}
      <div
        className="mt-6 p-4 rounded-lg"
        style={{
          background: isDark ? 'rgba(180, 130, 50, 0.1)' : 'rgba(180, 130, 50, 0.08)',
        }}
      >
        <p className="text-sm text-foreground text-center italic">
          "Your journey is part of the greater diaspora story. Thank you for sharing your connection." 🌍
        </p>
      </div>
    </div>
  );
};

export default DiasporaSnapshotSummary;
