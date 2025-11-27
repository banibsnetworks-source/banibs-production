import React from 'react';
import { useTranslation } from 'react-i18next';
import { CircleUserCard } from './CircleUserCard';
import { Loader2, Users } from 'lucide-react';

export const SharedCircleList = ({ users, loading, primaryUser, otherUser, emptyMessage }) => {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-banibs-gold animate-spin mb-4" />
        <p className="text-gray-400">Loading shared connections...</p>
      </div>
    );
  }
  
  if (!users || users.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-black/40 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            {emptyMessage || 'No Shared Connections'}
          </h3>
          <p className="text-sm text-gray-500">
            You and {otherUser?.name || 'this person'} don't have any mutual connections yet.
            This doesn't mean lack of trust—just separate networks.
          </p>
        </div>
      </div>
    );
  }
  
  // Group by tier
  const byTier = {
    Peoples: users.filter(u => u.relationshipTier === 'Peoples'),
    Cool: users.filter(u => u.relationshipTier === 'Cool'),
    Alright: users.filter(u => u.relationshipTier === 'Alright'),
    Others: users.filter(u => u.relationshipTier === 'Others')
  };
  
  return (
    <div className="space-y-8">
      {/* Overview */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-br from-black to-gray-900/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Shared Network Overview</h3>
            <p className="text-sm text-gray-400">
              {primaryUser?.name || 'You'} and {otherUser?.name || 'User'} have {users.length} mutual connections
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-banibs-gold">{users.length}</div>
            <div className="text-xs text-gray-400">Shared</div>
          </div>
        </div>
      </div>
      
      {/* By Tier */}
      {Object.entries(byTier).map(([tier, tierUsers]) => {
        if (tierUsers.length === 0) return null;
        
        const tierColors = {
          Peoples: 'emerald',
          Cool: 'sky',
          Alright: 'amber',
          Others: 'gray'
        };
        
        const color = tierColors[tier];
        
        return (
          <div key={tier}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-3 py-1 rounded-full bg-${color}-500/10 border border-${color}-500/40 text-${color}-300 text-sm font-medium`}>
                {tier}
              </div>
              <span className="text-sm text-gray-400">
                {tierUsers.length} {tierUsers.length === 1 ? 'connection' : 'connections'}
              </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tierUsers.map((user) => (
                <CircleUserCard
                  key={user.id || user._id}
                  user={user}
                  showMutuals={false}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SharedCircleList;
