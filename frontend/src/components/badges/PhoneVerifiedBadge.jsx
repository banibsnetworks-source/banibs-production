import React from 'react';
import { CheckCircle, Phone } from 'lucide-react';

/**
 * PhoneVerifiedBadge - Displays a "Phone Verified" badge
 * 
 * Usage:
 * - Marketplace listings (seller info)
 * - Messaging UI (sender info)
 * - User profiles (optional)
 * 
 * Props:
 * - size: 'sm' | 'md' (default: 'sm')
 * - showLabel: boolean (default: true)
 * - className: additional classes
 */
const PhoneVerifiedBadge = ({ 
  size = 'sm', 
  showLabel = true,
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1'
  };
  
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';
  
  return (
    <span 
      className={`
        inline-flex items-center gap-1 
        bg-green-500/10 text-green-400 
        rounded-full font-medium
        ${sizeClasses[size]}
        ${className}
      `}
      title="This user has verified their phone number"
      data-testid="phone-verified-badge"
    >
      <CheckCircle className={iconSize} />
      {showLabel && <span>Verified</span>}
    </span>
  );
};

export default PhoneVerifiedBadge;
