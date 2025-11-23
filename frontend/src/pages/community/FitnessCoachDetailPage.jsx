// pages/community/FitnessCoachDetailPage.jsx - Phase 11.6.2
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { 
  Dumbbell, 
  ArrowLeft, 
  MapPin, 
  Award,
  Star,
  Globe,
  Mail,
  Video,
  AlertCircle
} from "lucide-react";

export default function FitnessCoachDetailPage() {
  const { coachId } = useParams();
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCoach();
  }, [coachId]);

  const fetchCoach = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/fitness/coaches/${coachId}`
      );

      if (response.ok) {
        const data = await response.json();
        setCoach(data);
      } else if (response.status === 404) {
        setError("Coach not found");
      } else {
        setError("Failed to load coach profile");
      }
    } catch (err) {
      console.error("Failed to fetch coach:", err);
      setError("Failed to load coach profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CommunityLayout>
        <div className="text-sm text-slate-400">Loading coach profile...</div>
      </CommunityLayout>
    );
  }

  if (error || !coach) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-6 text-center">
            <AlertCircle className="mx-auto text-rose-400 mb-3" size={48} />
            <h2 className="text-lg font-bold text-slate-100 mb-2">{error}</h2>
            <Link
              to="/portal/community/fitness/coaches"
              className="inline-flex items-center gap-2 text-sm text-green-400 hover:text-green-300 transition"
            >
              <ArrowLeft size={16} />
              Back to Coaches
            </Link>
          </div>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/portal/community/fitness/coaches"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft size={16} />
          Back to Coaches
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/30">
                  <Dumbbell className="text-green-400" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">
                    {coach.name}
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    {coach.role === 'trainer' ? 'Certified Trainer' : 'Fitness Coach'}
                  </p>
                </div>
              </div>
              {coach.is_verified && (
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm font-semibold text-blue-300">
                  Verified
                </span>
              )}
            </div>

            {/* Rating */}
            {coach.rating && (
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Star className="text-yellow-400" size={18} fill="currentColor" />
                  <span className="text-lg font-bold text-slate-100">{coach.rating.toFixed(1)}</span>
                  <span className="text-xs text-slate-400">({coach.total_reviews} reviews)</span>
                </div>
                {coach.online_only && (
                  <div className="flex items-center gap-2 text-sm text-blue-400">
                    <Video size={16} />
                    <span>Online Training</span>
                  </div>
                )}
              </div>
            )}

            {/* Bio */}
            <p className="text-sm text-slate-300 leading-relaxed">
              {coach.bio}
            </p>
          </div>

          {/* Location */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h2 className="text-base font-bold text-slate-100 mb-3">Location</h2>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MapPin className="text-green-400" size={16} />
              <span>
                {coach.city}, {coach.state} • {coach.region}
              </span>
            </div>
            {coach.online_only && (
              <p className="text-xs text-slate-400 mt-2">
                Available for online training nationwide
              </p>
            )}
          </div>

          {/* Specializations */}
          {coach.specializations && coach.specializations.length > 0 && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-5">
              <h2 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Award size={18} />
                Specializations
              </h2>
              <div className="flex flex-wrap gap-2">
                {coach.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-1 rounded-lg bg-green-500/20 border border-green-500/30 text-sm text-green-200"
                  >
                    {spec.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {coach.languages && coach.languages.length > 0 && (
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Languages</h3>
              <div className="flex flex-wrap gap-2">
                {coach.languages.map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Card */}
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-5">
            <h3 className="text-sm font-bold text-green-100 mb-4">Get In Touch</h3>
            <div className="space-y-3">
              {coach.website && (
                <a
                  href={coach.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-100 hover:text-green-300 transition"
                >
                  <Globe className="text-green-400" size={16} />
                  <span className="truncate">Visit Website</span>
                </a>
              )}
              {coach.phone && (
                <a
                  href={`tel:${coach.phone}`}
                  className="flex items-center gap-3 text-sm text-slate-100 hover:text-green-300 transition"
                >
                  <span>{coach.phone}</span>
                </a>
              )}
              <p className="text-xs text-slate-400 pt-2 border-t border-green-500/30">
                Contact this coach to discuss your fitness goals and training options
              </p>
            </div>
          </div>

          {/* Programs Link */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-3">Browse Programs</h3>
            <Link
              to="/portal/community/fitness"
              className="block w-full px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold text-center hover:bg-green-600 transition"
            >
              View All Programs
            </Link>
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
}
