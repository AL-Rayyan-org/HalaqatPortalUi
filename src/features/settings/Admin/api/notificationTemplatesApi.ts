/**
 * Notification Templates API functions
 */

import { fetcher } from '@/shared/services/apiClient';
import type { ApiResponse } from '@/shared/types/api';
import type {
  NotificationTemplateListItem,
  NotificationTemplate,
  UpdateNotificationTemplateRequest,
} from '@/features/settings/Admin/types';

/**
 * Get all notification templates
 */
export const getNotificationTemplates = async (): Promise<ApiResponse<NotificationTemplateListItem[]>> => {
  return fetcher<NotificationTemplateListItem[]>('/notification-templates', 'GET');
};

/**
 * Get notification template by ID
 */
export const getNotificationTemplateById = async (
  templateId: string
): Promise<ApiResponse<NotificationTemplate>> => {
  return fetcher<NotificationTemplate>(`/notification-templates/${templateId}`, 'GET');
};

/**
 * Update notification template variant
 */
export const updateNotificationTemplate = async (
  templateId: string,
  data: UpdateNotificationTemplateRequest
): Promise<ApiResponse<void>> => {
  return fetcher<void>(`/notification-templates/${templateId}`, 'PUT', data);
};
