import React from 'react';
import { MapPin, Phone, Globe, ExternalLink } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const BeautyProviderCard = ({ provider }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const typeColors = {
    hair: '#EC4899',
    skincare: '#10B981',
    lashes: '#8B5CF6',
    nails: '#F59E0B',
    barber: '#3B82F6',
    shop: '#EF4444'
  };
  
  const typeColor = typeColors[provider.type] || '#6B7280';
  
  return (
    <div
      className="p-6 rounded-lg border bg-card"
      style={{
        borderColor: isDark ? 'rgba(229, 231, 235, 0.1)' : '#E5E7EB'
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {provider.name}
          </h3>
          <span 
            className="inline-block px-2 py-1 rounded text-xs font-medium"
            style={{
              background: isDark ? `${typeColor}20` : `${typeColor}15`,
              color: typeColor
            }}
          >
            {provider.type.charAt(0).toUpperCase() + provider.type.slice(1)}
          </span>
        </div>
      </div>
      
      {provider.description && (
        <p className="text-sm text-muted-foreground mb-4">
          {provider.description}
        </p>
      )}
      
      <div className="space-y-2 text-sm">
        {provider.owner_name && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium">Owner:</span> {provider.owner_name}
          </div>
        )}
        
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin size={14} />
          {provider.location}
        </div>
        
        {provider.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone size={14} />
            {provider.phone}
          </div>
        )}
        
        {provider.website && (
          <a
            href={provider.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-pink-500 hover:underline"
          >
            <Globe size={14} />
            Visit Website
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};

export default BeautyProviderCard;