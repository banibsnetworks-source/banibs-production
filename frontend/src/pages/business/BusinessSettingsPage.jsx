import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Settings } from 'lucide-react';

/**
 * BusinessSettingsPage - Phase 8.4
 * Business settings and configuration
 */
const BusinessSettingsPage = () => {
  return (
    <BusinessLayout>
      <BusinessPlaceholder
        title="Business Settings"
        description="Configure your business settings, preferences, and integrations."
        icon={Settings}
      />
    </BusinessLayout>
  );
};

export default BusinessSettingsPage;
