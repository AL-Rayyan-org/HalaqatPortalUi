import { fetcher } from '@/shared/services/apiClient';
import { useProfileStore } from '@/shared/stores/profileStore';
import type { 
  ApiResponse, 
  Profile,
} from '@/shared/types/api';

/**
 * Store user profile in Zustand store
 */
export const storeProfile = (profile: Profile): void => {
  useProfileStore.getState().setProfile(profile);
};

/**
 * Get user profile from API
 */
export const getProfile = async (): Promise<ApiResponse<Profile>> => {
  return fetcher<Profile>('/profile');
};

/**
 * Fetch and store user profile
 */
export const fetchAndStoreProfile = async (): Promise<ApiResponse<Profile>> => {
  const response = await getProfile();
  if (response.success && response.data) {
    storeProfile(response.data);
  }
  return response;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: { 
  firstName: string; 
  lastName: string;
  phone?: string;
  timezoneId?: string;
}): Promise<ApiResponse<Profile>> => {
  return fetcher<Profile>('/profile', 'PUT', data);
};

/**
 * Get all available timezones
 */
export const getTimezones = async (): Promise<ApiResponse<Record<string, string>>> => {
  return fetcher<Record<string, string>>('/timezones/list', 'GET', undefined, false);
};