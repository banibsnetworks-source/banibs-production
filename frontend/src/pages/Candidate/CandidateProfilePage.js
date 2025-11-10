import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SEO from "../../components/SEO";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const JOB_TYPES = ["Full-time", "Part-time", "Contract", "Internship"];
const REMOTE_PREFS = ["Remote", "Hybrid", "On-site"];

function CandidateProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextUrl = searchParams.get('next');

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    location: "",
    professional_title: "",
    contact_email: "",
    skills: [],
    preferred_industries: [],
    preferred_job_types: [],
    preferred_remote_types: [],
    desired_salary_min: "",
    desired_salary_max: "",
    linkedin_url: "",
    portfolio_url: "",
    resume_url: "",
    bio: ""
  });

  const [skillInput, setSkillInput] = useState("");
  const [industryInput, setIndustryInput] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      
      const res = await fetch(`${BACKEND_URL}/api/candidates/me`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.status === 404) {
        // No profile exists yet
        setProfile(null);
        setLoading(false);
        return;
      }

      if (!res.ok) {
        throw new Error('Failed to load profile');
      }

      const data = await res.json();
      setProfile(data);
      setFormData({
        full_name: data.full_name || "",
        location: data.location || "",
        professional_title: data.professional_title || "",
        contact_email: data.contact_email || "",
        skills: data.skills || [],
        preferred_industries: data.preferred_industries || [],
        preferred_job_types: data.preferred_job_types || [],
        preferred_remote_types: data.preferred_remote_types || [],
        desired_salary_min: data.desired_salary_min || "",
        desired_salary_max: data.desired_salary_max || "",
        linkedin_url: data.linkedin_url || "",
        portfolio_url: data.portfolio_url || "",
        resume_url: data.resume_url || "",
        bio: data.bio || ""
      });
    } catch (err) {
      console.error(err);
      setError("Unable to load profile");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    
    // Validation
    if (!formData.full_name || !formData.location || !formData.professional_title) {
      setError("Please fill in all required fields (Name, Location, Headline)");
      return;
    }
    
    if (formData.skills.length === 0) {
      setError("Please add at least one skill");
      return;
    }

    if (!formData.resume_url) {
      setError("Please upload your resume");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const token = localStorage.getItem('accessToken');

      const res = await fetch(`${BACKEND_URL}/api/candidates/me`, {
        method: profile ? 'PUT' : 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          desired_salary_min: formData.desired_salary_min ? parseInt(formData.desired_salary_min) : null,
          desired_salary_max: formData.desired_salary_max ? parseInt(formData.desired_salary_max) : null
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to save profile');
      }

      setSuccess(true);
      
      // If there's a next URL, redirect after success
      if (nextUrl) {
        setTimeout(() => navigate(nextUrl), 1500);
      } else {
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to save profile");
    } finally {
      setSaving(false);
    }
  }

  async function handleResumeUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!allowedTypes.includes(fileExt)) {
      setError(`Invalid file type. Allowed: ${allowedTypes.join(', ')}`);
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File too large. Maximum size: 5MB");
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const token = localStorage.getItem('accessToken');

      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${BACKEND_URL}/api/candidates/upload-resume`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to upload resume');
      }

      const data = await res.json();
      setFormData(prev => ({ ...prev, resume_url: data.resume_url }));
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to upload resume");
    } finally {
      setUploading(false);
    }
  }

  function addSkill() {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput("");
    }
  }

  function removeSkill(skill) {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  }

  function addIndustry() {
    if (industryInput.trim() && !formData.preferred_industries.includes(industryInput.trim())) {
      setFormData(prev => ({
        ...prev,
        preferred_industries: [...prev.preferred_industries, industryInput.trim()]
      }));
      setIndustryInput("");
    }
  }

  function removeIndustry(industry) {
    setFormData(prev => ({
      ...prev,
      preferred_industries: prev.preferred_industries.filter(i => i !== industry)
    }));
  }

  function toggleJobType(type) {
    setFormData(prev => ({
      ...prev,
      preferred_job_types: prev.preferred_job_types.includes(type)
        ? prev.preferred_job_types.filter(t => t !== type)
        : [...prev.preferred_job_types, type]
    }));
  }

  function toggleRemotePref(pref) {
    setFormData(prev => ({
      ...prev,
      preferred_remote_types: prev.preferred_remote_types.includes(pref)
        ? prev.preferred_remote_types.filter(p => p !== pref)
        : [...prev.preferred_remote_types, pref]
    }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center text-white">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-black py-12">
      <SEO 
        title="BANIBS - Create Your Candidate Profile"
        description="Build your professional profile to connect with recruiters and opportunities in the BANIBS network."
      />
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {profile ? "Edit Your Profile" : "Create Your Candidate Profile"}
          </h1>
          <p className="text-slate-300">
            Complete your profile to start applying for opportunities. Open to all, rooted in Black advancement.
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg text-green-100">
            ✅ Profile {profile ? 'updated' : 'created'} successfully!
            {nextUrl && <span className="ml-2">Redirecting...</span>}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="full-name" className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  id="full-name"
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                  aria-required="true"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Location <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="City, State, Country"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Professional Headline <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Senior Data Analyst – Remote/Hybrid"
                  value={formData.professional_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, professional_title: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Contact Email
                </label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              Skills <span className="text-red-400">*</span>
            </h2>
            
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill (e.g., Python, Project Management)"
                className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition"
              >
                Add
              </button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.skills.map(skill => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-slate-700 text-white rounded-full text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-red-400 hover:text-red-300"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Job Preferences */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Job Preferences</h2>
            
            {/* Desired Industries */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Desired Industries
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={industryInput}
                  onChange={(e) => setIndustryInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIndustry())}
                  placeholder="Add an industry (e.g., Technology, Healthcare)"
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
                <button
                  type="button"
                  onClick={addIndustry}
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.preferred_industries.map(industry => (
                  <span
                    key={industry}
                    className="px-3 py-1 bg-slate-700 text-white rounded-full text-sm flex items-center gap-2"
                  >
                    {industry}
                    <button
                      type="button"
                      onClick={() => removeIndustry(industry)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Job Types */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Desired Job Types
              </label>
              <div className="flex flex-wrap gap-2">
                {JOB_TYPES.map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleJobType(type)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      formData.preferred_job_types.includes(type)
                        ? 'bg-yellow-500 text-black'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Remote Preferences */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Remote Preferences
              </label>
              <div className="flex flex-wrap gap-2">
                {REMOTE_PREFS.map(pref => (
                  <button
                    key={pref}
                    type="button"
                    onClick={() => toggleRemotePref(pref)}
                    className={`px-4 py-2 rounded-lg font-medium transition ${
                      formData.preferred_remote_types.includes(pref)
                        ? 'bg-yellow-500 text-black'
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Desired Salary Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder="Min ($)"
                    value={formData.desired_salary_min}
                    onChange={(e) => setFormData(prev => ({ ...prev, desired_salary_min: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder="Max ($)"
                    value={formData.desired_salary_max}
                    onChange={(e) => setFormData(prev => ({ ...prev, desired_salary_max: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Links & Resume */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Links & Resume</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  LinkedIn URL
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Portfolio / Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={formData.portfolio_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, portfolio_url: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Resume <span className="text-red-400">*</span>
                </label>
                <div className="space-y-2">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleResumeUpload}
                    disabled={uploading}
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  {uploading && (
                    <p className="text-sm text-yellow-400">Uploading resume...</p>
                  )}
                  {formData.resume_url && (
                    <p className="text-sm text-green-400">
                      ✓ Resume uploaded: {formData.resume_url.split('/').pop()}
                    </p>
                  )}
                  <p className="text-xs text-slate-400">
                    Accepted formats: PDF, DOC, DOCX (max 5MB)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || uploading}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : (profile ? 'Update Profile' : 'Create Profile')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CandidateProfilePage;
