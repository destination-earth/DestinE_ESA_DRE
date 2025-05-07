// src/hooks/query/useUserSettings.ts
import { useQuery } from '@tanstack/react-query';
import { fetchInitialSettings } from '../../services/api/settingsApi';
import { InitialSettings } from '../../models/InitialSettings';

const USER_SETTINGS_QUERY_KEY = ['userSettings'];

/**
 * Custom hook to fetch user settings using TanStack Query.
 */
export const useUserSettings = () => {
  return useQuery<InitialSettings, Error>({
    queryKey: USER_SETTINGS_QUERY_KEY,
    queryFn: fetchInitialSettings,
    staleTime: 5 * 60 * 1000, // Keep data fresh for 5 minutes
    // cacheTime: 10 * 60 * 1000, // Example: cache data for 10 minutes
    // retry: 1, // Example: retry failed requests once
    // refetchOnWindowFocus: false, // Optional: disable refetching on window focus
  });
};
