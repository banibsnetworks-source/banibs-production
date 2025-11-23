import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import AcademyLayout from '../../components/academy/AcademyLayout';
import OpportunityCard from '../../components/academy/OpportunityCard';
import { Award, Loader2, Filter } from 'lucide-react';
import axios from 'axios';

const AcademyOpportunitiesPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ type: '', upcoming: false });
  
  useEffect(() => {
    const fetchOpportunities = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const params = new URLSearchParams();
        if (filters.type) params.append('type', filters.type);
        if (filters.upcoming) params.append('upcoming', 'true');
        
        const response = await axios.get(`${BACKEND_URL}/api/academy/opportunities?${params.toString()}`);
        setOpportunities(response.data.opportunities || []);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOpportunities();
  }, [filters]);
  
  return (
    <AcademyLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }}>
            <Award size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Scholarships & Opportunities</h1>
            <p className="text-muted-foreground">Find funding for your dreams</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-4 rounded-xl flex flex-wrap gap-4" style={{ background: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)', border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'}` }}>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter by:</span>
          </div>
          <select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground">
            <option value="">All Types</option>
            <option value="scholarship">Scholarships</option>
            <option value="internship">Internships</option>
            <option value="apprenticeship">Apprenticeships</option>
            <option value="grant">Grants</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={filters.upcoming} onChange={(e) => setFilters({ ...filters, upcoming: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
            <span className="text-sm text-foreground">Upcoming deadlines only</span>
          </label>
          {(filters.type || filters.upcoming) && (
            <button onClick={() => setFilters({ type: '', upcoming: false })} className="text-sm text-blue-600 hover:text-blue-700 underline">Clear filters</button>
          )}
        </div>
      </div>
      
      {loading && <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-blue-600" /></div>}
      
      {!loading && opportunities.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => <OpportunityCard key={opp.id} opportunity={opp} />)}
        </div>
      )}
      
      {!loading && opportunities.length === 0 && <div className="text-center py-12"><Award size={48} className="mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No opportunities found</p></div>}
    </AcademyLayout>
  );
};

export default AcademyOpportunitiesPage;
