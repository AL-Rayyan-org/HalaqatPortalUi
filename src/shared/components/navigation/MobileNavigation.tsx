import { Link, useLocation } from "react-router-dom";
import { cn, isPathActive } from "@/shared/utils/cn";
import { sidebarNavigationItems } from "@/shared/utils/appLinks";
import { useProfile } from "@/shared/stores/profileStore";
import { isOwnerRole } from "@/shared/utils/roles";

// Inline navigation data
const navigationItems = sidebarNavigationItems;

export function MobileNavigation() {
  const location = useLocation();
  const profile = useProfile();

  // Filter navigation items based on role (audit logs for owner only)
  const filteredNavigationItems = navigationItems.filter((item) => {
    // Filter out audit logs if not owner
    if (item.href === "/audit-logs" && !isOwnerRole(profile?.role)) {
      return false;
    }
    return true;
  });

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
      <nav className="flex items-center justify-around p-2">
        {filteredNavigationItems.map((item) => {
          // Get all paths for conflict detection
          const allPaths = filteredNavigationItems.map(
            (navItem) => navItem.href,
          );

          const isActive = isPathActive(
            location.pathname,
            item.href,
            item.exact || false,
            allPaths,
          );
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-colors min-w-0 flex-1",
                isActive
                  ? "text-primary bg-primary/10"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
