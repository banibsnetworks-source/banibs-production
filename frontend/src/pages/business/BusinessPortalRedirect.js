import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * Business Portal Redirect - Phase B.0
 * Routes /portal/business intelligently based on user state:
 * - If not logged in: redirect to List Your Business
 * - If logged in but no business: redirect to List Your Business  
 * - If logged in with business: show Business Portal dashboard
 */
const BusinessPortalRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has a business profile
    const checkBusinessProfile = async () => {
      if (!isAuthenticated) {
        // Not logged in - send to List Your Business page
        navigate('/business/register');
        return;
      }

      try {
        // Check if user has business profile
        const response = await fetch(
          `${process.env.REACT_APP_BACKEND_URL}/api/business/profile/me`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.ok) {
          // User has business - show portal dashboard
          // Import and render BusinessPortal component
          const BusinessPortal = require('./BusinessPortal').default;
          navigate('/portal/business/dashboard');
        } else {
          // No business profile - send to registration
          navigate('/business/register');
        }
      } catch (error) {
        console.error('Error checking business profile:', error);
        // On error, send to registration to be safe
        navigate('/business/register');
      }
    };

    checkBusinessProfile();
  }, [isAuthenticated, navigate]);

  // Show loading state while checking
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#0C0C0C',
      color: '#F7F7F7'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '48px',
          height: '48px',
          border: '4px solid rgba(200, 168, 87, 0.3)',
          borderTop: '4px solid #C8A857',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 16px'
        }} />
        <p>Loading your business portal...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BusinessPortalRedirect;
