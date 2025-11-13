import React, { useState, useEffect } from 'react';
import { RefreshCw, Loader, AlertCircle } from 'lucide-react';
import SocialPostCard from './SocialPostCard';

/**
 * SocialFeed - Phase 8.3
 * Main feed component that displays paginated social posts
 */
const SocialFeed = ({ newPost }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Load initial feed with small delay to ensure auth is ready
  useEffect(() => {
    const timer = setTimeout(() => {
      // Check if token exists before loading
      const token = localStorage.getItem('access_token');
      if (token) {
        loadFeed();
      } else {
        setError('Authentication required. Please log in.');
        setLoading(false);
      }
    }, 300); // Increased delay to ensure token is set
    return () => clearTimeout(timer);
  }, []);

  // Add new post to top of feed
  useEffect(() => {
    if (newPost) {
      setPosts([newPost, ...posts]);
    }
  }, [newPost]);

  const loadFeed = async (pageNum = 1, append = false) => {
    if (!append) {
      setLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    setError(null);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in.');
      }
      
      // Use XMLHttpRequest to bypass platform's rrweb fetch interceptor
      const data = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', `${process.env.REACT_APP_BACKEND_URL}/api/social/feed?page=${pageNum}&page_size=20`);
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.withCredentials = true;
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              resolve(JSON.parse(xhr.responseText));
            } catch (e) {
              reject(new Error('Failed to parse response'));
            }
          } else if (xhr.status === 401) {
            reject(new Error('Your session has expired. Please log in again.'));
          } else {
            reject(new Error(`Failed to load feed (${xhr.status})`));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        xhr.send();
      });
      
      if (append) {
        setPosts([...posts, ...data.items]);
      } else {
        setPosts(data.items);
      }
      
      setPage(pageNum);
      setHasMore(data.page < data.total_pages);
    } catch (err) {
      console.error('Error loading feed:', err);
      setError(err.message || 'Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const handleRefresh = () => {
    loadFeed(1, false);
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && hasMore) {
      loadFeed(page + 1, true);
    }
  };

  const handlePostUpdate = (updatedPost) => {
    setPosts(posts.map(p => p.id === updatedPost.id ? updatedPost : p));
  };

  const handlePostDelete = (postId) => {
    setPosts(posts.filter(p => p.id !== postId));
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader className="animate-spin text-yellow-500 mb-3" size={32} />
        <p className="text-muted-foreground text-sm">Loading your feed...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-card rounded-xl border border-red-500/30 p-6 text-center">
        <AlertCircle className="mx-auto mb-3 text-red-400" size={32} />
        <p className="text-card-foreground mb-2">Oops! Something went wrong</p>
        <p className="text-muted-foreground text-sm mb-4">{error}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <div className="bg-card rounded-xl border border-border p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            No posts yet
          </h3>
          <p className="text-muted-foreground text-sm">
            Be the first to share something with the BANIBS community!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Refresh Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Community Feed
        </h2>
        <button
          onClick={handleRefresh}
          className="flex items-center space-x-1 px-3 py-1 rounded-lg text-xs text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <RefreshCw size={14} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <SocialPostCard
            key={post.id}
            post={post}
            onUpdate={handlePostUpdate}
            onDelete={handlePostDelete}
          />
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-6 py-2 bg-card hover:bg-muted text-card-foreground rounded-lg border border-border transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingMore ? (
              <span className="flex items-center space-x-2">
                <Loader className="animate-spin" size={16} />
                <span>Loading...</span>
              </span>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
