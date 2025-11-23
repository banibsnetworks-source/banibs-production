import React from 'react';
import ConnectLayout from '../../components/connect/ConnectLayout';
import AnalyticsContent from '../../components/business/AnalyticsContent';

/**
 * AnalyticsDashboard - Connect Layout wrapper for analytics
 * Now uses the shared AnalyticsContent component
 */
const AnalyticsDashboard = () => {
  return (
    <ConnectLayout>
      <AnalyticsContent />
    </ConnectLayout>
  );
};

export default AnalyticsDashboard;
