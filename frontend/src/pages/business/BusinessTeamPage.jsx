import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Users } from 'lucide-react';

/**
 * BusinessTeamPage - Phase 8.4
 * Manage business team members and staff
 */
const BusinessTeamPage = () => {
  return (
    <FullWidthLayout>
      <BusinessPlaceholder
        title="Team & Staff"
        description="Manage your business team members, roles, and permissions."
        icon={Users}
        imageSrc="/images/business/placeholders/team.jpg"
      />
    </FullWidthLayout>
  );
};

export default BusinessTeamPage;
