import { useEffect, useState } from "react";
import { useProfile } from "@/shared/stores/profileStore";
import { isAdminRole } from "@/shared/utils/roles";

export function useIsAdmin() {
  const profile = useProfile();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Changed to true by default

  useEffect(() => {
    if (profile) {
      const adminStatus = isAdminRole(profile.role);
      setIsAdmin(adminStatus);
      setIsLoading(false);
    } else {
      // Profile not loaded yet, wait for useProfileHydration to handle it
      setIsAdmin(null);
      setIsLoading(true);
    }
  }, [profile]);

  return { isAdmin, isLoading, profile };
}