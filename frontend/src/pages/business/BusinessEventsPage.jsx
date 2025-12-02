import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Calendar } from 'lucide-react';

/**
 * BusinessEventsPage - Phase 8.4
 * Manage business events and bookings
 */
const BusinessEventsPage = () => {
  return (
    <FullWidthLayout>
      <BusinessPlaceholder
        title="Events & Bookings"
        description="Create and manage business events, appointments, and bookings."
        icon={Calendar}
        imageSrc="/images/business/placeholders/events.jpg"
      />
    </FullWidthLayout>
  );
};

export default BusinessEventsPage;
