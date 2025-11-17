import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import JobsDashboard from '../connect/JobsDashboard';

/**
 * BusinessJobsDashboard - Phase 8.4
 * Wrapper for JobsDashboard with BusinessLayout
 */
const BusinessJobsDashboard = () => {
  return (
    <BusinessLayout>
      <JobsDashboard />
    </BusinessLayout>
  );
};

export default BusinessJobsDashboard;
