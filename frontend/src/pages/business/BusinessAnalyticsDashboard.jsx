import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import AnalyticsContent from '../../components/business/AnalyticsContent';

/**
 * BusinessAnalyticsDashboard - Phase 8.4
 * Analytics dashboard for Business Mode
 * Uses pure AnalyticsContent component (no layout wrapper) to avoid duplicate navbar
 */
const BusinessAnalyticsDashboard = () => {
  return (
    <BusinessLayout>
      <AnalyticsContent />
    </BusinessLayout>
  );
};

export default BusinessAnalyticsDashboard;
