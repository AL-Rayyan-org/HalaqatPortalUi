import type { ApiResponse, IpGeoLocation } from '@/shared/types/api';

/**
 * Fetches geolocation data based on the user's IP address
 * @returns Promise with the IP geolocation data
 */
export const getIpGeolocation = async (): Promise<ApiResponse<IpGeoLocation>> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    
    if (!response.ok) {
      throw new Error(`Error fetching IP data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      success: true,
      statusCode: 200,
      message: null,
      data
    };
  } catch (error) {
    console.error('Error fetching IP data:', error);
    return {
      success: false,
      statusCode: 500,
      message: error instanceof Error ? error.message : 'An error occurred fetching IP data',
    };
  }
};