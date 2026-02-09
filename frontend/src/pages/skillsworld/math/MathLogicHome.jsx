import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowLeft, Calculator, ArrowRight } from 'lucide-react';

/**
 * Math & Logic Hub
 * 
 * CANONICAL CONSTRAINTS:
 * - Guest-first (no account required)
 * - No pressure, no competition
 * - Age guidance is subtle but visible
 */
const MathLogicHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Available activities
  const activities = [
    {
      id: 'number-paths',
      title: 'Number Paths',
      description: 'Step from start to target using addition and subtraction. Watch your total change with each step.',
      ageGuide: 'Ages 5–8+',
      path: '/skillsworld/math/number-paths',
      status: 'active',
      difficulty: 'Beginner',
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400'
    },
    {
      id: 'shape-patterns',
      title: 'Shape Patterns',
      description: 'Recognize and continue visual patterns with shapes and colors.',
      ageGuide: 'Ages 4–7+',
      path: null,
      status: 'coming-soon',
      difficulty: 'Beginner',
      color: 'from-purple-500/10 to-pink-500/10',
      iconColor: 'text-gray-500'
    },
    {
      id: 'number-bonds',
      title: 'Number Bonds',
      description: 'Explore how numbers combine to make other numbers.',
      ageGuide: 'Ages 5–9+',
      path: null,
      status: 'coming-soon',
      difficulty: 'Beginner',
      color: 'from-emerald-500/10 to-teal-500/10',
      iconColor: 'text-gray-500'
    }
  ];

  return (
    <div 
      className="min-h-screen"
      style={{ 
        backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
        color: isDark ? '#e5e5e5' : '#1a1a1a'
      }}
    >
      {/* Header */}
      <header 
        className="sticky top-0 z-50 border-b"
        style={{ 
          backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/skillsworld')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
            style={{
              color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <ArrowLeft size={20} />
            <span className="text-sm">Skills World</span>
          </button>
          
          <div className="flex-1 flex items-center gap-3">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }}
            >
              <Calculator size={18} className="text-blue-400" />
            </div>
            <h1 
              className="text-xl font-semibold"
              style={{ color: isDark ? '#fff' : '#111' }}
            >
              Math & Logic
            </h1>
          </div>

          {/* User status */}
          {user ? (
            <span 
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
              }}
            >
              Signed in
            </span>
          ) : (
            <span 
              className="text-xs px-3 py-1.5 rounded-full"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
              }}
            >
              Guest
            </span>
          )}
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-12 text-center">
        <h2 
          className="text-2xl sm:text-3xl font-bold mb-4"
          style={{ color: isDark ? '#fff' : '#111' }}
        >
          Build number sense through calm practice
        </h2>
        <p 
          className="text-base max-w-xl mx-auto"
          style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
        >
          Choose an activity below. There's no wrong order — explore what interests you.
        </p>
      </section>

      {/* Activities Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((activity) => {
            const isActive = activity.status === 'active';
            
            const cardContent = (
              <div 
                className={`relative rounded-2xl p-6 h-full transition-all duration-300 ${
                  isActive ? 'cursor-pointer' : 'cursor-default'
                }`}
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  opacity: isActive ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (isActive) {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.3)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {/* Status badge */}
                {!isActive && (
                  <span 
                    className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)'
                    }}
                  >
                    Coming Soon
                  </span>
                )}

                {/* Age guide (subtle) */}
                <div className="flex items-center gap-2 mb-4">
                  <span 
                    className="text-xs px-2 py-1 rounded"
                    style={{ 
                      backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
                      color: isDark ? 'rgb(147, 197, 253)' : 'rgb(59, 130, 246)'
                    }}
                  >
                    {activity.ageGuide}
                  </span>
                  <span 
                    className="text-xs"
                    style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}
                  >
                    {activity.difficulty}
                  </span>
                </div>

                {/* Title */}
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ color: isDark ? '#fff' : '#111' }}
                >
                  {activity.title}
                </h4>

                {/* Description */}
                <p 
                  className="text-sm leading-relaxed mb-4"
                  style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
                >
                  {activity.description}
                </p>

                {/* CTA */}
                {isActive && (
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-400">
                    <span>Start activity</span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            );

            return isActive ? (
              <Link key={activity.id} to={activity.path} className="block">
                {cardContent}
              </Link>
            ) : (
              <div key={activity.id}>
                {cardContent}
              </div>
            );
          })}
        </div>

        {/* Age guidance note */}
        <p 
          className="text-center text-xs mt-8"
          style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}
        >
          Age is a guide, not a gate.
        </p>
      </section>

      {/* Footer */}
      <footer 
        className="border-t py-8"
        style={{ 
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'
        }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p 
            className="text-sm"
            style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
          >
            Math & Logic — Skills World
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MathLogicHome;
