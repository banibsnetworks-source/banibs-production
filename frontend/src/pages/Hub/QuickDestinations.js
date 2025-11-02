import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const QuickDestinations = ({ businessCount = 0 }) => {
  const navigate = useNavigate();
  const [resourcesCount, setResourcesCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [featuredResources, setFeaturedResources] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch resources count and top 3 featured
      const resourcesRes = await fetch(`${BACKEND_URL}/api/resources?featured=true&limit=3`);
      if (resourcesRes.ok) {
        const resourcesData = await resourcesRes.json();
        setResourcesCount(resourcesData.total || 0);
        setFeaturedResources(resourcesData.resources || []);
      }

      // Fetch upcoming events count and top 3
      const eventsRes = await fetch(`${BACKEND_URL}/api/events?status=upcoming&featured=true&limit=3`);
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        setEventsCount(eventsData.total || 0);
        setUpcomingEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error('Error fetching tile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const tiles = [
    {
      icon: '🏢',
      title: 'Business Directory',
      description: 'Discover Black & Indigenous businesses',
      badge: `${businessCount > 0 ? businessCount + ' your listings' : 'Verified businesses'}`,
      action: 'Browse Directory',
      route: '/business/directory',
      items: []
    },
    {
      icon: '📚',
      title: 'Information & Resources',
      description: 'Education, culture, language tools',
      badge: loading ? 'Loading...' : `${resourcesCount} resources available`,
      action: 'Explore Resources',
      route: '/resources',
      items: featuredResources.map(r => r.title)
    },
    {
      icon: '💼',
      title: 'Opportunities',
      description: 'Jobs, grants, funding',
      badge: 'Updated daily',
      action: 'View All',
      route: '/opportunities',
      items: []
    },
    {
      icon: '📅',
      title: 'Events & Networking',
      description: 'Connect with the community',
      badge: loading ? 'Loading...' : `${eventsCount} upcoming events`,
      action: 'See Events',
      route: '/events',
      items: upcomingEvents.map(e => e.title)
    }
  ];

  const handleTileClick = (tile) => {
    navigate(tile.route);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Quick Destinations
      </h2>

      {tiles.map((tile, index) => (
        <div
          key={index}
          className="bg-white/70 backdrop-blur-sm border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer"
          onClick={() => handleTileClick(tile)}
        >
          {/* Icon + Title */}
          <div className="flex items-start gap-3 mb-3">
            <div className="text-3xl">{tile.icon}</div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {tile.title}
              </h3>
              <p className="text-sm text-gray-600">
                {tile.description}
              </p>
            </div>
          </div>

          {/* Badge */}
          {tile.badge && (
            <div className="inline-block px-3 py-1 bg-yellow-400/20 text-yellow-900 text-xs font-semibold rounded-full mb-3">
              {tile.badge}
            </div>
          )}

          {/* Top Items List (for Resources and Events tiles) */}
          {tile.items && tile.items.length > 0 && (
            <div className="mb-3 space-y-1">
              {tile.items.slice(0, 3).map((item, idx) => (
                <div key={idx} className="text-xs text-gray-600 truncate">
                  • {item}
                </div>
              ))}
            </div>
          )}

          {/* CTA Button */}
          <button
            className="w-full px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition text-sm"
            onClick={(e) => {
              e.stopPropagation();
              handleTileClick(tile);
            }}
          >
            {tile.action}
          </button>
        </div>
      ))}

      {/* My Activity Tile */}
      <div className="bg-gradient-to-br from-yellow-400/20 to-yellow-500/10 backdrop-blur-sm border border-yellow-400/30 rounded-2xl p-5 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>📊</span>
          <span>My Activity</span>
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-yellow-400/20">
            <span className="text-gray-700">My Businesses</span>
            <span className="font-bold text-gray-900">{businessCount}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-yellow-400/20">
            <span className="text-gray-700">My Posts</span>
            <span className="font-bold text-gray-500">Phase 6.2</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-gray-700">My Applications</span>
            <span className="font-bold text-gray-500">Phase 6.2</span>
          </div>
        </div>

        <button
          onClick={() => navigate('/profile')}
          className="w-full mt-4 px-4 py-2 bg-yellow-400 text-black font-semibold rounded-lg hover:bg-yellow-500 transition text-sm"
        >
          View All Activity
        </button>
      </div>
    </div>
  );
};

export default QuickDestinations;
