import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapPin, Globe, Mail, Phone, Edit, Loader2, ExternalLink, Settings } from 'lucide-react';
import GlobalNavBar from '../../components/GlobalNavBar';
import ProfileCommandCenter from '../../components/profile/ProfileCommandCenter';
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
            setIsOwner(myBusiness.id === businessId);
          }
        } catch (err) {
          // User doesn't have a business profile
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

  return (
    <div className="business-profile-container" style={{'--accent-color': business.accent_color}}>
      <GlobalNavBar />
      {/* Cover Section */}
      <div className="business-cover">
        {business.cover ? (
          <img
            src={`${process.env.REACT_APP_BACKEND_URL}${business.cover}`}
            alt={`${business.name} cover`}
            className="cover-image"
          />
        ) : (
          <div className="cover-placeholder" style={{background: `linear-gradient(135deg, ${business.accent_color}20, ${business.accent_color}40)`}} />
        )}
      </div>

      {/* Business Header */}
      <div className="business-header">
        <div className="business-header-content">
          {/* Logo */}
          <div className="business-logo">
            {business.logo ? (
              <img
                src={`${process.env.REACT_APP_BACKEND_URL}${business.logo}`}
                alt={`${business.name} logo`}
              />
            ) : (
              <div className="logo-placeholder" style={{background: business.accent_color}}>
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

      {/* Main Content */}
      <div className="business-content">
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
                `${process.env.REACT_APP_BACKEND_URL}/api/business/${businessId}`,
                {
                  method: 'PATCH',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    profile_picture_url: businessDraft.profile_picture_url,
                    banner_image_url: businessDraft.banner_image_url,
                    accent_color: businessDraft.accent_color,
                  }),
                }
              );
              
              if (response.ok) {
                // Update local state
                setBusiness(prev => ({ ...prev, ...businessDraft }));
                setBusinessDraft(null);
                setCommandCenterOpen(false);
              } else {
                alert('Failed to save business profile changes');
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
