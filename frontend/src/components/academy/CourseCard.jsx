import React from 'react';
import { BookOpen, Clock, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const CourseCard = ({ course, onClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const levelColors = {
    beginner: '#10B981',
    intermediate: '#F59E0B',
    advanced: '#EF4444'
  };
  
  const categoryLabels = {
    finance: 'Finance & Wealth',
    tech: 'Technology',
    wellness: 'Wellness',
    history: 'History & Culture',
    professionalism: 'Professional Skills',
    entrepreneurship: 'Entrepreneurship',
    creative: 'Creative Arts'
  };
  
  return (
    <div
      onClick={onClick}
      className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.02] cursor-pointer"
      style={{
        background: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)',
        border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'}`,
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <BookOpen size={24} className="text-blue-600" />
        </div>
        <div
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
            color: levelColors[course.level] || '#3B82F6'
          }}
        >
          {course.level}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {course.title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {course.description}
      </p>
      
      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t border-border/50">
        <div className="flex items-center gap-1">
          <Clock size={14} className="text-blue-600" />
          <span>{course.estimated_hours}h</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp size={14} className="text-blue-600" />
          <span>{categoryLabels[course.category] || course.category}</span>
        </div>
      </div>
      
      {course.modules && course.modules.length > 0 && (
        <div className="mt-3 text-xs text-muted-foreground">
          {course.modules.length} modules
        </div>
      )}
    </div>
  );
};

export default CourseCard;
