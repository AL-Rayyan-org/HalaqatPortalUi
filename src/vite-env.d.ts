/// <reference types="vite/client" />/// <reference types="vite/client" />


interface ImportMetaEnv {
  readonly VITE_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Add type definition for our custom window properties
interface UI {
  toggleSettingsSidebar?: () => void;
}

declare global {
  interface Window {
    ui?: UI;
  }
}