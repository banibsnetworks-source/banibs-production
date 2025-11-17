import React from 'react';
import BusinessLayout from '../../components/business/BusinessLayout';
import BusinessPlaceholder from '../../components/business/BusinessPlaceholder';
import { GraduationCap } from 'lucide-react';

/**
 * BusinessLessonsPage - Phase 8.4
 * Business learning resources and lessons
 */
const BusinessLessonsPage = () => {
  return (
    <BusinessLayout>
      <BusinessPlaceholder
        title="Business Lessons"
        description="Access business education, courses, and learning resources."
        icon={GraduationCap}
      />
    </BusinessLayout>
  );
};

export default BusinessLessonsPage;
