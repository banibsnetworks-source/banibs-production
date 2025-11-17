import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Bell } from 'lucide-react';

/**
 * BusinessNotificationsPage - Phase 8.4
 * Business notifications and alerts
 */
const BusinessNotificationsPage = () => {
  return (
    <BusinessLayout>
      <BusinessPlaceholder
        title="Notifications"
        description="View and manage notifications for your business activity."
        icon={Bell}
      />
    </BusinessLayout>
  );
};

export default BusinessNotificationsPage;
