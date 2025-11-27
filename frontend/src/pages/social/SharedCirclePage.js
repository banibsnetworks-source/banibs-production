import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { getSharedCircles } from '../../api/circleApi';
import { SharedCircleList } from '../../components/circle/SharedCircleList';
import { ArrowLeft } from 'lucide-react';

export const SharedCirclePage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { userId: otherUserId } = useParams();
  const navigate = useNavigate();
  
  const [sharedUsers, setSharedUsers] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id || !otherUserId) return;
    loadSharedCircle();
  }, [user?.id, otherUserId]);

  const loadSharedCircle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getSharedCircles(user.id, otherUserId);
      setSharedUsers(data.sharedUsers || []);
      setStats(data.stats || {});
      setOtherUser(data.otherUser || { id: otherUserId, name: 'User' });
    } catch (err) {
      console.error('Failed to load shared circle:', err);
      setError(t('circles.loadError') || 'Failed to load shared circle data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-b from-black to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-400 hover:text-banibs-gold transition mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>{t('common.back')}</span>
          </button>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold mb-3">
                {t('circles.sharedCircles')} with{' '}
                <span className="text-banibs-gold">
                  {otherUser?.displayName || otherUser?.name || 'User'}
                </span>
              </h1>
              <p className="text-base text-gray-400 max-w-2xl">
                Discover mutual connections and shared trust networks
              </p>
            </div>
          </div>

          {/* Stats Summary */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
                <div className="text-2xl font-bold text-banibs-gold">
                  {sharedUsers.length}
                </div>
                <div className="text-sm text-gray-400">Shared Connections</div>
              </div>
              <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
                <div className="text-2xl font-bold text-emerald-400">
                  {sharedUsers.filter(u => u.relationshipTier === 'Peoples').length}
                </div>
                <div className="text-sm text-gray-400">Shared Peoples</div>
              </div>
              <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
                <div className="text-2xl font-bold text-sky-400">
                  {sharedUsers.filter(u => u.relationshipTier === 'Cool').length}
                </div>
                <div className="text-sm text-gray-400">Shared Cool</div>
              </div>
              <div className="rounded-xl bg-black/40 border border-gray-800 p-4">
                <div className="text-2xl font-bold text-gray-400">
                  {stats.overlapScore || 0}%
                </div>
                <div className="text-sm text-gray-400">Overlap Score</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error State */}
        {error && (
          <div className="rounded-xl border border-red-500/40 bg-red-900/20 px-6 py-4 mb-6">
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Shared Circle List */}
        <SharedCircleList 
          users={sharedUsers}
          loading={loading}
          primaryUser={user}
          otherUser={otherUser}
          emptyMessage="No shared connections found yet"
        />
      </div>
    </div>
  );
};

export default SharedCirclePage;
