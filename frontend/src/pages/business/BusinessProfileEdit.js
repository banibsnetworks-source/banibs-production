import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Upload, X, Plus, Trash2, Loader2 } from 'lucide-react';
import GlobalNavBar from '../../components/GlobalNavBar';
import { xhrRequest } from '../../utils/xhrRequest';
import './BusinessProfileEdit.css';

const ACCENT_COLORS = [
  { name: 'Gold', value: '#d4af37' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Indigo', value: '#6366f1' }
];

const BusinessProfileEdit = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    bio: '',
    logo: '',
    cover: '',
    accent_color: '#d4af37',
    website: '',
    email: '',
    phone: '',
    location: '',
    services: []
  });

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  useEffect(() => {
    loadBusinessProfile();
  }, []);

  const loadBusinessProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/business/me`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setBusinessId(response.data.id);
        setFormData({
          name: response.data.name || '',
          tagline: response.data.tagline || '',
          bio: response.data.bio || '',
          logo: response.data.logo || '',
          cover: response.data.cover || '',
          accent_color: response.data.accent_color || '#d4af37',
          website: response.data.website || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          location: response.data.location || '',
          services: response.data.services || []
        });
      } else if (response.status === 404) {
        // No business profile yet
        setBusinessId(null);
      }
    } catch (err) {
      console.error('Failed to load business profile:', err);
      setError('Failed to load business profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file, type) => {
    const setUploading = type === 'logo' ? setUploadingLogo : setUploadingCover;
    setUploading(true);

    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', file);

      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/media/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`
          },
          body: formDataUpload
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFormData(prev => ({
          ...prev,
          [type]: data.url
        }));
      } else {
        alert('Failed to upload image');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddService = () => {
    setFormData(prev => ({
      ...prev,
      services: [...prev.services, { title: '', description: '' }]
    }));
  };

  const handleRemoveService = (index) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter((_, i) => i !== index)
    }));
  };

  const handleServiceChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const token = localStorage.getItem('access_token');
      const url = businessId
        ? `${process.env.REACT_APP_BACKEND_URL}/api/business/${businessId}`
        : `${process.env.REACT_APP_BACKEND_URL}/api/business`;
      
      const method = businessId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        setBusinessId(data.id);
        alert('Business profile saved successfully!');
        navigate(`/portal/business/${data.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to save business profile');
      }
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save business profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="business-edit-container">
        <div className="loading-state">
          <Loader2 size={32} className="spinner" />
          <p>Loading business profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="business-edit-container">
      <GlobalNavBar />
      <div className="business-edit-header">
        <h1>Business Identity Studio</h1>
        <p>Create and customize your business presence on BANIBS</p>
      </div>

      {error && (
        <div className="error-message">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="business-edit-form">
        {/* Basic Info Section */}
        <section className="form-section">
          <h2>Basic Information</h2>
          
          <div className="form-group">
            <label>Business Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              maxLength={100}
            />
          </div>

          <div className="form-group">
            <label>Tagline</label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="A short, catchy description..."
              maxLength={200}
            />
          </div>

          <div className="form-group">
            <label>About Your Business</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell your story..."
              rows={5}
              maxLength={1000}
            />
          </div>
        </section>

        {/* Branding Section */}
        <section className="form-section">
          <h2>Branding</h2>

          {/* Logo Upload */}
          <div className="form-group">
            <label>Logo</label>
            <div className="image-upload-area">
              {formData.logo ? (
                <div className="image-preview">
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${formData.logo}`}
                    alt="Logo"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => setFormData({ ...formData, logo: '' })}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'logo')}
                    style={{ display: 'none' }}
                  />
                  {uploadingLogo ? (
                    <Loader2 size={20} className="spinner" />
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>Upload Logo</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Cover Upload */}
          <div className="form-group">
            <label>Cover Image</label>
            <div className="image-upload-area cover">
              {formData.cover ? (
                <div className="image-preview cover">
                  <img
                    src={`${process.env.REACT_APP_BACKEND_URL}${formData.cover}`}
                    alt="Cover"
                  />
                  <button
                    type="button"
                    className="remove-image-btn"
                    onClick={() => setFormData({ ...formData, cover: '' })}
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="upload-button">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0], 'cover')}
                    style={{ display: 'none' }}
                  />
                  {uploadingCover ? (
                    <Loader2 size={20} className="spinner" />
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>Upload Cover</span>
                    </>
                  )}
                </label>
              )}
            </div>
          </div>

          {/* Accent Color Picker */}
          <div className="form-group">
            <label>Accent Color</label>
            <div className="color-picker">
              {ACCENT_COLORS.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`color-option ${formData.accent_color === color.value ? 'selected' : ''}`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData({ ...formData, accent_color: color.value })}
                  title={color.name}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Contact Info Section */}
        <section className="form-section">
          <h2>Contact Information</h2>

          <div className="form-row">
            <div className="form-group">
              <label>Website</label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@business.com"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 123-4567"
                maxLength={20}
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="City, State"
                maxLength={200}
              />
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="form-section">
          <div className="section-header">
            <h2>Services Offered</h2>
            <button
              type="button"
              className="add-service-btn"
              onClick={handleAddService}
            >
              <Plus size={16} />
              Add Service
            </button>
          </div>

          {formData.services.length === 0 ? (
            <p className="empty-state">No services added yet. Click "Add Service" to get started.</p>
          ) : (
            <div className="services-list">
              {formData.services.map((service, index) => (
                <div key={index} className="service-item">
                  <div className="service-fields">
                    <input
                      type="text"
                      value={service.title}
                      onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                      placeholder="Service Title"
                      maxLength={100}
                      required
                    />
                    <textarea
                      value={service.description}
                      onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                      placeholder="Brief description..."
                      rows={2}
                      maxLength={500}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    className="remove-service-btn"
                    onClick={() => handleRemoveService(index)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Submit Button */}
        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/portal/business')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="save-btn"
            disabled={saving || !formData.name}
          >
            {saving ? (
              <>
                <Loader2 size={18} className="spinner" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                {businessId ? 'Save Changes' : 'Create Business Profile'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BusinessProfileEdit;
