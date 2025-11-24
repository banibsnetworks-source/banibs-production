// pages/ability/support-groups/AbilitySupportGroupsPage.jsx - Phase 11.5.3
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Users, Shield, ArrowLeft } from "lucide-react";

export default function AbilitySupportGroupsPage() {
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    fetchCircles();
  }, [activeFilter]);

  const fetchCircles = async () => {
    try {
      const params = new URLSearchParams({
        pillar: 'ability',
        limit: '50'
      });

      if (activeFilter === 'for_me') {
        params.append('audience', 'self');
      } else if (activeFilter === 'for_caregivers') {
        params.append('audience', 'caregiver');
      } else if (activeFilter === 'featured') {
        params.append('featured_only', 'true');
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/circles?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        setCircles(data.circles);
      }
    } catch (err) {
      console.error("Failed to fetch support groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAudienceBadge = (audience) => {
    const badges = {
      self: { text: 'For Me', color: 'purple' },
      caregiver: { text: 'For Caregivers', color: 'blue' },
      both: { text: 'Everyone', color: 'green' }
    };
    return badges[audience] || badges.both;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="text-sm text-slate-400">Loading support groups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/portal/ability"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft size={16} />
            Back to Ability Network
          </Link>
        </div>

        {/* Hero */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <Users className="text-purple-400" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">
                Support Groups
              </h1>
              <p className="text-base text-slate-300 mt-1">
                You don't have to do this alone. Connect with others who understand.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              activeFilter === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-purple-500/50'
            }`}
          >
            All Groups
          </button>
          <button
            onClick={() => setActiveFilter('for_me')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              activeFilter === 'for_me'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-purple-500/50'
            }`}
          >
            For Me
          </button>
          <button
            onClick={() => setActiveFilter('for_caregivers')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              activeFilter === 'for_caregivers'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-purple-500/50'
            }`}
          >
            For Caregivers
          </button>
          <button
            onClick={() => setActiveFilter('featured')}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition ${
              activeFilter === 'featured'
                ? 'bg-purple-500 text-white'
                : 'bg-slate-800 border border-slate-700 text-slate-300 hover:border-purple-500/50'
            }`}
          >
            Featured
          </button>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-slate-400">
            <span className="font-semibold text-slate-200">{circles.length}</span> support groups
          </p>
        </div>

        {/* Groups Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {circles.map((circle) => {
            const audienceBadge = getAudienceBadge(circle.audience);
            return (
              <Link
                key={circle.id}
                to={`/portal/ability/support-groups/${circle.id}`}
                className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 hover:border-purple-500/50 transition block"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-slate-100 flex-1">
                    {circle.name}
                  </h3>
                  {circle.is_verified && (
                    <div className="ml-2 p-1 rounded-full bg-purple-500/10 border border-purple-500/30">
                      <Shield size={14} className="text-purple-300" />
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                  {circle.description}
                </p>

                {/* Tags & Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className={`px-2 py-1 rounded-md bg-${audienceBadge.color}-500/10 border border-${audienceBadge.color}-500/30 text-xs font-semibold text-${audienceBadge.color}-300`}>
                    {audienceBadge.text}
                  </span>
                  {circle.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300"
                    >
                      {tag}
                    </span>
                  ))}
                  {circle.tags.length > 2 && (
                    <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-400">
                      +{circle.tags.length - 2} more
                    </span>
                  )}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{circle.member_count} members</span>
                  </div>
                  {circle.post_count > 0 && (
                    <div>
                      <span>{circle.post_count} posts</span>
                    </div>
                  )}
                  {circle.privacy_level === 'request_to_join' && (
                    <span className="text-purple-400">Request to Join</span>
                  )}
                </div>

                {/* Safety Note */}
                {circle.safety_notes && (
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="flex items-start gap-2 text-xs text-slate-400">
                      <Shield size={12} className="text-purple-400 flex-shrink-0 mt-0.5" />
                      <span>{circle.safety_notes}</span>
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>

        {circles.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-600 mb-4" size={64} />
            <h3 className="text-lg font-bold text-slate-300 mb-2">No groups found</h3>
            <p className="text-sm text-slate-400">
              Try adjusting your filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
