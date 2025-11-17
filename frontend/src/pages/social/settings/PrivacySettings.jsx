import React from 'react';
import SocialSettingsPlaceholder from './SocialSettingsPlaceholder';
import { Lock } from 'lucide-react';

const PrivacySettings = () => {
  return (
    <SocialSettingsPlaceholder 
      title="Privacy Settings"
      description="Control who can see your content and interact with you"
      icon={Lock}
    />
  );
};

export default PrivacySettings;
