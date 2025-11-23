import React from 'react';
import { createPortalLayout } from '../layouts/PortalLayout';
import { Sparkles, Heart, Users } from 'lucide-react';

/**
 * BeautyLayout - Phase 11.1
 * Layout for Beauty & Wellness portal
 * Uses the PortalLayout factory with beauty/marketplace theme
 */

// Simple left rail for Beauty Portal
const BeautyLeftRail = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-pink-500" />
        <h3 className="font-semibold text-foreground">Beauty & Wellness</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Building ownership and empowerment in Black beauty.
      </p>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>💰 Track spending & save</p>
        <p>🏪 Find Black-owned businesses</p>
        <p>📚 Learn & grow</p>
        <p>💬 Safe community space</p>
      </div>
    </div>
  );
};

// Create the layout using the factory
const BeautyLayout = createPortalLayout({
  theme: 'theme-beauty',
  leftRail: BeautyLeftRail,
  rightRail: null,
  maxWidth: '1200px'
});

export default BeautyLayout;