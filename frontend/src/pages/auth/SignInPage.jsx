import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import AuthLayout from '../../components/auth/AuthLayout';
import SignInBrandPanel from '../../components/auth/SignInBrandPanel';

/**
 * SignInPage - BANIBS Sign In with Trust Messaging
 * Phase 10.0 P0 Blocker Fix - Option B
 * Phase L.0 - i18n integrated
 * BANIBS Welcome Shell - Visual Upgrade Dec 2025
 */
const SignInPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const userData = await login(formData.email, formData.password);
      
      // Successful login - hard redirect to ensure auth state is loaded
      window.location.href = '/portal/social';
    } catch (err) {
      setError(err.message || t('auth.signInFailed'));
    } finally {
      setLoading(false);
    }
  };
  
  const inputClass = "w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all";
  
  return (
    <AuthLayout brandPanel={<SignInBrandPanel />}>
      {/* Form Card */}
      <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 lg:p-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <span className="text-2xl font-bold text-white">B</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Welcome back to BANIBS</h1>
              <p className="text-sm text-slate-400">Sign in to continue where you left off</p>
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
          </div>
          
          {/* Password Field */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() => navigate('/auth/forgot-password')}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter your password"
                className={inputClass}
              />
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
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
          
          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-400">
              New here?{' '}
              <button
                type="button"
                onClick={() => navigate('/auth/register')}
                className="text-amber-400 hover:text-amber-300 font-semibold transition-colors"
              >
                Join BANIBS
              </button>
            </p>
          </div>
        </form>
      </div>
      
      {/* Footer */}
      <p className="text-center text-xs text-slate-500 mt-6">
        Secure login powered by BANIBS Auth
      </p>
    </AuthLayout>
  );
};

export default SignInPage;
