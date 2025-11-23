import React from 'react';
import { User, MapPin, Briefcase, Mail, Linkedin, Instagram } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const MentorCard = ({ mentor }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div
      className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.01]"
      style={{
        background: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)',
        border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'}`,
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center"
          style={{
            background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <User size={32} className="text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground mb-1">
            {mentor.name}
          </h3>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <MapPin size={14} className="text-blue-600" />
            <span>{mentor.city}, {mentor.country}</span>
          </div>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {mentor.bio}
          </p>
          
          {/* Expertise tags */}
          {mentor.expertise && mentor.expertise.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              <Briefcase size={14} className="text-blue-600 mt-1" />
              {mentor.expertise.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-1 rounded-full"
                  style={{
                    background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
                    color: '#3B82F6'
                  }}
                >
                  {skill}
                </span>
              ))}
              {mentor.expertise.length > 3 && (
                <span className="text-xs text-muted-foreground">+{mentor.expertise.length - 3}</span>
              )}
            </div>
          )}
          
          {/* Contact methods */}
          {mentor.contact_methods && Object.keys(mentor.contact_methods).length > 0 && (
            <div className="flex items-center gap-3 pt-3 border-t border-border/50">
              {mentor.contact_methods.email && (
                <a
                  href={`mailto:${mentor.contact_methods.email}`}
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail size={18} />
                </a>
              )}
              {mentor.contact_methods.linkedin && (
                <a
                  href={`https://${mentor.contact_methods.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Linkedin size={18} />
                </a>
              )}
              {mentor.contact_methods.instagram && (
                <a
                  href={`https://instagram.com/${mentor.contact_methods.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram size={18} />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorCard;
