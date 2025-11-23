// pages/community/FitnessHomePage.jsx - Phase 11.6
import React, { useEffect, useState } from "react";
import CommunityLayout from "../../components/community/CommunityLayout";
import { Dumbbell, Play, Users, Heart } from "lucide-react";

export default function FitnessHomePage() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/fitness/programs?limit=6`
      );

      if (response.ok) {
        const data = await response.json();
        setPrograms(data.programs);
      }
    } catch (err) {
      console.error("Failed to fetch fitness programs:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CommunityLayout>
        <div className="text-sm text-slate-400">Loading fitness programs...</div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      {/* Hero */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-green-500/10 border border-green-500/30">
            <Dumbbell className="text-green-400" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-slate-100">
            Fitness & Wellness Network
          </h1>
        </div>
        <p className="text-base text-slate-300 max-w-3xl">
          Safe, accessible fitness for all bodies and abilities. From walking programs to strength training.
        </p>
      </div>

      {/* Categories */}
      <div className="grid md:grid-cols-4 gap-3 mb-8">
        {[
          { label: "Beginner", icon: Play, count: programs.filter(p => p.level === 'beginner').length },
          { label: "Senior Friendly", icon: Heart, count: programs.filter(p => p.level === 'senior').length },
          { label: "Group Classes", icon: Users, count: programs.filter(p => p.delivery === 'live_online').length },
          { label: "Self-Paced", icon: Play, count: programs.filter(p => p.delivery === 'self_paced').length }
        ].map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.label}
              className="flex items-center gap-2 p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-green-500/50 transition text-left"
            >
              <Icon className="text-green-400" size={16} />
              <div className="text-xs">
                <div className="font-semibold text-slate-100">{cat.label}</div>
                <div className="text-slate-400">{cat.count} programs</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Programs Grid */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 mb-4">Featured Programs</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {programs.map((program) => (
            <div
              key={program.id}
              className="rounded-xl bg-slate-900/50 border border-slate-800 p-5 hover:border-green-500/50 transition"
            >
              <div className="text-sm font-semibold text-slate-100 mb-2">
                {program.title}
              </div>
              <p className="text-xs text-slate-400 mb-3 line-clamp-2">
                {program.description}
              </p>
              <div className="flex flex-wrap gap-2 text-xs mb-3">
                <span className="px-2 py-1 rounded-md bg-green-500/10 border border-green-500/30 text-green-300">
                  {program.level}
                </span>
                <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  {program.intensity} intensity
                </span>
                {program.duration_weeks && (
                  <span className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                    {program.duration_weeks} weeks
                  </span>
                )}
              </div>
              {program.chronic_friendly.length > 0 && (
                <div className="text-[0.65rem] text-slate-500">
                  ✓ {program.chronic_friendly.join(', ')}-friendly
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </CommunityLayout>
  );
}