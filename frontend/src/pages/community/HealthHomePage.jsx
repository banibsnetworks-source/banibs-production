// pages/community/HealthHomePage.jsx - Phase 11.6
import React, { useEffect, useState } from "react";
import CommunityLayout from "../../components/community/CommunityLayout";
import { Heart, Search, MapPin, DollarSign } from "lucide-react";

export default function HealthHomePage() {
  const [resources, setResources] = useState([]);
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resResponse, provResponse] = await Promise.all([
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community/health/resources?limit=6`),
        fetch(`${process.env.REACT_APP_BACKEND_URL}/api/community/health/providers?limit=6`)
      ]);

      if (resResponse.ok) {
        const data = await resResponse.json();
        setResources(data.resources);
      }

      if (provResponse.ok) {
        const data = await provResponse.json();
        setProviders(data.providers);
      }
    } catch (err) {
      console.error("Failed to fetch health data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CommunityLayout>
        <div className="text-sm text-slate-400">Loading health resources...</div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30">
            <Heart className="text-teal-400" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">
            Health & Insurance Navigator
          </h1>
        </div>
        <p className="text-base text-slate-300 max-w-3xl">
          Find affordable care, understand your insurance, and manage your health with culturally competent resources.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/portal/community/health/providers"
          className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 transition text-left"
        >
          <Search className="text-teal-400" size={20} />
          <div>
            <div className="text-sm font-semibold text-slate-100">Find Providers</div>
            <div className="text-xs text-slate-400">Search by specialty & location</div>
          </div>
        </Link>
        <Link
          to="/portal/community/health/providers?black_owned=true"
          className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 transition text-left"
        >
          <MapPin className="text-teal-400" size={20} />
          <div>
            <div className="text-sm font-semibold text-slate-100">Black-Owned Providers</div>
            <div className="text-xs text-slate-400">Community-centered care</div>
          </div>
        </Link>
        <Link
          to="/portal/community/health/providers?sliding_scale=true"
          className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-teal-500/50 transition text-left"
        >
          <DollarSign className="text-teal-400" size={20} />
          <div>
            <div className="text-sm font-semibold text-slate-100">Affordable Care</div>
            <div className="text-xs text-slate-400">Sliding scale & uninsured</div>
          </div>
        </Link>
      </div>

      {/* Health Resources */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-slate-100 mb-4">Health Resources</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-teal-500/50 transition"
            >
              <div className="text-sm font-semibold text-slate-100 mb-2">
                {resource.title}
              </div>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                {resource.summary || "Click to read more"}
              </p>
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 rounded-md bg-teal-500/10 border border-teal-500/30 text-xs text-teal-300">
                  {resource.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-500">{resource.level}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Healthcare Providers */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-4">Healthcare Providers</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-teal-500/50 transition"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-100">
                    {provider.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {provider.city}, {provider.state}
                  </div>
                </div>
                {provider.is_black_owned && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[0.65rem] font-semibold text-amber-300">
                    Black-Owned
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  {provider.type.replace('_', ' ')}
                </span>
                {provider.telehealth && (
                  <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300">
                    Telehealth
                  </span>
                )}
                <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  {provider.typical_price_range}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CommunityLayout>
  );
}