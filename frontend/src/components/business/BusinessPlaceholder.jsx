import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * BusinessPlaceholder - Phase 8.4
 * Reusable placeholder component for Business Mode features under development
 * Now supports contextual imagery for a more polished look
 */
const BusinessPlaceholder = ({ 
  title = 'Coming Soon',
  description = 'This feature is currently under development and will be available soon.',
  icon: Icon = Construction,
  showBackButton = true,
  imageSrc = null // Optional: path to contextual image (e.g., '/images/business/placeholders/analytics.jpg')
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div 
      className="flex items-center justify-center min-h-screen"
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'
      }}
    >
      <div className="text-center px-4 max-w-2xl">
        {/* Contextual Image (if provided) */}
        {imageSrc && (
          <div className="mb-8">
            <img
              src={imageSrc}
              alt={title}
              className="w-full rounded-2xl shadow-2xl"
              style={{
                height: '300px',
                objectFit: 'cover',
                border: `3px solid ${isDark ? 'rgba(232, 182, 87, 0.3)' : 'rgba(232, 182, 87, 0.4)'}`,
                filter: isDark ? 'brightness(0.85)' : 'brightness(0.95)'
              }}
              onError={(e) => {
                // Fallback to icon if image fails to load
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Icon (shown if no image or as fallback) */}
        {!imageSrc && (
          <div 
            className="mx-auto mb-6 rounded-full flex items-center justify-center"
            style={{
              width: '120px',
              height: '120px',
              background: isDark
                ? 'linear-gradient(135deg, rgba(232, 182, 87, 0.1) 0%, rgba(232, 182, 87, 0.05) 100%)'
                : 'linear-gradient(135deg, rgba(232, 182, 87, 0.15) 0%, rgba(232, 182, 87, 0.08) 100%)',
              border: `2px solid ${isDark ? 'rgba(232, 182, 87, 0.3)' : 'rgba(232, 182, 87, 0.4)'}`
            }}
          >
            <Icon 
              size={56} 
              style={{ color: isDark ? '#E8B657' : '#D4A446' }}
              strokeWidth={1.5}
            />
          </div>
        )}

        {/* Title */}
        <h1 
          className="text-3xl font-bold mb-3"
          style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
        >
          {title}
        </h1>

        {/* Description */}
        <p 
          className="text-lg mb-8"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        >
          {description}
        </p>

        {/* Back Button */}
        {showBackButton && (
          <button
            onClick={() => navigate('/portal/business')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, #E8B657 0%, #D4A446 100%)'
                : 'linear-gradient(135deg, #D4A446 0%, #C5943D 100%)',
              color: '#0a0a0a',
              boxShadow: isDark
                ? '0 4px 12px rgba(232, 182, 87, 0.3)'
                : '0 4px 12px rgba(212, 164, 70, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = isDark
                ? '0 6px 16px rgba(232, 182, 87, 0.4)'
                : '0 6px 16px rgba(212, 164, 70, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = isDark
                ? '0 4px 12px rgba(232, 182, 87, 0.3)'
                : '0 4px 12px rgba(212, 164, 70, 0.4)';
            }}
          >
            <ArrowLeft size={20} />
            Back to Business Home
          </button>
        )}

        {/* Coming Soon Badge */}
        <div className="mt-8">
          <span 
            className="inline-block px-4 py-2 rounded-full text-sm font-medium"
            style={{
              background: isDark
                ? 'rgba(232, 182, 87, 0.1)'
                : 'rgba(232, 182, 87, 0.15)',
              color: isDark ? '#E8B657' : '#D4A446',
              border: `1px solid ${isDark ? 'rgba(232, 182, 87, 0.3)' : 'rgba(232, 182, 87, 0.4)'}`
            }}
          >
            Phase 8.4 - Under Development
          </span>
        </div>
      </div>
    </div>
  );
};

export default BusinessPlaceholder;
