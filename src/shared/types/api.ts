/**
 * Common API types used throughout the application
 */

import type { UserRole, InvitableRole } from '@/shared/utils/roles';

// Re-export role types for convenience
export type { UserRole, InvitableRole };

// API response format from server
export interface ApiResponse<T = unknown> {
  success: boolean;
  statusCode?: number;
  message: string | null;
  data?: T;
  paging?: {
    pageIndex: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPrevious: boolean;
    hasNext: boolean;
  };
}

// Profile information
export interface Profile {
  userId: string;
  tenantId: string;
  tenantName: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  timezoneId: string | null;
}

// Country information
export interface Country {
  id: string;
  name: string;
  code: string;
  prefix: string;
}

// IP Geolocation data
export interface IpGeoLocation {
  ip: string;
  network: string;
  version: string;
  city: string;
  region: string;
  region_code: string;
  country: string;
  country_name: string;
  country_code: string;
  country_code_iso3: string;
  country_capital: string;
  country_tld: string;
  continent_code: string;
  in_eu: boolean;
  postal: string;
  latitude: number;
  longitude: number;
  timezone: string;
  utc_offset: string;
  country_calling_code: string;
  currency: string;
  currency_name: string;
  languages: string;
  country_area: number;
  country_population: number;
  asn: string;
  org: string;
}

// User information (for switch tenant response)
export interface User {
  accessToken: string;
  tenantId: string;
  tenantName: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
}

// Change password request
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Router-related types
export interface LocationState {
  from?: {
    pathname: string;
  };
  successMessage?: string;
  errorMessage?: string;
}

// Industry information
export interface Industry {
  id: string;
  name: string;
}

// Paging information
export interface Paging {
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageIndex: number;
  hasPrevious: boolean;
  hasNext: boolean;
}