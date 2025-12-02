import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Settings } from 'lucide-react';

/**
 * BusinessSettingsPage - Phase 8.4
 * Business settings and configuration
 */
const BusinessSettingsPage = () => {
  return (
    <FullWidthLayout>
      <BusinessPlaceholder
        title="Business Settings"
        description="Configure your business settings, preferences, and integrations."
        icon={Settings}
      />
    </FullWidthLayout>
  );
};

export default BusinessSettingsPage;
