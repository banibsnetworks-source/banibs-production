import React from 'react';
import { useAccountMode } from '../../contexts/AccountModeContext';

/**
 * ThemeButton - Theme-aware button component
 * Automatically adapts to Social (blue) or Connect (gold) theme
 * 
 * Variants:
 * - primary: Main theme color
 * - secondary: Muted theme color
 * - outline: Outlined with theme color
 */

const ThemeButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const { currentTheme } = useAccountMode();
  
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };
  
  const variantClasses = {
    primary: currentTheme === 'connect'
      ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-600 focus:ring-yellow-500'
      : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-600',
    secondary: currentTheme === 'connect'
      ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-300 hover:bg-yellow-200 dark:hover:bg-yellow-900/30'
      : 'bg-blue-100 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/30',
    outline: currentTheme === 'connect'
      ? 'border-2 border-yellow-500 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/10'
      : 'border-2 border-blue-600 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
  };
  
  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default ThemeButton;
