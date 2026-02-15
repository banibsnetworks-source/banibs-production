import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  ArrowLeft, MapPin, MessageCircle, Flag, EyeOff, 
  Trash2, Edit2, ChevronLeft, ChevronRight, Share2,
  AlertCircle, Check, X, MoreHorizontal, Clock
} from 'lucide-react';
import FullWidthLayout from '../../../components/layouts/FullWidthLayout';
import PinButton from '../../../components/pins/PinButton';

/**
 * Listing Detail Page - Local Exchange
 * 
 * View single listing, contact seller, report/hide
 * Integrated with ChatSphere for messaging
 */

const CATEGORY_LABELS = {
  furniture: 'Furniture',
  electronics: 'Electronics',
  clothing: 'Clothing & Accessories',
  vehicles: 'Vehicles',
  home: 'Home & Garden',
  sports: 'Sports & Outdoors',
  toys: 'Toys & Games',
  books: 'Books & Media',
  baby: 'Baby & Kids',
  free: 'Free Items',
  services: 'Local Services',
  other: 'Other',
};

const CONDITION_LABELS = {
  new: 'New',
  like_new: 'Like New',
  good: 'Good',
  fair: 'Fair',
  for_parts: 'For Parts',
};

const ListingDetailPage = () => {
  const { listingId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chatAutoTriggered = useRef(false);

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportCategory, setReportCategory] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  const API_URL = process.env.REACT_APP_BACKEND_URL;


  // Fetch listing
  const fetchListing = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const res = await fetch(`${API_URL}/api/local-exchange/listings/${listingId}`, { headers });
      
      if (!res.ok) {
        if (res.status === 404) {
          throw new Error('Listing not found');
        }
        throw new Error('Failed to fetch listing');
      }

      const data = await res.json();
      setListing(data);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [API_URL, listingId]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  const isOwner = user && listing && user.id === listing.seller_id;

  const handlePrevPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev === 0 ? (listing.photos.length - 1) : prev - 1
    );
  };

  const handleNextPhoto = () => {
    setCurrentPhotoIndex(prev => 
      prev === listing.photos.length - 1 ? 0 : prev + 1
    );
  };

  const handleMessageSeller = async () => {
    // Guest handling - redirect to login with return URL
    if (!user) {
      const returnUrl = encodeURIComponent(`/socialworld/local/${listingId}?action=chat`);
      navigate(`/auth/signin?redirect=${returnUrl}`);
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/local-exchange/listings/${listingId}/initiate-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to start conversation');
      }

      const data = await res.json();
      
      // Navigate to ChatSphere with the conversation
      navigate(`/socialworld/chat/${data.conversation_id}`);
    } catch (err) {
      console.error('Error initiating chat:', err);
      setActionMessage({ type: 'error', text: err.message || 'Failed to start conversation. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  // Auto-trigger chat if user came from login with action=chat parameter
  useEffect(() => {
    if (
      user && 
      listing && 
      !loading && 
      searchParams.get('action') === 'chat' &&
      !chatAutoTriggered.current &&
      listing.seller_id !== user.id &&
      listing.status === 'active'
    ) {
      chatAutoTriggered.current = true;
      // Clear the action param to prevent re-triggering
      searchParams.delete('action');
      setSearchParams(searchParams, { replace: true });
      // Trigger the chat
      handleMessageSeller();
    }
  }, [user, listing, loading, searchParams]);

  const handleReport = async () => {
    if (!reportReason.trim() || !reportCategory) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/local-exchange/listings/${listingId}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: reportReason,
          category: reportCategory
        })
      });

      if (!res.ok) throw new Error('Failed to submit report');

      setActionMessage({ type: 'success', text: 'Report submitted. Thank you for helping keep BANIBS safe.' });
      setShowReportModal(false);
      setReportReason('');
      setReportCategory('');
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to submit report. Please try again.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleHide = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`${API_URL}/api/local-exchange/listings/${listingId}/hide`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setActionMessage({ type: 'success', text: 'Listing hidden from your feed.' });
      setTimeout(() => navigate('/socialworld/local'), 1500);
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to hide listing.' });
    } finally {
      setActionLoading(false);
      setShowMenu(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing? This cannot be undone.')) {
      return;
    }

    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/local-exchange/listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete listing');

      navigate('/socialworld/local');
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to delete listing.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkSold = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_URL}/api/local-exchange/listings/${listingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'sold' })
      });

      if (!res.ok) throw new Error('Failed to update listing');

      setListing(prev => ({ ...prev, status: 'sold' }));
      setActionMessage({ type: 'success', text: 'Listing marked as sold.' });
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to update listing.' });
    } finally {
      setActionLoading(false);
      setShowMenu(false);
    }
  };

  const formatPrice = (price, isFree) => {
    if (isFree || price === 0) return 'Free';
    return `$${price.toLocaleString()}`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Loading state
  if (loading) {
    return (
      <FullWidthLayout>
        <div 
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}
        >
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>Loading listing...</p>
          </div>
        </div>
      </FullWidthLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <FullWidthLayout>
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: isDark ? '#0a0a0a' : '#fafafa' }}
        >
          <div className="text-center max-w-md">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)' }}
            >
              <AlertCircle size={32} className="text-red-500" />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
              {error}
            </h2>
            <p className="text-sm mb-4" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
              This listing may have been removed or is no longer available.
            </p>
            <Link
              to="/socialworld/local"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-amber-500 text-black"
            >
              <ArrowLeft size={18} />
              Back to Local Exchange
            </Link>
          </div>
        </div>
      </FullWidthLayout>
    );
  }

  return (
    <FullWidthLayout>
      <div 
        className="min-h-screen"
        style={{ 
          backgroundColor: isDark ? '#0a0a0a' : '#fafafa',
          color: isDark ? '#e5e5e5' : '#1a1a1a'
        }}
      >
        {/* Header */}
        <header 
          className="sticky top-0 z-50 border-b"
          style={{ 
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(250, 250, 250, 0.95)',
            borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate('/socialworld/local')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
            >
              <ArrowLeft size={20} />
              <span className="hidden sm:inline text-sm">Back</span>
            </button>
            
            <div className="flex-1" />

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)'
                }}
              >
                <MoreHorizontal size={20} />
              </button>

              {showMenu && (
                <div 
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg overflow-hidden z-50"
                  style={{
                    backgroundColor: isDark ? '#1a1a1a' : '#fff',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                  }}
                >
                  {isOwner ? (
                    <>
                      <Link
                        to={`/socialworld/local/${listingId}/edit`}
                        className="flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                        style={{ color: isDark ? '#fff' : '#111' }}
                      >
                        <Edit2 size={16} />
                        Edit Listing
                      </Link>
                      {listing.status !== 'sold' && (
                        <button
                          onClick={handleMarkSold}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-green-500"
                        >
                          <Check size={16} />
                          Mark as Sold
                        </button>
                      )}
                      <button
                        onClick={handleDelete}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-red-500"
                      >
                        <Trash2 size={16} />
                        Delete Listing
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleHide}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors"
                        style={{ color: isDark ? '#fff' : '#111' }}
                      >
                        <EyeOff size={16} />
                        Hide Listing
                      </button>
                      <button
                        onClick={() => { setShowReportModal(true); setShowMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors text-red-500"
                      >
                        <Flag size={16} />
                        Report Listing
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Action Message */}
        {actionMessage && (
          <div 
            className={`fixed top-20 left-1/2 -translate-x-1/2 px-4 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 ${
              actionMessage.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}
          >
            {actionMessage.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span className="text-sm">{actionMessage.text}</span>
            <button onClick={() => setActionMessage(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-4xl mx-auto">
          {/* Photo Gallery */}
          <div 
            className="relative aspect-[4/3] sm:aspect-video"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
          >
            {listing.photos && listing.photos.length > 0 ? (
              <>
                <img
                  src={listing.photos[currentPhotoIndex]}
                  alt={`${listing.title} - Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />
                
                {listing.photos.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevPhoto}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={handleNextPhoto}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white"
                    >
                      <ChevronRight size={24} />
                    </button>
                    
                    {/* Photo dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                      {listing.photos.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentPhotoIndex(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">📦</span>
              </div>
            )}

            {/* Status badges */}
            {listing.status === 'sold' && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-gray-900/80 text-white text-sm font-medium">
                Sold
              </div>
            )}
            {listing.is_free && listing.status !== 'sold' && (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg bg-green-500 text-white text-sm font-medium">
                Free
              </div>
            )}
          </div>

          {/* Details */}
          <div className="px-4 py-6 space-y-6">
            {/* Price & Title */}
            <div>
              <p 
                className="text-3xl font-bold mb-2"
                style={{ color: listing.is_free ? 'rgb(34, 197, 94)' : 'rgb(245, 158, 11)' }}
              >
                {formatPrice(listing.price, listing.is_free)}
              </p>
              <h1 className="text-xl font-semibold" style={{ color: isDark ? '#fff' : '#111' }}>
                {listing.title}
              </h1>
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {listing.location_city}{listing.location_state && `, ${listing.location_state}`}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} />
                Listed {formatDate(listing.created_at)}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                {CATEGORY_LABELS[listing.category] || listing.category}
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                {CONDITION_LABELS[listing.condition] || listing.condition}
              </span>
            </div>

            {/* Description */}
            <div>
              <h2 className="text-sm font-semibold mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                Description
              </h2>
              <p 
                className="text-sm whitespace-pre-wrap"
                style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
              >
                {listing.description}
              </p>
            </div>

            {/* Seller Info */}
            <div 
              className="p-4 rounded-xl"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
              }}
            >
              <div className="flex items-center gap-3">
                {listing.seller_avatar ? (
                  <img 
                    src={listing.seller_avatar} 
                    alt={listing.seller_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg"
                    style={{ backgroundColor: 'rgb(245, 158, 11)', color: '#000' }}
                  >
                    {listing.seller_name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <p className="font-medium" style={{ color: isDark ? '#fff' : '#111' }}>
                    {listing.seller_name}
                  </p>
                  <p className="text-xs" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                    Seller
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Button + Save */}
            {!isOwner && listing.status !== 'sold' && (
              <div className="flex gap-2">
                <button
                  onClick={handleMessageSeller}
                  disabled={actionLoading}
                  className="flex-1 py-4 rounded-xl text-lg font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: 'rgb(245, 158, 11)',
                    color: '#000'
                  }}
                  data-testid="message-seller-btn"
                >
                  <MessageCircle size={22} />
                  {actionLoading ? 'Starting conversation...' : (user ? 'Message Seller' : 'Sign in to Message')}
                </button>
                <PinButton
                  contentType="listing"
                  contentId={listing.id}
                  snapshot={{
                    title: listing.title,
                    subtitle: formatPrice(listing.price, listing.is_free),
                    image_url: listing.photos?.[0],
                    route: `/socialworld/local/${listing.id}`
                  }}
                  size="lg"
                  className="px-4"
                />
              </div>
            )}

            {listing.status === 'sold' && (
              <div 
                className="w-full py-4 rounded-xl text-center text-lg font-semibold"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)'
                }}
              >
                This item has been sold
              </div>
            )}

            {/* Safety Reminder */}
            <div 
              className="p-4 rounded-xl text-xs"
              style={{
                backgroundColor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)',
                color: isDark ? 'rgb(147, 197, 253)' : 'rgb(59, 130, 246)'
              }}
            >
              <p className="font-medium mb-1">Safety Reminder</p>
              <p>Meet in a public place. Never share personal financial information. 
              Report suspicious activity.</p>
            </div>
          </div>
        </main>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div 
              className="w-full max-w-md rounded-2xl p-6"
              style={{ backgroundColor: isDark ? '#1a1a1a' : '#fff' }}
            >
              <h2 className="text-lg font-semibold mb-4" style={{ color: isDark ? '#fff' : '#111' }}>
                Report Listing
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    Category
                  </label>
                  <select
                    value={reportCategory}
                    onChange={(e) => setReportCategory(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg outline-none"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      color: isDark ? '#fff' : '#111',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}
                  >
                    <option value="">Select a reason</option>
                    <option value="spam">Spam or fake listing</option>
                    <option value="scam">Scam or fraud</option>
                    <option value="inappropriate">Inappropriate content</option>
                    <option value="prohibited">Prohibited item</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    Details
                  </label>
                  <textarea
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Please describe the issue..."
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg outline-none resize-none"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      color: isDark ? '#fff' : '#111',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                    }}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="flex-1 py-2 rounded-lg text-sm font-medium"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#fff' : '#111'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReport}
                  disabled={!reportCategory || !reportReason.trim() || actionLoading}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500 text-white disabled:opacity-50"
                >
                  {actionLoading ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FullWidthLayout>
  );
};

export default ListingDetailPage;
