import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { contributorProfileAPI } from '../../services/api';

const ContributorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await contributorProfileAPI.getProfile(id);
      setProfile(response.data);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load contributor profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#FFD700] border-t-transparent"></div>
          <p className="text-[#FFD700] text-xl mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-black border-2 border-red-500 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
            <p className="text-gray-400 mb-6">{error || 'This contributor profile does not exist.'}</p>
            <button
              onClick={() => navigate('/opportunities')}
              className="px-6 py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all"
            >
              View Opportunities
            </button>
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
              <p className="text-gray-400 text-sm mt-1">Contributor Profile</p>
            </div>
            <button
              onClick={() => navigate('/opportunities')}
              className="px-4 py-2 bg-[#1a1a1a] border border-[#FFD700] text-[#FFD700] font-bold rounded-lg hover:bg-[#2a2a2a] transition-all text-sm"
            >
              ← Back to Opportunities
            </button>
          </div>
        </div>
      </header>

      {/* Profile Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#1a1a1a] border-2 border-[#FFD700] rounded-lg p-8 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
          {/* Display Name with Verified Badge */}
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-3xl font-bold text-white">{profile.display_name}</h2>
            {profile.verified && (
              <span className="inline-flex items-center px-3 py-1 bg-[#FFD700] text-black text-sm font-bold rounded-full">
                ✓ Verified
              </span>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#FFD700] mb-2">About</h3>
              <p className="text-gray-300 whitespace-pre-wrap">{profile.bio}</p>
            </div>
          )}

          {/* Website/Social */}
          {profile.website_or_social && (
            <div className="mb-6">
              <h3 className="text-lg font-bold text-[#FFD700] mb-2">Website</h3>
              <a
                href={profile.website_or_social}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#FFD700] hover:underline break-all"
              >
                {profile.website_or_social}
              </a>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 pt-6 border-t-2 border-[#FFD700]/20">
            <h3 className="text-lg font-bold text-[#FFD700] mb-4">Contribution Stats</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-black border border-[#FFD700]/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">{profile.total_submissions}</div>
                <div className="text-sm text-gray-400 mt-1">Total Submissions</div>
              </div>
              <div className="bg-black border border-green-500/30 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white">{profile.approved_submissions}</div>
                <div className="text-sm text-gray-400 mt-1">Approved</div>
              </div>
              <div className="bg-black border border-[#FFD700] rounded-lg p-4 text-center shadow-[0_0_10px_rgba(255,215,0,0.3)]">
                <div className="text-3xl font-bold text-[#FFD700]">{profile.featured_submissions}</div>
                <div className="text-sm text-gray-400 mt-1">Featured</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t-2 border-[#FFD700] mt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400 text-sm">
              © 2025 BANIBS. All opportunities are human-reviewed and curated.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ContributorProfile;
