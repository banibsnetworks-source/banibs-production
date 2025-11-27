import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

/**
 * CircleUserCard - Phase 9.2
 * Displays a user within the trust circle
 * Uses BANIBS UI v2.0 design system
 */
const CircleUserCard = ({ 
  userId,
  avatar, 
  name, 
  handle, 
  tier,
  reachScore,
  mutualCount
}) => {
  const navigate = useNavigate();

  const getTierBadgeClass = () => {
    switch (tier) {
      case 'PEOPLES':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'COOL':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'ALRIGHT':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'OTHERS':
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getTierLabel = () => {
    return tier?.charAt(0) + tier?.slice(1).toLowerCase();
  };

  const handleClick = () => {
    if (userId) {
      navigate(`/portal/social/id/${userId}`);
    }
  };

  return (
    <div 
      className="card-v2 card-v2-interactive hover-lift clean-spacing-md cursor-pointer"
      onClick={handleClick}
    >
      {/* Avatar & Name */}
      <div className="flex items-center gap-3 breathing-room-sm">
        {avatar ? (
          <img
            src={avatar}
            alt={name || 'User'}
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center">
            <User className="w-6 h-6 text-gray-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="text-foreground-v2 font-semibold truncate">
            {name || 'Unknown User'}
          </div>
          {handle && (
            <div className="text-secondary-v2 text-sm truncate">
              @{handle}
            </div>
          )}
        </div>
      </div>

      {/* Tier Badge */}
      <div className="breathing-room-xs">
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getTierBadgeClass()}`}>
          {getTierLabel()}
        </span>
      </div>

      {/* Reach Score (if provided) */}
      {reachScore !== undefined && (
        <div className="text-xs text-secondary-v2 breathing-room-xs">
          Reach Score: <span className="text-primary-v2 font-semibold">{reachScore}</span>
        </div>
      )}

      {/* Mutual Count (for Peoples-of-Peoples) */}
      {mutualCount !== undefined && mutualCount > 0 && (
        <div className="text-xs text-secondary-v2 breathing-room-xs">
          {mutualCount} mutual {mutualCount === 1 ? 'connection' : 'connections'}
        </div>
      )}
    </div>
  );
};

export default CircleUserCard;
