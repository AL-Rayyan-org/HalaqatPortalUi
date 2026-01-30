import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
// 1. استيراد كل ملفات الترجمة -- English --
import enCommon from '../../locales/en/common.json';
import enAuth from '../../locales/en/auth.json';
import enEmail from '../../locales/en/email.json';
import enSettings from '../../locales/en/settings.json';
import enAuditLogs from '../../locales/en/auditLogs.json';
import enDashboard from '../../locales/en/dashboard.json';

// 1. استيراد كل ملفات الترجمة -- Arabic --
import arCommon from '../../locales/ar/common.json';
import arAuth from '../../locales/ar/auth.json';
import arEmail from '../../locales/ar/email.json';
import arSettings from '../../locales/ar/settings.json';
import arAuditLogs from '../../locales/ar/auditLogs.json';
import arDashboard from '../../locales/ar/dashboard.json';

const resources = {
  en: {
    common: enCommon,
    auth: enAuth,
    email: enEmail,
    settings: enSettings,
    auditLogs: enAuditLogs,
    dashboard: enDashboard,
  },
  ar: {
    common: arCommon,
    auth: arAuth,
    email: arEmail,
    settings: arSettings,
    auditLogs: arAuditLogs,
    dashboard: arDashboard,
  },
};

// Language detection configuration
const detectionOptions = {
  // Detection order
  order: ['localStorage', 'navigator', 'htmlTag'],
  
  // Keys or params to look for language
  lookupLocalStorage: 'hafiz-language',
  
  // Cache user language on
  caches: ['localStorage'],
  
  // Don't convert country codes to language codes
  convertDetectedLanguage: (lng: string) => {
    // Extract language code from locale (e.g., 'en-US' -> 'en')
    return lng.split('-')[0];
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    
    ns: ['common', 'auth', 'email', 'invitation', 'teams', 'workspace', 'settings', 'contacts', 'apps', 'organizations', 'dashboard'],
    // Default language
    fallbackLng: 'en',
    
    // Default namespace
    defaultNS: 'common',
    
    // Language detection
    detection: detectionOptions,
    
    // Interpolation options
    interpolation: {
      escapeValue: false, // React already does escaping
    },
    
    // React options
    react: {
      useSuspense: false, // We'll handle loading states manually
    },
    
    // Debug mode (disable in production)
    debug: process.env.NODE_ENV === 'development',
  });

export default i18n;

// Helper function to get current language direction
export const getLanguageDirection = (language: string): 'ltr' | 'rtl' => {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur'];
  return rtlLanguages.includes(language) ? 'rtl' : 'ltr';
};

// Helper function to set document direction
export const setDocumentDirection = (language: string) => {
  const direction = getLanguageDirection(language);
  document.documentElement.dir = direction;
  document.documentElement.lang = language;
  
  // Add/remove RTL class for styling
  if (direction === 'rtl') {
    document.documentElement.classList.add('rtl');
  } else {
    document.documentElement.classList.remove('rtl');
  }
};

// Initialize direction on load
setDocumentDirection(i18n.language);

// Update direction when language changes
i18n.on('languageChanged', (lng) => {
  setDocumentDirection(lng);
});