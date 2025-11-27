import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Loader2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

/**
 * RegisterPage - Full-page registration (bypasses modal z-index issues)
 * Phase 10.0 P0 Blocker Fix - Option B
 */
const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
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
      const userData = await register(
        formData.first_name,
        formData.last_name,
        formData.email,
        formData.password
      );
      
      // Successful registration - hard redirect to ensure auth state is loaded
      window.location.href = '/portal/social';
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
          Back to Home
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
                <h1 className="text-2xl font-bold text-white">Join BANIBS</h1>
                <p className="text-sm text-gray-400">Create your account</p>
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
                First Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  placeholder="Enter your first name"
                  className="input-v2 w-full pl-10"
                />
              </div>
            </div>
            
            {/* Last Name Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="text"
                  required
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  placeholder="Enter your last name"
                  className="input-v2 w-full pl-10"
                />
              </div>
            </div>
            
            {/* Email Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="input-v2 w-full pl-10"
                />
              </div>
            </div>
            
            {/* Password Field */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Create a strong password"
                  minLength={6}
                  className="input-v2 w-full pl-10"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Must be at least 6 characters</p>
            </div>
            
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
            
            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/auth/signin')}
                  className="text-yellow-400 hover:text-yellow-300 font-medium transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
          </form>
        </div>
        
        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By creating an account, you agree to BANIBS Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
