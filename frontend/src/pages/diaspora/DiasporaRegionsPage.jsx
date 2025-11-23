import React, { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import DiasporaLayout from '../../components/diaspora/DiasporaLayout';
import DiasporaRegionCard from '../../components/diaspora/DiasporaRegionCard';
import { MapPin, Loader2 } from 'lucide-react';
import axios from 'axios';

/**
 * DiasporaRegionsPage - Phase 12.0
 * Page displaying all diaspora regions
 */
const DiasporaRegionsPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
        const response = await axios.get(`${BACKEND_URL}/api/diaspora/regions`);
        setRegions(response.data.regions || []);
      } catch (error) {
        console.error('Error fetching regions:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRegions();
  }, []);
  
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
            <MapPin size={24} className="text-amber-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Regions & Hubs</h1>
            <p className="text-muted-foreground">Explore Black communities across the globe</p>
          </div>
        </div>
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={32} className="animate-spin text-amber-600" />
        </div>
      )}
      
      {/* Regions grid */}
      {!loading && regions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {regions.map((region) => (
            <DiasporaRegionCard key={region.id} region={region} />
          ))}
        </div>
      )}
      
      {/* Empty state */}
      {!loading && regions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No regions found</p>
        </div>
      )}
    </DiasporaLayout>
  );
};

export default DiasporaRegionsPage;
