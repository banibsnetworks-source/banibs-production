// pages/ability/AbilityHomePage.jsx - Phase 11.5.1
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Book, Scale, Users, Home, DollarSign, GraduationCap } from "lucide-react";

export default function AbilityHomePage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/resources?limit=6`
      );

      if (response.ok) {
        const data = await response.json();
        setResources(data.resources);
      }
    } catch (err) {
      console.error("Failed to fetch ability resources:", err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    { label: "Assistive Technology", icon: Heart, color: "purple", category: "assistive_tech" },
    { label: "Legal Rights", icon: Scale, color: "purple", category: "legal_rights" },
    { label: "Caregiver Support", icon: Users, color: "purple", category: "caregiver_support" },
    { label: "Neurodiversity", icon: GraduationCap, color: "purple", category: "neurodiversity" },
    { label: "Government Programs", icon: DollarSign, color: "purple", category: "government_programs" },
    { label: "Home Modifications", icon: Home, color: "purple", category: "home_modification" }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="text-sm text-slate-400">Loading resources...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Hero */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30">
              <Heart className="text-purple-400" size={32} />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-100">
                Ability Network
              </h1>
              <p className="text-base text-slate-300 mt-2">
                Resources and support for individuals with disabilities, neurodivergent community members, and caregivers
              </p>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const count = resources.filter(r => r.category === cat.category).length;
            return (
              <button
                key={cat.label}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition text-center"
              >
                <div className={`p-2 rounded-lg bg-${cat.color}-500/10 border border-${cat.color}-500/30`}>
                  <Icon className={`text-${cat.color}-400`} size={20} />
                </div>
                <div className="text-xs font-semibold text-slate-100">{cat.label}</div>
                <div className="text-xs text-slate-400">{count} resources</div>
              </button>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mb-10 grid md:grid-cols-3 gap-4">
          <Link
            to="/portal/ability/providers"
            className="flex items-center gap-4 p-5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-500 transition"
          >
            <Users className="text-purple-400" size={32} />
            <div>
              <h3 className="text-base font-bold text-slate-100">Find a Provider</h3>
              <p className="text-sm text-slate-400">Connect with specialists and therapists</p>
            </div>
          </Link>
          <Link
            to="/portal/ability/support-groups"
            className="flex items-center gap-4 p-5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-500 transition"
          >
            <Users className="text-purple-400" size={32} />
            <div>
              <h3 className="text-base font-bold text-slate-100">Support Groups</h3>
              <p className="text-sm text-slate-400">You don't have to do this alone</p>
            </div>
          </Link>
          <Link
            to="/portal/ability/submit"
            className="flex items-center gap-4 p-5 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition"
          >
            <Heart className="text-purple-400" size={32} />
            <div>
              <h3 className="text-base font-bold text-slate-100">Share a Resource</h3>
              <p className="text-sm text-slate-400">Help others by contributing</p>
            </div>
          </Link>
        </div>

        {/* Featured Resources */}
        <div>
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Featured Resources</h2>

          <div className="grid md:grid-cols-2 gap-5">
            {resources.map((resource) => (
              <Link
                key={resource.id}
                to={`/portal/ability/resources/${resource.slug}`}
                className="rounded-xl bg-slate-900/50 border border-slate-800 p-6 hover:border-purple-500/50 transition block"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-slate-100 mb-1">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-slate-400">{resource.provider_name}</p>
                  </div>
                  {resource.is_verified && (
                    <span className="px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
                      Verified
                    </span>
                  )}
                </div>

                <p className="text-sm text-slate-300 mb-4 line-clamp-2">
                  {resource.description}
                </p>

                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300">
                    {resource.category.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                    {resource.format}
                  </span>
                  {resource.cost_range === 'free' && (
                    <span className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30 text-green-300">
                      FREE
                    </span>
                  )}
                  {resource.is_government_program && (
                    <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300">
                      Gov Program
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
