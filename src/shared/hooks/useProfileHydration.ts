/**
 * Profile hydration hook
 * Automatically fetches profile when app loads if token exists but profile is missing
 */
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile, shouldFetchProfile, useProfileStore } from '@/shared/stores/profileStore';
import { fetchAndStoreProfile } from '@/shared/services/profileService';

/**
 * Hook to automatically fetch profile on app mount
 * - Checks if token exists but profile is missing (after page refresh)
 * - Fetches profile from API
 * - Redirects to login if 401 (invalid/expired token)
 */
export function useProfileHydration() {
  const profile = useProfile();
  const navigate = useNavigate();
  const setLoading = useProfileStore((state) => state.setLoading);
  const isHydrating = useRef(false);
  const hasHydrated = useRef(false);

  useEffect(() => {
    // Only run once on mount and if not already hydrating
    if (hasHydrated.current || isHydrating.current) {
      return;
    }

    // Check if we need to fetch profile
    if (shouldFetchProfile()) {
      isHydrating.current = true;
      setLoading(true);

      fetchAndStoreProfile()
        .then((response) => {
          if (!response.success) {
            // If failed (401 or other error), redirect to login
            console.error('Failed to fetch profile:', response.message);
            if (response.statusCode === 401) {
              navigate('/auth/login', { replace: true });
            }
          }
        })
        .catch((error) => {
          console.error('Error fetching profile:', error);
          // On error, redirect to login
          navigate('/auth/login', { replace: true });
        })
        .finally(() => {
          isHydrating.current = false;
          hasHydrated.current = true;
          setLoading(false);
        });
    }
  }, [navigate, profile]);

  return { profile, isHydrating: isHydrating.current };
}
