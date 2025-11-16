import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ConnectLayout from '../../components/connect/ConnectLayout';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { ArrowLeft, Save, Eye } from 'lucide-react';

/**
 * JobForm - Create/Edit Job Posting
 * Phase 7.1: BANIBS Jobs & Opportunities
 */

const JobForm = () => {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const { selectedBusinessProfile, isBusinessMode } = useAccountMode();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    business_profile_id: '',
    title: '',
    employment_type: 'full_time',
    category: '',
    tags: [],
    description: '',
    responsibilities: [''],
    requirements: [''],
    skills: [''],
    location_type: 'onsite',
    location_city: '',
    location_state: '',
    location_zip: '',
    salary_min: '',
    salary_max: '',
    salary_visible: true,
    application_method: 'banibs',
    external_apply_url: '',
    status: 'draft',
    visibility: 'public'
  });

  useEffect(() => {
    if (!isBusinessMode) {
      navigate('/portal/social');
      return;
    }

    // Set business profile
    if (selectedBusinessProfile?.id) {
      setFormData(prev => ({ ...prev, business_profile_id: selectedBusinessProfile.id }));
    }

    // Load job if editing
    if (jobId) {
      loadJob();
    }
  }, [jobId, selectedBusinessProfile, isBusinessMode]);

  const loadJob = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const job = await response.json();
        setFormData({
          business_profile_id: job.business_profile_id,
          title: job.title,
          employment_type: job.employment_type,
          category: job.category,
          tags: job.tags || [],
          description: job.description,
          responsibilities: job.responsibilities.length > 0 ? job.responsibilities : [''],
          requirements: job.requirements.length > 0 ? job.requirements : [''],
          skills: job.skills.length > 0 ? job.skills : [''],
          location_type: job.location_type,
          location_city: job.location_city || '',
          location_state: job.location_state || '',
          location_zip: job.location_zip || '',
          salary_min: job.salary_min || '',
          salary_max: job.salary_max || '',
          salary_visible: job.salary_visible,
          application_method: job.application_method,
          external_apply_url: job.external_apply_url || '',
          status: job.status,
          visibility: job.visibility
        });
      }
    } catch (err) {
      console.error('Failed to load job:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e, publishNow = false) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const token = localStorage.getItem('access_token');
      
      // Prepare data
      const payload = {
        ...formData,
        responsibilities: formData.responsibilities.filter(r => r.trim()),
        requirements: formData.requirements.filter(r => r.trim()),
        skills: formData.skills.filter(s => s.trim()),
        salary_min: formData.salary_min ? parseFloat(formData.salary_min) : null,
        salary_max: formData.salary_max ? parseFloat(formData.salary_max) : null,
        status: publishNow ? 'open' : formData.status
      };

      const url = jobId
        ? `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/jobs`;
      
      const method = jobId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        navigate('/portal/connect/jobs');
      } else {
        const data = await response.json();
        setError(data.detail || 'Failed to save job');
      }
    } catch (err) {
      setError('Failed to save job');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleArrayChange = (index, value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  const addArrayItem = (field) => {
    setFormData(prev => ({ ...prev, [field]: [...prev[field], ''] }));
  };

  const removeArrayItem = (index, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <ConnectLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </ConnectLayout>
    );
  }

  return (
    <ConnectLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/portal/connect/jobs')}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Jobs
          </button>
          <h1 className="text-2xl font-bold text-foreground">
            {jobId ? 'Edit Job Posting' : 'Post a New Job'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {selectedBusinessProfile?.name}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Basic Information</h2>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                placeholder="e.g., Senior Software Engineer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Employment Type *
                </label>
                <select
                  required
                  value={formData.employment_type}
                  onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  <option value="full_time">Full-Time</option>
                  <option value="part_time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                  <option value="apprenticeship">Apprenticeship</option>
                  <option value="gig">Gig</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Job Description *
              </label>
              <textarea
                required
                rows={6}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                placeholder="Describe the role, the ideal candidate, and what makes this opportunity special..."
              />
            </div>
          </div>

          {/* Responsibilities */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Responsibilities</h2>
            {formData.responsibilities.map((resp, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={resp}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'responsibilities')}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Key responsibility"
                />
                {formData.responsibilities.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'responsibilities')}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('responsibilities')}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              + Add Responsibility
            </button>
          </div>

          {/* Requirements */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Requirements</h2>
            {formData.requirements.map((req, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={req}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'requirements')}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Job requirement"
                />
                {formData.requirements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'requirements')}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('requirements')}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              + Add Requirement
            </button>
          </div>

          {/* Skills */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Skills</h2>
            {formData.skills.map((skill, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={skill}
                  onChange={(e) => handleArrayChange(index, e.target.value, 'skills')}
                  className="flex-1 px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Required skill"
                />
                {formData.skills.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeArrayItem(index, 'skills')}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem('skills')}
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
            >
              + Add Skill
            </button>
          </div>

          {/* Location */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Location</h2>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Location Type *
              </label>
              <select
                required
                value={formData.location_type}
                onChange={(e) => setFormData({ ...formData, location_type: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="onsite">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>

            {formData.location_type !== 'remote' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">City</label>
                  <input
                    type="text"
                    value={formData.location_city}
                    onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">State</label>
                  <input
                    type="text"
                    value={formData.location_state}
                    onChange={(e) => setFormData({ ...formData, location_state: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">ZIP</label>
                  <input
                    type="text"
                    value={formData.location_zip}
                    onChange={(e) => setFormData({ ...formData, location_zip: e.target.value })}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Compensation */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Compensation</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Min Salary ($)</label>
                <input
                  type="number"
                  value={formData.salary_min}
                  onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="40000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Max Salary ($)</label>
                <input
                  type="number"
                  value={formData.salary_max}
                  onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="80000"
                />
              </div>
            </div>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.salary_visible}
                onChange={(e) => setFormData({ ...formData, salary_visible: e.target.checked })}
                className="rounded"
              />
              <span className="text-sm text-foreground">Show salary to job seekers</span>
            </label>
          </div>

          {/* Application Method */}
          <div className="bg-card border border-border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Application Method</h2>
            
            <div>
              <select
                value={formData.application_method}
                onChange={(e) => setFormData({ ...formData, application_method: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
              >
                <option value="banibs">BANIBS (recommended)</option>
                <option value="external">External URL</option>
              </select>
            </div>

            {formData.application_method === 'external' && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  External Application URL
                </label>
                <input
                  type="url"
                  value={formData.external_apply_url}
                  onChange={(e) => setFormData({ ...formData, external_apply_url: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="https://..."
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/portal/connect/jobs')}
              className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save as Draft'}
            </button>
            <button
              type="button"
              onClick={(e) => handleSubmit(e, true)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-medium"
            >
              <Eye className="w-4 h-4" />
              {saving ? 'Publishing...' : 'Publish Job'}
            </button>
          </div>
        </form>
      </div>
    </ConnectLayout>
  );
};

export default JobForm;
