import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { FileText } from 'lucide-react';

/**
 * BusinessPostsPage - Phase 8.4
 * Manage business posts and updates
 */
const BusinessPostsPage = () => {
  return (
    <BusinessLayout>
      <BusinessPlaceholder
        title="My Posts"
        description="View and manage all posts and updates from your business."
        icon={FileText}
      />
    </BusinessLayout>
  );
};

export default BusinessPostsPage;
