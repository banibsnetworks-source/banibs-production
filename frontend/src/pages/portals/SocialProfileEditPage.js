import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileAvatar } from '../../components/social/ProfileAvatar';
import AvatarUploader from '../../components/social/AvatarUploader';
import CoverUploader from '../../components/social/CoverUploader';
import SocialLayout from '../../components/social/SocialLayout';

const SocialProfileEditPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: '',
    handle: '',
    headline: '',
    bio: '',
    location: '',
    interests: [],
    is_public: true
  });
  
  const [interestInput, setInterestInput] = useState('');

  // Load profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/me`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            credentials: 'include'
          }
        );
        
        if (!response.ok) throw new Error('Failed to load profile');
        
        const data = await response.json();
        setProfile(data);
        setFormData({
          display_name: data.display_name || '',
          handle: data.handle || '',
          headline: data.headline || '',
          bio: data.bio || '',
          location: data.location || '',
          interests: data.interests || [],
          is_public: data.is_public !== false
        });
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    // Check if user is authenticated via token
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/portal/social');
      return;
    }
    
    loadProfile();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddInterest = (e) => {
    e.preventDefault();
    const interest = interestInput.trim().toLowerCase();
    if (interest && !formData.interests.includes(interest)) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
      setInterestInput('');
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);
    
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/me`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          credentials: 'include',
          body: JSON.stringify(formData)
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to update profile');
      }
      
      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setSuccess(true);
      
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SocialLayout>
        <div className="min-h-screen" style={{ paddingTop: '80px', background: '#0B0B0B' }}>
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading profile...</div>
              </div>
            </div>
          </div>
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="min-h-screen" style={{ paddingTop: '80px', background: '#0B0B0B' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            <div className="flex items-center gap-3">
              {profile?.handle && (
                <>
                  <Link 
                    to={`/portal/social/u/${profile.handle}?tab=posts`}
                    className="text-amber-400 hover:text-amber-300 text-sm flex items-center gap-1"
                  >
                    📝 My Posts
                  </Link>
                  <span className="text-gray-600">•</span>
                  <Link 
                    to={`/portal/social/u/${profile.handle}`}
                    className="text-amber-400 hover:text-amber-300 text-sm"
                  >
                    View Public Profile →
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Profile Preview */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-white font-semibold mb-4">Profile Preview</h2>
            <div className="flex items-start gap-4">
              <ProfileAvatar 
                name={formData.display_name || 'BANIBS Member'} 
                avatarUrl={profile?.avatar_url}
                size="lg"
              />
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-xl font-bold text-white">
                    {formData.display_name || 'Your Name'}
                  </div>
                  {formData.handle && (
                    <div className="text-amber-400 text-sm">@{formData.handle}</div>
                  )}
                </div>
                {formData.headline && (
                  <div className="text-gray-300 text-sm">{formData.headline}</div>
                )}
                {formData.location && (
                  <div className="text-gray-400 text-sm">📍 {formData.location}</div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="bg-gray-800 rounded-2xl border border-gray-700 p-6 space-y-6">
            {/* Success Message */}
            {success && (
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4 text-green-400 text-sm">
                ✅ Profile updated successfully!
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-400 text-sm">
                ❌ {error}
              </div>
            )}

            {/* Avatar Upload */}
            <div>
              <label className="block text-white font-medium mb-3">
                Profile Photo
              </label>
              <AvatarUploader
                key={profile?.avatar_url || 'no-avatar'}
                initialUrl={profile?.avatar_url ? `${process.env.REACT_APP_BACKEND_URL}${profile.avatar_url}` : null}
                onUploaded={async (url) => {
                  // Reload profile data to get updated avatar
                  try {
                    const response = await fetch(
                      `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/me`,
                      {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        },
                        credentials: 'include'
                      }
                    );
                    if (response.ok) {
                      const data = await response.json();
                      setProfile(data);
                      setSuccess(true);
                      setTimeout(() => setSuccess(false), 3000);
                    }
                  } catch (err) {
                    console.error('Error reloading profile:', err);
                  }
                }}
                size="lg"
              />
            </div>

            {/* Cover Image Upload */}
            <div>
              <label className="block text-white font-medium mb-3">
                Cover Image (Banner)
              </label>
              <CoverUploader
                key={profile?.cover_url || 'no-cover'}
                initialUrl={profile?.cover_url ? `${process.env.REACT_APP_BACKEND_URL}${profile.cover_url}` : null}
                onUploaded={async (url) => {
                  // Reload profile data to get updated cover
                  try {
                    const response = await fetch(
                      `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/me`,
                      {
                        headers: {
                          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
                        },
                        credentials: 'include'
                      }
                    );
                    if (response.ok) {
                      const data = await response.json();
                      setProfile(data);
                      setSuccess(true);
                      setTimeout(() => setSuccess(false), 3000);
                    }
                  } catch (err) {
                    console.error('Error reloading profile:', err);
                  }
                }}
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-white font-medium mb-2">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                required
                maxLength={50}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Your full name"
              />
            </div>

            {/* Handle */}
            <div>
              <label className="block text-white font-medium mb-2">
                Handle (Username)
              </label>
              <div className="flex items-center">
                <span className="text-gray-400 mr-2">@</span>
                <input
                  type="text"
                  name="handle"
                  value={formData.handle}
                  onChange={handleInputChange}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="your_username"
                />
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Letters, numbers, and underscores only. This will be your profile URL.
              </p>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-white font-medium mb-2">
                Headline
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g., Founder • BANIBS"
              />
              <p className="text-gray-500 text-xs mt-1">
                A short one-liner about you
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-white font-medium mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={300}
                rows={4}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Tell the community about yourself..."
              />
              <p className="text-gray-500 text-xs mt-1">
                {formData.bio.length}/300 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-white font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                maxLength={100}
                className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="e.g., Atlanta, GA"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-white font-medium mb-2">
                Interests & Tags
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInterest(e)}
                  className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Add an interest..."
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                >
                  Add
                </button>
              </div>
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-amber-600/20 text-amber-400 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:text-amber-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Public Profile Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_public"
                name="is_public"
                checked={formData.is_public}
                onChange={handleInputChange}
                className="w-5 h-5 text-amber-600 bg-gray-900 border-gray-700 rounded focus:ring-amber-500"
              />
              <label htmlFor="is_public" className="text-white">
                Make profile public
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving || !formData.display_name}
                className="flex-1 px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <Link
                to="/portal/social"
                className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-600 transition-colors text-center"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </SocialLayout>
  );
};

export default SocialProfileEditPage;
