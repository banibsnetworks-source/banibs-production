import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, Heart, Share2, Flag, Loader2, ArrowLeft } from 'lucide-react';
import BusinessLayout from '../../components/business/BusinessLayout';
import HelpingHandsProgressBar from '../../components/helpinghands/HelpingHandsProgressBar';
import HelpingHandsSupportButton from '../../components/helpinghands/HelpingHandsSupportButton';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { xhrRequest } from '../../utils/xhrRequest';

/**
 * HelpingHandsCampaignDetail - Phase 10.0
 * Full campaign detail page with support flow
 */
const HelpingHandsCampaignDetail = () => {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  const [supportAmount, setSupportAmount] = useState(25);
  const [showSupportModal, setShowSupportModal] = useState(false);
  
  useEffect(() => {
    loadCampaign();
  }, [campaignId]);
  
  const loadCampaign = async () => {
    setLoading(true);
    try {
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/helping-hands/campaigns/${campaignId}`
      );
      
      if (response.ok) {
        setCampaign(response.data);
      } else {
        navigate('/portal/helping-hands');
      }
    } catch (err) {
      console.error('Error loading campaign:', err);
      navigate('/portal/helping-hands');
    } finally {
      setLoading(false);
    }
  };
  
  const handleSupport = async () => {
    if (!user) {
      navigate('/login?redirect=/portal/helping-hands/campaign/' + campaignId);
      return;
    }
    
    setShowSupportModal(true);
  };
  
  const handleConfirmSupport = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/helping-hands/campaigns/${campaignId}/support`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            campaign_id: campaignId,
            amount: supportAmount,
            supporter_email: user.email,
            supporter_name: user.name || 'Anonymous',
            visibility: 'public'
          })
        }
      );
      
      if (response.ok) {
        // Redirect to Stripe Checkout
        window.location.href = response.data.checkout_url;
      } else {
        alert('Failed to initiate support. Please try again.');
      }
    } catch (err) {
      console.error('Error creating support:', err);
      alert('An error occurred. Please try again.');
    }
  };
  
  if (loading) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 size={48} className="animate-spin" style={{ color: '#E8B657' }} />
        </div>
      </BusinessLayout>
    );
  }
  
  if (!campaign) {
    return null;
  }
  
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
        {/* Back Button */}
        <div className="container mx-auto max-w-4xl px-4 py-6">
          <button
            onClick={() => navigate('/portal/helping-hands')}
            className="flex items-center gap-2 text-sm font-medium transition-colors"
            style={{ color: isDark ? '#E8B657' : '#D4A446' }}
          >
            <ArrowLeft size={16} />
            Back to Campaigns
          </button>
        </div>
        
        {/* Cover Image */}
        {campaign.cover_image && (
          <div className="w-full h-96 overflow-hidden">
            <img
              src={`${process.env.REACT_APP_BACKEND_URL}${campaign.cover_image}`}
              alt={campaign.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="container mx-auto max-w-4xl px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Title */}
              <h1 
                className="text-3xl md:text-4xl font-bold mb-4"
                style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
              >
                {campaign.title}
              </h1>
              
              {/* Meta */}
              <div 
                className="flex flex-wrap gap-4 mb-6 text-sm"
                style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
              >
                <div className="flex items-center gap-2">
                  <MapPin size={16} />
                  <span>{campaign.city}, {campaign.state}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Created {new Date(campaign.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Story */}
              <div
                className="prose max-w-none mb-8"
                style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                dangerouslySetInnerHTML={{ __html: campaign.story.replace(/\n/g, '<br/>') }}
              />
            </div>
            
            {/* Sidebar - Support Card */}
            <div className="lg:col-span-1">
              <div 
                className="sticky top-24 p-6 rounded-xl"
                style={{
                  background: isDark ? 'rgba(26, 26, 26, 0.9)' : 'rgba(255, 255, 255, 0.9)',
                  border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                  boxShadow: isDark
                    ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                    : '0 8px 24px rgba(0, 0, 0, 0.1)'
                }}
              >
                <HelpingHandsProgressBar
                  raised={campaign.raised_amount}
                  goal={campaign.goal_amount}
                />
                
                <div className="mt-6 mb-6">
                  <p 
                    className="text-sm mb-2"
                    style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                  >
                    <Heart size={16} className="inline mr-1" />
                    {campaign.supporters_count} supporters
                  </p>
                </div>
                
                <HelpingHandsSupportButton
                  campaignId={campaign.id}
                  onSupport={handleSupport}
                  size="large"
                />
                
                {/* Share & Report */}
                <div className="flex gap-2 mt-4">
                  <button
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      color: isDark ? '#9CA3AF' : '#6B7280'
                    }}
                  >
                    <Share2 size={16} />
                    Share
                  </button>
                  <button
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      color: isDark ? '#9CA3AF' : '#6B7280'
                    }}
                  >
                    <Flag size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Support Modal */}
        {showSupportModal && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0, 0, 0, 0.7)' }}
            onClick={() => setShowSupportModal(false)}
          >
            <div
              className="max-w-md w-full p-6 rounded-xl"
              style={{
                background: isDark ? '#1a1a1a' : '#ffffff',
                border: `1px solid ${isDark ? 'rgba(232, 182, 87, 0.3)' : 'rgba(232, 182, 87, 0.4)'}`
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
              >
                Support This Campaign
              </h2>
              
              <div className="mb-6">
                <label 
                  className="block text-sm font-medium mb-2"
                  style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                >
                  Your Contribution
                </label>
                <input
                  type="number"
                  min="1"
                  value={supportAmount}
                  onChange={(e) => setSupportAmount(Number(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg text-lg font-semibold"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    border: `2px solid ${isDark ? 'rgba(232, 182, 87, 0.3)' : 'rgba(232, 182, 87, 0.4)'}`,
                    color: isDark ? '#E8B657' : '#D4A446'
                  }}
                />
                
                {/* Quick amounts */}
                <div className="flex gap-2 mt-3">
                  {[10, 25, 50, 100].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSupportAmount(amount)}
                      className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
                      style={{
                        background: supportAmount === amount
                          ? (isDark ? 'rgba(232, 182, 87, 0.2)' : 'rgba(232, 182, 87, 0.15)')
                          : (isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'),
                        color: supportAmount === amount
                          ? (isDark ? '#E8B657' : '#D4A446')
                          : (isDark ? '#9CA3AF' : '#6B7280')
                      }}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleConfirmSupport}
                className="w-full py-4 rounded-lg font-semibold text-lg transition-all"
                style={{
                  background: 'linear-gradient(135deg, #E8B657 0%, #D4A446 100%)',
                  color: '#0a0a0a',
                  boxShadow: '0 4px 12px rgba(232, 182, 87, 0.3)'
                }}
              >
                Continue to Payment
              </button>
              
              <button
                onClick={() => setShowSupportModal(false)}
                className="w-full mt-3 py-3 rounded-lg text-sm font-medium"
                style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
};

export default HelpingHandsCampaignDetail;
