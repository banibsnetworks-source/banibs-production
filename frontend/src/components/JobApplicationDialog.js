import React, { useState } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function JobApplicationDialog({ job, onClose, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (!coverLetter.trim()) {
      setError("Please write a cover letter");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const token = localStorage.getItem('access_token');

      const res = await fetch(`${BACKEND_URL}/api/applications`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: job.id,
          cover_letter: coverLetter.trim()
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || 'Failed to submit application');
      }

      // Success
      onSuccess && onSuccess();
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to submit application");
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Apply for Position</h2>
            <div className="text-slate-300">
              <p className="font-semibold">{job.title}</p>
              <p className="text-sm">{job.employer_name || 'Unknown Employer'}</p>
              {job.location && <p className="text-sm text-slate-400">{job.location}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-100">
              {error}
            </div>
          )}

          {/* Resume Info */}
          <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
            <div className="flex items-center gap-2 text-slate-300">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Your resume from your profile will be included with this application</span>
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Cover Letter <span className="text-red-400">*</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={12}
              placeholder="Tell the employer why you're a great fit for this position..."
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            />
            <p className="mt-2 text-xs text-slate-400">
              Tip: Highlight relevant experience and explain why you're excited about this opportunity
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-lg transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default JobApplicationDialog;
