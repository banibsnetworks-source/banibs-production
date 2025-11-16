import React from 'react';
import SocialLayout from '../../components/social/SocialLayout';
import ComingSoon from '../../components/common/ComingSoon';

/**
 * S-FINAL S4: Generic Coming Soon page for Social features
 * Wraps the reusable ComingSoon component with SocialLayout
 */
const SocialComingSoon = ({ title, description, section = "default", customIcon }) => {
  return (
    <SocialLayout>
      <ComingSoon 
        section={section}
        title={title}
        description={description}
        customIcon={customIcon}
        showBackButton={true}
      />
    </SocialLayout>
  );
};

export default SocialComingSoon;
