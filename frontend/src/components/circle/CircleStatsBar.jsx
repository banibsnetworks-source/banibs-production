import React from 'react';
import { useTranslation } from 'react-i18next';
import { Users, TrendingUp, Network, Shield } from 'lucide-react';

export const CircleStatsBar = ({ stats, trustScore }) => {
  const { t } = useTranslation();
  
  if (!stats && !trustScore) {
    return (
      <div className="rounded-2xl border border-gray-800 bg-black/40 p-6">
        <p className="text-gray-400 text-center">
          {t('circles.trustScores')}
        </p>
      </div>
    );
  }
  
  const statItems = [
    {
      icon: Shield,
      label: t('circles.trustScore') || 'Trust Score',
      value: trustScore?.overallScore || 0,
      color: 'banibs-gold',
      max: 100
    },
    {
      icon: Users,
      label: t('relationships.peoples') || 'Peoples',
      value: stats?.peoplesCount || 0,
      color: 'emerald-500'
    },
    {
      icon: Network,
      label: 'Total Connections',
      value: stats?.totalNodes || 0,
      color: 'sky-500'
    },
    {
      icon: TrendingUp,
      label: 'Network Depth',
      value: stats?.avgDepth?.toFixed(1) || '0.0',
      color: 'amber-500'
    }
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <div
            key={index}
            className="rounded-2xl border border-gray-800 bg-gradient-to-br from-black to-gray-900/50 p-4 hover:border-gray-700 transition"
          >
            <div className="flex items-center justify-between mb-3">
              <Icon className={`w-5 h-5 text-${item.color}`} />
              <span className={`text-2xl font-bold text-${item.color}`}>
                {item.value}{item.max ? `/${item.max}` : ''}
              </span>
            </div>
            <div className="text-sm text-gray-400">{item.label}</div>
            {item.max && (
              <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-${item.color} rounded-full transition-all`}
                  style={{ width: `${(item.value / item.max) * 100}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CircleStatsBar;
