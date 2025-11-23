import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Globe, MapPin, BookHeart, Building2, GraduationCap, User } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * DiasporaLeftRail - Phase 12.0
 * Navigation rail for Diaspora Connect Portal
 */
const DiasporaLeftRail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const navItems = [
    {
      icon: Globe,
      label: 'Diaspora Home',
      path: '/portal/diaspora',
      description: 'Portal overview'
    },
    {
      icon: MapPin,
      label: 'Regions & Hubs',
      path: '/portal/diaspora/regions',
      description: 'Global Black communities'
    },
    {
      icon: BookHeart,
      label: 'Stories & Journeys',
      path: '/portal/diaspora/stories',
      description: 'Personal narratives'
    },
    {
      icon: Building2,
      label: 'Business Directory',
      path: '/portal/diaspora/businesses',
      description: 'Diaspora enterprises'
    },
    {
      icon: GraduationCap,
      label: 'Learn the Diaspora',
      path: '/portal/diaspora/learn',
      description: 'Educational resources'
    },
    {
      icon: User,
      label: 'My Snapshot',
      path: '/portal/diaspora/snapshot',
      description: 'Your diaspora context'
    }
  ];
  
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: isDark ? 'rgba(180, 130, 50, 0.05)' : 'rgba(180, 130, 50, 0.03)',
        border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)'}`,
      }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          🌍 Diaspora Connect
        </h3>
        <p className="text-xs text-muted-foreground">
          One People. Many Homes.
        </p>
      </div>
      
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`
                w-full flex items-start gap-3 px-3 py-2.5 rounded-lg
                transition-all duration-200 text-left
                ${
                  isActive
                    ? isDark
                      ? 'bg-amber-900/20 border border-amber-700/30'
                      : 'bg-amber-50 border border-amber-200'
                    : isDark
                      ? 'hover:bg-white/5 border border-transparent'
                      : 'hover:bg-amber-50/50 border border-transparent'
                }
              `}
            >
              <Icon
                size={18}
                className={isActive ? 'text-amber-600' : 'text-muted-foreground'}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`
                    text-sm font-medium
                    ${isActive ? 'text-amber-600 dark:text-amber-500' : 'text-foreground'}
                  `}
                >
                  {item.label}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {item.description}
                </div>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DiasporaLeftRail;
