import React from 'react';
import { LanguageSettings as LanguageSettingsComponent } from '../../../components/settings/LanguageSettings';

const LanguageSettings = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="rounded-2xl border border-gray-700/80 bg-black/40 p-6">
        <LanguageSettingsComponent />
      </div>
    </div>
  );
};

export default LanguageSettings;
