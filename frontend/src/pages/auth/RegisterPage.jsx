import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2, AlertCircle, ArrowLeft, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

/**
 * RegisterPage - Full-page registration (bypasses modal z-index issues)
 * Phase 10.0 P0 Blocker Fix - Option B
 * Phase L.0 - i18n integrated
 * Enhanced with DOB, Gender, Password confirmation
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirm_password: '',
    date_of_birth: '',
    gender: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const validateForm = () => {
    const errors = {};
    
    // Required fields
    if (!formData.first_name.trim()) {
      errors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      errors.last_name = 'Last name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    // Password confirmation
    if (!formData.confirm_password) {
      errors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      errors.confirm_password = 'Passwords do not match';
    }
    
    // Date of birth validation
    if (!formData.date_of_birth) {
      errors.date_of_birth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.date_of_birth);
      const today = new Date();
      const age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      
      if (age < 13) {
        errors.date_of_birth = 'You must be at least 13 years old to register';
      }
    }
    
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const userData = await register(
        formData.first_name,
        formData.last_name,
        formData.email,
        formData.password,
        formData.date_of_birth,
        formData.gender || 'prefer_not_to_say'
      );
      
      // Mark as new user for onboarding
      localStorage.setItem('show_onboarding', 'true');
      
      // Successful registration - redirect to onboarding
      window.location.href = '/onboarding/welcome';
    } catch (err) {
      setError(err.message || t('auth.registrationFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-400 hover:text-yellow-400 transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          {t('nav.backToHome')}
        </button>
        
        {/* Card */}
        <div className="card-v2 card-v2-lg shadow-xl-v2 overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-gray-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-2xl font-bold text-white">B</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('auth.joinBanibs')}</h1>
                <p className="text-sm text-gray-400">{t('auth.createYourAccount')}</p>
              </div>
            </div>
          </div>
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/30 border border-red-700/50 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            
            {/* First Name Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.firstName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder={t('auth.firstNamePlaceholder')}
                  className="input-v2 w-full pl-10"
                />
              </div>
            </div>
            
            {/* Last Name Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.lastName')}
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder={t('auth.lastNamePlaceholder')}
                  className="input-v2 w-full pl-10"
                />
              </div>
            </div>
            
            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder={t('auth.emailPlaceholder')}
                  className="input-v2 w-full pl-10"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('auth.createStrongPassword')}
                  minLength={6}
                  className="input-v2 w-full pl-10"
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-400 mt-2">{fieldErrors.password}</p>
              )}
              {!fieldErrors.password && (
                <p className="text-xs text-gray-500 mt-2">{t('auth.passwordMinLength')}</p>
              )}
            </div>
            
            {/* Confirm Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  placeholder="Re-enter your password"
                  className={`input-v2 w-full pl-10 ${fieldErrors.confirm_password ? 'border-red-500' : ''}`}
                />
              </div>
              {fieldErrors.confirm_password && (
                <p className="text-xs text-red-400 mt-2">{fieldErrors.confirm_password}</p>
              )}
            </div>
            
            {/* Date of Birth Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="date"
                  required
                  value={formData.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  max={new Date().toISOString().split('T')[0]}
                  className={`input-v2 w-full pl-10 ${fieldErrors.date_of_birth ? 'border-red-500' : ''}`}
                />
              </div>
              {fieldErrors.date_of_birth && (
                <p className="text-xs text-red-400 mt-2">{fieldErrors.date_of_birth}</p>
              )}
              {!fieldErrors.date_of_birth && (
                <p className="text-xs text-gray-500 mt-2">You must be at least 13 years old</p>
              )}
            </div>
            
            {/* Gender Field (Optional) */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Gender <span className="text-gray-500 text-xs">(Optional)</span>
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-300">Male</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-300">Female</span>
                </label>
                <label className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-750 transition-colors">
                  <input
                    type="radio"
                    name="gender"
                    value="prefer_not_to_say"
                    checked={formData.gender === 'prefer_not_to_say'}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-gray-300">Prefer not to say</span>
                </label>
              </div>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-v2 btn-v2-primary btn-v2-lg w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  {t('auth.creatingAccount')}
                </>
              ) : (
                t('auth.createAccount')
              )}
            </button>
            
            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                {t('auth.alreadyHaveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => navigate('/auth/signin')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                >
                  {t('auth.signin')}
                </button>
              </p>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          {t('auth.termsAgreement')}
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
