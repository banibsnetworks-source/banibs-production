// pages/ability/AbilityProviderSubmitPage.jsx - Phase 11.5.4
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";

export default function AbilityProviderSubmitPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    provider_type: "therapist",
    bio: "",
    organization: "",
    region: "",
    city: "",
    state: "",
    telehealth_available: false,
    in_person_available: true,
    contact_website: "",
    contact_email: "",
    contact_phone: "",
    cost_range: "$$",
    accepts_insurance: false,
    is_black_owned: false
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
        setError("Please log in to submit providers");
        setSubmitting(false);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/ability/providers/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/portal/ability/providers');
        }, 3000);
      } else if (response.status === 401) {
        setError("Please log in to submit providers");
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to submit provider. Please try again.");
      }
    } catch (err) {
      console.error("Provider submission error:", err);
      setError("Failed to submit provider. Please try again.");
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
              Your provider submission is pending review. We do not guarantee inclusion; all submissions are reviewed for safety and accuracy.
            </p>
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
      <div className="max-w-3xl mx-auto p-6">
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

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
              <Users className="text-purple-400" size={24} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">
                Submit a Provider
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                Recommend a provider that helped you. All submissions are reviewed for safety and accuracy.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
            <h2 className="text-base font-bold text-slate-100 mb-4">Provider Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Provider Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Dr. Jane Smith or ABC Therapy Center"
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Provider Type *
                  </label>
                  <select
                    name="provider_type"
                    value={formData.provider_type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="therapist">Therapist</option>
                    <option value="specialist">Specialist</option>
                    <option value="advocate">Advocate</option>
                    <option value="case_manager">Case Manager</option>
                    <option value="home_care">Home Care</option>
                    <option value="accessibility_consultant">Accessibility Consultant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Cost Range *
                  </label>
                  <select
                    name="cost_range"
                    value={formData.cost_range}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="$">$ (Low Cost)</option>
                    <option value="$$">$$ (Moderate)</option>
                    <option value="$$$">$$$ (Premium)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-200 mb-2">
                  Description *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  required
                  rows="5"
                  placeholder="Describe their services, specializations, and what makes them a good fit for the community..."
                  className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    Region *
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    required
                    placeholder="e.g., Southeast"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Atlanta"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-200 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="GA"
                    maxLength="2"
                    className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="telehealth_available"
                    checked={formData.telehealth_available}
                    onChange={handleChange}
                    className="rounded border-slate-700 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-200">Telehealth Available</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="accepts_insurance"
                    checked={formData.accepts_insurance}
                    onChange={handleChange}
                    className="rounded border-slate-700 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-200">Accepts Insurance</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_black_owned"
                    checked={formData.is_black_owned}
                    onChange={handleChange}
                    className="rounded border-slate-700 bg-slate-800 text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-sm text-slate-200">Black-Owned</span>
                </label>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="rounded-xl bg-slate-900/50 border border-slate-800 p-6">
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
              to="/portal/ability/providers"
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
