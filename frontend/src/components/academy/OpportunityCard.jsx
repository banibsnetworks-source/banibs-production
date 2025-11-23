import React from 'react';
import { Award, Calendar, Building2, ExternalLink } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDistanceToNow } from 'date-fns';

const OpportunityCard = ({ opportunity }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const typeLabels = {
    scholarship: 'Scholarship',
    internship: 'Internship',
    apprenticeship: 'Apprenticeship',
    grant: 'Grant'
  };
  
  const typeColors = {
    scholarship: '#10B981',
    internship: '#3B82F6',
    apprenticeship: '#8B5CF6',
    grant: '#F59E0B'
  };
  
  const deadline = opportunity.deadline ? new Date(opportunity.deadline) : null;
  const isUpcoming = deadline && deadline > new Date();
  const timeUntilDeadline = deadline && isUpcoming
    ? formatDistanceToNow(deadline, { addSuffix: true })
    : null;
  
  return (
    <div
      className="rounded-xl p-6 transition-all duration-200 hover:scale-[1.01]"
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
          <Award size={24} className="text-blue-600" />
        </div>
        
        <div
          className="px-2 py-1 rounded-full text-xs font-medium"
          style={{
            background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)',
            color: typeColors[opportunity.type] || '#3B82F6'
          }}
        >
          {typeLabels[opportunity.type] || opportunity.type}
        </div>
      </div>
      
      <h3 className="text-lg font-semibold text-foreground mb-2">
        {opportunity.title}
      </h3>
      
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {opportunity.description}
      </p>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 size={14} className="text-blue-600" />
          <span>{opportunity.organization}</span>
        </div>
        
        {deadline && (
          <div className="flex items-center gap-2 text-sm">
            <Calendar size={14} className="text-blue-600" />
            {isUpcoming ? (
              <span className="text-foreground font-medium">
                Deadline: {timeUntilDeadline}
              </span>
            ) : (
              <span className="text-red-500">Deadline passed</span>
            )}
          </div>
        )}
      </div>
      
      {opportunity.link && (
        <a
          href={opportunity.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
          onClick={(e) => e.stopPropagation()}
        >
          Apply Now
          <ExternalLink size={14} />
        </a>
      )}
    </div>
  );
};

export default OpportunityCard;
