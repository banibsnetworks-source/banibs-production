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
      
      // Use XMLHttpRequest to bypass platform's rrweb fetch interceptor
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${process.env.REACT_APP_BACKEND_URL}/api/social/users/${profile.user_id}/posts?page=${page}&page_size=10`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.withCredentials = true;
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          } else {
            reject(new Error('Failed to load posts'));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send();
      });
      
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

          {/* Tabs - Enhanced with Media & Business */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            {/* Tab Navigation */}
            <div className="flex border-b border-border overflow-x-auto">
              <button
                onClick={() => {
                  setActiveTab('posts');
                  setSearchParams({ tab: 'posts' });
                }}
                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'posts'
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Posts {profile.post_count !== undefined && `(${profile.post_count})`}
              </button>
              <button
                onClick={() => {
                  setActiveTab('media');
                  setSearchParams({ tab: 'media' });
                }}
                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'media'
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Media
              </button>
              <button
                onClick={() => {
                  setActiveTab('business');
                  setSearchParams({ tab: 'business' });
                }}
                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'business'
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Business
              </button>
              <button
                onClick={() => {
                  setActiveTab('about');
                  setSearchParams({});
                }}
                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'about'
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                About
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

              {/* Media Tab - Coming Soon */}
              {activeTab === 'media' && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Media Gallery</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Coming soon! Your photos and videos will appear here in a beautiful grid layout.
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                    In Development
                  </div>
                </div>
              )}

              {/* Business Tab - Coming Soon */}
              {activeTab === 'business' && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">Business Profile</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Connect your social presence to your BANIBS Business Profile. Showcase your business, services, and connect with customers.
                  </p>
                  <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-lg text-sm text-muted-foreground">
                      <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                      Coming Soon
                    </div>
                    <div className="text-sm text-muted-foreground max-w-sm mx-auto">
                      <strong className="text-foreground">Future Features:</strong>
                      <ul className="mt-2 space-y-1 text-left">
                        <li>→ Link to your Business Directory listing</li>
                        <li>→ Display business hours & contact info</li>
                        <li>→ Showcase products & services</li>
                        <li>→ Create business profile if you don't have one</li>
                      </ul>
                    </div>
                  </div>
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
