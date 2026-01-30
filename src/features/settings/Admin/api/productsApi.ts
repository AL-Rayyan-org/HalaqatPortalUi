/**
 * Products/Services API functions
 */

import { fetcher } from '@/shared/services/apiClient';
import type { ApiResponse } from '@/shared/types/api';
import type {
  Product,
  ProductRequest,
  CreateProductResponse,
  UpdateProductStatusRequest,
} from '@/features/settings/Admin/types';

/**
 * Get all products with optional filters and pagination
 */
export const getProducts = async (
  searchText?: string,
  statuses?: string,
  categoryId?: string,
  contextTenantId?: string,
  pageSize?: number,
  pageIndex?: number
): Promise<ApiResponse<Product[]>> => {
  const params = new URLSearchParams();
  
  if (searchText) params.append('SearchText', searchText);
  if (statuses) params.append('Statuses', statuses);
  if (categoryId) params.append('CategoryId', categoryId);
  if (contextTenantId) params.append('contextTenantId', contextTenantId);
  if (pageSize !== undefined) params.append('PageSize', pageSize.toString());
  if (pageIndex !== undefined) params.append('PageIndex', pageIndex.toString());

  const queryString = params.toString();
  const endpoint = queryString ? `/products?${queryString}` : '/products';
  
  return fetcher<Product[]>(endpoint, 'GET');
};

/**
 * Get product by ID
 */
export const getProductById = async (
  productId: string,
  contextTenantId?: string
): Promise<ApiResponse<Product>> => {
  const params = new URLSearchParams();
  if (contextTenantId) params.append('contextTenantId', contextTenantId);
  
  const queryString = params.toString();
  const endpoint = queryString ? `/products/${productId}?${queryString}` : `/products/${productId}`;
  
  return fetcher<Product>(endpoint, 'GET');
};

/**
 * Create a new product
 */
export const createProduct = async (
  data: ProductRequest
): Promise<ApiResponse<CreateProductResponse>> => {
  return fetcher<CreateProductResponse>('/products', 'POST', data);
};

/**
 * Update product
 */
export const updateProduct = async (
  productId: string,
  data: ProductRequest
): Promise<ApiResponse<void>> => {
  return fetcher<void>(`/products/${productId}`, 'PUT', data);
};

/**
 * Delete a product
 */
export const deleteProduct = async (productId: string): Promise<ApiResponse<void>> => {
  return fetcher<void>(`/products/${productId}`, 'DELETE');
};

/**
 * Update product status
 */
export const updateProductStatus = async (
  productId: string,
  data: UpdateProductStatusRequest
): Promise<ApiResponse<void>> => {
  return fetcher<void>(`/products/${productId}/status`, 'PATCH', data);
};

/**
 * Update product image
 * @param productId - Product ID
 * @param imageFile - Image file to upload (pass null to remove image)
 */
export const updateProductImage = async (
  productId: string,
  imageFile: File | null
): Promise<ApiResponse<{ imageUrl: string | null }>> => {
  const formData = new FormData();
  
  if (imageFile) {
    formData.append('Image', imageFile);
  } else {
    // Send empty FormData to indicate image removal
    formData.append('Image', '');
  }

  return fetcher<{ imageUrl: string | null }>(
    `/products/${productId}/image`,
    'PATCH',
    formData
  );
};

/**
 * Duplicate a product
 */
export const duplicateProduct = async (
  productId: string
): Promise<ApiResponse<CreateProductResponse>> => {
  return fetcher<CreateProductResponse>(
    `/products/${productId}/duplicate`,
    'POST',
    { code: '', name: '' }
  );
};
