import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContributorAuth } from '../../contexts/ContributorAuthContext';
import { contributorProfileAPI } from '../../services/api';

const ContributorProfileEdit = () => {
  const { contributor, isAuthenticated } = useContributorAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    display_name: '',
    bio: '',
    website_or_social: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-black border-2 border-[#FFD700] rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
            <p className="text-gray-300 mb-6">
              Please sign in to edit your profile.
            </p>
            <button
              onClick={() => navigate('/contributor/login')}
              className="w-full px-6 py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);

    try {
      // Only send non-empty fields
      const updateData = {};
      if (formData.display_name) updateData.display_name = formData.display_name;
      if (formData.bio) updateData.bio = formData.bio;
      if (formData.website_or_social) updateData.website_or_social = formData.website_or_social;

      await contributorProfileAPI.updateProfile(updateData);
      setSuccess(true);
      
      // Redirect to profile after 2 seconds
      setTimeout(() => {
        navigate(`/contributor/${contributor.id}`);
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-black border-2 border-[#FFD700] rounded-lg p-8">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-4">Profile Updated!</h2>
            <p className="text-gray-300 mb-6">
              Your profile has been successfully updated. Redirecting...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b-2 border-[#FFD700] shadow-[0_2px_20px_rgba(255,215,0,0.3)]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-4xl font-bold text-[#FFD700]">BANIBS</h1>
              <p className="text-gray-400 text-sm mt-1">Edit Profile</p>
            </div>
            <button
              onClick={() => navigate('/opportunities')}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#2a2a2a] transition-all text-sm"
            >
              ← Cancel
            </button>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#1a1a1a] border-2 border-[#FFD700] rounded-lg p-8 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
          <h2 className="text-2xl font-bold text-white mb-6">Update Your Profile</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-900/50 border-2 border-red-500 rounded-lg text-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData({...formData, display_name: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
                placeholder="John Doe"
              />
              <p className="text-gray-500 text-xs mt-1">
                This will be shown publicly on your opportunities
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({...formData, bio: e.target.value})}
                rows={4}
                className="w-full px-4 py-3 bg-black border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all resize-none"
                placeholder="Tell us about yourself and why you contribute to BANIBS..."
              />
              <p className="text-gray-500 text-xs mt-1">
                Share your passion for connecting people with opportunities
              </p>
            </div>

            {/* Website or Social */}
            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Website or Social Link
              </label>
              <input
                type="url"
                value={formData.website_or_social}
                onChange={(e) => setFormData({...formData, website_or_social: e.target.value})}
                className="w-full px-4 py-3 bg-black border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
                placeholder="https://linkedin.com/in/yourname"
              />
              <p className="text-gray-500 text-xs mt-1">
                LinkedIn, Twitter, personal website, etc.
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(255,215,0,0.5)]"
              >
                {loading ? 'Updating...' : 'Update Profile'}
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
          Your profile information will be visible to all BANIBS users.
        </p>
      </main>
    </div>
  );
};

export default ContributorProfileEdit;
