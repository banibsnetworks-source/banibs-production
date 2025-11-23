import React from 'react';
import { Lightbulb, Tag } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const LifeSkillCard = ({ skill, onClick }) => {
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
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <Lightbulb size={24} className="text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {skill.title}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {skill.content.substring(0, 120)}...
          </p>
          
          {skill.tags && skill.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag size={12} className="text-muted-foreground" />
              {skill.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                    color: '#3B82F6'
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

export default LifeSkillCard;
