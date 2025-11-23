import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Store, BookOpen, Calculator, MessageSquare, MapPin } from 'lucide-react';
import BeautyLayout from '../../components/beauty/BeautyLayout';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * BeautyHomePage - Phase 11.1
 * Main landing page for Beauty & Wellness Portal
 */
const BeautyHomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const sections = [
    {
      icon: Store,
      title: 'Beauty Directory',
      description: 'Discover Black-owned beauty businesses near you',
      path: '/portal/beauty/providers',
      color: '#EC4899'
    },
    {
      icon: BookOpen,
      title: 'Education Center',
      description: 'Learn about healthy hair, skincare, and self-love',
      path: '/portal/beauty/education',
      color: '#F59E0B'
    },
    {
      icon: Calculator,
      title: 'Cost Calculator',
      description: 'Track your beauty spending and find savings',
      path: '/portal/beauty/cost',
      color: '#10B981'
    },
    {
      icon: MessageSquare,
      title: 'Beauty Board',
      description: 'Share tips, ask questions, and connect',
      path: '/portal/beauty/board',
      color: '#8B5CF6'
    }
  ];
  
  return (
    <BeautyLayout>
      {/* Hero Section */}
      <div 
        className="beauty-gradient-soft py-16 px-4 rounded-2xl mb-8"
        style={{
          border: `1px solid ${isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.1)'}`,
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{
              background: isDark 
                ? 'rgba(236, 72, 153, 0.2)'
                : 'rgba(236, 72, 153, 0.1)',
              border: '2px solid rgba(236, 72, 153, 0.3)'
            }}
          >
            <Sparkles size={40} className="text-pink-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Beauty & Wellness
          </h1>
          
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            Building ownership and empowerment in Black beauty. Support Black-owned businesses, 
            save money, and celebrate your natural beauty.
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20">
            <span className="text-sm font-medium text-pink-600 dark:text-pink-400">
              🌺 Your beauty dollars have power
            </span>
          </div>
        </div>
      </div>
      
      {/* Quick Actions Grid */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">
          Explore Beauty & Wellness
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(section.path)}
                className="p-6 rounded-lg border text-left transition-all hover:shadow-lg group"
                style={{
                  background: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(236, 72, 153, 0.2)' : '#E5E7EB',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = section.color;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = isDark ? 'rgba(236, 72, 153, 0.2)' : '#E5E7EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div className="flex items-start gap-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{
                      background: isDark 
                        ? `${section.color}20`
                        : `${section.color}15`
                    }}
                  >
                    <Icon size={24} style={{ color: section.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-pink-500 transition-colors">
                      {section.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Impact Statement */}
      <div 
        className="p-8 rounded-lg border text-center"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(236, 72, 153, 0.1), rgba(249, 168, 212, 0.05))'
            : 'linear-gradient(135deg, rgba(236, 72, 153, 0.05), rgba(249, 168, 212, 0.02))',
          borderColor: isDark ? 'rgba(236, 72, 153, 0.3)' : 'rgba(236, 72, 153, 0.2)'
        }}
      >
        <h3 className="text-2xl font-bold mb-4 text-foreground">
          The Power of Your Beauty Dollars
        </h3>
        <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
          The Black community spends over $1.5 trillion annually on beauty. When we redirect 
          even 10% to Black-owned businesses, we create $150 billion in community wealth.
        </p>
        <p className="text-lg font-semibold text-pink-600 dark:text-pink-400">
          Your choices build generational wealth. Start today. 💪🏾
        </p>
      </div>
    </BeautyLayout>
  );
};

export default BeautyHomePage;
