import React from 'react';
import SocialLayout from '../../components/social/SocialLayout';
import { Users } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const SocialDiscoverPeoplePage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <SocialLayout>
      <div 
        className="flex items-center justify-center min-h-screen"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'
        }}
      >
        <div className="text-center px-4 max-w-md">
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
            <Users 
              size={56} 
              style={{ color: isDark ? '#E8B657' : '#D4A446' }}
              strokeWidth={1.5}
            />
          </div>
          <h1 
            className="text-3xl font-bold mb-3"
            style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
          >
            Discover People
          </h1>
          <p 
            className="text-lg mb-8"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            Find and connect with people in the BANIBS community.
          </p>
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
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </SocialLayout>
  );
};

export default SocialDiscoverPeoplePage;
