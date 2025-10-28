import React from 'react';
import LikeButton from './LikeButton';

const OpportunityCard = ({ opportunity, showEngagement = true }) => {
  const formatDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      job: 'bg-blue-600',
      grant: 'bg-green-600',
      scholarship: 'bg-purple-600',
      training: 'bg-orange-600',
      event: 'bg-pink-600'
    };
    return colors[type] || 'bg-gray-600';
  };

  return (
    <div className="bg-black border-2 border-[#FFD700] rounded-lg p-6 hover:shadow-[0_0_20px_rgba(255,215,0,0.5)] transition-all h-full flex flex-col">
      {/* Type Badge & Sponsored Badge */}
      <div className="flex gap-2 mb-3 flex-wrap">
        <span className={`inline-block px-3 py-1 ${getTypeColor(opportunity.type)} text-white text-xs font-bold rounded-full uppercase`}>
          {opportunity.type}
        </span>
        
        {/* Phase 4.3 - Sponsored Badge */}
        {opportunity.is_sponsored && (
          <span className="inline-block px-3 py-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-xs font-bold rounded-full uppercase shadow-[0_0_10px_rgba(255,215,0,0.5)]">
            ⭐ {opportunity.sponsor_label || 'Sponsored'}
          </span>
        )}
      </div>

      {/* Image */}
      {opportunity.imageUrl && (
        <div className="mb-4">
          <img 
            src={opportunity.imageUrl} 
            alt={opportunity.title}
            className="w-full h-48 object-cover rounded-lg border border-[#FFD700]/30"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2">
        {opportunity.title}
      </h3>

      {/* Organization */}
      <p className="text-[#FFD700] text-sm font-medium mb-3">
        {opportunity.orgName}
      </p>

      {/* Contributor Info (Phase 3.1) */}
      {opportunity.contributor_display_name && (
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs text-gray-500">Submitted by</span>
          <span className="text-xs text-gray-300">{opportunity.contributor_display_name}</span>
          {opportunity.contributor_verified && (
            <span className="inline-flex items-center px-2 py-0.5 bg-[#FFD700] text-black text-xs font-bold rounded">
              ✓
            </span>
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-gray-300 text-sm mb-4 flex-grow line-clamp-3">
        {opportunity.description}
      </p>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {opportunity.location && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="text-[#FFD700]">📍</span>
            <span>{opportunity.location}</span>
          </div>
        )}
        
        {opportunity.deadline && (
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span className="text-[#FFD700]">⏰</span>
            <span>Deadline: {formatDate(opportunity.deadline)}</span>
          </div>
        )}
      </div>

      {/* Apply Button */}
      {opportunity.link && (
        <a
          href={opportunity.link}
          target="_blank"
          rel="noopener noreferrer"
          className="block w-full text-center px-4 py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] focus:ring-offset-2 focus:ring-offset-black transition-all shadow-[0_0_10px_rgba(255,215,0,0.5)]"
        >
          Learn More →
        </a>
      )}
    </div>
  );
};

export default OpportunityCard;
