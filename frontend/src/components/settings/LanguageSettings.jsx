import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'es', name: 'Spanish', nativeName: 'Español' }
];

export const LanguageSettings = () => {
  const { t, i18n } = useTranslation();
  const { user, updateUserProfile } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Load user's preferred language from auth
    if (user?.preferred_language) {
      setSelectedLanguage(user.preferred_language);
      i18n.changeLanguage(user.preferred_language);
    }
  }, [user, i18n]);

  const handleLanguageChange = async (languageCode) => {
    setSelectedLanguage(languageCode);
    setSaving(true);
    setMessage(null);

    try {
      // Change language in i18n
      await i18n.changeLanguage(languageCode);
      
      // Save to backend if user is logged in
      if (auth?.user && updateProfile) {
        await updateProfile({ preferred_language: languageCode });
        setMessage({ type: 'success', text: t('settings.languageSaved') });
      }
    } catch (error) {
      console.error('Failed to save language preference:', error);
      setMessage({ type: 'error', text: t('errors.generic') });
    } finally {
      setSaving(false);
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold mb-2">{t('settings.language')}</h2>
        <p className="text-sm text-gray-400">
          {t('settings.selectLanguage')}
        </p>
      </div>

      {/* Language Options */}
      <div className="space-y-3">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            disabled={saving}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition ${
              selectedLanguage === lang.code
                ? 'border-banibs-gold bg-banibs-gold/10'
                : 'border-gray-700 bg-black/40 hover:border-gray-600'
            } ${saving ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  selectedLanguage === lang.code
                    ? 'border-banibs-gold'
                    : 'border-gray-600'
                }`}
              >
                {selectedLanguage === lang.code && (
                  <div className="w-3 h-3 rounded-full bg-banibs-gold" />
                )}
              </div>
              <div className="text-left">
                <div className="font-medium">{lang.nativeName}</div>
                <div className="text-sm text-gray-400">{lang.name}</div>
              </div>
            </div>
            
            {selectedLanguage === lang.code && (
              <span className="text-xs px-2 py-1 rounded-full bg-banibs-gold/20 text-banibs-gold">
                {t('common.selected') || 'Selected'}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Status Message */}
      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.type === 'success'
              ? 'border-green-500/40 bg-green-900/20 text-green-200'
              : 'border-red-500/40 bg-red-900/20 text-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Saving Indicator */}
      {saving && (
        <div className="text-sm text-gray-400 flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-banibs-gold border-t-transparent rounded-full animate-spin" />
          {t('common.saving') || 'Saving'}...
        </div>
      )}
    </div>
  );
};

export default LanguageSettings;
