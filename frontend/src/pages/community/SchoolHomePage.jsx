// pages/community/SchoolHomePage.jsx - Phase 11.6
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { GraduationCap, Book, Users, Video, DollarSign } from "lucide-react";

export default function SchoolHomePage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/school/resources?limit=6`
      );

      if (response.ok) {
        const data = await response.json();
        setResources(data.resources);
      }
    } catch (err) {
      console.error("Failed to fetch school resources:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CommunityLayout>
        <div className="text-sm text-slate-400">Loading school resources...</div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <GraduationCap className="text-blue-400" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">
            Alternative Schooling Hub
          </h1>
        </div>
        <p className="text-base text-slate-300 max-w-3xl">
          Take control of your children's education with curriculums, co-ops, tutors, and homeschooling support.
        </p>
      </div>

      {/* Resource Types */}
      <div className="grid md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Curriculums", icon: Book, type: "curriculum" },
          { label: "Co-ops", icon: Users, type: "co_op" },
          { label: "Tutors", icon: GraduationCap, type: "tutor" },
          { label: "Programs", icon: Video, type: "program" }
        ].map((cat) => {
          const Icon = cat.icon;
          const count = resources.filter(r => r.type === cat.type).length;
          return (
            <button
              key={cat.label}
              className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-blue-500/50 transition text-left"
            >
              <Icon className="text-blue-400" size={16} />
              <div className="text-xs">
                <div className="font-semibold text-slate-100">{cat.label}</div>
                <div className="text-slate-400">{count} resources</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Resources Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-100">Featured Resources</h2>
          <Link
            to="/portal/community/school/submit"
            className="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition"
          >
            Share a Resource
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {resources.map((resource) => (
            <Link
              key={resource.id}
              to={`/portal/community/school/resources/${resource.slug}`}
              className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-blue-500/50 transition block"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="text-sm font-semibold text-slate-100">
                    {resource.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {resource.provider_name}
                  </div>
                </div>
                {resource.is_verified && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[0.65rem] font-semibold text-blue-300">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                {resource.description}
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-2 py-1 rounded-md bg-blue-500/10 border border-blue-500/30 text-blue-300">
                  {resource.type.replace('_', ' ')}
                </span>
                <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  {resource.age_range}
                </span>
                <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  {resource.format}
                </span>
                {resource.cost_range === 'free' && (
                  <span className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30 text-green-300 flex items-center gap-1">
                    <DollarSign size={10} />
                    Free
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </CommunityLayout>
  );
}