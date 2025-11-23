import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import AcademyLayout from '../../components/academy/AcademyLayout';
import MentorCard from '../../components/academy/MentorCard';
import { Users, Loader2, Filter } from 'lucide-react';
import axios from 'axios';

const AcademyMentorshipPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ country: '', expertise: '' });
  
  useEffect(() => {
    const fetchMentors = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const params = new URLSearchParams();
        if (filters.country) params.append('country', filters.country);
        if (filters.expertise) params.append('expertise', filters.expertise);
        
        const response = await axios.get(`${BACKEND_URL}/api/academy/mentors?${params.toString()}`);
        setMentors(response.data.mentors || []);
      } catch (error) {
        console.error('Error fetching mentors:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMentors();
  }, [filters]);
  
  return (
    <AcademyLayout>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ background: isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.1)' }}>
            <Users size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mentorship Network</h1>
            <p className="text-muted-foreground">Connect with experienced professionals</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="p-4 rounded-xl flex flex-wrap gap-4" style={{ background: isDark ? 'rgba(59, 130, 246, 0.06)' : 'rgba(59, 130, 246, 0.04)', border: `1px solid ${isDark ? 'rgba(59, 130, 246, 0.15)' : 'rgba(59, 130, 246, 0.12)'}` }}>
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filter by:</span>
          </div>
          <input type="text" value={filters.country} onChange={(e) => setFilters({ ...filters, country: e.target.value })} placeholder="Country" className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground" />
          <input type="text" value={filters.expertise} onChange={(e) => setFilters({ ...filters, expertise: e.target.value })} placeholder="Expertise" className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground" />
          {(filters.country || filters.expertise) && (
            <button onClick={() => setFilters({ country: '', expertise: '' })} className="text-sm text-blue-600 hover:text-blue-700 underline">Clear filters</button>
          )}
        </div>
      </div>
      
      {loading && <div className="flex items-center justify-center py-12"><Loader2 size={32} className="animate-spin text-blue-600" /></div>}
      
      {!loading && mentors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mentors.map((mentor) => <MentorCard key={mentor.id} mentor={mentor} />)}
        </div>
      )}
      
      {!loading && mentors.length === 0 && <div className="text-center py-12"><Users size={48} className="mx-auto mb-4 text-muted-foreground" /><p className="text-muted-foreground">No mentors found</p></div>}
    </AcademyLayout>
  );
};

export default AcademyMentorshipPage;
