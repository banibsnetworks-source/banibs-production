import React from 'react';
import SocialSettingsPlaceholder from './SocialSettingsPlaceholder';
import { Settings } from 'lucide-react';

const LanguageSettings = () => {
  return (
    <SocialSettingsPlaceholder 
      title="Language"
      description="Choose your preferred language for the BANIBS platform"
      icon={Settings}
    />
  );
};

export default LanguageSettings;
