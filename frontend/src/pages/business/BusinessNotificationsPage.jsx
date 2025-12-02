import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Bell } from 'lucide-react';

/**
 * BusinessNotificationsPage - Phase 8.4
 * Business notifications and alerts
 */
const BusinessNotificationsPage = () => {
  return (
    <FullWidthLayout>
      <BusinessPlaceholder
        title="Notifications"
        description="View and manage notifications for your business activity."
        icon={Bell}
      />
    </FullWidthLayout>
  );
};

export default BusinessNotificationsPage;
