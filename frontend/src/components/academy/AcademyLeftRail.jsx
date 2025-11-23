import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Users, Lightbulb, BookMarked, Award, Home } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * AcademyLeftRail - Phase 13.0
 * Navigation rail for BANIBS Academy
 */
const AcademyLeftRail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const navItems = [
    {
      icon: Home,
      label: 'Academy Home',
      path: '/portal/academy',
      description: 'Portal overview'
    },
    {
      icon: BookOpen,
      label: 'Learning Tracks',
      path: '/portal/academy/courses',
      description: 'Structured courses'
    },
    {
      icon: Users,
      label: 'Mentorship',
      path: '/portal/academy/mentorship',
      description: 'Find your mentor'
    },
    {
      icon: Lightbulb,
      label: 'Life Skills',
      path: '/portal/academy/lifeskills',
      description: 'Practical wisdom'
    },
    {
      icon: BookMarked,
      label: 'Black History',
      path: '/portal/academy/history',
      description: 'Master lessons'
    },
    {
      icon: Award,
      label: 'Opportunities',
      path: '/portal/academy/opportunities',
      description: 'Scholarships & more'
    }
  ];
  
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: isDark ? 'rgba(59, 130, 246, 0.05)' : 'rgba(59, 130, 246, 0.03)',
        border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)'}`,
      }}
    >
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">
          🎓 BANIBS Academy
        </h3>
        <p className="text-xs text-muted-foreground">
          Your Education. Your Power.
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
                      ? 'bg-blue-900/20 border border-blue-700/30'
                      : 'bg-blue-50 border border-blue-200'
                    : isDark
                      ? 'hover:bg-white/5 border border-transparent'
                      : 'hover:bg-blue-50/50 border border-transparent'
                }
              `}
            >
              <Icon
                size={18}
                className={isActive ? 'text-blue-600 dark:text-blue-400' : 'text-muted-foreground'}
              />
              <div className="flex-1 min-w-0">
                <div
                  className={`
                    text-sm font-medium
                    ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-foreground'}
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

export default AcademyLeftRail;
