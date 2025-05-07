// environmentUtils.ts
// Utility functions for environment detection and configuration

/**
 * Check if the application is running in local development mode
 * @returns boolean indicating if we're in local development
 */
export const isLocalDevelopment = (): boolean => {
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
};

/**
 * Get the base URL for API requests
 * @returns The base URL from environment variables
 */
export const getBaseUrl = (): string => {
  return import.meta.env.VITE_BASE_URL || '';
};

/**
 * Get the frontend URL
 * @returns The frontend URL from environment variables
 */
export const getFrontendUrl = (): string => {
  return import.meta.env.VITE_FRONTEND_URL || '';
};

/**
 * Get the redirect URI for authentication
 * @returns The redirect URI from environment variables
 */
export const getRedirectUri = (): string => {
  return import.meta.env.VITE_REDIRECT_URI || '';
};

/**
 * Get the login URL
 * @returns The login URL from environment variables
 */
export const getLoginUrl = (): string => {
  return import.meta.env.VITE_LOGIN_URL || '';
};

/**
 * Constants for mock tokens in local development
 */
export const MOCK_TOKENS = {
  ACCESS_TOKEN: "local-development-mock-token",
  REFRESH_TOKEN: "mock-refresh-token"
};
