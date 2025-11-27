import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { getPeoplesOfPeoples, getCircleDepth, getTrustScores, getCircleStats } from '../../api/circleApi';
import { CircleDepthTabs } from '../../components/circle/CircleDepthTabs';
import { CircleStatsBar } from '../../components/circle/CircleStatsBar';
import { CircleList } from '../../components/circle/CircleList';

export const InfiniteCirclePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [activeDepth, setActiveDepth] = useState(1);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [trustScore, setTrustScore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    loadCircleData();
  }, [user?.id]);

  const loadCircleData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [peoplesData, trustData, statsData] = await Promise.all([
        getPeoplesOfPeoples(user.id),
        getTrustScores(user.id),
        getCircleStats(user.id)
      ]);
      
      setUsers(peoplesData.users || []);
      setStats(statsData);
      setTrustScore(trustData);
    } catch (err) {
      console.error('Failed to load circle data:', err);
      setError(t('circles.loadError') || 'Failed to load circle data');
    } finally {
      setLoading(false);
    }
  };

  const handleDepthChange = async (depth) => {
    if (depth === activeDepth) return;
    
    setActiveDepth(depth);
    setLoading(true);
    setError(null);
    
    try {
      const depthData = await getCircleDepth(user.id, depth);
      setUsers(depthData.users || []);
      if (depthData.stats) {
        setStats(depthData.stats);
      }
    } catch (err) {
      console.error('Failed to load depth data:', err);
      setError(t('circles.loadError') || 'Failed to load depth data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-black to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold mb-3 bg-gradient-to-r from-banibs-gold via-yellow-400 to-banibs-gold bg-clip-text text-transparent">
                {t('circles.title')}
              </h1>
              <p className="text-base text-gray-400 max-w-2xl">
                {t('circles.description')}
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <CircleStatsBar stats={stats} trustScore={trustScore} />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Depth Navigation */}
        <div className="mb-8">
          <CircleDepthTabs 
            activeDepth={activeDepth}
            onDepthChange={handleDepthChange}
            maxDepth={4}
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-900/20 px-6 py-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Circle List */}
        <CircleList 
          users={users}
          loading={loading}
          depth={activeDepth}
          emptyMessage={t('circles.noConnections')}
        />
      </div>
    </div>
  );
};

export default InfiniteCirclePage;
