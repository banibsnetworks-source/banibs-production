import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ProfileAvatar } from '../../components/social/ProfileAvatar';
import SocialPostCard from '../../components/social/SocialPostCard';
import SocialLayout from '../../components/social/SocialLayout';

const SocialProfilePublicPage = () => {
  const { handle } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Phase 9.1 - Posts Tab (get initial tab from URL)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'about');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);

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
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    if (handle) {
      loadProfile();
    }
  }, [handle]);

  // Phase 9.1 - Load user posts when Posts tab is active
  useEffect(() => {
    if (activeTab === 'posts' && profile?.user_id) {
      loadUserPosts(1);
    }
  }, [activeTab, profile]);

  const loadUserPosts = async (page) => {
    setPostsLoading(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/social/users/${profile.user_id}/posts?page=${page}&page_size=10`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        }
      );
      
      // Clone response BEFORE any operation to avoid "body already used" error
      const clonedResponse = response.clone();
      
      if (!clonedResponse.ok) {
        throw new Error('Failed to load posts');
      }
      
      // Parse JSON using the cloned response
      const data = await clonedResponse.json();
      
      if (page === 1) {
        setPosts(data.items);
      } else {
        setPosts(prev => [...prev, ...data.items]);
      }
      
      setPostsPage(page);
      setPostsTotalPages(data.total_pages);
    } catch (err) {
      console.error('Error loading user posts:', err);
    } finally {
      setPostsLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (postsPage < postsTotalPages && !postsLoading) {
      loadUserPosts(postsPage + 1);
    }
  };

  if (loading) {
    return (
      <SocialLayout>
        <div className="min-h-screen" style={{ paddingTop: '20px', background: '#0B0B0B' }}>
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

  if (error || !profile) {
    return (
      <SocialLayout>
        <div className="min-h-screen" style={{ paddingTop: '20px', background: '#0B0B0B' }}>
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
      </SocialLayout>
    );
  }

  return (
    <SocialLayout>
      <div className="min-h-screen" style={{ paddingTop: '20px', background: '#0B0B0B' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
          {/* Back Button */}
          <Link 
            to="/portal/social" 
            className="inline-flex items-center text-amber-400 hover:text-amber-300 transition-colors text-sm"
          >
            ← Back to Feed
          </Link>

          {/* Profile Header with Cover Image */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Cover Image */}
            {profile.cover_url && (
              <div className="w-full h-48 sm:h-60 md:h-72 overflow-hidden bg-gray-900">
                <img 
                  src={`${process.env.REACT_APP_BACKEND_URL}${profile.cover_url}`}
                  alt="Profile cover" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Profile Info */}
            <div className="p-6 sm:p-8">
              <div className="flex items-start gap-6 flex-col sm:flex-row">
                {/* Avatar overlaps cover if cover exists */}
                <div className={profile.cover_url ? "-mt-16 sm:-mt-20" : ""}>
                  <ProfileAvatar 
                    name={profile.display_name} 
                    avatarUrl={profile.avatar_url}
                    size="xl"
                  />
                </div>
                
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
          </div>

          {/* Tabs - Phase 9.1 */}
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => {
                  setActiveTab('about');
                  setSearchParams({});
                }}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'about'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                About
              </button>
              <button
                onClick={() => {
                  setActiveTab('posts');
                  setSearchParams({ tab: 'posts' });
                }}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === 'posts'
                    ? 'text-amber-400 border-b-2 border-amber-400'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Posts {profile.post_count !== undefined && `(${profile.post_count})`}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  {/* Bio */}
                  {profile.bio && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Bio</h3>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-3">Interests</h3>
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

                  {/* Empty state for About */}
                  {!profile.bio && (!profile.interests || profile.interests.length === 0) && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-3">📝</div>
                      <p className="text-gray-400 text-sm">
                        No bio or interests added yet
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="space-y-4">
                  {postsLoading && posts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent mx-auto mb-3"></div>
                      <p className="text-gray-400 text-sm">Loading posts...</p>
                    </div>
                  ) : posts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-4xl mb-3">📝</div>
                      <p className="text-gray-400 text-sm">
                        No posts yet
                      </p>
                    </div>
                  ) : (
                    <>
                      {posts.map(post => (
                        <SocialPostCard
                          key={post.id}
                          post={post}
                          compact={true}
                          onUpdate={(updatedPost) => {
                            setPosts(prev => prev.map(p => 
                              p.id === updatedPost.id ? updatedPost : p
                            ));
                          }}
                        />
                      ))}

                      {/* Load More Button */}
                      {postsPage < postsTotalPages && (
                        <div className="text-center pt-4">
                          <button
                            onClick={handleLoadMore}
                            disabled={postsLoading}
                            className="px-6 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {postsLoading ? 'Loading...' : 'Load More'}
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
    </SocialLayout>
  );
};

export default SocialProfilePublicPage;
