import React from 'react';
import SocialSettingsPlaceholder from './SocialSettingsPlaceholder';
import { EyeOff } from 'lucide-react';

const HiddenBlockedSettings = () => {
  return (
    <SocialSettingsPlaceholder 
      title="Hidden / Blocked"
      description="Manage hidden content and blocked users"
      icon={EyeOff}
    />
  );
};

export default HiddenBlockedSettings;
