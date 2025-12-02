import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2, AlertCircle, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import JoinBrandPanel from '../../components/auth/JoinBrandPanel';

/**
 * RegisterPage - BANIBS Registration with Brand Story
 * Phase 10.0 P0 Blocker Fix - Option B
 * Phase L.0 - i18n integrated
 * Enhanced with DOB, Gender, Password confirmation
 * BANIBS Welcome Shell - Visual Upgrade Dec 2025
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
      let age = today.getFullYear() - dob.getFullYear();
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
  
  const inputClass = "w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all";
  const inputErrorClass = "w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-rose-500 rounded-xl text-white placeholder-slate-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition-all";
  
  return (
    <AuthLayout brandPanel={<JoinBrandPanel />}>
      {/* Form Card */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 lg:p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-2xl font-bold text-white">B</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Join BANIBS</h1>
              <p className="text-sm text-slate-400">Black American News • Business • Social • Marketplace</p>
            </div>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 lg:p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3">
              <AlertCircle className="text-rose-400 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-rose-200">{error}</p>
            </div>
          )}
          
          {/* First Name Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              First Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Enter your first name"
                className={inputClass}
              />
            </div>
            {fieldErrors.first_name && (
              <p className="text-xs text-rose-400 mt-2">{fieldErrors.first_name}</p>
            )}
          </div>
          
          {/* Last Name Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Last Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Enter your last name"
                className={inputClass}
              />
            </div>
            {fieldErrors.last_name && (
              <p className="text-xs text-rose-400 mt-2">{fieldErrors.last_name}</p>
            )}
          </div>
          
          {/* Email Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="your@email.com"
                className={inputClass}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs text-rose-400 mt-2">{fieldErrors.email}</p>
            )}
          </div>
          
          {/* Password Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Create a strong password"
                minLength={6}
                className={fieldErrors.password ? inputErrorClass : inputClass}
              />
            </div>
            {fieldErrors.password && (
              <p className="text-xs text-rose-400 mt-2">{fieldErrors.password}</p>
            )}
            {!fieldErrors.password && (
              <p className="text-xs text-slate-500 mt-2">Minimum 6 characters</p>
            )}
          </div>
          
          {/* Confirm Password Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={formData.confirm_password}
                onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                placeholder="Re-enter your password"
                className={fieldErrors.confirm_password ? inputErrorClass : inputClass}
              />
            </div>
            {fieldErrors.confirm_password && (
              <p className="text-xs text-rose-400 mt-2">{fieldErrors.confirm_password}</p>
            )}
          </div>
          
          {/* Date of Birth Field */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date of Birth
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="date"
                required
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                max={new Date().toISOString().split('T')[0]}
                className={fieldErrors.date_of_birth ? inputErrorClass : inputClass}
              />
            </div>
            {fieldErrors.date_of_birth && (
              <p className="text-xs text-rose-400 mt-2">{fieldErrors.date_of_birth}</p>
            )}
            {!fieldErrors.date_of_birth && (
              <p className="text-xs text-slate-500 mt-2">You must be at least 13 years old</p>
            )}
          </div>
          
          {/* Gender Field (Optional) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Gender <span className="text-slate-500 text-xs">(Optional)</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 hover:border-amber-500/30 transition-all">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === 'male'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500 focus:ring-2"
                />
                <span className="text-sm text-slate-300">Male</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 hover:border-amber-500/30 transition-all">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === 'female'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500 focus:ring-2"
                />
                <span className="text-sm text-slate-300">Female</span>
              </label>
              <label className="flex items-center gap-2 p-3 bg-slate-800/50 border border-slate-700 rounded-xl cursor-pointer hover:bg-slate-800 hover:border-amber-500/30 transition-all">
                <input
                  type="radio"
                  name="gender"
                  value="prefer_not_to_say"
                  checked={formData.gender === 'prefer_not_to_say'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-4 h-4 text-amber-500 bg-slate-700 border-slate-600 focus:ring-amber-500 focus:ring-2"
                />
                <span className="text-sm text-slate-300">Prefer not to say</span>
              </label>
            </div>
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Creating your account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
          
          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/signin')}
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                Sign in
              </button>
            </p>
          </div>
        </form>
      </div>
      
      {/* Footer */}
      <p className="text-center text-xs text-slate-500 mt-6">
        By creating an account, you agree to our Terms of Service and Privacy Policy.
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
