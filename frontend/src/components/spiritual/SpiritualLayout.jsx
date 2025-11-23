import React from 'react';
import { createPortalLayout } from '../layouts/PortalLayout';
import { Sparkles } from 'lucide-react';

/**
 * SpiritualLayout - Phase 11.0
 * Layout for Prayer Rooms portal
 * Uses the PortalLayout factory with spiritual theme
 */

// Simple left rail for Prayer Rooms
const SpiritualLeftRail = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles size={20} className="text-purple-500" />
        <h3 className="font-semibold text-foreground">Prayer Rooms</h3>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        A sacred space for spiritual connection and community support.
      </p>
      <div className="space-y-2 text-sm text-muted-foreground">
        <p>✨ All faiths welcome</p>
        <p>🤝 Anonymous posting available</p>
        <p>🙏 Support through Amen</p>
        <p>⏱️ Posts cleared after 14 days</p>
      </div>
    </div>
  );
};

// Create the layout using the factory
const SpiritualLayout = createPortalLayout({
  theme: 'theme-spiritual',
  leftRail: SpiritualLeftRail,
  rightRail: null, // No right rail for V1
  maxWidth: '1200px'
});

export default SpiritualLayout;
