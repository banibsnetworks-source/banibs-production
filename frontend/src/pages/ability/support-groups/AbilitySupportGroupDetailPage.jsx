// pages/ability/support-groups/AbilitySupportGroupDetailPage.jsx - Phase 11.5.3
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Heart, 
  ArrowLeft, 
  Users, 
  Shield, 
  Lock,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function AbilitySupportGroupDetailPage() {
  const { circleId } = useParams();
  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [joinStatus, setJoinStatus] = useState(null);

  useEffect(() => {
    fetchCircle();
  }, [circleId]);

  const fetchCircle = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/circles/${circleId}`
      );

      if (response.ok) {
        const data = await response.json();
        setCircle(data);
      } else if (response.status === 404) {
        setError("Support group not found");
      } else {
        setError("Failed to load support group");
      }
    } catch (err) {
      console.error("Failed to fetch circle:", err);
      setError("Failed to load support group");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setJoining(true);
    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError("Please log in to join support groups");
        setJoining(false);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/circles/${circleId}/join`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setJoinStatus(data.status);
        if (data.status === 'active') {
          setCircle(prev => ({
            ...prev,
            member_count: prev.member_count + 1
          }));
        }
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to join group");
      }
    } catch (err) {
      console.error("Join error:", err);
      setError("Failed to join group");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="text-sm text-slate-400">Loading support group...</div>
      </div>
    );
  }

  if (error || !circle) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-4xl mx-auto p-6">
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-6 text-center">
            <AlertCircle className="mx-auto text-rose-400 mb-3" size={48} />
            <h2 className="text-lg font-bold text-slate-100 mb-2">{error}</h2>
            <Link
              to="/portal/ability/support-groups"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition"
            >
              <ArrowLeft size={16} />
              Back to Support Groups
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const getAudienceBadge = (audience) => {
    const badges = {
      self: { text: 'For Me', color: 'purple' },
      caregiver: { text: 'For Caregivers', color: 'blue' },
      both: { text: 'Everyone', color: 'green' }
    };
    return badges[audience] || badges.both;
  };

  const audienceBadge = getAudienceBadge(circle.audience);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/portal/ability/support-groups"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft size={16} />
            Back to Support Groups
          </Link>
        </div>

        {/* Header */}
        <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                <Users className="text-purple-400" size={32} />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-100 mb-1">
                  {circle.name}
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    <span>{circle.member_count} members</span>
                  </div>
                  {circle.post_count > 0 && (
                    <span>{circle.post_count} posts</span>
                  )}
                </div>
              </div>
            </div>
            {circle.is_verified && (
              <div className="ml-2 flex items-center gap-2 px-3 py-2 rounded-full bg-purple-500/10 border border-purple-500/30">
                <Shield size={16} className="text-purple-300" />
                <span className="text-sm font-semibold text-purple-300">Verified</span>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={`px-3 py-1 rounded-full bg-${audienceBadge.color}-500/10 border border-${audienceBadge.color}-500/30 text-xs font-semibold text-${audienceBadge.color}-300`}>
              {audienceBadge.text}
            </span>
            {circle.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">
            {circle.description}
          </p>
        </div>

        {/* Safety Notes */}
        {circle.safety_notes && (
          <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-5 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="text-purple-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-bold text-purple-100 mb-1">Safety & Community Guidelines</h3>
                <p className="text-sm text-slate-300">{circle.safety_notes}</p>
              </div>
            </div>
          </div>
        )}

        {/* Rules */}
        {circle.rules && circle.rules.length > 0 && (
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 mb-6">
            <h3 className="text-base font-bold text-slate-100 mb-4">Group Rules</h3>
            <ul className="space-y-2">
              {circle.rules.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                  <CheckCircle size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{rule}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Privacy Level Info */}
        {circle.privacy_level !== 'public' && (
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-5 mb-6">
            <div className="flex items-start gap-3">
              <Lock className="text-blue-400 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="text-sm font-bold text-blue-100 mb-1">Privacy</h3>
                <p className="text-sm text-slate-300">
                  {circle.privacy_level === 'request_to_join' 
                    ? 'This group requires approval to join. Your request will be reviewed by moderators.'
                    : 'This is an invite-only group. You must be invited by a current member to join.'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Join Section */}
        {joinStatus === 'active' ? (
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-6 text-center">
            <CheckCircle className="mx-auto text-green-400 mb-3" size={48} />
            <h3 className="text-lg font-bold text-slate-100 mb-2">You're in!</h3>
            <p className="text-sm text-slate-300 mb-4">
              Welcome to {circle.name}. Start connecting with the community.
            </p>
            <Link
              to="/portal/circles"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition"
            >
              View in Circles Portal
            </Link>
          </div>
        ) : joinStatus === 'pending' ? (
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-6 text-center">
            <Clock className="mx-auto text-blue-400 mb-3" size={48} />
            <h3 className="text-lg font-bold text-slate-100 mb-2">Request Pending</h3>
            <p className="text-sm text-slate-300">
              Your join request is being reviewed. You'll be notified when you're approved.
            </p>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 text-center">
            <h3 className="text-lg font-bold text-slate-100 mb-2">Ready to join?</h3>
            <p className="text-sm text-slate-300 mb-4">
              Connect with others who understand your journey
            </p>
            <button
              onClick={handleJoin}
              disabled={joining}
              className="px-8 py-3 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition disabled:opacity-50"
            >
              {joining ? "Joining..." : "Join Group"}
            </button>
            {error && (
              <p className="mt-3 text-sm text-rose-400">{error}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
