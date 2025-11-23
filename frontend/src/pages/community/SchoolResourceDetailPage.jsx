// pages/community/SchoolResourceDetailPage.jsx - Phase 11.6.4
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { 
  GraduationCap, 
  ArrowLeft, 
  Book, 
  Users,
  Globe,
  Mail,
  Phone,
  AlertCircle,
  CheckCircle,
  DollarSign
} from "lucide-react";

export default function SchoolResourceDetailPage() {
  const { slug } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchResource();
  }, [slug]);

  const fetchResource = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/school/resources/${slug}`
      );

      if (response.ok) {
        const data = await response.json();
        setResource(data);
      } else if (response.status === 404) {
        setError("Resource not found");
      } else {
        setError("Failed to load resource");
      }
    } catch (err) {
      console.error("Failed to fetch resource:", err);
      setError("Failed to load resource");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <CommunityLayout>
        <div className="text-sm text-slate-400">Loading resource...</div>
      </CommunityLayout>
    );
  }

  if (error || !resource) {
    return (
      <CommunityLayout>
        <div className="max-w-4xl mx-auto">
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-6 text-center">
            <AlertCircle className="mx-auto text-rose-400 mb-3" size={48} />
            <h2 className="text-lg font-bold text-slate-100 mb-2">{error}</h2>
            <Link
              to="/portal/community/school"
              className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition"
            >
              <ArrowLeft size={16} />
              Back to Resources
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
          to="/portal/community/school"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft size={16} />
          Back to Resources
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30">
                  <GraduationCap className="text-blue-400" size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-slate-100">
                    {resource.title}
                  </h1>
                  <p className="text-sm text-slate-400 mt-1">
                    {resource.provider_name}
                  </p>
                </div>
              </div>
              {resource.is_verified && (
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-sm font-semibold text-blue-300">
                  Verified
                </span>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-xs font-semibold text-blue-300">
                {resource.type.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                {resource.age_range}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                {resource.format}
              </span>
              {resource.cost_range === 'free' && (
                <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-xs font-semibold text-green-300">
                  FREE
                </span>
              )}
              {resource.is_accredited && (
                <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
                  Accredited
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h2 className="text-base font-bold text-slate-100 mb-3">About This Resource</h2>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {resource.description}
            </p>
          </div>

          {/* Subjects */}
          {resource.subject && resource.subject.length > 0 && (
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-5">
              <h2 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
                <Book size={18} />
                Subjects Covered
              </h2>
              <div className="flex flex-wrap gap-2">
                {resource.subject.map((sub) => (
                  <span
                    key={sub}
                    className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-500/30 text-sm text-blue-200"
                  >
                    {sub.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Learning Styles */}
          {resource.learning_style && resource.learning_style.length > 0 && (
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-3">Learning Styles</h3>
              <div className="flex flex-wrap gap-2">
                {resource.learning_style.map((style) => (
                  <span
                    key={style}
                    className="px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs text-slate-300"
                  >
                    {style.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Submitted By */}
          {resource.is_user_submitted && resource.submitted_by_name && (
            <div className="rounded-xl bg-purple-500/10 border border-purple-500/30 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-2">Community Submitted</h3>
              <p className="text-sm text-slate-300">Shared by: {resource.submitted_by_name}</p>
              <p className="text-xs text-slate-400 mt-2">
                Thank you for contributing to our educational resources!
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Contact Information */}
          {(resource.contact_website || resource.contact_email || resource.contact_phone) && (
            <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-5">
              <h3 className="text-sm font-bold text-blue-100 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {resource.contact_website && (
                  <a
                    href={resource.contact_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-100 hover:text-blue-300 transition"
                  >
                    <Globe className="text-blue-400" size={16} />
                    <span className="truncate">Visit Website</span>
                  </a>
                )}
                {resource.contact_email && (
                  <a
                    href={`mailto:${resource.contact_email}`}
                    className="flex items-center gap-3 text-sm text-slate-100 hover:text-blue-300 transition"
                  >
                    <Mail className="text-blue-400" size={16} />
                    <span className="truncate">{resource.contact_email}</span>
                  </a>
                )}
                {resource.contact_phone && (
                  <a
                    href={`tel:${resource.contact_phone}`}
                    className="flex items-center gap-3 text-sm text-slate-100 hover:text-blue-300 transition"
                  >
                    <Phone className="text-blue-400" size={16} />
                    <span>{resource.contact_phone}</span>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Cost Info */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-3">Pricing</h3>
            <div className="flex items-center gap-2 text-sm text-slate-100">
              <DollarSign className="text-blue-400" size={16} />
              <span className="capitalize">{resource.cost_range.replace('$', ' ')}</span>
            </div>
          </div>

          {/* Region */}
          {resource.region && (
            <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
              <h3 className="text-sm font-bold text-slate-100 mb-2">Region</h3>
              <p className="text-sm text-slate-300">{resource.region}</p>
            </div>
          )}

          {/* Share Your Resource CTA */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-3">
              Know a Great Resource?
            </h3>
            <Link
              to="/portal/community/school/submit"
              className="block w-full px-4 py-2 rounded-lg bg-blue-500 text-white text-sm font-semibold text-center hover:bg-blue-600 transition"
            >
              Share a Resource
            </Link>
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
}
