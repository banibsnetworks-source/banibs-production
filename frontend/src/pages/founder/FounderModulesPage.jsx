import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { 
  ArrowLeft, Database, Globe, Search, Filter, 
  CheckCircle, Clock, XCircle, RefreshCw,
  ChevronDown, ExternalLink, Code, Layers,
  Box, Activity
} from 'lucide-react';

/**
 * Founder Modules Registry Page
 * 
 * Observational-only view of all BANIBS modules/features
 * - Table view with filtering
 * - Status indicators (active, opening_soon, disabled)
 * - World/category grouping
 * - Read-only (no toggles)
 * 
 * Route: /founder/modules
 * Access: super_admin only
 */

const FounderModulesPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [modules, setModules] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [worldFilter, setWorldFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const API_URL = process.env.REACT_APP_BACKEND_URL;
  
  // Check access
  useEffect(() => {
    if (!user) {
      navigate('/auth/signin?redirect=/founder/modules');
      return;
    }
    
    const roles = user.roles || [];
    if (!roles.includes('super_admin')) {
      navigate('/');
    }
  }, [user, navigate]);
  
  // Fetch modules
  const fetchModules = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/founder/modules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error('Failed to fetch module registry');
      }
      
      const data = await res.json();
      setModules(data.modules || []);
      setSummary(data.summary || null);
    } catch (err) {
      console.error('Error fetching modules:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user?.roles?.includes('super_admin')) {
      fetchModules();
    }
  }, [user]);
  
  // Filtered modules
  const filteredModules = useMemo(() => {
    return modules.filter(m => {
      // Status filter
      if (statusFilter !== 'all' && m.status !== statusFilter) return false;
      
      // World filter
      if (worldFilter !== 'all' && m.world !== worldFilter) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches = 
          m.display_name?.toLowerCase().includes(query) ||
          m.id?.toLowerCase().includes(query) ||
          m.notes?.toLowerCase().includes(query) ||
          m.category?.toLowerCase().includes(query);
        if (!matches) return false;
      }
      
      return true;
    });
  }, [modules, statusFilter, worldFilter, searchQuery]);
  
  // Get unique worlds for filter
  const worlds = useMemo(() => {
    return [...new Set(modules.map(m => m.world))].filter(Boolean).sort();
  }, [modules]);
  
  // Status badge component
  const StatusBadge = ({ status }) => {
    const configs = {
      active: { 
        label: 'Active', 
        color: '#10B981', 
        bg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)',
        icon: CheckCircle 
      },
      opening_soon: { 
        label: 'Opening Soon', 
        color: '#F59E0B', 
        bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)',
        icon: Clock 
      },
      disabled: { 
        label: 'Disabled', 
        color: '#EF4444', 
        bg: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
        icon: XCircle 
      }
    };
    
    const config = configs[status] || configs.disabled;
    const Icon = config.icon;
    
    return (
      <span 
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: config.bg, color: config.color }}
      >
        <Icon size={12} />
        {config.label}
      </span>
    );
  };
  
  if (!user?.roles?.includes('super_admin')) {
    return null;
  }
  
  return (
    <FullWidthLayout>
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
          color: isDark ? '#e5e5e5' : '#1a1a1a'
        }}
      >
        {/* Header */}
        <header 
          className="sticky top-0 z-40 border-b"
          style={{ 
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/founder/command')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
              >
                <ArrowLeft size={20} />
                <span className="hidden sm:inline text-sm">Command Center</span>
              </button>
              
              <div className="flex-1">
                <h1 className="text-xl font-semibold flex items-center gap-2" style={{ color: isDark ? '#fff' : '#111' }}>
                  <Database size={22} className="text-amber-500" />
                  Module Registry
                </h1>
                <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                  Canonical source of truth for all BANIBS modules
                </p>
              </div>
              
              <button
                onClick={fetchModules}
                disabled={loading}
                className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}
              >
                <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline text-sm">Refresh</span>
              </button>
            </div>
          </div>
        </header>
        
        {/* Summary Cards */}
        {summary && (
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Box size={16} className="text-blue-400" />
                  <span className="text-xs font-medium" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    Total Modules
                  </span>
                </div>
                <p className="text-2xl font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                  {summary.total}
                </p>
              </div>
              
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? 'rgba(16, 185, 129, 0.05)' : 'rgba(16, 185, 129, 0.05)',
                  border: `1px solid ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle size={16} className="text-green-500" />
                  <span className="text-xs font-medium" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    Active
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-500">
                  {summary.active}
                </p>
              </div>
              
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.05)' : 'rgba(245, 158, 11, 0.05)',
                  border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-amber-500" />
                  <span className="text-xs font-medium" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    Opening Soon
                  </span>
                </div>
                <p className="text-2xl font-bold text-amber-500">
                  {summary.opening_soon}
                </p>
              </div>
              
              <div 
                className="p-4 rounded-xl"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Layers size={16} className="text-purple-400" />
                  <span className="text-xs font-medium" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    Worlds
                  </span>
                </div>
                <p className="text-2xl font-bold" style={{ color: isDark ? '#fff' : '#111' }}>
                  {summary.worlds?.length || 0}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Filters */}
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div 
              className="flex items-center gap-2 px-3 py-2 rounded-lg flex-1 min-w-[200px] max-w-md"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
              }}
            >
              <Search size={16} style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: isDark ? '#fff' : '#111' }}
              />
            </div>
            
            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? '#fff' : '#111'
              }}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="opening_soon">Opening Soon</option>
              <option value="disabled">Disabled</option>
            </select>
            
            {/* World Filter */}
            <select
              value={worldFilter}
              onChange={(e) => setWorldFilter(e.target.value)}
              className="px-3 py-2 rounded-lg text-sm outline-none cursor-pointer"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                color: isDark ? '#fff' : '#111'
              }}
            >
              <option value="all">All Worlds</option>
              {worlds.map(world => (
                <option key={world} value={world}>{world}</option>
              ))}
            </select>
            
            {/* Results count */}
            <span className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
              {filteredModules.length} module{filteredModules.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 py-4">
          {/* Error State */}
          {error && (
            <div 
              className="p-4 rounded-xl mb-4"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
            >
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}
          
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <RefreshCw size={24} className="animate-spin text-amber-500" />
            </div>
          )}
          
          {/* Table */}
          {!loading && !error && (
            <div 
              className="rounded-xl overflow-hidden"
              style={{ 
                backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : '#fff',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
              }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr 
                      style={{ 
                        backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                        borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                      }}
                    >
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        Module
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        World
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden md:table-cell" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        Routes
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden lg:table-cell" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        API
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider hidden xl:table-cell" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                        Updated
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredModules.map((module, idx) => (
                      <tr 
                        key={module.id}
                        style={{ 
                          borderBottom: idx < filteredModules.length - 1 
                            ? `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}` 
                            : 'none'
                        }}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium text-sm" style={{ color: isDark ? '#fff' : '#111' }}>
                              {module.display_name}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                              {module.id} • {module.category}
                            </p>
                            {module.notes && (
                              <p className="text-xs mt-1 max-w-xs truncate" style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}>
                                {module.notes}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <Globe size={14} style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }} />
                            <span className="text-xs" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                              {module.world || 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={module.status} />
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ 
                              backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                              color: '#3B82F6'
                            }}>
                              {module.frontend_routes?.length || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-mono px-1.5 py-0.5 rounded" style={{ 
                              backgroundColor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)',
                              color: '#A855F7'
                            }}>
                              {module.api_routes?.length || 0}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <span className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                            {module.last_updated || '-'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Empty State */}
              {filteredModules.length === 0 && (
                <div className="text-center py-12">
                  <Database size={40} className="mx-auto mb-3 text-gray-500" />
                  <p className="text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    No modules match your filters
                  </p>
                </div>
              )}
            </div>
          )}
          
          {/* Footer Note */}
          <div className="mt-6 text-center">
            <p className="text-xs" style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}>
              This registry is observational only and does not control module behavior.
              <br />
              A module must be in this registry to be considered officially created.
            </p>
          </div>
        </main>
      </div>
    </FullWidthLayout>
  );
};

export default FounderModulesPage;
