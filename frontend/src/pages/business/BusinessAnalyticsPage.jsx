import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { BarChart3 } from 'lucide-react';

/**
 * BusinessAnalyticsPage - Phase 8.4
 * Business analytics and insights
 */
const BusinessAnalyticsPage = () => {
  return (
    <FullWidthLayout>
      <BusinessPlaceholder
        title="Analytics"
        description="View detailed analytics and insights about your business performance."
        icon={BarChart3}
      />
    </FullWidthLayout>
  );
};

export default BusinessAnalyticsPage;
