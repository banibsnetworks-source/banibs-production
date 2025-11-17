import React from 'react';
import SocialLayout from '../../../components/social/SocialLayout';
import SocialSettingsPlaceholder from './SocialSettingsPlaceholder';
import { UserX } from 'lucide-react';

const AnonymousPostingSettings = () => {
  return (
    <SocialLayout>
      <SocialSettingsPlaceholder
        title="Anonymous Posting"
        description="Control your anonymous posting preferences and manage anonymous content."
        icon={UserX}
      />
    </SocialLayout>
  );
};

export default AnonymousPostingSettings;
