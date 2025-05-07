import { useContext, useEffect } from 'react';
import { AuthContext } from '../services/providers/AuthProvider';
import { setAuthContext } from '../services/api/axiosConfig';

/**
 * Custom hook to register the auth context with the axios interceptor
 * This allows the axios interceptor to access the auth context for token refresh
 */
export const useAuthInterceptor = (): void => {
  const authContext = useContext(AuthContext);
  
  useEffect(() => {
    if (authContext) {
      // Register the auth context with the axios config
      setAuthContext(authContext);
    }
  }, [authContext]);
};
