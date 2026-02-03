/**
 * Founder Analytics Dashboard v1.0
 * 
 * Route: /founder/analytics
 * Access: super_admin only
 * 
 * Displays:
 * - Total users
 * - Total articles/posts
 * - Marketplace demo orders
 * - System health (backend, DB, version)
 * 
 * NO tracking pixels, NO invasive analytics
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import SEO from '../../components/SEO';
import {
  Users, FileText, ShoppingBag, MessageSquare,
  Server, Database, CheckCircle, XCircle,
  RefreshCw, ArrowLeft, Clock, Activity
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

// Simple Metric Card
const MetricCard = ({ title, value, icon: Icon, color = 'amber' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const colorClasses = {
    amber: 'text-amber-500 bg-amber-500/10',
    green: 'text-green-500 bg-green-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
  };
  
  return (
    <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon size={24} />
        </div>
        <div>
          <div className="text-3xl font-bold text-foreground">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </div>
      </div>
    </div>
  );
};

// Health Status Row
const HealthRow = ({ label, status, isBoolean = false }) => {
  const isHealthy = isBoolean ? status === true : status === 'healthy';
  
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        {isHealthy ? (
          <CheckCircle size={16} className="text-green-500" />
        ) : (
          <XCircle size={16} className="text-red-500" />
        )}
        <span className={`text-sm font-medium ${isHealthy ? 'text-green-500' : 'text-red-500'}`}>
          {isBoolean ? (status ? 'Yes' : 'No') : status}
        </span>
      </div>
    </div>
  );
};

export default function FounderAnalyticsDashboard() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(null);
  
  // Check access - super_admin only
  const isSuperAdmin = user?.roles?.includes('super_admin');
  
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/auth/signin');
      return;
    }
    
    if (user && !isSuperAdmin) {
      navigate('/');
      return;
    }
    
    if (user && isSuperAdmin) {
      fetchAnalytics();
    }
  }, [user, isSuperAdmin, navigate]);
  
  const fetchAnalytics = async () => {
    setLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${BACKEND_URL}/api/founder/analytics/overview`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data.data);
      }
      
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Loading state
  if (!user || loading) {
    return (
      <FullWidthLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <RefreshCw size={32} className="mx-auto mb-4 text-amber-500 animate-spin" />
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        </div>
      </FullWidthLayout>
    );
  }
  
  // Access denied
  if (!isSuperAdmin) {
    return (
      <FullWidthLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <XCircle size={48} className="mx-auto mb-4 text-red-500" />
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">super_admin role required</p>
          </div>
        </div>
      </FullWidthLayout>
    );
  }
  
  return (
    <FullWidthLayout>
      <SEO 
        title="Founder Analytics | BANIBS"
        description="System analytics dashboard"
        noIndex={true}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
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
              <p className="text-sm text-muted-foreground">System metrics • super_admin only</p>
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
        
        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-4">
          <MetricCard
            title="Total Users"
            value={analytics?.users?.total ?? 0}
            icon={Users}
            color="blue"
          />
          <MetricCard
            title="Total Articles"
            value={analytics?.content?.total_articles ?? 0}
            icon={FileText}
            color="amber"
          />
          <MetricCard
            title="Total Posts"
            value={analytics?.content?.total_posts ?? 0}
            icon={MessageSquare}
            color="green"
          />
          <MetricCard
            title="Demo Orders (mock_paid)"
            value={analytics?.content?.demo_orders ?? 0}
            icon={ShoppingBag}
            color="purple"
          />
        </div>
        
        {/* 24h Activity */}
        <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-2">
            <Activity size={18} className="text-amber-500" />
            <span className="font-semibold">Last 24h Activity</span>
          </div>
          <div className="text-2xl font-bold text-muted-foreground">
            {analytics?.activity_24h || 'coming soon'}
          </div>
        </div>
        
        {/* System Health Panel */}
        <div className={`rounded-xl border p-5 ${isDark ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center gap-3 mb-4">
            <Server size={18} className="text-amber-500" />
            <span className="font-semibold">System Health</span>
          </div>
          <div className="space-y-1 divide-y divide-border">
            <HealthRow 
              label="Backend Health" 
              status={analytics?.system?.backend_health || 'unknown'} 
            />
            <HealthRow 
              label="Database Connected" 
              status={analytics?.system?.db_connected} 
              isBoolean={true}
            />
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Build Version</span>
              <span className="text-sm font-mono text-foreground">
                {analytics?.system?.build_version || 'unknown'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4 border-t border-border">
          No tracking pixels • No invasive analytics • Data refreshes on demand
        </div>
      </div>
    </FullWidthLayout>
  );
}
