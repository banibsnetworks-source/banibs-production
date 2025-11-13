import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import GlobalNavBar from '../../components/GlobalNavBar';
import NewsNavigationBar from '../../components/NewsNavigationBar';
import SEO from '../../components/SEO';
import { Users, MessageCircle, Heart, User } from 'lucide-react';
import SocialPostComposer from '../../components/social/SocialPostComposer';
import SocialFeed from '../../components/social/SocialFeed';
import SocialLayout from '../../components/social/SocialLayout';

/**
 * SocialFeedContent - Phase 8.3
 * Authenticated user feed with composer and posts
 */
const SocialFeedContent = () => {
  const [newPost, setNewPost] = useState(null);

  const handlePostCreated = (post) => {
    setNewPost(post);
    // Reset after a moment to allow feed to process
    setTimeout(() => setNewPost(null), 100);
  };

  return (
    <div className="space-y-6">
      {/* Post Composer */}
      <SocialPostComposer onPostCreated={handlePostCreated} />
      
      {/* Feed */}
      <SocialFeed newPost={newPost} />
    </div>
  );
};

/**
 * SocialPortal - Phase 8.2 & 8.3
 * BANIBS Social Portal landing page
 * Signed-out: Preview with CTA
 * Signed-in: Full interactive social feed
 */
const SocialPortal = () => {
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Phase 8.3.1: Trigger GlobalNavBar's AuthModal via global event
  const handleOpenAuth = (mode = 'signin') => {
    console.log('🔐 Dispatching global auth modal event with mode:', mode);
    const event = new CustomEvent('open-auth-modal', { 
      detail: { mode } 
    });
    window.dispatchEvent(event);
  };

  if (!isAuthenticated) {
    // Signed-Out Preview
    return (
      <div className="min-h-screen" style={{ 
        backgroundColor: isDark ? 'rgb(10, 10, 12)' : 'rgb(249, 250, 251)' 
      }}>
        <SEO
          title="BANIBS Social - Connect, Share, Empower"
          description="Join the BANIBS Social community. Connect with Black and Indigenous voices, share stories, and empower each other."
        />
        <GlobalNavBar />

        {/* Hero Section */}
        <div className="relative py-20" style={{
          background: isDark 
            ? 'linear-gradient(to bottom right, rgb(30, 58, 138), rgb(17, 24, 39))' 
            : 'linear-gradient(to bottom right, rgb(147, 197, 253), rgb(219, 234, 254))'
        }}>
          {/* Image Grid Background */}
          <div className="absolute inset-0 overflow-hidden opacity-20">
            <div className="grid grid-cols-6 gap-2 p-4 h-full">
              {[...Array(24)].map((_, i) => (
                <div 
                  key={i} 
                  className="aspect-square rounded-lg overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${
                      isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                    }, ${
                      isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
                    })`
                  }}
                >
                  {/* Image placeholder icons - representing diverse Black community */}
                  <div className="w-full h-full flex items-center justify-center">
                    <Users size={24} style={{ 
                      color: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.2)' 
                    }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Community Photos Section */}
          <div className="container mx-auto px-4 mb-12">
            <div className="grid grid-cols-4 gap-4 max-w-4xl mx-auto mb-8">
              {[
                { label: '👨‍👩‍👧‍👦 Families', color: 'rgb(59, 130, 246)' },
                { label: '🎓 Students', color: 'rgb(16, 185, 129)' },
                { label: '💼 Professionals', color: 'rgb(139, 92, 246)' },
                { label: '👴👵 Elders', color: 'rgb(234, 179, 8)' }
              ].map((item, i) => (
                <div 
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden"
                  style={{
                    background: isDark 
                      ? `linear-gradient(135deg, ${item.color}40, ${item.color}20)`
                      : `linear-gradient(135deg, ${item.color}30, ${item.color}10)`,
                    border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`
                  }}
                >
                  <div className="w-full h-full flex flex-col items-center justify-center p-4">
                    <span className="text-3xl mb-2">{item.label.split(' ')[0]}</span>
                    <span className="text-xs font-semibold text-center" style={{
                      color: isDark ? 'white' : 'rgb(17, 24, 39)'
                    }}>
                      {item.label.split(' ')[1]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl font-bold mb-4" style={{
              color: isDark ? 'white' : 'rgb(17, 24, 39)'
            }}>
              BANIBS Social
            </h1>
            <p className="text-2xl mb-8" style={{
              color: isDark ? 'rgb(209, 213, 219)' : 'rgb(55, 65, 81)'
            }}>
              Where Black America Connects
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-8 py-3 font-bold rounded-lg transition-colors"
                style={{
                  backgroundColor: 'rgb(232, 182, 87)',
                  color: 'rgb(17, 24, 39)'
                }}
              >
                Join BANIBS Social
              </button>
              <button
                onClick={() => handleOpenAuth('signin')}
                className="px-8 py-3 font-semibold rounded-lg backdrop-blur-sm transition-colors"
                style={{
                  backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: isDark ? 'white' : 'rgb(17, 24, 39)'
                }}
              >
                Sign In
              </button>
            </div>
            <p className="mt-4 text-sm" style={{
              color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
            }}>
              Free • Private • No Tracking
            </p>
          </div>
        </div>

        {/* Preview Feed */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-white mb-6">Community Activity</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-800/40 backdrop-blur-sm rounded-lg p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-24"></div>
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                </div>
                <div className="flex items-center space-x-4 text-gray-500 text-sm">
                  <div className="flex items-center space-x-1">
                    <Heart size={16} />
                    <span>24</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle size={16} />
                    <span>8</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button 
              onClick={() => handleOpenAuth('signin')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Sign in to see your feed →
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-900 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-white text-center mb-12">
              Connect with Purpose
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Share & Discuss</h3>
                <p className="text-gray-400">Post updates, share stories, and engage in meaningful conversations.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-gray-900" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Build Community</h3>
                <p className="text-gray-400">Connect with like-minded individuals and grow your network.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Support Each Other</h3>
                <p className="text-gray-400">Uplift voices, share resources, and empower the community.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signed-In View - Full Social Feed (Phase 8.3 + Phase 10.0)
  return (
    <SocialLayout>
      <SEO
        title="BANIBS Social - Your Feed"
        description="Stay connected with your BANIBS Social community."
      />
      
      <div className="min-h-screen" style={{ paddingTop: '20px' }}>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-400 text-sm">
                  Share your thoughts with the BANIBS community
                </p>
              </div>
            </div>

            {/* Lazy load components */}
            <SocialFeedContent />
          </div>
        </div>
      </div>
    </SocialLayout>
  );
};

export default SocialPortal;
