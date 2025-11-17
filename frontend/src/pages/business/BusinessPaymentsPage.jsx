import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { Wallet } from 'lucide-react';

/**
 * BusinessPaymentsPage - Phase 8.4
 * Manage business payments and billing
 */
const BusinessPaymentsPage = () => {
  return (
    <BusinessLayout>
      <BusinessPlaceholder
        title="Payments & Billing"
        description="Manage invoices, payments, and billing information for your business."
        icon={Wallet}
      />
    </BusinessLayout>
  );
};

export default BusinessPaymentsPage;
