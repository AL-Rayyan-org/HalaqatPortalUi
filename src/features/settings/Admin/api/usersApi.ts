/**
 * System Users API functions
 */

import { fetcher } from '@/shared/services/apiClient';
import type { ApiResponse } from '@/shared/types/api';
import type {
  SystemUser,
  CreateSystemUserRequest,
  UpdateSystemUserRoleRequest,
  CreateSystemUserResponse,
  ChangeSystemUserPasswordRequest,
  UserInfo,
} from '../types';

/**
 * Get all system users
 */
export const getSystemUsers = async (): Promise<ApiResponse<SystemUser[]>> => {
  return fetcher<SystemUser[]>('/users/system', 'GET');
};

/**
 * Create a new system user
 */
export const createSystemUser = async (
  data: CreateSystemUserRequest
): Promise<ApiResponse<CreateSystemUserResponse>> => {
  return fetcher<CreateSystemUserResponse>('/users/system', 'POST', data);
};

/**
 * Update system user role
 */
export const updateSystemUserRole = async (
  userId: string,
  data: UpdateSystemUserRoleRequest
): Promise<ApiResponse<void>> => {
  return fetcher<void>(`/users/system/${userId}`, 'PATCH', data);
};

/**
 * Change system user password
 */
export const changeSystemUserPassword = async (
  userId: string,
  data: ChangeSystemUserPasswordRequest
): Promise<ApiResponse<void>> => {
  return fetcher<void>(`/users/system/${userId}/password`, 'PATCH', data);
};

/**
 * Get user info by userId
 */
export const getUserInfo = async (
  userId: string,
  tenantId?: string
): Promise<ApiResponse<UserInfo>> => {
  const queryParams = tenantId ? `?tenantId=${tenantId}` : '';
  return fetcher<UserInfo>(`/users/${userId}/info${queryParams}`, 'GET');
};

/**
 * Delete a system user
 */
export const deleteSystemUser = async (userId: string): Promise<ApiResponse<void>> => {
  return fetcher<void>(`/users/system/${userId}`, 'DELETE');
};
