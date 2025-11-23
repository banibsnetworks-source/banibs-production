import React from 'react';
import { createPortalLayout } from '../layouts/PortalLayout';
import DiasporaLeftRail from './DiasporaLeftRail';

/**
 * DiasporaLayout - Phase 12.0
 * Layout wrapper for Diaspora Connect Portal pages
 * Uses the modular portal layout system
 */
const DiasporaLayout = createPortalLayout({
  theme: 'theme-diaspora',
  leftRail: DiasporaLeftRail,
  rightRail: null, // No right rail for now
  maxWidth: '1400px'
});

export default DiasporaLayout;
