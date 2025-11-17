import React, { useEffect, useState } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProfileAvatar } from '../../components/social/ProfileAvatar';
import SocialPostCard from '../../components/social/SocialPostCard';
import SocialLayout from '../../components/social/SocialLayout';
import ProfileCommandCenter from '../../components/profile/ProfileCommandCenter';
import AddToPeoplesButton from '../../components/social/AddToPeoplesButton';
import { peoplesApi } from '../../services/phase83Api';
import { Settings } from 'lucide-react';

const SocialProfilePublicPage = () => {
  const { handle } = useParams();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Phase 9.1 - Posts Tab (get initial tab from URL) - Default to Posts
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'posts');
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsPage, setPostsPage] = useState(1);
  const [postsTotalPages, setPostsTotalPages] = useState(1);
  
  // Phase 8.1 - Profile Command Center
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const [profileDraft, setProfileDraft] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  // Phase 8.3 - Peoples Tab
  const [peoples, setPeoples] = useState([]);
  const [peoplesLoading, setPeoplesLoading] = useState(false);
  const [peoplesCount, setPeoplesCount] = useState(0);
  
  const isOwnProfile = user && profile && user.id === profile.user_id;

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

  // Phase 8.3 - Load user peoples when Peoples tab is active
  useEffect(() => {
    if (activeTab === 'peoples' && profile?.user_id) {
      loadUserPeoples();
    }
  }, [activeTab, profile]);

  const loadUserPeoples = async () => {
    setPeoplesLoading(true);
    
    try {
      const [peoplesList, stats] = await Promise.all([
        peoplesApi.getUserPeoples(profile.user_id),
        peoplesApi.getPeoplesStats(profile.user_id)
      ]);
      
      setPeoples(peoplesList);
      setPeoplesCount(stats.peoples_count);
    } catch (error) {
      console.error('Failed to load peoples:', error);
    } finally {
      setPeoplesLoading(false);
    }
  };

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
          <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden relative">
            {/* Cover Image - Phase 8.1 Enhanced */}
            {(profile.banner_image_url || profile.cover_url) && (
              <div className="w-full h-48 sm:h-60 md:h-72 overflow-hidden bg-gray-900">
                <img 
                  src={profile.banner_image_url ? `${process.env.REACT_APP_BACKEND_URL}${profile.banner_image_url}` : `${process.env.REACT_APP_BACKEND_URL}${profile.cover_url}`}
                  alt="Profile banner" 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Action Buttons - Phase 8.1 & Phase 8.3 */}
            {isOwnProfile ? (
              <button
                onClick={() => setCommandCenterOpen(true)}
                className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 text-white rounded-full transition-all shadow-lg"
                style={{ backgroundColor: profile.accent_color || '#3B82F6' }}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>
            ) : user && profile.user_id && (
              <div className="absolute top-4 right-4 z-10">
                <AddToPeoplesButton 
                  targetUserId={profile.user_id}
                  accentColor={profile.accent_color || '#3B82F6'}
                />
              </div>
            )}
            
            {/* Profile Info - Phase 8.1 Enhanced */}
            <div className="px-6 pt-8 pb-6">
              <div className="flex items-start gap-6 flex-col sm:flex-row">
                {/* Avatar - Phase 8.1 with Accent Ring */}
                <div className={profile.cover_url || profile.banner_image_url ? "-mt-16 sm:-mt-20" : ""}>
                  {(profile.profile_picture_url || profile.avatar_url) ? (
                    <div className="relative">
                      <img
                        src={profile.profile_picture_url ? `${process.env.REACT_APP_BACKEND_URL}${profile.profile_picture_url}` : profile.avatar_url}
                        alt={profile.display_name}
                        className="w-28 h-28 sm:w-36 sm:h-36 rounded-full object-cover shadow-lg"
                        style={{
                          border: `4px solid ${profile.accent_color || '#3B82F6'}`
                        }}
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-gray-900 text-4xl sm:text-5xl font-bold shadow-lg"
                      style={{
                        border: `4px solid ${profile.accent_color || '#3B82F6'}`
                      }}
                    >
                      {(profile.display_name || '?')[0].toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground mb-1">
                      {profile.display_name}
                    </h1>
                    {profile.handle && (
                      <div className="text-yellow-600 dark:text-yellow-400 text-sm">
                        @{profile.handle}
                      </div>
                    )}
                  </div>
                  
                  {profile.headline && (
                    <div className="text-muted-foreground font-medium">
                      {profile.headline}
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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
                  setActiveTab('peoples');
                  setSearchParams({ tab: 'peoples' });
                }}
                className={`px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'peoples'
                    ? 'text-yellow-500 border-b-2 border-yellow-500'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                My Peoples {peoplesCount > 0 && `(${peoplesCount})`}
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
              {/* Peoples Tab - Phase 8.3 */}
              {activeTab === 'peoples' && (
                <div className="space-y-4">
                  {peoplesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mx-auto mb-3"></div>
                      <p className="text-muted-foreground text-sm">Loading peoples...</p>
                    </div>
                  ) : peoples.length === 0 ? (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                        <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">No Peoples Yet</h3>
                      <p className="text-muted-foreground">
                        {isOwnProfile 
                          ? "You haven't added anyone to your peoples yet. Connect with others in the community!"
                          : "This user hasn't added anyone to their peoples yet."}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {peoples.map((person) => (
                        <Link
                          key={person.user_id}
                          to={`/social/profile/u/${person.user_id}`}
                          className="bg-background border border-border rounded-lg p-4 hover:border-yellow-500 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {person.avatar_url ? (
                              <img
                                src={person.avatar_url}
                                alt={person.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-white text-lg font-bold">
                                {person.name[0].toUpperCase()}
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-foreground truncate">{person.name}</div>
                              {person.bio && (
                                <div className="text-xs text-muted-foreground truncate">{person.bio}</div>
                              )}
                              <div className="text-xs text-muted-foreground mt-1">
                                Added {new Date(person.added_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  {/* Bio */}
                  {profile.bio && (
                    <div>
                      <h3 className="text-foreground font-semibold mb-3">Bio</h3>
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Interests */}
                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <h3 className="text-foreground font-semibold mb-3">Interests</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, idx) => (
                          <span 
                            key={idx}
                            className="px-3 py-1 bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 rounded-full text-sm font-medium"
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
                      <p className="text-muted-foreground text-sm">
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

              {/* Media Tab - Filtered Posts with Media */}
              {activeTab === 'media' && (
                <div className="space-y-4">
                  {(() => {
                    // Filter posts that have media (images or videos)
                    const mediaPosts = posts.filter(post => 
                      post.media_urls && post.media_urls.length > 0
                    );
                    
                    if (postsLoading && mediaPosts.length === 0) {
                      return (
                        <div className="text-center py-12">
                          <div className="animate-spin rounded-full h-8 w-8 border-2 border-yellow-500 border-t-transparent mx-auto mb-3"></div>
                          <p className="text-muted-foreground text-sm">Loading media...</p>
                        </div>
                      );
                    }
                    
                    if (mediaPosts.length === 0) {
                      return (
                        <div className="text-center py-16">
                          <div className="w-20 h-20 rounded-full bg-yellow-500/10 flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">No Media Yet</h3>
                          <p className="text-muted-foreground">
                            {profile.user_id === user?.id 
                              ? "You haven't shared any media yet. Add images or videos to your posts to see them here."
                              : "This user hasn't shared any media yet."}
                          </p>
                        </div>
                      );
                    }
                    
                    return (
                      <>
                        {mediaPosts.map(post => (
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
                        
                        {/* Show hint if there are more posts to load */}
                        {postsPage < postsTotalPages && mediaPosts.length < posts.length && (
                          <div className="text-center pt-4">
                            <button
                              onClick={handleLoadMore}
                              disabled={postsLoading}
                              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {postsLoading ? 'Loading...' : 'Load More Posts'}
                            </button>
                            <p className="text-xs text-muted-foreground mt-2">
                              Loading more posts may reveal more media
                            </p>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Business Tab - BBN Integration CTA */}
              {activeTab === 'business' && (
                <div>
                  {/* Check if user has business profile (future: profile.businessProfileId) */}
                  {false ? (
                    // Future: When user has a business profile
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-1">Business Name</h3>
                          <p className="text-sm text-muted-foreground mb-3">Category • Location</p>
                          <a href="/business/profile/123" className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-600 transition-colors text-sm">
                            View Business Profile →
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // CTA for users without business profile
                    <div className="text-center py-16">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        {profile.user_id === user?.id 
                          ? "Turn Your BANIBS Profile Into a Business Presence"
                          : "No Business Profile Yet"}
                      </h3>
                      
                      <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                        {profile.user_id === user?.id 
                          ? "Connect your social presence to the BANIBS Business Network. Showcase your business, get discovered by customers, and build trust through verified business signals."
                          : "This user hasn't created a business profile yet. Once they do, you'll be able to view their business information, services, and contact details here."}
                      </p>
                      
                      {profile.user_id === user?.id && (
                        <div className="space-y-6">
                          <button
                            onClick={() => {
                              // Future: Navigate to BBN business profile creation
                              alert('Business profile creation coming soon! This will connect to the BANIBS Business Network.');
                            }}
                            className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-600 transition-all shadow-lg hover:shadow-xl"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Create Business Profile
                          </button>
                          
                          <div className="bg-muted/50 rounded-xl p-6 max-w-md mx-auto text-left">
                            <p className="text-sm font-semibold text-foreground mb-3">What you'll get:</p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              <li className="flex items-start gap-2">
                                <span className="text-yellow-500 font-bold">✓</span>
                                <span>Business listing in BANIBS Directory</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-yellow-500 font-bold">✓</span>
                                <span>Verified business badge and signals</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-yellow-500 font-bold">✓</span>
                                <span>Showcase services, hours, and contact info</span>
                              </li>
                              <li className="flex items-start gap-2">
                                <span className="text-yellow-500 font-bold">✓</span>
                                <span>Connect with customers in your community</span>
                              </li>
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </div>
      
      {/* Phase 8.1 - Profile Command Center */}
      {isOwnProfile && (
        <ProfileCommandCenter
          isOpen={commandCenterOpen}
          onClose={() => {
            setCommandCenterOpen(false);
            setProfileDraft(null);
          }}
          mode="social"
          profile={profileDraft || profile}
          onProfileChange={setProfileDraft}
          onSave={async () => {
            if (!profileDraft) {
              setCommandCenterOpen(false);
              return;
            }
            
            try {
              setIsSavingProfile(true);
              
              // Update backend via unified auth profile endpoint
              const token = localStorage.getItem('access_token');
              const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/auth/profile`,
                {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    profile_picture_url: profileDraft.profile_picture_url,
                    banner_image_url: profileDraft.banner_image_url,
                    accent_color: profileDraft.accent_color,
                  }),
                }
              );
              
              if (response.ok) {
                // Update local state
                setProfile(prev => ({ ...prev, ...profileDraft }));
                setProfileDraft(null);
                setCommandCenterOpen(false);
              } else {
                alert('Failed to save profile changes');
              }
            } catch (error) {
              console.error('Error saving profile:', error);
              alert('Failed to save profile changes');
            } finally {
              setIsSavingProfile(false);
            }
          }}
          isSaving={isSavingProfile}
        />
      )}
    </SocialLayout>
  );
};

export default SocialProfilePublicPage;
