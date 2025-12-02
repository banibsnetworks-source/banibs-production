import React from 'react';
import FullWidthLayout from '../../components/layouts/FullWidthLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { FileText } from 'lucide-react';

/**
 * BusinessPostsPage - Phase 8.4
 * Manage business posts and updates
 */
const BusinessPostsPage = () => {
  return (
    <FullWidthLayout>
      <BusinessPlaceholder
        title="My Posts"
        description="View and manage all posts and updates from your business."
        icon={FileText}
      />
    </FullWidthLayout>
  );
};

export default BusinessPostsPage;
