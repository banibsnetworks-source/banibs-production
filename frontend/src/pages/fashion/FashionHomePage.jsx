import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Store, BookOpen, MessageSquare, Calculator } from 'lucide-react';
import FashionLayout from '../../components/fashion/FashionLayout';
import { useTheme } from '../../contexts/ThemeContext';

const FashionHomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const sections = [
    {
      icon: Store,
      title: 'Brand Directory',
      description: 'Discover Black-owned sneaker and fashion brands',
      path: '/portal/fashion/brands',
      color: '#3B82F6'
    },
    {
      icon: BookOpen,
      title: 'Learn the Game',
      description: 'Understand the business of fashion and sneakers',
      path: '/portal/fashion/education',
      color: '#10B981'
    },
    {
      icon: MessageSquare,
      title: 'My Fashion Journey',
      description: 'Share ideas, wins, and questions with the community',
      path: '/portal/fashion/board',
      color: '#F59E0B'
    },
    {
      icon: Calculator,
      title: 'Sneaker Spend Tool',
      description: 'Calculate your annual spending and ownership potential',
      path: '/portal/fashion/spend',
      color: '#8B5CF6'
    }
  ];
  
  return (
    <FashionLayout>
      <div className="fashion-gradient-soft py-16 px-4 rounded-2xl mb-8" style={{ border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.1)'}` }}>
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">From Hype to Ownership</h1>
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            Turn your passion for sneakers and fashion into business ownership. Support Black brands, learn the game, and build your empire.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">👟 Culture + Commerce + Ownership</span>
          </div>
        </div>
      </div>
      
      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-6 text-foreground">Explore Fashion Ownership</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <button key={idx} onClick={() => navigate(section.path)} className="p-6 rounded-lg border text-left transition-all hover:shadow-lg group" style={{ background: isDark ? '#1A1A1A' : '#FFFFFF', borderColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#E5E7EB' }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = section.color; e.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = isDark ? 'rgba(59, 130, 246, 0.2)' : '#E5E7EB'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: isDark ? `${section.color}20` : `${section.color}15` }}>
                    <Icon size={24} style={{ color: section.color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-blue-500 transition-colors">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      
      <div className="p-8 rounded-lg border text-center" style={{ background: isDark ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(96, 165, 250, 0.05))' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(96, 165, 250, 0.02))', borderColor: isDark ? 'rgba(59, 130, 246, 0.3)' : 'rgba(59, 130, 246, 0.2)' }}>
        <h3 className="text-2xl font-bold mb-4 text-foreground">The Ownership Shift</h3>
        <p className="text-muted-foreground mb-4 max-w-2xl mx-auto">
          Every dollar you spend on fashion is a vote. Vote for Black ownership. Vote for your future. Vote for generational wealth.
        </p>
        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">From consumer to creator. From hype to ownership. 🚀</p>
      </div>
    </FashionLayout>
  );
};

export default FashionHomePage;