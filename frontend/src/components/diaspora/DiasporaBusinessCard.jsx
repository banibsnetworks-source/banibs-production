import React from 'react';
import { Building2, Globe, MapPin, ExternalLink } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * DiasporaBusinessCard - Phase 12.0
 * Card component for displaying diaspora businesses
 */
const DiasporaBusinessCard = ({ business }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const typeLabels = {
    tour: 'Tours & Experiences',
    lodging: 'Lodging',
    food: 'Food & Restaurants',
    service: 'Services',
    culture: 'Cultural Centers',
    shop: 'Shops & Retail'
  };
  
  return (
    <div
      className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: isDark ? 'rgba(180, 130, 50, 0.06)' : 'rgba(180, 130, 50, 0.04)',
        border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.12)'}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
          }}
        >
          <Building2 size={24} className="text-amber-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Business name */}
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {business.name}
          </h3>
          
          {/* Type badge */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-3"
            style={{
              background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
              color: '#d97706'
            }}
          >
            {typeLabels[business.type] || business.type}
          </div>
          
          {/* Location */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin size={14} className="text-amber-600" />
            <span>{business.city}, {business.country}</span>
            {business.region_name && (
              <span className="text-xs">• {business.region_name}</span>
            )}
          </div>
          
          {/* Description */}
          {business.description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {business.description}
            </p>
          )}
          
          {/* Website link */}
          {business.website && (
            <a
              href={business.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 transition-colors"
            >
              <Globe size={14} />
              Visit Website
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiasporaBusinessCard;
