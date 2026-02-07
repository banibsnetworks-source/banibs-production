import React from 'react';

/**
 * CirclesIcon - Custom icon for BANIBS Circles
 * 
 * Represents:
 * - Multiple circles / overlapping membership
 * - Connected communities
 * - Shared space without hierarchy
 * - Plurality, not singular focus
 * 
 * Visual: Two overlapping circle outlines (Venn-style)
 */
export const CirclesIcon = ({ 
  size = 24, 
  className = '', 
  strokeWidth = 2,
  color = 'currentColor',
  ...props 
}) => {
  // TEMPORARY TEST: Red color and thick stroke to verify deployment
  const testColor = '#FF0000';  // BRIGHT RED for visibility test
  const testStrokeWidth = 3;    // Thicker stroke
  
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={testColor}
      strokeWidth={testStrokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Left circle */}
      <circle cx="9" cy="12" r="6" />
      {/* Right circle - overlapping */}
      <circle cx="15" cy="12" r="6" />
    </svg>
  );
};

/**
 * CirclesIconAlt - Alternative with three connected circles
 * 
 * Visual: Three circles in a triangular arrangement, touching
 */
export const CirclesIconTriple = ({ 
  size = 24, 
  className = '', 
  strokeWidth = 2,
  color = 'currentColor',
  ...props 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Top circle */}
      <circle cx="12" cy="7" r="5" />
      {/* Bottom-left circle */}
      <circle cx="7" cy="16" r="5" />
      {/* Bottom-right circle */}
      <circle cx="17" cy="16" r="5" />
    </svg>
  );
};

/**
 * CirclesIconConcentric - Circles within circles
 * 
 * Visual: Concentric rings representing layers of community
 */
export const CirclesIconConcentric = ({ 
  size = 24, 
  className = '', 
  strokeWidth = 2,
  color = 'currentColor',
  ...props 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* Outer circle */}
      <circle cx="12" cy="12" r="10" />
      {/* Middle circle */}
      <circle cx="12" cy="12" r="6" />
      {/* Inner circle */}
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
};

export default CirclesIcon;
