import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Building2 } from 'lucide-react';

/**
 * BusinessProfilePage - Phase 8.4
 * Business owner's profile page (currently placeholder)
 */
const BusinessProfilePage = () => {
  return (
    <BusinessLayout>
      <BusinessPlaceholder
        title="Business Profile"
        description="View and edit your business profile, including avatar, banner, services, and reviews."
        icon={Building2}
      />
    </BusinessLayout>
  );
};

export default BusinessProfilePage;
