import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ProfileAvatar } from '../../components/social/ProfileAvatar';

const SocialProfilePublicPage = () => {
  const { handle } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/social/profile/u/${handle}`,
          { credentials: 'include' }
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Profile not found');
          }
          throw new Error('Failed to load profile');
        }
        
        const data = await response.json();
        setProfile(data);
      } catch (err) {
        console.error('Error loading profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    if (handle) {
      loadProfile();
    }
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center py-12">
              <div className="text-gray-400">Loading profile...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gray-800 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">😕</div>
              <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
              <p className="text-gray-400 mb-6">
                {error || 'The profile you\'re looking for doesn\'t exist or is not public.'}
              </p>
              <Link 
                to="/portal/social" 
                className="inline-block px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Back to Social Feed
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back Button */}
          <Link 
            to="/portal/social" 
            className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors text-sm"
          >
            ← Back to Feed
          </Link>

          {/* Profile Header */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 p-8">
            <div className="flex items-start gap-6 flex-col sm:flex-row">
              <ProfileAvatar 
                name={profile.display_name} 
                avatarUrl={profile.avatar_url}
                size="xl"
              />
              
              <div className="flex-1 space-y-3">
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {profile.display_name}
                  </h1>
                  {profile.handle && (
                    <div className="text-amber-400 text-sm">
                      @{profile.handle}
                    </div>
                  )}
                </div>
                
                {profile.headline && (
                  <div className="text-gray-300 font-medium">
                    {profile.headline}
                  </div>
                )}
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <span>📍</span>
                      <span>{profile.location}</span>
                    </div>
                  )}
                  {profile.joined_at && (
                    <div className="flex items-center gap-1">
                      <span>📅</span>
                      <span>Joined {new Date(profile.joined_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                    </div>
                  )}
                  {profile.post_count !== undefined && (
                    <div className="flex items-center gap-1">
                      <span>✍️</span>
                      <span>{profile.post_count} {profile.post_count === 1 ? 'post' : 'posts'}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <h2 className="text-white font-semibold mb-3">About</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Interests Section */}
          {profile.interests && profile.interests.length > 0 && (
            <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
              <h2 className="text-white font-semibold mb-3">Interests</h2>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, idx) => (
                  <span 
                    key={idx}
                    className="px-3 py-1 bg-amber-600/20 text-amber-400 rounded-full text-sm font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Posts Section - Placeholder for Phase 9.1 */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 p-6">
            <h2 className="text-white font-semibold mb-3">Recent Posts</h2>
            <div className="text-center py-8">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-gray-400 text-sm">
                User posts will be displayed here in Phase 9.1
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProfilePublicPage;
