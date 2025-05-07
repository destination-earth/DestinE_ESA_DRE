import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { InternalAxiosRequestConfig } from "axios";
import { useSessionStorage } from "../../hooks/useSessionStorage";
import axios from "axios";
import { setAuthToken } from "../api/axiosConfig";
import { useQueryClient } from "@tanstack/react-query";

export type CustomInternalAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  accessToken: string | null | undefined;
  handleUnAuthorizedError: () => Promise<string | undefined>;
  logout: () => void;
  apiInitialized: boolean;
  redirectToLogin: () => void;
  waitForAuth: (maxWaitTime?: number) => Promise<boolean>;
  addTokenChangeListener: (listener: (token: string) => void) => () => void;
};

export const AuthContext = createContext<AuthContextType | undefined>({
  isAuthenticated: false,
  accessToken: undefined,
  handleUnAuthorizedError: async () => undefined,
  logout: () => {},
  apiInitialized: false,
  redirectToLogin: () => {},
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  waitForAuth: async (_maxWaitTime?: number) => {
    // Default implementation ignores maxWaitTime
    return true;
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addTokenChangeListener: (_listener: (token: string) => void) => {
    // Default implementation returns a no-op cleanup function
    return () => {};
  },
});

interface Props {
  children: ReactNode;
}

const AuthProvider = ({ children }: Props) => {
  const { getItem, setItem, removeItem } = useSessionStorage("refresh_token");
  const [apiInitialized, setApiInitialized] = useState<boolean>(false);
  const [accessToken, setAccessToken] = useState<string | null | undefined>();
  const [refreshToken, setRefreshToken] = useState<string | null | undefined>(
    getItem(),
  );
  const initializationInProgress = useRef<boolean>(false);
  const isInitialized = useRef<boolean>(false);
  const tokenRefreshInterval = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );
  const tokenChangeListeners = useRef<Array<(token: string) => void>>([]);
  const queryClient = useQueryClient();

  // Function to notify all listeners about token changes
  const notifyTokenChange = useCallback((newToken: string) => {
    console.log(" Notifying token change listeners");
    tokenChangeListeners.current.forEach(listener => listener(newToken));
  }, []);

  // Function to add a token change listener
  const addTokenChangeListener = useCallback((listener: (token: string) => void) => {
    console.log(" Adding token change listener");
    tokenChangeListeners.current.push(listener);
    return () => {
      console.log(" Removing token change listener");
      tokenChangeListeners.current = tokenChangeListeners.current.filter(l => l !== listener);
    };
  }, []);

  // Effect to set the auth token whenever accessToken changes
  useEffect(() => {
    if (accessToken) {
      setAuthToken(accessToken);
      // Notify listeners about token change
      notifyTokenChange(accessToken);
      // Reset React Query cache to force refetching with new token
      queryClient.resetQueries();
    }
  }, [accessToken, notifyTokenChange, queryClient]);

  const isAuthenticated = useMemo(() => {
    return Boolean(refreshToken);
  }, [refreshToken]);

  // Function to stop the token refresh timer
  const stopTokenRefreshTimer = useCallback(() => {
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
      tokenRefreshInterval.current = null;
    }
  }, []);

  // Update the logout function to stop the token refresh timer
  const logout = useCallback(() => {
    console.log(' Logging out user, clearing all tokens and state');
    // Clear tokens from state
    setAccessToken(null);
    setRefreshToken(null);
    // Clear refresh token from session storage
    removeItem();
    // Stop token refresh timer
    stopTokenRefreshTimer();
    // Reset React Query cache to prevent stale data with old token
    queryClient.clear();
    // Redirect to login page
    const env = import.meta.env;
    window.location.replace(env.VITE_LOGIN_URL);
  }, [removeItem, stopTokenRefreshTimer, queryClient]);

  const refreshAccessToken = useCallback(async () => {
    try {
      if (!refreshToken) {
        console.log("Refresh token not found. Cannot refresh!");
        return;
      }

      const env = import.meta.env;
      const axiosClient = axios.create({
        baseURL: env.VITE_BASE_URL,
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      const settings = {
        url: "api/token/refreshtoken",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          token: accessToken,
          refreshToken: refreshToken,
          url: env.CLOACK_REDIRECT_URI,
        },
      };

      console.log(" Sending refresh token request with data:", settings.data);
      const response = await axiosClient(settings);
      console.log(" Refresh token response:", response.data);

      // Check for the new response format from Swagger
      const { code, url } = response.data ?? {};

      if (code && url) {
        console.log(" Received code and URL from refresh token endpoint. Requesting new tokens...");
        
        // Use the code to get a new token
        const tokenResponse = await axiosClient({
          url: "api/token/getToken",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            url: env.CLOACK_REDIRECT_URI,
            code: code,
          },
        });
        
        console.log(" Token response:", tokenResponse.data);
        
        const { access_token, refresh_token } = tokenResponse.data ?? {};
        
        if (!access_token || !refresh_token) {
          console.log(" Access token or Refresh token is missing from the getToken response!");
          return;
        }
        
        console.log(" Successfully obtained new tokens using code from refresh endpoint");
        
        // Update tokens
        setAccessToken(access_token);
        setRefreshToken(refresh_token);
        setItem(refresh_token);
        
        return access_token;
      } else {
        // Try the old format for backward compatibility
        const { access_token } = response.data ?? {};

        if (!access_token) {
          console.log(" Access token is missing from the response!");
          return;
        }

        console.log(" Received access token directly from refresh endpoint (old format)");
        setAccessToken(access_token);
        return access_token;
      }
    } catch (error) {
      console.error(" Failed to refresh access token", error);
      logout();
    }
  }, [logout, refreshToken, accessToken, setItem]);

  // Function to start the token refresh timer
  const startTokenRefreshTimer = useCallback(() => {
    // Clear any existing timer
    if (tokenRefreshInterval.current) {
      clearInterval(tokenRefreshInterval.current);
    }

    // Set a new timer to refresh the token every 4 minutes (240000 ms)
    // This is shorter than the token expiration time to ensure we refresh before expiry
    tokenRefreshInterval.current = setInterval(async () => {
      console.log(" Proactively refreshing token to prevent expiration...");
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          console.log(" Token proactively refreshed successfully");
        } else {
          console.warn(" Proactive token refresh failed");
        }
      } catch (error) {
        console.error(" Error during proactive token refresh:", error);
      }
    },840000); // 14 minutes
  }, [refreshAccessToken]);

  const requestAccessToken = useCallback(
    async (code: string) => {
      try {
        const env = import.meta.env;
        const axiosClient = axios.create({
          baseURL: env.VITE_BASE_URL,
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        });

        const settings = {
          url: "api/token/getToken",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          data: {
            url: env.CLOACK_REDIRECT_URI,
            code: code,
          },
        };

        const response = await axiosClient(settings);

        const { access_token, refresh_token } = response.data ?? {};

        if (!access_token || !refresh_token) {
          console.log(
            "Access token or Refresh token is missing from the response!",
          );
          return;
        }

        console.log(response);

        setAccessToken(access_token);
        setRefreshToken(refresh_token);
        setItem(refresh_token);
        return { access_token, refresh_token };
      } catch (error) {
        console.error("Failed to fetch access token", error);
        throw error;
      }
    },
    [setItem],
  );

  const handleUnAuthorizedError = useCallback(async () => {
    const newToken = await refreshAccessToken();
    return newToken;
  }, [refreshAccessToken]);

  const redirectToLogin = useCallback(() => {}, []);

  const waitForAuth = useCallback(
    async (maxWaitTime = 5000): Promise<boolean> => {
      // If already initialized, return immediately
      if (apiInitialized) {
        console.log(" Auth already initialized, no need to wait");
        return true;
      }
      
      console.log(" Waiting for auth to initialize...");
      
      // Create a promise that resolves when auth is initialized or times out
      return new Promise((resolve) => {
        // Set a timeout to prevent infinite waiting
        const timeout = setTimeout(() => {
          console.warn(" Auth initialization timed out after waiting", maxWaitTime, "ms");
          resolve(false);
        }, maxWaitTime);
        
        // Check every 100ms if auth is initialized
        const checkInterval = setInterval(() => {
          if (apiInitialized) {
            clearTimeout(timeout);
            clearInterval(checkInterval);
            console.log(" Auth initialized while waiting");
            resolve(true);
          }
        }, 100);
      });
    },
    [apiInitialized]
  );

  useEffect(() => {
    // Only run initialization once
    if (isInitialized.current) {
      return;
    }

    const initializeAuth = async () => {
      // Prevent multiple initializations
      if (initializationInProgress.current) {
        console.log("Auth initialization already in progress, skipping...");
        return;
      }

      // Set flag to indicate initialization is in progress
      initializationInProgress.current = true;

      try {
        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");

        // First set apiInitialized to false during the initialization process
        setApiInitialized(false);

        // Case 1: We have a refresh token - try to refresh the access token
        const refresh_token = getItem();
        if (refresh_token) {
          console.log(
            "Found refresh token, attempting to refresh access token...",
          );
          try {
            const newAccessToken = await refreshAccessToken();
            if (newAccessToken) {
              console.log("Successfully refreshed access token");
              setApiInitialized(true);
              isInitialized.current = true;
              // Start the token refresh timer after successful authentication
              startTokenRefreshTimer();
              return;
            } else {
              console.log(
                "Failed to refresh access token with existing refresh token",
              );
              // Continue to other auth methods
            }
          } catch (error) {
            console.log("Error refreshing token:", error);
            // Continue to other auth methods
          }
        }

        // Case 2: We have a code parameter - try to get tokens
        if (code) {
          console.log("Found code parameter, requesting access token...");
          try {
            const tokens = await requestAccessToken(code);
            if (tokens) {
              console.log("Successfully obtained tokens with code");
              setApiInitialized(true);
              isInitialized.current = true;

              // Start the token refresh timer after successful authentication
              startTokenRefreshTimer();

              // Remove the code from the URL to prevent re-initialization
              const url = new URL(window.location.href);
              url.searchParams.delete("code");
              window.history.replaceState({}, document.title, url.toString());

              return;
            } else {
              console.log("Failed to get tokens with code");
            }
          } catch (error) {
            console.log("Error requesting tokens with code:", error);
          }
        }

        // Case 3: No valid authentication method found
        console.log("No valid authentication method found, logging out...");
        logout();
      } catch (error) {
        console.error("Error during auth initialization:", error);
        logout();
      } finally {
        // Reset initialization flag regardless of outcome
        initializationInProgress.current = false;
      }
    };

    initializeAuth();
  }, [
    getItem,
    logout,
    refreshAccessToken,
    requestAccessToken,
    startTokenRefreshTimer,
  ]);

  useEffect(() => {
    return () => {
      if (tokenRefreshInterval.current) {
        clearInterval(tokenRefreshInterval.current);
      }
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        accessToken,
        handleUnAuthorizedError,
        logout,
        apiInitialized,
        redirectToLogin,
        waitForAuth: waitForAuth,
        addTokenChangeListener: addTokenChangeListener,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
