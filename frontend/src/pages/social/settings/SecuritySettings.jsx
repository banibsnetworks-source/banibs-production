import React, { useState, useEffect } from 'react';
import { ShieldCheck, Phone, CheckCircle, AlertCircle, Loader2, X } from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';

const API = process.env.REACT_APP_BACKEND_URL;

const SecuritySettings = () => {
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState('idle'); // idle | entering_phone | entering_otp | verified | removing
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const isVerified = user?.is_phone_verified && user?.phone_number;

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const sendOtp = async () => {
    if (!phone.trim()) {
      setError('Please enter your phone number');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          phone_number: phone,
          purpose: 'upgrade'
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to send verification code');
      }
      
      setStep('entering_otp');
      setCountdown(60);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp.trim() || otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ 
          phone_number: phone,
          purpose: 'upgrade',
          code: otp
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        const errorMsg = data.detail?.error || data.detail || 'Invalid code';
        throw new Error(errorMsg);
      }
      
      // Update user's phone verification status
      const updateRes = await fetch(`${API}/api/bglis/link-phone`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({ phone_number: phone })
      });
      
      const updateData = await updateRes.json();
      
      if (updateRes.ok) {
        await refreshUser?.();
        setStep('verified');
      } else {
        // Link failed - show specific error
        const linkError = updateData.detail || 'Failed to link phone';
        throw new Error(linkError);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removePhone = async () => {
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`${API}/api/bglis/remove-phone`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      
      if (res.ok) {
        await refreshUser?.();
        setStep('idle');
        setPhone('');
        setOtp('');
      }
    } catch (err) {
      setError('Failed to remove phone');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep('idle');
    setPhone('');
    setOtp('');
    setError('');
    setCountdown(0);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <h1 className="text-xl font-semibold">Security Settings</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 space-y-8">
        {/* Phone Verification Section */}
        <section className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-500/10 rounded-lg">
              <Phone className="w-6 h-6 text-amber-500" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-medium mb-1">Phone Verification</h2>
              <p className="text-gray-400 text-sm mb-4">
                Add your phone number to strengthen your account security and display a verified badge on your marketplace listings.
              </p>
              
              {/* Status: Already Verified */}
              {isVerified && step !== 'removing' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Phone Verified</span>
                    <span className="text-gray-400 ml-2">
                      {user.phone_number?.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, '$1 ••• ••• $4')}
                    </span>
                  </div>
                  <button
                    onClick={() => setStep('removing')}
                    className="text-sm text-gray-400 hover:text-red-400 transition-colors"
                  >
                    Remove phone number
                  </button>
                </div>
              )}

              {/* Confirm Remove */}
              {step === 'removing' && (
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <p className="text-red-400 text-sm mb-3">
                      Are you sure? Removing your phone will remove the verified badge from your listings.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={removePhone}
                        disabled={loading}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yes, Remove'}
                      </button>
                      <button
                        onClick={() => setStep('idle')}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Step: Idle - Show Add Phone Button */}
              {!isVerified && step === 'idle' && (
                <button
                  onClick={() => setStep('entering_phone')}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors"
                >
                  Add Phone Number
                </button>
              )}

              {/* Step: Entering Phone */}
              {step === 'entering_phone' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 555 123 4567"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500"
                      data-testid="phone-input"
                    />
                    <p className="text-xs text-gray-500 mt-1">Include country code (e.g., +1 for US)</p>
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={sendOtp}
                      disabled={loading}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      data-testid="send-otp-btn"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Send Code
                    </button>
                    <button
                      onClick={reset}
                      className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Entering OTP */}
              {step === 'entering_otp' && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-400">
                    We sent a 6-digit code to <span className="text-white">{phone}</span>
                  </p>
                  
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Verification Code</label>
                    <input
                      type="text"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-center text-2xl tracking-widest font-mono placeholder-gray-600 focus:outline-none focus:border-amber-500"
                      data-testid="otp-input"
                    />
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={verifyOtp}
                      disabled={loading || otp.length !== 6}
                      className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                      data-testid="verify-otp-btn"
                    >
                      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Verify
                    </button>
                    <button
                      onClick={() => setStep('entering_phone')}
                      className="px-5 py-2.5 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
                    >
                      Change Number
                    </button>
                  </div>
                  
                  {/* Resend */}
                  <div className="text-sm">
                    {countdown > 0 ? (
                      <span className="text-gray-500">Resend code in {countdown}s</span>
                    ) : (
                      <button
                        onClick={sendOtp}
                        className="text-amber-500 hover:text-amber-400"
                      >
                        Resend code
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Step: Just Verified */}
              {step === 'verified' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-4 py-3 rounded-lg">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Phone verified successfully!</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Your verified badge will now appear on your marketplace listings and messages.
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="bg-gray-900/30 rounded-xl p-5 border border-gray-800/50">
          <h3 className="text-sm font-medium text-gray-300 mb-3">About Phone Verification</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Completely optional - not required for using BANIBS</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Shows a verified badge on Marketplace listings</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>Helps build trust with other community members</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span>You can remove it anytime</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

export default SecuritySettings;
