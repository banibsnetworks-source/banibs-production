import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#FFD700] text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-black border-2 border-red-500 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              Access Denied
            </h2>
            <p className="text-white mb-6">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-2 bg-[#FFD700] text-black font-bold rounded-lg hover:bg-[#FFC700] transition-all"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
