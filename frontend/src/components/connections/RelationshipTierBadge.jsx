import React from 'react';

/**
 * RelationshipTierBadge - Phase 8.2
 * Displays relationship tier with appropriate styling
 * Uses BANIBS UI v2.0 design system only
 */
const RelationshipTierBadge = ({ tier }) => {
  const getTierStyles = () => {
    switch (tier) {
      case 'PEOPLES':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'COOL':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ALRIGHT':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'BLOCKED':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'OTHERS':
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTierLabel = () => {
    switch (tier) {
      case 'PEOPLES':
        return 'Peoples';
      case 'COOL':
        return 'Cool';
      case 'ALRIGHT':
        return 'Alright';
      case 'BLOCKED':
        return 'Blocked';
      case 'OTHERS':
      default:
        return 'Others';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTierStyles()}`}
    >
      {getTierLabel()}
    </span>
  );
};

export default RelationshipTierBadge;
