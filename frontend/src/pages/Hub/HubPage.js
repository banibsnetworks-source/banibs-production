import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNav from './TopNav';
import WelcomePanel from './WelcomePanel';
import ActivityFeed from './ActivityFeed';
import QuickDestinations from './QuickDestinations';

const HubPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    news: [],
    opportunities: [],
    businesses: []
  });

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch dashboard data
    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
      const token = localStorage.getItem('accessToken');
      
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Parallel API calls for faster loading
      const [newsRes, oppsRes, userRes, businessRes] = await Promise.all([
        fetch(`${BACKEND_URL}/api/news/latest?limit=5`, { headers }),
        fetch(`${BACKEND_URL}/api/opportunities/featured?limit=3`, { headers }),
        fetch(`${BACKEND_URL}/api/auth/me`, { headers }),
        fetch(`${BACKEND_URL}/api/business/my-listings`, { headers })
      ]);

      if (!userRes.ok) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('accessToken');
        navigate('/login');
        return;
      }

      const [news, opportunities, userData, businesses] = await Promise.all([
        newsRes.json(),
        oppsRes.json(),
        userRes.json(),
        businessRes.json()
      ]);

      setUser(userData);
      setDashboardData({
        news: news || [],
        opportunities: opportunities || [],
        businesses: businesses || []
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <TopNav user={null} onLogout={handleLogout} />
        <div className="flex justify-center items-center h-[calc(100vh-64px)]">
          <div className="text-gray-500 text-lg">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopNav user={user} onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto px-4 py-6">
        <WelcomePanel user={user} />
        
        {/* Main 70/30 Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Left Column - Activity Feed (70%) */}
          <div className="lg:col-span-8">
            <ActivityFeed 
              news={dashboardData.news}
              opportunities={dashboardData.opportunities}
            />
          </div>
          
          {/* Right Column - Quick Destinations (30%) */}
          <div className="lg:col-span-4">
            <QuickDestinations 
              businessCount={dashboardData.businesses.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubPage;
