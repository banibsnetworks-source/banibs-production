import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SEO from '../../components/SEO';
import { Users, MessageCircle, Heart, User } from 'lucide-react';
import SocialPostComposer from '../../components/social/SocialPostComposer';
import SocialFeed from '../../components/social/SocialFeed';
import SocialLayout from '../../components/social/SocialLayout';
import MessagesDock from '../../components/social/MessagesDock';

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
  
  // Hero rotating images - Brand-aligned: Black-centered warmth, family, community, joy
  const [currentHeroImage, setCurrentHeroImage] = useState(0);
  const socialHeroImages = [
    'https://images.unsplash.com/photo-1585144374310-1c0053f26d80?w=1920&q=85', // Black couple - warm intimate connection
    'https://images.unsplash.com/photo-1689376742380-60cbfb78b0cb?w=1920&q=85', // Black women - cozy home warmth
    'https://images.pexels.com/photos/27086690/pexels-photo-27086690.jpeg?auto=compress&cs=tinysrgb&w=1920', // Black family - joyful moment
    'https://images.unsplash.com/photo-1531983412531-1f49a365ffed?w=1920&q=85', // Black woman - confident portrait
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1920&q=85', // Black woman - warm smile
  ];
  
  // Rotate hero images every 5 seconds for social context
  React.useEffect(() => {
    if (!isAuthenticated) {
      const interval = setInterval(() => {
        setCurrentHeroImage((prev) => (prev + 1) % socialHeroImages.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, socialHeroImages.length]);

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
        backgroundColor: isDark ? '#0C0C0C' : '#F7F7F7'
      }}>
        <SEO
          title="BANIBS Social - Connect, Share, Empower"
          description="Join the BANIBS Social community. Connect with Black and Indigenous voices, share stories, and empower each other."
        />
        
        {/* Global navigation is now handled by BanibsNetworkNav at App.js level */}

        {/* Hero Section with Rotating Real Images */}
        <div className="relative overflow-hidden" style={{
          minHeight: '720px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Rotating Background Images */}
          {socialHeroImages.map((img, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundImage: `url(${img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                opacity: currentHeroImage === idx ? 1 : 0,
                transition: 'opacity 1.8s ease-in-out',
                zIndex: 0
              }}
            />
          ))}
          
          {/* Dark Overlay for text legibility */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDark 
              ? 'linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.75))' 
              : 'linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.55))',
            zIndex: 1
          }} />
          
          <div className="relative z-10 text-center px-4" style={{
            maxWidth: '900px',
            margin: '0 auto'
          }}>
            <h1 className="text-5xl font-bold mb-4" style={{
              color: 'white',
              textShadow: '0 2px 12px rgba(0,0,0,0.5)'
            }}>
              BANIBS Social
            </h1>
            <p className="text-2xl mb-8" style={{
              color: 'rgb(243, 244, 246)',
              textShadow: '0 1px 6px rgba(0,0,0,0.4)'
            }}>
              Where Black America Connects
            </p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => handleOpenAuth('register')}
                className="px-8 py-3 font-bold rounded-lg transition-all"
                style={{
                  backgroundColor: '#C8A857',
                  color: '#000000',
                  boxShadow: '0 4px 16px rgba(200, 168, 87, 0.4)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#D4B872';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#C8A857';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                Join BANIBS Social
              </button>
              <button
                onClick={() => handleOpenAuth('signin')}
                className="px-8 py-3 font-semibold rounded-lg backdrop-blur-sm transition-all"
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  color: 'white'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.25)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                Sign In
              </button>
            </div>
            <p className="mt-4 text-sm" style={{
              color: 'rgb(209, 213, 219)',
              textShadow: '0 1px 4px rgba(0,0,0,0.4)'
            }}>
              Free • Private • No Tracking
            </p>
          </div>
        </div>

        {/* Preview Feed */}
        <div className="container mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6" style={{
            color: isDark ? 'white' : 'rgb(17, 24, 39)'
          }}>Community Activity</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                name: 'Marcus Johnson',
                time: '2 hours ago',
                avatar: '💼',
                avatarBg: 'rgb(59, 130, 246)',
                content: 'Just launched my new business consulting firm! So grateful for the support from this community. Here\'s to building Black wealth together! 🎉',
                likes: 142,
                comments: 28
              },
              {
                name: 'Aisha Williams',
                time: '4 hours ago',
                avatar: '🎓',
                avatarBg: 'rgb(16, 185, 129)',
                content: 'My daughter just got accepted into Howard University! All the late nights studying paid off. Proud mom moment 💕',
                likes: 287,
                comments: 45
              },
              {
                name: 'James Thompson',
                time: '5 hours ago',
                avatar: '🎨',
                avatarBg: 'rgb(139, 92, 246)',
                content: 'Finished my latest painting celebrating our ancestors. Art is my way of honoring their journey and keeping our history alive.',
                likes: 198,
                comments: 32
              },
              {
                name: 'Keisha Brown',
                time: '8 hours ago',
                avatar: '👨‍👩‍👧‍👦',
                avatarBg: 'rgb(234, 179, 8)',
                content: 'Family cookout this weekend was everything! Three generations together, sharing stories and laughter. This is what it\'s all about.',
                likes: 321,
                comments: 56
              }
            ].map((post, i) => (
              <div key={i} className="backdrop-blur-sm rounded-lg p-6" style={{
                backgroundColor: isDark ? 'rgba(22, 22, 22, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`
              }}>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{
                    backgroundColor: post.avatarBg
                  }}>
                    {post.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold" style={{
                      color: isDark ? 'white' : 'rgb(17, 24, 39)'
                    }}>
                      {post.name}
                    </div>
                    <div className="text-sm" style={{
                      color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                    }}>
                      {post.time}
                    </div>
                  </div>
                </div>
                <div className="mb-4" style={{
                  color: isDark ? 'rgb(229, 231, 235)' : 'rgb(55, 65, 81)'
                }}>
                  {post.content}
                </div>
                <div className="flex items-center space-x-6 text-sm" style={{
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}>
                  <div className="flex items-center space-x-1">
                    <Heart size={18} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle size={18} />
                    <span>{post.comments}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button 
              onClick={() => handleOpenAuth('signin')}
              className="px-6 py-3 font-semibold rounded-lg transition-colors"
              style={{
                backgroundColor: 'rgb(59, 130, 246)',
                color: 'white'
              }}
            >
              Sign in to see your feed →
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="py-16" style={{
          backgroundColor: isDark ? '#161616' : '#FFFFFF'
        }}>
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12" style={{
              color: isDark ? 'white' : 'rgb(17, 24, 39)'
            }}>
              Connect with Purpose
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                  backgroundColor: 'rgb(59, 130, 246)'
                }}>
                  <MessageCircle className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{
                  color: isDark ? 'white' : 'rgb(17, 24, 39)'
                }}>Share & Discuss</h3>
                <p style={{
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}>Post updates, share stories, and engage in meaningful conversations.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                  backgroundColor: 'rgb(232, 182, 87)'
                }}>
                  <Users style={{ color: 'rgb(17, 24, 39)' }} size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{
                  color: isDark ? 'white' : 'rgb(17, 24, 39)'
                }}>Build Community</h3>
                <p style={{
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}>Connect with like-minded individuals and grow your network.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{
                  backgroundColor: 'rgb(16, 185, 129)'
                }}>
                  <Heart className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{
                  color: isDark ? 'white' : 'rgb(17, 24, 39)'
                }}>Support Each Other</h3>
                <p style={{
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}>Uplift voices, share resources, and empower the community.</p>
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
      
      <div 
        className="min-h-screen" 
        style={{ 
          paddingTop: '20px',
          backgroundColor: isDark ? '#0C0C0C' : '#F7F7F7',
          color: isDark ? '#F7F7F7' : '#111217'
        }}
      >
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Welcome Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">
                  Welcome back, {user?.name}!
                </h1>
                <p className="text-muted-foreground text-sm">
                  Share your thoughts with the BANIBS community
                </p>
              </div>
              
              {/* Temporary Messages Trigger for Testing */}
              <button
                onClick={() => {
                  const event = new CustomEvent('open-messages-dock');
                  window.dispatchEvent(event);
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-lg font-semibold transition-colors shadow-md"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Open Messages</span>
              </button>
            </div>

            {/* First Login Helper Banner */}
            <div className="mb-6 p-4 rounded-lg" style={{
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              border: `1px solid ${isDark ? 'rgba(245, 158, 11, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
            }}>
              <div className="flex items-start gap-3">
                <span className="text-xl">💡</span>
                <div className="flex-1">
                  <p className="text-sm" style={{
                    color: isDark ? 'rgb(252, 211, 77)' : 'rgb(180, 83, 9)'
                  }}>
                    <strong>Tip:</strong> Keep new people, coworkers, and acquaintances in <strong>"Others."</strong> Move people upward only after trust is earned. <strong>Protect your inner circle.</strong>
                  </p>
                </div>
              </div>
            </div>

            {/* Lazy load components */}
            <SocialFeedContent />
          </div>
        </div>
      </div>
      
      {/* Messages Dock - Phase 1 MVP */}
      <MessagesDock />
    </SocialLayout>
  );
};

export default SocialPortal;
