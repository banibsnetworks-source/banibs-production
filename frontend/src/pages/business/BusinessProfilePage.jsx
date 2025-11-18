import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus } from 'lucide-react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessProfilePublic from './BusinessProfilePublic';
import { xhrRequest } from '../../utils/xhrRequest';

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
    console.log('🏢 [BusinessProfilePage] Starting loadMyBusiness...');
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      console.log('🏢 [BusinessProfilePage] Token exists:', !!token);
      
      if (!token) {
        console.log('🏢 [BusinessProfilePage] No token found, showing create profile');
        setBusinessId(null);
        setLoading(false);
        return;
      }

      console.log('🏢 [BusinessProfilePage] Calling /api/business/me...');
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          timeout: 5000  // 5 second timeout
        }
      );

      console.log('🏢 [BusinessProfilePage] Response status:', response.status);

      if (response.ok) {
        console.log('🏢 [BusinessProfilePage] Business profile found:', response.data.id);
        setBusinessId(response.data.id);
      } else if (response.status === 404) {
        // No business profile exists - this is EXPECTED for new users
        console.log('🏢 [BusinessProfilePage] No business profile found (404) - showing create option');
        setBusinessId(null);
      } else {
        console.error('🏢 [BusinessProfilePage] Business API error:', response.status, response.data);
        // Still show create option on error
        setBusinessId(null);
      }
    } catch (err) {
      console.error('🏢 [BusinessProfilePage] Error loading business:', err);
      // On error, still show create option
      setBusinessId(null);
    } finally {
      console.log('🏢 [BusinessProfilePage] Setting loading to false');
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
              onClick={() => {
                console.log('🚀 [CREATE BUTTON CLICKED] Navigating to business profile create...');
                navigate('/portal/business/profile/create');
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-lg font-medium transition-all text-lg"
              style={{
                background: 'linear-gradient(135deg, #E8B657 0%, #D4A446 100%)',
                color: '#0a0a0a',
                boxShadow: '0 4px 12px rgba(232, 182, 87, 0.3)',
                cursor: 'pointer !important',
                pointerEvents: 'auto',
                position: 'relative',
                zIndex: 9999
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

  // Has business profile - show it wrapped in BusinessLayout
  return (
    <BusinessLayout>
      <div style={{ width: '100%', minHeight: 'auto' }}>
        <BusinessProfilePublic businessId={businessId} hideNavBar={true} />
      </div>
    </BusinessLayout>
  );
};

export default BusinessProfilePage;
