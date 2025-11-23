// pages/community/HealthProviderDetailPage.jsx - Phase 11.6.1
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { 
  Heart, 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Globe, 
  Mail,
  Clock,
  Video,
  DollarSign,
  Accessibility,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function HealthProviderDetailPage() {
  const { providerId } = useParams();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProvider();
  }, [providerId]);

  const fetchProvider = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/health/providers/${providerId}`
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

  if (loading) {
    return (
      <CommunityLayout>
        <div className="text-sm text-slate-400">Loading provider...</div>
      </CommunityLayout>
    );
  }

  if (error || !provider) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-6 text-center">
            <AlertCircle className="mx-auto text-rose-400 mb-3" size={48} />
            <h2 className="text-lg font-bold text-slate-100 mb-2">{error}</h2>
            <Link
              to="/portal/community/health/providers"
              className="inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition"
            >
              <ArrowLeft size={16} />
              Back to Provider Directory
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
          to="/portal/community/health/providers"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft size={16} />
          Back to Provider Directory
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-teal-500/10 border border-teal-500/30">
                  <Heart className="text-teal-400" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">
                    {provider.name}
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    {provider.type.replace('_', ' ')}
                  </p>
                </div>
              </div>
              {provider.is_black_owned && (
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-sm font-semibold text-amber-300">
                  Black-Owned
                </span>
              )}
            </div>

            {/* Services */}
            {provider.service_types && provider.service_types.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-slate-400 mb-2">Services Offered:</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.service_types.map((service) => (
                    <span
                      key={service}
                      className="px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/30 text-sm text-teal-300"
                    >
                      {service.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Features */}
            <div className="flex flex-wrap gap-3 text-sm">
              {provider.telehealth && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Video size={16} />
                  <span>Telehealth Available</span>
                </div>
              )}
              {provider.sliding_scale && (
                <div className="flex items-center gap-2 text-green-400">
                  <DollarSign size={16} />
                  <span>Sliding Scale</span>
                </div>
              )}
              {provider.accepts_uninsured && (
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle size={16} />
                  <span>Accepts Uninsured</span>
                </div>
              )}
              {provider.ability_friendly && (
                <div className="flex items-center gap-2 text-purple-400">
                  <Accessibility size={16} />
                  <span>Accessible</span>
                </div>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h2 className="text-base font-bold text-slate-100 mb-3">Location</h2>
            <div className="space-y-2 text-sm text-slate-300">
              {provider.address && (
                <div className="flex items-start gap-2">
                  <MapPin className="text-teal-400 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <div>{provider.address}</div>
                    <div>
                      {provider.city}, {provider.state} {provider.zip_code}
                    </div>
                  </div>
                </div>
              )}
              {provider.hours && (
                <div className="flex items-start gap-2">
                  <Clock className="text-teal-400 flex-shrink-0 mt-0.5" size={16} />
                  <div>{provider.hours}</div>
                </div>
              )}
            </div>
          </div>

          {/* Insurance & Payment */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h2 className="text-base font-bold text-slate-100 mb-3">Insurance & Payment</h2>
            <div className="space-y-3">
              <div>
                <span className="text-xs font-semibold text-slate-400">Typical Cost Range:</span>
                <div className="text-sm text-slate-100 mt-1">{provider.typical_price_range}</div>
              </div>
              {provider.insurances_accepted && provider.insurances_accepted.length > 0 && (
                <div>
                  <span className="text-xs font-semibold text-slate-400">Insurances Accepted:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {provider.insurances_accepted.map((insurance) => (
                      <span
                        key={insurance}
                        className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300"
                      >
                        {insurance}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {provider.insurance_notes && (
                <div className="mt-2 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30">
                  <p className="text-xs text-blue-200">{provider.insurance_notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Accessibility */}
          {provider.ability_friendly && provider.ability_notes && (
            <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-5">
              <h2 className="text-base font-bold text-slate-100 mb-2 flex items-center gap-2">
                <Accessibility size={18} />
                Accessibility
              </h2>
              <p className="text-sm text-slate-300">{provider.ability_notes}</p>
            </div>
          )}

          {/* Cultural Competence */}
          {provider.cultural_competence_notes && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-5">
              <h2 className="text-base font-bold text-slate-100 mb-2">Cultural Competence</h2>
              <p className="text-sm text-slate-300">{provider.cultural_competence_notes}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Information */}
          <div className="rounded-xl bg-teal-500/10 border border-teal-500/30 p-5">
            <h3 className="text-sm font-bold text-teal-100 mb-4">Contact Information</h3>
            <div className="space-y-3">
              {provider.contact_phone && (
                <a
                  href={`tel:${provider.contact_phone}`}
                  className="flex items-center gap-3 text-sm text-slate-100 hover:text-teal-300 transition"
                >
                  <Phone className="text-teal-400" size={16} />
                  <span>{provider.contact_phone}</span>
                </a>
              )}
              {provider.contact_email && (
                <a
                  href={`mailto:${provider.contact_email}`}
                  className="flex items-center gap-3 text-sm text-slate-100 hover:text-teal-300 transition"
                >
                  <Mail className="text-teal-400" size={16} />
                  <span className="truncate">{provider.contact_email}</span>
                </a>
              )}
              {provider.contact_website && (
                <a
                  href={provider.contact_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-slate-100 hover:text-teal-300 transition"
                >
                  <Globe className="text-teal-400" size={16} />
                  <span className="truncate">Visit Website</span>
                </a>
              )}
            </div>
          </div>

          {/* Additional Info */}
          {provider.languages && provider.languages.length > 0 && (
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Languages Spoken</h3>
              <div className="flex flex-wrap gap-2">
                {provider.languages.map((lang) => (
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

          {/* Specialties */}
          {provider.specialties && provider.specialties.length > 0 && (
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Specialties</h3>
              <ul className="space-y-1">
                {provider.specialties.map((specialty) => (
                  <li key={specialty} className="text-xs text-slate-300 flex items-center gap-2">
                    <span className="text-teal-400">•</span>
                    {specialty.replace('_', ' ')}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </CommunityLayout>
  );
}
