import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Play, Pause, Volume2, VolumeX, Heart, Share2, MessageCircle, Sparkles } from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import UploadVideoModal from '../../components/shortform/UploadVideoModal';
import { useAuth } from '../../contexts/AuthContext';

/**
 * BANIBS ShortForm - Short-form vertical video platform
 * TikTok-style swipe feed with youth safety and region filtering
 */
const ShortFormPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('discovery');
  const [videos, setVideos] = useState([]);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const videoRef = useRef(null);
  
  // Check if user is in youth mode (under 18)
  const isYouthMode = user?.age && user.age < 18;

  useEffect(() => {
    if (activeTab === 'discovery') {
      fetchDiscoveryFeed();
    }
  }, [activeTab]);

  useEffect(() => {
    // Auto-play current video
    if (videoRef.current && isPlaying) {
      videoRef.current.play().catch(e => console.log('Auto-play prevented'));
    }
  }, [currentVideoIndex, isPlaying]);

  const fetchDiscoveryFeed = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/shortform/feed/discovery`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setVideos(data.videos || []);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwipe = (direction) => {
    if (direction === 'up' && currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(prev => prev + 1);
      setIsPlaying(true);
    } else if (direction === 'down' && currentVideoIndex > 0) {
      setCurrentVideoIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  };

  const handleLike = async (videoId) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/shortform/video/${videoId}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      // Update local state
      setVideos(prev => prev.map(v => 
        v.id === videoId ? { ...v, likes: v.likes + 1 } : v
      ));
    } catch (error) {
      console.error('Failed to like video:', error);
    }
  };

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const currentVideo = videos[currentVideoIndex];

  return (
    <FullWidthLayout>
      <div className="shortform-container" data-theme="dark">
        {/* Header */}
        <div className="shortform-header">
          <h1 className="shortform-logo">ShortForm</h1>
          
          {isYouthMode && (
            <div className="youth-mode-badge">
              <Sparkles size={14} />
              <span>Youth Mode</span>
            </div>
          )}
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="upload-button"
          >
            <Upload size={20} />
            <span>Upload</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="shortform-tabs">
          <button
            onClick={() => setActiveTab('personal')}
            className={`tab-button ${activeTab === 'personal' ? 'active' : ''}`}
          >
            Personal
          </button>
          <button
            onClick={() => setActiveTab('discovery')}
            className={`tab-button ${activeTab === 'discovery' ? 'active' : ''}`}
          >
            Discovery
          </button>
          <button
            onClick={() => setActiveTab('community')}
            className={`tab-button ${activeTab === 'community' ? 'active' : ''}`}
          >
            Community
          </button>
        </div>

        {/* Video Feed */}
        <div className="video-feed">
          {loading ? (
            <div className="feed-loading">
              <div className="loading-spinner"></div>
              <p>Loading videos...</p>
            </div>
          ) : activeTab === 'discovery' && videos.length > 0 ? (
            <div className="video-container">
              {/* Video Player */}
              <video
                ref={videoRef}
                src={`${process.env.REACT_APP_BACKEND_URL}/api/shortform/video/${currentVideo.id}/stream`}
                className="video-player"
                loop
                playsInline
                muted={isMuted}
                onClick={togglePlayPause}
              />

              {/* Swipe Navigation */}
              <div className="swipe-area" onClick={togglePlayPause}>
                {currentVideoIndex < videos.length - 1 && (
                  <div 
                    className="swipe-indicator swipe-up"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwipe('up');
                    }}
                  >
                    Swipe up
                  </div>
                )}
                {currentVideoIndex > 0 && (
                  <div 
                    className="swipe-indicator swipe-down"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSwipe('down');
                    }}
                  >
                    Swipe down
                  </div>
                )}
              </div>

              {/* Video Info Overlay */}
              <div className="video-overlay">
                <div className="video-info">
                  <div className="creator-info">
                    {currentVideo.user_avatar ? (
                      <img src={currentVideo.user_avatar} alt={currentVideo.username} className="creator-avatar" />
                    ) : (
                      <div className="creator-avatar-placeholder">
                        {currentVideo.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="creator-name">@{currentVideo.username}</span>
                  </div>
                  
                  <h3 className="video-title">{currentVideo.title}</h3>
                  
                  {currentVideo.description && (
                    <p className="video-description">{currentVideo.description}</p>
                  )}
                  
                  <div className="video-tags">
                    <span className="category-pill">{currentVideo.category}</span>
                    {currentVideo.is_micro_learning && (
                      <span className="feature-pill">Micro-Learning</span>
                    )}
                    {currentVideo.is_community_boost && (
                      <span className="feature-pill">Community Boost</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="video-actions">
                  <button 
                    className="action-button"
                    onClick={() => handleLike(currentVideo.id)}
                  >
                    <Heart size={28} />
                    <span>{currentVideo.likes || 0}</span>
                  </button>
                  
                  <button className="action-button">
                    <MessageCircle size={28} />
                    <span>0</span>
                  </button>
                  
                  <button className="action-button">
                    <Share2 size={28} />
                    <span>{currentVideo.shares || 0}</span>
                  </button>
                  
                  <button 
                    className="action-button"
                    onClick={toggleMute}
                  >
                    {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
                  </button>
                </div>
              </div>

              {/* Video Counter */}
              <div className="video-counter">
                {currentVideoIndex + 1} / {videos.length}
              </div>
            </div>
          ) : activeTab === 'discovery' && videos.length === 0 ? (
            <div className="feed-empty">
              <Upload size={48} />
              <h3>No videos yet</h3>
              <p>Be the first to upload a ShortForm video!</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="upload-cta"
              >
                Upload Video
              </button>
            </div>
          ) : (
            <div className="feed-coming-soon">
              <Sparkles size={48} />
              <h3>{activeTab === 'personal' ? 'Personal Circle' : 'Community Circles'}</h3>
              <p>Coming soon! This feed will show videos from your {activeTab === 'personal' ? 'personal connections' : 'communities'}.</p>
              <button
                onClick={() => setActiveTab('discovery')}
                className="discovery-cta"
              >
                Explore Discovery
              </button>
            </div>
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <UploadVideoModal
            onClose={() => setShowUploadModal(false)}
            onUploadSuccess={() => {
              setShowUploadModal(false);
              if (activeTab === 'discovery') {
                fetchDiscoveryFeed();
              }
            }}
          />
        )}
      </div>
    </FullWidthLayout>
  );
};

export default ShortFormPage;
