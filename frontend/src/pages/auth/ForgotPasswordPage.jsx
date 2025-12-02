import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react';
import AuthLayout from '../../components/auth/AuthLayout';
import SignInBrandPanel from '../../components/auth/SignInBrandPanel';

/**
 * ForgotPasswordPage - Password Reset Request
 * Allows users to request a password reset link via email
 */
const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.detail || data.message || 'Failed to send reset email. Please try again.');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Unable to connect to server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = \"w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all\";

  return (
    <AuthLayout brandPanel={<SignInBrandPanel />}>
      {/* Form Card */}
      <div className=\"bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl shadow-2xl overflow-hidden\">
        {/* Header */}
        <div className=\"p-6 lg:p-8 border-b border-slate-800/50\">
          <button
            onClick={() => navigate('/auth/signin')}
            className=\"flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors mb-4\"
          >
            <ArrowLeft size={18} />
            <span className=\"text-sm\">Back to Sign In</span>
          </button>
          
          <div className=\"flex items-center gap-3 mb-2\">
            <div className=\"w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20\">
              <span className=\"text-2xl font-bold text-white\">B</span>
            </div>
            <div>
              <h1 className=\"text-2xl font-bold text-white\">Reset your password</h1>
              <p className=\"text-sm text-slate-400\">
                {success 
                  ? 'Check your email for reset instructions' 
                  : 'Enter your email to receive a reset link'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className=\"p-6 lg:p-8\">
          {success ? (
            /* Success State */
            <div className=\"space-y-6\">
              <div className=\"p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-start gap-3\">
                <CheckCircle className=\"text-emerald-400 flex-shrink-0 mt-0.5\" size={20} />
                <div>
                  <p className=\"text-sm text-emerald-200 font-medium mb-1\">
                    Reset email sent!
                  </p>
                  <p className=\"text-xs text-emerald-300/80\">
                    If an account exists for <strong>{email}</strong>, you'll receive a password reset link shortly. 
                    Please check your inbox (and spam folder).
                  </p>
                </div>
              </div>

              <div className=\"text-center\">
                <p className=\"text-sm text-slate-400 mb-4\">
                  Didn't receive the email?
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className=\"text-amber-400 hover:text-amber-300 font-semibold text-sm transition-colors\"
                >
                  Try again
                </button>
              </div>

              <button
                onClick={() => navigate('/auth/signin')}
                className=\"w-full px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all\"
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            /* Form State */
            <form onSubmit={handleSubmit} className=\"space-y-6\">
              {/* Error Message */}
              {error && (
                <div className=\"p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-start gap-3\">
                  <AlertCircle className=\"text-rose-400 flex-shrink-0 mt-0.5\" size={20} />
                  <p className=\"text-sm text-rose-200\">{error}</p>
                </div>
              )}

              {/* Info Message */}
              <div className=\"p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl\">
                <p className=\"text-sm text-blue-200\">
                  Enter the email address associated with your BANIBS account, and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Email Field */}
              <div>
                <label className=\"block text-sm font-medium text-slate-300 mb-2\">
                  Email Address
                </label>
                <div className=\"relative\">
                  <Mail className=\"absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500\" size={18} />
                  <input
                    type=\"email\"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=\"your@email.com\"
                    className={inputClass}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type=\"submit\"
                disabled={loading || !email}
                className=\"w-full px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2\"
              >
                {loading ? (
                  <>
                    <Loader2 className=\"animate-spin\" size={20} />
                    Sending reset link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>

              {/* Back to Sign In */}
              <div className=\"text-center\">
                <button
                  type=\"button\"
                  onClick={() => navigate('/auth/signin')}
                  className=\"text-sm text-slate-400 hover:text-amber-400 transition-colors\"
                >
                  Remember your password? Sign in
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Security Note */}
      <p className=\"text-center text-xs text-slate-500 mt-6\">
        For security, we'll only confirm a reset was sent if the email exists in our system.
      </p>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
