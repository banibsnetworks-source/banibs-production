import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import JobsDashboard from '../connect/JobsDashboard';

/**
 * BusinessJobsDashboard - Phase 8.4
 * Wrapper for JobsDashboard with BusinessLayout
 */
const BusinessJobsDashboard = () => {
  return (
    <FullWidthLayout>
      <JobsDashboard />
    </FullWidthLayout>
  );
};

export default BusinessJobsDashboard;
