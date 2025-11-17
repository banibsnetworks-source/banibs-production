import React, { useState } from 'react';
import { Heart, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * HelpingHandsSupportButton - Phase 10.0
 * Primary action button to support a campaign
 */
const HelpingHandsSupportButton = ({ campaignId, onSupport, disabled = false, size = 'large' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [loading, setLoading] = useState(false);
  
  const handleClick = async () => {
    if (disabled || loading) return;
    
    setLoading(true);
    try {
      await onSupport();
    } finally {
      setLoading(false);
    }
  };
  
  const sizeClasses = {
    small: 'px-4 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 rounded-lg font-semibold transition-all ${sizeClasses[size]}`}
      style={{
        background: disabled 
          ? 'rgba(156, 163, 175, 0.3)'
          : 'linear-gradient(135deg, #E8B657 0%, #D4A446 100%)',
        color: disabled ? '#9CA3AF' : '#0a0a0a',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled 
          ? 'none'
          : isDark
            ? '0 4px 12px rgba(232, 182, 87, 0.3)'
            : '0 4px 12px rgba(232, 182, 87, 0.4)',
        opacity: loading ? 0.8 : 1
      }}
      onMouseEnter={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = isDark
            ? '0 6px 16px rgba(232, 182, 87, 0.4)'
            : '0 6px 16px rgba(232, 182, 87, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = isDark
            ? '0 4px 12px rgba(232, 182, 87, 0.3)'
            : '0 4px 12px rgba(232, 182, 87, 0.4)';
        }
      }}
    >
      {loading ? (
        <>
          <Loader2 size={size === 'large' ? 24 : size === 'medium' ? 20 : 16} className="animate-spin" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          <Heart size={size === 'large' ? 24 : size === 'medium' ? 20 : 16} fill="currentColor" />
          <span>Support This Campaign</span>
        </>
      )}
    </button>
  );
};

export default HelpingHandsSupportButton;
