import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileAvatar } from '../../components/social/ProfileAvatar';
import AvatarUploader from '../../components/social/AvatarUploader';
import CoverUploader from '../../components/social/CoverUploader';
import ProfileStatsStrip from '../../components/profile/ProfileStatsStrip';
import SocialLayout from '../../components/social/SocialLayout';
import { MapPin, Link as LinkIcon, Edit3, Check, X, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * BANIBS Social Profile Page
 * 
 * Identity-first design:
 * - Profile photo and identity at top (read-only view)
 * - Edit section collapsed by default
 * - Professional, modern appearance
 */
const SocialProfileEditPage = () => {
  const { user, updateUserAvatar, refreshUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
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
        // Use XMLHttpRequest to bypass rrweb "Response body already used" error
        const data = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/me`, true);
          xhr.withCredentials = true;
          
          const token = localStorage.getItem('access_token');
          if (token) {
            xhr.setRequestHeader('Authorization', `Bearer ${token}`);
          }
          
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                resolve(JSON.parse(xhr.responseText));
              } catch (e) {
                reject(new Error('Failed to parse profile data'));
              }
            } else {
              reject(new Error('Failed to load profile'));
            }
          };
          
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.send();
        });
        
        setProfile(data);
        setFormData({
          display_name: data?.display_name || '',
          handle: data?.handle || '',
          headline: data?.headline || '',
          bio: data?.bio || '',
          location: data?.location || '',
          interests: data?.interests || [],
          is_public: data?.is_public !== false
        });
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
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
      // Use XMLHttpRequest to bypass rrweb "Response body already used" error
      const updatedProfile = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PATCH', `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/me`, true);
        xhr.withCredentials = true;
        xhr.setRequestHeader('Content-Type', 'application/json');
        
        const token = localStorage.getItem('access_token');
        if (token) {
          xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        }
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              resolve(null);
            }
          } else {
            let errorMsg = 'Failed to update profile';
            try {
              const errData = JSON.parse(xhr.responseText);
              errorMsg = errData.detail || errorMsg;
            } catch (e) {}
            reject(new Error(errorMsg));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send(JSON.stringify(formData));
      });
      
      if (updatedProfile) {
        setProfile(updatedProfile);
        // Update form data with returned values
        setFormData(prev => ({
          ...prev,
          display_name: updatedProfile.display_name || prev.display_name,
          handle: updatedProfile.handle || prev.handle,
          headline: updatedProfile.headline || prev.headline,
          bio: updatedProfile.bio || prev.bio,
          location: updatedProfile.location || prev.location,
          interests: updatedProfile.interests || prev.interests,
          is_public: updatedProfile.is_public !== undefined ? updatedProfile.is_public : prev.is_public
        }));
      }
      setSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    // Reset form data to profile values
    if (profile) {
      setFormData({
        display_name: profile.display_name || '',
        handle: profile.handle || '',
        headline: profile.headline || '',
        bio: profile.bio || '',
        location: profile.location || '',
        interests: profile.interests || [],
        is_public: profile.is_public !== false
      });
    }
    setIsEditing(false);
    setError(null);
  };

  const reloadProfile = async () => {
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
      
      // Read body exactly once
      const responseText = await response.text();
      let data = null;
      try {
        data = responseText ? JSON.parse(responseText) : null;
      } catch (e) {
        // Not JSON
      }
      
      if (response.ok && data) {
        setProfile(data);
        if (data.avatar_url) {
          updateUserAvatar(data.avatar_url);
        }
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error reloading profile:', err);
    }
  };

  if (loading) {
    return (
      <SocialLayout>
        <div className="min-h-screen bg-background" data-testid="profile-loading">
          <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
              <div className="w-48 h-6 bg-muted animate-pulse rounded" />
              <div className="w-32 h-4 bg-muted animate-pulse rounded" />
            </div>
          </div>
        </div>
      </SocialLayout>
    );
  }

  const avatarUrl = profile?.avatar_url 
    ? (profile.avatar_url.startsWith('http') ? profile.avatar_url : `${process.env.REACT_APP_BACKEND_URL}${profile.avatar_url}`)
    : null;

  const coverUrl = profile?.cover_url 
    ? (profile.cover_url.startsWith('http') ? profile.cover_url : `${process.env.REACT_APP_BACKEND_URL}${profile.cover_url}`)
    : null;

  return (
    <SocialLayout>
      <div className="min-h-screen bg-background" data-testid="profile-page">
        {/* Cover Image Area - Responsive height for all screen widths */}
        <div 
          className="w-full relative"
          style={{
            height: 'clamp(180px, 22vh, 320px)',
            background: coverUrl 
              ? `url(${coverUrl}) center/cover no-repeat`
              : 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
          }}
        >
          {/* Subtle overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>

        {/* Profile Header - Identity First */}
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          {/* Avatar - Overlapping cover with responsive offset */}
          <div className="relative mb-4" style={{ marginTop: 'clamp(-64px, -8vw, -80px)' }}>
            <div className="flex items-end justify-between">
              {/* Avatar */}
              <div className="relative">
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-background bg-background overflow-hidden shadow-lg">
                  {avatarUrl ? (
                    <img 
                      src={avatarUrl} 
                      alt={profile?.display_name || 'Profile'} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-4xl sm:text-5xl font-semibold">
                      {(profile?.display_name || 'U')[0].toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden sm:flex items-center gap-2 pb-2">
                {profile?.handle && (
                  <Link 
                    to={`/portal/social/u/${profile.handle}`}
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    View Public Profile
                  </Link>
                )}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                    isEditing 
                      ? 'bg-muted text-foreground' 
                      : 'bg-foreground text-background hover:bg-foreground/90'
                  }`}
                >
                  <Edit3 size={14} />
                  {isEditing ? 'Cancel Editing' : 'Edit Profile'}
                </button>
              </div>
            </div>
          </div>

          {/* Identity Info */}
          <div className="mb-6">
            {/* Name & Handle */}
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {profile?.display_name || 'BANIBS Member'}
            </h1>
            {profile?.handle && (
              <p className="text-amber-600 dark:text-amber-400 text-sm font-medium mb-2">
                @{profile.handle}
              </p>
            )}

            {/* Headline */}
            {profile?.headline && (
              <p className="text-muted-foreground text-base mb-3">
                {profile.headline}
              </p>
            )}

            {/* Bio */}
            {profile?.bio && (
              <p className="text-foreground/80 text-sm leading-relaxed mb-3">
                {profile.bio}
              </p>
            )}

            {/* Location & Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {profile?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin size={14} />
                  {profile.location}
                </span>
              )}
              {profile?.handle && (
                <span className="flex items-center gap-1.5">
                  <LinkIcon size={14} />
                  banibs.com/u/{profile.handle}
                </span>
              )}
            </div>

            {/* Interests Tags */}
            {profile?.interests && profile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.interests.map((interest, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 text-xs font-medium bg-muted text-muted-foreground rounded-full"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Mobile Edit Button */}
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                isEditing 
                  ? 'bg-muted text-foreground border border-border' 
                  : 'bg-foreground text-background'
              }`}
            >
              <Edit3 size={14} />
              {isEditing ? 'Cancel Editing' : 'Edit Profile'}
            </button>
          </div>

          {/* Stats Strip */}
          {user && (
            <div className="mb-6">
              <ProfileStatsStrip userId={user.id} />
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="mb-4 px-4 py-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Check size={16} />
                Profile updated successfully
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                <X size={16} />
                {error}
              </p>
            </div>
          )}

          {/* Edit Section - Collapsible */}
          {isEditing && (
            <div className="pb-8 animate-in slide-in-from-top-4 duration-300">
              <div className="border border-border rounded-xl bg-card overflow-hidden">
                {/* Section Header */}
                <div className="px-5 py-4 border-b border-border bg-muted/30">
                  <h2 className="text-lg font-semibold text-foreground">Edit Profile</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">Update your profile information</p>
                </div>

                <form onSubmit={handleSubmit} className="p-5 space-y-5">
                  {/* Avatar Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Profile Photo
                    </label>
                    <AvatarUploader
                      key={profile?.avatar_url || 'no-avatar'}
                      initialUrl={avatarUrl}
                      onUploaded={reloadProfile}
                      size="lg"
                    />
                  </div>

                  {/* Cover Upload */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Cover Image
                    </label>
                    <CoverUploader
                      key={profile?.cover_url || 'no-cover'}
                      initialUrl={coverUrl}
                      onUploaded={reloadProfile}
                    />
                  </div>

                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Display Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="display_name"
                      value={formData.display_name}
                      onChange={handleInputChange}
                      required
                      maxLength={50}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Handle */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Username
                    </label>
                    <div className="flex items-center">
                      <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border border-r-0 border-border rounded-l-lg">@</span>
                      <input
                        type="text"
                        name="handle"
                        value={formData.handle}
                        onChange={handleInputChange}
                        maxLength={30}
                        pattern="[a-zA-Z0-9_]+"
                        className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-r-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                        placeholder="your_username"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Letters, numbers, and underscores only
                    </p>
                  </div>

                  {/* Headline */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Headline
                    </label>
                    <input
                      type="text"
                      name="headline"
                      value={formData.headline}
                      onChange={handleInputChange}
                      maxLength={100}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      placeholder="Entrepreneur • Creator • Builder"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Bio
                    </label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      maxLength={300}
                      rows={3}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none"
                      placeholder="Tell the community about yourself..."
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-right">
                      {formData.bio.length}/300
                    </p>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      maxLength={100}
                      className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                      placeholder="Atlanta, GA"
                    />
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Interests
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={interestInput}
                        onChange={(e) => setInterestInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddInterest(e)}
                        className="flex-1 px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                        placeholder="Add an interest..."
                      />
                      <button
                        type="button"
                        onClick={handleAddInterest}
                        className="px-4 py-2 text-sm font-medium bg-muted text-foreground border border-border rounded-lg hover:bg-muted/80 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    {formData.interests.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.interests.map((interest, idx) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full"
                          >
                            {interest}
                            <button
                              type="button"
                              onClick={() => handleRemoveInterest(interest)}
                              className="hover:text-amber-800 dark:hover:text-amber-200"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Public Toggle */}
                  <div className="flex items-center gap-3 py-2">
                    <input
                      type="checkbox"
                      id="is_public"
                      name="is_public"
                      checked={formData.is_public}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-amber-600 bg-background border-border rounded focus:ring-amber-500"
                    />
                    <label htmlFor="is_public" className="text-sm text-foreground">
                      Make profile visible to everyone
                    </label>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving || !formData.display_name}
                      className="flex-1 px-4 py-2.5 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-4 py-2.5 text-sm font-medium text-muted-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Quick Links - When not editing */}
          {!isEditing && profile?.handle && (
            <div className="pb-8">
              <div className="flex flex-wrap gap-3">
                <Link 
                  to="/portal/social/profile/theme"
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  Customize Theme
                </Link>
                <Link 
                  to={`/portal/social/u/${profile.handle}?tab=posts`}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground border border-border rounded-lg hover:bg-muted transition-colors"
                >
                  My Posts
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </SocialLayout>
  );
};

export default SocialProfileEditPage;
