import React, { useState } from 'react';
import { newsletterAPI } from '../services/api';

const NewsletterSubscribe = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await newsletterAPI.subscribe(email);
      setSuccess(true);
      setEmail('');
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      console.error('Error subscribing:', err);
      setError('Failed to subscribe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1a1a1a] border-t-2 border-[#FFD700] py-8">
      <div className="max-w-4xl mx-auto px-4 text-center">
        <h3 className="text-2xl font-bold text-white mb-2">
          📬 Get Weekly Opportunities
        </h3>
        <p className="text-gray-400 mb-4">
          Subscribe to receive jobs, grants, scholarships, and more in your inbox
        </p>
        
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="flex-1 px-4 py-3 bg-black border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
            />
            <button
              type="submit"
              disabled={loading || success}
              className="px-6 py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(255,215,0,0.5)]"
            >
              {loading ? '...' : success ? '✓' : 'Subscribe'}
            </button>
          </div>
          
          {error && (
            <p className="mt-2 text-red-400 text-sm">{error}</p>
          )}
          
          {success && (
            <p className="mt-2 text-[#FFD700] text-sm font-bold">
              ✓ You're on the list! Check your inbox for updates.
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default NewsletterSubscribe;
