import React from 'react';
import { GraduationCap, Tag } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * DiasporaArticleCard - Phase 12.0
 * Card component for displaying education articles
 */
const DiasporaArticleCard = ({ article, onClick }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div
      onClick={onClick}
      className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.01] cursor-pointer"
      style={{
        background: isDark ? 'rgba(180, 130, 50, 0.06)' : 'rgba(180, 130, 50, 0.04)',
        border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.12)'}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
          }}
        >
          <GraduationCap size={24} className="text-amber-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {article.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {article.content.substring(0, 150)}...
          </p>
          
          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={12} className="text-muted-foreground" />
              {article.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
                    color: '#d97706'
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiasporaArticleCard;
