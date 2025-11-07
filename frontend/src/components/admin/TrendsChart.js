import React, { useState, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function TrendsChart({ startDate, endDate, granularity, contentType }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrendsData();
  }, [startDate, endDate, granularity, contentType]);

  const fetchTrendsData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${BACKEND_URL}/api/admin/analytics/sentiment/trends?start_date=${startDate}&end_date=${endDate}&granularity=${granularity}&content_type=${contentType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const result = await response.json();
        setData(result.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch trends data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const total = payload.reduce((sum, entry) => sum + entry.value, 0);
      
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-green-400 text-sm flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                Positive:
              </span>
              <span className="text-white font-semibold">{payload[0]?.value || 0}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-400 text-sm flex items-center gap-2">
                <span className="w-3 h-3 bg-gray-500 rounded-full"></span>
                Neutral:
              </span>
              <span className="text-white font-semibold">{payload[1]?.value || 0}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-red-400 text-sm flex items-center gap-2">
                <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                Critical:
              </span>
              <span className="text-white font-semibold">{payload[2]?.value || 0}</span>
            </div>
            <div className="pt-2 mt-2 border-t border-gray-700">
              <div className="flex items-center justify-between gap-4">
                <span className="text-gray-300 text-sm font-semibold">Total:</span>
                <span className="text-white font-bold">{total}</span>
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
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Sentiment Trends Over Time</h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading chart data...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold text-white mb-4">Sentiment Trends Over Time</h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-gray-400">No trend data available for this period</div>
            <div className="text-sm text-gray-500 mt-2">Try selecting a different date range</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Sentiment Trends Over Time</h3>
        <div className="text-sm text-gray-400">
          {data.length} data point{data.length !== 1 ? 's' : ''}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorPositive" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorNeutral" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6b7280" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#6b7280" stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="colorNegative" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="positive_count"
            stackId="1"
            stroke="#10b981"
            fill="url(#colorPositive)"
            name="Positive"
          />
          <Area
            type="monotone"
            dataKey="neutral_count"
            stackId="1"
            stroke="#6b7280"
            fill="url(#colorNeutral)"
            name="Neutral"
          />
          <Area
            type="monotone"
            dataKey="negative_count"
            stackId="1"
            stroke="#ef4444"
            fill="url(#colorNegative)"
            name="Critical"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default TrendsChart;
