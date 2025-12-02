import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import JobForm from '../connect/JobForm';

/**
 * BusinessJobForm - Phase 8.4
 * Wrapper for JobForm with BusinessLayout
 */
const BusinessJobForm = () => {
  return (
    <FullWidthLayout>
      <JobForm />
    </FullWidthLayout>
  );
};

export default BusinessJobForm;
