import { Link, useLocation } from 'react-router-dom';
import { cn, isPathActive } from '@/shared/utils/cn';
import { GalleryVerticalEnd, X } from 'lucide-react';
import { SheetContentNoClose } from './SheetContentNoClose';
import { useSettingsConfig } from '../hooks/useSettingsConfig';

import {
  Button,
  Sheet,
  SheetClose,
  SheetHeader,
  SheetTitle
} from "@/shared/components/ui";

interface SettingsSidebarMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsSidebarMobile({ isOpen, onClose }: SettingsSidebarMobileProps) {
  const location = useLocation();
  const { config } = useSettingsConfig();

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContentNoClose 
        side="left" 
        className={cn(
          "p-0 w-[75%] max-w-sm transition-transform duration-300 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Fixed Header */}
        <div className="flex items-center justify-between border-b p-4 shrink-0">
          <SheetHeader className="text-start">
            <SheetTitle className='flex items-center gap-3'>
                <Link to="/" className="bg-primary text-primary-foreground flex w-8 h-8 items-center justify-center rounded-md hover:bg-primary/90 transition-colors">
                    <GalleryVerticalEnd className="size-4" />
                </Link>
                {config.title}
            </SheetTitle>
          </SheetHeader>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </SheetClose>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <nav className="flex flex-col space-y-6 p-4">
            {config.sections.map((section, sectionIndex) => (
              <div key={`section-${sectionIndex}`} className="space-y-1">
                {section.title && (
                  <h3 className="text-sm font-medium text-muted-foreground px-3 mb-2">{section.title}</h3>
                )}
                {section.items.map((item) => {
                  // Get all paths from all sections for conflict detection
                  const allPaths = config.sections.flatMap(s => s.items.map(i => i.href));
                  
                  // Use the utility function to determine if the path is active
                  const isActive = isPathActive(
                    location.pathname, 
                    item.href,
                    item.exact,
                    allPaths
                  );
                  
                  const Icon = item.icon;
                  
                  return (
                    <SheetClose asChild key={item.name}>
                      <Link
                        to={item.href}
                        className={cn(
                          'flex items-center gap-2 px-3 py-2  font-medium transition-colors rounded-md mb-1',
                          isActive
                            ? 'bg-muted text-foreground'
                            : 'hover:text-foreground hover:bg-muted/50'
                        )}
                        onClick={onClose}
                      >
                        <Icon className="h-5 w-5 flex-shrink-0" />
                        {item.name}
                      </Link>
                    </SheetClose>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>
      </SheetContentNoClose>
    </Sheet>
  );
}
