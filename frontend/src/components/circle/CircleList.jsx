import React from 'react';
import { useTranslation } from 'react-i18next';
import CircleUserCard from './CircleUserCard';
import { Loader2 } from 'lucide-react';

export const CircleList = ({ users, loading, depth, emptyMessage }) => {
  const { t } = useTranslation();
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="w-8 h-8 text-banibs-gold animate-spin mb-4" />
        <p className="text-gray-400">{t('circles.loading')}</p>
      </div>
    );
  }
  
  if (!users || users.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-black/40 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-300 mb-2">
            {emptyMessage || t('circles.noConnections')}
          </h3>
          <p className="text-sm text-gray-500">
            Connect with more people to build your trust network
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">
          {t('circles.depth')} {depth}
          <span className="ml-2 text-sm font-normal text-gray-400">
            ({users.length} {users.length === 1 ? 'connection' : 'connections'})
          </span>
        </h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((user) => (
          <CircleUserCard
            key={user.id || user._id}
            user={user}
            showMutuals={true}
          />
        ))}
      </div>
    </div>
  );
};

export default CircleList;
