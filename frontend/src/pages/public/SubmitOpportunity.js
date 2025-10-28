import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContributorAuth } from '../../contexts/ContributorAuthContext';
import { opportunitiesAPI, uploadsAPI } from '../../services/api';

const SubmitOpportunity = () => {
  const { isAuthenticated, contributor } = useContributorAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    orgName: '',
    type: 'job',
    location: '',
    deadline: '',
    description: '',
    link: '',
    imageUrl: ''
  });
  
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      // Get presigned URL
      const presignResponse = await uploadsAPI.getPresignedUrl(file.name, file.type);
      const { uploadUrl, publicUrl, method } = presignResponse.data;

      if (method === 'PUT') {
        // S3 upload
        await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type
          }
        });
      } else {
        // Local upload
        await uploadsAPI.uploadLocal(file, file.name);
      }

      setFormData({ ...formData, imageUrl: publicUrl });
    } catch (err) {
      setError('Failed to upload image. Please try again.');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const submitData = {
        ...formData,
        deadline: formData.deadline || null,
        link: formData.link || null,
        imageUrl: formData.imageUrl || null
      };

      await opportunitiesAPI.submit(submitData);
      setSuccess(true);
      
      // Reset form
      setTimeout(() => {
        navigate('/contributor/my-submissions');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit. Please try again.');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-black border-2 border-[#FFD700] rounded-lg p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Sign In Required
            </h2>
            <p className="text-gray-300 mb-6">
              Please sign in or create an account to submit opportunities.
            </p>
            <div className="flex gap-4">
              <a
                href="/contributor/login"
                className="flex-1 px-6 py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all shadow-[0_0_15px_rgba(255,215,0,0.5)]"
              >
                Sign In
              </a>
              <a
                href="/contributor/register"
                className="flex-1 px-6 py-3 bg-[#1a1a1a] border-2 border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#2a2a2a] transition-all"
              >
                Register
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-black border-2 border-[#FFD700] rounded-lg p-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Submission Received!
            </h2>
            <p className="text-gray-300 mb-6">
              Your opportunity has been submitted and is pending review. You'll be redirected to your submissions...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-black border-b-2 border-[#FFD700] shadow-[0_2px_20px_rgba(255,215,0,0.3)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold text-[#FFD700]">BANIBS</h1>
              <p className="text-gray-400 text-sm mt-1">Submit an Opportunity</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white text-sm">
                {contributor?.name}
              </span>
              <a
                href="/opportunities"
                className="px-4 py-2 bg-[#1a1a1a] border border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#2a2a2a] transition-all text-sm"
              >
                View Opportunities
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-black border-2 border-[#FFD700] rounded-lg p-8 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
          <h2 className="text-2xl font-bold text-white mb-6">
            Submit New Opportunity
          </h2>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
                placeholder="Software Engineer Internship"
              />
            </div>

            {/* Organization */}
            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Organization *
              </label>
              <input
                type="text"
                required
                value={formData.orgName}
                onChange={(e) => setFormData({...formData, orgName: e.target.value})}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
                placeholder="Tech Corp"
              />
            </div>

            {/* Type & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#FFD700] mb-2">
                  Type *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
                >
                  <option value="job">Job</option>
                  <option value="grant">Grant</option>
                  <option value="scholarship">Scholarship</option>
                  <option value="training">Training</option>
                  <option value="event">Event</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#FFD700] mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
                  placeholder="Remote / Atlanta, GA"
                />
              </div>
            </div>

            {/* Deadline & Link */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#FFD700] mb-2">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#FFD700] mb-2">
                  Application Link
                </label>
                <input
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({...formData, link: e.target.value})}
                  className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
                  placeholder="https://example.com/apply"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Description *
              </label>
              <textarea
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={6}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all resize-none"
                placeholder="Describe the opportunity in detail..."
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Image (optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#FFD700] file:text-black hover:file:bg-[#FFC700]"
              />
              {uploading && (
                <p className="mt-2 text-sm text-[#FFD700]">Uploading image...</p>
              )}
              {formData.imageUrl && (
                <div className="mt-4">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-lg border-2 border-[#FFD700]/30"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting || uploading}
                className="flex-1 py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(255,215,0,0.5)]"
              >
                {submitting ? 'Submitting...' : 'Submit for Review'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/opportunities')}
                className="px-6 py-3 bg-[#1a1a1a] border-2 border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#2a2a2a] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          Your submission will be reviewed by our team before being published.
        </p>
      </main>
    </div>
  );
};

export default SubmitOpportunity;
