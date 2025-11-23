import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, Key, Code, Webhook, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';

function DevDashboardPage() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/developer/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch dashboard');

      const data = await response.json();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  const { stats, quick_start } = dashboard;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            <Code className="inline-block mr-3 text-[#39FF14]" size={40} />
            Developer Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Welcome to BANIBS OS - Build for the culture</p>
        </div>

        {/* Quick Start Section */}
        {(!quick_start.has_api_key || !quick_start.has_app) && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
              <AlertCircle className="mr-2" />
              Quick Start Guide
            </h2>
            <div className="space-y-3">
              {!quick_start.has_api_key && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">1. Create your first API key</span>
                  <Link to="/developer/api-keys" className="px-4 py-2 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition">
                    Create API Key
                  </Link>
                </div>
              )}
              {!quick_start.has_app && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">2. Register your application</span>
                  <Link to="/developer/apps" className="px-4 py-2 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition">
                    Create App
                  </Link>
                </div>
              )}
              {!quick_start.has_webhook && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">3. Set up webhooks (optional)</span>
                  <Link to="/developer/webhooks" className="px-4 py-2 bg-[#39FF14] text-black rounded-lg font-semibold hover:bg-[#2de00f] transition">
                    Configure Webhooks
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* API Keys */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-[#39FF14]/20 rounded-lg p-6 hover:border-[#39FF14]/40 transition">
            <div className="flex items-center justify-between mb-4">
              <Key className="text-[#39FF14]" size={32} />
              <span className="text-sm text-gray-400">Active</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.api_keys.active}</div>
            <div className="text-sm text-gray-400">API Keys</div>
            <div className="mt-4 text-xs text-gray-500">Total: {stats.api_keys.total}</div>
          </div>

          {/* Apps */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-[#39FF14]/20 rounded-lg p-6 hover:border-[#39FF14]/40 transition">
            <div className="flex items-center justify-between mb-4">
              <Code className="text-[#39FF14]" size={32} />
              <span className="text-sm text-gray-400">Active</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.apps.active}</div>
            <div className="text-sm text-gray-400">Applications</div>
            <div className="mt-4 text-xs text-gray-500">Total: {stats.apps.total}</div>
          </div>

          {/* Webhooks */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-[#39FF14]/20 rounded-lg p-6 hover:border-[#39FF14]/40 transition">
            <div className="flex items-center justify-between mb-4">
              <Webhook className="text-[#39FF14]" size={32} />
              <span className="text-sm text-gray-400">Configured</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.webhooks.total}</div>
            <div className="text-sm text-gray-400">Webhooks</div>
            <div className="mt-4 text-xs text-gray-500">Active endpoints</div>
          </div>

          {/* API Calls */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-[#39FF14]/20 rounded-lg p-6 hover:border-[#39FF14]/40 transition">
            <div className="flex items-center justify-between mb-4">
              <Activity className="text-[#39FF14]" size={32} />
              <span className="text-sm text-gray-400">Success Rate</span>
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats.api_calls.success_rate}%</div>
            <div className="text-sm text-gray-400">API Performance</div>
            <div className="mt-4 text-xs text-gray-500">Total calls: {stats.api_calls.total}</div>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/developer/api-keys" className="block">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-[#39FF14]/20 rounded-lg p-6 hover:border-[#39FF14]/60 transition transform hover:scale-105">
              <Key className="text-[#39FF14] mb-4" size={36} />
              <h3 className="text-xl font-bold text-white mb-2">API Keys</h3>
              <p className="text-gray-400 text-sm mb-4">Manage your API keys and access tokens</p>
              <div className="text-[#39FF14] font-semibold">Manage Keys →</div>
            </div>
          </Link>

          <Link to="/developer/apps" className="block">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-[#39FF14]/20 rounded-lg p-6 hover:border-[#39FF14]/60 transition transform hover:scale-105">
              <Code className="text-[#39FF14] mb-4" size={36} />
              <h3 className="text-xl font-bold text-white mb-2">Applications</h3>
              <p className="text-gray-400 text-sm mb-4">Create and manage OAuth applications</p>
              <div className="text-[#39FF14] font-semibold">View Apps →</div>
            </div>
          </Link>

          <Link to="/developer/docs" className="block">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-[#39FF14]/20 rounded-lg p-6 hover:border-[#39FF14]/60 transition transform hover:scale-105">
              <TrendingUp className="text-[#39FF14] mb-4" size={36} />
              <h3 className="text-xl font-bold text-white mb-2">Documentation</h3>
              <p className="text-gray-400 text-sm mb-4">API reference and integration guides</p>
              <div className="text-[#39FF14] font-semibold">Read Docs →</div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default DevDashboardPage;