import React from 'react';
import { createPortalLayout } from '../layouts/PortalLayout';
import AcademyLeftRail from './AcademyLeftRail';

/**
 * AcademyLayout - Phase 13.0
 * Layout wrapper for BANIBS Academy pages
 * Uses the modular portal layout system
 */
const AcademyLayout = createPortalLayout({
  theme: 'theme-academy',
  leftRail: AcademyLeftRail,
  rightRail: null,
  maxWidth: '1400px'
});

export default AcademyLayout;
