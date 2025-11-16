import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * MyBusinessRedirect - Redirects to user's business profile
 * Used for "Manage My Business" links
 */
const MyBusinessRedirect = () => {
  const [businessHandle, setBusinessHandle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMyBusiness = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setError(true);
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
          setBusinessHandle(data.handle);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Failed to fetch business:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMyBusiness();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-yellow-500" />
      </div>
    );
  }

  if (error || !businessHandle) {
    // User doesn't have a business, redirect to business portal
    return <Navigate to="/portal/business" replace />;
  }

  // Redirect to user's business profile
  return <Navigate to={`/portal/business/${businessHandle}`} replace />;
};

export default MyBusinessRedirect;
