/**
 * Standardized Theme Styles - BANIBS Social Standard
 * Use these utility functions to ensure consistent theming across all pages
 */

export const getThemeStyles = (isDark) => ({
  // Page backgrounds
  page: {
    backgroundColor: isDark ? 'rgb(10, 10, 12)' : 'rgb(255, 255, 255)'
  },
  
  pageSecondary: {
    backgroundColor: isDark ? 'rgb(17, 24, 39)' : 'rgb(249, 250, 251)'
  },
  
  // Text colors
  textPrimary: {
    color: isDark ? 'rgb(255, 255, 255)' : 'rgb(17, 24, 39)'
  },
  
  textSecondary: {
    color: isDark ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'
  },
  
  textTertiary: {
    color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
  },
  
  // Cards
  card: {
    backgroundColor: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
    borderRadius: '16px'
  },
  
  // Glass effect
  glass: {
    backgroundColor: isDark ? 'rgba(10, 10, 12, 0.85)' : 'rgba(255, 255, 255, 0.9)',
    backdropFilter: 'blur(12px)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
    borderRadius: '16px'
  },
  
  // Input fields
  input: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
    color: isDark ? 'rgb(255, 255, 255)' : 'rgb(17, 24, 39)'
  },
  
  // Buttons
  buttonPrimary: {
    backgroundColor: 'rgb(232, 182, 87)',
    color: 'rgb(17, 24, 39)',
    fontWeight: 'bold'
  },
  
  buttonSecondary: {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    color: isDark ? 'rgb(255, 255, 255)' : 'rgb(17, 24, 39)'
  },
  
  // Borders
  border: {
    borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
  },
  
  borderSubtle: {
    borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'
  }
});

// Hero gradient styles for different sections
export const getHeroGradient = (isDark, color = 'blue') => {
  const gradients = {
    blue: {
      dark: 'linear-gradient(to bottom right, rgb(30, 58, 138), rgb(17, 24, 39))',
      light: 'linear-gradient(to bottom right, rgb(147, 197, 253), rgb(219, 234, 254))'
    },
    yellow: {
      dark: 'linear-gradient(to bottom right, rgb(113, 63, 18), rgb(17, 24, 39))',
      light: 'linear-gradient(to bottom right, rgb(254, 243, 199), rgb(253, 230, 138))'
    },
    red: {
      dark: 'linear-gradient(to bottom right, rgb(127, 29, 29), rgb(17, 24, 39))',
      light: 'linear-gradient(to bottom right, rgb(254, 202, 202), rgb(252, 165, 165))'
    },
    green: {
      dark: 'linear-gradient(to bottom right, rgb(6, 78, 59), rgb(17, 24, 39))',
      light: 'linear-gradient(to bottom right, rgb(167, 243, 208), rgb(134, 239, 172))'
    }
  };
  
  return {
    background: isDark ? gradients[color].dark : gradients[color].light
  };
};
