// pages/community/SchoolResourceSubmitPage.jsx - Phase 11.6.4
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { GraduationCap, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function SchoolResourceSubmitPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    type: "curriculum",
    subject: "",
    age_range: "K-5",
    format: "online",
    description: "",
    region: "",
    provider_name: "",
    contact_website: "",
    contact_email: "",
    contact_phone: "",
    cost_range: "free",
    is_accredited: false,
    grade_levels: "",
    learning_style: "",
    tags: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        setError("Please log in to submit resources");
        setSubmitting(false);
        return;
      }

      // Parse comma-separated values
      const subjects = formData.subject
        .split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const gradeLevels = formData.grade_levels
        ? formData.grade_levels.split(',').map(g => g.trim()).filter(g => g.length > 0)
        : [];

      const learningStyles = formData.learning_style
        ? formData.learning_style.split(',').map(l => l.trim()).filter(l => l.length > 0)
        : [];

      const tags = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];

      const submissionData = {
        title: formData.title,
        type: formData.type,
        subject: subjects,
        age_range: formData.age_range,
        format: formData.format,
        description: formData.description,
        region: formData.region || null,
        provider_name: formData.provider_name,
        contact_website: formData.contact_website || null,
        contact_email: formData.contact_email || null,
        contact_phone: formData.contact_phone || null,
        cost_range: formData.cost_range,
        is_accredited: formData.is_accredited,
        grade_levels: gradeLevels,
        learning_style: learningStyles,
        tags: tags
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/community/school/resources/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(submissionData)
        }
      );

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/portal/community/school');
        }, 2000);
      } else if (response.status === 401) {
        setError("Please log in to submit resources");
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to submit resource. Please try again.");
      }
    } catch (err) {
      console.error("Resource submission error:", err);
      setError("Failed to submit resource. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <CommunityLayout>
        <div className="max-w-2xl mx-auto">
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-8 text-center">
            <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Resource Submitted Successfully!
            </h2>
            <p className="text-sm text-slate-300 mb-4">
              Thank you for sharing this educational resource. Our team will review it and it will appear in the directory once approved.
            </p>
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

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
              <GraduationCap className="text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Share an Educational Resource
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Help other families find quality learning materials
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h2 className="text-base font-bold text-slate-100 mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Resource Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Black History Curriculum for Middle School"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Provider/Organization Name *
                </label>
                <input
                  type="text"
                  name="provider_name"
                  value={formData.provider_name}
                  onChange={handleChange}
                  required
                  placeholder="Name of the organization or provider"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Resource Type *
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="curriculum">Curriculum</option>
                    <option value="program">Program</option>
                    <option value="tutor">Tutor</option>
                    <option value="co_op">Co-op</option>
                    <option value="tool">Tool/Platform</option>
                    <option value="guide">Guide/Manual</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Age Range *
                  </label>
                  <select
                    name="age_range"
                    value={formData.age_range}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="K-5">K-5 (Elementary)</option>
                    <option value="6-8">6-8 (Middle School)</option>
                    <option value="9-12">9-12 (High School)</option>
                    <option value="All Ages">All Ages</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Format *
                  </label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="online">Online</option>
                    <option value="in_person">In Person</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="self_paced">Self-Paced</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Cost *
                  </label>
                  <select
                    name="cost_range"
                    value={formData.cost_range}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-blue-500"
                  >
                    <option value="free">Free</option>
                    <option value="$">$ (Low Cost)</option>
                    <option value="$$">$$ (Moderate)</option>
                    <option value="$$$">$$$ (Premium)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Subjects (comma-separated) *
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="e.g., math, black history, science, literacy"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="6"
                  placeholder="Describe this resource and what makes it valuable for our community..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Contact & Additional Info */}
          <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-6">
            <h2 className="text-base font-bold text-slate-100 mb-4">Contact Information (Optional)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Website
                </label>
                <input
                  type="url"
                  name="contact_website"
                  value={formData.contact_website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="contact_email"
                    value={formData.contact_email}
                    onChange={handleChange}
                    placeholder="contact@example.com"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="contact_phone"
                    value={formData.contact_phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Region/Location
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="e.g., Southeast, Nationwide, Online Only"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="is_accredited"
                  id="is_accredited"
                  checked={formData.is_accredited}
                  onChange={handleChange}
                  className="rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
                />
                <label htmlFor="is_accredited" className="text-sm text-slate-200">
                  This resource is accredited
                </label>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-rose-500/10 border border-rose-500/30 p-4 flex items-start gap-3">
              <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <Link
              to="/portal/community/school"
              className="px-6 py-3 rounded-lg bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit Resource for Review"}
            </button>
          </div>
        </form>
      </div>
    </CommunityLayout>
  );
}
