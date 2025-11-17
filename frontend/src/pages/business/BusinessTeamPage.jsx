import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Users } from 'lucide-react';

/**
 * BusinessTeamPage - Phase 8.4
 * Manage business team members and staff
 */
const BusinessTeamPage = () => {
  return (
    <BusinessLayout>
      <BusinessPlaceholder
        title="Team & Staff"
        description="Manage your business team members, roles, and permissions."
        icon={Users}
      />
    </BusinessLayout>
  );
};

export default BusinessTeamPage;
