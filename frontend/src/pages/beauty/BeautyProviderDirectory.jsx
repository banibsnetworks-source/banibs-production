import React, { useState, useEffect } from 'react';
import { Store, MapPin, Phone, Globe, Loader2 } from 'lucide-react';
import BeautyLayout from '../../components/beauty/BeautyLayout';
import BeautyProviderCard from '../../components/beauty/BeautyProviderCard';
import { useTheme } from '../../contexts/ThemeContext';
import { xhrRequest } from '../../utils/xhrRequest';

const BeautyProviderDirectory = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  
  const providerTypes = [
    { value: '', label: 'All Types' },
    { value: 'hair', label: 'Hair' },
    { value: 'skincare', label: 'Skincare' },
    { value: 'lashes', label: 'Lashes' },
    { value: 'nails', label: 'Nails' },
    { value: 'barber', label: 'Barber' },
    { value: 'shop', label: 'Beauty Shop' }
  ];
  
  useEffect(() => {
    loadProviders();
  }, [filterType, filterLocation]);
  
  const loadProviders = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/beauty/providers?`;
      if (filterType) url += `type=${filterType}&`;
      if (filterLocation) url += `location=${filterLocation}&`;
      
      const response = await xhrRequest(url);
      if (response.ok) {
        setProviders(response.data.providers);
      }
    } catch (err) {
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <BeautyLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Black-Owned Beauty Directory
        </h1>
        <p className="text-muted-foreground">
          Discover and support Black-owned beauty businesses
        </p>
      </div>
      
      {/* Filters */}
      <div className="mb-6 flex flex-wrap gap-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
        >
          {providerTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="Search by location..."
          value={filterLocation}
          onChange={(e) => setFilterLocation(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
        />
      </div>
      
      {/* Providers Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-pink-500" />
        </div>
      ) : providers.length === 0 ? (
        <div className="text-center py-20">
          <Store size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No providers found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <BeautyProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}
    </BeautyLayout>
  );
};

export default BeautyProviderDirectory;