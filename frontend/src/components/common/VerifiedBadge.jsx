import React, { useState } from 'react';
import { Shield, Check } from 'lucide-react';

/**
 * Verified Badge Component - Phase 1A
 * Gold/premium checkmark badge for verified businesses
 * Shows verification date on hover
 */
const VerifiedBadge = ({ verifiedAt, size = 'md', showLabel = false, className = '' }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const iconSizeClasses = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4'
  };

  const formattedDate = verifiedAt 
    ? new Date(verifiedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div 
        className="relative inline-block"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {/* Gold Verified Badge */}
        <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center shadow-lg`}>
          <Check className={`${iconSizeClasses[size]} text-gray-900 font-bold`} strokeWidth={3} />
        </div>

        {/* Tooltip on Hover */}
        {showTooltip && verifiedAt && (
          <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-gray-700">
              <div className="font-semibold mb-1">✓ Verified Business</div>
              <div className="text-gray-300">Verified: {formattedDate}</div>
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        )}
      </div>

      {/* Optional Label */}
      {showLabel && (
        <span className="text-xs font-semibold text-yellow-600">
          Verified
        </span>
      )}
    </div>
  );
};

export default VerifiedBadge;
