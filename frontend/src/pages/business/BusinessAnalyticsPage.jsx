import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { BarChart3 } from 'lucide-react';

/**
 * BusinessAnalyticsPage - Phase 8.4
 * Business analytics and insights
 */
const BusinessAnalyticsPage = () => {
  return (
    <BusinessLayout>
      <BusinessPlaceholder
        title="Analytics"
        description="View detailed analytics and insights about your business performance."
        icon={BarChart3}
      />
    </BusinessLayout>
  );
};

export default BusinessAnalyticsPage;
