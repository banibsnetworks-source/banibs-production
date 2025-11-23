// pages/community/HealthProvidersPage.jsx - Phase 11.6.1
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { 
  Heart, 
  MapPin, 
  Phone, 
  Globe, 
  Video, 
  DollarSign,
  Accessibility,
  Filter
} from "lucide-react";

export default function HealthProvidersPage() {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [blackOwned, setBlackOwned] = useState(false);
  const [telehealth, setTelehealth] = useState(false);
  const [slidingScale, setSlidingScale] = useState(false);
  const [acceptsUninsured, setAcceptsUninsured] = useState(false);
  const [abilityFriendly, setAbilityFriendly] = useState(false);

  useEffect(() => {
    fetchProviders();
  }, [blackOwned, telehealth, slidingScale, acceptsUninsured, abilityFriendly]);

  const fetchProviders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (blackOwned) params.append("black_owned", "true");
      if (telehealth) params.append("telehealth", "true");
      if (slidingScale) params.append("sliding_scale", "true");
      if (acceptsUninsured) params.append("accepts_uninsured", "true");
      if (abilityFriendly) params.append("ability_friendly", "true");

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/health/providers?${params.toString()}`
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

  const FilterToggle = ({ label, checked, onChange, icon: Icon }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition ${
        checked
          ? "bg-teal-500/20 border-2 border-teal-500 text-teal-300"
          : "bg-slate-800/50 border border-slate-700 text-slate-300 hover:border-slate-600"
      }`}
    >
      {Icon && <Icon size={14} />}
      {label}
    </button>
  );

  return (
    <CommunityLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30">
            <Heart className="text-teal-400" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">
              Healthcare Provider Directory
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Find culturally competent, affordable care in your area
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="mb-6 rounded-xl bg-slate-900/50 border border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="text-slate-400" size={16} />
          <h2 className="text-sm font-semibold text-slate-200">Filters</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterToggle
            label="Black-Owned"
            checked={blackOwned}
            onChange={setBlackOwned}
          />
          <FilterToggle
            label="Telehealth"
            checked={telehealth}
            onChange={setTelehealth}
            icon={Video}
          />
          <FilterToggle
            label="Sliding Scale"
            checked={slidingScale}
            onChange={setSlidingScale}
            icon={DollarSign}
          />
          <FilterToggle
            label="Accepts Uninsured"
            checked={acceptsUninsured}
            onChange={setAcceptsUninsured}
          />
          <FilterToggle
            label="Accessibility"
            checked={abilityFriendly}
            onChange={setAbilityFriendly}
            icon={Accessibility}
          />
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-slate-400">
          {loading ? "Loading..." : `${providers.length} provider${providers.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Provider Grid */}
      {loading ? (
        <div className="text-sm text-slate-400">Loading providers...</div>
      ) : providers.length === 0 ? (
        <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-8 text-center">
          <Heart className="mx-auto text-slate-600 mb-3" size={48} />
          <h3 className="text-lg font-bold text-slate-100 mb-2">
            No providers found
          </h3>
          <p className="text-sm text-slate-400">
            Try adjusting your filters to see more results
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-teal-500/50 transition"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-100 mb-1">
                    {provider.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={12} />
                    <span>
                      {provider.city}, {provider.state}
                    </span>
                  </div>
                </div>
                {provider.is_black_owned && (
                  <span className="px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[0.65rem] font-semibold text-amber-300">
                    Black-Owned
                  </span>
                )}
              </div>

              {/* Services */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 rounded-md bg-teal-500/10 border border-teal-500/30 text-xs text-teal-300">
                  {provider.type.replace('_', ' ')}
                </span>
                {provider.service_types.slice(0, 2).map((service) => (
                  <span
                    key={service}
                    className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300"
                  >
                    {service.replace('_', ' ')}
                  </span>
                ))}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2 mb-3 text-xs">
                {provider.telehealth && (
                  <span className="flex items-center gap-1 text-blue-400">
                    <Video size={12} />
                    Telehealth
                  </span>
                )}
                {provider.sliding_scale && (
                  <span className="flex items-center gap-1 text-green-400">
                    <DollarSign size={12} />
                    Sliding Scale
                  </span>
                )}
                {provider.accepts_uninsured && (
                  <span className="text-emerald-400">
                    Uninsured OK
                  </span>
                )}
                {provider.ability_friendly && (
                  <span className="flex items-center gap-1 text-purple-400">
                    <Accessibility size={12} />
                    Accessible
                  </span>
                )}
              </div>

              {/* Contact & CTA */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <div className="flex gap-3 text-xs text-slate-400">
                  {provider.contact_phone && (
                    <a
                      href={`tel:${provider.contact_phone}`}
                      className="flex items-center gap-1 hover:text-teal-400 transition"
                    >
                      <Phone size={12} />
                      Call
                    </a>
                  )}
                  {provider.contact_website && (
                    <a
                      href={provider.contact_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-teal-400 transition"
                    >
                      <Globe size={12} />
                      Website
                    </a>
                  )}
                </div>
                <Link
                  to={`/portal/community/health/providers/${provider.slug || provider.id}`}
                  className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition"
                >
                  View Details →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </CommunityLayout>
  );
}
