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
  
  // BANIBS Category Tree - Skilled Trades Upgrade (Dec 2025)
  const categories = [
    'All Categories',
    
    // Core Black Business Categories
    'Barbers',
    'Beauticians / Hair Stylists',
    'Braiders',
    'Nail Technicians',
    'Estheticians',
    
    // Lifestyle & Culture
    'Fashion & Apparel',
    'Custom Clothing / Tailors',
    'Jewelry & Accessories',
    'Cultural Goods & Crafts',
    'Black Art / African Art / Caribbean Art',
    
    // Food & Culinary
    'Restaurants',
    'Food Trucks',
    'Catering',
    'Bakers / Pastry',
    'Caribbean Cuisine',
    'African Cuisine',
    'Soul Food',
    
    // Home Repair & Skilled Trades (NEW - Comprehensive)
    // Carpentry & Woodwork
    'Carpenters',
    'Woodworkers',
    'Custom Furniture Makers',
    'Furniture Repair Specialists',
    'Cabinet Builders / Installers',
    'Trim & Molding Specialists',
    'Deck & Patio Builders',
    
    // Handyman & General Repairs
    'General Handyman Services',
    'Home Repair Technicians',
    'Odd Jobs / Small Fix-It Services',
    'Property Maintenance Workers',
    'Home Improvement Helpers',
    'Mobile Handyman Services',
    
    // HVAC & Environmental Systems
    'HVAC Technicians',
    'Heating Repair',
    'Air Conditioning Repair',
    'Ventilation Specialists',
    'Furnace & Boiler Technicians',
    'Duct Cleaning Services',
    
    // Electrical & Power
    'Electricians',
    'Residential Electrical Repair',
    'Lighting Installation Technicians',
    'Generator Technicians',
    
    // Plumbing & Water Systems
    'Plumbers',
    'Pipefitters',
    'Drain Cleaning Services',
    'Leak Repair Specialists',
    'Water Heater Technicians',
    
    // Appliance Repair
    'Washers & Dryers Repair',
    'Refrigerator Repair',
    'Stove/Oven Repair',
    'Dishwasher Repair',
    'Small Appliance Technicians',
    
    // Roofing & Exterior Work
    'Roofers',
    'Gutter Installation/Repair',
    'Siding Installation/Repair',
    'Window Installation/Repair',
    'Door Installation/Repair',
    
    // Masonry & Concrete
    'Masons',
    'Bricklayers',
    'Stonework Specialists',
    'Concrete Installers',
    'Driveway Repair Technicians',
    'Sidewalk & Patio Concrete Work',
    
    // Flooring & Surface Specialists
    'Flooring Installers',
    'Tile Installers',
    'Hardwood Floor Specialists',
    'Carpet Installers',
    'Marble/Granite Installers',
    
    // Drywall & Interior Work
    'Drywall Installers',
    'Drywall Patching/Repair Specialists',
    'Interior Wall Specialists',
    'Painters',
    
    // Welding & Metalwork
    'Welders',
    'Metal Fabricators',
    'Custom Ironwork',
    'Gate/Fence Metal Specialists',
    
    // Landscaping & Outdoor
    'Landscaping',
    'Lawn Care Services',
    'Tree Trimming Services',
    'Irrigation Specialists',
    
    // Construction & Trades
    'Construction & Trades',
    'General Contractors',
    'Construction Workers',
    'Demolition Services',
    
    // Professional Services (Non-Trades)
    'Photographers / Videographers',
    'Cleaning & Home Care',
    'Moving Services',
    'Mechanics',
    'Event Planners',
    
    // Health & Wellness
    'Trainers',
    'Herbalists',
    'Midwives / Doulas',
    'Massage Therapy',
    'Mental Health Counselors',
    
    // Tech & Digital
    'Web Designers',
    'Developers',
    'Digital Marketers',
    'Graphic Designers',
    'Music Producers',
    
    // Business & Finance
    'Tax Preparers',
    'Bookkeepers',
    'Consultants',
    'Loan Officers',
    'Insurance Agents',
    
    // Travel & Transportation
    'Travel Agents',
    'Chauffeurs / Drivers',
    'Car Rental Services',
    
    // Real Estate & Home
    'Realtors',
    'Airbnb Hosts',
    'Property Managers',
    
    // ========================================================================
    // PROPERTY, REPAIR, ENVIRONMENTAL & INFRASTRUCTURE SERVICES (PART 2)
    // ========================================================================
    
    // A. Basement, Foundation & Water Protection
    'Basement Waterproofing',
    'Foundation Leak Repair',
    'Foundation Stabilization Specialists',
    'Crawlspace Repair & Encapsulation',
    'Sump Pump Installation & Repair',
    'French Drain Installation',
    'Yard Drainage Specialists',
    'Water Damage Restoration',
    'Sewer Backup Cleanup',
    'Mold & Mildew Remediation',
    'Radon Testing & Mitigation',
    'Moisture & Humidity Control Services',
    'Basement Finishing & Remodeling',
    
    // B. Environmental Hazard & Air Quality Services
    'Asbestos Testing',
    'Asbestos Removal',
    'Lead Paint Testing & Removal',
    'Mold Inspection',
    'Mold Remediation',
    'Indoor Air Quality Testing',
    'Industrial Cleaning Services',
    'Hazard Cleanup Crews',
    'Biohazard Cleaning',
    'Decontamination Services',
    
    // C. Storm, Flood & Disaster Recovery Teams
    'Flood Cleanup Crews',
    'Storm Damage Repair',
    'Emergency Roof Tarping',
    'Emergency Board-Up Services',
    'Tree Damage Removal',
    'Disaster Restoration Contractors',
    'Water Extraction Technicians',
    'Fire Damage Restoration',
    'Smoke Odor Removal',
    'Emergency Home Repair Teams',
    
    // D. Heavy Machinery & Site Work Operators
    'Bulldozer Operators',
    'Backhoe Operators',
    'Excavator Operators',
    'Skid Steer/Bobcat Operators',
    'Forklift Operators',
    'Crane Operators',
    'Grading & Land Leveling Services',
    'Earthmoving Crews',
    'Site Prep Contractors',
    'Asphalt & Road Crew Operators',
    'Concrete Pouring Teams',
    'Equipment Transport & Hauling',
    
    // E. CDL, Transport & Vehicle-Based Professionals
    'CDL Truck Drivers',
    'Independent Truck Owners',
    'Freight & Logistics Carriers',
    'Hotshot Drivers',
    'Local Delivery Drivers',
    'Dump Truck Services',
    'Flatbed Hauling',
    'Lowboy/Heavy Equipment Hauling',
    'Bus Drivers (Charter, Shuttle, Private)',
    'Van Transport Services',
    'Senior & Medical Transport',
    'School Transport Specialists',
    'Moving Truck Operators',
    
    // F. Roofing, Exterior & Structural Services (Expanded)
    'Full Roof Replacement',
    'Metal Roofing Specialists',
    'Shingle Roofing Specialists',
    'Flat Roof Specialists',
    'Leak Detection Technicians',
    'Gutter Cleaning',
    'Gutter Installation',
    'Siding Repair & Installation',
    'Chimney Repair',
    'Brick/Stone Exterior Repair',
    'Window Replacement',
    'Door Replacement',
    
    // G. Outdoor, Yard & Property Exterior Specialists
    'Tree Cutting & Tree Removal',
    'Stump Grinding',
    'Bush & Hedge Trimming',
    'Yard Cleanup Crews',
    'Seasonal Cleanup Teams',
    'Landscaping Design Services',
    'Hardscaping (Patios, Walkways)',
    'Fence Builders',
    'Fence Repair Technicians',
    'Deck Building',
    'Deck Repair',
    'Pool Cleaning',
    'Pool Repair & Maintenance',
    
    // H. Commercial-Grade Contractors & Build Teams
    'Commercial Construction Crews',
    'Industrial Renovation Teams',
    'Building Maintenance Contractors',
    'Multi-family Housing Repair Teams',
    'Home Builders (Small & Large Scale)',
    'Remodeling & Renovation Contractors',
    'Demolition Crews',
    'Concrete & Foundation Contractors',
    'Framing Specialists',
    'Roofing Crews',
    'Siding Crews',
    'Commercial Electricians',
    'Commercial Plumbers',
    
    // I. Specialty Repair & Safety
    'Garage Door Repair',
    'Gate Repair / Iron Gate Specialists',
    'Pest Control Services',
    'Termite Specialists',
    'Water Damage Specialists',
    'Home Security Installers',
    'Smart Home Installation',
    'Surveillance Camera Installers'
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
      <div className="container-v2 section-v2 page-enter" data-mode="business">
      
      <div className='max-w-6xl mx-auto'>
        <h1 className='text-4xl font-bold text-foreground-v2 breathing-room-lg'>
          Business Directory
        </h1>
        
        {/* Search Filters */}
        <div className='card-v2 card-v2-lg breathing-room-lg'>
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4 breathing-room-md'>
            {/* Category */}
            <div>
              <label className='block text-sm font-medium text-foreground-v2 breathing-room-sm'>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='select-v2 w-full'
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            {/* Zip Code */}
            <div>
              <label className='block text-sm font-medium text-foreground-v2 breathing-room-sm'>
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
                className='input-v2 w-full'
              />
            </div>
            
            {/* City */}
            <div>
              <label className='block text-sm font-medium text-foreground-v2 breathing-room-sm'>
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
                className='input-v2 w-full'
              />
            </div>
            
            {/* State */}
            <div>
              <label className='block text-sm font-medium text-foreground-v2 breathing-room-sm'>
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
                className='input-v2 w-full uppercase'
              />
            </div>
          </div>
          
          <div className='flex flex-wrap gap-3 items-center'>
            <button
              onClick={handleUseMyLocation}
              disabled={loading}
              className='btn-v2 btn-v2-secondary btn-v2-md flex items-center gap-2'
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
              className='btn-v2 btn-v2-primary btn-v2-md flex items-center gap-2'
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
                  className='select-v2 text-sm'
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
              className='card-v2 card-v2-marketplace card-v2-interactive p-6'
            >
              <div className='flex items-start justify-between gap-4'>
                <div className='flex-1'>
                  <Link
                    to={`/portal/business/${business.handle}`}
                    className='text-xl font-semibold text-foreground-v2 hover:text-primary-v2'
                  >
                    {business.name}
                  </Link>
                  
                  {business.tagline && (
                    <p className='text-secondary-v2 breathing-room-xs'>{business.tagline}</p>
                  )}
                  
                  <div className='flex items-center gap-4 breathing-room-sm text-sm text-secondary-v2 icon-text-aligned'>
                    {business.industry && (
                      <span className='toggle-v2 active'>
                        {business.industry}
                      </span>
                    )}
                    
                    {business.city && business.state && (
                      <span className='flex items-center gap-1 icon-text-aligned'>
                        <MapPin className='w-4 h-4' />
                        {business.city}, {business.state}
                      </span>
                    )}
                    
                    {business.distance_miles != null && (
                      <span className='text-primary-v2 font-medium'>
                        {business.distance_miles} miles away
                      </span>
                    )}
                  </div>
                </div>
                
                <div className='flex flex-col gap-3'>
                  <Link
                    to={`/portal/business/${business.handle}`}
                    className='btn-v2 btn-v2-primary btn-v2-md text-center whitespace-nowrap'
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
            <div className='empty-state-v2'>
              <h3 className='empty-state-title'>No businesses found</h3>
              <p className='empty-state-description'>
                Try adjusting your search filters or expanding your radius.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessDirectory;
