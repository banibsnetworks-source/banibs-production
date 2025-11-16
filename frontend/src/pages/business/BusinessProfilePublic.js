import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Globe, Mail, Phone, Edit, Loader2, ExternalLink, Settings, Check } from 'lucide-react';
import GlobalNavBar from '../../components/GlobalNavBar';
import ProfileCommandCenter from '../../components/profile/ProfileCommandCenter';
import BusinessInfoPanel from '../../components/business/BusinessInfoPanel';
import BusinessServicesList from '../../components/business/BusinessServicesList';
import './BusinessProfilePublic.css';

const BusinessProfilePublic = () => {
  const { businessId } = useParams();
  const navigate = useNavigate();
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [commandCenterOpen, setCommandCenterOpen] = useState(false);
  const [businessDraft, setBusinessDraft] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    loadBusinessProfile();
  }, [businessId]);

  const loadBusinessProfile = async () => {
    setLoading(true);
    try {
      // Load business profile
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/${businessId}`
      );

      if (!response.ok) {
        throw new Error('Business profile not found');
      }

      const data = await response.json();
      setBusiness(data);

      // Check if current user is owner
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const myBusinessResponse = await fetch(
            `${process.env.REACT_APP_BACKEND_URL}/api/business/me`,
            {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            }
          );

          if (myBusinessResponse.ok) {
            const myBusiness = await myBusinessResponse.json();
            // Compare with the loaded business ID, not the URL parameter
            setIsOwner(myBusiness.id === data.id);
          }
        } catch (err) {
          // User doesn't have a business profile
          console.log('User does not own a business profile');
        }
      }
    } catch (err) {
      console.error('Failed to load business profile:', err);
      setError('Business profile not found');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="business-profile-container">
        <div className="loading-state">
          <Loader2 size={32} className="spinner" />
          <p>Loading business profile...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="business-profile-container">
        <div className="error-state">
          <h2>Business Not Found</h2>
          <p>{error || 'The business profile you\'re looking for doesn\'t exist.'}</p>
          <button onClick={() => navigate('/portal/business')}>Browse Businesses</button>
        </div>
      </div>
    );
  }

  // Get font family based on font_style
  const getFontFamily = () => {
    switch(business?.font_style) {
      case 'modern':
        return "'Inter', 'Helvetica Neue', sans-serif";
      case 'serif':
        return "'Georgia', 'Times New Roman', serif";
      default:
        return "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
    }
  };

  return (
    <div 
      className="business-profile-container" 
      style={{
        '--accent-color': business.accent_color || '#EAB308',
        '--secondary-color': business.secondary_color || business.accent_color || '#EAB308',
        fontFamily: getFontFamily()
      }}
    >
      <GlobalNavBar />
      {/* Cover Section */}
      <div className="business-cover">
        {(business.banner_image_url || business.cover) ? (
          <img
            src={business.banner_image_url ? 
              (business.banner_image_url.startsWith('http') ? business.banner_image_url : `${process.env.REACT_APP_BACKEND_URL}${business.banner_image_url}`) :
              `${process.env.REACT_APP_BACKEND_URL}${business.cover}`
            }
            alt={`${business.name} cover`}
            className="cover-image"
          />
        ) : (
          <div className="cover-placeholder" style={{background: `linear-gradient(135deg, ${business.accent_color || '#EAB308'}20, ${business.accent_color || '#EAB308'}40)`}} />
        )}
      </div>

      {/* Business Header */}
      <div className="business-header">
        <div className="business-header-content">
          {/* Logo */}
          <div className="business-logo" style={{borderColor: business.accent_color || '#EAB308', borderWidth: '4px', borderStyle: 'solid'}}>
            {(business.profile_picture_url || business.logo) ? (
              <img
                src={business.profile_picture_url ? 
                  (business.profile_picture_url.startsWith('http') ? business.profile_picture_url : `${process.env.REACT_APP_BACKEND_URL}${business.profile_picture_url}`) :
                  `${process.env.REACT_APP_BACKEND_URL}${business.logo}`
                }
                alt={`${business.name} logo`}
              />
            ) : (
              <div className="logo-placeholder" style={{background: business.accent_color || '#EAB308'}}>
                {business.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="business-info">
            <h1>{business.name}</h1>
            {business.tagline && (
              <p className="tagline">{business.tagline}</p>
            )}
            {business.location && (
              <div className="location">
                <MapPin size={16} />
                <span>{business.location}</span>
              </div>
            )}
          </div>

          {/* Edit Button (Owner Only) - Phase 8.1 Enhanced */}
          {isOwner && (
            <div className="flex gap-2">
              <button
                className="edit-btn"
                onClick={() => setCommandCenterOpen(true)}
                style={{ backgroundColor: business.accent_color || '#EAB308' }}
              >
                <Settings size={18} />
                Customize
              </button>
              <button
                className="edit-btn"
                onClick={() => navigate('/portal/business/profile/edit')}
              >
                <Edit size={18} />
                Edit Info
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Phase 8.1 Stage 2 - Branding Block */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {business.name}
          </h1>
          {business.verified_status && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm">
              <Check className="w-4 h-4" />
              <span>Verified</span>
            </div>
          )}
        </div>
        
        {business.industry && (
          <span 
            className="inline-block px-3 py-1 rounded-full text-sm font-medium text-white mb-2"
            style={{ backgroundColor: business.secondary_color || business.accent_color || '#EAB308' }}
          >
            {business.industry}
          </span>
        )}
        
        {business.tagline && (
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-3">
            {business.tagline}
          </p>
        )}
        
        <div 
          className="h-1 w-24 rounded-full"
          style={{ backgroundColor: business.accent_color || '#EAB308' }}
        />
      </div>

      {/* Main Content */}
      <div className="business-content max-w-5xl mx-auto px-4 space-y-6">
        {/* Business Info Panel - Phase 8.1 Stage 2 */}
        <BusinessInfoPanel 
          business={business}
          isOwner={isOwner}
          onEdit={() => {
            setCommandCenterOpen(true);
            // Set initial tab to 'info' when opening from this button
          }}
        />

        {/* Services - Phase 8.1 Stage 2 */}
        <BusinessServicesList
          services={business.services || []}
          isOwner={isOwner}
          onEdit={() => {
            setCommandCenterOpen(true);
            // Set initial tab to 'services'
          }}
        />

        {/* About Section */}
        {business.bio && (
          <section className="content-section">
            <h2>About</h2>
            <p className="bio">{business.bio}</p>
          </section>
        )}

        {/* Services Section */}
        {business.services && business.services.length > 0 && (
          <section className="content-section">
            <h2>Services</h2>
            <div className="services-grid">
              {business.services.map((service, index) => (
                <div key={index} className="service-card">
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Contact Section */}
        {(business.website || business.email || business.phone) && (
          <section className="content-section">
            <h2>Contact</h2>
            <div className="contact-info">
              {business.website && (
                <a
                  href={business.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-item"
                >
                  <Globe size={20} />
                  <span>{business.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink size={16} className="external-icon" />
                </a>
              )}
              {business.email && (
                <a href={`mailto:${business.email}`} className="contact-item">
                  <Mail size={20} />
                  <span>{business.email}</span>
                </a>
              )}
              {business.phone && (
                <a href={`tel:${business.phone}`} className="contact-item">
                  <Phone size={20} />
                  <span>{business.phone}</span>
                </a>
              )}
            </div>
          </section>
        )}
      </div>
      
      {/* Phase 8.1 - Profile Command Center */}
      {isOwner && (
        <ProfileCommandCenter
          isOpen={commandCenterOpen}
          onClose={() => {
            setCommandCenterOpen(false);
            setBusinessDraft(null);
          }}
          mode="business"
          profile={businessDraft || business}
          onProfileChange={setBusinessDraft}
          onSave={async () => {
            if (!businessDraft) {
              setCommandCenterOpen(false);
              return;
            }
            
            try {
              setIsSavingProfile(true);
              
              // Update backend via business profile endpoint
              const token = localStorage.getItem('access_token');
              const response = await fetch(
                `${process.env.REACT_APP_BACKEND_URL}/api/business/${business.id}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    tagline: businessDraft.tagline || undefined,
                    profile_picture_url: businessDraft.profile_picture_url || undefined,
                    banner_image_url: businessDraft.banner_image_url || undefined,
                    accent_color: businessDraft.accent_color || undefined,
                    secondary_color: businessDraft.secondary_color || undefined,
                    header_style: businessDraft.header_style || undefined,
                    font_style: businessDraft.font_style || undefined,
                    address: businessDraft.address || undefined,
                    phone: businessDraft.phone || undefined,
                    website_url: businessDraft.website_url || undefined,
                    hours: businessDraft.hours || undefined,
                    services: businessDraft.services || undefined,
                  }),
                }
              );
              
              if (response.ok) {
                // Update local state
                setBusiness(prev => ({ ...prev, ...businessDraft }));
                setBusinessDraft(null);
                setCommandCenterOpen(false);
              } else {
                const errorData = await response.json().catch(() => ({}));
                console.error('Save failed:', errorData);
                alert(`Failed to save: ${errorData.detail || 'Unknown error'}`);
              }
            } catch (error) {
              console.error('Error saving business profile:', error);
              alert('Failed to save business profile changes');
            } finally {
              setIsSavingProfile(false);
            }
          }}
          isSaving={isSavingProfile}
        />
      )}
    </div>
  );
};

export default BusinessProfilePublic;
