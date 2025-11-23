import React, { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import BeautyLayout from '../../components/beauty/BeautyLayout';
import BeautyPostCard from '../../components/beauty/BeautyPostCard';
import BeautyPostForm from '../../components/beauty/BeautyPostForm';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { xhrRequest } from '../../utils/xhrRequest';

const BeautyBoardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postingMode, setPostingMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  
  const categories = [
    { value: '', label: 'All Posts' },
    { value: 'tip', label: 'Tips' },
    { value: 'question', label: 'Questions' },
    { value: 'empowerment', label: 'Empowerment' },
    { value: 'recommendation', label: 'Recommendations' }
  ];
  
  useEffect(() => {
    loadPosts();
  }, [filterCategory]);
  
  const loadPosts = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/beauty/posts?`;
      if (filterCategory) url += `category=${filterCategory}`;
      
      const response = await xhrRequest(url);
      if (response.ok) {
        setPosts(response.data.posts);
      }
    } catch (err) {
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setPostingMode(false);
  };
  
  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };
  
  return (
    <BeautyLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          Beauty Board
        </h1>
        <p className="text-muted-foreground">
          Share tips, ask questions, and connect with the community
        </p>
      </div>
      
      {/* Category Filter */}
      <div className="mb-6">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>
      
      {/* Post Form */}
      {isAuthenticated ? (
        <div className="mb-6">
          {!postingMode ? (
            <button
              onClick={() => setPostingMode(true)}
              className="w-full p-4 rounded-lg border border-border bg-card hover:border-pink-500 transition-colors text-left text-muted-foreground"
            >
              Share a tip, ask a question, or spread empowerment...
            </button>
          ) : (
            <BeautyPostForm
              onPostCreated={handlePostCreated}
              onCancel={() => setPostingMode(false)}
            />
          )}
        </div>
      ) : (
        <div className="mb-6 p-6 rounded-lg border bg-pink-500/5 border-pink-500/20 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            Please sign in to post on the Beauty Board
          </p>
          <button
            onClick={() => navigate('/auth/signin')}
            className="px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors text-sm"
          >
            Sign In
          </button>
        </div>
      )}
      
      {/* Posts Feed */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-pink-500" />
        </div>
      ) : posts.length === 0 ? (
        <div className="text-center py-20">
          <MessageSquare size={48} className="text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <BeautyPostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onPostDeleted={handlePostDeleted}
            />
          ))}
        </div>
      )}
    </BeautyLayout>
  );
};

export default BeautyBoardPage;