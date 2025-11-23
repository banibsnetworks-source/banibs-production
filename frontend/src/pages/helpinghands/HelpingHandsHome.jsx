import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, TrendingUp, Clock, Star, Loader2, Users } from 'lucide-react';
import BusinessLayout from '../../components/business/BusinessLayout';
import HelpingHandsCampaignCard from '../../components/helpinghands/HelpingHandsCampaignCard';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { xhrRequest } from '../../utils/xhrRequest';

/**
 * HelpingHandsHome - Phase 10.0
 * Discovery page for BANIBS Helping Hands campaigns
 */
const HelpingHandsHome = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const isDark = theme === 'dark';
  
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('featured'); // featured, trending, new, ending
  
  useEffect(() => {
    loadCampaigns();
  }, [activeTab]);
  
  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // For "My Campaigns", show all statuses (including drafts)
      if (activeTab !== 'my-campaigns') {
        params.append('status', 'active');
      }
      
      if (activeTab === 'featured') {
        params.append('featured', 'true');
      }
      
      // Add auth header for "My Campaigns" to filter by owner
      const headers = {};
      if (activeTab === 'my-campaigns') {
        const token = localStorage.getItem('access_token');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
      
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/helping-hands/campaigns?${params.toString()}`,
        { headers }
      );
      
      if (response.ok) {
        let filteredCampaigns = response.data.campaigns || [];
        
        // Filter for user's own campaigns if on "My Campaigns" tab
        if (activeTab === 'my-campaigns' && user) {
          filteredCampaigns = filteredCampaigns.filter(c => c.owner_id === user.id);
        }
        
        setCampaigns(filteredCampaigns);
      }
    } catch (err) {
      console.error('Error loading campaigns:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const tabs = [
    { id: 'featured', label: 'Featured', icon: Star },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
    { id: 'new', label: 'New', icon: Plus },
    { id: 'ending', label: 'Ending Soon', icon: Clock },
    { id: 'my-campaigns', label: 'My Campaigns', icon: Users, authRequired: true }
  ];
  
  return (
    <BusinessLayout>
      <div 
        className="min-h-screen"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'
        }}
      >
        {/* Hero Section */}
        <div 
          className="py-16 px-4"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, rgba(232, 182, 87, 0.15) 0%, rgba(10, 10, 10, 0.9) 100%)'
              : 'linear-gradient(135deg, rgba(232, 182, 87, 0.2) 0%, rgba(249, 250, 251, 0.95) 100%)'
          }}
        >
          <div className="container mx-auto max-w-6xl text-center">
            <h1 
              className="text-4xl md:text-5xl font-bold mb-4"
              style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
            >
              BANIBS Helping Hands
            </h1>
            <p 
              className="text-xl mb-8"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              Support Black-owned businesses, families, and community causes
            </p>
            
            <button
              onClick={() => {
                if (!user) {
                  navigate('/login?redirect=/portal/helping-hands/create');
                } else {
                  navigate('/portal/helping-hands/create');
                }
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-semibold text-lg transition-all"
              style={{
                background: 'linear-gradient(135deg, #E8B657 0%, #D4A446 100%)',
                color: '#0a0a0a',
                boxShadow: '0 4px 12px rgba(232, 182, 87, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 182, 87, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 182, 87, 0.3)';
              }}
            >
              <Plus size={24} />
              Start a Campaign
            </button>
            
            {/* Disclaimer */}
            <p 
              className="text-xs mt-6 max-w-2xl mx-auto"
              style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}
            >
              BANIBS Helping Hands is a donation platform. Contributions are gifts, not investments or loans.
            </p>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <div className="flex gap-2 mb-8 overflow-x-auto">
            {tabs.filter(tab => !tab.authRequired || user).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium whitespace-nowrap transition-all"
                  style={{
                    background: isActive
                      ? isDark
                        ? 'rgba(232, 182, 87, 0.2)'
                        : 'rgba(232, 182, 87, 0.15)'
                      : 'transparent',
                    border: `2px solid ${isActive ? (isDark ? '#E8B657' : '#D4A446') : 'transparent'}`,
                    color: isActive
                      ? (isDark ? '#E8B657' : '#D4A446')
                      : (isDark ? '#9CA3AF' : '#6B7280')
                  }}
                >
                  <Icon size={20} />
                  {tab.label}
                </button>
              );
            })}
          </div>
          
          {/* Campaigns Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={48} className="animate-spin" style={{ color: '#E8B657' }} />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-20">
              <p style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                No campaigns found. Be the first to create one!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <HelpingHandsCampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          )}
        </div>
      </div>
    </BusinessLayout>
  );
};

export default HelpingHandsHome;
