/**
 * Zustand store for user profile management
 * Replaces localStorage-based profile storage for better security and reactivity
 */
import { create } from 'zustand';
import type { Profile } from '@/shared/types/api';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  setProfile: (profile: Profile | null) => void;
  clearProfile: () => void;
  updateProfile: (updates: Partial<Profile>) => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Global store for user profile data
 * Benefits over localStorage:
 * - More secure (data only in memory, not persisted to disk)
 * - Reactive updates (components automatically re-render when profile changes)
 * - Type-safe access to profile data
 * - Centralized state management
 */
export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: false,

  /**
   * Set the complete profile object
   */
  setProfile: (profile) => set({ profile }),

  /**
   * Clear the profile (used on logout)
   */
  clearProfile: () => set({ profile: null }),

  /**
   * Update specific fields of the profile
   */
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null
  })),

  /**
   * Set loading state
   */
  setLoading: (loading) => set({ isLoading: loading }),
}));

/**
 * Helper hook to get just the profile data
 */
export const useProfile = () => useProfileStore((state) => state.profile);

/**
 * Helper hook to get profile loading state
 */
export const useProfileLoading = () => useProfileStore((state) => state.isLoading);


/**
 * Check if profile needs to be fetched
 * Returns true if token exists but profile is null
 */
export const shouldFetchProfile = (): boolean => {
  const token = localStorage.getItem('hafiz-token');
  const profile = useProfileStore.getState().profile;
  return !!token && !profile;
};
