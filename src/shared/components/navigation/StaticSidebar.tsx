import { GalleryVerticalEnd } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn, isPathActive } from "@/shared/utils/cn";
import {
  UserDropdown,
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
  Avatar,
  AvatarFallback,
} from "@/shared/components/ui";
import { useProfile } from "@/shared/stores/profileStore";
import { sidebarNavigationItems } from "@/shared/utils/appLinks";
import type { Profile } from "@/shared/types/api";
import { useI18n } from "@/shared/hooks/useI18n";
import getInitials from "@/shared/utils/getInitials";
import { isOwnerRole } from "@/shared/utils/roles";

// Navigation items
const navigationItems = sidebarNavigationItems;

// Get user data from profile
function getUserData(profileData: Profile | null) {
  return {
    name: `${profileData?.firstName} ${profileData?.lastName}`,
    email: profileData?.email,
    avatar: "",
    username: profileData?.email,
    role: profileData?.role,
    tenantName: profileData?.tenantName,
  };
}

export function StaticSidebar() {
  const { t } = useI18n();
  const location = useLocation();
  const profile = useProfile();
  const user = getUserData(profile);

  // Filter navigation items based on role (audit logs for owner only)
  const filteredNavigationItems = navigationItems.filter((item) => {
    // Filter out audit logs if not owner
    if (item.href === "/audit-logs" && !isOwnerRole(profile?.role)) {
      return false;
    }
    return true;
  });

  return (
    <div className="hidden md:flex flex-col w-15 bg-background rtl:border-l ltr:border-r h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 bg-primary">
        <Link
          to="/"
          className="text-primary-foreground flex w-10 h-10 items-center justify-center rounded-md"
        >
          <GalleryVerticalEnd className="size-5" />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 bg-primary">
        <TooltipProvider delayDuration={0}>
          <div className="space-y-2 px-2">
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
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-lg transition-colors",
                        isActive
                          ? "bg-muted text-foreground"
                          : "text-primary-foreground hover:text-foreground hover:bg-muted",
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" sideOffset={12}>
                    {t(item.nameKey || item.name)}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        </TooltipProvider>
      </nav>

      {/* User Menu */}
      <div className="p-2 flex items-center justify-center bg-primary">
        <UserDropdown className="mb-5" align="start" side="right">
          <Avatar className="h-9 w-9 cursor-pointer">
            <AvatarFallback className="text-foreground font-medium">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </UserDropdown>
      </div>
    </div>
  );
}
