/**
 * BANIBS Social Circles Page
 * 
 * Displays community circles (support groups) for users to discover and join
 * UI surfacing only — list + intentional empty states
 * No creation logic, no join rules, no moderation
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, Lock, Globe, ChevronRight, Loader2 } from 'lucide-react';
import SocialLayout from '../../../components/social/SocialLayout';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

// Circle card component
const CircleCard = ({ circle, onClick }) => {
  const privacyIcon = circle.privacy_level === 'public' ? (
    <Globe className="w-4 h-4 text-green-400" />
  ) : (
    <Lock className="w-4 h-4 text-amber-400" />
  );

  const privacyLabel = circle.privacy_level === 'public' ? 'Public' : 'Request to Join';

  // Generate a gradient based on circle pillar
  const pillarColors = {
    community: 'from-purple-500/20 to-indigo-500/10',
    health: 'from-emerald-500/20 to-teal-500/10',
    ability: 'from-blue-500/20 to-cyan-500/10',
  };
  const gradientClass = pillarColors[circle.pillar] || pillarColors.community;

  return (
    <button
      onClick={() => onClick(circle)}
      className={`w-full text-left p-5 rounded-xl border border-white/10 bg-gradient-to-br ${gradientClass} hover:border-white/20 hover:bg-white/5 transition-all group`}
      data-testid={`circle-card-${circle.slug || circle.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* Circle Name */}
          <h3 className="text-lg font-semibold text-white mb-1 truncate group-hover:text-banibs-gold transition-colors">
            {circle.name}
          </h3>

          {/* Description */}
          <p className="text-sm text-gray-400 line-clamp-2 mb-3">
            {circle.description}
          </p>

          {/* Tags */}
          {circle.tags && circle.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {circle.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-gray-300"
                >
                  {tag}
                </span>
              ))}
              {circle.tags.length > 3 && (
                <span className="text-xs text-gray-500">+{circle.tags.length - 3}</span>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {circle.member_count || 0} members
            </span>
            <span className="flex items-center gap-1.5">
              {privacyIcon}
              {privacyLabel}
            </span>
            {circle.is_verified && (
              <span className="flex items-center gap-1 text-blue-400">
                <Shield className="w-3.5 h-3.5" />
                Verified
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors flex-shrink-0 mt-1" />
      </div>
    </button>
  );
};

// Empty state component
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center" data-testid="circles-empty-state">
    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
      <Shield className="w-10 h-10 text-gray-600" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">No Circles Yet</h3>
    <p className="text-gray-400 max-w-md">
      Community circles will appear here once they are created. Check back soon!
    </p>
  </div>
);

// Loading state component
const LoadingState = () => (
  <div className="flex flex-col items-center justify-center py-16" data-testid="circles-loading">
    <Loader2 className="w-8 h-8 text-banibs-gold animate-spin mb-4" />
    <p className="text-gray-400">Loading circles...</p>
  </div>
);

// Error state component
const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center" data-testid="circles-error">
    <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
      <Shield className="w-10 h-10 text-red-400" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">Unable to Load Circles</h3>
    <p className="text-gray-400 mb-6 max-w-md">{message}</p>
    <button
      onClick={onRetry}
      className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
    >
      Try Again
    </button>
  </div>
);

const SocialCirclesPage = () => {
  const navigate = useNavigate();
  const [circles, setCircles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCircles = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/circles`);
      if (!response.ok) {
        throw new Error('Failed to fetch circles');
      }
      const data = await response.json();
      setCircles(data.circles || []);
    } catch (err) {
      console.error('Error fetching circles:', err);
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCircles();
  }, []);

  const handleCircleClick = (circle) => {
    // Navigate to circle detail (placeholder for now - could expand later)
    // For now, just log the click
    console.log('Circle clicked:', circle.name);
    // Future: navigate(`/portal/social/circles/${circle.id}`);
  };

  return (
    <SocialLayout>
      <div className="min-h-screen bg-black" data-testid="social-circles-page">
        {/* Header */}
        <div className="border-b border-white/10 bg-gradient-to-b from-black to-gray-900/50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
            <div className="flex items-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-banibs-gold" />
              <h1 className="text-3xl sm:text-4xl font-bold text-white">
                Circles
              </h1>
            </div>
            <p className="text-base text-gray-400 max-w-2xl">
              Discover and connect with community circles — safe spaces for sharing, support, and meaningful conversations.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          {loading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchCircles} />
          ) : circles.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-4" data-testid="circles-list">
              {circles.map((circle) => (
                <CircleCard
                  key={circle.id}
                  circle={circle}
                  onClick={handleCircleClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </SocialLayout>
  );
};

export default SocialCirclesPage;
