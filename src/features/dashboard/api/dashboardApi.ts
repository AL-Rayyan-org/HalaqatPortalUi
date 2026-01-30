/**
 * Dashboard API functions
 */

import { fetcher } from '@/shared/services/apiClient';
import type { ApiResponse } from '@/shared/types/api';
import type { AdminDashboardResponse, TeacherDashboardResponse } from '../types';

/**
 * Get admin dashboard data
 */
export const getAdminDashboard = async (
  tenantId?: string,
  productId?: string
): Promise<ApiResponse<AdminDashboardResponse>> => {
  const params = new URLSearchParams();
  
  if (tenantId) params.append('TenantId', tenantId);
  if (productId) params.append('ProductId', productId);

  const queryString = params.toString();
  const endpoint = queryString ? `/dashboard/admins?${queryString}` : '/dashboard/admins';
  
  return fetcher<AdminDashboardResponse>(endpoint, 'GET');
};

/**
 * Get teacher dashboard data
 */
export const getTeacherDashboard = async (
  tenantId?: string,
  productId?: string
): Promise<ApiResponse<TeacherDashboardResponse>> => {
  const params = new URLSearchParams();
  
  if (tenantId) params.append('TenantId', tenantId);
  if (productId) params.append('ProductId', productId);

  const queryString = params.toString();
  const endpoint = queryString ? `/dashboard/teacher?${queryString}` : '/dashboard/teacher';
  
  return fetcher<TeacherDashboardResponse>(endpoint, 'GET');
};
