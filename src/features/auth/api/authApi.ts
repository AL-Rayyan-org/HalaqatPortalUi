/**
 * Authentication service for login, registration, and session management
 */
import { fetcher } from '@/shared/services/apiClient';
import { fetchAndStoreProfile } from '@/shared/services/profileService';
import { useProfileStore } from '@/shared/stores/profileStore';
import type { 
  ApiResponse
} from '@/shared/types/api';
import type { 
  LoginCredentials,
  ResetPasswordBeginRequest,
  ResetPasswordVerifyRequest,
  ResetPasswordCommitRequest
} from '@/features/auth/types';

export async function login(credentials: LoginCredentials): Promise<ApiResponse<{ accessToken: string }>> {
  const result = await fetcher<{ accessToken: string }>('/auth/login', 'POST', {
    email: credentials.email,
    password: credentials.password
  });

  if (result.success && result.data && result.data.accessToken) {
    // Store only the token
    localStorage.setItem('hafiz-token', result.data.accessToken);
    
    // Fetch and store profile after successful login
    try {
      await fetchAndStoreProfile();
    } catch (error) {
      console.error('Failed to fetch profile after login:', error);
      // Don't fail the login if profile fetch fails
    }
  }

  return result;
}
  
// Reset password flow - Begin the reset process
export async function resetPasswordBegin(email: string): Promise<ApiResponse<void>> {
  const data: ResetPasswordBeginRequest = { address: email };
  return fetcher<void>('/auth/reset-password/begin', 'POST', data);
}

// Reset password flow - Verify the code
export async function resetPasswordVerify(email: string, code: string): Promise<ApiResponse<{ token: string }>> {
  const data: ResetPasswordVerifyRequest = { 
    address: email,
    code: code 
  };
  return fetcher<{ token: string }>('/auth/reset-password/verify', 'POST', data);
}

// Reset password flow - Commit the new password
export async function resetPasswordCommit(token: string, newPassword: string): Promise<ApiResponse<void>> {
  const data: ResetPasswordCommitRequest = { 
    token: token,
    newPassword: newPassword 
  };
  return fetcher<void>('/auth/reset-password/commit', 'POST', data);
}

export function logout(): void {
  localStorage.removeItem('hafiz-token');
  
  // Clear profile from Zustand store
  useProfileStore.getState().clearProfile();
}