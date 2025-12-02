import React from 'react';
import { Shield, Lock, Heart } from 'lucide-react';

/**
 * SignInBrandPanel - Brand story for sign-in page
 * "Your network. Your news. Your marketplace."
 */
const SignInBrandPanel = () => {
  return (
    <div className="max-w-lg text-center lg:text-left space-y-8">
      {/* Main Headline */}
      <div className="space-y-4">
        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
          Your network.
          <br />
          Your news.
          <br />
          <span className="text-amber-400">Your marketplace.</span>
        </h1>
        
        <p className="text-base lg:text-lg text-slate-300 leading-relaxed">
          Your account connects you to trusted circles, curated news, and a growing economy built for us.
        </p>
      </div>

      {/* Visual Separator */}
      <div className="flex items-center justify-center lg:justify-start gap-2 py-4">
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/50" />
        <div className="h-px w-12 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>

      {/* Trust Strip */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Built on Trust
        </h3>
        
        <div className="space-y-3">
          {/* Encrypted */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Lock className="text-emerald-400" size={16} />
            </div>
            <span className="text-sm text-slate-300">Encrypted connections</span>
          </div>

          {/* Privacy */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Shield className="text-blue-400" size={16} />
            </div>
            <span className="text-sm text-slate-300">No selling your story</span>
          </div>

          {/* Community */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Heart className="text-amber-400" size={16} />
            </div>
            <span className="text-sm text-slate-300">Community-first design</span>
          </div>
        </div>
      </div>

      {/* Ambient Quote */}
      <div className="pt-6">
        <blockquote className="text-sm text-slate-500 italic border-l-2 border-amber-500/30 pl-4">
          "A digital space where we control the narrative, build wealth together, and stay connected to what matters."
        </blockquote>
      </div>
    </div>
  );
};

export default SignInBrandPanel;
