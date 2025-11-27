import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

/**
 * ProfileStatsStrip - Phase 8.3
 * Displays relationship tier counts for current user
 * Uses BANIBS UI v2.0 design system
 */
const ProfileStatsStrip = ({ userId }) => {
  const [counts, setCounts] = useState({
    peoples: 0,
    cool: 0,
    alright: 0,
    others: 0,
    blocked: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`${API_URL}/api/relationships/counts`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to load relationship counts');
        }

        const data = await response.json();
        setCounts(data);
      } catch (err) {
        console.error('Error fetching counts:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchCounts();
    }
  }, [userId, API_URL, token]);

  if (loading) {
    return (
      <div className="card-v2 clean-spacing-md">
        <p className="text-secondary-v2 text-sm">Loading stats...</p>
      </div>
    );
  }

  if (error) {
    return null; // Fail silently for stats
  }

  const stats = [
    { key: 'peoples', label: 'Peoples', count: counts.peoples, color: 'text-yellow-400' },
    { key: 'cool', label: 'Cool', count: counts.cool, color: 'text-blue-400' },
    { key: 'alright', label: 'Alright', count: counts.alright, color: 'text-green-400' },
    { key: 'others', label: 'Others', count: counts.others, color: 'text-gray-400' }
  ];

  const totalConnections = stats.reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="card-v2 clean-spacing-md">
      {/* Header */}
      <div className="flex items-center gap-2 breathing-room-sm">
        <Users className="w-4 h-4 text-primary-v2" />
        <h3 className="text-foreground-v2 font-semibold text-sm">
          Your Connections
        </h3>
        <span className="text-secondary-v2 text-xs">
          ({totalConnections} total)
        </span>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 breathing-room-sm">
        {stats.map(({ key, label, count, color }) => (
          <Link
            key={key}
            to={`/social/connections?tier=${key.toUpperCase()}`}
            className="flex flex-col p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors"
          >
            <span className="text-xs text-secondary-v2">{label}</span>
            <span className={`text-2xl font-bold ${color}`}>{count}</span>
          </Link>
        ))}
      </div>

      {/* View All Link */}
      <div className="breathing-room-sm">
        <Link
          to="/social/connections"
          className="btn-v2 btn-v2-ghost btn-v2-sm w-full"
        >
          View All Connections →
        </Link>
      </div>
    </div>
  );
};

export default ProfileStatsStrip;
