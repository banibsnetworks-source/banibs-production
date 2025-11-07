import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function SourcesChart({ startDate, endDate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSourcesData();
  }, [startDate, endDate]);

  const fetchSourcesData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/admin/analytics/sentiment/by-source?start_date=${startDate}&end_date=${endDate}&limit=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setData(result.items || []);
      }
    } catch (err) {
      console.error('Failed to fetch sources data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Determine bar color based on avg sentiment
  const getColor = (avgSentiment) => {
    if (avgSentiment > 0.1) return '#10b981'; // Green for positive
    if (avgSentiment < -0.1) return '#ef4444'; // Red for negative
    return '#6b7280'; // Gray for neutral
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold mb-2">{item.dimension_value}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400 text-sm">Total Items:</span>
              <span className="text-white font-semibold">{item.total_items}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-green-400 text-sm">Positive:</span>
              <span className="text-white font-semibold">{item.positive_count} ({item.positive_pct}%)</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400 text-sm">Neutral:</span>
              <span className="text-white font-semibold">{item.neutral_count} ({item.neutral_pct}%)</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-red-400 text-sm">Critical:</span>
              <span className="text-white font-semibold">{item.negative_count} ({item.negative_pct}%)</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-700">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-300 text-sm">Avg Sentiment:</span>
                <span className="text-white font-bold">{item.avg_sentiment.toFixed(3)}</span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Sentiment by Source</h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading source data...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Sentiment by Source</h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📰</div>
            <div className="text-gray-400">No source data available</div>
            <div className="text-sm text-gray-500 mt-2">News sources will appear here once data is available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Sentiment by Source (Top 10)</h3>
        <div className="text-sm text-gray-400">
          {data.length} source{data.length !== 1 ? 's' : ''}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            type="number"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            type="category"
            dataKey="dimension_value"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
            width={140}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="total_items" radius={[0, 8, 8, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.avg_sentiment)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-300">Positive (&gt; 0.1)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded"></div>
          <span className="text-gray-300">Neutral (-0.1 to 0.1)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-300">Critical (&lt; -0.1)</span>
        </div>
      </div>
    </div>
  );
}

export default SourcesChart;
