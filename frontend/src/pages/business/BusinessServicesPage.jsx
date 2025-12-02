import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Target } from 'lucide-react';

/**
 * BusinessServicesPage - Phase 8.4
 * Manage business services and offerings
 */
const BusinessServicesPage = () => {
  return (
    <FullWidthLayout>
      <BusinessPlaceholder
        title="Services & Offerings"
        description="Manage the services and products your business offers."
        icon={Target}
        imageSrc="/images/business/placeholders/services.jpg"
      />
    </FullWidthLayout>
  );
};

export default BusinessServicesPage;
