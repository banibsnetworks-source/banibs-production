import React from 'react';
import { MapPin, Globe } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * DiasporaRegionCard - Phase 12.0
 * Card component for displaying diaspora regions
 */
const DiasporaRegionCard = ({ region }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div
      className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      style={{
        background: isDark ? 'rgba(180, 130, 50, 0.08)' : 'rgba(180, 130, 50, 0.05)',
        border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.2)' : 'rgba(180, 130, 50, 0.15)'}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
          }}
        >
          <Globe size={24} className="text-amber-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {region.name}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {region.description}
          </p>
          
          {region.highlight_cities && region.highlight_cities.length > 0 && (
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-muted-foreground">
                {region.highlight_cities.slice(0, 4).join(' • ')}
                {region.highlight_cities.length > 4 && ' ...'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiasporaRegionCard;
