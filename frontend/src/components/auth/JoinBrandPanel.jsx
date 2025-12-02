import React from 'react';
import { Sparkles } from 'lucide-react';

/**
 * JoinBrandPanel - Brand story for registration page
 * "For Us. By Us. Built to Last."
 * Updated with real community imagery (Mixed Real Community + Modern Illustration style)
 */
const JoinBrandPanel = () => {
  const pillars = [
    {
      title: 'Real News',
      description: 'Stories centered on Black lives here and across the diaspora.',
      image: 'https://images.unsplash.com/photo-1614586921203-a2cc806dd09a',
      color: 'blue'
    },
    {
      title: 'Real Business',
      description: 'Direct access to Black-owned businesses and skilled trades.',
      image: 'https://images.unsplash.com/photo-1563132337-f159f484226c',
      color: 'amber'
    },
    {
      title: 'Real Community',
      description: 'Groups, circles, and tools built to protect and uplift us.',
      image: 'https://images.unsplash.com/photo-1739302750675-042ed497a429',
      color: 'emerald'
    }
  ];

  const colorClasses = {
    blue: 'from-blue-500/20 to-blue-600/10',
    amber: 'from-amber-500/20 to-amber-600/10',
    emerald: 'from-emerald-500/20 to-emerald-600/10'
  };

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

      {/* Three Pillars with Real Images */}
      <div className="space-y-4">
        {pillars.map((pillar, index) => (
          <div 
            key={index}
            className="group relative overflow-hidden rounded-xl border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300"
          >
            {/* Image Background */}
            <div className="absolute inset-0">
              <img 
                src={pillar.image}
                alt={pillar.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                style={{ filter: 'saturate(0.9)' }}
              />
              {/* Amber Overlay (15%) */}
              <div 
                className={`absolute inset-0 bg-gradient-to-br ${colorClasses[pillar.color]} mix-blend-overlay`}
              />
              {/* Dark Gradient for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-900/40" />
            </div>

            {/* Content with Glass Blur Panel */}
            <div className="relative flex items-center gap-4 p-4 backdrop-blur-sm bg-slate-900/30">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{pillar.title}</h3>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          </div>
        ))}
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
