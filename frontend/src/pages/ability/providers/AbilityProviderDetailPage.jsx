// pages/ability/providers/AbilityProviderDetailPage.jsx - Phase 11.5.2
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Heart, 
  ArrowLeft, 
  MapPin, 
  Globe, 
  Phone, 
  Mail, 
  CheckCircle, 
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  ThumbsUp
} from "lucide-react";

export default function AbilityProviderDetailPage() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [helpful, setHelpful] = useState(false);

  useEffect(() => {
    fetchProvider();
  }, [providerId]);

  const fetchProvider = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/providers/${providerId}`
      );

      if (response.ok) {
        const data = await response.json();
        setProvider(data);
      } else if (response.status === 404) {
        setError("Provider not found");
      } else {
        setError("Failed to load provider");
      }
    } catch (err) {
      console.error("Failed to fetch provider:", err);
      setError("Failed to load provider");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkHelpful = async () => {
    // Placeholder for helpful action
    setHelpful(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
        <div className="text-sm text-slate-400">Loading provider...</div>
      </div>
    );
  }

  if (error || !provider) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-4xl mx-auto p-6">
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-6 text-center">
            <AlertCircle className="mx-auto text-rose-400 mb-3" size={48} />
            <h2 className="text-lg font-bold text-slate-100 mb-2">{error}</h2>
            <Link
              to="/portal/ability/providers"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition"
            >
              <ArrowLeft size={16} />
              Back to Providers
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/portal/ability/providers"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft size={16} />
            Back to Providers
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header */}
            <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                    <Users className="text-purple-400" size={32} />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-slate-100">
                      {provider.name}
                    </h1>
                    <p className="text-base text-slate-400 mt-1 capitalize">
                      {provider.provider_type.replace('_', ' ')}
                    </p>
                    {provider.organization && (
                      <p className="text-sm text-slate-500 mt-1">
                        {provider.organization}
                      </p>
                    )}
                  </div>
                </div>
                {provider.is_verified && (
                  <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-purple-500/10 border border-purple-500/30">
                    <CheckCircle size={16} className="text-purple-300" />
                    <span className="text-sm font-semibold text-purple-300">Verified</span>
                  </div>
                )}
              </div>

              {/* Rating */}
              {provider.rating && (
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="text-lg font-bold text-slate-100">{provider.rating}</span>
                  </div>
                  <span className="text-sm text-slate-400">({provider.total_reviews} reviews)</span>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap gap-2">
                {provider.telehealth_available && (
                  <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-300">
                    Telehealth
                  </span>
                )}
                {provider.in_person_available && (
                  <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-xs font-semibold text-green-300">
                    In-Person
                  </span>
                )}
                {provider.accepts_insurance && (
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300">
                    Accepts Insurance
                  </span>
                )}
                {provider.is_black_owned && (
                  <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200">
                    Black-Owned
                  </span>
                )}
              </div>
            </div>

            {/* About */}
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">About</h2>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {provider.bio}
              </p>
            </div>

            {/* Specializations */}
            <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-6">
              <h2 className="text-lg font-bold text-slate-100 mb-4">Specializations</h2>
              <div className="flex flex-wrap gap-2">
                {provider.specializations.map((spec) => (
                  <span
                    key={spec}
                    className="px-3 py-2 rounded-lg bg-purple-500/20 border border-purple-500/40 text-sm text-purple-200"
                  >
                    {spec.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>

            {/* Credentials */}
            {provider.credentials && provider.credentials.length > 0 && (
              <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
                <h2 className="text-lg font-bold text-slate-100 mb-4">Credentials & Certifications</h2>
                <ul className="space-y-2">
                  {provider.credentials.map((cred, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
                      <CheckCircle size={16} className="text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>{cred}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Languages */}
            {provider.languages && provider.languages.length > 0 && (
              <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
                <h3 className="text-base font-bold text-slate-100 mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.languages.map((lang) => (
                    <span
                      key={lang}
                      className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-sm text-slate-300"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Contact Info */}
            <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-5">
              <h3 className="text-sm font-bold text-purple-100 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {provider.contact_website && (
                  <a
                    href={provider.contact_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-100 hover:text-purple-300 transition"
                  >
                    <Globe className="text-purple-400" size={16} />
                    <span className="truncate">Visit Website</span>
                  </a>
                )}
                {provider.contact_email && (
                  <a
                    href={`mailto:${provider.contact_email}`}
                    className="flex items-center gap-3 text-sm text-slate-100 hover:text-purple-300 transition"
                  >
                    <Mail className="text-purple-400" size={16} />
                    <span className="truncate">{provider.contact_email}</span>
                  </a>
                )}
                {provider.contact_phone && (
                  <a
                    href={`tel:${provider.contact_phone}`}
                    className="flex items-center gap-3 text-sm text-slate-100 hover:text-purple-300 transition"
                  >
                    <Phone className="text-purple-400" size={16} />
                    <span>{provider.contact_phone}</span>
                  </a>
                )}
              </div>
            </div>

            {/* Location */}
            {(provider.city || provider.state || provider.region) && (
              <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
                <h3 className="text-sm font-bold text-slate-100 mb-3">Location</h3>
                <div className="flex items-start gap-2 text-sm text-slate-300">
                  <MapPin className="text-purple-400 flex-shrink-0" size={16} />
                  <div>
                    {provider.city && provider.state && (
                      <div>{provider.city}, {provider.state}</div>
                    )}
                    {provider.region && (
                      <div className="text-slate-400">{provider.region}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Availability */}
            {provider.availability && (
              <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
                <h3 className="text-sm font-bold text-slate-100 mb-3">Availability</h3>
                <div className="flex items-start gap-2 text-sm text-slate-300">
                  <Clock className="text-purple-400 flex-shrink-0" size={16} />
                  <span>{provider.availability}</span>
                </div>
              </div>
            )}

            {/* Cost */}
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Cost Range</h3>
              <div className="flex items-center gap-2 text-sm text-slate-100">
                <DollarSign className="text-purple-400" size={16} />
                <span className="capitalize">{provider.cost_range.replace('$', ' ')}</span>
              </div>
              {provider.accepts_insurance && provider.insurance_accepted && provider.insurance_accepted.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-700">
                  <p className="text-xs font-semibold text-slate-300 mb-2">Accepts:</p>
                  <div className="flex flex-wrap gap-1">
                    {provider.insurance_accepted.map((ins) => (
                      <span
                        key={ins}
                        className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300"
                      >
                        {ins}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Helpful Button */}
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Was this helpful?</h3>
              <button
                onClick={handleMarkHelpful}
                disabled={helpful}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ThumbsUp size={16} />
                {helpful ? "Thank you!" : "Mark as Helpful"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
