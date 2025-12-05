import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Grid3x3, Building2, TrendingUp, Star, ArrowRight, Briefcase, Handshake, CheckCircle, Home } from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import SEO from '../../components/SEO';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { categoryOptions } from '../../data/businessCategories';

/**
 * Business Directory V2.1 - Phase B.0
 * Premium flagship experience with rotating hero, emotion, and cultural resonance
 * Layered enhancement preserving all v2.0 functionality
 */
const BusinessDirectoryV21 = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Hero background rotation state
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  
  // Hero background images (using placeholder images for now)
  const heroImages = [
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1920&q=80', // Black woman professional
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1920&q=80', // Black businessman
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1920&q=80', // Team collaboration
    'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=1920&q=80', // Entrepreneur outdoors
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1920&q=80', // Woman smiling professional
  ];
  
  // Rotate hero images every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [heroImages.length]);
  
  // Search state
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchRadius, setSearchRadius] = useState('25');
  
  // Business data
  const [businesses, setBusinesses] = useState([]);
  const [newestBusinesses, setNewestBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch businesses
  useEffect(() => {
    fetchBusinesses();
  }, [searchCategory]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchCategory) params.append('category', searchCategory);
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/search?${params.toString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const bizList = Array.isArray(data) ? data : [];
        setBusinesses(bizList);
        
        const sorted = [...bizList].sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        setNewestBusinesses(sorted.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to fetch businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (searchName.trim()) {
        params.append('q', searchName.trim());
      }
      
      if (searchCategory) {
        params.append('category', searchCategory);
      }
      
      if (searchLocation.trim()) {
        const locationValue = searchLocation.trim();
        const isNumeric = /^\d+$/.test(locationValue);
        
        if (isNumeric) {
          params.append('zip', locationValue);
        } else {
          params.append('city', locationValue);
        }
      }
      
      if (searchLocation.trim() && searchRadius) {
        const radiusMiles = parseInt(searchRadius);
        const radiusKm = radiusMiles * 1.60934;
        params.append('radius_km', radiusKm.toString());
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/search?${params.toString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        let results = Array.isArray(data) ? data : [];
        
        setBusinesses(results);
        
        const sorted = [...results].sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB - dateA;
        });
        setNewestBusinesses(sorted.slice(0, 6));
      }
    } catch (err) {
      console.error('Failed to search businesses:', err);
    } finally {
      setLoading(false);
    }
  };

  const flatCategories = categoryOptions.filter(opt => opt.type === 'category');

  // Placeholder property data (TODO: Connect to real property backend)
  const placeholderProperties = [
    {
      id: '1',
      name: 'Beautiful Home in Stone Mountain',
      city: 'Stone Mountain',
      state: 'GA',
      type: 'Single Family Home',
      price: '$425,000'
    },
    {
      id: '2',
      name: 'Modern Condo in Atlanta',
      city: 'Atlanta',
      state: 'GA',
      type: 'Condominium',
      price: '$285,000'
    },
    {
      id: '3',
      name: 'Investment Property',
      city: 'Decatur',
      state: 'GA',
      type: 'Multi-Family',
      price: '$550,000'
    }
  ];

  return (
    <FullWidthLayout>
      <SEO
        title="BANIBS Business Directory - Empowering Black Businesses"
        description="Search, connect, and partner with Black-owned businesses nationwide. Find trusted businesses in your community."
      />

      <div style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#0C0C0C' : '#F7F7F7',
        color: isDark ? '#F7F7F7' : '#111217'
      }}>
        
        {/* ROTATING HERO SECTION WITH MOTION */}
        <section style={{
          position: 'relative',
          minHeight: '680px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '48px 24px'
        }}>
          {/* Rotating Background Images */}
          {heroImages.map((img, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                opacity: currentHeroImage === idx ? 1 : 0,
                transition: 'opacity 1.5s ease-in-out',
                zIndex: 0
              }}
            />
          ))}
          
          {/* Dark Overlay */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.65))',
            zIndex: 1
          }} />
          
          {/* Hero Content Card (Glass Effect) */}
          <div style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '1200px',
            width: '100%',
            backgroundColor: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(200,168,87,0.4)',
            borderRadius: '16px',
            padding: '48px 32px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.45)'
          }}>
            {/* Hero Headline */}
            <h1 style={{
              fontSize: '42px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#F7F7F7',
              textShadow: '0 2px 8px rgba(0,0,0,0.3)'
            }}>
              Search for Black Businesses and Community Listings
            </h1>
            
            <p style={{
              fontSize: '20px',
              color: '#E8E8E8',
              marginBottom: '16px',
              maxWidth: '700px',
              margin: '0 auto 16px',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              fontWeight: '500'
            }}>
              Find what you need, support who we are.
            </p>
            
            <p style={{
              fontSize: '16px',
              color: '#D8D8D8',
              marginBottom: '40px',
              maxWidth: '750px',
              margin: '0 auto 40px',
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
              lineHeight: '1.6'
            }}>
              From barbers to builders, from cafes to consultants — BANIBS connects you to Black excellence near you.
            </p>
            
            {/* CTAs */}
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap',
              marginBottom: '48px'
            }}>
              <button
                onClick={() => navigate('/business/register')}
                style={{
                  backgroundColor: '#C8A857',
                  color: '#000000',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 16px rgba(200, 168, 87, 0.4)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4B872';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(200, 168, 87, 0.6)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#C8A857';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(200, 168, 87, 0.4)';
                }}
              >
                <Building2 size={20} />
                List Your Business
              </button>
              
              <button
                onClick={() => navigate(isAuthenticated ? '/portal/business' : '/auth/signin?redirect=/portal/business')}
                style={{
                  backgroundColor: 'transparent',
                  color: '#C8A857',
                  padding: '16px 32px',
                  fontSize: '18px',
                  fontWeight: '600',
                  borderRadius: '8px',
                  border: '2px solid #C8A857',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(200, 168, 87, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Briefcase size={20} />
                Manage Business Account
              </button>
            </div>
            
            {/* Three Search Boxes */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Name/Keyword */}
              <div style={{ position: 'relative' }}>
                <Search size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#B3B3C2',
                  zIndex: 1
                }} />
                <input
                  type="text"
                  placeholder="Business name or keyword..."
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    color: '#111217',
                    outline: 'none'
                  }}
                />
              </div>
              
              {/* Location + Radius */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <MapPin size={20} style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#B3B3C2',
                    zIndex: 1
                  }} />
                  <input
                    type="text"
                    placeholder="City or ZIP..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      color: '#111217',
                      outline: 'none'
                    }}
                  />
                </div>
                <select
                  value={searchRadius}
                  onChange={(e) => setSearchRadius(e.target.value)}
                  style={{
                    minWidth: '120px',
                    padding: '14px 12px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    color: '#111217',
                    cursor: 'pointer'
                  }}
                >
                  <option value="5">5 mi</option>
                  <option value="10">10 mi</option>
                  <option value="25">25 mi</option>
                  <option value="50">50 mi</option>
                  <option value="100">100 mi</option>
                  <option value="250">250 mi</option>
                </select>
              </div>
              
              {/* Category */}
              <div style={{ position: 'relative' }}>
                <Grid3x3 size={20} style={{
                  position: 'absolute',
                  left: '16px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#B3B3C2',
                  zIndex: 1,
                  pointerEvents: 'none'
                }} />
                <select
                  value={searchCategory}
                  onChange={(e) => {
                    setSearchCategory(e.target.value);
                    setTimeout(() => handleSearch(), 100);
                  }}
                  style={{
                    width: '100%',
                    padding: '14px 16px 14px 48px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.2)',
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    color: '#111217',
                    cursor: 'pointer'
                  }}
                >
                  <option value="">All Categories</option>
                  {flatCategories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label.trim()}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <button
              onClick={handleSearch}
              style={{
                backgroundColor: '#C8A857',
                color: '#000000',
                padding: '14px 48px',
                fontSize: '16px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(200, 168, 87, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#D4B872';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(200, 168, 87, 0.5)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#C8A857';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(200, 168, 87, 0.3)';
              }}
            >
              Search Businesses
            </button>
          </div>
        </section>

        {/* SEARCH → REVIEW → CONNECT STRIP */}
        <section style={{
          backgroundColor: '#161616',
          padding: '48px 24px',
          borderTop: '1px solid rgba(200,168,87,0.2)',
          borderBottom: '1px solid rgba(200,168,87,0.2)'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '32px'
          }}>
            <FeatureColumn
              icon={<Search size={40} />}
              title="Search"
              description="Find Black businesses locally and across the country."
            />
            <FeatureColumn
              icon={<Star size={40} />}
              title="Review"
              description="Compare services and offerings to choose the best fit."
            />
            <FeatureColumn
              icon={<Handshake size={40} />}
              title="Connect"
              description="Reach out and support businesses that align with your needs."
            />
          </div>
        </section>

        {/* NEWEST BUSINESSES (v2.0 - Preserved) */}
        <section style={{
          padding: '64px 24px',
          backgroundColor: isDark ? '#0C0C0C' : '#F7F7F7'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: isDark ? '#F7F7F7' : '#111217',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TrendingUp size={28} style={{ color: '#C8A857' }} />
                Newest Businesses
              </h2>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px', color: isDark ? '#B3B3C2' : '#4A4B57' }}>
                Loading businesses...
              </div>
            ) : newestBusinesses.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '24px'
              }}>
                {newestBusinesses.map((business, idx) => (
                  <BusinessCardV2 key={idx} business={business} isDark={isDark} navigate={navigate} />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '48px',
                backgroundColor: isDark ? '#161616' : '#FFFFFF',
                borderRadius: '12px',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
              }}>
                <Building2 size={48} style={{ color: isDark ? '#B3B3C2' : '#4A4B57', marginBottom: '16px' }} />
                <p style={{ color: isDark ? '#B3B3C2' : '#4A4B57', fontSize: '18px' }}>
                  No businesses found. Be the first to list your business!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* NEWEST PROPERTIES SECTION (NEW) */}
        <section style={{
          padding: '64px 24px',
          backgroundColor: isDark ? '#161616' : '#FFFFFF'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{
                fontSize: '28px',
                fontWeight: '600',
                color: isDark ? '#F7F7F7' : '#111217',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <Home size={28} style={{ color: '#C8A857' }} />
                Newest Properties
              </h2>
              <p style={{
                fontSize: '16px',
                color: isDark ? '#B3B3C2' : '#4A4B57'
              }}>
                Explore real estate listings from Black agents and investors.
              </p>
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '24px'
            }}>
              {placeholderProperties.map((property) => (
                <PropertyCard key={property.id} property={property} isDark={isDark} navigate={navigate} />
              ))}
            </div>
            
            <p style={{
              marginTop: '24px',
              fontSize: '14px',
              color: '#C8A857',
              textAlign: 'center'
            }}>
              🏗️ Property system coming soon - placeholder data shown
            </p>
          </div>
        </section>

        {/* BUSINESS CTA SECTION - UPGRADED COPY */}
        <section style={{
          padding: '80px 24px',
          background: 'linear-gradient(135deg, #C8A857 0%, #8A6F43 100%)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '38px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#000000'
            }}>
              Are You a Local Business?
            </h2>
            <p style={{
              fontSize: '22px',
              marginBottom: '24px',
              color: '#1a1a1a',
              fontWeight: '500'
            }}>
              Connect with more clients and grow with the BANIBS network.
            </p>
            <p style={{
              fontSize: '18px',
              marginBottom: '40px',
              color: '#2a2a2a',
              lineHeight: '1.6',
              maxWidth: '700px',
              margin: '0 auto 40px'
            }}>
              Discover a powerful platform designed to elevate Black-owned businesses. 
              Gain visibility, attract new customers, and build lasting community connections.
            </p>
            <button
              onClick={() => navigate('/business/register')}
              style={{
                backgroundColor: '#000000',
                color: '#C8A857',
                padding: '18px 56px',
                fontSize: '20px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(0, 0, 0, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
              }}
            >
              List Your Business
            </button>
          </div>
        </section>

        {/* WHY CHOOSE BANIBS (v2.0 - Preserved with spacing) */}
        <section style={{
          padding: '64px 24px',
          backgroundColor: isDark ? '#0C0C0C' : '#F7F7F7'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '48px',
              color: isDark ? '#F7F7F7' : '#111217'
            }}>
              Why Choose BANIBS Business Directory?
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '32px'
            }}>
              <FeatureCard
                icon={<Building2 size={32} />}
                title="Verified Black-Owned"
                description="All businesses are verified to ensure authenticity and trust"
                isDark={isDark}
              />
              <FeatureCard
                icon={<Star size={32} />}
                title="Community Rated"
                description="Real reviews from real community members"
                isDark={isDark}
              />
              <FeatureCard
                icon={<TrendingUp size={32} />}
                title="Growing Network"
                description="Join thousands of thriving Black-owned businesses"
                isDark={isDark}
              />
            </div>
          </div>
        </section>
      </div>
    </FullWidthLayout>
  );
};

// Feature Column Component (Search/Review/Connect)
const FeatureColumn = ({ icon, title, description }) => (
  <div style={{
    textAlign: 'center',
    padding: '24px'
  }}>
    <div style={{ color: '#C8A857', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '22px',
      fontWeight: '600',
      marginBottom: '12px',
      color: '#C8A857'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '16px',
      color: '#E8E8E8',
      lineHeight: '1.6'
    }}>
      {description}
    </p>
  </div>
);

// Business Card Component (Preserved from v2.0)
const BusinessCardV2 = ({ business, isDark, navigate }) => {
  const name = business.name || business.title || business.businessName || 'Untitled Business';
  const description = business.description || business.about || 'No description available';
  const location = business.city && business.state 
    ? `${business.city}, ${business.state}` 
    : business.location || 'Location not specified';
  
  return (
    <div
      onClick={() => navigate(`/business/${business.id}`)}
      style={{
        backgroundColor: isDark ? '#161616' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: '12px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = '#C8A857';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(200, 168, 87, 0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div style={{
        width: '64px',
        height: '64px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #C8A857 0%, #8A6F43 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '32px',
        fontWeight: '700',
        color: '#000000',
        marginBottom: '16px'
      }}>
        {name.charAt(0).toUpperCase()}
      </div>
      
      <h3 style={{
        fontSize: '20px',
        fontWeight: '600',
        marginBottom: '8px',
        color: isDark ? '#F7F7F7' : '#111217'
      }}>
        {name}
      </h3>
      
      <p style={{
        fontSize: '14px',
        color: isDark ? '#B3B3C2' : '#4A4B57',
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <MapPin size={16} />
        {location}
      </p>
      
      <p style={{
        fontSize: '14px',
        color: isDark ? '#B3B3C2' : '#4A4B57',
        lineHeight: '1.5',
        marginBottom: '16px',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden'
      }}>
        {description}
      </p>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        color: '#C8A857',
        fontSize: '14px',
        fontWeight: '600'
      }}>
        View Details <ArrowRight size={16} style={{ marginLeft: '4px' }} />
      </div>
    </div>
  );
};

// Property Card Component (NEW)
const PropertyCard = ({ property, isDark, navigate }) => {
  return (
    <div
      style={{
        backgroundColor: isDark ? '#161616' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: '12px',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = '#C8A857';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(200, 168, 87, 0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Placeholder Image */}
      <div style={{
        height: '200px',
        background: 'linear-gradient(135deg, #C8A857 0%, #8A6F43 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Home size={64} color="#000000" opacity={0.3} />
      </div>
      
      <div style={{ padding: '24px' }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: '600',
          marginBottom: '8px',
          color: isDark ? '#F7F7F7' : '#111217'
        }}>
          {property.name}
        </h3>
        
        <p style={{
          fontSize: '14px',
          color: isDark ? '#B3B3C2' : '#4A4B57',
          marginBottom: '8px'
        }}>
          {property.city}, {property.state}
        </p>
        
        <p style={{
          fontSize: '14px',
          color: isDark ? '#B3B3C2' : '#4A4B57',
          marginBottom: '12px'
        }}>
          {property.type}
        </p>
        
        <p style={{
          fontSize: '22px',
          fontWeight: '600',
          color: '#C8A857',
          marginBottom: '16px'
        }}>
          {property.price}
        </p>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          color: '#C8A857',
          fontSize: '14px',
          fontWeight: '600'
        }}>
          View Property <ArrowRight size={16} style={{ marginLeft: '4px' }} />
        </div>
      </div>
    </div>
  );
};

// Feature Card Component (Preserved from v2.0)
const FeatureCard = ({ icon, title, description, isDark }) => (
  <div style={{
    padding: '32px 24px',
    borderRadius: '12px',
    backgroundColor: isDark ? '#161616' : '#FFFFFF',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
    transition: 'all 0.2s ease'
  }}>
    <div style={{ color: '#C8A857', marginBottom: '16px' }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '20px',
      fontWeight: '600',
      marginBottom: '12px',
      color: isDark ? '#F7F7F7' : '#111217'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '16px',
      color: isDark ? '#B3B3C2' : '#4A4B57',
      lineHeight: '1.6'
    }}>
      {description}
    </p>
  </div>
);

export default BusinessDirectoryV21;
