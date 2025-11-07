import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function RegionsChart({ startDate, endDate }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRegionsData();
  }, [startDate, endDate]);

  const fetchRegionsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/admin/analytics/sentiment/by-region?start_date=${startDate}&end_date=${endDate}`,
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
      console.error('Failed to fetch regions data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Regional emoji/icon mapping
  const getRegionEmoji = (region) => {
    const map = {
      'Americas': '🌎',
      'Africa': '🌍',
      'Asia': '🌏',
      'Europe': '🇪🇺',
      'Pacific': '🌊',
      'Global': '🌐'
    };
    return map[region] || '📍';
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const positive = payload.find(p => p.dataKey === 'positive_count')?.value || 0;
      const neutral = payload.find(p => p.dataKey === 'neutral_count')?.value || 0;
      const negative = payload.find(p => p.dataKey === 'negative_count')?.value || 0;
      const total = positive + neutral + negative;
      const region = payload[0].payload.dimension_value;
      const avgSentiment = payload[0].payload.avg_sentiment;
      
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold mb-2 flex items-center gap-2">
            <span>{getRegionEmoji(region)}</span>
            <span>{region}</span>
          </p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-green-400 text-sm">Positive:</span>
              <span className="text-white font-semibold">{positive}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400 text-sm">Neutral:</span>
              <span className="text-white font-semibold">{neutral}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-red-400 text-sm">Critical:</span>
              <span className="text-white font-semibold">{negative}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-700">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-300 text-sm">Total:</span>
                <span className="text-white font-bold">{total}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-300 text-sm">Avg Sentiment:</span>
                <span className="text-white font-bold">{avgSentiment.toFixed(3)}</span>
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
        <h3 className="text-xl font-bold text-white mb-4">Sentiment by Region</h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading regional data...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Sentiment by Region</h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">🌍</div>
            <div className="text-gray-400">No regional data available</div>
            <div className="text-sm text-gray-500 mt-2">Regional analysis will appear here once news data is available</div>
          </div>
        </div>
      </div>
    );
  }

  // Add emojis to data for display
  const dataWithEmojis = data.map(item => ({
    ...item,
    display_name: `${getRegionEmoji(item.dimension_value)} ${item.dimension_value}`
  }));

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Sentiment by Region</h3>
        <div className="text-sm text-gray-400">
          {data.length} region{data.length !== 1 ? 's' : ''}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={dataWithEmojis}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="display_name"
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="square"
          />
          <Bar 
            dataKey="positive_count" 
            stackId="a" 
            fill="#10b981"
            name="Positive"
          />
          <Bar 
            dataKey="neutral_count" 
            stackId="a" 
            fill="#6b7280"
            name="Neutral"
          />
          <Bar 
            dataKey="negative_count" 
            stackId="a" 
            fill="#ef4444"
            name="Critical"
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Regional Map Placeholder */}
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="text-sm text-gray-300">
          💡 <strong>Future Enhancement:</strong> Interactive world map showing sentiment distribution by region.
        </div>
      </div>
    </div>
  );
}

export default RegionsChart;
