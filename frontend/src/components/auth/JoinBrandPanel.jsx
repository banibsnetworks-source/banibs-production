import React from 'react';
import { Newspaper, Briefcase, Users, Sparkles } from 'lucide-react';

/**
 * JoinBrandPanel - Brand story for registration page
 * "For Us. By Us. Built to Last."
 */
const JoinBrandPanel = () => {
  return (
    <div className="max-w-lg text-center lg:text-left space-y-8">
      {/* Main Headline */}
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
          <Sparkles className="text-amber-400" size={16} />
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
            Early Access
          </span>
        </div>
        
        <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
          For Us. By Us.
          <br />
          <span className="text-amber-400">Built to Last.</span>
        </h1>
        
        <p className="text-base lg:text-lg text-slate-300 leading-relaxed">
          BANIBS is the social and economic network for Black people worldwide — news, business, community, and opportunity under one roof.
        </p>
      </div>

      {/* Three Pillars */}
      <div className="space-y-6">
        {/* Real News */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Newspaper className="text-blue-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Real News</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Stories centered on Black lives here and across the diaspora.
            </p>
          </div>
        </div>

        {/* Real Business */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
            <Briefcase className="text-amber-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Real Business</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Direct access to Black-owned businesses and skilled trades.
            </p>
          </div>
        </div>

        {/* Real Community */}
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Users className="text-emerald-400" size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Real Community</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Groups, circles, and tools built to protect and uplift us.
            </p>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div className="pt-6 border-t border-slate-700/50">
        <p className="text-sm text-slate-500 italic">
          BANIBS is in early access. Your presence is part of the build.
        </p>
      </div>
    </div>
  );
};

export default JoinBrandPanel;
