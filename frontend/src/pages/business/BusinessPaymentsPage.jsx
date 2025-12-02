import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Wallet } from 'lucide-react';

/**
 * BusinessPaymentsPage - Phase 8.4
 * Manage business payments and billing
 */
const BusinessPaymentsPage = () => {
  return (
    <FullWidthLayout>
      <BusinessPlaceholder
        title="Payments & Billing"
        description="Manage invoices, payments, and billing information for your business."
        icon={Wallet}
      />
    </FullWidthLayout>
  );
};

export default BusinessPaymentsPage;
