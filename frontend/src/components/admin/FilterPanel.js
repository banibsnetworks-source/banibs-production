import React from 'react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function FilterPanel({ 
  period, 
  setPeriod, 
  contentType, 
  setContentType, 
  granularity, 
  setGranularity,
  startDate,
  setStartDate,
  endDate,
  setEndDate 
}) {
  
  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = `${BACKEND_URL}/api/admin/analytics/sentiment/export?start_date=${startDate}&end_date=${endDate}&dimension=overall&granularity=${granularity}&format=csv`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `sentiment_analytics_${startDate}_to_${endDate}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    }
  };

  const handleExportJSON = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const url = `${BACKEND_URL}/api/admin/analytics/sentiment/export?start_date=${startDate}&end_date=${endDate}&dimension=overall&granularity=${granularity}&format=json`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `sentiment_analytics_${startDate}_to_${endDate}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
      } else {
        alert('Export failed. Please try again.');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed. Please try again.');
    }
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Period Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Time Period
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>

        {/* Content Type Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Content Type
          </label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="all">All Content</option>
            <option value="news">News Only</option>
            <option value="resource">Resources Only</option>
          </select>
        </div>

        {/* Granularity Selector */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Granularity
          </label>
          <select
            value={granularity}
            onChange={(e) => setGranularity(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>

        {/* Export Buttons */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Export Data
          </label>
          <div className="flex gap-2">
            <button
              onClick={handleExportCSV}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg px-4 py-2.5 transition-colors"
            >
              📊 CSV
            </button>
            <button
              onClick={handleExportJSON}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors"
            >
              {} JSON
            </button>
          </div>
        </div>
      </div>

      {/* Date Range Display */}
      <div className="mt-4 pt-4 border-t border-gray-800">
        <div className="text-sm text-gray-400">
          Showing data from <span className="text-white font-semibold">{startDate}</span> to{' '}
          <span className="text-white font-semibold">{endDate}</span>
        </div>
      </div>
    </div>
  );
}

export default FilterPanel;
