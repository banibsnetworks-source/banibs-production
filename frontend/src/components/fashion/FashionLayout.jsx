import React from 'react';
import { createPortalLayout } from '../layouts/PortalLayout';
import { Sparkles } from 'lucide-react';

const FashionLeftRail = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-blue-500" />
        <h3 className="font-semibold text-foreground">Fashion & Sneakers</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        From hype to ownership. Build your fashion empire.
      </p>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>👟 Discover Black-owned brands</p>
        <p>📚 Learn the business</p>
        <p>💡 Share your journey</p>
        <p>💰 Track your spending</p>
      </div>
    </div>
  );
};

const FashionLayout = createPortalLayout({
  theme: 'theme-fashion',
  leftRail: FashionLeftRail,
  rightRail: null,
  maxWidth: '1200px'
});

export default FashionLayout;