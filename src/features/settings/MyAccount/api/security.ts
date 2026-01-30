import { fetcher } from '@/shared/services/apiClient';
import type { 
  ApiResponse,
  ChangePasswordRequest
} from '@/shared/types/api';

/**
 * Begin email change - sends verification code to new email
 */
export const beginEmailChange = async (data: { address: string }): Promise<ApiResponse<void>> => {
  return fetcher<void>('/profile/change-email/begin', 'POST', data);
};

/**
 * Verify email change code - no auth required
 */
export const verifyEmailChangeCode = async (data: { address: string; code: string }): Promise<ApiResponse<{ token: string }>> => {
  return fetcher<{ token: string }>('/profile/change-email/verify', 'POST', data);
};

/**
 * Commit email change with token
 */
export const commitEmailChange = async (data: { token: string }): Promise<ApiResponse<void>> => {
  return fetcher<void>('/profile/change-email/commit', 'POST', data);
};

/**
 * Change user password
 */
export const changePassword = async (data: ChangePasswordRequest): Promise<ApiResponse<void>> => {
  return fetcher<void>('/profile/password', 'POST', data);
};