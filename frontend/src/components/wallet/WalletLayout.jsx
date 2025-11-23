import React from 'react';
import { createPortalLayout } from '../layouts/PortalLayout';
import WalletLeftRail from './WalletLeftRail';

const WalletLayout = createPortalLayout({
  theme: 'theme-wallet',
  leftRail: WalletLeftRail,
  rightRail: null,
  maxWidth: '1400px'
});

export default WalletLayout;
