import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, X, Loader2 } from 'lucide-react';
import BusinessLayout from '../../components/business/BusinessLayout';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { xhrRequest } from '../../utils/xhrRequest';

/**
 * HelpingHandsCreate - Phase 10.0
 * Campaign creation form
 */
const HelpingHandsCreate = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { user } = useAuth();
  const isDark = theme === 'dark';
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    story: '',
    category: 'community',
    city: '',
    state: '',
    goal_amount: '',
    cover_image: null,
    is_personal: true,
    status: 'draft' // draft or active
  });
  
  const [coverPreview, setCoverPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const categories = [
    { value: 'medical', label: 'Medical & Healthcare' },
    { value: 'education', label: 'Education & Training' },
    { value: 'business', label: 'Business Support' },
    { value: 'community', label: 'Community Project' },
    { value: 'emergency', label: 'Emergency Relief' },
    { value: 'creative', label: 'Creative & Arts' },
    { value: 'family', label: 'Family Support' },
    { value: 'other', label: 'Other' }
  ];
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };
  
  const handleCoverImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, cover_image: file }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Campaign title is required';
    } else if (formData.title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }
    
    if (!formData.summary.trim()) {
      newErrors.summary = 'Short summary is required';
    } else if (formData.summary.length > 150) {
      newErrors.summary = 'Summary must be 150 characters or less';
    }
    
    if (!formData.story.trim()) {
      newErrors.story = 'Campaign story is required';
    } else if (formData.story.length < 100) {
      newErrors.story = 'Story must be at least 100 characters';
    }
    
    if (formData.goal_amount && formData.goal_amount < 1) {
      newErrors.goal_amount = 'Goal must be at least $1';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (publishImmediately = false) => {
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // For MVP, we'll send data as JSON
      // In production, we'd upload the image first and get a URL
      const campaignData = {
        title: formData.title,
        summary: formData.summary,
        story: formData.story,
        category: formData.category,
        city: formData.city || null,
        state: formData.state || null,
        goal_amount: formData.goal_amount ? parseFloat(formData.goal_amount) : null,
        cover_image: null, // TODO: Handle image upload
        gallery: [],
        is_personal: formData.is_personal,
        status: publishImmediately ? 'active' : 'draft'
      };
      
      // Use xhrRequest instead of fetch to avoid rrweb conflict
      const response = await xhrRequest(
        `${process.env.REACT_APP_BACKEND_URL}/api/helping-hands/campaigns`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(campaignData)
        }
      );
      
      if (response.ok) {
        // Navigate to the created campaign
        navigate(`/portal/helping-hands/campaign/${response.data.id}`);
      } else {
        console.error('Campaign creation failed:', response.data);
        alert(JSON.stringify(response.data.detail || response.data || 'Failed to create campaign'));
      }
    } catch (err) {
      console.error('Error creating campaign:', err);
      alert(`An error occurred: ${err.data?.detail || err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <BusinessLayout>
      {/* CSS Fixes for State Dropdown & Form Inputs - P2 Issue */}
      <style>{`
        /* Override browser autofill styles for all inputs and selects */
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        select:-webkit-autofill,
        select:-webkit-autofill:hover,
        select:-webkit-autofill:focus,
        textarea:-webkit-autofill,
        textarea:-webkit-autofill:hover,
        textarea:-webkit-autofill:focus {
          -webkit-text-fill-color: ${isDark ? '#F9F9F9' : '#1a1a1a'} !important;
          -webkit-box-shadow: 0 0 0 1000px ${isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'} inset !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        
        /* Consistent focus styles for all form elements */
        input:focus,
        select:focus,
        textarea:focus {
          outline: none !important;
          border-color: #E8B657 !important;
          box-shadow: 0 0 0 3px rgba(232, 182, 87, 0.2) !important;
        }
        
        /* Remove default select arrow in IE */
        select::-ms-expand {
          display: none;
        }
        
        /* Ensure option text color is correct */
        select option {
          background-color: ${isDark ? '#1a1a1a' : '#ffffff'};
          color: ${isDark ? '#F9F9F9' : '#1a1a1a'};
        }
        
        /* Prevent zoom on iOS when focusing inputs */
        @media screen and (-webkit-min-device-pixel-ratio: 0) {
          select,
          textarea,
          input {
            font-size: 16px;
          }
        }
      `}</style>
      
      <div 
        className="min-h-screen py-8"
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)'
            : 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)'
        }}
      >
        <div className="container mx-auto max-w-4xl px-4">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/portal/helping-hands')}
              className="flex items-center gap-2 text-sm font-medium mb-4 transition-colors"
              style={{ color: isDark ? '#E8B657' : '#D4A446' }}
            >
              <ArrowLeft size={16} />
              Back to Campaigns
            </button>
            
            <h1 
              className="text-3xl md:text-4xl font-bold mb-2"
              style={{ color: isDark ? '#F9F9F9' : '#1a1a1a' }}
            >
              Start a Campaign
            </h1>
            <p 
              className="text-lg"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              Share your story and rally support from the BANIBS community
            </p>
          </div>
          
          {/* Form */}
          <div 
            className="p-8 rounded-xl"
            style={{
              background: isDark ? 'rgba(26, 26, 26, 0.8)' : 'rgba(255, 255, 255, 0.9)',
              border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
              boxShadow: isDark
                ? '0 8px 24px rgba(0, 0, 0, 0.4)'
                : '0 8px 24px rgba(0, 0, 0, 0.1)'
            }}
          >
            {/* Title */}
            <div className="mb-6">
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? '#D1D5DB' : '#374151' }}
              >
                Campaign Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Help Save My Family's Restaurant"
                className="w-full px-4 py-3 rounded-lg transition-colors"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  border: `2px solid ${errors.title ? '#EF4444' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                  color: isDark ? '#F9F9F9' : '#1a1a1a'
                }}
              />
              {errors.title && (
                <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{errors.title}</p>
              )}
            </div>
            
            {/* Summary */}
            <div className="mb-6">
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? '#D1D5DB' : '#374151' }}
              >
                Short Summary * <span className="text-xs font-normal">(150 characters max)</span>
              </label>
              <textarea
                value={formData.summary}
                onChange={(e) => handleChange('summary', e.target.value)}
                placeholder="Brief description that appears on campaign cards"
                rows={2}
                maxLength={150}
                className="w-full px-4 py-3 rounded-lg transition-colors resize-none"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  border: `2px solid ${errors.summary ? '#EF4444' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                  color: isDark ? '#F9F9F9' : '#1a1a1a'
                }}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.summary && (
                  <p className="text-sm" style={{ color: '#EF4444' }}>{errors.summary}</p>
                )}
                <p className="text-xs ml-auto" style={{ color: isDark ? '#6B7280' : '#9CA3AF' }}>
                  {formData.summary.length}/150
                </p>
              </div>
            </div>
            
            {/* Story */}
            <div className="mb-6">
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? '#D1D5DB' : '#374151' }}
              >
                Your Story * <span className="text-xs font-normal">(What makes this campaign important?)</span>
              </label>
              <textarea
                value={formData.story}
                onChange={(e) => handleChange('story', e.target.value)}
                placeholder="Tell your story in detail. Why are you raising funds? What will the money be used for? Be authentic and specific."
                rows={10}
                className="w-full px-4 py-3 rounded-lg transition-colors resize-none"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                  border: `2px solid ${errors.story ? '#EF4444' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                  color: isDark ? '#F9F9F9' : '#1a1a1a'
                }}
              />
              {errors.story && (
                <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{errors.story}</p>
              )}
            </div>
            
            {/* Category & Goal */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                >
                  Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    color: isDark ? '#F9F9F9' : '#1a1a1a'
                  }}
                >
                  {categories.map(cat => (
                    <option 
                      key={cat.value} 
                      value={cat.value}
                      style={{
                        background: isDark ? '#1a1a1a' : '#ffffff',
                        color: isDark ? '#F9F9F9' : '#1a1a1a'
                      }}
                    >
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                >
                  Goal Amount <span className="text-xs font-normal">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.goal_amount}
                  onChange={(e) => handleChange('goal_amount', e.target.value)}
                  placeholder="Leave blank for 'any amount helps'"
                  min="0"
                  step="1"
                  className="w-full px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    border: `2px solid ${errors.goal_amount ? '#EF4444' : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')}`,
                    color: isDark ? '#F9F9F9' : '#1a1a1a'
                  }}
                />
                {errors.goal_amount && (
                  <p className="text-sm mt-1" style={{ color: '#EF4444' }}>{errors.goal_amount}</p>
                )}
              </div>
            </div>
            
            {/* Location */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                >
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  placeholder="e.g., Atlanta"
                  className="w-full px-4 py-3 rounded-lg transition-colors"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
                    border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    color: isDark ? '#F9F9F9' : '#1a1a1a'
                  }}
                />
              </div>
              
              <div>
                <label 
                  className="block text-sm font-semibold mb-2"
                  style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                >
                  State
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-4 py-3 rounded-lg transition-colors cursor-pointer"
                  style={{
                    background: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
                    border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                    color: isDark ? '#F9F9F9' : '#1a1a1a',
                    WebkitAppearance: 'none',
                    MozAppearance: 'none',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='${isDark ? '%23F9F9F9' : '%231a1a1a'}' d='M1.41 0L6 4.59 10.59 0 12 1.41l-6 6-6-6z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    paddingRight: '40px'
                  }}
                >
                  <option value="">Select State</option>
                  <option value="AL">Alabama</option>
                  <option value="AK">Alaska</option>
                  <option value="AZ">Arizona</option>
                  <option value="AR">Arkansas</option>
                  <option value="CA">California</option>
                  <option value="CO">Colorado</option>
                  <option value="CT">Connecticut</option>
                  <option value="DE">Delaware</option>
                  <option value="FL">Florida</option>
                  <option value="GA">Georgia</option>
                  <option value="HI">Hawaii</option>
                  <option value="ID">Idaho</option>
                  <option value="IL">Illinois</option>
                  <option value="IN">Indiana</option>
                  <option value="IA">Iowa</option>
                  <option value="KS">Kansas</option>
                  <option value="KY">Kentucky</option>
                  <option value="LA">Louisiana</option>
                  <option value="ME">Maine</option>
                  <option value="MD">Maryland</option>
                  <option value="MA">Massachusetts</option>
                  <option value="MI">Michigan</option>
                  <option value="MN">Minnesota</option>
                  <option value="MS">Mississippi</option>
                  <option value="MO">Missouri</option>
                  <option value="MT">Montana</option>
                  <option value="NE">Nebraska</option>
                  <option value="NV">Nevada</option>
                  <option value="NH">New Hampshire</option>
                  <option value="NJ">New Jersey</option>
                  <option value="NM">New Mexico</option>
                  <option value="NY">New York</option>
                  <option value="NC">North Carolina</option>
                  <option value="ND">North Dakota</option>
                  <option value="OH">Ohio</option>
                  <option value="OK">Oklahoma</option>
                  <option value="OR">Oregon</option>
                  <option value="PA">Pennsylvania</option>
                  <option value="RI">Rhode Island</option>
                  <option value="SC">South Carolina</option>
                  <option value="SD">South Dakota</option>
                  <option value="TN">Tennessee</option>
                  <option value="TX">Texas</option>
                  <option value="UT">Utah</option>
                  <option value="VT">Vermont</option>
                  <option value="VA">Virginia</option>
                  <option value="WA">Washington</option>
                  <option value="WV">West Virginia</option>
                  <option value="WI">Wisconsin</option>
                  <option value="WY">Wyoming</option>
                  <option value="DC">Washington DC</option>
                </select>
              </div>
            </div>
            
            {/* Cover Image */}
            <div className="mb-8">
              <label 
                className="block text-sm font-semibold mb-2"
                style={{ color: isDark ? '#D1D5DB' : '#374151' }}
              >
                Cover Image <span className="text-xs font-normal" style={{ color: '#9CA3AF' }}>(Coming soon - Phase 10.1)</span>
              </label>
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center transition-colors"
                style={{
                  borderColor: isDark ? 'rgba(156, 163, 175, 0.3)' : 'rgba(156, 163, 175, 0.4)',
                  background: isDark ? 'rgba(156, 163, 175, 0.05)' : 'rgba(156, 163, 175, 0.08)',
                  opacity: 0.6,
                  cursor: 'not-allowed'
                }}
              >
                <Upload size={48} className="mx-auto mb-3" style={{ color: '#9CA3AF' }} />
                <p className="font-medium mb-1" style={{ color: '#9CA3AF' }}>
                  Image Upload Disabled
                </p>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  Cover image support will be available in Phase 10.1
                </p>
              </div>
            </div>
            
            {/* Disclaimer */}
            <div 
              className="p-4 rounded-lg mb-6"
              style={{
                background: isDark ? 'rgba(232, 182, 87, 0.1)' : 'rgba(232, 182, 87, 0.15)',
                border: `1px solid ${isDark ? 'rgba(232, 182, 87, 0.3)' : 'rgba(232, 182, 87, 0.4)'}`
              }}
            >
              <p className="text-sm" style={{ color: isDark ? '#D1D5DB' : '#374151' }}>
                <strong>Important:</strong> BANIBS Helping Hands is a donation platform. 
                Contributions are gifts, not investments or loans. Funds are sent directly to you 
                via Stripe. BANIBS does not guarantee campaign success or fund usage.
              </p>
            </div>
            
            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex-1 py-4 rounded-lg font-semibold text-lg transition-all"
                style={{
                  background: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                  color: isDark ? '#F9F9F9' : '#1a1a1a',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Saving...
                  </span>
                ) : (
                  'Save as Draft'
                )}
              </button>
              
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="flex-1 py-4 rounded-lg font-semibold text-lg transition-all"
                style={{
                  background: loading 
                    ? 'rgba(156, 163, 175, 0.3)'
                    : 'linear-gradient(135deg, #E8B657 0%, #D4A446 100%)',
                  color: loading ? '#9CA3AF' : '#0a0a0a',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  boxShadow: loading 
                    ? 'none'
                    : '0 4px 12px rgba(232, 182, 87, 0.3)'
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 6px 16px rgba(232, 182, 87, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(232, 182, 87, 0.3)';
                  }
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={20} className="animate-spin" />
                    Publishing...
                  </span>
                ) : (
                  'Publish Campaign'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
};

export default HelpingHandsCreate;
