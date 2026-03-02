import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Lock, Clock, RefreshCw } from 'lucide-react';
import { getCircleFeed } from '../../api/circleApi';
import { useAuth } from '../../contexts/AuthContext';
import SocialPostCard from '../../components/social/SocialPostCard';
import SocialPostComposer from '../../components/social/SocialPostComposer';

/**
 * CircleFeedPage - View posts targeted to a specific circle
 * Phase: Circle-Based Visibility V1
 */
const CircleFeedPage = () => {
  const { circleId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [posts, setPosts] = useState([]);
  const [circle, setCircle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch circle info
  const fetchCircleInfo = useCallback(async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/circles/${circleId}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setCircle(data);
      }
    } catch (err) {
      console.error('Failed to fetch circle info:', err);
    }
  }, [circleId]);

  // Fetch circle feed
  const fetchFeed = useCallback(async (pageNum = 1, append = false) => {
    if (!append) setLoading(true);
    setError(null);
    
    try {
      const data = await getCircleFeed(circleId, pageNum);
      
      if (append) {
        setPosts(prev => [...prev, ...(data.items || [])]);
      } else {
        setPosts(data.items || []);
      }
      
      setHasMore(pageNum < data.total_pages);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to fetch circle feed:', err);
      if (err.message.includes('403') || err.message.includes('member')) {
        setError('You must be a member of this circle to view its feed.');
      } else {
        setError('Failed to load circle feed. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [circleId]);

  useEffect(() => {
    fetchCircleInfo();
    fetchFeed(1);
  }, [fetchCircleInfo, fetchFeed]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFeed(1);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      fetchFeed(page + 1, true);
    }
  };

  const handlePostCreated = (newPost) => {
    // Add new post to the top if it's for this circle
    if (newPost.target_circle_id === circleId) {
      setPosts(prev => [newPost, ...prev]);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePostDelete = (deletedPostId) => {
    setPosts(prev => prev.filter(p => p.id !== deletedPostId));
  };

  // Format expiry time
  const formatExpiry = (date) => {
    if (!date) return null;
    const expires = new Date(date);
    const now = new Date();
    const diff = expires - now;
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} days remaining`;
    if (hours > 0) return `${hours} hours remaining`;
    return 'Expiring soon';
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-muted-foreground hover:text-card-foreground transition-colors mb-4"
          >
            <ArrowLeft size={18} />
            <span className="text-sm">Back</span>
          </button>
          
          {circle && (
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Users size={24} className="text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-semibold text-card-foreground">
                    {circle.name}
                  </h1>
                  {circle.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {circle.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="text-xs text-muted-foreground">
                      {circle.member_count || 0} members
                    </span>
                    {circle.is_ephemeral && circle.expires_at && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                        <Clock size={12} />
                        {formatExpiry(circle.expires_at)}
                      </span>
                    )}
                    {!circle.is_ephemeral && (
                      <span className="text-xs text-green-400">Persistent</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-card-foreground transition-colors disabled:opacity-50"
                  title="Refresh feed"
                >
                  <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Composer - Pre-select this circle */}
        {user && circle && (
          <div className="mb-6">
            <SocialPostComposer onPostCreated={handlePostCreated} />
          </div>
        )}

        {/* Loading State */}
        {loading && !refreshing && (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
            <p className="text-red-400 text-sm">{error}</p>
            <button
              onClick={() => fetchFeed(1)}
              className="mt-3 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && posts.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Users size={48} className="mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-card-foreground mb-2">
              No posts in this circle yet
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs mx-auto">
              Be the first to share something with this community!
            </p>
          </div>
        )}

        {/* Posts Feed */}
        {!loading && !error && posts.length > 0 && (
          <div className="space-y-4">
            {posts.map((post) => (
              <SocialPostCard
                key={post.id}
                post={post}
                onUpdate={handlePostUpdate}
                onDelete={handlePostDelete}
              />
            ))}

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="px-6 py-2.5 bg-muted hover:bg-muted/80 text-card-foreground rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CircleFeedPage;
