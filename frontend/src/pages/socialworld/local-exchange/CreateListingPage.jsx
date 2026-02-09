import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { 
  ArrowLeft, Camera, X, MapPin, DollarSign, 
  Package, AlertCircle, Check, Loader2
} from 'lucide-react';
import FullWidthLayout from '../../../components/layouts/FullWidthLayout';

/**
 * Create Listing Page - Local Exchange
 * 
 * Fields: title, description, category, price/free, condition, photos, location
 */

const CATEGORY_ICONS = {
  furniture: '🛋️',
  electronics: '📱',
  clothing: '👕',
  vehicles: '🚗',
  home: '🏠',
  sports: '⚽',
  toys: '🎮',
  books: '📚',
  baby: '👶',
  free: '🎁',
  services: '🔧',
  other: '📦',
};

const CreateListingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    is_free: false,
    condition: 'good',
    photos: [],
    location_city: '',
    location_zip: '',
    location_state: '',
    visibility_radius: 25,
  });

  const API_URL = process.env.REACT_APP_BACKEND_URL;

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/auth/signin?redirect=/socialworld/local/new');
    }
  }, [user, navigate]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/api/local-exchange/categories`);
        const data = await res.json();
        setCategories(data.categories || []);
        setConditions(data.conditions || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, [API_URL]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // If marking as free, set price to 0
      if (field === 'is_free' && value) {
        updated.price = '0';
      }
      
      return updated;
    });
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (formData.photos.length + files.length > 10) {
      setError('Maximum 10 photos allowed');
      return;
    }

    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          photos: [...prev.photos, reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim() || formData.title.length < 3) {
      setError('Title must be at least 3 characters');
      return false;
    }
    if (!formData.description.trim() || formData.description.length < 10) {
      setError('Description must be at least 10 characters');
      return false;
    }
    if (!formData.category) {
      setError('Please select a category');
      return false;
    }
    if (!formData.is_free && (!formData.price || parseFloat(formData.price) < 0)) {
      setError('Please enter a valid price');
      return false;
    }
    if (!formData.location_city.trim()) {
      setError('Please enter your city');
      return false;
    }
    if (!formData.location_zip.trim() || formData.location_zip.length < 5) {
      setError('Please enter a valid ZIP code');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('access_token');
      
      const payload = {
        ...formData,
        price: formData.is_free ? 0 : parseFloat(formData.price),
      };

      const res = await fetch(`${API_URL}/api/local-exchange/listings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to create listing');
      }

      const listing = await res.json();
      navigate(`/socialworld/local/${listing.id}`);
    } catch (err) {
      console.error('Error creating listing:', err);
      setError(err.message || 'Failed to create listing. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

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
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
            <button
              onClick={() => navigate('/socialworld/local')}
              className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
              style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-semibold flex-1" style={{ color: isDark ? '#fff' : '#111' }}>
              List an Item
            </h1>
          </div>
        </header>

        {/* Form */}
        <main className="max-w-2xl mx-auto px-4 py-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div 
                className="flex items-center gap-3 p-4 rounded-xl"
                style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
              >
                <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-500">{error}</p>
              </div>
            )}

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                Photos <span className="text-gray-500">(up to 10)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {formData.photos.map((photo, idx) => (
                  <div 
                    key={idx}
                    className="w-24 h-24 rounded-xl relative overflow-hidden"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                  >
                    <img src={photo} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
                
                {formData.photos.length < 10 && (
                  <label 
                    className="w-24 h-24 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
                    style={{
                      backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                      border: `2px dashed ${isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'}`
                    }}
                  >
                    <Camera size={24} style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }} />
                    <span className="text-xs mt-1" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                      Add
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="What are you selling?"
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl outline-none transition-colors"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#fff' : '#111',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
                data-testid="title-input"
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                Price
              </label>
              <div className="flex items-center gap-4">
                <div 
                  className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
                    opacity: formData.is_free ? 0.5 : 1
                  }}
                >
                  <DollarSign size={18} style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }} />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    disabled={formData.is_free}
                    className="flex-1 bg-transparent outline-none"
                    style={{ color: isDark ? '#fff' : '#111' }}
                    data-testid="price-input"
                  />
                </div>
                
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_free}
                    onChange={(e) => handleChange('is_free', e.target.checked)}
                    className="w-5 h-5 rounded accent-green-500"
                  />
                  <span className="text-sm whitespace-nowrap" style={{ color: isDark ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)' }}>
                    🎁 Free
                  </span>
                </label>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                Category *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleChange('category', cat.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                      formData.category === cat.id ? 'ring-2 ring-amber-500' : ''
                    }`}
                    style={{
                      backgroundColor: formData.category === cat.id 
                        ? (isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)')
                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: isDark ? '#fff' : '#111'
                    }}
                  >
                    <span className="text-2xl">{CATEGORY_ICONS[cat.id] || '📦'}</span>
                    <span className="text-xs text-center">{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                Condition *
              </label>
              <div className="flex flex-wrap gap-2">
                {conditions.map(cond => (
                  <button
                    key={cond.id}
                    type="button"
                    onClick={() => handleChange('condition', cond.id)}
                    className={`px-4 py-2 rounded-xl text-sm transition-all ${
                      formData.condition === cond.id ? 'ring-2 ring-amber-500' : ''
                    }`}
                    style={{
                      backgroundColor: formData.condition === cond.id 
                        ? (isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)')
                        : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'),
                      color: isDark ? '#fff' : '#111'
                    }}
                  >
                    {cond.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: isDark ? '#fff' : '#111' }}>
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your item. Include details like size, brand, or any flaws."
                rows={4}
                maxLength={2000}
                className="w-full px-4 py-3 rounded-xl outline-none resize-none"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#fff' : '#111',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
                data-testid="description-input"
              />
              <p className="text-xs mt-1 text-right" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                {formData.description.length}/2000
              </p>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2" style={{ color: isDark ? '#fff' : '#111' }}>
                <MapPin size={16} />
                Location *
              </label>
              <p className="text-xs mb-3" style={{ color: isDark ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)' }}>
                Only your city will be shown publicly. Exact address is shared only if you choose in messages.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formData.location_city}
                  onChange={(e) => handleChange('location_city', e.target.value)}
                  placeholder="City"
                  className="px-4 py-3 rounded-xl outline-none"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#fff' : '#111',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                  }}
                  data-testid="city-input"
                />
                <input
                  type="text"
                  value={formData.location_state}
                  onChange={(e) => handleChange('location_state', e.target.value)}
                  placeholder="State (optional)"
                  className="px-4 py-3 rounded-xl outline-none"
                  style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    color: isDark ? '#fff' : '#111',
                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                  }}
                />
              </div>
              <input
                type="text"
                value={formData.location_zip}
                onChange={(e) => handleChange('location_zip', e.target.value)}
                placeholder="ZIP Code"
                className="mt-3 w-32 px-4 py-3 rounded-xl outline-none"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                  color: isDark ? '#fff' : '#111',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`
                }}
                data-testid="zip-input"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              style={{
                backgroundColor: 'rgb(245, 158, 11)',
                color: '#000'
              }}
              data-testid="submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check size={20} />
                  List Item
                </>
              )}
            </button>

            {/* Safety Note */}
            <p className="text-xs text-center" style={{ color: isDark ? 'rgb(75, 85, 99)' : 'rgb(156, 163, 175)' }}>
              By listing an item, you agree to meet buyers locally for pickup. 
              No payments are processed through BANIBS.
            </p>
          </form>
        </main>
      </div>
    </FullWidthLayout>
  );
};

export default CreateListingPage;
