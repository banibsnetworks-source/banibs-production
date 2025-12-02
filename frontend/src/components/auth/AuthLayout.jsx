import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * AuthLayout - BANIBS Welcome Shell
 * Reusable 2-column layout for auth pages
 * Desktop: Form (left) + Brand Story (right)
 * Mobile: Brand Story (top) + Form (bottom)
 */
const AuthLayout = ({ 
  children, 
  brandPanel,
  showBackButton = true 
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Back Button (Mobile Only - Top Left) */}
      {showBackButton && (
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/80 backdrop-blur-sm border border-slate-700/50 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-all"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">Home</span>
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="min-h-screen flex flex-col lg:flex-row">
        {/* Left Column: Form Panel */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 order-2 lg:order-1">
          <div className="w-full max-w-md">
            {/* Back Button (Desktop Only) */}
            {showBackButton && (
              <button
                onClick={() => navigate('/')}
                className="hidden lg:flex items-center gap-2 text-slate-400 hover:text-amber-400 transition-colors mb-8"
              >
                <ArrowLeft size={20} />
                <span className="text-sm font-medium">Back to Home</span>
              </button>
            )}
            
            {/* Form Content */}
            {children}
          </div>
        </div>

        {/* Right Column: Brand Story Panel */}
        <div className="w-full lg:w-1/2 relative overflow-hidden order-1 lg:order-2">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-blue-500/10 to-amber-600/10" />
          
          {/* Subtle Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }} />
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center p-8 lg:p-12">
            {brandPanel}
          </div>

          {/* Ambient Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
