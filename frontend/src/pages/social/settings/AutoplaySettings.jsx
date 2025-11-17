import React from 'react';
import SocialLayout from '../../../components/social/SocialLayout';
import SocialSettingsPlaceholder from './SocialSettingsPlaceholder';
import { Video } from 'lucide-react';

const AutoplaySettings = () => {
  return (
    <SocialLayout>
      <SocialSettingsPlaceholder
        title="Autoplay Settings"
        description="Control video autoplay behavior in your feed."
        icon={Video}
      />
    </SocialLayout>
  );
};

export default AutoplaySettings;
