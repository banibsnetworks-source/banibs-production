import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SummaryStats from '../../components/admin/SummaryStats';
import FilterPanel from '../../components/admin/FilterPanel';
import TrendsChart from '../../components/admin/TrendsChart';
import SourcesChart from '../../components/admin/SourcesChart';
import CategoriesChart from '../../components/admin/CategoriesChart';
import RegionsChart from '../../components/admin/RegionsChart';

function SentimentAnalytics() {
  const [period, setPeriod] = useState('7d');  // Changed from 30d to 7d as approved
  const [contentType, setContentType] = useState('all');
  const [granularity, setGranularity] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Calculate start and end dates based on period
  useEffect(() => {
    const today = new Date();
    const end = today.toISOString().split('T')[0];
    
    let start;
    switch (period) {
      case '7d':
        start = new Date(today.setDate(today.getDate() - 7));
        break;
      case '30d':
        start = new Date(today.setDate(today.getDate() - 30));
        break;
      case '90d':
        start = new Date(today.setDate(today.getDate() - 90));
        break;
      case '1y':
        start = new Date(today.setFullYear(today.getFullYear() - 1));
        break;
      default:
        start = new Date(today.setDate(today.getDate() - 30));
    }
    
    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(end);
  }, [period]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white">BANIBS Admin</h1>
              <p className="text-gray-400 mt-1">Sentiment Analytics Dashboard</p>
            </div>
          </div>
          
          {/* Navigation Tabs */}
          <div className="flex items-center gap-4">
            <Link
              to="/admin/opportunities"
              className="px-4 py-2 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-all text-sm"
            >
              Opportunities
            </Link>
            <Link
              to="/admin/moderation"
              className="px-4 py-2 text-gray-300 font-semibold rounded-lg hover:bg-gray-800 transition-all text-sm"
            >
              Moderation
            </Link>
            <Link
              to="/admin/analytics/sentiment"
              className="px-4 py-2 text-yellow-500 font-semibold rounded-lg hover:bg-gray-800 transition-all text-sm border-b-2 border-yellow-500"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Stats */}
        <SummaryStats period={period} contentType={contentType} />

        {/* Filter Panel */}
        <FilterPanel
          period={period}
          setPeriod={setPeriod}
          contentType={contentType}
          setContentType={setContentType}
          granularity={granularity}
          setGranularity={setGranularity}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        {/* Trends Chart */}
        <TrendsChart
          startDate={startDate}
          endDate={endDate}
          granularity={granularity}
          contentType={contentType}
        />

        {/* Coming Soon Placeholders */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Source Chart Placeholder */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Sentiment by Source</h3>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-4xl mb-2">📰</div>
                <div className="text-gray-400 text-sm">Coming in Day 3</div>
              </div>
            </div>
          </div>

          {/* By Category Chart Placeholder */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6">
            <h3 className="text-xl font-bold text-white mb-4">Sentiment by Category</h3>
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <div className="text-gray-400 text-sm">Coming in Day 3</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="mt-8 bg-blue-900/20 border border-blue-500/30 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-2">ℹ️ About Sentiment Analytics</h3>
          <p className="text-gray-300 text-sm">
            This dashboard aggregates sentiment data from news articles and resources. Sentiment is calculated
            using rule-based analysis and updated daily at 00:30 UTC. Positive sentiment indicates uplifting
            content, neutral indicates factual reporting, and critical indicates important or concerning content.
          </p>
        </div>
      </div>
    </div>
  );
}

export default SentimentAnalytics;
