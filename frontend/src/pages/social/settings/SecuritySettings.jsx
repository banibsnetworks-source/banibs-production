import React from 'react';
import SocialSettingsPlaceholder from './SocialSettingsPlaceholder';
import { ShieldCheck } from 'lucide-react';

const SecuritySettings = () => {
  return (
    <SocialSettingsPlaceholder 
      title="Security & 2FA"
      description="Secure your account with two-factor authentication"
      icon={ShieldCheck}
    />
  );
};

export default SecuritySettings;
