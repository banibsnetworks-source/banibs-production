import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

const CATEGORIES = [
  'All',
  'Networking',
  'Workshop',
  'Webinar',
  'Conference',
  'Meetup',
  'Social Gathering'
];

const EVENT_TYPES = ['All', 'Virtual', 'In-Person', 'Hybrid'];

function EventsPage() {
  const { user, accessToken } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEventType, setSelectedEventType] = useState('All');
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'past'
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [rsvpLoading, setRsvpLoading] = useState({});

  useEffect(() => {
    fetchEvents();
  }, [page, selectedCategory, selectedEventType, activeTab, showFeaturedOnly]);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${BACKEND_URL}/api/events?page=${page}&limit=20`;
      
      if (selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      
      if (selectedEventType !== 'All') {
        url += `&event_type=${encodeURIComponent(selectedEventType)}`;
      }
      
      if (activeTab === 'upcoming') {
        url += '&status=upcoming';
      } else {
        url += '&status=completed';
      }
      
      if (showFeaturedOnly) {
        url += '&featured=true';
      }
      
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }

      const response = await fetch(url);
      
      if (!response.ok) {
        // Consume the response body to prevent clone errors
        try {
          await response.text();
        } catch (e) {
          // Ignore parsing errors
        }
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      setEvents(data.events || []);
      setTotal(data.total || 0);
      setTotalPages(data.pages || 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEvents();
  };

  const handleRSVP = async (eventId) => {
    if (!accessToken) {
      alert('Please login to RSVP to events');
      return;
    }

    setRsvpLoading(prev => ({ ...prev, [eventId]: true }));
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (parseError) {
          // If parsing fails, use empty object
          errorData = {};
        }
        throw new Error(errorData.detail || 'Failed to RSVP');
      }

      // Refresh events to show updated RSVP count
      await fetchEvents();
      alert('✅ RSVP confirmed! You\'re registered for this event.');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setRsvpLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const handleCancelRSVP = async (eventId) => {
    if (!accessToken) return;

    setRsvpLoading(prev => ({ ...prev, [eventId]: true }));
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${eventId}/rsvp`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel RSVP');
      }

      await fetchEvents();
      alert('RSVP cancelled successfully');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setRsvpLoading(prev => ({ ...prev, [eventId]: false }));
    }
  };

  const getEventTypeIcon = (eventType) => {
    const icons = {
      'Virtual': '🌐',
      'In-Person': '📍',
      'Hybrid': '🔀'
    };
    return icons[eventType] || '📅';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const isUserRSVPd = (event) => {
    return user && event.rsvp_users && event.rsvp_users.includes(user.id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/hub" className="text-yellow-500 hover:text-yellow-400 mb-4 inline-block">
            ← Back to Hub
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Events & Networking</h1>
          <p className="text-gray-400">Community gatherings, workshops, and networking opportunities</p>
          <div className="mt-4 text-sm text-gray-500">
            {total} {total === 1 ? 'event' : 'events'} {activeTab === 'upcoming' ? 'upcoming' : 'completed'}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => {
              setActiveTab('upcoming');
              setPage(1);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📅 Upcoming Events
          </button>
          <button
            onClick={() => {
              setActiveTab('past');
              setPage(1);
            }}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'past'
                ? 'bg-yellow-500 text-black'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            🕐 Past Events
          </button>
        </div>

        {/* Filters */}
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search events by title or description..."
                className="flex-1 bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
              <button
                type="submit"
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Search
              </button>
            </div>
          </form>

          {/* Category Filters */}
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === category
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Event Type Filters */}
          <div className="mb-4">
            <label className="text-gray-400 text-sm mb-2 block">Event Type</label>
            <div className="flex flex-wrap gap-2">
              {EVENT_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedEventType(type);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedEventType === type
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {type !== 'All' && getEventTypeIcon(type)} {type}
                </button>
              ))}
            </div>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="featured-events"
              checked={showFeaturedOnly}
              onChange={(e) => {
                setShowFeaturedOnly(e.target.checked);
                setPage(1);
              }}
              className="w-4 h-4 text-yellow-500 bg-gray-700 border-gray-600 rounded focus:ring-yellow-500"
            />
            <label htmlFor="featured-events" className="text-gray-300 cursor-pointer">
              Show featured events only
            </label>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
            <p className="text-gray-400 mt-4">Loading events...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {/* Events List */}
        {!loading && !error && (
          <>
            {events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No events found matching your criteria.</p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedEventType('All');
                    setShowFeaturedOnly(false);
                    setPage(1);
                    fetchEvents();
                  }}
                  className="mt-4 text-yellow-500 hover:text-yellow-400 underline"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="space-y-6 mb-8">
                  {events.map((event) => {
                    const userHasRSVPd = isUserRSVPd(event);
                    const isUpcoming = activeTab === 'upcoming';
                    const isFull = event.rsvp_limit && event.rsvp_count >= event.rsvp_limit;

                    return (
                      <div
                        key={event.id}
                        className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 hover:border-yellow-500/50 transition-all"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                          {/* Left: Event Info */}
                          <div className="flex-1">
                            {/* Featured Badge */}
                            {event.featured && (
                              <div className="mb-3">
                                <span className="inline-block bg-yellow-500/20 text-yellow-500 text-xs font-semibold px-3 py-1 rounded-full border border-yellow-500/30">
                                  ⭐ Featured Event
                                </span>
                              </div>
                            )}

                            {/* Title */}
                            <Link
                              to={`/events/${event.id}`}
                              className="text-2xl font-bold text-white hover:text-yellow-500 transition-colors mb-3 block"
                            >
                              {event.title}
                            </Link>

                            {/* Meta Info */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-4">
                              <div className="flex items-center gap-2">
                                <span>📅</span>
                                <span>{formatDate(event.start_date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span>{getEventTypeIcon(event.event_type)}</span>
                                <span>{event.event_type}</span>
                              </div>
                              {event.event_type === 'Virtual' && event.virtual_url && (
                                <span className="bg-blue-900/30 text-blue-400 px-2 py-1 rounded">Virtual</span>
                              )}
                              {event.event_type === 'In-Person' && event.location_name && (
                                <span className="text-gray-500">📍 {event.location_name}</span>
                              )}
                              <span className="bg-gray-800 text-gray-400 px-2 py-1 rounded text-xs">
                                {event.category}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-300 mb-4 line-clamp-2">
                              {event.description}
                            </p>

                            {/* Tags */}
                            {event.tags && event.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {event.tags.slice(0, 5).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Right: RSVP Section */}
                          <div className="lg:w-64 flex-shrink-0">
                            <div className="bg-black/50 rounded-lg p-4 border border-gray-800">
                              {/* RSVP Count */}
                              <div className="text-center mb-4">
                                <div className="text-3xl font-bold text-yellow-500 mb-1">
                                  {event.rsvp_count || 0}
                                  {event.rsvp_limit && <span className="text-gray-500">/{event.rsvp_limit}</span>}
                                </div>
                                <div className="text-sm text-gray-400">
                                  {event.rsvp_count === 1 ? 'person attending' : 'people attending'}
                                </div>
                              </div>

                              {/* RSVP Buttons (only for upcoming events) */}
                              {isUpcoming && (
                                <>
                                  {!user ? (
                                    <Link
                                      to="/login"
                                      className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold px-4 py-3 rounded-lg transition-colors text-center"
                                    >
                                      Login to RSVP
                                    </Link>
                                  ) : userHasRSVPd ? (
                                    <button
                                      onClick={() => handleCancelRSVP(event.id)}
                                      disabled={rsvpLoading[event.id]}
                                      className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                      {rsvpLoading[event.id] ? 'Cancelling...' : '✓ Cancel RSVP'}
                                    </button>
                                  ) : isFull ? (
                                    <button
                                      disabled
                                      className="w-full bg-gray-700 text-gray-500 font-semibold px-4 py-3 rounded-lg cursor-not-allowed"
                                    >
                                      Event Full
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleRSVP(event.id)}
                                      disabled={rsvpLoading[event.id]}
                                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-3 rounded-lg transition-colors disabled:opacity-50"
                                    >
                                      {rsvpLoading[event.id] ? 'Processing...' : 'RSVP Now'}
                                    </button>
                                  )}
                                </>
                              )}

                              {/* View Details Link */}
                              <Link
                                to={`/events/${event.id}`}
                                className="block mt-3 text-center text-yellow-500 hover:text-yellow-400 text-sm transition-colors"
                              >
                                View Details →
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        page === 1
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      ← Previous
                    </button>
                    
                    <span className="text-gray-400">
                      Page {page} of {totalPages}
                    </span>
                    
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        page === totalPages
                          ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                          : 'bg-gray-800 text-white hover:bg-gray-700'
                      }`}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default EventsPage;