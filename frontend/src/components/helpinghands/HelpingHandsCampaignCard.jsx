import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Clock, Heart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import HelpingHandsProgressBar from './HelpingHandsProgressBar';

/**
 * HelpingHandsCampaignCard - Phase 10.0
 * Campaign card for grid/list display
 */
const HelpingHandsCampaignCard = ({ campaign, compact = false }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Campaign card clicked, ID:', campaign.id);
    console.log('Navigating to:', `/portal/helping-hands/campaign/${campaign.id}`);
    navigate(`/portal/helping-hands/campaign/${campaign.id}`);
  };
  
  // Calculate days remaining if ends_at exists
  const daysRemaining = campaign.ends_at 
    ? Math.max(0, Math.ceil((new Date(campaign.ends_at) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;
  
  return (
    <div
      onClick={handleClick}
      className="cursor-pointer transition-all duration-300 rounded-xl overflow-hidden"
      style={{
        background: isDark ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.9)',
        border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
        boxShadow: isDark 
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.1)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 8px 20px rgba(232, 182, 87, 0.2)'
          : '0 8px 20px rgba(232, 182, 87, 0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = isDark
          ? '0 4px 12px rgba(0, 0, 0, 0.3)'
          : '0 4px 12px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Cover Image */}
      {campaign.cover_image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={`${process.env.REACT_APP_BACKEND_URL}${campaign.cover_image}`}
            alt={campaign.title}
            className="w-full h-full object-cover"
            style={{ filter: 'brightness(0.9)' }}
          />
          
          {/* Category Badge */}
          <div className="absolute top-3 right-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md"
              style={{
                background: 'rgba(232, 182, 87, 0.9)',
                color: '#0a0a0a'
              }}
            >
              {campaign.category}
            </span>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 
          className="text-lg font-bold mb-2 line-clamp-2"
          style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
        >
          {campaign.title}
        </h3>
        
        {/* Summary */}
        <p 
          className="text-sm mb-4 line-clamp-2"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        >
          {campaign.summary}
        </p>
        
        {/* Progress Bar */}
        <HelpingHandsProgressBar 
          raised={campaign.raised_amount || 0}
          goal={campaign.goal_amount}
          showAmounts={!compact}
        />
        
        {/* Meta Info */}
        <div 
          className="flex items-center gap-4 mt-4 text-xs"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        >
          {campaign.city && campaign.state && (
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{campaign.city}, {campaign.state}</span>
            </div>
          )}
          
          {daysRemaining !== null && (
            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{daysRemaining} days left</span>
            </div>
          )}
          
          {campaign.supporters_count > 0 && (
            <div className="flex items-center gap-1">
              <Heart size={14} />
              <span>{campaign.supporters_count} supporters</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HelpingHandsCampaignCard;
