// API client with common utilities and response handling
import type { ApiResponse, Profile } from '@/shared/types/api';
import { useProfileStore } from '@/shared/stores/profileStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5261/v1';
const COMMON_API_URL = import.meta.env.VITE_COMMON_API_URL || 'http://localhost:5261/v1';

/**
 * Helper function to handle API responses according to server patterns
 * Server response structure:
 * - success: boolean (always present)
 * - statusCode: number (always present)
 * - message: string (on failure)
 * - data: object (on success)
 * - paging: object (if there is paging and in success)
 */
export const handleResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
  const data = await response.json();
  
  // Server always sends success flag
  const success = data.success || false;
  
  // Always include statusCode from response or data
  const statusCode = data.statusCode || response.status;
  
  // Handle 401 unauthorized by redirecting to login
  if (statusCode === 401) {
    // Clear token if exists
    localStorage.removeItem('hafiz-token');
    
    // Clear profile from Zustand store
    useProfileStore.getState().clearProfile();
    
    // If not already on login page, redirect
    if (!window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login';
    }
  }
  
  return {
    success,
    statusCode,
    message: data.message || null,
    data: data.data,
    paging: data.paging
  };
};

/**
 * Make an API request with proper error handling
 */
export const fetcher = async <T>(
  endpoint: string, 
  method: string = 'GET', 
  body?: unknown,
  baseURL: boolean = true
): Promise<ApiResponse<T>> => {
  try {
    const headers: Record<string, string> = {};

    // Determine full URL
    const url = baseURL ? `${BASE_URL}${endpoint}` : `${COMMON_API_URL}${endpoint}`;

    // Check if body is FormData (for file uploads)
    const isFormData = body instanceof FormData;

    // Only set Content-Type for non-FormData requests
    // For FormData, browser will set it automatically with the correct boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Add auth token if available
    const token = localStorage.getItem('hafiz-token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Add Accept-Language header for internationalization
    const language = localStorage.getItem('hafiz-language') || 'en';
    headers['Accept-Language'] = language;

    const options: RequestInit = {
      method,
      headers,
      // Don't stringify FormData, send it as-is
      body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
    };

    const response = await fetch(url, options);
    
    return handleResponse<T>(response);
  } catch (error) {
    console.error(`API error (${endpoint}):`, error);
    return {
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : 'Network error',
    };
  }
};

/**
 * Helper function to get the stored auth token
 */
export const getToken = (): string | null => {
  return localStorage.getItem('hafiz-token');
};

/**
 * Fetch blob data (images, files, etc.) and return as object URL
 */
export const fetchBlob = async (
  endpoint: string,
  accept: string = 'image/png'
): Promise<string> => {
  const headers: Record<string, string> = {
    'Accept': accept,
  };

  // Add auth token if available
  const token = localStorage.getItem('hafiz-token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add Accept-Language header for internationalization
  const language = localStorage.getItem('hafiz-language') || 'en';
  headers['Accept-Language'] = language;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'GET',
    headers,
  });

  // Handle 401 unauthorized
  if (response.status === 401) {
    localStorage.removeItem('hafiz-token');
    useProfileStore.getState().clearProfile();
    if (!window.location.pathname.includes('/auth/login')) {
      window.location.href = '/auth/login';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch blob: ${response.statusText}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

/**
 * Download a file as blob with proper filename extraction
 */
export const downloadBlob = async (
  endpoint: string,
  baseURL: boolean = true
): Promise<{ success: boolean; blob?: Blob; fileName?: string; message?: string }> => {
  try {
    const token = localStorage.getItem('hafiz-token');
    const language = localStorage.getItem('hafiz-language') || 'en';
    const url = baseURL ? `${BASE_URL}${endpoint}` : `${COMMON_API_URL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Accept-Language': language,
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(url, { method: 'GET', headers });
    
    // Handle 401 unauthorized
    if (response.status === 401) {
      localStorage.removeItem('hafiz-token');
      useProfileStore.getState().clearProfile();
      if (!window.location.pathname.includes('/auth/login')) {
        window.location.href = '/auth/login';
      }
      return {
        success: false,
        message: 'Unauthorized',
      };
    }
    
    if (!response.ok) {
      return {
        success: false,
        message: `Failed to download: ${response.statusText}`,
      };
    }
    
    // Get filename from Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let fileName = 'download';
    if (contentDisposition) {
      const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
      if (matches && matches[1]) {
        fileName = matches[1].replace(/['"/]/g, '');
      }
    }
    
    const blob = await response.blob();
    return { success: true, blob, fileName };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Download failed',
    };
  }
};

/**
 * Get current authenticated profile from Zustand store
 */
export const getStoredProfile = (): Profile | null => {
  return useProfileStore.getState().profile;
};

/**
 * Helper function to check if the user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

/**
   * Check if status code is 401 (Unauthorized)
   */
export const isUnauthorized = (statusCode: number | undefined): boolean => {
  return statusCode === 401;
};