import React, { useState, useEffect } from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import SEO from '../../components/SEO';
import { Briefcase, Users, TrendingUp, Search, Building2, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * BusinessPortal - Phase 8.4
 * BANIBS Business Portal landing page with business owner tools
 * Features rotating hero carousel with real Black business imagery
 */
const BusinessPortal = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Hero carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const heroImages = [
    {
      src: '/images/business/hero/hero-1.jpg',
      title: 'Grow Your Black-Owned Business',
      subtitle: 'Connect with customers, partners, and opportunities'
    },
    {
      src: '/images/business/hero/hero-2.jpg',
      title: 'Build Your Business Network',
      subtitle: 'Join thousands of Black entrepreneurs and business owners'
    },
    {
      src: '/images/business/hero/hero-3.jpg',
      title: 'Access Resources & Capital',
      subtitle: 'Find funding, mentorship, and tools to scale your business'
    },
    {
      src: '/images/business/hero/hero-4.jpg',
      title: 'Hire Top Black Talent',
      subtitle: 'Post jobs and connect with skilled professionals in our community'
    }
  ];
  
  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change slide every 5 seconds
    
    return () => clearInterval(interval);
  }, []);
  
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };
  
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <BusinessLayout>
      <SEO
        title="BANIBS Business Portal - Directory, Marketplace, Jobs"
        description="Discover Black-owned businesses, find opportunities, and grow your network."
      />

      <div style={{ 
        minHeight: 'calc(100vh - 56px)',
        background: isDark 
          ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          : 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'
      }}>
        {/* Hero */}
        <div 
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(232, 182, 87, 0.15) 0%, rgba(10, 10, 10, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(232, 182, 87, 0.2) 0%, rgba(249, 250, 251, 0.95) 100%)',
            padding: '80px 0'
          }}
        >
          <div className="container mx-auto px-4 text-center">
            <h1 
              className="text-5xl font-bold mb-4"
              style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
            >
              BANIBS Business Portal
            </h1>
            <p 
              className="text-xl mb-8"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              Directory • Marketplace • Jobs • Resources
            </p>
          </div>
        </div>

        {/* Business Owner Tools - Show if user is logged in */}
        {user && (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-5xl mx-auto">
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
              >
                Business Owner Tools
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <Link
                  to="/portal/business/profile"
                  className="rounded-xl p-6 text-center transition-all"
                  style={{
                    background: isDark ? 'rgba(232, 182, 87, 0.1)' : 'rgba(232, 182, 87, 0.15)',
                    border: `2px solid ${isDark ? 'rgba(232, 182, 87, 0.3)' : 'rgba(232, 182, 87, 0.4)'}`,
                  }}
                >
                  <Building2 
                    className="mx-auto mb-3" 
                    size={40} 
                    style={{ color: isDark ? '#E8B657' : '#D4A446' }}
                  />
                  <h3 
                    className="text-lg font-bold mb-2"
                    style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
                  >
                    Manage My Business
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                  >
                    View and customize your business profile, branding, and services
                  </p>
                </Link>

                <Link
                  to="/portal/business/board"
                  className="rounded-xl p-6 text-center transition-all"
                  style={{
                    background: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    border: `2px solid ${isDark ? 'rgba(34, 197, 94, 0.3)' : 'rgba(34, 197, 94, 0.4)'}`,
                  }}
                >
                  <MessageSquare 
                    className="mx-auto mb-3" 
                    size={40} 
                    style={{ color: isDark ? '#22C55E' : '#16A34A' }}
                  />
                  <h3 
                    className="text-lg font-bold mb-2"
                    style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
                  >
                    Business Board
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                  >
                    Post opportunities and connect with other businesses
                  </p>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Quick Links */}
        <div className="container mx-auto px-4 py-12">
          <h2 
            className="text-2xl font-bold mb-6 max-w-5xl mx-auto"
            style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
          >
            Explore
          </h2>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Link
              to="/business-directory"
              className="rounded-xl p-8 text-center transition-colors"
              style={{
                background: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)'}`
              }}
            >
              <Briefcase 
                className="mx-auto mb-4" 
                size={48}
                style={{ color: isDark ? '#E8B657' : '#D4A446' }}
              />
              <h3 
                className="text-xl font-bold mb-2"
                style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
              >
                Business Directory
              </h3>
              <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                Find Black-owned businesses near you
              </p>
            </Link>

            <Link
              to="/opportunities"
              className="rounded-xl p-8 text-center transition-colors"
              style={{
                background: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)'}`
              }}
            >
              <TrendingUp 
                className="mx-auto mb-4" 
                size={48}
                style={{ color: '#22C55E' }}
              />
              <h3 
                className="text-xl font-bold mb-2"
                style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
              >
                Job Opportunities
              </h3>
              <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                Explore careers and grants
              </p>
            </Link>

            <Link
              to="/resources"
              className="rounded-xl p-8 text-center transition-colors"
              style={{
                background: isDark ? 'rgba(31, 41, 55, 0.5)' : 'rgba(255, 255, 255, 0.8)',
                border: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(209, 213, 219, 0.5)'}`
              }}
            >
              <Users 
                className="mx-auto mb-4" 
                size={48}
                style={{ color: '#3B82F6' }}
              />
              <h3 
                className="text-xl font-bold mb-2"
                style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
              >
                Resources
              </h3>
              <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                Tools and guides for growth
              </p>
            </Link>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default BusinessPortal;