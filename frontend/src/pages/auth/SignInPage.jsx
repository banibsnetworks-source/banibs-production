import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Lock, Loader2, AlertCircle, Users, Newspaper, ShoppingBag, Building2, Shield, Lock as LockIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

/**
 * SignInPage - BANIBS Premium Login Experience v2.0
 * 
 * LAYOUT REDESIGN (Founder Feedback Feb 2026):
 * - Sign-in is TOP PRIORITY (visible immediately, no scroll)
 * - Feature blurbs moved BELOW the fold
 * - Removed "elementary" B-square placeholder
 * - Added premium hero visual
 * - Modern, clean aesthetic
 * 
 * Desktop: Sign-in card (left) + Hero panel (right)
 * Mobile: Sign-in first, hero below
 */

// Feature blurbs data (moved to bottom)
const FEATURES = [
  { icon: Users, title: 'Network', description: 'People, communities, and circles.' },
  { icon: Newspaper, title: 'News', description: 'Information that stays grounded.' },
  { icon: ShoppingBag, title: 'Marketplace', description: 'Business and commerce, built in.' },
  { icon: Building2, title: 'Black Businesses', description: 'Discovery and connection.' },
  { icon: Shield, title: 'Trust', description: 'Designed for safety and agency.' },
  { icon: LockIcon, title: 'Security', description: 'Encrypted and privacy-aware.' },
];

const SignInPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (!result.success) {
        throw new Error(result.error || t('auth.signInFailed'));
      }
      
      const redirectTo = searchParams.get('redirect') || '/';
      window.location.href = redirectTo;
    } catch (err) {
      setError(err.message || t('auth.signInFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030303]">
      {/* ========== MAIN SECTION: Sign-in + Hero ========== */}
      <div className="min-h-screen flex flex-col lg:flex-row">
        
        {/* LEFT: Sign-in Card (PRIMARY - appears first on mobile) */}
        <div className="w-full lg:w-[480px] xl:w-[520px] flex flex-col justify-center p-6 sm:p-8 lg:p-12 order-1">
          <div className="max-w-md mx-auto w-full">
            
            {/* BANIBS Identity Anchor - Platform Branding */}
            <div className="mb-10">
              <h1 
                className="text-5xl sm:text-6xl font-bold tracking-tight"
                style={{ 
                  background: 'linear-gradient(135deg, #C5A059 0%, #E8D5A3 50%, #C5A059 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  textShadow: '0 2px 20px rgba(197, 160, 89, 0.15)'
                }}
              >
                BANIBS
              </h1>
              <p className="text-sm text-gray-300 mt-3 tracking-wide font-medium">
                Black America News, Information & Business System
              </p>
            </div>

            {/* Sign-in Card */}
            <div 
              className="rounded-2xl p-6 sm:p-8"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)'
              }}
            >
              {/* Card Header */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-white">Sign in</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Access your worlds, circles, and business network.
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 rounded-xl flex items-start gap-3" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={18} />
                  <p className="text-sm text-red-300">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-gray-300">Password</label>
                    <button
                      type="button"
                      onClick={() => navigate('/auth/forgot-password')}
                      className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Enter your password"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl text-white placeholder-gray-500 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl font-semibold text-black transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, #C5A059 0%, #D4B068 100%)',
                    boxShadow: '0 4px 20px rgba(197, 160, 89, 0.3)'
                  }}
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
              </form>

              {/* Register Link */}
              <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <p className="text-center text-sm text-gray-400">
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
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-600 mt-6">
              Secure login powered by BANIBS Auth
            </p>
          </div>
        </div>

        {/* RIGHT: Hero Panel (SECONDARY - below on mobile) */}
        <div className="flex-1 relative overflow-hidden order-2 min-h-[300px] lg:min-h-0">
          {/* Hero Background Image */}
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=1200&q=80"
              alt="BANIBS Community"
              className="w-full h-full object-cover"
              style={{ filter: 'saturate(0.9)' }}
            />
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#030303] via-[#030303]/80 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-transparent to-transparent" />
            {/* Amber tint overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent mix-blend-overlay" />
          </div>

          {/* Hero Content */}
          <div className="relative h-full flex items-center p-8 lg:p-12">
            <div className="max-w-lg">
              <h2 className="text-3xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Your network.
                <br />
                Your news.
                <br />
                <span style={{ color: '#C5A059' }}>Your marketplace.</span>
                <br />
                <span className="text-gray-400">Connected.</span>
              </h2>
              
              <p className="text-gray-300 text-lg leading-relaxed mb-8 max-w-md">
                Connect to trusted circles, curated news, and a growing economy built for us.
              </p>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-3">
                {['Encrypted', 'Community-first', 'Privacy-aware'].map((badge) => (
                  <span
                    key={badge}
                    className="px-4 py-2 rounded-full text-sm font-medium text-gray-300"
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ambient Glow */}
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        </div>
      </div>

      {/* ========== FEATURE BLURBS SECTION (BELOW FOLD) ========== */}
      <div 
        className="py-16 px-6 lg:px-12"
        style={{
          background: 'linear-gradient(180deg, #030303 0%, #0a0a0a 100%)',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}
      >
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Everything you need
            </h3>
            <p className="text-2xl font-semibold text-white">
              One platform. Many possibilities.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-6">
            {FEATURES.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-xl text-center transition-all hover:scale-105"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                  }}
                >
                  <div 
                    className="w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(197, 160, 89, 0.15)' }}
                  >
                    <Icon size={20} style={{ color: '#C5A059' }} />
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Quote */}
      <div 
        className="py-10 px-6 text-center"
        style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}
      >
        <blockquote className="text-sm text-gray-500 italic max-w-2xl mx-auto">
          &ldquo;A digital space where we control the narrative, build wealth together, and stay connected to what matters.&rdquo;
        </blockquote>
      </div>
    </div>
  );
};

export default SignInPage;
