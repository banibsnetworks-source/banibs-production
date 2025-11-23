import React from 'react';
import { BookMarked, Image as ImageIcon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const HistoryCard = ({ lesson, onClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div
      onClick={onClick}
      className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
      style={{
        background: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)',
        border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'}`,
      }}
    >
      {lesson.media_url && (
        <div className="mb-4 rounded-lg overflow-hidden h-40 bg-muted">
          <img
            src={lesson.media_url}
            alt={lesson.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <BookMarked size={24} className="text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium mb-2"
            style={{
              background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
              color: '#3B82F6'
            }}
          >
            {lesson.theme}
          </div>
          
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {lesson.title}
          </h3>
          
          <p className="text-sm text-muted-foreground line-clamp-3">
            {lesson.content.substring(0, 150)}...
          </p>
          
          {lesson.media_url && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-3">
              <ImageIcon size={12} className="text-blue-600" />
              <span>Includes media</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryCard;
