import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContributorAuth } from '../../contexts/ContributorAuthContext';

const ContributorLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContributorAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/submit');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#FFD700] mb-2">BANIBS</h1>
          <p className="text-white text-lg">Contributor Login</p>
        </div>

        <div className="bg-black border-2 border-[#FFD700] rounded-lg p-8 shadow-[0_0_20px_rgba(255,215,0,0.3)]">
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-500 rounded text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#FFD700] mb-2">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-[#FFD700]/30 rounded-lg text-white focus:outline-none focus:border-[#FFD700] transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] focus:outline-none focus:ring-2 focus:ring-[#FFD700] transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(255,215,0,0.5)]"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <a href="/contributor/register" className="text-[#FFD700] hover:underline">
                Create one
              </a>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-sm text-gray-500">
          © 2025 BANIBS. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ContributorLogin;
