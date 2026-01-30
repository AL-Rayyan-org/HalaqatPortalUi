/**
 * Email Settings API functions
 */

import { fetcher } from '@/shared/services/apiClient';
import type { ApiResponse } from '@/shared/types/api';
import type {
  EmailSettings,
  UpdateEmailSettingsRequest,
} from '../types';

/**
 * Get email settings
 */
export const getEmailSettings = async (): Promise<ApiResponse<EmailSettings>> => {
  return fetcher<EmailSettings>('/settings/email', 'GET');
};

/**
 * Update email settings
 */
export const updateEmailSettings = async (
  data: UpdateEmailSettingsRequest
): Promise<ApiResponse<null>> => {
  return fetcher<null>('/settings/email', 'PUT', data);
};
