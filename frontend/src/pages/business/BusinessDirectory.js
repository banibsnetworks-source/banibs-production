import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import BusinessLayout from '../../components/business/BusinessLayout';
import NavigationButtons from '../../components/business/NavigationButtons';

/**
 * BusinessDirectory - Phase 8.4 (P0 Fix)
 * Geo-enabled business search with filters and "Use My Location"
 * Now wrapped in BusinessLayout for consistent navigation
 */

const BusinessDirectory = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Search filters
  const [category, setCategory] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [userCoords, setUserCoords] = useState(null);
  const [radiusKm, setRadiusKm] = useState(25);
  
  // Categories
  const categories = [
    'All Categories',
    'Food & Beverage',
    'Beauty & Personal Care',
    'Technology',
    'Health & Wellness',
    'Professional Services',
    'Retail',
    'Arts & Entertainment',
    'Education',
    'Real Estate',
    'Finance'
  ];
  
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setUseLocation(true);
        setZipCode('');
        setCity('');
        setState('');
        setLoading(false);
      },
      (err) => {
        setError(`Location access denied. You can still search by zip or city.`);
        setUseLocation(false);
        setLoading(false);
      }
    );
  };
  
  const searchBusinesses = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams();
      
      if (category && category !== 'All Categories') {
        params.append('category', category);
      }
      
      if (useLocation && userCoords) {
        params.append('lat', userCoords.lat);
        params.append('lng', userCoords.lng);
        params.append('radius_km', radiusKm);
        params.append('sort', 'distance');
      } else if (zipCode) {
        params.append('zip', zipCode);
        params.append('radius_km', radiusKm);
      } else if (city && state) {
        params.append('city', city);
        params.append('state', state);
        params.append('radius_km', radiusKm);
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/search?${params.toString()}`
      );
      
      // Read response body once and only once
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        throw new Error('Failed to parse search results');
      }
      
      if (response.ok) {
        setBusinesses(Array.isArray(data) ? data : []);
      } else {
        const errorMsg = data?.detail || data?.message || 'Failed to search businesses';
        setError(errorMsg);
        setBusinesses([]);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'An error occurred while searching. Please try again.');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };
  
  // Auto-search on mount
  useEffect(() => {
    searchBusinesses();
  }, []);
  
  return (
    <BusinessLayout>
      <div className="min-h-screen bg-slate-950">
      
      <div className='container mx-auto px-4 py-8 max-w-6xl'>
        <h1 className='text-4xl font-bold text-white mb-8'>
          Business Directory
        </h1>
        
        {/* Search Filters */}
        <div className='bg-slate-900 rounded-lg border border-slate-800 p-6 mb-8'>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4'>
            {/* Category */}
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white'
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Zip Code */}
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                Zip Code
              </label>
              <input
                type='text'
                value={zipCode}
                onChange={(e) => {
                  setZipCode(e.target.value);
                  setUseLocation(false);
                }}
                placeholder='30303'
                disabled={useLocation}
                className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50'
              />
            </div>
            
            {/* City */}
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                City
              </label>
              <input
                type='text'
                value={city}
                onChange={(e) => {
                  setCity(e.target.value);
                  setUseLocation(false);
                }}
                placeholder='Atlanta'
                disabled={useLocation}
                className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white disabled:opacity-50'
              />
            </div>
            
            {/* State */}
            <div>
              <label className='block text-sm font-medium text-slate-300 mb-2'>
                State
              </label>
              <input
                type='text'
                value={state}
                onChange={(e) => {
                  setState(e.target.value.toUpperCase());
                  setUseLocation(false);
                }}
                placeholder='GA'
                maxLength={2}
                disabled={useLocation}
                className='w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white uppercase disabled:opacity-50'
              />
            </div>
          </div>
          
          <div className='flex flex-wrap gap-3 items-center'>
            <button
              onClick={handleUseMyLocation}
              disabled={loading}
              className='flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50'
            >
              <Navigation className='w-4 h-4' />
              Use My Location
            </button>
            
            {useLocation && userCoords && (
              <span className='text-sm text-green-400'>
                ✓ Using your location
              </span>
            )}
            
            <button
              onClick={searchBusinesses}
              disabled={loading}
              className='flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50'
            >
              {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : <Search className='w-4 h-4' />}
              Search
            </button>
            
            {(useLocation || zipCode || city) && (
              <div>
                <label className='text-sm text-slate-400 mr-2'>Radius:</label>
                <select
                  value={radiusKm}
                  onChange={(e) => setRadiusKm(Number(e.target.value))}
                  className='px-3 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm'
                >
                  <option value={5}>5 miles</option>
                  <option value={10}>10 miles</option>
                  <option value={25}>25 miles</option>
                  <option value={50}>50 miles</option>
                  <option value={100}>100 miles</option>
                </select>
              </div>
            )}
          </div>
          
          {error && (
            <div className='mt-4 p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm'>
              {error}
            </div>
          )}
        </div>
        
        {/* Results */}
        <div className='space-y-4'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-xl font-semibold text-white'>
              {loading ? 'Searching...' : `${businesses.length} businesses found`}
            </h2>
          </div>
          
          {businesses.map((business) => (
            <div
              key={business.id}
              className='bg-slate-900 border border-slate-800 rounded-lg p-6 hover:border-slate-700 transition-colors'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1'>
                  <Link
                    to={`/portal/business/${business.handle}`}
                    className='text-xl font-semibold text-white hover:text-yellow-400'
                  >
                    {business.name}
                  </Link>
                  
                  {business.tagline && (
                    <p className='text-slate-400 mt-1'>{business.tagline}</p>
                  )}
                  
                  <div className='flex items-center gap-4 mt-3 text-sm text-slate-400'>
                    {business.industry && (
                      <span className='px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded'>
                        {business.industry}
                      </span>
                    )}
                    
                    {business.city && business.state && (
                      <span className='flex items-center gap-1'>
                        <MapPin className='w-4 h-4' />
                        {business.city}, {business.state}
                      </span>
                    )}
                    
                    {business.distance_miles != null && (
                      <span className='text-blue-400 font-medium'>
                        {business.distance_miles} miles away
                      </span>
                    )}
                  </div>
                </div>
                
                <div className='flex flex-col gap-3'>
                  <Link
                    to={`/portal/business/${business.handle}`}
                    className='px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-center whitespace-nowrap'
                  >
                    View Profile
                  </Link>
                  
                  {/* Phase 8.2 - Navigation Buttons */}
                  <NavigationButtons business={business} />
                </div>
              </div>
            </div>
          ))}
          
          {!loading && businesses.length === 0 && (
            <div className='text-center py-12'>
              <p className='text-slate-400'>
                No businesses found. Try adjusting your search filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDirectory;
