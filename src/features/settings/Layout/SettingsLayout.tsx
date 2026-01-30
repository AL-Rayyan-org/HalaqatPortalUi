import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SettingsSidebar } from './SettingsSidebar';
import { SettingsSidebarMobile } from './SettingsSidebarMobile';
import { useIsMobile } from '@/shared/hooks/useMobile';

// Define interface for window.ui



interface SettingsLayoutProps {
  children: ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  // Store the toggle function in a window property so it can be accessed by the MobileHeader
  useEffect(() => {
    // Create a global object for our app if it doesn't exist
    window.ui = window.ui || {};
    
    // Store the toggle function
    window.ui.toggleSettingsSidebar = () => setIsOpen(prev => !prev);
    
    return () => {
      // Clean up when component unmounts
      if (window.ui) {
        delete window.ui.toggleSettingsSidebar;
      }
    };
  }, []);

  return (
    <div className="flex h-full">
      {/* Desktop sidebar */}
      {!isMobile && <SettingsSidebar className="hidden md:block" />}
      
      {/* Mobile offcanvas sidebar */}
      {isMobile && <SettingsSidebarMobile isOpen={isOpen} onClose={() => setIsOpen(false)} />}
      
      <div className="flex-1 overflow-auto p-4 md:px-10 md:py-8">
        <main>
          {children}
        </main>
      </div>
    </div>
  );
}
