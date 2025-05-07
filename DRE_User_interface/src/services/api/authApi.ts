// authApi.ts
// Authentication API services for token management

import axios from 'axios';
import axiosInstance from './axiosConfig';

// Types for authentication responses
export interface TokenResponse {
  access_token?: string;
  refresh_token?: string;
  itemId?: number;
  timestamp?: string;
}

export interface AuthSettings {
  clientSecret: string;
  clientId: string;
  realm: string;
  realmURL: string;
  realmProtocol: string;
  realmAuth: string;
  realmToken: string;
  redirectUri: string;
}

/**
 * Standardized error handling for API calls
 * @param error The error that occurred
 * @param operation Description of the operation that failed
 */
const handleApiError = (error: unknown, operation: string): never => {
  console.error(`Failed during ${operation}:`, error);
  if (axios.isAxiosError(error)) {
    console.error('Response data:', error.response?.data);
    console.error('Response status:', error.response?.status);
    console.error('Response headers:', error.response?.headers);
  }
  throw error;
};

/**
 * Get authentication settings from the API
 * @returns Promise with authentication settings
 */
export const getAuthSettings = async (): Promise<AuthSettings> => {
  try {
    const response = await axiosInstance.get<AuthSettings>('/api/Token/settings');
    return response.data;
  } catch (error) {
    return handleApiError(error, 'getting auth settings');
  }
};

/**
 * Get access and refresh tokens using an authorization code
 * @param code Authorization code from OAuth flow
 * @param url Redirect URL used in the OAuth flow
 * @returns Promise with token response
 */
export const getToken = async (code: string, url: string): Promise<TokenResponse> => {
  try {
    const response = await axiosInstance.post<TokenResponse>('/api/Token/GetToken', {
      code,
      url,
    });

    // Normalize the response to ensure consistent format
    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
      itemId: response.data.itemId,
      timestamp: response.data.timestamp
    };
  } catch (error) {
    return handleApiError(error, 'getting token');
  }
};

/**
 * Refresh an expired access token using a refresh token
 * @param token Current (expired) access token
 * @param refreshToken Refresh token
 * @param url Redirect URL used in the OAuth flow
 * @returns Promise with token response
 */
export const refreshToken = async (
  token: string,
  refreshToken: string,
  url: string
): Promise<TokenResponse> => {
  try {
    const response = await axiosInstance.post<TokenResponse>('/api/Token/RefreshToken', {
      token,
      refreshToken,
      url,
    });

    // Handle different response formats
    // The API might return either access_token directly or have it in a different format
    const result: TokenResponse = {
      itemId: response.data.itemId,
      timestamp: response.data.timestamp
    };
    
    // If access_token is directly available, use it
    if (response.data.access_token) {
      result.access_token = response.data.access_token;
    }
    
    // If refresh_token is directly available, use it
    if (response.data.refresh_token) {
      result.refresh_token = response.data.refresh_token;
    }
    
    return result;
  } catch (error) {
    return handleApiError(error, 'refreshing token');
  }
};
