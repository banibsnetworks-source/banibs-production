import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Grid3x3, Building2, TrendingUp, Star, ArrowRight, Briefcase } from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import SEO from '../../components/SEO';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { categoryOptions } from '../../data/businessCategories';

/**
 * Business Directory V2 - Phase B.0
 * Modern, conversion-focused business directory with clear owner/shopper separation
 * Implements 5-step flow from redesign spec
 */
const BusinessDirectoryV2 = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Search state
  const [searchName, setSearchName] = useState('');
  const [searchLocation, setSearchLocation] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  
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
        
        // Get newest (sort by created_at if available)
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
      
      // Add category to backend search if selected
      if (searchCategory) {
        params.append('category', searchCategory);
      }
      
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/search?${params.toString()}`
      );
      
      if (response.ok) {
        const data = await response.json();
        let results = Array.isArray(data) ? data : [];
        
        // Client-side filtering for name/keyword
        if (searchName.trim()) {
          const query = searchName.toLowerCase();
          results = results.filter(biz => {
            const name = biz.name || biz.title || biz.businessName || '';
            const desc = biz.description || biz.about || '';
            return name.toLowerCase().includes(query) || desc.toLowerCase().includes(query);
          });
        }
        
        // Client-side filtering for location
        if (searchLocation.trim()) {
          const locQuery = searchLocation.toLowerCase();
          results = results.filter(biz => {
            const city = (biz.city || '').toLowerCase();
            const state = (biz.state || '').toLowerCase();
            const zipcode = (biz.zipcode || '').toLowerCase();
            const location = (biz.location || '').toLowerCase();
            return city.includes(locQuery) || 
                   state.includes(locQuery) || 
                   zipcode.includes(locQuery) ||
                   location.includes(locQuery);
          });
        }
        
        setBusinesses(results);
        
        // Update newest businesses
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

  return (
    <FullWidthLayout>
      <SEO
        title="BANIBS Business Directory - Find Black-Owned Businesses"
        description="Discover trusted Black-owned and allied businesses. Search by category, location, and more."
      />

      <div style={{
        minHeight: '100vh',
        backgroundColor: isDark ? '#0C0C0C' : '#F7F7F7',
        color: isDark ? '#F7F7F7' : '#111217'
      }}>
        
        {/* STEP 1: TOP ACTION BOX - Business Owner Prompt */}
        <section style={{
          background: isDark 
            ? 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%)',
          borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
          padding: '48px 24px',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '600',
              marginBottom: '16px',
              color: isDark ? '#F7F7F7' : '#111217'
            }}>
              Are you a business owner?
            </h1>
            
            <p style={{
              fontSize: '18px',
              color: isDark ? '#B3B3C2' : '#4A4B57',
              marginBottom: '32px',
              maxWidth: '600px',
              margin: '0 auto 32px'
            }}>
              Join thousands of Black-owned businesses on BANIBS and connect with customers who support our community.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '16px',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              {/* Primary CTA: List Your Business */}
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
                  boxShadow: '0 4px 12px rgba(200, 168, 87, 0.3)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4B872';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(200, 168, 87, 0.4)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#C8A857';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(200, 168, 87, 0.3)';
                }}
              >
                <Building2 size={20} />
                List Your Business
              </button>
              
              {/* Secondary CTA: Manage Business Account */}
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
                  e.currentTarget.style.backgroundColor = 'rgba(200, 168, 87, 0.1)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Briefcase size={20} />
                Manage Business Account
              </button>
            </div>
          </div>
        </section>

        {/* STEP 2: SEARCH TOOLS - Three Search Boxes */}
        <section style={{
          padding: '48px 24px',
          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              marginBottom: '32px',
              textAlign: 'center',
              color: isDark ? '#F7F7F7' : '#111217'
            }}>
              Find a Business
            </h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {/* Search by Name/Keyword */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: isDark ? '#B3B3C2' : '#4A4B57'
                }}>
                  Search by Name or Keyword
                </label>
                <div style={{
                  position: 'relative'
                }}>
                  <Search 
                    size={20} 
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: isDark ? '#B3B3C2' : '#4A4B57'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="e.g., Hair salon, Restaurant..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      backgroundColor: isDark ? '#161616' : '#F7F7F7',
                      color: isDark ? '#F7F7F7' : '#111217',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#C8A857'}
                    onBlur={(e) => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  />
                </div>
              </div>
              
              {/* Search by Location */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: isDark ? '#B3B3C2' : '#4A4B57'
                }}>
                  Search by Location
                </label>
                <div style={{
                  position: 'relative'
                }}>
                  <MapPin 
                    size={20} 
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: isDark ? '#B3B3C2' : '#4A4B57'
                    }}
                  />
                  <input
                    type="text"
                    placeholder="City, State, or Zip Code"
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      backgroundColor: isDark ? '#161616' : '#F7F7F7',
                      color: isDark ? '#F7F7F7' : '#111217',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#C8A857'}
                    onBlur={(e) => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                  />
                </div>
              </div>
              
              {/* Search by Category */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: isDark ? '#B3B3C2' : '#4A4B57'
                }}>
                  Search by Category
                </label>
                <div style={{
                  position: 'relative'
                }}>
                  <Grid3x3 
                    size={20} 
                    style={{
                      position: 'absolute',
                      left: '16px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: isDark ? '#B3B3C2' : '#4A4B57',
                      pointerEvents: 'none'
                    }}
                  />
                  <select
                    value={searchCategory}
                    onChange={(e) => {
                      setSearchCategory(e.target.value);
                      // Auto-trigger search when category changes
                      setTimeout(() => handleSearch(), 100);
                    }}
                    style={{
                      width: '100%',
                      padding: '14px 16px 14px 48px',
                      fontSize: '16px',
                      borderRadius: '8px',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                      backgroundColor: isDark ? '#161616' : '#F7F7F7',
                      color: isDark ? '#F7F7F7' : '#111217',
                      outline: 'none',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.currentTarget.style.borderColor = '#C8A857'}
                    onBlur={(e) => e.currentTarget.style.borderColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
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
            </div>
            
            <div style={{ textAlign: 'center' }}>
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
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#D4B872'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#C8A857'}
              >
                Search Businesses
              </button>
            </div>
          </div>
        </section>

        {/* STEP 3: DYNAMIC LISTS - Newest Businesses */}
        <section style={{
          padding: '48px 24px',
          backgroundColor: isDark ? '#161616' : '#F7F7F7'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '32px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: '600',
                color: isDark ? '#F7F7F7' : '#111217',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <TrendingUp size={24} style={{ color: '#C8A857' }} />
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
                  <BusinessCardV2 key={idx} business={business} isDark={isDark} />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '48px',
                backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
                borderRadius: '8px',
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

        {/* STEP 4: CTA REINFORCEMENT */}
        <section style={{
          padding: '64px 24px',
          background: isDark
            ? 'linear-gradient(135deg, #C8A857 0%, #8A6F43 100%)'
            : 'linear-gradient(135deg, #C8A857 0%, #D4B872 100%)',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '600',
              marginBottom: '16px',
              color: '#000000'
            }}>
              Are you a local business?
            </h2>
            <p style={{
              fontSize: '18px',
              marginBottom: '32px',
              color: '#1a1a1a'
            }}>
              Join BANIBS today and connect with customers who value Black-owned businesses.
            </p>
            <button
              onClick={() => navigate('/business/register')}
              style={{
                backgroundColor: '#000000',
                color: '#C8A857',
                padding: '16px 48px',
                fontSize: '18px',
                fontWeight: '600',
                borderRadius: '8px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.4)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
              }}
            >
              List Your Business Now
            </button>
          </div>
        </section>

        {/* STEP 5: OPTIONAL CONTENT - Community Highlights */}
        <section style={{
          padding: '48px 24px',
          backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: '600',
              marginBottom: '16px',
              color: isDark ? '#F7F7F7' : '#111217'
            }}>
              Why Choose BANIBS Business Directory?
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '32px',
              marginTop: '32px'
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

// Business Card Component (V2 Style)
const BusinessCardV2 = ({ business, isDark }) => {
  const navigate = useNavigate();
  
  const name = business.name || business.title || business.businessName || 'Untitled Business';
  const description = business.description || business.about || 'No description available';
  const location = business.city && business.state 
    ? `${business.city}, ${business.state}` 
    : business.location || 'Location not specified';
  
  return (
    <div
      onClick={() => navigate(`/business/${business.id}`)}
      style={{
        backgroundColor: isDark ? '#0C0C0C' : '#FFFFFF',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: '12px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative'
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
      {/* Business Initial Badge */}
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

// Feature Card Component
const FeatureCard = ({ icon, title, description, isDark }) => (
  <div style={{
    padding: '24px',
    borderRadius: '12px',
    backgroundColor: isDark ? '#161616' : '#F7F7F7',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
  }}>
    <div style={{ color: '#C8A857', marginBottom: '16px' }}>
      {icon}
    </div>
    <h3 style={{
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
      color: isDark ? '#F7F7F7' : '#111217'
    }}>
      {title}
    </h3>
    <p style={{
      fontSize: '14px',
      color: isDark ? '#B3B3C2' : '#4A4B57',
      lineHeight: '1.5'
    }}>
      {description}
    </p>
  </div>
);

export default BusinessDirectoryV2;
