import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import { useNavigate } from 'react-router-dom';

/**
 * RequireAuthInline - Phase 8.1.B
 * Inline auth gate component
 * Shows children if authenticated, otherwise shows sign-in prompt
 */
const RequireAuthInline = ({ children, reason, ctaLabel }) => {
  const { user, isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuthSuccess = (userData) => {
    setAuthModalOpen(false);
    // User is now authenticated, component will re-render and show children
  };

  if (isAuthenticated && user) {
    return children;
  }

  return (
    <>
      <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/40 backdrop-blur-sm">
        <p className="mb-3 text-sm text-gray-300">
          {reason || 'Sign in to access this feature.'}
        </p>
        <button
          type="button"
          onClick={() => setAuthModalOpen(true)}
          className="px-4 py-2 rounded-md bg-yellow-500 hover:bg-yellow-400 text-gray-900 text-sm font-semibold transition-colors"
        >
          {ctaLabel || 'Sign in to continue'}
        </button>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default RequireAuthInline;
