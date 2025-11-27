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
        <div className="container-v2 section-v2 page-enter" data-mode="social">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-secondary-v2">Loading profile...</div>
            </div>
          </div>
        </div>
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="container-v2 section-v2 page-enter" data-mode="social">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 breathing-room-md">
            <h1 className="text-3xl font-bold text-foreground-v2">Edit Profile</h1>
            <div className="flex items-center gap-3 icon-text-aligned">
              {profile?.handle && (
                <>
                  <Link 
                    to="/portal/social/profile/theme"
                    className="btn-v2 btn-v2-ghost btn-v2-sm icon-text-aligned"
                  >
                    🎨 Profile Theme
                  </Link>
                  <span className="text-secondary-v2">•</span>
                  <Link 
                    to={`/portal/social/u/${profile.handle}?tab=posts`}
                    className="btn-v2 btn-v2-ghost btn-v2-sm icon-text-aligned"
                  >
                    📝 My Posts
                  </Link>
                  <span className="text-secondary-v2">•</span>
                  <Link 
                    to={`/portal/social/u/${profile.handle}`}
                    className="btn-v2 btn-v2-ghost btn-v2-sm"
                  >
                    View Public Profile →
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Profile Preview */}
          <div className="card-v2 clean-spacing-lg">
            <h2 className="text-foreground font-semibold mb-4">Profile Preview</h2>
            <div className="flex items-start gap-4">
              <ProfileAvatar 
                name={formData.display_name || 'BANIBS Member'} 
                avatarUrl={profile?.avatar_url}
                size="lg"
              />
              <div className="flex-1 space-y-2">
                <div>
                  <div className="text-xl font-bold text-foreground">
                    {formData.display_name || 'Your Name'}
                  </div>
                  {formData.handle && (
                    <div className="text-yellow-600 dark:text-yellow-400 text-sm">@{formData.handle}</div>
                  )}
                </div>
                {formData.headline && (
                  <div className="text-muted-foreground text-sm">{formData.headline}</div>
                )}
                {formData.location && (
                  <div className="text-muted-foreground text-sm">📍 {formData.location}</div>
                )}
              </div>
            </div>
          </div>

          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="card-v2 card-v2-lg space-y-6">
            {/* Success Message */}
            {success && (
              <div className="card-v2 clean-spacing-md" style={{ borderColor: 'var(--success-color, #10b981)', background: 'rgba(16, 185, 129, 0.1)' }}>
                <p className="text-sm" style={{ color: 'var(--success-color, #10b981)' }}>✅ Profile updated successfully!</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="card-v2 clean-spacing-md" style={{ borderColor: 'var(--error-color, #ef4444)', background: 'rgba(239, 68, 68, 0.1)' }}>
                <p className="text-sm" style={{ color: 'var(--error-color, #ef4444)' }}>❌ {error}</p>
              </div>
            )}

            {/* Avatar Upload */}
            <div>
              <label className="block text-foreground font-medium mb-3">
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
              <label className="block text-foreground font-medium mb-3">
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
              <label className="block text-foreground-v2 font-medium breathing-room-sm">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="display_name"
                value={formData.display_name}
                onChange={handleInputChange}
                required
                maxLength={50}
                className="input-v2 w-full"
                placeholder="Your full name"
              />
            </div>

            {/* Handle */}
            <div>
              <label className="block text-foreground-v2 font-medium breathing-room-sm">
                Handle (Username)
              </label>
              <div className="flex items-center icon-text-aligned">
                <span className="text-secondary-v2 mr-2">@</span>
                <input
                  type="text"
                  name="handle"
                  value={formData.handle}
                  onChange={handleInputChange}
                  maxLength={30}
                  pattern="[a-zA-Z0-9_]+"
                  className="input-v2 flex-1"
                  placeholder="your_username"
                />
              </div>
              <p className="text-secondary-v2 text-xs breathing-room-xs">
                Letters, numbers, and underscores only. This will be your profile URL.
              </p>
            </div>

            {/* Headline */}
            <div>
              <label className="block text-foreground-v2 font-medium breathing-room-sm">
                Headline
              </label>
              <input
                type="text"
                name="headline"
                value={formData.headline}
                onChange={handleInputChange}
                maxLength={100}
                className="input-v2 w-full"
                placeholder="e.g., Founder • BANIBS"
              />
              <p className="text-secondary-v2 text-xs breathing-room-xs">
                A short one-liner about you
              </p>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-foreground-v2 font-medium breathing-room-sm">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                maxLength={300}
                rows={4}
                className="input-v2 textarea-v2 w-full"
                placeholder="Tell the community about yourself..."
              />
              <p className="text-secondary-v2 text-xs breathing-room-xs">
                {formData.bio.length}/300 characters
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-foreground-v2 font-medium breathing-room-sm">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                maxLength={100}
                className="input-v2 w-full"
                placeholder="e.g., Atlanta, GA"
              />
            </div>

            {/* Interests */}
            <div>
              <label className="block text-foreground-v2 font-medium breathing-room-sm">
                Interests & Tags
              </label>
              <div className="flex gap-2 breathing-room-sm">
                <input
                  type="text"
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddInterest(e)}
                  className="input-v2 flex-1"
                  placeholder="Add an interest..."
                />
                <button
                  type="button"
                  onClick={handleAddInterest}
                  className="btn-v2 btn-v2-primary btn-v2-md"
                >
                  Add
                </button>
              </div>
              {formData.interests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest, idx) => (
                    <span 
                      key={idx}
                      className="toggle-v2 active flex items-center gap-2"
                    >
                      {interest}
                      <button
                        type="button"
                        onClick={() => handleRemoveInterest(interest)}
                        className="hover:opacity-70"
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
                className="w-5 h-5 text-amber-600 bg-input border-border rounded focus:ring-amber-500"
              />
              <label htmlFor="is_public" className="text-foreground">
                Make profile public
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={saving || !formData.display_name}
                className="btn-v2 btn-v2-primary btn-v2-lg flex-1"
              >
                {saving ? 'Saving...' : 'Save Profile'}
              </button>
              <Link
                to="/portal/social"
                className="btn-v2 btn-v2-secondary btn-v2-lg text-center"
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
