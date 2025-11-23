import React, { useState, useEffect } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import FashionLayout from '../../components/fashion/FashionLayout';
import FashionPostCard from '../../components/fashion/FashionPostCard';
import FashionPostForm from '../../components/fashion/FashionPostForm';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { xhrRequest } from '../../utils/xhrRequest';

const FashionBoardPage = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postingMode, setPostingMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState('');
  
  const categories = [
    { value: '', label: 'All Posts' },
    { value: 'idea', label: 'Ideas' },
    { value: 'question', label: 'Questions' },
    { value: 'win', label: 'Wins' },
    { value: 'resource', label: 'Resources' }
  ];
  
  useEffect(() => {
    loadPosts();
  }, [filterCategory]);
  
  const loadPosts = async () => {
    setLoading(true);
    try {
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/fashion/posts?`;
      if (filterCategory) url += `category=${filterCategory}`;
      const response = await xhrRequest(url);
      if (response.ok) setPosts(response.data.posts);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <FashionLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">My Fashion Journey</h1>
        <p className="text-muted-foreground">Share ideas, wins, and questions with the community</p>
      </div>
      <div className="mb-6"><select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-4 py-2 rounded-lg border border-border bg-card text-foreground">{categories.map(cat => <option key={cat.value} value={cat.value}>{cat.label}</option>)}</select></div>
      {isAuthenticated ? (
        <div className="mb-6">{!postingMode ? <button onClick={() => setPostingMode(true)} className="w-full p-4 rounded-lg border border-border bg-card hover:border-blue-500 transition-colors text-left text-muted-foreground">Share an idea, win, or question...</button> : <FashionPostForm onPostCreated={(newPost) => { setPosts([newPost, ...posts]); setPostingMode(false); }} onCancel={() => setPostingMode(false)} />}</div>
      ) : (
        <div className="mb-6 p-6 rounded-lg border bg-blue-500/5 border-blue-500/20 text-center"><p className="text-sm text-muted-foreground mb-3">Sign in to post</p><button onClick={() => navigate('/auth/signin')} className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm">Sign In</button></div>
      )}
      {loading ? <div className="flex items-center justify-center py-20"><Loader2 size={48} className="animate-spin text-blue-500" /></div> : posts.length === 0 ? <div className="text-center py-20"><MessageSquare size={48} className="text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">No posts yet.</p></div> : <div className="space-y-4">{posts.map((post) => <FashionPostCard key={post.id} post={post} currentUserId={user?.id} onPostDeleted={(postId) => setPosts(posts.filter(p => p.id !== postId))} />)}</div>}
    </FashionLayout>
  );
};

export default FashionBoardPage;