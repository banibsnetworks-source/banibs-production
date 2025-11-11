import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import GlobalNavBar from '../../components/GlobalNavBar';
import NewsNavigationBar from '../../components/NewsNavigationBar';
import SEO from '../../components/SEO';
import { Users, MessageCircle, Heart } from 'lucide-react';
import SocialPostComposer from '../../components/social/SocialPostComposer';
import SocialFeed from '../../components/social/SocialFeed';
import AuthModal from '../../components/AuthModal';

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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin');

  const handleOpenAuth = (mode = 'signin') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  if (!isAuthenticated) {
    // Signed-Out Preview
    return (
      <div className="min-h-screen bg-gray-950">
        <SEO
          title="BANIBS Social - Connect, Share, Empower"
          description="Join the BANIBS Social community. Connect with Black and Indigenous voices, share stories, and empower each other."
        />
        <GlobalNavBar />

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal
            initialMode={authModalMode}
            onClose={() => setShowAuthModal(false)}
          />
        )}

        {/* Hero Section */}
        <div className="relative h-96 bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-8 gap-4 p-8">
              {[...Array(32)].map((_, i) => (
                <div key={i} className="aspect-square bg-white rounded-lg"></div>
              ))}
            </div>
          </div>
          <div className="relative z-10 text-center px-4">
            <h1 className="text-5xl font-bold text-white mb-4">
              BANIBS Social
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Where Black America Connects
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors"
              >
                Join BANIBS Social
              </button>
              <button
                onClick={() => handleOpenAuth('signin')}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg backdrop-blur-sm transition-colors"
              >
                Sign In
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-400">
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

  // Signed-In View - Full Social Feed (Phase 8.3)
  return (
    <div className="min-h-screen bg-gray-950">
      <SEO
        title="BANIBS Social - Your Feed"
        description="Stay connected with your BANIBS Social community."
      />
      <GlobalNavBar />
      <NewsNavigationBar activeSection="social" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Welcome Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-400 text-sm">
              Share your thoughts with the BANIBS community
            </p>
          </div>

          {/* Lazy load components */}
          <SocialFeedContent />
        </div>
      </div>
    </div>
  );
};

export default SocialPortal;
