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
  
  // Initialize from localStorage or i18n current language
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // Priority: 1. localStorage, 2. user profile, 3. i18n.language, 4. default 'en'
    return localStorage.getItem('i18nextLng') || i18n.language || 'en';
  });
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // On component mount, sync with user's preferred language from profile or localStorage
    const currentLang = user?.preferred_language || localStorage.getItem('i18nextLng') || 'en';
    setSelectedLanguage(currentLang);
    
    // Ensure i18n is also set to this language
    if (i18n.language !== currentLang) {
      i18n.changeLanguage(currentLang);
    }
  }, [user, i18n]);

  const handleLanguageChange = async (languageCode) => {
    setSaving(true);
    setMessage(null);

    try {
      // THREE THINGS:
      
      // 1. Update local state (updates UI immediately - circle and "selected" label)
      setSelectedLanguage(languageCode);
      
      // 2. Change i18n language (triggers translations to update on the page)
      await i18n.changeLanguage(languageCode);
      
      // 3. Save to localStorage (for persistence across sessions)
      localStorage.setItem('i18nextLng', languageCode);
      
      // 4. Save to backend if user is logged in (for cross-device sync)
      if (user && updateUserProfile) {
        await updateUserProfile({ preferred_language: languageCode });
      }
      
      setMessage({ type: 'success', text: t('settings.languageSaved') });
    } catch (error) {
      console.error('Failed to save language preference:', error);
      setMessage({ type: 'error', text: t('errors.generic') });
      
      // Rollback state on error
      const previousLang = localStorage.getItem('i18nextLng') || 'en';
      setSelectedLanguage(previousLang);
      i18n.changeLanguage(previousLang);
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
