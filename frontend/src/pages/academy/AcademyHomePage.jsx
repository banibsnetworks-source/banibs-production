import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Lightbulb, BookMarked, Award, GraduationCap } from 'lucide-react';
import AcademyLayout from '../../components/academy/AcademyLayout';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * AcademyHomePage - Phase 13.0
 * Main landing page for BANIBS Academy
 */
const AcademyHomePage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const sections = [
    {
      icon: BookOpen,
      title: 'Learning Tracks',
      description: 'Structured courses in finance, tech, wellness, history, and more',
      path: '/portal/academy/courses',
      color: '#3B82F6'
    },
    {
      icon: Users,
      title: 'Mentorship Network',
      description: 'Connect with experienced professionals ready to guide your journey',
      path: '/portal/academy/mentorship',
      color: '#8B5CF6'
    },
    {
      icon: Lightbulb,
      title: 'Life Skills Library',
      description: 'Practical wisdom for budgeting, communication, time management & more',
      path: '/portal/academy/lifeskills',
      color: '#F59E0B'
    },
    {
      icon: BookMarked,
      title: 'Black History Master Lessons',
      description: 'Learn the powerful history of our people from ancient empires to modern movements',
      path: '/portal/academy/history',
      color: '#10B981'
    },
    {
      icon: Award,
      title: 'Scholarships & Opportunities',
      description: 'Find funding for your education, internships, apprenticeships, and more',
      path: '/portal/academy/opportunities',
      color: '#EF4444'
    }
  ];
  
  return (
    <AcademyLayout>
      {/* Hero Section */}
      <div 
        className="py-16 px-4 rounded-2xl mb-8"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.05) 100%)'
            : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.04) 100%)',
          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.15)'}`,
        }}
      >
        <div className="max-w-3xl mx-auto text-center">
          <div 
            className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
            style={{
              background: isDark 
                ? 'rgba(59, 130, 246, 0.2)'
                : 'rgba(59, 130, 246, 0.15)',
              border: '2px solid rgba(59, 130, 246, 0.3)'
            }}
          >
            <GraduationCap size={40} className="text-blue-600" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            BANIBS Academy
          </h1>
          
          <p className="text-2xl md:text-3xl font-semibold mb-6 text-blue-600">
            Educating a Generation Built on Legacy, Wealth, Knowledge & Power
          </p>
          
          <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
            Welcome to your center for Black excellence. Learn from structured courses, 
            connect with mentors, master life skills, understand our history, and access 
            opportunities that will transform your future.
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-600/10 border border-blue-600/20">
            <span className="text-sm font-medium text-blue-600">
              🎓 Your Education. Your Power. Your Future.
            </span>
          </div>
        </div>
      </div>
      
      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {sections.map((section) => {
          const Icon = section.icon;
          
          return (
            <button
              key={section.path}
              onClick={() => navigate(section.path)}
              className="p-6 rounded-xl transition-all duration-200 hover:scale-[1.02] text-left"
              style={{
                background: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)',
                border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'}`,
              }}
            >
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center mb-4"
                style={{
                  background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                }}
              >
                <Icon size={24} style={{ color: section.color }} />
              </div>
              
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {section.title}
              </h3>
              
              <p className="text-sm text-muted-foreground">
                {section.description}
              </p>
            </button>
          );
        })}
      </div>
      
      {/* About Section */}
      <div
        className="p-6 rounded-xl"
        style={{
          background: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)',
          border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'}`,
        }}
      >
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Why BANIBS Academy?
        </h2>
        
        <div className="space-y-3 text-muted-foreground">
          <p>
            Education is power. But not just any education—education that centers us, 
            our history, our values, and our path to generational wealth and influence.
          </p>
          
          <p>
            BANIBS Academy brings together the best of what we need to thrive: practical 
            courses in tech and finance, life skills that schools don't teach, connections 
            with mentors who've walked the path, lessons on our powerful history, and 
            opportunities to fund your dreams.
          </p>
          
          <p className="font-medium text-foreground">
            This is education on our terms. Built for us, by us. Welcome to your academy.
          </p>
        </div>
      </div>
    </AcademyLayout>
  );
};

export default AcademyHomePage;
