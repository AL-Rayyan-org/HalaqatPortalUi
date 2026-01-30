import { Link, useLocation } from 'react-router-dom';
import { cn, isPathActive } from '@/shared/utils/cn';
import { useSettingsConfig } from '../hooks/useSettingsConfig';

interface SettingsSidebarProps {
  className?: string;
}

export function SettingsSidebar({ className }: SettingsSidebarProps) {
  const location = useLocation();
  const { config } = useSettingsConfig();

  return (
    <aside className={cn("min-w-60 w-60 shrink-0 ltr:border-r rtl:border-l bg-background/50", className)}>
      <div className="py-4 px-2 h-full overflow-y-auto">
        <nav className="flex flex-col h-full space-y-3">
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
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2  font-medium transition-colors rounded-md mb-1',
                      isActive
                        ? 'bg-muted text-foreground'
                        : ' hover:text-foreground hover:bg-muted/50'
                    )}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
