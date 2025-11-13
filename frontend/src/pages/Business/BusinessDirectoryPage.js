import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../components/EmptyState";
import SEO from "../../components/SEO";
import GlobalNavBar from "../../components/GlobalNavBar";
import { useAuth } from "../../contexts/AuthContext";
import { Building2, MessageSquare, Plus } from "lucide-react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const CATEGORIES = [
  "All Categories",
  "Technology",
  "Food & Beverage",
  "Professional Services",
  "Retail",
  "Healthcare",
  "Education",
  "Construction",
  "Transportation",
  "Arts & Entertainment",
  "Real Estate",
  "Other"
];

function BusinessDirectoryPage() {
  const { user } = useAuth();
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);
  
  const [filters, setFilters] = useState({
    q: "",
    category: "",
    location: "",
    verifiedOnly: false
  });

  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Check if user has a business profile
  useEffect(() => {
    async function checkBusinessProfile() {
      if (!user) {
        setHasBusinessProfile(false);
        return;
      }

      try {
        const token = localStorage.getItem('access_token');
        const response = await fetch(`${BACKEND_URL}/api/business/my-profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (response.ok) {
          setHasBusinessProfile(true);
        } else {
          setHasBusinessProfile(false);
        }
      } catch (err) {
        setHasBusinessProfile(false);
      }
    }

    checkBusinessProfile();
  }, [user]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(filters.q);
    }, 400);

    return () => clearTimeout(timer);
  }, [filters.q]);

  // Fetch businesses when filters change
  useEffect(() => {
    fetchBusinesses();
  }, [debouncedQuery, filters.category, filters.location, filters.verifiedOnly]);

  async function fetchBusinesses() {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (debouncedQuery) params.append("q", debouncedQuery);
      if (filters.category && filters.category !== "All Categories") {
        params.append("category", filters.category);
      }
      if (filters.location) params.append("location", filters.location);
      if (filters.verifiedOnly) params.append("verified_only", "true");
      params.append("limit", "50");

      // Increased timeout for initial load while backend warms up
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const res = await fetch(`${BACKEND_URL}/api/business/directory?${params.toString()}`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error("Failed to load directory");
      }

      const data = await res.json();
      setBusinesses(data);
    } catch (err) {
      console.error(err);
      setError("We're having trouble loading the directory right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(10, 10, 12)' }}>
      <SEO 
        title="BANIBS Business Directory - Black-Owned Businesses"
        description="Discover and support Black-owned and Black-supporting businesses. Find verified businesses in technology, food, healthcare, education, and more."
      />
      <GlobalNavBar />
      <div className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
            BANIBS Business Directory
          </h1>
          <p className="text-slate-300 text-base md:text-lg">
            Discover Black-owned and Black-supporting businesses in our network. 
            Open to all, rooted in Black advancement.
          </p>
        </div>

        {/* Call to Action for Anonymous Users */}
        {!user && (
          <div className="mb-8">
            <div style={{
              background: 'rgba(10, 10, 12, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(232, 182, 87, 0.2)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white mb-2">
                    Own a Business? Join Our Directory
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Sign in or create an account to add your business to the BANIBS directory and connect with customers.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    to="/login"
                    className="px-6 py-3 text-white font-semibold rounded-lg transition-colors"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.12)'
                    }}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="px-6 py-3 text-black font-bold rounded-lg transition-colors"
                    style={{
                      background: 'rgb(232, 182, 87)'
                    }}
                  >
                    Create Account
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Business Owner Tools - Show for logged in users */}
        {user && (
          <div className="mb-8">
            <div style={{
              background: 'rgba(10, 10, 12, 0.85)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '16px',
              padding: '24px'
            }}>
              <h2 className="text-xl font-bold text-white mb-4">
                {hasBusinessProfile ? 'Business Owner Tools' : 'Start Your Business Journey'}
              </h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                {/* Create/Manage Business */}
                <Link
                  to="/portal/business/profile/edit"
                  className="flex items-center gap-3 p-4 rounded-xl transition-all"
                  style={{
                    background: 'rgba(232, 182, 87, 0.1)',
                    border: '1px solid rgba(232, 182, 87, 0.3)'
                  }}
                >
                  {hasBusinessProfile ? (
                    <>
                      <Building2 style={{ color: 'rgb(232, 182, 87)' }} className="flex-shrink-0" size={28} />
                      <div>
                        <div className="text-white font-semibold">Manage My Business</div>
                        <div className="text-gray-400 text-sm">Edit profile & branding</div>
                      </div>
                    </>
                  ) : (
                    <>
                      <Plus style={{ color: 'rgb(232, 182, 87)' }} className="flex-shrink-0" size={28} />
                      <div>
                        <div className="text-white font-semibold">Create Business Profile</div>
                        <div className="text-gray-400 text-sm">Join the directory</div>
                      </div>
                    </>
                  )}
                </Link>

                {/* Business Board / Business Social */}
                {hasBusinessProfile && (
                  <Link
                    to="/portal/business/board"
                    className="flex items-center gap-3 p-4 rounded-xl transition-all"
                    style={{
                      background: 'rgba(16, 185, 129, 0.1)',
                      border: '1px solid rgba(16, 185, 129, 0.3)'
                    }}
                  >
                    <MessageSquare style={{ color: 'rgb(16, 185, 129)' }} className="flex-shrink-0" size={28} />
                    <div>
                      <div className="text-white font-semibold">Business Social</div>
                      <div className="text-gray-400 text-sm">Connect & collaborate</div>
                    </div>
                  </Link>
                )}

                {/* Empty slot or future feature */}
                {!hasBusinessProfile && (
                  <div className="flex items-center gap-3 p-4 rounded-xl opacity-50" style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <MessageSquare className="text-gray-600 flex-shrink-0" size={28} />
                    <div>
                      <div className="text-gray-500 font-semibold">Business Social</div>
                      <div className="text-gray-600 text-sm">Available after setup</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div style={{
          background: 'rgba(10, 10, 12, 0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Business name or description..."
                value={filters.q}
                onChange={(e) => handleFilterChange("q", e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white focus:outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  '::placeholder': { color: 'rgba(255, 255, 255, 0.4)' }
                }}
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Industry
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white focus:outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat === "All Categories" ? "" : cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Location
              </label>
              <input
                type="text"
                placeholder="City or State"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full px-4 py-2 rounded-lg text-white focus:outline-none"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
            </div>
          </div>

          {/* Verified Toggle */}
          <div className="mt-4 flex items-center">
            <input
              type="checkbox"
              id="verified-only"
              checked={filters.verifiedOnly}
              onChange={(e) => handleFilterChange("verifiedOnly", e.target.checked)}
              className="w-4 h-4 text-yellow-500 bg-slate-900 border-slate-600 rounded focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-slate-800"
              aria-label="Filter to show verified businesses only"
            />
            <label htmlFor="verified-only" className="ml-2 text-sm text-slate-300">
              Show verified businesses only
            </label>
          </div>
        </div>

        {/* Results Count */}
        {!loading && (
          <div className="mb-4 text-sm text-slate-400">
            {businesses.length} {businesses.length === 1 ? 'business' : 'businesses'} found
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl p-6 animate-pulse"
                style={{
                  background: 'rgba(10, 10, 12, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full" style={{ background: 'rgba(255, 255, 255, 0.1)' }}></div>
                  <div className="flex-1">
                    <div className="h-4 rounded mb-2" style={{ background: 'rgba(255, 255, 255, 0.1)' }}></div>
                    <div className="h-3 rounded w-2/3" style={{ background: 'rgba(255, 255, 255, 0.1)' }}></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 rounded" style={{ background: 'rgba(255, 255, 255, 0.1)' }}></div>
                  <div className="h-3 rounded w-5/6" style={{ background: 'rgba(255, 255, 255, 0.1)' }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && businesses.length === 0 && (
          <EmptyState
            title="No businesses found"
            description="Try adjusting your filters or check back as more businesses join the BANIBS network."
            icon={
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            }
          />
        )}

        {/* Business Grid */}
        {!loading && businesses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {businesses.map((business) => (
              <div
                key={business.id}
                className="rounded-2xl p-6 transition group"
                style={{
                  background: 'rgba(10, 10, 12, 0.85)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)'
                }}
              >
                {/* Logo & Name */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    {business.logo_url ? (
                      <img
                        src={business.logo_url}
                        alt={`${business.business_name} logo`}
                        className="w-16 h-16 rounded-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white font-bold text-xl">
                        {business.business_name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-semibold text-white transition" style={{
                        color: 'white'
                      }}>
                        {business.business_name}
                      </h3>
                      {business.verified && (
                        <span className="flex-shrink-0 px-2 py-1 text-xs font-medium rounded-full" style={{
                          background: 'rgba(16, 185, 129, 0.2)',
                          border: '1px solid rgb(16, 185, 129)',
                          color: 'rgb(16, 185, 129)'
                        }}>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 mt-1">{business.category}</p>
                  </div>
                </div>

                {/* Description */}
                {business.description && (
                  <p className="text-sm text-slate-300 mb-4 line-clamp-3">
                    {business.description}
                  </p>
                )}

                {/* Location */}
                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{business.city}, {business.state}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {business.website && (
                    <a
                      href={business.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black text-sm font-semibold rounded-lg text-center transition"
                    >
                      Visit Website
                    </a>
                  )}
                  {business.contact_email && (
                    <a
                      href={`mailto:${business.contact_email}`}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-semibold rounded-lg transition"
                    >
                      Contact
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default BusinessDirectoryPage;
