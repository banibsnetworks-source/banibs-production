// pages/community/CommunityHomePage.jsx - Phase 11.6
import React from "react";
import { Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { Heart, Dumbbell, ChefHat, GraduationCap, ArrowRight, Sparkles } from "lucide-react";

export default function CommunityHomePage() {
  const pillars = [
    {
      title: "Health & Insurance",
      icon: Heart,
      color: "teal",
      gradient: "from-teal-500/10 to-teal-600/5",
      border: "border-teal-500/30",
      iconColor: "text-teal-400",
      description: "Find affordable care, understand your insurance, and manage chronic conditions with culturally competent resources.",
      link: "/portal/community/health",
      features: ["Insurance Navigator", "Doctor Finder", "Health Resources", "Cost Assistance"]
    },
    {
      title: "Fitness & Movement",
      icon: Dumbbell,
      color: "green",
      gradient: "from-green-500/10 to-green-600/5",
      border: "border-green-500/30",
      iconColor: "text-green-400",
      description: "Safe, accessible fitness programs for all bodies and abilities. From chair yoga to strength training.",
      link: "/portal/community/fitness",
      features: ["Beginner Programs", "Senior Fitness", "Chronic-Friendly", "Virtual Classes"]
    },
    {
      title: "Food & Culture",
      icon: ChefHat,
      color: "amber",
      gradient: "from-amber-500/10 to-amber-600/5",
      border: "border-amber-500/30",
      iconColor: "text-amber-400",
      description: "Preserve our culinary heritage while adapting recipes for health. Traditional and healthier versions side-by-side.",
      link: "/portal/community/food",
      features: ["Soul Food Archive", "Healthier Versions", "Regional Recipes", "Cooking Tips"]
    },
    {
      title: "Alternative Schooling",
      icon: GraduationCap,
      color: "blue",
      gradient: "from-blue-500/10 to-blue-600/5",
      border: "border-blue-500/30",
      iconColor: "text-blue-400",
      description: "Take control of your children's education. Find curriculums, co-ops, tutors, and support for homeschooling families.",
      link: "/portal/community/school",
      features: ["Black History Curriculum", "Homeschool Co-ops", "Tutors", "Learning Tracks"]
    }
  ];

  return (
    <CommunityLayout>
      {/* Hero Section */}
      <div className="mb-8">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-4">
            <Sparkles className="text-indigo-400" size={16} />
            <span className="text-sm font-semibold text-indigo-300">
              Live Better. Together. On Purpose.
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-100 mb-4">
            Community Life Hub
          </h1>
          
          <p className="text-base text-slate-300 leading-relaxed">
            Your comprehensive resource for health, fitness, cultural food traditions, and alternative education—all designed for Black families, by Black families.
          </p>
        </div>
      </div>

      {/* Pillars Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          
          return (
            <Link
              key={pillar.title}
              to={pillar.link}
              className="group relative rounded-2xl bg-gradient-to-br overflow-hidden transition-all hover:scale-[1.02] hover:shadow-2xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${pillar.gradient}`} />
              <div className={`relative border ${pillar.border} rounded-2xl p-6 backdrop-blur-sm`}>
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-slate-900/50 border ${pillar.border} mb-4`}>
                  <Icon className={pillar.iconColor} size={24} />
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-slate-100 mb-2 flex items-center justify-between">
                  {pillar.title}
                  <ArrowRight className="text-slate-500 group-hover:text-slate-300 transition group-hover:translate-x-1" size={20} />
                </h2>

                {/* Description */}
                <p className="text-sm text-slate-300 mb-4 leading-relaxed">
                  {pillar.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {pillar.features.map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 rounded-md bg-slate-800/50 border border-slate-700 text-xs text-slate-300"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30">
              <Sparkles className="text-indigo-400" size={20} />
            </div>
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100 mb-2">
              Built for Our Community
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-3">
              Every resource, program, and recipe in the Community Life Hub is either created by or curated for Black families. We understand the unique health challenges, cultural significance of our food, and educational needs of our children.
            </p>
            <div className="flex flex-wrap gap-2 text-xs text-slate-400">
              <span>• Culturally competent providers</span>
              <span>• Traditional + healthier recipe versions</span>
              <span>• Black history-centered education</span>
              <span>• Accessible fitness for all abilities</span>
            </div>
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
}
