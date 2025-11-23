import React from 'react';
import { MapPin, Globe, ExternalLink } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const FashionBrandCard = ({ brand }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const typeColors = { sneaker: '#3B82F6', clothing: '#10B981', designer: '#8B5CF6', boutique: '#F59E0B', customizer: '#EC4899' };
  const typeColor = typeColors[brand.type] || '#6B7280';
  
  return (
    <div className="p-6 rounded-lg border bg-card" style={{ borderColor: isDark ? 'rgba(229, 231, 235, 0.1)' : '#E5E7EB' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">{brand.name}</h3>
          <span className="inline-block px-2 py-1 rounded text-xs font-medium" style={{ background: isDark ? `${typeColor}20` : `${typeColor}15`, color: typeColor }}>
            {brand.type.charAt(0).toUpperCase() + brand.type.slice(1)}
          </span>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{brand.description}</p>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={14} />{brand.city ? `${brand.city}, ` : ''}{brand.country}</div>
        {brand.website && (
          <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline">
            <Globe size={14} />Visit Website<ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};

export default FashionBrandCard;