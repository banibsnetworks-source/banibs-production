// pages/ability/providers/AbilityProviderDirectoryPage.jsx - Phase 11.5.2
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MapPin, Globe, Phone, Mail, CheckCircle, Users, Stethoscope } from "lucide-react";

export default function AbilityProviderDirectoryPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    provider_type: "",
    disability_type: "",
    telehealth: null,
    region: ""
  });

  useEffect(() => {
    fetchProviders();
  }, [filters]);

  const fetchProviders = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.provider_type) params.append('provider_type', filters.provider_type);
      if (filters.disability_type) params.append('disability_type', filters.disability_type);
      if (filters.telehealth !== null) params.append('telehealth', filters.telehealth);
      if (filters.region) params.append('region', filters.region);
      params.append('limit', '50');

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/providers?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        setProviders(data.providers);
      }
    } catch (err) {
      console.error("Failed to fetch providers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="text-sm text-slate-400">Loading providers...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/portal/ability"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition mb-4"
          >
            ← Back to Ability Network
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <Users className="text-purple-400" size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-100">
                Provider Directory
              </h1>
              <p className="text-base text-slate-300 mt-1">
                Connect with verified specialists, therapists, advocates, and support services
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-xl bg-slate-900/50 border border-slate-800 p-5">
          <h3 className="text-sm font-bold text-slate-100 mb-4">Filter Providers</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Provider Type
              </label>
              <select
                value={filters.provider_type}
                onChange={(e) => handleFilterChange('provider_type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">All Types</option>
                <option value="specialist">Specialist</option>
                <option value="therapist">Therapist</option>
                <option value="advocate">Advocate</option>
                <option value="case_manager">Case Manager</option>
                <option value="home_care">Home Care</option>
                <option value="accessibility_consultant">Accessibility Consultant</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Disability Focus
              </label>
              <select
                value={filters.disability_type}
                onChange={(e) => handleFilterChange('disability_type', e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">All Types</option>
                <option value="physical">Physical</option>
                <option value="visual">Visual</option>
                <option value="hearing">Hearing</option>
                <option value="cognitive">Cognitive</option>
                <option value="neurodivergent">Neurodivergent</option>
                <option value="chronic_condition">Chronic Condition</option>
                <option value="mental_health">Mental Health</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Service Type
              </label>
              <select
                value={filters.telehealth === null ? "" : filters.telehealth}
                onChange={(e) => handleFilterChange('telehealth', e.target.value === "" ? null : e.target.value === "true")}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-purple-500"
              >
                <option value="">All Services</option>
                <option value="true">Telehealth Only</option>
                <option value="false">In-Person Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Region
              </label>
              <input
                type="text"
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                placeholder="e.g., Southeast"
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-sm text-slate-400">
            Found <span className="font-semibold text-slate-200">{providers.length}</span> providers
          </p>
        </div>

        {/* Providers Grid */}
        <div className="grid md:grid-cols-2 gap-5">
          {providers.map((provider) => (
            <Link
              key={provider.id}
              to={`/portal/ability/providers/${provider.id}`}
              className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 hover:border-purple-500/50 transition block"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-100 mb-1">
                    {provider.name}
                  </h3>
                  <p className="text-sm text-slate-400 capitalize">
                    {provider.provider_type.replace('_', ' ')}
                  </p>
                </div>
                {provider.is_verified && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30">
                    <CheckCircle size={12} className="text-purple-300" />
                    <span className="text-xs font-semibold text-purple-300">Verified</span>
                  </div>
                )}
              </div>

              {/* Bio Preview */}
              <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                {provider.bio}
              </p>

              {/* Location & Contact */}
              <div className="space-y-2 mb-4">
                {provider.city && provider.state && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={14} className="text-purple-400" />
                    <span>{provider.city}, {provider.state}</span>
                  </div>
                )}
                {provider.telehealth_available && (
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Globe size={14} className="text-purple-400" />
                    <span>Telehealth Available</span>
                  </div>
                )}
              </div>

              {/* Specializations */}
              <div className="flex flex-wrap gap-2 mb-4">
                {provider.specializations.slice(0, 3).map((spec) => (
                  <span
                    key={spec}
                    className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-xs text-purple-300"
                  >
                    {spec.replace('_', ' ')}
                  </span>
                ))}
                {provider.specializations.length > 3 && (
                  <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-400">
                    +{provider.specializations.length - 3} more
                  </span>
                )}
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {provider.accepts_insurance && (
                    <span className="text-green-400">Accepts Insurance</span>
                  )}
                  {provider.is_black_owned && (
                    <span className="font-semibold text-slate-300">Black-Owned</span>
                  )}
                </div>
                {provider.rating && (
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400">★</span>
                    <span className="font-semibold text-slate-200">{provider.rating}</span>
                    <span className="text-slate-400">({provider.total_reviews})</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {providers.length === 0 && (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-600 mb-4" size={64} />
            <h3 className="text-lg font-bold text-slate-300 mb-2">No providers found</h3>
            <p className="text-sm text-slate-400">
              Try adjusting your filters or search criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
