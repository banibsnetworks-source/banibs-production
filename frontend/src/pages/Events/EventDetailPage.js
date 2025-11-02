import React, { useState, useEffect, useContext } from 'react';
import { Link, useParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function EventDetailPage() {
  const { id } = useParams();
  const { user, accessToken } = useContext(AuthContext);
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rsvpLoading, setRsvpLoading] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${id}`);
      if (!response.ok) {
        if (response.status === 404) throw new Error('Event not found');
        throw new Error('Failed to fetch event');
      }
      
      const data = await response.json();
      setEvent(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!accessToken) {
      alert('Please login to RSVP');
      return;
    }

    setRsvpLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${id}/rsvp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Failed to RSVP');
      }

      await fetchEvent();
      alert('✅ RSVP confirmed!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setRsvpLoading(false);
    }
  };

  const handleCancelRSVP = async () => {
    setRsvpLoading(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/events/${id}/rsvp`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });

      if (!response.ok) throw new Error('Failed to cancel RSVP');
      await fetchEvent();
      alert('RSVP cancelled');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setRsvpLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getEventTypeIcon = (eventType) => {
    const icons = { 'Virtual': '🌐', 'In-Person': '📍', 'Hybrid': '🔀' };
    return icons[eventType] || '📅';
  };

  const isUserRSVPd = () => user && event?.rsvp_users?.includes(user.id);
  const isUpcoming = event?.status === 'upcoming';
  const isFull = event?.rsvp_limit && event?.rsvp_count >= event?.rsvp_limit;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
          <p className="text-gray-400 mt-4">Loading event...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
            <p className="text-red-300">{error}</p>
            <Link to="/events" className="inline-block mt-6 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors">
              ← Back to Events
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="bg-black border-b border-yellow-500/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/events" className="text-yellow-500 hover:text-yellow-400 inline-block">← Back to Events</Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-8 border-b border-gray-800">
            {event.featured && (
              <div className="mb-4">
                <span className="inline-block bg-yellow-500/20 text-yellow-500 text-sm font-semibold px-4 py-2 rounded-full border border-yellow-500/30">
                  ⭐ Featured Event
                </span>
              </div>
            )}

            <div className="flex items-center gap-4 mb-4">
              <span className="text-4xl">{getEventTypeIcon(event.event_type)}</span>
              <div>
                <div className="text-sm text-gray-500">{event.event_type}</div>
                <div className="text-sm text-yellow-500">{event.category}</div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">{event.title}</h1>
            <p className="text-xl text-gray-300 leading-relaxed mb-6">{event.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="bg-black/50 p-4 rounded-lg">
                <div className="text-gray-500 mb-1">📅 Date & Time</div>
                <div className="text-white font-semibold">{formatDate(event.start_date)}</div>
                <div className="text-gray-400 text-xs mt-1">Ends: {formatDate(event.end_date)}</div>
              </div>

              {event.event_type === 'In-Person' && (
                <div className="bg-black/50 p-4 rounded-lg">
                  <div className="text-gray-500 mb-1">📍 Location</div>
                  <div className="text-white font-semibold">{event.location_name || 'TBA'}</div>
                  {event.location_address && <div className="text-gray-400 text-xs mt-1">{event.location_address}</div>}
                </div>
              )}

              {(event.event_type === 'Virtual' || event.event_type === 'Hybrid') && event.virtual_url && (
                <div className="bg-black/50 p-4 rounded-lg">
                  <div className="text-gray-500 mb-1">🌐 Virtual Link</div>
                  <a href={event.virtual_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm">
                    Join Virtual Event →
                  </a>
                </div>
              )}

              <div className="bg-black/50 p-4 rounded-lg">
                <div className="text-gray-500 mb-1">👤 Organizer</div>
                <div className="text-white font-semibold">{event.organizer_name || 'BANIBS'}</div>
                <div className="text-gray-400 text-xs mt-1">{event.organizer_email}</div>
              </div>

              <div className="bg-black/50 p-4 rounded-lg">
                <div className="text-gray-500 mb-1">👥 Attendance</div>
                <div className="text-white font-semibold">
                  {event.rsvp_count || 0} {event.rsvp_limit ? `/ ${event.rsvp_limit}` : ''} registered
                </div>
              </div>
            </div>

            {event.tags && event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {event.tags.map((tag, idx) => (
                  <span key={idx} className="bg-gray-800 text-gray-400 text-sm px-3 py-1 rounded-full">#{tag}</span>
                ))}
              </div>
            )}
          </div>

          <div className="p-8">
            {isUpcoming && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">RSVP for this Event</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-yellow-500 mb-1">
                      {event.rsvp_count || 0}{event.rsvp_limit && <span className="text-gray-500">/{event.rsvp_limit}</span>}
                    </div>
                    <div className="text-sm text-gray-400">people attending</div>
                  </div>
                  <div>
                    {!user ? (
                      <Link to="/login" className="bg-gray-700 hover:bg-gray-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors">
                        Login to RSVP
                      </Link>
                    ) : isUserRSVPd() ? (
                      <button onClick={handleCancelRSVP} disabled={rsvpLoading} className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50">
                        {rsvpLoading ? 'Cancelling...' : '✓ Cancel RSVP'}
                      </button>
                    ) : isFull ? (
                      <button disabled className="bg-gray-700 text-gray-500 font-semibold px-6 py-3 rounded-lg cursor-not-allowed">Event Full</button>
                    ) : (
                      <button onClick={handleRSVP} disabled={rsvpLoading} className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-3 rounded-lg transition-colors disabled:opacity-50">
                        {rsvpLoading ? 'Processing...' : 'RSVP Now'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {!isUpcoming && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
                <p className="text-gray-400">This event has ended.</p>
              </div>
            )}
          </div>
        </article>

        <div className="mt-8 text-center">
          <Link to="/events" className="inline-block bg-gray-800 hover:bg-gray-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
            ← Back to All Events
          </Link>
        </div>
      </div>
    </div>
  );
}

export default EventDetailPage;
