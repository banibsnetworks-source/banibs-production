// pages/community/HealthResourceDetailPage.jsx - Phase 11.6.1
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { Heart, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function HealthResourceDetailPage() {
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
        `${process.env.REACT_APP_BACKEND_URL}/api/community/health/resources/${slug}`
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
      console.error("Failed to fetch health resource:", err);
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
              to="/portal/community/health"
              className="inline-flex items-center gap-2 text-sm text-teal-400 hover:text-teal-300 transition"
            >
              <ArrowLeft size={16} />
              Back to Health Resources
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
          to="/portal/community/health"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft size={16} />
          Back to Health Resources
        </Link>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-teal-500/10 border border-teal-500/30">
                <Heart className="text-teal-400" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-100">
                  {resource.title}
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  {resource.summary}
                </p>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-xs font-semibold text-teal-300">
                {resource.category.replace('_', ' ')}
              </span>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                {resource.level}
              </span>
              {resource.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="rounded-2xl bg-slate-900/50 border border-slate-800 p-6">
            <div className="prose prose-invert prose-teal max-w-none">
              <ReactMarkdown>{resource.body_md}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Next Steps */}
          {resource.next_steps && resource.next_steps.length > 0 && (
            <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-5">
              <h3 className="text-sm font-bold text-green-100 mb-3 flex items-center gap-2">
                <CheckCircle size={16} />
                What You Can Do Next
              </h3>
              <ul className="space-y-2">
                {resource.next_steps.map((step, index) => (
                  <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Find Providers */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-3">
              Need Help Finding Care?
            </h3>
            <Link
              to="/portal/community/health/providers"
              className="block w-full px-4 py-2 rounded-lg bg-teal-500 text-white text-sm font-semibold text-center hover:bg-teal-600 transition"
            >
              Browse Healthcare Providers
            </Link>
          </div>

          {/* Metadata */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-5">
            <h3 className="text-sm font-bold text-slate-100 mb-3">
              Resource Info
            </h3>
            <div className="space-y-2 text-xs text-slate-400">
              <div>
                <span className="text-slate-500">Category:</span>{" "}
                <span className="text-slate-300">{resource.category.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-slate-500">Level:</span>{" "}
                <span className="text-slate-300">{resource.level}</span>
              </div>
              {resource.author && (
                <div>
                  <span className="text-slate-500">Author:</span>{" "}
                  <span className="text-slate-300">{resource.author}</span>
                </div>
              )}
              <div>
                <span className="text-slate-500">Views:</span>{" "}
                <span className="text-slate-300">{resource.view_count}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CommunityLayout>
  );
}
