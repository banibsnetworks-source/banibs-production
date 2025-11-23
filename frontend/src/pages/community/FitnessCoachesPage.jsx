// pages/community/FitnessCoachesPage.jsx - Phase 11.6.2
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { Dumbbell, MapPin, Award, Star, Video } from "lucide-react";

export default function FitnessCoachesPage() {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlineOnly, setOnlineOnly] = useState(false);

  useEffect(() => {
    fetchCoaches();
  }, [onlineOnly]);

  const fetchCoaches = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (onlineOnly) params.append("online_only", "true");

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/fitness/coaches?${params.toString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setCoaches(data.pros);
      }
    } catch (err) {
      console.error("Failed to fetch coaches:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommunityLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30">
            <Dumbbell className="text-green-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              Fitness Coaches & Trainers
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Connect with certified trainers who understand your journey
            </p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 rounded-xl bg-slate-900/50 border border-slate-800 p-4">
        <button
          onClick={() => setOnlineOnly(!onlineOnly)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
            onlineOnly
              ? "bg-green-500/20 border-2 border-green-500 text-green-300"
              : "bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-slate-600"
          }`}
        >
          <Video size={14} />
          Online Coaches Only
        </button>
      </div>

      {/* Results */}
      <div className="mb-4">
        <p className="text-sm text-slate-400">
          {loading ? "Loading..." : `${coaches.length} coach${coaches.length !== 1 ? 'es' : ''} found`}
        </p>
      </div>

      {/* Coaches Grid */}
      {loading ? (
        <div className="text-sm text-slate-400">Loading coaches...</div>
      ) : coaches.length === 0 ? (
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-8 text-center">
          <Dumbbell className="mx-auto text-slate-600 mb-3" size={48} />
          <h3 className="text-lg font-bold text-slate-100 mb-2">
            No coaches found
          </h3>
          <p className="text-sm text-slate-400">
            Try adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {coaches.map((coach) => (
            <Link
              key={coach.id}
              to={`/portal/community/fitness/coaches/${coach.id}`}
              className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-green-500/50 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 mb-1">
                    {coach.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={12} />
                    <span>
                      {coach.city}, {coach.state}
                    </span>
                  </div>
                </div>
                {coach.is_verified && (
                  <span className="px-2 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[0.65rem] font-semibold text-blue-300">
                    Verified
                  </span>
                )}
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                {coach.bio}
              </p>

              {/* Specializations */}
              {coach.specializations && coach.specializations.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {coach.specializations.slice(0, 3).map((spec) => (
                    <span
                      key={spec}
                      className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30 text-xs text-green-300"
                    >
                      {spec.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              )}

              {/* Rating & Features */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex items-center gap-3 text-xs">
                  {coach.rating && (
                    <div className="flex items-center gap-1 text-yellow-400">
                      <Star size={12} fill="currentColor" />
                      <span>{coach.rating.toFixed(1)}</span>
                    </div>
                  )}
                  {coach.online_only && (
                    <div className="flex items-center gap-1 text-blue-400">
                      <Video size={12} />
                      <span>Online</span>
                    </div>
                  )}
                </div>
                <span className="text-xs font-semibold text-green-400">
                  View Profile →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </CommunityLayout>
  );
}
