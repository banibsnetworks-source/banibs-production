import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import JobForm from '../connect/JobForm';

/**
 * BusinessJobForm - Phase 8.4
 * Wrapper for JobForm with BusinessLayout
 */
const BusinessJobForm = () => {
  return (
    <BusinessLayout>
      <JobForm />
    </BusinessLayout>
  );
};

export default BusinessJobForm;
