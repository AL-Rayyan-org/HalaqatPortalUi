import { useTranslation } from 'react-i18next';

/**
 * Custom hook for translations with common namespace as default
 * Provides easy access to translation function and current language info
 */
export const useI18n = () => {
  const { t, i18n } = useTranslation();
  
  return {
    t,
    i18n,
    language: i18n.language,
    isRTL: i18n.language === 'ar',
    changeLanguage: (lng: string) => i18n.changeLanguage(lng),
  };
};