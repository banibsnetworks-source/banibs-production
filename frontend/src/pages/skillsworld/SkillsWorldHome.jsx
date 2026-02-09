import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { ArrowLeft, BookOpen, Calculator, Lightbulb, Clock, Trophy, Zap } from 'lucide-react';

/**
 * Skills World Landing Page
 * 
 * CANONICAL CONSTRAINTS:
 * - Guest-first entry (no account required)
 * - No ads, no monetization, no urgency, no rankings, no streaks
 * - Progress is earned through understanding, not time or payment
 * - Pausing/stopping is never punished
 * - Visual style: calm, neutral, not childish
 */
const SkillsWorldHome = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Available skill worlds
  const skillWorlds = [
    {
      id: 'math',
      title: 'Math & Logic',
      description: 'Build number sense and problem-solving through calm, guided practice.',
      icon: Calculator,
      path: '/skillsworld/math',
      status: 'active',
      color: 'from-blue-500/20 to-cyan-500/20',
      borderColor: 'border-blue-500/30',
      iconColor: 'text-blue-400'
    },
    {
      id: 'reading',
      title: 'Reading & Words',
      description: 'Explore letters, sounds, and stories at your own pace.',
      icon: BookOpen,
      path: null,
      status: 'coming-soon',
      color: 'from-emerald-500/10 to-teal-500/10',
      borderColor: 'border-gray-700/30',
      iconColor: 'text-gray-500'
    },
    {
      id: 'thinking',
      title: 'Critical Thinking',
      description: 'Puzzles and patterns that encourage curiosity.',
      icon: Lightbulb,
      path: null,
      status: 'coming-soon',
      color: 'from-amber-500/10 to-orange-500/10',
      borderColor: 'border-gray-700/30',
      iconColor: 'text-gray-500'
    }
  ];

  // What Skills World is NOT
  const notFeatures = [
    { icon: Clock, text: 'No timers or time pressure' },
    { icon: Trophy, text: 'No rankings or leaderboards' },
    { icon: Zap, text: 'No streaks or urgency' }
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
            onClick={() => navigate(user ? '/portal/social' : '/')}
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
            <span className="text-sm">Back</span>
          </button>
          
          <div className="flex-1">
            <h1 
              className="text-xl font-semibold"
              style={{ color: isDark ? '#fff' : '#111' }}
            >
              Skills World
            </h1>
          </div>

          {/* User status (subtle) */}
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
              Exploring as guest
            </span>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div 
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
          style={{ 
            backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.08)',
            color: isDark ? 'rgb(147, 197, 253)' : 'rgb(59, 130, 246)'
          }}
        >
          <BookOpen size={16} />
          <span className="text-sm font-medium">Learn at your own pace</span>
        </div>

        <h2 
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
          style={{ color: isDark ? '#fff' : '#111' }}
        >
          Build skills through practice
          <br />
          <span style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
            and understanding.
          </span>
        </h2>

        <p 
          className="text-lg max-w-2xl mx-auto mb-6 leading-relaxed"
          style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
        >
          Skills World is a calm space for learning. No pressure, no competition, 
          no timers. Just you, building understanding one step at a time.
        </p>

        {/* Trust signals - visible without scrolling */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {['No ads', 'No in-app purchases', 'No pressure'].map((signal) => (
            <span
              key={signal}
              className="px-4 py-2 rounded-full text-sm"
              style={{ 
                backgroundColor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.08)',
                color: isDark ? 'rgb(134, 239, 172)' : 'rgb(22, 163, 74)',
                border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`
              }}
            >
              {signal}
            </span>
          ))}
        </div>
      </section>

      {/* What Skills World Is NOT */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <div 
          className="rounded-2xl p-6 sm:p-8"
          style={{ 
            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
            border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`
          }}
        >
          <h3 
            className="text-sm font-semibold uppercase tracking-wider mb-6"
            style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
          >
            What Skills World is not
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {notFeatures.map((feature, idx) => (
              <div 
                key={idx}
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'
                }}
              >
                <feature.icon 
                  size={20} 
                  style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
                />
                <span 
                  className="text-sm"
                  style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
                >
                  {feature.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Worlds Grid */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        <h3 
          className="text-sm font-semibold uppercase tracking-wider mb-6"
          style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}
        >
          Explore Skills
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillWorlds.map((world) => {
            const isActive = world.status === 'active';
            const Icon = world.icon;
            
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

                {/* Icon */}
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${world.color}`}
                >
                  <Icon size={24} className={world.iconColor} />
                </div>

                {/* Title */}
                <h4 
                  className="text-lg font-semibold mb-2"
                  style={{ color: isDark ? '#fff' : '#111' }}
                >
                  {world.title}
                </h4>

                {/* Description */}
                <p 
                  className="text-sm leading-relaxed"
                  style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
                >
                  {world.description}
                </p>

                {/* Active indicator */}
                {isActive && (
                  <div 
                    className="mt-4 pt-4"
                    style={{ borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}
                  >
                    <span 
                      className="text-sm font-medium"
                      style={{ color: 'rgb(59, 130, 246)' }}
                    >
                      Start exploring →
                    </span>
                  </div>
                )}
              </div>
            );

            return isActive ? (
              <Link key={world.id} to={world.path} className="block">
                {cardContent}
              </Link>
            ) : (
              <div key={world.id}>
                {cardContent}
              </div>
            );
          })}
        </div>
      </section>

      {/* Parent/Educator Reassurance */}
      <section className="max-w-5xl mx-auto px-4 pb-16">
        <div 
          className="rounded-2xl p-6 sm:p-8"
          style={{ 
            backgroundColor: isDark ? 'rgba(34, 197, 94, 0.05)' : 'rgba(34, 197, 94, 0.05)',
            border: `1px solid ${isDark ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.15)'}`
          }}
        >
          <h3 
            className="text-lg font-semibold mb-4"
            style={{ color: isDark ? '#fff' : '#111' }}
          >
            For Parents & Educators
          </h3>
          
          <div className="space-y-3">
            <p 
              className="text-sm leading-relaxed"
              style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
            >
              Skills World is designed with care. There are no advertisements, no premium 
              upgrades, no pressure to compete, and no comparison with other learners.
            </p>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
            >
              Learners can pause or stop at any time without penalty. Progress comes from 
              understanding, not from time spent or money paid.
            </p>
            <p 
              className="text-sm leading-relaxed"
              style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
            >
              Account creation is always optional. Guests can explore freely.
            </p>
          </div>
        </div>
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
            Skills World — Part of BANIBS
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SkillsWorldHome;
