import { useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to subscribe to token changes
 * @param callback Function to be called when the token changes
 */
export const useTokenChange = (callback: (token: string) => void) => {
  const { addTokenChangeListener } = useAuth();

  useEffect(() => {
    // Register the callback with the AuthProvider
    const unsubscribe = addTokenChangeListener(callback);
    
    // Clean up the subscription when the component unmounts
    return unsubscribe;
  }, [addTokenChangeListener, callback]);
};
