import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { ArrowLeft, BookOpen, ArrowRight } from 'lucide-react';

/**
 * Reading & Words Hub
 * 
 * CANONICAL CONSTRAINTS:
 * - Guest-first (no account required)
 * - No pressure, no competition
 * - Calm-tech posture throughout
 * - No pronunciation audio in v1.0
 */
const ReadingWordsHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Available activities
  const activities = [
    {
      id: 'word-explorer',
      title: 'Word Explorer',
      description: 'Build vocabulary by matching words to their meanings. No rush, just discovery.',
      ageGuide: 'Ages 4-8+',
      path: '/skillsworld/reading/word-explorer',
      status: 'active',
      difficulty: 'Beginner',
      color: 'from-emerald-500/20 to-teal-500/20',
      iconColor: 'text-emerald-400'
    },
    {
      id: 'story-paths',
      title: 'Story Paths',
      description: 'Read short passages and show what you understood. Take your time.',
      ageGuide: 'Ages 5-9+',
      path: '/skillsworld/reading/story-paths',
      status: 'active',
      difficulty: 'Beginner',
      color: 'from-blue-500/20 to-cyan-500/20',
      iconColor: 'text-blue-400'
    },
    {
      id: 'letter-sounds',
      title: 'Letter Sounds',
      description: 'Connect letters to the sounds they make. A gentle start to reading.',
      ageGuide: 'Ages 4-6+',
      path: '/skillsworld/reading/letter-sounds',
      status: 'active',
      difficulty: 'Beginner',
      color: 'from-amber-500/20 to-orange-500/20',
      iconColor: 'text-amber-400'
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
            data-testid="back-to-skillsworld"
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
              style={{ backgroundColor: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' }}
            >
              <BookOpen size={18} className="text-emerald-400" />
            </div>
            <h1 
              className="text-xl font-semibold"
              style={{ color: isDark ? '#fff' : '#111' }}
            >
              Reading & Words
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
          Explore words at your own pace
        </h2>
        <p 
          className="text-base max-w-xl mx-auto mb-6"
          style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
        >
          No timers. No pressure. Just words.
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
                data-testid={`activity-card-${activity.id}`}
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                  opacity: isActive ? 1 : 0.6
                }}
                onMouseEnter={(e) => {
                  if (isActive) {
                    e.currentTarget.style.borderColor = isDark ? 'rgba(16, 185, 129, 0.3)' : 'rgba(16, 185, 129, 0.3)';
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
                      backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
                      color: isDark ? 'rgb(110, 231, 183)' : 'rgb(5, 150, 105)'
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
                  <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
                    <span>Start activity</span>
                    <ArrowRight size={16} />
                  </div>
                )}
              </div>
            );

            return isActive ? (
              <Link key={activity.id} to={activity.path} className="block" data-testid={`activity-link-${activity.id}`}>
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
            Reading & Words — Skills World
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ReadingWordsHome;
