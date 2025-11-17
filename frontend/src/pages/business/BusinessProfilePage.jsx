import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessProfilePublic from './BusinessProfilePublic';

/**
 * BusinessProfilePage - Phase 8.4 (P0 Fix)
 * Business owner's profile page - loads their own business profile
 * If no business exists, shows "Create Business Profile" option
 */
const BusinessProfilePage = () => {
  const navigate = useNavigate();
  const [businessId, setBusinessId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMyBusiness();
  }, []);

  const loadMyBusiness = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Please log in to view your business profile');
        setLoading(false);
        return;
      }

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBusinessId(data.id);
      } else if (response.status === 404) {
        // No business profile exists
        setBusinessId(null);
      } else {
        throw new Error('Failed to load business profile');
      }
    } catch (err) {
      console.error('Error loading business:', err);
      setError('Failed to load business profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <BusinessLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 size={48} className="mx-auto mb-4 animate-spin" style={{ color: '#E8B657' }} />
            <p style={{ color: 'var(--text-primary)' }}>Loading your business profile...</p>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  // No business profile - show create option
  if (!businessId) {
    return (
      <BusinessLayout>
        <div 
          className="flex items-center justify-center min-h-screen"
          style={{
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
          }}
        >
          <div className="text-center px-4 max-w-2xl">
            {/* Icon */}
            <div 
              className="mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                width: '120px',
                height: '120px',
                background: 'linear-gradient(135deg, rgba(232, 182, 87, 0.1) 0%, rgba(232, 182, 87, 0.05) 100%)',
                border: '2px solid rgba(232, 182, 87, 0.3)'
              }}
            >
              <Plus 
                size={56} 
                style={{ color: '#E8B657' }}
                strokeWidth={1.5}
              />
            </div>

            {/* Title */}
            <h1 
              className="text-3xl font-bold mb-3"
              style={{ color: '#F9F9F9' }}
            >
              Create Your Business Profile
            </h1>

            {/* Description */}
            <p 
              className="text-lg mb-8"
              style={{ color: '#9CA3AF' }}
            >
              Set up your business profile to start posting jobs, connecting with customers, and growing your network.
            </p>

            {/* Create Button */}
            <button
              onClick={() => navigate('/portal/business/profile/edit')}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-medium transition-all text-lg"
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
              <Plus size={20} />
              Create Business Profile
            </button>
          </div>
        </div>
      </BusinessLayout>
    );
  }

  // Has business profile - show it
  // We need to remove the GlobalNavBar from BusinessProfilePublic since BusinessLayout already has it
  return <BusinessProfilePublic businessId={businessId} hideNavBar={true} />;
};

export default BusinessProfilePage;
