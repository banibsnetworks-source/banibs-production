import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getPeoplesOfPeoples,
  getCircleDepth,
  getTrustScores,
  getCircleStats,
} from "../../api/circleApi";
import { CircleDepthTabs } from "../../components/circles/CircleDepthTabs";
import { CircleUserCard } from "../../components/circles/CircleUserCard";
import { TrustScoreDisplay } from "../../components/circles/TrustScoreDisplay";
import { CircleStatsPanel } from "../../components/circles/CircleStatsPanel";
import { useAuth } from "../../contexts/AuthContext";

export const InfiniteCirclePage = () => {
  const { t } = useTranslation();
  const { auth } = useAuth();
  const { userId: routeUserId } = useParams();
  const [currentUserId] = useState(routeUserId || auth?.user?.id);

  const [activeDepth, setActiveDepth] = useState(1);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [trust, setTrust] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingDepth, setLoadingDepth] = useState(false);
  const [error, setError] = useState(null);

  // Initial load – Peoples-of-Peoples + trust + stats
  useEffect(() => {
    if (!currentUserId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    const loadInitial = async () => {
      try {
        const [peoplesOfPeoplesRes, trustRes, statsRes] = await Promise.all([
          getPeoplesOfPeoples(currentUserId),
          getTrustScores(currentUserId),
          getCircleStats(currentUserId),
        ]);

        if (!isMounted) return;
        setUsers(peoplesOfPeoplesRes.users || []);
        setStats(peoplesOfPeoplesRes.stats || statsRes || null);
        setTrust(trustRes || null);
      } catch (err) {
        if (!isMounted) return;
        console.error("InfiniteCirclePage initial load failed", err);
        setError("Unable to load Infinite Circles right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadInitial();
    return () => {
      isMounted = false;
    };
  }, [currentUserId]);

  // Depth change handler
  const handleDepthChange = async (depth) => {
    if (!currentUserId || depth === activeDepth) return;

    setActiveDepth(depth);
    setLoadingDepth(true);
    setError(null);

    try {
      const res = await getCircleDepth(currentUserId, depth);
      setUsers(res.users || []);
      // Prefer depth-specific stats if available
      setStats(res.stats || stats);
    } catch (err) {
      console.error("Failed to load depth view", err);
      setError("Unable to load that depth right now.");
    } finally {
      setLoadingDepth(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
          {t('circles.title')} – {t('circles.subtitle')}
        </h1>
        <p className="text-sm md:text-base text-gray-400 max-w-2xl">
          {t('circles.description')}
        </p>
      </div>

      {/* Trust score + stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <TrustScoreDisplay trust={trust} />
        </div>
        <div>
          <CircleStatsPanel stats={stats} />
        </div>
      </div>

      {/* Depth navigation */}
      <CircleDepthTabs
        activeDepth={activeDepth}
        onDepthChange={handleDepthChange}
        maxDepth={4}
      />

      {/* Loading / error states */}
      {loading && (
        <div className="flex justify-center py-10 text-gray-400 text-sm">
          {t('circles.loading')}
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* User list */}
      {!loading && !error && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {t('circles.depth')} {activeDepth}{" "}
              <span className="text-xs font-normal text-gray-400">
                ({users.length} {t('relationships.connections').toLowerCase()})
              </span>
            </h2>
            <p className="text-xs text-gray-500 max-w-md">
              {t('circles.depth')} 1 = {t('circles.peoples')}; {t('circles.depth')} 2 = {t('circles.peoplesOfPeoples')}
            </p>
          </div>

          {users.length === 0 ? (
            <div className="rounded-xl border border-gray-700 bg-black/30 px-4 py-6 text-sm text-gray-400">
              {t('circles.noConnections')}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-100 transition-opacity">
              {users.map((u) => (
                <CircleUserCard
                  key={u._id || u.id}
                  user={u}
                  tier={u.relationshipTier}
                  trustScore={u.trustScore}
                  mutualCount={u.mutualCount}
                  onClick={() => {
                    // optional: open profile or shared circle
                    // navigate(`/circles/shared/${u._id || u.id}`);
                  }}
                />
              ))}
            </div>
          )}

          {loadingDepth && (
            <div className="text-xs text-gray-500">
              Updating view for depth {activeDepth}…
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfiniteCirclePage;
