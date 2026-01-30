/**
 * Categories API functions
 */

import { fetcher } from '@/shared/services/apiClient';
import type { ApiResponse } from '@/shared/types/api';
import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
  CreateCategoryResponse,
} from '@/features/settings/Admin/types';

/**
 * Get all categories
 */
export const getCategories = async (): Promise<ApiResponse<Category[]>> => {
  return fetcher<Category[]>('/categories', 'GET');
};

/**
 * Create a new category
 */
export const createCategory = async (
  data: CreateCategoryRequest
): Promise<ApiResponse<CreateCategoryResponse>> => {
  return fetcher<CreateCategoryResponse>('/categories', 'POST', data);
};

/**
 * Get category by ID
 */
export const getCategoryById = async (categoryId: string): Promise<ApiResponse<Category>> => {
  return fetcher<Category>(`/categories/${categoryId}`, 'GET');
};

/**
 * Update category
 */
export const updateCategory = async (
  categoryId: string,
  data: UpdateCategoryRequest
): Promise<ApiResponse<void>> => {
  return fetcher<void>(`/categories/${categoryId}`, 'PUT', data);
};

/**
 * Delete a category
 */
export const deleteCategory = async (categoryId: string): Promise<ApiResponse<void>> => {
  return fetcher<void>(`/categories/${categoryId}`, 'DELETE');
};


