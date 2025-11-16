import React, { useState, useEffect } from 'react';
import ConnectLayout from '../../components/connect/ConnectLayout';
import { useAccountMode } from '../../contexts/AccountModeContext';
import { TrendingUp, Users, Briefcase, Plus } from 'lucide-react';

/**
 * ConnectHome - BANIBS Connect Home Page
 * Business feed with posts, opportunities, and business content
 */

const ConnectHome = () => {
  const { selectedBusinessProfile, isBusinessMode } = useAccountMode();
  const [posts, setPosts] = useState([]);

  // Placeholder business feed content
  const businessPosts = [
    {
      id: 1,
      author: 'TechStart Solutions',
      authorLogo: null,
      content: 'Excited to announce our new partnership with Atlanta Tech Hub! We\'re committed to bringing more opportunities to Black tech entrepreneurs in the region. 🚀',
      type: 'update',
      timestamp: '2 hours ago',
      likes: 42,
      comments: 8
    },
    {
      id: 2,
      author: 'BuildRight Properties',
      authorLogo: null,
      content: 'New commercial development opportunity in Midtown. Looking for minority-owned contractors and suppliers. DM for details.',
      type: 'opportunity',
      timestamp: '5 hours ago',
      likes: 28,
      comments: 12
    },
    {
      id: 3,
      author: 'BANIBS Media Group',
      authorLogo: null,
      content: 'Just published: "Top 10 Black-Owned Businesses to Watch in 2025" - featuring incredible entrepreneurs making waves across industries.',
      type: 'article',
      timestamp: '1 day ago',
      likes: 156,
      comments: 34
    }
  ];

  useEffect(() => {
    setPosts(businessPosts);
  }, []);

  return (
    <ConnectLayout>
      <div className="space-y-4">
        {/* Welcome Banner */}
        {selectedBusinessProfile && (
          <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-foreground mb-2">
                  Welcome back, {selectedBusinessProfile.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Your business command center. Manage your network, track opportunities, and grow your presence.
                </p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Post Update</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">1,234</p>
                <p className="text-xs text-muted-foreground">Network Connections</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">+42</p>
                <p className="text-xs text-muted-foreground">New This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-xs text-muted-foreground">Active Opportunities</p>
              </div>
            </div>
          </div>
        </div>

        {/* Business Feed */}
        <div className="bg-card border border-border rounded-lg">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">Business Feed</h2>
            <p className="text-sm text-muted-foreground">Updates, opportunities, and insights from your network</p>
          </div>

          <div className="divide-y divide-border">
            {posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-muted/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {post.author.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-foreground">{post.author}</p>
                          <p className="text-xs text-muted-foreground">{post.timestamp}</p>
                        </div>
                        {post.type === 'opportunity' && (
                          <span className="px-2 py-1 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs font-medium rounded-full">
                            Opportunity
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-foreground mb-3 leading-relaxed">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <button className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                          👍 {post.likes}
                        </button>
                        <button className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                          💬 {post.comments}
                        </button>
                        <button className="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors">
                          🔗 Share
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <p className="text-muted-foreground">No posts yet. Start connecting with businesses!</p>
              </div>
            )}
          </div>
        </div>

        {/* Placeholder for future features */}
        <div className="bg-gradient-to-r from-yellow-500/5 to-yellow-600/5 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            More business features coming soon: Job postings, RFPs, partnership opportunities, and more.
          </p>
        </div>
      </div>
    </ConnectLayout>
  );
};

export default ConnectHome;
