import { useEffect, useState } from "react";
import { useProfile } from "@/shared/stores/profileStore";
import { isOwnerRole } from "@/shared/utils/roles";

export function useIsOwner() {
  const profile = useProfile();
  const [isOwner, setIsOwner] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(!profile);

  useEffect(() => {
    if (profile) {
      setIsOwner(isOwnerRole(profile.role));
      setIsLoading(false);
    } else {
      // Profile not loaded yet, wait for useProfileHydration to handle it
      setIsOwner(null);
      setIsLoading(true);
    }
  }, [profile]);

  return { isOwner, isLoading, profile };
}
