import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { xhrRequest } from '../../utils/xhrRequest';

/**
 * BusinessProfileCreate - Phase 10.0 Issue #3
 * Streamlined business profile creation with Black-owned confirmation
 * Supports multi-business (users can create multiple profiles)
 */
const BusinessProfileCreate = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    city: '',
    state: '',
    bio: '',
    email: '',
    phone: '',
    is_black_owned_confirmed: false
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  const categories = [
    'Technology',
    'Retail',
    'Food & Beverage',
    'Healthcare',
    'Education',
    'Real Estate',
    'Finance',
    'Media & Entertainment',
    'Professional Services',
    'Beauty & Personal Care',
    'Automotive',
    'Construction',
    'Manufacturing',
    'Other'
  ];
  
  const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ];
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Business name is required';
    }
    
    if (!formData.industry) {
      newErrors.industry = 'Business category is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.bio.trim()) {
      newErrors.bio = 'Short description is required';
    } else if (formData.bio.trim().length < 20) {
      newErrors.bio = 'Description must be at least 20 characters';
    }
    
    // Require at least email OR phone
    if (!formData.email.trim() && !formData.phone.trim()) {
      newErrors.contact = 'Please provide at least an email or phone number';
    }
    
    // Validate email if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Please enter a valid email address';
      }
    }
    
    // Black-owned confirmation REQUIRED
    if (!formData.is_black_owned_confirmed) {
      newErrors.is_black_owned_confirmed = 'You must confirm this is a Black-owned business';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    setServerError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/business`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: formData.name.trim(),
            industry: formData.industry,
            city: formData.city.trim(),
            state: formData.state,
            bio: formData.bio.trim(),
            email: formData.email.trim() || null,
            phone: formData.phone.trim() || null,
            is_black_owned_confirmed: formData.is_black_owned_confirmed
          })
        }
      );
      
      if (response.ok) {
        // Navigate to the created business profile
        navigate(`/portal/business/${response.data.id}`);
      } else {
        setServerError(response.data.detail || 'Failed to create business profile');
      }
    } catch (err) {
      console.error('Error creating business:', err);
      setServerError('We couldn\'t create your business profile right now. Please try again later.');
    } finally {
      setSaving(false);
    }
  };
  
  return (
    <FullWidthLayout>
      <div
        className="min-h-screen py-8"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'
        }}
      >
        <div className="container mx-auto max-w-3xl px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/portal/business/profile')}
              className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
              style={{ color: isDark ? '#E8B657' : '#D4A446' }}
            >
              <ArrowLeft size={16} />
              Back
            </button>
            
            <h1
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
            >
              Create Business Profile
            </h1>
            <p
              className="text-lg"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              Join the BANIBS business community and connect with customers
            </p>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div
              className="p-8 rounded-xl mb-6"
              style={{
                background: isDark ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.9)',
                border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                boxShadow: isDark
                  ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                  : '0 8px 24px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* Server Error */}
              {serverError && (
                <div
                  className="mb-6 p-4 rounded-lg"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#EF4444'
                  }}
                >
                  {serverError}
                </div>
              )}
              
              {/* Business Name */}
              <div className="mb-6">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                >
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Atlanta Black Cafe"
                  className="w-full px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    border: `2px solid ${errors.name ? '#EF4444' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                    color: isDark ? '#F9F9F9' : '#1a1a1a'
                  }}
                />
                {errors.name && (
                  <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{errors.name}</p>
                )}
              </div>
              
              {/* Category */}
              <div className="mb-6">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                >
                  Business Category *
                </label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleChange('industry', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    border: `2px solid ${errors.industry ? '#EF4444' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                    color: isDark ? '#F9F9F9' : '#1a1a1a'
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option
                      key={cat}
                      value={cat}
                      style={{
                        background: isDark ? '#1a1a1a' : '#ffffff',
                        color: isDark ? '#F9F9F9' : '#1a1a1a'
                      }}
                    >
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.industry && (
                  <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{errors.industry}</p>
                )}
              </div>
              
              {/* Location Row */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="e.g., Atlanta"
                    className="w-full px-4 py-3 rounded-lg transition-colors"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      border: `2px solid ${errors.city ? '#EF4444' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                      color: isDark ? '#F9F9F9' : '#1a1a1a'
                    }}
                  />
                  {errors.city && (
                    <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{errors.city}</p>
                  )}
                </div>
                
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                  >
                    State *
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => handleChange('state', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg transition-colors"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                      border: `2px solid ${errors.state ? '#EF4444' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                      color: isDark ? '#F9F9F9' : '#1a1a1a'
                    }}
                  >
                    <option value="">Select State</option>
                    {US_STATES.map(state => (
                      <option
                        key={state}
                        value={state}
                        style={{
                          background: isDark ? '#1a1a1a' : '#ffffff',
                          color: isDark ? '#F9F9F9' : '#1a1a1a'
                        }}
                      >
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.state && (
                    <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{errors.state}</p>
                  )}
                </div>
              </div>
              
              {/* Short Description */}
              <div className="mb-6">
                <label
                  className="block text-sm font-semibold mb-2"
                  style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                >
                  Short Description * <span className="text-xs font-normal">(1-2 sentences)</span>
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  placeholder="Brief description of your business..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-lg transition-colors resize-none"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    border: `2px solid ${errors.bio ? '#EF4444' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                    color: isDark ? '#F9F9F9' : '#1a1a1a'
                  }}
                />
                {errors.bio && (
                  <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{errors.bio}</p>
                )}
              </div>
              
              {/* Contact Info */}
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                  >
                    Public Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="contact@yourbusiness.com"
                    className="w-full px-4 py-3 rounded-lg transition-colors"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      border: `2px solid ${errors.email ? '#EF4444' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                      color: isDark ? '#F9F9F9' : '#1a1a1a'
                    }}
                  />
                  {errors.email && (
                    <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <label
                    className="block text-sm font-semibold mb-2"
                    style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 rounded-lg transition-colors"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                      border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      color: isDark ? '#F9F9F9' : '#1a1a1a'
                    }}
                  />
                </div>
              </div>
              
              {errors.contact && (
                <p className="text-sm mb-6" style={{ color: '#EF4444' }}>{errors.contact}</p>
              )}
              
              {/* Black-Owned Confirmation */}
              <div
                className="mb-6 p-6 rounded-lg"
                style={{
                  background: isDark ? 'rgba(232, 182, 87, 0.1)' : 'rgba(232, 182, 87, 0.15)',
                  border: `2px solid ${errors.is_black_owned_confirmed ? '#EF4444' : (isDark ? 'rgba(232, 182, 87, 0.3)' : 'rgba(232, 182, 87, 0.4)')}`
                }}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_black_owned_confirmed}
                    onChange={(e) => handleChange('is_black_owned_confirmed', e.target.checked)}
                    className="mt-1"
                    style={{
                      width: '20px',
                      height: '20px',
                      cursor: 'pointer'
                    }}
                  />
                  <span
                    className="text-sm font-medium"
                    style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                  >
                    I confirm that this is a Black-owned business and I am authorized to represent it on BANIBS. *
                  </span>
                </label>
                {errors.is_black_owned_confirmed && (
                  <p className="text-sm mt-2" style={{ color: '#EF4444' }}>{errors.is_black_owned_confirmed}</p>
                )}
              </div>
              
              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 rounded-lg font-semibold text-lg transition-all flex items-center justify-center gap-2"
                style={{
                  background: saving
                    ? 'rgba(156, 163, 175, 0.3)'
                    : 'linear-gradient(135deg, #E8B657 0%, #D4A446 100%)',
                  color: saving ? '#9CA3AF' : '#0a0a0a',
                  cursor: saving ? 'not-allowed' : 'pointer',
                  boxShadow: saving
                    ? 'none'
                    : '0 4px 12px rgba(232, 182, 87, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 182, 87, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 182, 87, 0.3)';
                  }
                }}
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Creating Business Profile...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Create Business Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </FullWidthLayout>
  );
};

export default BusinessProfileCreate;
