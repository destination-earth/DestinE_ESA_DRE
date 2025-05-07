// src/services/api/settingsApi.ts
import axiosInstance from './axiosConfig';
import { InitialSettings } from '../../models/InitialSettings';

/**
 * Fetches the initial settings data from the API.
 * 
 * NOTE: Assumes the API endpoint '/api/settings/initialize' directly returns
 * the InitialSettings object. If the actual response nests this object
 * (e.g., { data: InitialSettings }), this function will need adjustment
 * (e.g., return response.data.data).
 */
export const fetchInitialSettings = async (): Promise<InitialSettings> => {
  const response = await axiosInstance.get<InitialSettings>('/api/settings/initialize');
  return response.data;
};
