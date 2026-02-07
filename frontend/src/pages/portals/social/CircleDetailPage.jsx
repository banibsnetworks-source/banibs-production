/**
 * BANIBS Circle Detail Page (v1)
 * 
 * Displays a single circle's details
 * - Name, description, tags, privacy, member count
 * - Join/Request button (placeholder)
 * - "Circle feed coming soon" empty state
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  CircleDot, Users, Lock, Globe, ArrowLeft, Loader2,
  Heart, Sparkles, BookHeart, UsersRound, UserPlus
} from 'lucide-react';
import SocialLayout from '../../../components/social/SocialLayout';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Circle type UI config
const CIRCLE_TYPE_CONFIG = {
  community: { label: 'Community Circle', icon: UsersRound, color: 'text-purple-400' },
  support: { label: 'Support Group', icon: Heart, color: 'text-blue-400' },
  prayer: { label: 'Prayer Room', icon: Sparkles, color: 'text-amber-400' },
  faith: { label: 'Faith Circle', icon: BookHeart, color: 'text-emerald-400' }
};

const CircleDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joinStatus, setJoinStatus] = useState(null); // null | 'joining' | 'joined' | 'requested'

  useEffect(() => {
    const fetchCircle = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch all circles and find by slug
        const response = await fetch(`${API_URL}/api/circles?limit=100`);
        if (!response.ok) throw new Error('Failed to fetch circle');
        
        const data = await response.json();
        const found = data.circles?.find(c => c.slug === slug);
        
        if (!found) {
          setError('Circle not found');
        } else {
          setCircle(found);
        }
      } catch (err) {
        console.error('Error fetching circle:', err);
        setError(err.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCircle();
  }, [slug]);

  const handleJoin = () => {
    // Placeholder join action
    setJoinStatus('joining');
    setTimeout(() => {
      if (circle?.privacy_level === 'public') {
        setJoinStatus('joined');
      } else {
        setJoinStatus('requested');
      }
    }, 1000);
  };

  const handleBack = () => {
    navigate('/portal/social/circles');
  };

  // Loading state
  if (loading) {
    return (
      <SocialLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-banibs-gold animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading circle...</p>
          </div>
        </div>
      </SocialLayout>
    );
  }

  // Error state
  if (error || !circle) {
    return (
      <SocialLayout>
        <div className="min-h-screen bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Circles
            </button>
            
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Circle Not Found</h2>
              <p className="text-gray-400 mb-6">This circle doesn't exist or has been removed.</p>
              <button
                onClick={handleBack}
                className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
              >
                Browse All Circles
              </button>
            </div>
          </div>
        </div>
      </SocialLayout>
    );
  }

  // Get type config
  const circleType = circle.circle_type || 'community';
  const typeConfig = CIRCLE_TYPE_CONFIG[circleType] || CIRCLE_TYPE_CONFIG.community;
  const TypeIcon = typeConfig.icon;

  const isPublic = circle.privacy_level === 'public';
  const PrivacyIcon = isPublic ? Globe : Lock;
  const privacyLabel = isPublic ? 'Public' : 'Request to Join';

  return (
    <SocialLayout>
      <div className="min-h-screen bg-black" data-testid="circle-detail-page">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-b from-black to-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
            {/* Back button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
              data-testid="back-to-circles"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Circles
            </button>

            {/* Circle header */}
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                {/* Type badge */}
                <div className={`flex items-center gap-2 text-sm ${typeConfig.color} mb-3`}>
                  <TypeIcon className="w-4 h-4" />
                  <span>{typeConfig.label}</span>
                </div>

                {/* Name */}
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3" data-testid="circle-name">
                  {circle.name}
                </h1>

                {/* Description */}
                <p className="text-gray-400 text-lg mb-4" data-testid="circle-description">
                  {circle.description}
                </p>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {circle.member_count || 0} members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <PrivacyIcon className="w-4 h-4" />
                    {privacyLabel}
                  </span>
                  {circle.is_verified && (
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <Shield className="w-4 h-4" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              {/* Join button */}
              <div className="sm:ml-4">
                {joinStatus === 'joined' ? (
                  <button
                    disabled
                    className="flex items-center gap-2 px-6 py-3 bg-green-600/20 text-green-400 rounded-lg font-medium"
                    data-testid="joined-button"
                  >
                    <Shield className="w-5 h-5" />
                    Joined
                  </button>
                ) : joinStatus === 'requested' ? (
                  <button
                    disabled
                    className="flex items-center gap-2 px-6 py-3 bg-amber-600/20 text-amber-400 rounded-lg font-medium"
                    data-testid="requested-button"
                  >
                    <Lock className="w-5 h-5" />
                    Request Sent
                  </button>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={joinStatus === 'joining'}
                    className="flex items-center gap-2 px-6 py-3 bg-banibs-gold hover:bg-banibs-gold/90 text-black rounded-lg font-medium transition-colors disabled:opacity-50"
                    data-testid="join-button"
                  >
                    {joinStatus === 'joining' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <UserPlus className="w-5 h-5" />
                    )}
                    {isPublic ? 'Join Circle' : 'Request to Join'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {/* Tags */}
          {circle.tags && circle.tags.length > 0 && (
            <div className="mb-8">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-3">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {circle.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-white/10 text-gray-300 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Rules */}
          {circle.rules && circle.rules.length > 0 && (
            <div className="mb-8 p-6 rounded-xl bg-white/5 border border-white/10">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Circle Guidelines</h3>
              <ul className="space-y-2">
                {circle.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-banibs-gold mt-2 flex-shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety notes */}
          {circle.safety_notes && (
            <div className="mb-8 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-400 mb-1">Safety Note</h4>
                  <p className="text-gray-300 text-sm">{circle.safety_notes}</p>
                </div>
              </div>
            </div>
          )}

          {/* Feed placeholder */}
          <div className="border-t border-white/10 pt-8">
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <UsersRound className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Circle Feed Coming Soon</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Posts and discussions from circle members will appear here. Join the circle to be notified when the feed launches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SocialLayout>
  );
};

export default CircleDetailPage;
