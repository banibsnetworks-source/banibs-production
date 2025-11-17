import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Filter } from 'lucide-react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessBoardComposer from '../../components/business/BusinessBoardComposer';
import BusinessBoardPostCard from '../../components/business/BusinessBoardPostCard';
import './BusinessBoardPage.css';

const CATEGORIES = [
  { value: '', label: 'All Posts' },
  { value: 'hiring', label: 'Hiring' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'funding', label: 'Funding' },
  { value: 'event', label: 'Event' },
  { value: 'service', label: 'Service' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'opportunity', label: 'Opportunity' }
];

const BusinessBoardPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showComposer, setShowComposer] = useState(false);
  const [hasBusiness, setHasBusiness] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    checkBusinessProfile();
    loadPosts();
  }, [selectedCategory]);

  const checkBusinessProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setHasBusiness(false);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setHasBusiness(response.ok);
    } catch (error) {
      setHasBusiness(false);
    }
  };

  const loadPosts = async (pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        page_size: '20'
      });

      if (selectedCategory) {
        params.append('category', selectedCategory);
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/board?${params}`
      );

      if (response.ok) {
        const data = await response.json();
        setPosts(pageNum === 1 ? data.items : [...posts, ...data.items]);
        setHasMore(data.page < data.total_pages);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Failed to load posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setShowComposer(false);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setPosts([]);
    setPage(1);
  };

  return (
    <div className="business-board-container">
      <GlobalNavBar />
      {/* Header */}
      <div className="board-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Business Board</h1>
            <p>Connect, collaborate, and grow your business</p>
          </div>
          {hasBusiness && (
            <button
              className="create-post-btn"
              onClick={() => setShowComposer(true)}
            >
              <Plus size={20} />
              Create Post
            </button>
          )}
          {!hasBusiness && (
            <button
              className="create-business-btn"
              onClick={() => navigate('/portal/business/profile/edit')}
            >
              Create Business Profile
            </button>
          )}
        </div>

        {/* Category Filter */}
        <div className="category-filter">
          <Filter size={18} />
          <div className="category-pills">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                className={`category-pill ${selectedCategory === cat.value ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat.value)}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="board-feed">
        {loading && posts.length === 0 ? (
          <div className="loading-state">
            <Loader2 size={32} className="spinner" />
            <p>Loading posts...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="empty-state">
            <h3>No posts yet</h3>
            <p>Be the first to share an opportunity on the Business Board!</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <BusinessBoardPostCard key={post.id} post={post} />
            ))}

            {hasMore && (
              <button
                className="load-more-btn"
                onClick={() => loadPosts(page + 1)}
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 size={18} className="spinner" /> Loading...</>
                ) : (
                  'Load More'
                )}
              </button>
            )}
          </>
        )}
      </div>

      {/* Composer Modal */}
      {showComposer && (
        <BusinessBoardComposer
          isOpen={showComposer}
          onClose={() => setShowComposer(false)}
          onPostCreated={handlePostCreated}
        />
      )}
    </div>
  );
};

export default BusinessBoardPage;
