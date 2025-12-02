import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import AnalyticsContent from '../../components/business/AnalyticsContent';

/**
 * BusinessAnalyticsDashboard - Phase 8.4
 * Analytics dashboard for Business Mode
 * Uses pure AnalyticsContent component (no layout wrapper) to avoid duplicate navbar
 */
const BusinessAnalyticsDashboard = () => {
  return (
    <FullWidthLayout>
      <AnalyticsContent />
    </FullWidthLayout>
  );
};

export default BusinessAnalyticsDashboard;
