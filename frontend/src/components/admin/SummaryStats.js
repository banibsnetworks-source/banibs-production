import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function SummaryStats({ period = '30d', contentType = 'all' }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period, contentType]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/admin/analytics/sentiment/summary?period=${period}&content_type=${contentType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to fetch summary stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 animate-pulse">
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-3"></div>
            <div className="h-8 bg-gray-800 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return '↗️';
    if (trend === 'declining') return '↘️';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'text-green-400';
    if (trend === 'declining') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="mb-8">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Total Items */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-semibold">Total Items</span>
            <span className="text-2xl">📊</span>
          </div>
          <div className="text-4xl font-bold text-white mb-2">
            {stats.total_items.toLocaleString()}
          </div>
          <div className={`text-sm font-medium ${getTrendColor(stats.trend)}`}>
            {getTrendIcon(stats.trend)} {stats.trend.charAt(0).toUpperCase() + stats.trend.slice(1)}
          </div>
        </div>

        {/* Positive */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-semibold">Positive</span>
            <span className="text-2xl">🟢</span>
          </div>
          <div className="text-4xl font-bold text-green-400 mb-2">
            {stats.positive_count.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            {stats.positive_percentage.toFixed(1)}% of total
          </div>
        </div>

        {/* Neutral */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-600/20 rounded-xl p-6 hover:border-gray-600/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-semibold">Neutral</span>
            <span className="text-2xl">⚪</span>
          </div>
          <div className="text-4xl font-bold text-gray-300 mb-2">
            {stats.neutral_count.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            {stats.neutral_percentage.toFixed(1)}% of total
          </div>
        </div>

        {/* Negative */}
        <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm font-semibold">Critical</span>
            <span className="text-2xl">🔴</span>
          </div>
          <div className="text-4xl font-bold text-red-400 mb-2">
            {stats.negative_count.toLocaleString()}
          </div>
          <div className="text-sm text-gray-400">
            {stats.negative_percentage.toFixed(1)}% of total
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900/30 border border-gray-800 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Average Sentiment</div>
          <div className="text-2xl font-bold text-white">
            {stats.avg_sentiment.toFixed(3)}
          </div>
        </div>
        
        {stats.most_positive_source && (
          <div className="bg-gray-900/30 border border-green-500/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Most Positive Source</div>
            <div className="text-lg font-semibold text-green-400 truncate">
              {stats.most_positive_source}
            </div>
          </div>
        )}
        
        {stats.most_negative_source && (
          <div className="bg-gray-900/30 border border-red-500/20 rounded-lg p-4">
            <div className="text-sm text-gray-400 mb-1">Most Critical Source</div>
            <div className="text-lg font-semibold text-red-400 truncate">
              {stats.most_negative_source}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SummaryStats;
