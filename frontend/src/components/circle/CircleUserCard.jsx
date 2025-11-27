import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users } from 'lucide-react';

const tierConfig = {
  Peoples: {
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/40',
    text: 'text-emerald-300',
    ring: 'ring-emerald-500/20'
  },
  Cool: {
    bg: 'bg-sky-500/10',
    border: 'border-sky-500/40',
    text: 'text-sky-300',
    ring: 'ring-sky-500/20'
  },
  Alright: {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-300',
    ring: 'ring-amber-500/20'
  },
  Others: {
    bg: 'bg-gray-600/10',
    border: 'border-gray-600/40',
    text: 'text-gray-400',
    ring: 'ring-gray-600/20'
  }
};

const CircleUserCard = ({ user, showMutuals = true, onClick }) => {
  const navigate = useNavigate();
  
  const tier = user?.relationshipTier || 'Others';
  const config = tierConfig[tier] || tierConfig.Others;
  
  const displayName = user?.displayName || user?.name || 
    `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Unknown User';
  
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
  
  const trustScore = user?.trustScore || 0;
  const mutualCount = user?.mutualCount || 0;
  
  const handleClick = () => {
    if (onClick) {
      onClick(user);
    } else if (user?.id) {
      navigate(`/portal/social/u/${user.id}`);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className={`w-full group flex flex-col gap-3 rounded-2xl border ${config.border} ${config.bg} p-4 text-left transition-all hover:scale-[1.02] hover:shadow-lg hover:${config.ring} hover:ring-2`}
    >
      {/* User Info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div className="relative">
          {user?.avatar_url || user?.profile_picture_url ? (
            <img
              src={user.avatar_url || user.profile_picture_url}
              alt={displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-banibs-gold/60 to-banibs-bronze/70 flex items-center justify-center text-black font-bold">
              {initials}
            </div>
          )}
          {/* Tier Badge */}
          <div className={`absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${config.bg} ${config.border} border ${config.text}`}>
            {tier[0]}
          </div>
        </div>
        
        {/* Name & Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{displayName}</h3>
          </div>
          {user?.headline && (
            <p className="text-sm text-gray-400 truncate">{user.headline}</p>
          )}
          {user?.location && (
            <p className="text-xs text-gray-500 truncate">{user.location}</p>
          )}
        </div>
      </div>
      
      {/* Trust Score & Mutuals */}
      <div className="flex items-center gap-4 pt-2 border-t border-gray-800">
        {/* Trust Score */}
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
            <span>Trust</span>
            <span className={config.text}>{trustScore}</span>
          </div>
          <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full ${config.bg.replace('/10', '/60')}`}
              style={{ width: `${Math.min(trustScore, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Mutuals */}
        {showMutuals && (
          <div className="flex items-center gap-1.5 text-gray-400">
            <Users className="w-3.5 h-3.5" />
            <span className="text-xs font-medium">{mutualCount}</span>
          </div>
        )}
      </div>
    </button>
  );
};

export default CircleUserCard;
