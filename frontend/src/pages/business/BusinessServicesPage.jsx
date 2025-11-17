import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Target } from 'lucide-react';

/**
 * BusinessServicesPage - Phase 8.4
 * Manage business services and offerings
 */
const BusinessServicesPage = () => {
  return (
    <BusinessLayout>
      <BusinessPlaceholder
        title="Services & Offerings"
        description="Manage the services and products your business offers."
        icon={Target}
        imageSrc="/images/business/placeholders/services.jpg"
      />
    </BusinessLayout>
  );
};

export default BusinessServicesPage;
