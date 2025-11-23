import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import DiasporaLayout from '../../components/diaspora/DiasporaLayout';
import DiasporaStoryCard from '../../components/diaspora/DiasporaStoryCard';
import DiasporaStoryForm from '../../components/diaspora/DiasporaStoryForm';
import { BookHeart, Loader2, Plus, Filter } from 'lucide-react';
import axios from 'axios';

/**
 * DiasporaStoriesPage - Phase 12.0
 * Page displaying diaspora stories with filters
 */
const DiasporaStoriesPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  const [stories, setStories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [filters, setFilters] = useState({
    origin_region_id: '',
    current_region_id: ''
  });
  
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
  
  // Fetch stories
  useEffect(() => {
    const fetchStories = async () => {
      setLoading(true);
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const params = new URLSearchParams();
        if (filters.origin_region_id) params.append('origin_region_id', filters.origin_region_id);
        if (filters.current_region_id) params.append('current_region_id', filters.current_region_id);
        
        const response = await axios.get(`${BACKEND_URL}/api/diaspora/stories?${params.toString()}`);
        setStories(response.data.stories || []);
      } catch (error) {
        console.error('Error fetching stories:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStories();
  }, [filters]);
  
  const handleStorySuccess = () => {
    setShowForm(false);
    // Refresh stories
    setFilters({ ...filters });
  };
  
  return (
    <DiasporaLayout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: isDark ? 'rgba(180, 130, 50, 0.15)' : 'rgba(180, 130, 50, 0.1)',
              }}
            >
              <BookHeart size={24} className="text-amber-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Stories & Journeys</h1>
              <p className="text-muted-foreground">Personal narratives from the diaspora</p>
            </div>
          </div>
          
          {user && (
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              <Plus size={18} />
              Share Your Story
            </button>
          )}
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
            value={filters.origin_region_id}
            onChange={(e) => setFilters({ ...filters, origin_region_id: e.target.value })}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground"
          >
            <option value="">Origin Region: All</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
          
          <select
            value={filters.current_region_id}
            onChange={(e) => setFilters({ ...filters, current_region_id: e.target.value })}
            className="px-3 py-1.5 rounded-lg bg-background border border-border text-sm text-foreground"
          >
            <option value="">Current Region: All</option>
            {regions.map((region) => (
              <option key={region.id} value={region.id}>{region.name}</option>
            ))}
          </select>
          
          {(filters.origin_region_id || filters.current_region_id) && (
            <button
              onClick={() => setFilters({ origin_region_id: '', current_region_id: '' })}
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
      
      {/* Stories grid */}
      {!loading && stories.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map((story) => (
            <DiasporaStoryCard 
              key={story.id} 
              story={story} 
              onClick={() => setSelectedStory(story)}
            />
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!loading && stories.length === 0 && (
        <div className="text-center py-12">
          <BookHeart size={48} className="mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No stories found</p>
          {user && (
            <button
              onClick={() => setShowForm(true)}
              className="px-4 py-2 rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              Be the first to share your story
            </button>
          )}
        </div>
      )}
      
      {/* Story form modal */}
      {showForm && (
        <DiasporaStoryForm
          onClose={() => setShowForm(false)}
          onSuccess={handleStorySuccess}
        />
      )}
      
      {/* Story detail modal (simple for now) */}
      {selectedStory && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={() => setSelectedStory(null)}
        >
          <div
            className="w-full max-w-2xl rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{
              background: isDark ? '#1a1a1a' : '#ffffff',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-foreground mb-4">{selectedStory.title}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              By {selectedStory.author_name || 'Anonymous'}
            </p>
            <div className="prose prose-sm max-w-none text-foreground">
              {selectedStory.content.split('\n').map((para, idx) => (
                <p key={idx} className="mb-4">{para}</p>
              ))}
            </div>
            <button
              onClick={() => setSelectedStory(null)}
              className="mt-6 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </DiasporaLayout>
  );
};

export default DiasporaStoriesPage;
