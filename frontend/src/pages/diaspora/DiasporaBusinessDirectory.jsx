import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import DiasporaLayout from '../../components/diaspora/DiasporaLayout';
import DiasporaBusinessCard from '../../components/diaspora/DiasporaBusinessCard';
import { Building2, Loader2, Filter } from 'lucide-react';
import axios from 'axios';

/**
 * DiasporaBusinessDirectory - Phase 12.0
 * Page displaying diaspora businesses with filters
 */
const DiasporaBusinessDirectory = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [businesses, setBusinesses] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    region_id: '',
    type: '',
    country: ''
  });
  
  const businessTypes = [
    { value: 'tour', label: 'Tours & Experiences' },
    { value: 'lodging', label: 'Lodging' },
    { value: 'food', label: 'Food & Restaurants' },
    { value: 'service', label: 'Services' },
    { value: 'culture', label: 'Cultural Centers' },
    { value: 'shop', label: 'Shops & Retail' }
  ];
  
  // Fetch regions for filters
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const response = await axios.get(`${BACKEND_URL}/api/diaspora/regions`);
        setRegions(response.data.regions || []);
      } catch (error) {
        console.error('Error fetching regions:', error);
      }
    };
    fetchRegions();
  }, []);
  
  // Fetch businesses
  useEffect(() => {
    const fetchBusinesses = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const params = new URLSearchParams();
        if (filters.region_id) params.append('region_id', filters.region_id);
        if (filters.type) params.append('type', filters.type);
        if (filters.country) params.append('country', filters.country);
        
        const response = await axios.get(`${BACKEND_URL}/api/diaspora/businesses?${params.toString()}`);
        setBusinesses(response.data.businesses || []);
      } catch (error) {
        console.error('Error fetching businesses:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBusinesses();
  }, [filters]);
  
  return (
    <DiasporaLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
            }}
          >
            <Building2 size={24} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Diaspora Business Directory</h1>
            <p className="text-muted-foreground">Connect with Black-owned businesses worldwide</p>
          </div>
        </div>
        
        {/* Filters */}
        <div
          className="p-4 rounded-xl flex flex-wrap gap-4"
          style={{
            background: isDark ? 'rgba(180, 130, 50, 0.06)' : 'rgba(180, 130, 50, 0.04)',
            border: `1px solid ${isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.12)'}`,
          }}
        >
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter by:</span>
          </div>
          
          <select
            value={filters.region_id}
            onChange={(e) => setFilters({ ...filters, region_id: e.target.value })}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground"
          >
            <option value="">Region: All</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground"
          >
            <option value="">Type: All</option>
            {businessTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          
          {(filters.region_id || filters.type || filters.country) && (
            <button
              onClick={() => setFilters({ region_id: '', type: '', country: '' })}
              className="text-sm text-amber-600 hover:text-amber-700 underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-amber-600" />
        </div>
      )}
      
      {/* Businesses grid */}
      {!loading && businesses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {businesses.map((business) => (
            <DiasporaBusinessCard key={business.id} business={business} />
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!loading && businesses.length === 0 && (
        <div className="text-center py-12">
          <Building2 size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No businesses found</p>
        </div>
      )}
    </DiasporaLayout>
  );
};

export default DiasporaBusinessDirectory;
