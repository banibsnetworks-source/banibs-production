// pages/community/BecomeTutorPage.jsx - Tutor Intake Form
import React, { useState } from "react";
import { Link } from "react-router-dom";
import CommunityLayout from "../../components/community/CommunityLayout";
import { 
  GraduationCap, ArrowLeft, User, Mail, Phone, MapPin, 
  BookOpen, Users, FileText, Globe, Clock, CheckCircle2, AlertCircle
} from "lucide-react";

/**
 * Become a Tutor - Intake Form (Phase-0.5)
 * 
 * Capture-only form for educators to apply to be listed.
 * NO automation beyond capture + admin review.
 */

export default function BecomeTutorPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    subject_focus: "",
    age_grade_range: "",
    bio: "",
    website: "",
    availability: "",
    consent_acknowledged: false
  });
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim() || formData.name.length < 2) {
      errors.name = "Full name is required (min 2 characters)";
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Valid email address is required";
    }
    if (!formData.location.trim() || formData.location.length < 2) {
      errors.location = "Location is required";
    }
    if (!formData.subject_focus.trim() || formData.subject_focus.length < 2) {
      errors.subject_focus = "Subject/focus area is required";
    }
    if (!formData.age_grade_range.trim() || formData.age_grade_range.length < 2) {
      errors.age_grade_range = "Age/grade range is required";
    }
    if (!formData.bio.trim() || formData.bio.length < 50) {
      errors.bio = "Bio must be at least 50 characters";
    }
    if (formData.bio.length > 600) {
      errors.bio = "Bio must be 600 characters or less";
    }
    if (!formData.consent_acknowledged) {
      errors.consent = "You must acknowledge the application terms";
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/alt-school/intake/tutors`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData)
        }
      );
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        throw new Error(data.detail || "Failed to submit application");
      }
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field error on change
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Success state
  if (submitted) {
    return (
      <CommunityLayout>
        <div className="max-w-2xl mx-auto py-16 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="text-emerald-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 mb-4">
            Application Submitted
          </h1>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            We review applications in phases. There's no urgency. 
            You'll be contacted if there's a fit for the Alternative School Hub.
          </p>
          <Link
            to="/portal/community/school"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Alternative School Hub
          </Link>
        </div>
      </CommunityLayout>
    );
  }

  return (
    <CommunityLayout>
      {/* Header */}
      <div className="mb-8">
        <Link
          to="/portal/community/school"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-300 mb-4"
        >
          <ArrowLeft size={16} />
          Back to Alternative School Hub
        </Link>
        
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
            <GraduationCap className="text-blue-400" size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              Apply to Be Listed as a Tutor
            </h1>
            <p className="text-sm text-slate-400">Alternative School Hub</p>
          </div>
        </div>
        
        <p className="text-base text-slate-300 max-w-2xl">
          Share your background and expertise. Applications are reviewed in phases by the BANIBS team.
          Listing is not guaranteed — we'll reach out if there's a fit.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3">
          <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        
        {/* Section: Contact Information */}
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <User size={18} className="text-blue-400" />
            Contact Information
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Full Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Your full name"
                className={`w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                  fieldErrors.name ? "border-red-500/50" : "border-slate-700"
                }`}
                data-testid="intake-name"
              />
              {fieldErrors.name && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.name}</p>
              )}
            </div>
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  placeholder="your@email.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    fieldErrors.email ? "border-red-500/50" : "border-slate-700"
                  }`}
                  data-testid="intake-email"
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.email}</p>
              )}
            </div>
            
            {/* Phone (Optional) */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Phone <span className="text-slate-500">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  data-testid="intake-phone"
                />
              </div>
            </div>
            
            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Location <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  placeholder="City, State or 'Remote'"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    fieldErrors.location ? "border-red-500/50" : "border-slate-700"
                  }`}
                  data-testid="intake-location"
                />
              </div>
              {fieldErrors.location && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.location}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section: Teaching Profile */}
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-amber-400" />
            Teaching Profile
          </h2>
          
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {/* Subject/Focus */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Subject / Focus Area <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.subject_focus}
                  onChange={(e) => handleChange("subject_focus", e.target.value)}
                  placeholder="e.g., Math, Literacy, Science"
                  className={`w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                    fieldErrors.subject_focus ? "border-red-500/50" : "border-slate-700"
                  }`}
                  data-testid="intake-subject"
                />
                {fieldErrors.subject_focus && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.subject_focus}</p>
                )}
              </div>
              
              {/* Age/Grade Range */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">
                  Age / Grade Range <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                  <input
                    type="text"
                    value={formData.age_grade_range}
                    onChange={(e) => handleChange("age_grade_range", e.target.value)}
                    placeholder="e.g., K-5, Grades 6-8, All ages"
                    className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 ${
                      fieldErrors.age_grade_range ? "border-red-500/50" : "border-slate-700"
                    }`}
                    data-testid="intake-grades"
                  />
                </div>
                {fieldErrors.age_grade_range && (
                  <p className="text-xs text-red-400 mt-1">{fieldErrors.age_grade_range}</p>
                )}
              </div>
            </div>
            
            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Short Bio <span className="text-red-400">*</span>
                <span className="text-slate-500 font-normal ml-2">
                  ({formData.bio.length}/600 characters, min 50)
                </span>
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-slate-500" size={16} />
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange("bio", e.target.value)}
                  placeholder="Tell us about your teaching experience, approach, and what makes you passionate about education..."
                  rows={4}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 resize-none ${
                    fieldErrors.bio ? "border-red-500/50" : "border-slate-700"
                  }`}
                  data-testid="intake-bio"
                />
              </div>
              {fieldErrors.bio && (
                <p className="text-xs text-red-400 mt-1">{fieldErrors.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section: Additional Info (Optional) */}
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
          <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Globe size={18} className="text-emerald-400" />
            Additional Information
            <span className="text-xs text-slate-500 font-normal">(optional)</span>
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Website / Portfolio
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                data-testid="intake-website"
              />
            </div>
            
            {/* Availability */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Availability
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  value={formData.availability}
                  onChange={(e) => handleChange("availability", e.target.value)}
                  placeholder="e.g., Weekday afternoons, Flexible"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  data-testid="intake-availability"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Consent Checkbox */}
        <div className="p-4 rounded-xl bg-slate-900/30 border border-slate-800">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.consent_acknowledged}
              onChange={(e) => handleChange("consent_acknowledged", e.target.checked)}
              className="mt-1 w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-500 focus:ring-blue-500/40 focus:ring-offset-0"
              data-testid="intake-consent"
            />
            <span className="text-sm text-slate-300">
              I understand this is an application for review, not a guarantee of listing.
              The BANIBS team will review submissions in phases and contact me if there's a fit.
            </span>
          </label>
          {fieldErrors.consent && (
            <p className="text-xs text-red-400 mt-2 ml-7">{fieldErrors.consent}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <Link
            to="/portal/community/school"
            className="text-sm text-slate-400 hover:text-slate-300"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            data-testid="intake-submit"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </div>
      </form>

      {/* Footer Note */}
      <div className="mt-10 p-4 rounded-xl bg-slate-900/20 border border-slate-800/50 text-center max-w-2xl">
        <p className="text-xs text-slate-500">
          Questions about the application process? <br />
          Contact us through BANIBS Connect (coming soon).
        </p>
      </div>
    </CommunityLayout>
  );
}
