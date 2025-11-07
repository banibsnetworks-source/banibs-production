import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function CategoriesChart({ startDate, endDate, contentType }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategoriesData();
  }, [startDate, endDate, contentType]);

  const fetchCategoriesData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(
        `${BACKEND_URL}/api/admin/analytics/sentiment/by-category?start_date=${startDate}&end_date=${endDate}`,
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
      console.error('Failed to fetch categories data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const positive = payload.find(p => p.dataKey === 'positive_count')?.value || 0;
      const neutral = payload.find(p => p.dataKey === 'neutral_count')?.value || 0;
      const negative = payload.find(p => p.dataKey === 'negative_count')?.value || 0;
      const total = positive + neutral + negative;
      const category = payload[0].payload.dimension_value;
      
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-4 shadow-xl">
          <p className="text-white font-semibold mb-2">{category}</p>
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
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Sentiment by Category</h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-400">Loading category data...</div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Sentiment by Category</h3>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="text-6xl mb-4">📊</div>
            <div className="text-gray-400">No category data available</div>
            <div className="text-sm text-gray-500 mt-2">Categories will appear here once data is available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Sentiment by Category</h3>
        <div className="text-sm text-gray-400">
          {data.length} categor{data.length !== 1 ? 'ies' : 'y'}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="dimension_value"
            stroke="#9ca3af"
            style={{ fontSize: '11px' }}
            angle={-45}
            textAnchor="end"
            height={80}
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
    </div>
  );
}

export default CategoriesChart;
