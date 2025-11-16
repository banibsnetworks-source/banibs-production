import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SocialLayout from '../../components/social/SocialLayout';
import { ArrowLeft, MapPin, DollarSign, Briefcase, Clock, ExternalLink, Star, Users } from 'lucide-react';
import BusinessRating from '../../components/common/BusinessRating';
import ReviewsList from '../../components/common/ReviewsList';
import { trackBIAJobView, trackBIAJobApplication } from '../../utils/analytics';

/**
 * JobDetailPage - Public Job Details (Social Mode)
 * Phase 7.1: BANIBS Jobs & Opportunities
 */

const JobDetailPage = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    cover_message: '',
    resume_url: ''
  });

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}/public`
      );

      if (response.ok) {
        const data = await response.json();
        setJob(data);
      } else {
        navigate('/portal/social/jobs');
      }
    } catch (error) {
      console.error('Failed to fetch job:', error);
      navigate('/portal/social/jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        navigate('/login?redirect=/portal/social/jobs/' + jobId);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/jobs/${jobId}/apply`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(applicationData)
        }
      );

      if (response.ok) {
        alert('Application submitted successfully!');
        setShowApplicationModal(false);
        setApplicationData({ cover_message: '', resume_url: '' });
      } else {
        const data = await response.json();
        alert(data.detail || 'Failed to submit application');
      }
    } catch (error) {
      alert('Failed to submit application');
      console.error(error);
    } finally {
      setApplying(false);
    }
  };

  const getEmploymentTypeLabel = (type) => {
    const labels = {
      full_time: 'Full-Time',
      part_time: 'Part-Time',
      contract: 'Contract',
      internship: 'Internship',
      apprenticeship: 'Apprenticeship',
      gig: 'Gig'
    };
    return labels[type] || type;
  };

  const formatSalary = (min, max, visible) => {
    if (!visible) return 'Salary not disclosed';
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()} per year`;
    if (min) return `From $${min.toLocaleString()} per year`;
    if (max) return `Up to $${max.toLocaleString()} per year`;
    return 'Competitive salary';
  };

  if (loading) {
    return (
      <SocialLayout>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </SocialLayout>
    );
  }

  if (!job) {
    return null;
  }

  return (
    <SocialLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/portal/social/jobs')}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>

        {/* Job Header */}
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            {job.company_logo ? (
              <img
                src={job.company_logo}
                alt={job.company_name}
                className="w-20 h-20 rounded-lg object-cover"
              />
            ) : (
              <div className="w-20 h-20 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Briefcase className="w-10 h-10 text-yellow-600" />
              </div>
            )}

            {/* Job Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground mb-2">{job.title}</h1>
              <Link
                to={`/portal/business/${job.business_profile_id}`}
                className="text-lg font-medium text-blue-600 hover:underline mb-2 inline-block"
              >
                {job.company_name}
              </Link>
              
              {/* Business Rating */}
              <div className="mb-3">
                <BusinessRating businessProfileId={job.business_profile_id} showReviewCount />
              </div>

              {/* Job Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{getEmploymentTypeLabel(job.employment_type)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {job.location_type === 'remote'
                      ? 'Remote'
                      : `${job.location_city}, ${job.location_state}`}
                  </span>
                </div>
                {(job.salary_min || job.salary_max) && job.salary_visible && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary(job.salary_min, job.salary_max, job.salary_visible)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div>
              {job.application_method === 'banibs' ? (
                <button
                  onClick={() => setShowApplicationModal(true)}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Apply Now
                </button>
              ) : (
                <a
                  href={job.external_apply_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Apply Externally
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-3">About the Role</h2>
            <p className="text-foreground whitespace-pre-line">{job.description}</p>
          </div>

          {job.responsibilities && job.responsibilities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Key Responsibilities</h2>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                {job.responsibilities.map((resp, idx) => (
                  <li key={idx}>{resp}</li>
                ))}
              </ul>
            </div>
          )}

          {job.requirements && job.requirements.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-foreground">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {job.skills && job.skills.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-3">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Business Reviews Section */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">About {job.company_name}</h2>
          <ReviewsList businessProfileId={job.business_profile_id} limit={5} />
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Apply for {job.title}
            </h2>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Cover Message (Optional)
                </label>
                <textarea
                  rows={6}
                  value={applicationData.cover_message}
                  onChange={(e) => setApplicationData({ ...applicationData, cover_message: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="Tell the employer why you're a great fit for this role..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Resume URL (Optional)
                </label>
                <input
                  type="url"
                  value={applicationData.resume_url}
                  onChange={(e) => setApplicationData({ ...applicationData, resume_url: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  placeholder="https://..."
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="px-6 py-2 border border-border rounded-lg text-foreground hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </SocialLayout>
  );
};

export default JobDetailPage;
