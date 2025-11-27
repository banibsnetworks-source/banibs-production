import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getSharedCircles } from "../../api/circleApi";
import { CircleUserCard } from "../../components/circles/CircleUserCard";
import { CircleStatsPanel } from "../../components/circles/CircleStatsPanel";
import { SharedCircleViz } from "../../components/circles/SharedCircleViz";
import { useAuth } from "../../contexts/AuthContext";

export const SharedCirclePage = () => {
  const { auth } = useAuth();
  const { userId: otherUserId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);

  const [otherUser, setOtherUser] = useState(null);
  const [sharedUsers, setSharedUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (auth?.user) {
      setCurrentUser({
        id: auth.user.id,
        name: auth.user.displayName || auth.user.name || "You",
        displayName: auth.user.displayName || auth.user.name || "You",
      });
    }
  }, [auth]);

  useEffect(() => {
    if (!otherUserId || !currentUser?.id) return;
    let isMounted = true;

    const loadShared = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getSharedCircles(currentUser.id, otherUserId);
        if (!isMounted) return;

        setSharedUsers(res.sharedUsers || []);
        setStats(res.stats || null);
        setOtherUser(res.otherUser || { id: otherUserId, name: "Connection" });
      } catch (err) {
        if (!isMounted) return;
        console.error("SharedCirclePage load failed", err);
        setError("Unable to load shared circles right now.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadShared();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id, otherUserId]);

  return (
    <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold">
          Shared Circles with{" "}
          <span className="text-banibs-gold">
            {otherUser?.displayName || otherUser?.name || "Person"}
          </span>
        </h1>
        <p className="text-sm text-gray-400 max-w-xl">
          See the overlap between your Peoples network and theirs. This helps
          you judge alignment, safety, and how strong the bridge really is.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <SharedCircleViz
            primaryUser={currentUser}
            otherUser={otherUser}
            sharedUsers={sharedUsers}
          />
        </div>
        <div>
          <CircleStatsPanel stats={stats} />
        </div>
      </div>

      {loading && (
        <div className="flex justify-center py-8 text-sm text-gray-400">
          Loading shared circles…
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-500/40 bg-red-900/20 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">
            Shared Peoples{" "}
            <span className="text-xs font-normal text-gray-400">
              ({sharedUsers.length} mutuals)
            </span>
          </h2>

          {sharedUsers.length === 0 ? (
            <div className="rounded-xl border border-gray-700 bg-black/40 px-4 py-6 text-sm text-gray-400">
              No shared connections found yet. This may still be a new or
              separate circle.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sharedUsers.map((u) => (
                <CircleUserCard
                  key={u._id || u.id}
                  user={u}
                  tier={u.relationshipTier}
                  trustScore={u.trustScore}
                  mutualCount={u.mutualCount}
                  onClick={() => {
                    // optional: go to profile or circle depth
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SharedCirclePage;
