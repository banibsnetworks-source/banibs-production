import React from 'react';

/**
 * Get initials from a name
 * @param {string} name - Full name
 * @returns {string} - Initials (max 2 characters)
 */
function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  
  const trimmed = name.trim();
  if (!trimmed) return '?';
  
  const parts = trimmed.split(' ').filter(p => p.length > 0);
  
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0][0].toUpperCase();
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * ProfileAvatar - Displays user avatar with initials fallback
 * 
 * @param {Object} props
 * @param {string} props.name - User's display name
 * @param {string} props.avatarUrl - Profile picture URL (optional)
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg', 'xl' (default: 'md')
 * @param {string} props.className - Additional CSS classes
 */
export function ProfileAvatar({ name, avatarUrl, size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-12 w-12 text-sm',
    lg: 'h-16 w-16 text-lg',
    xl: 'h-24 w-24 text-2xl'
  };
  
  const sizeClass = sizeClasses[size] || sizeClasses.md;
  
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'User avatar'}
        className={`${sizeClass} rounded-full object-cover border-2 border-gray-700 ${className}`}
      />
    );
  }
  
  return (
    <div 
      className={`${sizeClass} rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center font-bold text-black shadow-lg ${className}`}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

export default ProfileAvatar;
