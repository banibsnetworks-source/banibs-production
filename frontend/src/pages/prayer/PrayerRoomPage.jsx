import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import SpiritualLayout from '../../components/spiritual/SpiritualLayout';
import PrayerHeader from '../../components/spiritual/PrayerHeader';
import PrayerPostForm from '../../components/spiritual/PrayerPostForm';
import PrayerPostCard from '../../components/spiritual/PrayerPostCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { xhrRequest } from '../../utils/xhrRequest';

/**
 * PrayerRoomPage - Phase 11.0
 * Individual prayer room with posts and form
 */
const PrayerRoomPage = () => {
  const { roomSlug } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  
  const [room, setRoom] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postingMode, setPostingMode] = useState(false);
  
  useEffect(() => {
    loadRoomData();
  }, [roomSlug]);
  
  const loadRoomData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const headers = {};
      const token = localStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/prayer/rooms/${roomSlug}/posts`,
        { headers }
      );
      
      if (response.ok) {
        setRoom(response.data.room);
        setPosts(response.data.posts);
      } else {
        setError('Prayer room not found');
      }
    } catch (err) {
      console.error('Error loading prayer room:', err);
      setError('Failed to load prayer room');
    } finally {
      setLoading(false);
    }
  };
  
  const handlePostCreated = (newPost) => {
    setPosts([newPost, ...posts]);
    setPostingMode(false);
  };
  
  const handleAmenUpdate = (postId, amened) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          amen_count: amened ? post.amen_count + 1 : post.amen_count - 1,
          user_has_amened: amened
        };
      }
      return post;
    }));
  };
  
  const handlePostDeleted = (postId) => {
    setPosts(posts.filter(post => post.id !== postId));
  };
  
  if (loading) {
    return (
      <SpiritualLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-purple-500" />
        </div>
      </SpiritualLayout>
    );
  }
  
  if (error || !room) {
    return (
      <SpiritualLayout>
        <div className="max-w-2xl mx-auto text-center py-20">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            {error || 'Room Not Found'}
          </h2>
          <button
            onClick={() => navigate('/portal/prayer')}
            className="mt-6 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </SpiritualLayout>
    );
  }
  
  return (
    <SpiritualLayout>
      {/* Header */}
      <PrayerHeader room={room} onBack={() => navigate('/portal/prayer')} />
      
      {/* Post Form */}
      {isAuthenticated ? (
        <div className="mb-6">
          {!postingMode ? (
            <button
              onClick={() => setPostingMode(true)}
              className="w-full p-4 rounded-lg border border-border bg-card hover:border-purple-500 transition-colors text-left text-muted-foreground"
            >
              Share a prayer request, gratitude, or blessing...
            </button>
          ) : (
            <PrayerPostForm
              room={room}
              onPostCreated={handlePostCreated}
              onCancel={() => setPostingMode(false)}
            />
          )}
        </div>
      ) : (
        <div 
          className="mb-6 p-6 rounded-lg border text-center"
          style={{
            background: isDark ? 'rgba(139, 92, 246, 0.05)' : 'rgba(139, 92, 246, 0.03)',
            borderColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'
          }}
        >
          <p className="text-sm text-muted-foreground mb-3">
            Please sign in to share your prayers
          </p>
          <button
            onClick={() => navigate('/auth/signin')}
            className="px-6 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-sm"
          >
            Sign In
          </button>
        </div>
      )}
      
      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">
              No prayers yet. Be the first to share.
            </p>
          </div>
        ) : (
          posts.map((post) => (
            <PrayerPostCard
              key={post.id}
              post={post}
              currentUserId={user?.id}
              onAmenUpdate={handleAmenUpdate}
              onPostDeleted={handlePostDeleted}
            />
          ))
        )}
      </div>
      
      {/* Auto-Clear Notice */}
      <div className="mt-12 text-center text-xs text-muted-foreground">
        <p>Prayers are automatically cleared after 14 days to keep this space fresh and focused.</p>
      </div>
    </SpiritualLayout>
  );
};

export default PrayerRoomPage;