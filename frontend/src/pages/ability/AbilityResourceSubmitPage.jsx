// pages/ability/AbilityResourceSubmitPage.jsx - Phase 11.5.4
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Book, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function AbilityResourceSubmitPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    category: "assistive_tech",
    disability_types: [],
    age_groups: [],
    format: "guide",
    cost_range: "free",
    region: "",
    provider_name: "",
    provider_organization: "",
    contact_website: "",
    contact_email: "",
    contact_phone: "",
    description: "",
    detailed_content: "",
    tags: ""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      const arrayName = name;
      setFormData(prev => ({
        ...prev,
        [arrayName]: checked
          ? [...prev[arrayName], value]
          : prev[arrayName].filter(item => item !== value)
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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

      const tags = formData.tags
        ? formData.tags.split(',').map(t => t.trim()).filter(t => t.length > 0)
        : [];

      const submissionData = {
        ...formData,
        tags,
        disability_types: formData.disability_types,
        age_groups: formData.age_groups
      };

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/resources/submit`,
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
          navigate('/portal/ability');
        }, 3000);
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
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <div className="max-w-2xl mx-auto p-6 pt-20">
          <div className="rounded-xl bg-green-500/10 border border-green-500/30 p-8 text-center">
            <CheckCircle className="mx-auto text-green-400 mb-4" size={64} />
            <h2 className="text-2xl font-bold text-slate-100 mb-2">
              Thank You!
            </h2>
            <p className="text-sm text-slate-300 mb-4">
              Your resource has been submitted and is pending review by the Ability Network team.
              You'll be notified once it's approved.
            </p>
            <Link
              to="/portal/ability"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition"
            >
              <ArrowLeft size={16} />
              Back to Ability Network
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-3xl mx-auto p-6">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/portal/ability"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition"
          >
            <ArrowLeft size={16} />
            Back to Ability Network
          </Link>
        </div>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <Book className="text-purple-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Share a Resource
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Help others by sharing a resource that helped you. Our team will review it before it appears on the site.
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
                  placeholder="e.g., Complete Guide to Assistive Technology"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="assistive_tech">Assistive Technology</option>
                    <option value="legal_rights">Legal Rights</option>
                    <option value="caregiver_support">Caregiver Support</option>
                    <option value="neurodiversity">Neurodiversity</option>
                    <option value="government_programs">Government Programs</option>
                    <option value="accessibility_tools">Accessibility Tools</option>
                    <option value="home_modification">Home Modification</option>
                    <option value="financial_aid">Financial Aid</option>
                    <option value="education">Education</option>
                    <option value="employment">Employment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Format *
                  </label>
                  <select
                    name="format"
                    value={formData.format}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="guide">Guide</option>
                    <option value="tool">Tool</option>
                    <option value="service">Service</option>
                    <option value="program">Program</option>
                    <option value="directory">Directory</option>
                    <option value="support_group">Support Group</option>
                    <option value="legal_doc">Legal Document</option>
                    <option value="training">Training</option>
                  </select>
                </div>
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
                  placeholder="Name of organization or provider"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
                  rows="4"
                  placeholder="Brief description of this resource and how it helps..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h2 className="text-base font-bold text-slate-100 mb-4">Contact Information (Optional)</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Website URL
                </label>
                <input
                  type="url"
                  name="contact_website"
                  value={formData.contact_website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
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
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Region
                </label>
                <input
                  type="text"
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  placeholder="e.g., National, Southeast, California"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
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
              to="/portal/ability"
              className="px-6 py-3 rounded-lg bg-slate-800 text-slate-200 font-semibold hover:bg-slate-700 transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 rounded-lg bg-purple-500 text-white font-semibold hover:bg-purple-600 transition disabled:opacity-50"
            >
              {submitting ? "Submitting..." : "Submit for Review"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
