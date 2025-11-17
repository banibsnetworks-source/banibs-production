import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Calendar } from 'lucide-react';

/**
 * BusinessEventsPage - Phase 8.4
 * Manage business events and bookings
 */
const BusinessEventsPage = () => {
  return (
    <BusinessLayout>
      <BusinessPlaceholder
        title="Events & Bookings"
        description="Create and manage business events, appointments, and bookings."
        icon={Calendar}
        imageSrc="/images/business/placeholders/events.jpg"
      />
    </BusinessLayout>
  );
};

export default BusinessEventsPage;
