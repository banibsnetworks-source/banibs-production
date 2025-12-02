import React from 'react';

/**
 * SignInBrandPanel - Brand story for sign-in page
 * "Your network. Your news. Your marketplace."
 * Updated with real community imagery for trust messaging
 */
const SignInBrandPanel = () => {
  const trustElements = [
    {
      title: 'Encrypted connections',
      image: 'https://images.unsplash.com/photo-1658446793718-3ec50613b7a1',
      description: 'Secure by design'
    },
    {
      title: 'No selling your story',
      image: 'https://images.unsplash.com/photo-1687422808565-929533931584',
      description: 'Your data, your control'
    },
    {
      title: 'Community-first design',
      image: 'https://images.unsplash.com/photo-1665535996811-c03854699436',
      description: 'Built for us, by us'
    }
  ];

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

      {/* Trust Strip with Micro-Images */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Built on Trust
        </h3>
        
        <div className="space-y-3">
          {trustElements.map((element, index) => (
            <div 
              key={index}
              className="group relative overflow-hidden rounded-lg border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300"
            >
              {/* Micro-Image Background */}
              <div className="absolute inset-0">
                <img 
                  src={element.image}
                  alt={element.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ filter: 'saturate(0.85)' }}
                />
                {/* Amber Overlay (10%) */}
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 to-blue-500/10 mix-blend-overlay" />
                {/* Dark Gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900/85 via-slate-900/75 to-slate-900/60" />
              </div>

              {/* Content with Glass Blur */}
              <div className="relative flex items-center gap-3 p-3 backdrop-blur-md bg-slate-900/20">
                <div className="flex-1">
                  <span className="text-sm font-medium text-slate-200">{element.title}</span>
                  <p className="text-xs text-slate-400 mt-0.5">{element.description}</p>
                </div>
              </div>
            </div>
          ))}
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
