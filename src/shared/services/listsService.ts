import { fetcher } from '@/shared/services/apiClient';
import type { ApiResponse, Industry, Country } from '@/shared/types/api';

/**
 * Get list of available industries
 */
export async function getIndustries(): Promise<ApiResponse<Industry[]>> {
    return await fetcher<Industry[]>('/lists/industries', 'GET', undefined, false);
}

/**
 * Get list of available countries
 */
export async function getCountries(): Promise<ApiResponse<Country[]>> {
    return await fetcher<Country[]>('/countries/list', 'GET', undefined, false);
}

// Get available colors for teams
export const getColors = async (): Promise<ApiResponse<string[]>> => {
  return fetcher<string[]>('/lists/colors', 'GET', undefined, false);
};