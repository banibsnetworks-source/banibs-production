import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import AnalyticsDashboard from '../connect/AnalyticsDashboard';

/**
 * BusinessAnalyticsDashboard - Phase 8.4
 * Wrapper for AnalyticsDashboard with BusinessLayout
 */
const BusinessAnalyticsDashboard = () => {
  return (
    <BusinessLayout>
      <AnalyticsDashboard />
    </BusinessLayout>
  );
};

export default BusinessAnalyticsDashboard;
