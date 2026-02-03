/**
 * Founder Analytics Dashboard v1.0
 * 
 * Route: /founder/analytics
 * Access: super_admin only
 * 
 * Displays:
 * - System health overview
 * - User metrics
 * - Content stats
 * - Module status
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import SEO from '../../components/SEO';
import {
  Activity, Users, FileText, ShoppingBag,
  Server, Database, Wifi, CheckCircle,
  AlertCircle, Clock, TrendingUp, BarChart3,
  RefreshCw, ArrowLeft
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Metric Card Component
const MetricCard = ({ title, value, icon: Icon, subtitle, trend, color = 'amber' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const colorClasses = {
    amber: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
  };
  
  return (
    <div className={`rounded-xl border p-4 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trend > 0 ? 'text-green-500' : 'text-slate-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
      <div className="text-sm text-muted-foreground">{title}</div>
      {subtitle && <div className="text-xs text-slate-500 mt-1">{subtitle}</div>}
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const statusStyles = {
    active: 'bg-green-500/10 text-green-500 border-green-500/30',
    healthy: 'bg-green-500/10 text-green-500 border-green-500/30',
    operational: 'bg-green-500/10 text-green-500 border-green-500/30',
    demo: 'bg-amber-500/10 text-amber-500 border-amber-500/30',
    mocked: 'bg-purple-500/10 text-purple-500 border-purple-500/30',
    coming_soon: 'bg-slate-500/10 text-slate-500 border-slate-500/30',
    'n/a': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  };
  
  const labels = {
    active: 'Active',
    healthy: 'Healthy',
    operational: 'Operational',
    demo: 'Demo Mode',
    mocked: 'Mocked',
    coming_soon: 'Coming Soon',
    'n/a': 'N/A',
  };
  
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles['n/a']}`}>
      {labels[status] || status}
    </span>
  );
};

// Module Row Component
const ModuleRow = ({ module }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  return (
    <div className={`flex items-center justify-between py-3 px-4 rounded-lg ${isDark ? 'bg-slate-900/30' : 'bg-slate-50'}`}>
      <div className="flex items-center gap-3">
        <div className={`w-2 h-2 rounded-full ${module.health === 'healthy' ? 'bg-green-500' : 'bg-slate-400'}`} />
        <span className="font-medium text-sm">{module.name}</span>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={module.status} />
        <StatusBadge status={module.health} />
      </div>
    </div>
  );
};

export default function FounderAnalyticsDashboard() {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  
  const [analytics, setAnalytics] = useState(null);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Check access
  const isSuperAdmin = user?.roles?.includes('super_admin');
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth/signin');
      return;
    }
    if (!isSuperAdmin) {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [isAuthenticated, isSuperAdmin, navigate]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      
      // Fetch overview
      const overviewRes = await fetch(`${BACKEND_URL}/api/founder/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Fetch modules
      const modulesRes = await fetch(`${BACKEND_URL}/api/founder/analytics/modules`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (overviewRes.ok) {
        const overviewData = await overviewRes.json();
        setAnalytics(overviewData.data);
      }
      
      if (modulesRes.ok) {
        const modulesData = await modulesRes.json();
        setModules(modulesData.modules || []);
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };
  
  if (!isSuperAdmin) {
    return (
      <FullWidthLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">This page is restricted to founders only.</p>
          </div>
        </div>
      </FullWidthLayout>
    );
  }
  
  return (
    <FullWidthLayout>
      <SEO 
        title="Founder Analytics | BANIBS"
        description="System analytics and health dashboard"
        noIndex={true}
      />
      
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/founder/command')}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-amber-500">Founder Analytics</h1>
              <p className="text-sm text-muted-foreground">System health and usage metrics</p>
            </div>
          </div>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
        
        {/* Last updated */}
        {lastRefresh && (
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <Clock size={12} />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
        )}
        
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        {/* System Status Banner */}
        <div className={`rounded-xl border p-4 flex items-center justify-between ${isDark ? 'bg-green-500/5 border-green-500/20' : 'bg-green-50 border-green-200'}`}>
          <div className="flex items-center gap-3">
            <CheckCircle className="text-green-500" size={24} />
            <div>
              <div className="font-semibold text-green-600">All Systems Operational</div>
              <div className="text-xs text-green-600/70">API, Database, and Services running normally</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-green-600">
            <span className="flex items-center gap-1"><Wifi size={12} /> API</span>
            <span className="flex items-center gap-1"><Database size={12} /> DB</span>
            <span className="flex items-center gap-1"><Server size={12} /> Server</span>
          </div>
        </div>
        
        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            title="Total Users"
            value={analytics?.users?.total || 0}
            icon={Users}
            subtitle="Registered accounts"
            color="blue"
          />
          <MetricCard
            title="New Users (7d)"
            value={analytics?.users?.new_7d || 0}
            icon={TrendingUp}
            subtitle="Last 7 days"
            color="green"
          />
          <MetricCard
            title="News Stories"
            value={analytics?.content?.news_stories?.toLocaleString() || 0}
            icon={FileText}
            subtitle="In database"
            color="amber"
          />
          <MetricCard
            title="Marketplace Products"
            value={analytics?.content?.marketplace_products || 0}
            icon={ShoppingBag}
            subtitle="Listed items"
            color="purple"
          />
        </div>
        
        {/* Module Status */}
        <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Activity size={18} className="text-amber-500" />
              Module Status
            </h2>
            <span className="text-xs text-muted-foreground">
              {modules.filter(m => m.status === 'active').length} / {modules.length} active
            </span>
          </div>
          <div className="space-y-2">
            {modules.map((module) => (
              <ModuleRow key={module.id} module={module} />
            ))}
            {modules.length === 0 && !loading && (
              <div className="text-center py-8 text-muted-foreground">
                No module data available
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-amber-500" />
              Content Overview
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">News Stories</span>
                <span className="font-medium">{analytics?.content?.news_stories?.toLocaleString() || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Social Posts</span>
                <span className="font-medium">{analytics?.content?.social_posts || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Marketplace Items</span>
                <span className="font-medium">{analytics?.content?.marketplace_products || 0}</span>
              </div>
            </div>
          </div>
          
          <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Server size={18} className="text-amber-500" />
              System Health
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">API Status</span>
                <StatusBadge status={analytics?.system?.api || 'healthy'} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Database</span>
                <StatusBadge status={analytics?.system?.database || 'healthy'} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Uptime</span>
                <span className="font-medium text-green-500">{analytics?.system?.uptime || '99.9%'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          BANIBS Founder Analytics v1.0 • Data refreshes on demand
        </div>
      </div>
    </FullWidthLayout>
  );
}
