// useForecastApi.ts
// Custom hook to provide authenticated access to forecast APIs

import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { setAuthToken } from '../services/api/axiosConfig';
import {
  getSolarForecastTimeSeries,
  getSolarForecastPredictionComparison,
  getSolarForecastAbout
} from '../services/api/solarForecastApi';
import {
  getWindForecastTimeSeries,
  getWindForecastPredictionComparison,
  getWindForecastAbout
} from '../services/api/windForecastApi';
import {
  SolarForecastApiResponse,
  WindForecastApiResponse
} from '../services/api/forecastTypes';

/**
 * Custom hook that provides access to all forecast API functions
 * This hook ensures the global authentication token is set before making API calls
 * and checks that the API has been initialized
 */
export const useForecastApi = () => {
  const { accessToken, apiInitialized } = useAuth();
  const [currentToken, setCurrentToken] = useState<string | null>(null);

  // Ensure the auth token is set whenever it changes
  useEffect(() => {
    if (accessToken && accessToken !== currentToken) {
      setAuthToken(accessToken);
      setCurrentToken(accessToken);
    }
  }, [accessToken, currentToken]);

  // Helper function to check if we can make API calls
  const checkApiReady = () => {
    if (!accessToken) {
      throw new Error('Authentication token is missing');
    }
    
    if (!apiInitialized) {
      throw new Error('API has not been initialized yet');
    }
    
    return true;
  };

  // Solar forecast functions
  const fetchSolarForecastTimeSeries = async (): Promise<SolarForecastApiResponse> => {
    checkApiReady();
    return getSolarForecastTimeSeries();
  };

  const fetchSolarForecastPredictionComparison = async (): Promise<SolarForecastApiResponse> => {
    checkApiReady();
    return getSolarForecastPredictionComparison();
  };

  const fetchSolarForecastAbout = async (): Promise<SolarForecastApiResponse> => {
    checkApiReady();
    return getSolarForecastAbout();
  };

  // Wind forecast functions
  const fetchWindForecastTimeSeries = async (): Promise<WindForecastApiResponse> => {
    checkApiReady();
    return getWindForecastTimeSeries();
  };

  const fetchWindForecastPredictionComparison = async (): Promise<WindForecastApiResponse> => {
    checkApiReady();
    return getWindForecastPredictionComparison();
  };

  const fetchWindForecastAbout = async (): Promise<WindForecastApiResponse> => {
    checkApiReady();
    return getWindForecastAbout();
  };

  return {
    // Solar forecast functions
    fetchSolarForecastTimeSeries,
    fetchSolarForecastPredictionComparison,
    fetchSolarForecastAbout,
    
    // Wind forecast functions
    fetchWindForecastTimeSeries,
    fetchWindForecastPredictionComparison,
    fetchWindForecastAbout
  };
};
